// template-prompts.js - 학생용 템플릿 관련 프롬프트

// 학생용 보고서 템플릿 생성용 프롬프트
export const studentReportTemplatePrompt = `
다음 실험 설계안을 바탕으로, 학생들이 실험 결과를 기록하고 분석할 수 있는 보고서 템플릿을 생성해 주세요.

[실험 설계안]
{{experimentDesign}}

다음 요소만을 포함하는 간단한 학생용 보고서 템플릿을 만들어 주세요:

1. 학생 정보 입력란 (학년/반/번호/이름)
2. 실험 제목
3. 실험 목표
4. 준비물
5. 실험 과정
6. **"## 관찰 및 측정 결과" 제목과 함께 측정 결과를 기록할 수 있는 표** (최대 5회 실험)
7. **"## 데이터 그래프" 제목과 함께 데이터를 그래프로 표현할 수 있는 그래프 영역** (좌표평면 포함)
8. 결과 분석을 위한 안내 질문
9. 결론

**중요: 반드시 마크다운 형식으로 응답해주세요. HTML 태그는 표와 그래프 영역에만 사용하고, 나머지는 마크다운 문법을 사용하세요.**

**섹션 제목 작성 규칙:**
- "관찰 및 측정 결과" 섹션에는 반드시 "## 관찰 및 측정 결과" 제목을 포함하세요
- "데이터 그래프" 섹션에는 반드시 "## 데이터 그래프" 제목을 포함하세요
- 각 섹션 제목은 마크다운 ## 형식을 사용하세요

**응답 형식 주의사항:**
- 마크다운 코드블록 표시를 절대 사용하지 마세요
- 응답의 맨 앞과 맨 뒤에 백틱 3개 표시를 넣지 마세요
- 템플릿 내용만 직접 출력해주세요
- Word 다운로드시 정상적으로 표시되도록 순수한 마크다운과 HTML만 사용하세요

**표 작성 지침:**
- 실험의 특성에 맞는 측정 항목들(시간, 거리, 온도, 전압, 전류 등)을 표의 열 제목으로 사용하세요
- 최대 5회의 실험 데이터를 입력할 수 있도록 행을 구성하세요
- 표의 각 열에는 단위를 명확히 표시하세요
- 표는 다음과 같은 HTML 형식으로 작성하세요:

<table border="1">
<tr><th>항목1</th><th>항목2</th></tr>
<tr><td></td><td></td></tr>
</table>

**그래프 영역 작성 지침:**
실험의 특성에 따라 다음과 같은 그래프 형식을 사용하세요:

<div class="graph-container">
<div class="graph-title">(그래프 1) 실험 결과 그래프</div>
<div class="graph-area">
<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgCiAgPCEtLSBHcmlkIGxpbmVzIC0tPgogIDxkZWZzPgogICAgPHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxwYXRoIGQ9Ik0gMzAgMCBMIDAgMCAwIDMwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlZWUiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+CiAgCiAgPCEtLSBNYWluIGF4ZXMgLS0+CiAgPGxpbmUgeDE9IjYwIiB5MT0iMzkwIiB4Mj0iNTcwIiB5Mj0iMzkwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxsaW5lIHgxPSI2MCIgeTE9IjYwIiB4Mj0iNjAiIHkyPSIzOTAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgCiAgPCEtLSBBcnJvd3MgLS0+CiAgPHBvbHlnb24gcG9pbnRzPSI1NzAsMzkwIDU1NSwzODAgNTU1LDQwMCIgZmlsbD0iIzAwMCIvPgogIDxwb2x5Z29uIHBvaW50cz0iNjAsNjAgNDUsNzUgNzUsNzUiIGZpbGw9IiMwMDAiLz4KICA8IS0tIFRpY2sgbWFya3MgLS0+CiAgPGcgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+CiAgICA8bGluZSB4MT0iMTIwIiB5MT0iMzgwIiB4Mj0iMTIwIiB5Mj0iNDAwIi8+CiAgICA8dGV4dCB4PSIxMjAiIHk9IjQyMCI+MTwvdGV4dD4KICAgIDxsaW5lIHgxPSIxODAiIHkxPSIzODAiIHgyPSIxODAiIHkyPSI0MDAiLz4KICAgIDx0ZXh0IHg9IjE4MCIgeT0iNDIyIj4yPC90ZXh0PgogICAgPGxpbmUgeDE9IjI0MCIgeTE9IjM4MCIgeDI9IjI0MCIgeTI9IjQwMCIvPgogICAgPHRleHQgeD0iMjQwIiB5PSI0MjIiPjM8L3RleHQ+CiAgICA8bGluZSB4MT0iMzAwIiB5MT0iMzgwIiB4Mj0iMzAwIiB5Mj0iNDAwIi8+CiAgICA8dGV4dCB4PSIzMDAiIHk9IjQyMiI+NDwvdGV4dD4KICAgIDxsaW5lIHgxPSIzNjAiIHkxPSIzODAiIHgyPSIzNjAiIHkyPSI0MDAiLz4KICAgIDx0ZXh0IHg9IjM2MCIgeT0iNDIyIj41PC90ZXh0PgogICAgPGxpbmUgeDE9IjQyMCIgeTE9IjM4MCIgeDI9IjQyMCIgeTI9IjQwMCIvPgogICAgPHRleHQgeD0iNDIwIiB5PSI0MjIiPjY8L3RleHQ+CiAgICA8bGluZSB4MT0iNDgwIiB5MT0iMzgwIiB4Mj0iNDgwIiB5Mj0iNDAwIi8+CiAgICA8dGV4dCB4PSI0ODAiIHk9IjQyMiI+NzwvdGV4dD4KICA8L2c+CiAgPGcgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9ImVuZCI+CiAgICA8bGluZSB4MT0iNDUiIHkxPSIzMzAiIHgyPSI3NSIgeTI9IjMzMCIvPgogICAgPHRleHQgeD0iNDAiIHk9IjMzNyI+MTwvdGV4dD4KICAgIDxsaW5lIHgxPSI0NSIgeTE9IjI3MCIgeDI9Ijc1IiB5Mj0iMjcwIi8+CiAgICA8dGV4dCB4PSI0MCIgeT0iMjc3Ij4yPC90ZXh0PgogICAgPGxpbmUgeDE9IjQ1IiB5MT0iMjEwIiB4Mj0iNzUiIHkyPSIyMTAiLz4KICAgIDx0ZXh0IHg9IjQwIiB5PSIyMTciPjM8L3RleHQ+CiAgICA8bGluZSB4MT0iNDUiIHkxPSIxNTAiIHgyPSI3NSIgeTI9IjE1MCIvPgogICAgPHRleHQgeD0iNDAiIHk9IjE1NyI+NDwvdGV4dD4KICAgIDxsaW5lIHgxPSI0NSIgeTE9IjkwIiB4Mj0iNzUiIHkyPSI5MCIvPgogICAgPHRleHQgeD0iNDAiIHk9Ijk3Ij41PC90ZXh0PgogIDwvZz4KICA8IS0tIEF4aXMgbGFiZWxzIC0tPgogIDx0ZXh0IHg9IjU4NSIgeT0iNDEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5YPC90ZXh0PgogIDx0ZXh0IHg9IjM1IiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCI+WTwvdGV4dD4KICA8dGV4dCB4PSIzNSIgeT0iNDEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPjA8L3RleHQ+Cjwvc3ZnPgo=" alt="좌표평면 그래프" style="width: 500px; height: 375px; border: 1px solid #ccc; display: block; margin: 10px auto;">
<div style="text-align: center; margin-top: 10px; font-size: 12px; color: #666;">위 좌표평면에 실험 결과를 점으로 찍고 선으로 연결하여 그래프를 그려보세요.</div>
</div>
</div>

**학생 정보 입력란 예시:**

**학년: _______ 반: _______ 번호: _______ 이름: _____________________**


## 실험 제목
{실험 설계안에서 추출한 실험 제목을 여기에 명시}

## 실험 목표

보고서 템플릿은 중고등학생이 이해하고 작성하기 쉬운 형식이어야 하며, 실험의 주요 개념을 학습할 수 있도록 구성되어야 합니다.
`;

// 템플릿 수정 요청용 프롬프트
export const templateRevisionPrompt = `
다음은 기존의 실험 설계안과 학생용 보고서 템플릿, 그리고 교사의 템플릿 수정 요청입니다. 
**실험 내용은 전혀 변경하지 말고**, 학생용 보고서 템플릿의 형식과 구조만 수정해 주세요.

[원본 실험 설계안]
{{originalExperiment}}

[현재 학생용 템플릿]
{{originalTemplate}}

[템플릿 수정 요청 사항]
{{revisionRequest}}

다음 사항을 주의해서 수정해 주세요:

1. **실험의 제목, 목표, 준비물, 과정 등은 절대 변경하지 마세요**
2. **템플릿의 형식, 구조, 표의 크기, 질문의 내용 등만 수정하세요**
3. 기존 템플릿의 전체적인 틀은 유지하되, 요청된 부분만 개선하세요
4. 수정된 부분이 학생들이 사용하기에 더 편리하도록 구성하세요
5. HTML 표 형식은 기존과 동일하게 유지하세요

수정 요청을 반영한 개선된 학생용 보고서 템플릿을 제공해 주세요.
`; 