# 🧪 과학 실험 설계 도우미

AI를 활용한 맞춤형 과학 실험 설계 및 학생용 보고서 템플릿 생성 도구

## 📋 프로젝트 소개

**과학 실험 설계 도우미**는 초중고등학교 과학 교사를 위한 AI 기반 교육 도구입니다. 2022개정교육과정(과학과)에 완벽히 맞춘 실험 설계안을 자동으로 생성하고, 학생용 보고서 템플릿과 해당 내용 관련 YouTube 동영상까지 한 번에 제공합니다.

### ✨ 주요 특징

- 🎯 **교육과정 완벽 매핑**: 초등학교 3학년부터 고등학교 융합선택까지 전체 과학과 교육과정 데이터베이스
- 🧠 **AI 맞춤 설계**: Gemini AI를 활용한 학년별 맞춤형 실험 설계
- 📝 **학생용 템플릿**: 실험 보고서 작성을 위한 구조화된 템플릿 자동 생성
- 🎬 **동영상 추천**: YouTube API 연동으로 실험 관련 참고 영상 자동 검색
- 📁 **참고자료 지원**: PDF, Word, 텍스트 파일 업로드 및 분석 기능
- 🔒 **안전성 우선**: 학교 현장에서 안전하게 수행 가능한 실험만 제안

## 🚀 주요 기능

### 1. 실험 설계안 생성
- 교육과정 정보 기반 맞춤형 실험 설계
- 45분 수업시간에 최적화된 실험 과정
- 일반 과학실에서 구할 수 있는 재료만 사용
- 과학적 탐구 과정 체계적 포함

### 2. 학생용 보고서 템플릿
- 실험 목적부터 결론까지 구조화된 템플릿
- 학년 수준에 맞는 서술 가이드
- 그래프 및 표 작성 공간 포함

### 3. 관련 동영상 추천
- 내용 요소를 키워드로 하는 YouTube 해외 실험 영상 자동 검색
- 영상 길이, 조회수, 채널 정보 제공
- 필터링 문구를 한글로 입력하면 한국 동영상 일부 검색 가능


## 🎮 사용 방법

### 1. 교육과정 정보 입력
- 학교급, 학년군, 과목, 단원 순서로 선택
- 해당 단원의 내용 요소 중 실험하고 싶은 요소 선택

### 2. 실험 정보 입력 (선택사항)
- **실험 주제**: 구체적인 주제가 있다면 입력
- **수업 의도**: 어떤 방향의 수업을 원하는지 입력
- **참고 자료**: 관련 PDF, Word 파일 업로드

### 3. 실험 설계하기
- "실험 설계하기" 버튼 클릭
- AI가 교육과정에 맞는 실험 설계안 생성

### 4. 결과 확인
- **실험 설계안**: 목표, 준비물, 과정, 안전수칙 등 포함
- **학생용 템플릿**: 보고서 작성용 구조화된 템플릿
- **추천 동영상**: 관련 실험 영상 목록

### 5. 내보내기
- Word 파일로 다운로드 가능
- 실험 수정 요청도 가능

## 🏫 교육과정 지원 범위

### 초등학교
- 3~4학년군: 기초 과학 개념 중심
- 5~6학년군: 체험적 탐구 활동 중심

### 중학교
- 1~3학년군: 과학적 탐구 과정 체계화

### 고등학교
- **공통과정**: 통합과학, 과학탐구실험
- **일반선택**: 물리학, 화학, 생명과학, 지구과학
- **진로선택**: 심화 과목들
- **융합선택**: 융합 과목들


## 📸 스크린샷

![메인화면-교육과정](https://github.com/user-attachments/assets/1b43a825-4d8c-4c14-a4e2-ee9cb67f06c9)

![메인화면-교사의 수업의도](https://github.com/user-attachments/assets/229ddda3-1fc0-4e98-8970-58557e7d8705)

![실험설계안 예시](https://github.com/user-attachments/assets/4d00ad70-948f-4138-89ad-006f0e07f3e9)

![학생용 보고서 템플릿 예시1](https://github.com/user-attachments/assets/a54edbbc-09a7-4611-88fc-dc9a78ac5ec5)

![학생용 보고서 템플릿 예시2](https://github.com/user-attachments/assets/271c4ac1-53a4-4846-8890-b1c74fbbba57)

![학생용 보고서 템플릿 예시3](https://github.com/user-attachments/assets/b8068a4e-3ae0-4dfb-bac2-95a9cb30e9a0)

![추천 실험 영상](https://github.com/user-attachments/assets/75f3e78c-2b36-4c21-bb30-bd2c051a719d)



## 🛠️ 기술 스택

### Frontend
- **Vanilla JavaScript** (ES6 Modules)
- **HTML5 / CSS3**
- **File API** (PDF, Word 파일 처리)
- **Markdown** 렌더링

### Backend
- **Node.js** + **Express.js**
- **Google Gemini API** (AI 텍스트 생성)
- **YouTube Data API v3** (동영상 검색)

### Architecture
- **SPA** (Single Page Application)
- **Publisher-Subscriber** 패턴
- **모듈형 아키텍처**


## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- **개발자**: 최보윤 (qtbbo@naver.com)
- **소속**: 동덕여자고등학교, 숙명여자대학교 대학원
- **목적**: AI융합교육 석사과정 캡스톤 프로젝트

---

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요! 
