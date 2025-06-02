// api.js - API 호출 클라이언트

class ApiService {
    constructor() {
        this.baseUrl = '';
    }

    // Gemini API 호출
    async callGeminiService(messages) {
        try {
            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 요청 실패: ${errorText}`);
            }

            const data = await response.json();
            return { success: true, data: data.result };
        } catch (error) {
            console.error("Gemini API 호출 오류:", error);
            return { success: false, error: error.message };
        }
    }

    // YouTube 영상 검색
    async searchYouTubeVideos({ query, maxResults = 12, pageToken = null }) {
        try {
            const requestBody = { 
                query,
                maxResults
            };
            if (pageToken) {
                requestBody.pageToken = pageToken;
            }

            const response = await fetch('/api/youtube/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`YouTube API 요청 실패: ${errorText}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error("YouTube API 호출 오류:", error);
            return { success: false, error: error.message };
        }
    }

    // YouTube 영상 상세 정보 (재생시간, 조회수 등)
    async getYouTubeVideoDetails(videoId) {
        try {
            const response = await fetch('/api/youtube/details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ videoId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`YouTube 상세정보 요청 실패: ${errorText}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error("YouTube 상세정보 호출 오류:", error);
            return { success: false, error: error.message };
        }
    }

    // 텍스트 번역 (Gemini API 사용)
    async translateText(text, targetLanguage = 'ko') {
        try {
            const prompt = `다음 텍스트를 ${targetLanguage === 'ko' ? '한국어' : targetLanguage}로 번역해주세요. 과학 교육과 관련된 내용이므로 교육적 맥락을 고려해서 번역해주세요.

원문: "${text}"

번역된 텍스트만 답변해주세요.`;

            const messages = [{ role: 'user', content: prompt }];
            const result = await this.callGeminiService(messages);
            
            if (result.success) {
                return { 
                    success: true, 
                    data: { translatedText: result.data.trim() }
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('텍스트 번역 오류:', error);
            return { 
                success: false, 
                error: error.message,
                data: { translatedText: text } // 번역 실패 시 원문 반환
            };
        }
    }

    // 제목 번역 (호환성을 위한 별칭)
    async translateTitle(englishTitle) {
        const result = await this.translateText(englishTitle, 'ko');
        if (result.success) {
            return result.data.translatedText;
        } else {
            return englishTitle;
        }
    }
}

// 싱글톤 인스턴스 생성
export const apiService = new ApiService();

// 기존 함수들 (호환성을 위해 유지)
export async function callGeminiService(messages) {
    const result = await apiService.callGeminiService(messages);
    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.error);
    }
}

export async function searchYouTubeVideos(query, pageToken = null) {
    const result = await apiService.searchYouTubeVideos({ query, pageToken });
    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.error);
    }
}

export async function translateTitle(englishTitle) {
    return await apiService.translateTitle(englishTitle);
} 