// data-store.js - 중앙 데이터 저장소

class DataStore {
    constructor() {
        this.data = {
            // 교육과정 정보
            curriculum: {
                schoolLevel: null,
                gradeGroup: null,
                subject: null,
                unit: null,
                selectedElements: []
            },
            
            // 폼 데이터
            formData: {
                experimentTopic: '',
                teacherIntent: '',
                referenceContent: ''
            },
            
            // 생성된 콘텐츠
            content: {
                experiment: null,
                template: null,
                videos: []
            }
        };
        
        this.subscribers = {};
    }
    
    // 이벤트 구독
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    }
    
    // 이벤트 발생
    emit(event, data) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} subscriber:`, error);
                }
            });
        }
    }
    
    // 교육과정 설정
    setCurriculum(curriculum) {
        this.data.curriculum = { ...curriculum };
        this.emit('curriculum-changed', curriculum);
    }
    
    getCurriculum() {
        return { ...this.data.curriculum };
    }
    
    // 폼 데이터 설정
    setFormData(formData) {
        this.data.formData = { ...formData };
        this.emit('form-data-changed', formData);
    }
    
    getFormData() {
        return { ...this.data.formData };
    }
    
    // 전체 폼 제출 데이터
    getCompleteFormData() {
        return {
            ...this.data.curriculum,
            ...this.data.formData
        };
    }
    
    // 실험 설정
    setExperiment(experiment) {
        console.log('🔥 DataStore: Setting experiment:', experiment?.substring(0, 100) + '...');
        this.data.content.experiment = experiment;
        
        console.log('🔥 DataStore: Emitting experiment-generated event...');
        this.emit('experiment-generated', experiment);
        console.log('🔥 DataStore: Emitting experiment-changed event...');
        this.emit('experiment-changed', experiment);
        
        console.log('🔥 DataStore: Current subscribers for experiment-generated:', 
                   this.subscribers['experiment-generated']?.length || 0);
    }
    
    getExperiment() {
        return this.data.content.experiment;
    }
    
    // 템플릿 설정
    setTemplate(template) {
        this.data.content.template = template;
        this.emit('template-generated', template);
        this.emit('template-changed', template);
    }
    
    getTemplate() {
        return this.data.content.template;
    }
    
    // 동영상 설정
    setVideos(videos, append = false) {
        if (append) {
            this.data.content.videos = [...this.data.content.videos, ...videos];
        } else {
            this.data.content.videos = videos;
        }
        this.emit('videos-updated', this.data.content.videos);
    }
    
    getVideos() {
        return [...this.data.content.videos];
    }
    
    // 전체 리셋
    reset() {
        this.data = {
            curriculum: {
                schoolLevel: null,
                gradeGroup: null,
                subject: null,
                unit: null,
                selectedElements: []
            },
            formData: {
                experimentTopic: '',
                teacherIntent: '',
                referenceContent: ''
            },
            content: {
                experiment: null,
                template: null,
                videos: []
            }
        };
        
        this.emit('data-reset');
    }
    
    // 새 실험 시작
    startNewExperiment() {
        this.data.content = {
            experiment: null,
            template: null,
            videos: []
        };
        
        this.emit('new-experiment-started');
    }
    
    // 폼 제출 이벤트
    submitForm(formData) {
        // 모든 데이터 업데이트
        this.setCurriculum({
            schoolLevel: formData.schoolLevel,
            gradeGroup: formData.gradeGroup,
            subject: formData.subject,
            unit: formData.unit,
            selectedElements: formData.selectedElements
        });
        
        this.setFormData({
            experimentTopic: formData.experimentTopic,
            teacherIntent: formData.teacherIntent,
            referenceContent: formData.referenceContent
        });
        
        // 폼 제출 이벤트 발생
        this.emit('form-submitted', formData);
    }
    
    // 디버그용
    debugState() {
        console.log('DataStore current state:', this.data);
        console.log('DataStore subscribers:', Object.keys(this.subscribers));
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const dataStore = new DataStore();

// 전역에 노출 (디버깅 목적)
if (typeof window !== 'undefined') {
    window.dataStore = dataStore;
} 