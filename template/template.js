// template.js - 학생용 템플릿 탭 모듈

import { callGeminiService } from '../shared/api.js';
import { studentReportTemplatePrompt, templateRevisionPrompt } from './template-prompts.js';
import { renderTemplate, markdownToHtml, downloadAsDocx } from '../shared/utils.js';
import { dataStore } from '../shared/data-store.js';

// 탭 초기화 함수
export function init() {
    console.log('🔥 Template tab initialized');
    setupEventListeners();
    
    // 데이터 스토어 구독
    dataStore.subscribe('experiment-generated', handleExperimentGenerated);
    dataStore.subscribe('template-generated', handleTemplateGenerated);
    
    // 이미 실험이 있으면 템플릿 생성
    const existingExperiment = dataStore.getExperiment();
    const existingTemplate = dataStore.getTemplate();
    
    console.log('🔥 Template tab init - existing experiment:', !!existingExperiment);
    console.log('🔥 Template tab init - existing template:', !!existingTemplate);
    
    if (existingExperiment && !existingTemplate) {
        console.log('🔥 Found experiment but no template, generating template...');
        handleExperimentGenerated(existingExperiment);
    } else if (existingTemplate) {
        console.log('🔥 Found existing template, displaying it...');
        displayTemplate(existingTemplate);
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 템플릿 수정 요청 버튼
    const templateRevisionBtn = document.getElementById('templateRevisionBtn');
    if (templateRevisionBtn) {
        templateRevisionBtn.addEventListener('click', handleTemplateRevisionClick);
    }
    
    // 내보내기 버튼
    const exportBtn = document.getElementById('exportTemplateBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => handleExport('template'));
    }
    
    // 모달 관련
    const submitRevisionBtn = document.getElementById('submitTemplateRevisionBtn');
    if (submitRevisionBtn) {
        submitRevisionBtn.addEventListener('click', handleSubmitTemplateRevision);
    }
    
    // 모달 닫기
    const closeBtn = document.querySelector('#templateRevisionModal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
}

// 실험 생성 완료 시 자동으로 템플릿 생성
async function handleExperimentGenerated(experiment) {
    console.log('🔥 Template tab received experiment data:', experiment);
    console.log('🔥 Current template tab elements check:');
    console.log('🔥 templateResult element:', document.getElementById('templateResult'));
    console.log('🔥 templateActions element:', document.getElementById('templateActions'));
    
    if (!experiment) {
        console.error('❌ No experiment data received!');
        return;
    }
    
    try {
        console.log('🔥 Starting template generation...');
        showLoading('학생용 템플릿을 생성하는 중입니다...');
        
        // 템플릿 생성 프롬프트
        const prompt = renderTemplate(studentReportTemplatePrompt, {
            experimentDesign: experiment
        });
        
        console.log('🔥 Template prompt generated, calling AI...');
        
        // AI 호출
        const messages = [{ role: 'user', content: prompt }];
        const result = await callGeminiService(messages);
        
        console.log('🔥 AI response received:', result?.substring(0, 100) + '...');
        
        // 결과 표시 및 저장
        displayTemplate(result);
        dataStore.setTemplate(result);
        
        console.log('🔥 Template generation completed successfully!');
        hideLoading();
        
    } catch (error) {
        console.error('❌ Template generation error:', error);
        showError('템플릿 생성 중 오류가 발생했습니다: ' + error.message);
        hideLoading();
    }
}

// 템플릿 결과 표시
function displayTemplate(template) {
    const resultContainer = document.getElementById('templateResult');
    const actionsContainer = document.getElementById('templateActions');
    
    if (resultContainer) {
        resultContainer.innerHTML = markdownToHtml(template);
        actionsContainer.style.display = 'block';
    }
}

// 템플릿 생성 완료 처리
function handleTemplateGenerated(template) {
    displayTemplate(template);
}

// 템플릿 수정 요청 버튼 클릭
function handleTemplateRevisionClick() {
    const modal = document.getElementById('templateRevisionModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 템플릿 수정 요청 제출
async function handleSubmitTemplateRevision() {
    const revisionRequest = document.getElementById('templateRevisionRequest')?.value;
    const currentTemplate = dataStore.getTemplate();
    const currentExperiment = dataStore.getExperiment();
    
    if (!revisionRequest.trim()) {
        alert('수정 요청 내용을 입력해주세요.');
        return;
    }
    
    if (!currentTemplate) {
        alert('수정할 템플릿이 없습니다.');
        return;
    }
    
    if (!currentExperiment) {
        alert('참조할 실험이 없습니다.');
        return;
    }
    
    try {
        showLoading('템플릿을 수정하는 중입니다...');
        closeModal();
        
        // 템플릿 수정 프롬프트 생성
        const prompt = renderTemplate(templateRevisionPrompt, {
            originalExperiment: currentExperiment,
            originalTemplate: currentTemplate,
            revisionRequest: revisionRequest
        });
        
        // AI 호출
        const messages = [{ role: 'user', content: prompt }];
        const result = await callGeminiService(messages);
        
        // 결과 표시 및 저장
        displayTemplate(result);
        dataStore.setTemplate(result);
        
        // 입력 필드 초기화
        document.getElementById('templateRevisionRequest').value = '';
        
        hideLoading();
        
    } catch (error) {
        console.error('템플릿 수정 오류:', error);
        showError('템플릿 수정 중 오류가 발생했습니다: ' + error.message);
        hideLoading();
    }
}

// 내보내기 처리
async function handleExport(type) {
    const template = dataStore.getTemplate();
    
    if (!template) {
        alert('내보낼 템플릿이 없습니다.');
        return;
    }
    
    try {
        const filename = `학생용템플릿_${new Date().toLocaleDateString('ko-KR')}`;
        await downloadAsDocx(template, filename);
    } catch (error) {
        console.error('파일 다운로드 오류:', error);
        alert('파일 다운로드 중 오류가 발생했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('templateRevisionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 로딩 표시
function showLoading(message) {
    // 메인 앱의 로딩 오버레이 사용
    window.showLoading && window.showLoading(message);
}

// 로딩 숨기기
function hideLoading() {
    window.hideLoading && window.hideLoading();
}

// 에러 표시
function showError(message) {
    window.showErrorMessage && window.showErrorMessage(message);
} 