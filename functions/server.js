const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Gemini API 엔드포인트
app.post('/api/gemini/generate', async (req, res) => {
    try {
        const { messages } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('Gemini API 키가 설정되지 않았습니다.');
        }

        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: lastUserMessage.content
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API 요청 실패: ${errorText}`);
        }

        const data = await response.json();
        let result = '';
        
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                result = candidate.content.parts[0].text || '';
            }
        }

        if (!result) {
            throw new Error('Gemini API 응답에 텍스트가 없습니다.');
        }

        res.json({ result });
    } catch (error) {
        console.error('Gemini API 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// YouTube 검색 API 엔드포인트  
app.post('/api/youtube/search', async (req, res) => {
    try {
        const { query, pageToken, maxResults = 12 } = req.body;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            throw new Error('YouTube API 키가 설정되지 않았습니다.');
        }

        const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : '';
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}${pageTokenParam}&key=${apiKey}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`YouTube API 요청 실패: ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.items || !Array.isArray(data.items)) {
            throw new Error('YouTube API 응답 형식이 올바르지 않습니다.');
        }

        res.json(data);
    } catch (error) {
        console.error('YouTube 검색 중 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// YouTube 영상 상세 정보 API 엔드포인트
app.post('/api/youtube/details', async (req, res) => {
    try {
        const { videoId } = req.body;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            throw new Error('YouTube API 키가 설정되지 않았습니다.');
        }

        if (!videoId) {
            throw new Error('비디오 ID가 필요합니다.');
        }

        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoId}&key=${apiKey}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`YouTube 상세정보 API 요청 실패: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('YouTube 상세정보 조회 중 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports.handler = serverless(app); 