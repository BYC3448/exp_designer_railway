// utils.js - 공통 유틸리티 함수들

// 템플릿 문자열에 변수 삽입하는 함수
export function renderTemplate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
    });
}

// 선수학습 내용을 텍스트로 포매팅하는 함수
export function formatPrerequisiteContent(prerequisites) {
    if (!prerequisites || prerequisites.length === 0) {
        return "선수학습 내용이 없습니다.";
    }

    let result = "";
    const grouped = {};
    
    // 학교급별로 그룹화
    prerequisites.forEach(pre => {
        if (!grouped[pre.schoolLevel]) {
            grouped[pre.schoolLevel] = {};
        }
        
        if (!grouped[pre.schoolLevel][pre.gradeGroup]) {
            grouped[pre.schoolLevel][pre.gradeGroup] = {};
        }
        
        if (!grouped[pre.schoolLevel][pre.gradeGroup][pre.subject]) {
            grouped[pre.schoolLevel][pre.gradeGroup][pre.subject] = {};
        }
        
        grouped[pre.schoolLevel][pre.gradeGroup][pre.subject][pre.unit] = pre.contentElements;
    });
    
    // 그룹화된 데이터를 텍스트로 변환
    for (const schoolLevel in grouped) {
        for (const gradeGroup in grouped[schoolLevel]) {
            result += `- ${schoolLevel} ${gradeGroup}:\n`;
            
            for (const subject in grouped[schoolLevel][gradeGroup]) {
                for (const unit in grouped[schoolLevel][gradeGroup][subject]) {
                    const elements = grouped[schoolLevel][gradeGroup][subject][unit];
                    result += `  - ${unit}: ${elements.join(', ')}\n`;
                }
            }
        }
    }
    
    return result;
}

// 마크다운을 HTML로 변환하는 함수
export function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    // HTML 태그가 이미 포함되어 있으면 그대로 반환
    if (markdown.includes('<') && markdown.includes('>')) {
        // HTML 콘텐츠를 그대로 사용하되, 마크다운 문법도 처리
        let content = markdown;
        
        // 기본적인 마크다운 문법 처리 (HTML과 함께 사용될 수 있음)
        content = content.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        content = content.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        content = content.replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
        content = content.replace(/^\* (.*$)/gim, '<li>$1</li>');
        
        // 연속된 <li> 태그들을 <ul>로 감싸기
        content = content.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
            return '<ul>' + match + '</ul>';
        });
        
        // 문제의 핵심: 테이블과 관련된 줄바꿈만 엄격하게 제어
        // 1. 테이블 전후의 모든 줄바꿈 제거
        content = content.replace(/\n+(<table[^>]*>)/g, '$1');
        content = content.replace(/(<\/table>)\n+/g, '$1');
        
        // 2. 테이블 내부의 줄바꿈도 제거
        content = content.replace(/(<\/tr>)\n+(<tr>)/g, '$1$2');
        content = content.replace(/(<\/td>)\n+(<td>)/g, '$1$2');
        content = content.replace(/(<\/th>)\n+(<th>)/g, '$1$2');
        
        // 3. div 컨테이너 전후의 줄바꿈도 제어
        content = content.replace(/\n+(<div[^>]*>)/g, '$1');
        content = content.replace(/(<\/div>)\n+/g, '$1');
        
        // 4. 일반 텍스트의 줄바꿈만 <br>로 변환
        content = content.replace(/\n(?![<\s])/g, '<br>');
        
        // 5. 연속된 <br> 정리 (최대 2개까지만)
        content = content.replace(/(<br>\s*){3,}/g, '<br><br>');
        
        // 6. 표와 그래프 컨테이너 스타일 추가
        content = content.replace(/<table/g, '<table style="margin: 10px auto; border-collapse: collapse; width: 90%;"');
        content = content.replace(/<div class="graph-container">/g, '<div class="graph-container" style="margin: 15px auto; max-width: 500px;">');
        
        return content;
    }
    
    // marked 라이브러리 사용
    if (typeof marked !== 'undefined') {
        return marked.parse(markdown);
    }
    
    // marked가 없는 경우 간단한 변환
    return markdown
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\n/gim, '<br>');
}

// Word 파일용 HTML로 변환
function markdownToWordHtml(markdown) {
    if (!markdown) return '';
    
    let content = markdown;
    
    // Base64 SVG 이미지를 Word 호환 HTML 테이블 격자로 대체
    const wordCompatibleGraph = `
    <div style="margin: 20px auto; text-align: center;">
        <h4>(그래프 1) 실험 결과 그래프</h4>
        <table style="border-collapse: collapse; margin: 10px auto; width: 400px; height: 300px;">
            <tr style="height: 30px;">
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
                <td style="border: 1px solid #ddd; width: 40px;"></td>
            </tr>
            <tr style="height: 30px;">
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
            </tr>
            <tr style="height: 30px;">
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
            </tr>
            <tr style="height: 30px;">
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
            </tr>
            <tr style="height: 30px;">
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
            </tr>
            <tr style="height: 30px;">
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
            </tr>
            <tr style="height: 30px;">
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
            </tr>
            <tr style="height: 30px;">
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
                <td style="border: 1px solid #ddd;"></td>
            </tr>
        </table>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">위 격자에 실험 결과를 점으로 찍고 선으로 연결하여 그래프를 그려보세요.</p>
    </div>`;
    
    // Base64 SVG 이미지가 포함된 그래프 컨테이너를 Word 호환 테이블로 대체
    content = content.replace(/<div class="graph-container">[\s\S]*?<\/div>\s*<\/div>/g, wordCompatibleGraph);
    
    // HTML 태그가 이미 포함되어 있으면 그대로 사용
    if (content.includes('<') && content.includes('>')) {
        // 기본적인 마크다운 문법 처리
        content = content.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        content = content.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        content = content.replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
        content = content.replace(/^\* (.*$)/gim, '<li>$1</li>');
        
        // 연속된 <li> 태그들을 <ul>로 감싸기
        content = content.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
            return '<ul>' + match + '</ul>';
        });
        
        // 줄바꿈 처리 (Word용으로 단순화)
        content = content.replace(/\n(?![<\s])/g, '<br>');
        
        return content;
    }
    
    // marked 라이브러리 사용
    if (typeof marked !== 'undefined') {
        return marked.parse(content);
    }
    
    // 간단한 마크다운 변환
    return content
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// HTML 파일로 다운로드하는 함수 (Word에서 열 수 있음)
export async function downloadAsDocx(content, filename) {
    try {
        // 마크다운을 HTML로 변환
        const htmlContent = markdownToWordHtml(content);
        
        // Word에서 열 수 있는 HTML 형식으로 생성
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word 15">
    <title>${filename}</title>
    <style type="text/css">
        body { font-family: '맑은 고딕', Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 2cm; }
        h1 { font-size: 18pt; font-weight: bold; margin-top: 20pt; margin-bottom: 10pt; }
        h2 { font-size: 16pt; font-weight: bold; margin-top: 15pt; margin-bottom: 8pt; }
        h3 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
        p { margin-top: 6pt; margin-bottom: 6pt; }
        ul { margin-left: 20pt; }
        li { margin-bottom: 3pt; }
        strong { font-weight: bold; }
        em { font-style: italic; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { border: 1px solid #333; padding: 8px; text-align: center; }
        th { background-color: #f0f0f0; font-weight: bold; }
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
        
        // Blob 생성
        const blob = new Blob([fullHtml], { 
            type: 'application/msword'
        });
        
        // 다운로드 실행 (.doc 확장자 사용)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('파일 다운로드 완료:', filename);
        
    } catch (error) {
        console.error('다운로드 오류:', error);
        throw new Error('파일 다운로드 중 오류가 발생했습니다: ' + error.message);
    }
}

// 파일 내용 읽기 관련 함수들
// PDF 읽기 함수
async function readPdfFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let text = '';
                
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const content = await page.getTextContent();
                    const pageText = content.items.map(item => item.str).join(' ');
                    text += pageText + '\n';
                }
                
                resolve(text);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

// DOCX 읽기 함수
async function readDocxFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const result = await mammoth.extractRawText({arrayBuffer: arrayBuffer});
                resolve(result.value);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

// 일반 텍스트 파일 읽기 함수
async function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
        
        reader.readAsText(file);
    });
}

// 파일 내용 읽기 함수 (통합된 버전)
export async function readFileContent(file) {
    const fileType = file.name.split('.').pop().toLowerCase();
    
    try {
        switch (fileType) {
            case 'pdf':
                return await readPdfFile(file);
                
            case 'docx':
                return await readDocxFile(file);
                
            case 'txt':
            case 'md':
            default:
                return await readTextFile(file);
        }
    } catch (error) {
        console.error('파일 읽기 오류:', error);
        throw new Error(`${fileType.toUpperCase()} 파일 읽기 중 오류가 발생했습니다: ${error.message}`);
    }
}

// 디버그 함수
export function debug(message, data) {
    if (console && console.log) {
        console.log(`[DEBUG] ${message}`, data);
    }
}

// 에러 메시지 표시
export function showErrorMessage(message) {
    alert(message); // 간단한 구현, 나중에 모달로 대체 가능
}