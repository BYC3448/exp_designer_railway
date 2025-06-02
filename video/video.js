import { dataStore } from '../shared/data-store.js';
import { apiService } from '../shared/api.js';

class VideoRecommendationTab {
    constructor() {
        this.videos = [];
        this.originalVideos = [];
        this.currentQuery = '';
        this.baseQuery = '';
        this.nextPageToken = '';
        this.isLoading = false;
        this.hasMoreVideos = true;
        this.videosPerPage = 12;
        this.observer = null;
        this.scrollTimeout = null;
        this.currentFilter = '';
        this.curriculum = null;
    }

    init() {
        console.log('Video tab init started...');
        this.setupEventListeners();
        this.setupInfiniteScroll();
        
        // 교육과정 데이터 확인 후 초기 콘텐츠 로드
        setTimeout(() => {
            this.loadInitialContent();
        }, 500);
    }

    setupEventListeners() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const setupListeners = () => {
            attempts++;
            const searchBtn = document.getElementById('searchBtn');
            const searchInput = document.getElementById('searchInput');

            if (searchBtn && searchInput) {
                console.log('Setting up video tab event listeners...');
                
                // 기존 이벤트 리스너 제거
                searchBtn.replaceWith(searchBtn.cloneNode(true));
                searchInput.replaceWith(searchInput.cloneNode(true));
                
                // 새로운 참조 가져오기
                const newSearchBtn = document.getElementById('searchBtn');
                const newSearchInput = document.getElementById('searchInput');
                
                newSearchBtn.addEventListener('click', () => this.handleSearch());
                newSearchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleSearch();
                    }
                });

                // 필터 추천 태그 설정
                this.setupFilterSuggestions();

                // 교육과정 변경 이벤트 구독
                dataStore.subscribe('curriculum-changed', (curriculum) => {
                    console.log('Curriculum changed event received:', curriculum);
                    this.handleCurriculumChange(curriculum);
                });
                
                return;
            }
            
            if (attempts < maxAttempts) {
                console.log(`Video tab event listener setup attempt ${attempts}/${maxAttempts}, retrying...`);
                setTimeout(setupListeners, 100);
            } else {
                console.error('Failed to setup video tab event listeners after maximum attempts');
            }
        };
        
        setupListeners();
    }

    setupFilterSuggestions() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const setupSuggestions = () => {
            attempts++;
            const searchSection = document.querySelector('.search-section');
            
            if (!searchSection) {
                if (attempts < maxAttempts) {
                    setTimeout(setupSuggestions, 100);
                }
                return;
            }

            // 이미 존재하는 필터 제거
            const existingFilters = searchSection.querySelector('.filter-suggestions');
            if (existingFilters) {
                existingFilters.remove();
            }

            // 교육과정 기반 필터 생성
            this.createFilterSuggestions();
            
            console.log('Filter suggestions setup complete');
        };
        
        setupSuggestions();
    }

    createFilterSuggestions() {
        const searchSection = document.querySelector('.search-section');
        if (!searchSection) return;
        
        // 기본 필터 + 교육과정 기반 필터
        let koreanFilters = ['화학', '물리', '생물', '지구과학', '실험실', '시연', '과학교육', '고등학교'];
        let englishFilters = ['chemistry', 'physics', 'biology', 
                             'earth science', 'laboratory', 'demonstration', 
                             'educational science', 'high school', 'middle school', 'elementary school'];
        
        // 현재 교육과정 데이터 확인
        const curriculum = dataStore.getCurriculum();
        if (curriculum && curriculum.selectedElements && curriculum.selectedElements.length > 0) {
            // 선택된 내용 요소 추가 (한국어 그대로)
            koreanFilters.push(...curriculum.selectedElements);
        }
        
        const suggestionsHTML = `
            <div class="filter-suggestions">
                <label>추천 필터 (한국어):</label>
                <div class="suggestion-tags korean-tags">
                    ${koreanFilters.map(filter => 
                        `<span class="suggestion-tag korean-tag" data-filter="${filter}">${filter}</span>`
                    ).join('')}
                </div>
                <label style="margin-top: 10px;">추천 필터 (English):</label>
                <div class="suggestion-tags english-tags">
                    ${englishFilters.map(filter => 
                        `<span class="suggestion-tag english-tag" data-filter="${filter}">${filter}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        searchSection.insertAdjacentHTML('beforeend', suggestionsHTML);

        // 필터 태그 이벤트 리스너 추가
        document.querySelectorAll('.suggestion-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const filter = tag.dataset.filter;
                
                // baseQuery 검증
                if (!this.baseQuery) {
                    console.warn('BaseQuery not set, cannot apply filter');
                    this.showError('교육과정 기반 검색어가 설정되지 않았습니다. 잠시 후 다시 시도해주세요.');
                    return;
                }
                
                // 교육과정 기반 검색어와 필터 조합
                const finalQuery = `${this.baseQuery} ${filter}`;
                
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = filter; // 검색창에는 클릭한 필터만 표시
                }
                this.performSearch(finalQuery);
            });
        });
    }

    setupInfiniteScroll() {
        const scrollTrigger = document.getElementById('scrollTrigger');
        if (!scrollTrigger) {
            console.warn('Scroll trigger element not found');
            return;
        }

        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.hasMoreVideos && this.currentQuery) {
                    if (this.scrollTimeout) {
                        clearTimeout(this.scrollTimeout);
                    }
                    this.scrollTimeout = setTimeout(() => {
                        this.loadMoreVideos();
                    }, 1500);
                }
            });
        }, {
            rootMargin: '50px'
        });

        this.observer.observe(scrollTrigger);
    }

    async handleCurriculumChange(curriculum) {
        console.log('Handling curriculum change:', curriculum);
        this.curriculum = curriculum;
        
        // 필터 추천 업데이트
        this.createFilterSuggestions();
        // 교육과정 기반 영상 로드
        await this.loadCurriculumVideos(curriculum);
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const userQuery = searchInput.value.trim();
        
        if (!userQuery) {
            // baseQuery 검증
            if (!this.baseQuery) {
                console.warn('BaseQuery not set, cannot perform search');
                this.showError('교육과정 기반 검색어가 설정되지 않았습니다. 잠시 후 다시 시도해주세요.');
                return;
            }
            // 사용자 입력이 없으면 기본 교육과정 검색어 사용
            this.performSearch(this.baseQuery);
            return;
        }

        // baseQuery 검증
        if (!this.baseQuery) {
            console.warn('BaseQuery not set, using fallback');
            this.showError('교육과정 기반 검색어가 설정되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        // 교육과정 기반 검색어와 사용자 입력 조합
        const finalQuery = `${this.baseQuery} ${userQuery}`;
        this.performSearch(finalQuery);
    }

    async performSearch(query) {
        if (this.isLoading) return;

        this.currentQuery = query;
        this.videos = [];
        this.originalVideos = [];
        this.nextPageToken = '';
        this.hasMoreVideos = true;
        this.currentFilter = '';
        
        this.clearResults();
        this.updateCurrentSearch(query);
        
        await this.loadVideos();
    }

    async loadMoreVideos() {
        if (this.isLoading || !this.hasMoreVideos || !this.currentQuery) return;
        await this.loadVideos();
    }

    async loadVideos() {
        this.isLoading = true;
        this.showLoading(true);
        this.hideError();

        try {
            const response = await apiService.searchYouTubeVideos({
                query: this.currentQuery,
                maxResults: this.videosPerPage,
                pageToken: this.nextPageToken
            });

            if (response.success) {
                const newVideos = response.data.items || [];
                this.videos.push(...newVideos);
                this.originalVideos.push(...newVideos);
                this.nextPageToken = response.data.nextPageToken || '';
                this.hasMoreVideos = !!this.nextPageToken;

                await this.renderVideos(newVideos);
                this.updateVideoCount();

                if (this.videos.length === 0) {
                    this.showNoResults();
                }
            } else {
                throw new Error(response.error || '영상 검색 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Video search error:', error);
            this.showError(error.message || '영상을 불러오는 중 오류가 발생했습니다.');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    async renderVideos(videos) {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;
        
        for (const video of videos) {
            const videoCard = await this.createVideoCard(video);
            videoGrid.appendChild(videoCard);
        }
    }

    async createVideoCard(video) {
        const snippet = video.snippet;
        const videoId = video.id.videoId;
        
        const details = await this.getVideoDetails(videoId);
        const duration = this.formatDuration(details.duration);
        const viewCount = this.formatViewCount(details.viewCount);
        const publishedDate = this.formatDate(snippet.publishedAt);
        
        const thumbnail = snippet.thumbnails.medium || snippet.thumbnails.default;
        
        const card = document.createElement('div');
        card.className = 'video-card';

        card.innerHTML = `
            <div class="video-thumbnail" onclick="window.open('https://www.youtube.com/watch?v=${videoId}', '_blank')">
                <img src="${thumbnail.url}" alt="${snippet.title}" loading="lazy">
                <div class="video-duration">${duration}</div>
            </div>
            <div class="video-info">
                <div class="video-title" 
                     onclick="window.open('https://www.youtube.com/watch?v=${videoId}', '_blank')"
                     title="${snippet.title}">
                    ${snippet.title}
                </div>
                <div class="video-channel">${snippet.channelTitle}</div>
                <div class="video-stats">
                    <span>조회수 ${viewCount}</span>
                    <span>${publishedDate}</span>
                </div>
            </div>
        `;

        return card;
    }

    async getVideoDetails(videoId) {
        try {
            const response = await apiService.getYouTubeVideoDetails(videoId);
            if (response.success && response.data.items.length > 0) {
                const details = response.data.items[0];
                return {
                    duration: details.contentDetails.duration,
                    viewCount: details.statistics.viewCount
                };
            }
        } catch (error) {
            console.error('Error getting video details:', error);
        }
        
        return { duration: 'PT0S', viewCount: '0' };
    }

    needsKoreanTranslation(title) {
        // 번역 기능 비활성화 - 항상 false 반환
        return false;
    }

    async translateTitle(title) {
        // 번역 기능 비활성화 - 빈 문자열 반환
        return '';
    }

    formatDuration(duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '0:00';

        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    formatViewCount(viewCount) {
        const count = parseInt(viewCount);
        if (count >= 1000000) {
            return Math.floor(count / 100000) / 10 + 'M';
        } else if (count >= 1000) {
            return Math.floor(count / 100) / 10 + 'K';
        } else {
            return count.toString();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return '1일 전';
        } else if (diffDays < 30) {
            return `${diffDays}일 전`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months}개월 전`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years}년 전`;
        }
    }

    updateCurrentSearch(customQuery = null) {
        const currentSearchEl = document.getElementById('currentSearch');
        if (!currentSearchEl) return;
        
        if (customQuery) {
            currentSearchEl.textContent = `현재 검색어: "${customQuery}"`;
        } else if (this.currentQuery) {
            currentSearchEl.textContent = `현재 검색어: "${this.currentQuery}"`;
        }
    }

    updateVideoCount() {
        const videoCountEl = document.getElementById('videoCount');
        if (!videoCountEl) return;
        
        if (this.videos.length > 0) {
            videoCountEl.textContent = `총 ${this.videos.length}개의 영상`;
            videoCountEl.style.display = 'block';
        } else {
            videoCountEl.style.display = 'none';
        }
    }

    showLoading(show) {
        const loadingEl = document.getElementById('loadingIndicator');
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    showNoResults() {
        const noResultsEl = document.getElementById('noResults');
        if (noResultsEl) {
            noResultsEl.style.display = 'block';
        }
    }

    clearResults() {
        const videoGrid = document.getElementById('videoGrid');
        const noResultsEl = document.getElementById('noResults');
        const videoCountEl = document.getElementById('videoCount');
        
        if (videoGrid) videoGrid.innerHTML = '';
        if (noResultsEl) noResultsEl.style.display = 'none';
        if (videoCountEl) videoCountEl.style.display = 'none';
        this.hideError();
    }

    async loadCurriculumVideos(curriculum) {
        console.log('=== CURRICULUM DEBUG START ===');
        console.log('Raw curriculum object:', JSON.stringify(curriculum, null, 2));
        console.log('Selected elements array:', curriculum.selectedElements);
        console.log('Selected elements length:', curriculum.selectedElements?.length || 0);
        console.log('Subject:', curriculum.subject);
        console.log('Unit:', curriculum.unit);
        console.log('=== CURRICULUM DEBUG END ===');
        
        // 교육과정 데이터 유효성 재검증
        if (!curriculum || !curriculum.subject || !curriculum.unit) {
            console.error('Invalid curriculum data provided:', curriculum);
            this.showError('교육과정 정보를 찾을 수 없습니다. 실험 설계안 탭에서 교육과정을 먼저 선택해주세요.');
            return;
        }
        
        // 기본 번역 매핑 (자주 사용되는 것만)
        const elementMapping = {
            // 기본 물리 용어
            '힘': 'force',
            '운동': 'motion',
            '운동량': 'momentum',
            '관성': 'inertia',
            '관성력': 'fictitious force',
            '탄성력': 'restoring force',
            '가속도': 'acceleration',
            '중력가속도': 'gravitational acceleration',
            '평형': 'equilibrium',
            '에너지': 'energy',
            '위치에너지': 'potential energy',
            '탄성에너지': 'elastic potential energy',
            '운동에너지': 'kinetic energy',
            '전기': 'electricity',
            '전류': 'electric current',
            '자기': 'magnetism',
            '자기장': 'magnetic field',
            '전기장': 'electric field',
            '파동': 'wave',
            '빛': 'light',
            '빛의 세기': 'intensity of light',
            '소리': 'sound',
            '온도': 'temperature',
            '열': 'heat',
            '압력': 'pressure',
            '속도': 'velocity',
            '속력': 'speed',
            '질량': 'mass',
            '부피': 'volume',
            '밀도': 'density',
            '전압': 'voltage',
            '저항': 'resistance',
            
            // 물리 현상/법칙
            '옴의 법칙': 'ohms law',
            '쿨롱의 법칙': 'coulombs law',
            '패러데이 법칙': 'faradays law',
            '뉴턴의 법칙': 'newtons laws',
            '뉴턴의 운동 법칙': 'newtons laws of motion',
            '만유인력의 법칙': 'law of universal gravitation',
            '훅의 법칙': 'hookes law',
            '베르누이 정리': 'bernoulli principle',
            '아르키메데스 원리': 'archimedes principle',
            '도플러 효과': 'doppler effect',
            
            // 기본 화학 용어
            '원자': 'atom',
            '분자': 'molecule',
            '이온': 'ion',
            '원소': 'element',
            '화합물': 'compound',
            '반응': 'reaction',
            '산화': 'oxidation',
            '환원': 'reduction',
            '중화': 'neutralization',
            '용해': 'dissolution',
            '결정': 'crystal',
            '촉매': 'catalyst',
            'pH': 'pH',
            '산': 'acid',
            '염기': 'base',
            '염': 'salt',
            
            // 생물 용어
            '세포': 'cell',
            '광합성': 'photosynthesis',
            '호흡': 'respiration',
            '효소': 'enzyme',
            'DNA': 'DNA',
            'RNA': 'RNA',
            '단백질': 'protein',
            '유전': 'genetics',
            '진화': 'evolution',
            '생태계': 'ecosystem',
            '환경': 'environment',
            
            // 지구과학 용어
            '지구': 'earth',
            '대기': 'atmosphere',
            '날씨': 'weather',
            '기후': 'climate',
            '지진': 'earthquake',
            '화산': 'volcano',
            '암석': 'rock',
            '광물': 'mineral',
            '태양계': 'solar system',
            '별': 'star',
            '행성': 'planet',
            
            // 실험/교육 용어
            '실험': 'experiment',
            '관찰': 'observation',
            '측정': 'measurement',
            '분석': 'analysis',
            '탐구': 'inquiry',
            '가설': 'hypothesis',
            '변인': 'variable',
            '대조군': 'control group',
            '실험군': 'experimental group'
        };
        
        let translatedElement = '';
        
        // 선택된 내용 요소 처리
        if (curriculum.selectedElements && Array.isArray(curriculum.selectedElements) && curriculum.selectedElements.length > 0) {
            console.log('🎯 Processing selected elements:', curriculum.selectedElements);
            
            // 첫 번째 요소 번역
            const firstElement = curriculum.selectedElements[0];
            if (elementMapping[firstElement]) {
                translatedElement = elementMapping[firstElement];
                console.log(`✅ Translated "${firstElement}" -> "${translatedElement}"`);
            } else {
                console.warn(`❌ No mapping found for: "${firstElement}"`);
                // 매핑에 없으면 번역 API 사용 (검색 품질 향상을 위해 필수)
                try {
                    console.log(`🔄 Using translation API for: "${firstElement}"`);
                    const response = await apiService.translateText(firstElement, 'en');
                    if (response.success) {
                        translatedElement = response.data.translatedText;
                        console.log(`✅ API translated "${firstElement}" -> "${translatedElement}"`);
                    } else {
                        throw new Error('Translation API failed');
                    }
                } catch (error) {
                    console.error('Translation API error:', error);
                    translatedElement = firstElement; // 번역 실패하면 한국어 그대로
                    console.log(`🔄 Using Korean term as fallback: "${translatedElement}"`);
                }
            }
        } else {
            console.log('⚠️ No selected elements found, using fallback');
            translatedElement = 'general science';
        }
        
        // 검색어 생성: science [번역된요소] experiment education
        const query = `science ${translatedElement} experiment education`;
        
        console.log('🔍 Final search query:', query);
        
        // UI 업데이트
        const searchInput = document.getElementById('searchInput');
        const currentSearch = document.getElementById('currentSearch');
        
        if (searchInput) {
            searchInput.disabled = false;
            const elementsText = curriculum.selectedElements?.join(', ') || curriculum.unit;
            searchInput.placeholder = ` (${curriculum.subject} ${elementsText} 관련 영상 검색중) 필터링할 내용을 입력하세요 `;
        }
        
        if (currentSearch) {
            const elementsText = curriculum.selectedElements?.join(', ') || curriculum.unit;
            currentSearch.textContent = `${elementsText} 관련 교육 영상 로딩 중...`;
        }
        
        // baseQuery 설정 및 검색 실행
        this.baseQuery = query;
        this.performSearch(query);
    }

    async loadInitialContent() {
        console.log('Loading initial video content...');
        
        // 교육과정 데이터 확인 (안전장치 포함)
        let curriculumData = dataStore.getCurriculum();
        
        // dataStore가 비어있으면 폼에서 읽기 시도
        if (!curriculumData || !curriculumData.subject || !curriculumData.unit) {
            console.log('DataStore curriculum not found, reading from form...');
            
            const subject = document.getElementById('subject')?.value;
            const unit = document.getElementById('unit')?.value;
            
            if (subject && unit) {
                curriculumData = {
                    subject,
                    unit,
                    schoolLevel: document.getElementById('schoolLevel')?.value,
                    gradeGroup: document.getElementById('gradeGroup')?.value,
                    selectedElements: Array.from(document.querySelectorAll('.content-element.selected'))
                        .map(el => el.textContent.trim())
                };
                console.log('Curriculum data from form:', curriculumData);
            }
        }
        
        // 교육과정 데이터 검증
        if (!curriculumData || !curriculumData.subject || !curriculumData.unit) {
            console.warn('Curriculum data still not available, retrying in 1 second...');
            // 1초 후 재시도
            setTimeout(() => {
                this.loadInitialContent();
            }, 1000);
            return;
        }
        
        // 교육과정 기반 영상 로드
        await this.loadCurriculumVideos(curriculumData);
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
    }
}

// 전역 변수로 인스턴스 저장
let videoTabInstance = null;

// Export for external use and initialization
export function init() {
    console.log('Initializing video tab...');
    videoTabInstance = new VideoRecommendationTab();
    videoTabInstance.init(); // 중요: .init() 메서드 호출
    
    // 전역 접근을 위해 window에도 저장
    window.videoTab = videoTabInstance;
}

// Export class for potential external use
export { VideoRecommendationTab }; 