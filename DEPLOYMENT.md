# 과학 실험 설계 도우미 - 배포 가이드

## 🚀 Vercel 배포 (추천)

### 1. 사전 준비
- GitHub 계정
- Vercel 계정 (GitHub로 로그인 가능)
- Google AI Studio에서 Gemini API 키 발급
- Google Cloud Console에서 YouTube Data API 키 발급

### 2. API 키 발급 방법

#### Gemini API 키
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. 새 프로젝트 생성 또는 기존 프로젝트 선택
4. API 키 복사 후 안전한 곳에 저장

#### YouTube Data API 키
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리" 이동
4. "YouTube Data API v3" 검색 후 사용 설정
5. "사용자 인증 정보" 탭에서 "API 키" 생성

### 3. Vercel 배포 단계

#### GitHub에 프로젝트 업로드
```bash
# 프로젝트 폴더에서 실행
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[사용자명]/[저장소명].git
git push -u origin main
```

#### Vercel에서 배포
1. [Vercel](https://vercel.com) 접속 후 GitHub로 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. Framework Preset: "Other" 선택
5. Environment Variables 설정:
   - `GEMINI_API_KEY`: 발급받은 Gemini API 키
   - `YOUTUBE_API_KEY`: 발급받은 YouTube API 키
   - `NODE_ENV`: production
6. "Deploy" 클릭

### 4. 배포 후 확인
- 제공된 URL로 접속하여 기능 테스트
- API 호출이 정상 작동하는지 확인

## 🛠️ Railway 배포 (대안)

### 1. Railway 가입
1. [Railway](https://railway.app) 접속
2. GitHub로 로그인

### 2. 프로젝트 배포
1. "New Project" > "Deploy from GitHub repo"
2. 저장소 선택
3. Environment Variables 설정 (Vercel과 동일)
4. 자동 배포 완료

## 🔧 Render 배포 (대안)

### 1. Render 가입
1. [Render](https://render.com) 접속
2. GitHub로 로그인

### 2. Web Service 생성
1. "New" > "Web Service"
2. GitHub 저장소 연결
3. 설정:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Environment Variables 설정
5. "Create Web Service" 클릭

## ⚡ 성능 최적화 팁

### 1. 캐싱 설정
- API 응답 캐싱으로 속도 향상
- 정적 파일 캐싱 설정

### 2. 모니터링
- Vercel Analytics 활용
- 에러 로깅 설정

### 3. 보안
- API 키는 반드시 환경변수로 관리
- CORS 설정 검토
- Rate limiting 고려

## 🌏 한국 사용자 최적화

### CDN 설정
- Vercel은 기본적으로 글로벌 CDN 제공
- 한국 사용자를 위한 최적화 자동 적용

### 도메인 연결 (선택사항)
1. 도메인 구매 (가비아, 후이즈 등)
2. Vercel에서 Custom Domain 설정
3. DNS 레코드 연결

## 📊 비용 안내

### Vercel
- **무료**: 개인 프로젝트, 월 100GB 대역폭
- **Pro**: $20/월, 상용 프로젝트

### Railway
- **무료**: 월 $5 크레딧 (약 500시간 실행)
- **Developer**: $10/월

### Render
- **무료**: 제한적 (750시간/월)
- **Starter**: $7/월

## 🔍 문제 해결

### 일반적인 오류
1. **빌드 실패**: package.json의 engines 필드 확인
2. **API 키 오류**: 환경변수 설정 재확인
3. **CORS 오류**: server.js의 CORS 설정 확인

### 로그 확인
- Vercel: Functions 탭에서 로그 확인
- Railway: Deployments 탭에서 로그 확인
- Render: Logs 탭에서 실시간 로그 확인 