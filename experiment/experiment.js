// experiment.js - 실험 설계안 탭 모듈

import { callGeminiService } from '../shared/api.js';
import { experimentDesignPrompt, experimentRevisionPrompt } from './experiment-prompts.js';
import { renderTemplate, formatPrerequisiteContent, markdownToHtml, downloadAsDocx } from '../shared/utils.js';
import { getPrerequisiteContent } from '../shared/curriculum.js';
import { dataStore } from '../shared/data-store.js';

// 탭 초기화 함수
export function init() {
    console.log('Experiment tab initialized');
    setupEventListeners();
    
    // 데이터 스토어 구독
    dataStore.subscribe('experiment-generated', handleExperimentGenerated);
    dataStore.subscribe('form-submitted', handleFormSubmit);
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 수정 요청 버튼
    const revisionBtn = document.getElementById('revisionBtn');
    if (revisionBtn) {
        revisionBtn.addEventListener('click', handleRevisionClick);
    }
    
    // 내보내기 버튼
    const exportBtn = document.getElementById('exportExperimentBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => handleExport('experiment'));
    }
    
    // 모달 관련
    const submitRevisionBtn = document.getElementById('submitRevisionBtn');
    if (submitRevisionBtn) {
        submitRevisionBtn.addEventListener('click', handleSubmitRevision);
    }
    
    // 모달 닫기
    const closeBtn = document.querySelector('#revisionModal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
}

// 폼 제출 처리
async function handleFormSubmit(formData) {
    console.log('Experiment tab received form data:', formData);
    
    try {
        showLoading('실험을 설계하는 중입니다...');
        
        // 선수학습 내용 가져오기
        const prerequisites = getPrerequisiteContent(
            formData.schoolLevel, 
            formData.gradeGroup
        );
        
        // 프롬프트 생성
        const prompt = renderTemplate(experimentDesignPrompt, {
            schoolLevel: formData.schoolLevel,
            gradeGroup: formData.gradeGroup,
            subject: formData.subject,
            unit: formData.unit,
            contentElements: formData.selectedElements.join(', '),
            prerequisiteContent: formatPrerequisiteContent(prerequisites),
            experimentTopic: formData.experimentTopic,
            teacherIntent: formData.teacherIntent,
            referenceContent: formData.referenceContent || '참고 자료 없음'
        });
        
        // AI 호출
        const messages = [{ role: 'user', content: prompt }];
        const result = await callGeminiService(messages);
        
        // 결과 표시
        displayExperiment(result);
        
        // 데이터 스토어에 저장
        console.log('🔥 Experiment generated, saving to store and triggering events...');
        dataStore.setExperiment(result);
        console.log('🔥 Experiment saved, events should be triggered now');
        
        // 템플릿도 바로 생성 (백업용)
        await generateTemplateBackup(result);
        
        hideLoading();
        
    } catch (error) {
        console.error('실험 설계 오류:', error);
        showError('실험 설계 중 오류가 발생했습니다: ' + error.message);
        hideLoading();
    }
}

// 백업용 템플릿 생성 함수
async function generateTemplateBackup(experiment) {
    try {
        console.log('🔥 Generating template backup...');
        
        // 템플릿 프롬프트 임포트
        const { studentReportTemplatePrompt } = await import('../template/template-prompts.js');
        
        const templatePrompt = renderTemplate(studentReportTemplatePrompt, {
            experimentDesign: experiment
        });
        
        const messages = [{ role: 'user', content: templatePrompt }];
        const templateResult = await callGeminiService(messages);
        
        // 데이터 스토어에 템플릿 저장
        dataStore.setTemplate(templateResult);
        console.log('🔥 Template backup generated successfully!');
        
    } catch (error) {
        console.error('❌ Template backup generation failed:', error);
        // 템플릿 생성 실패는 치명적이지 않으므로 조용히 처리
    }
}

// 실험 결과 표시
function displayExperiment(experiment) {
    const resultContainer = document.getElementById('experimentResult');
    const actionsContainer = document.getElementById('experimentActions');
    
    if (resultContainer) {
        resultContainer.innerHTML = markdownToHtml(experiment);
        actionsContainer.style.display = 'block';
        
        // 결과 영역으로 부드럽게 스크롤
        resultContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// 실험 생성 완료 처리
function handleExperimentGenerated(experiment) {
    displayExperiment(experiment);
}

// 수정 요청 버튼 클릭
function handleRevisionClick() {
    const modal = document.getElementById('revisionModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 수정 요청 제출
async function handleSubmitRevision() {
    const revisionRequest = document.getElementById('revisionRequest')?.value;
    const currentExperiment = dataStore.getExperiment();
    
    if (!revisionRequest.trim()) {
        alert('수정 요청 내용을 입력해주세요.');
        return;
    }
    
    if (!currentExperiment) {
        alert('수정할 실험이 없습니다.');
        return;
    }
    
    try {
        showLoading('실험을 수정하는 중입니다...');
        closeModal();
        
        // 수정 프롬프트 생성
        const prompt = renderTemplate(experimentRevisionPrompt, {
            originalExperiment: currentExperiment,
            revisionRequest: revisionRequest
        });
        
        // AI 호출
        const messages = [{ role: 'user', content: prompt }];
        const result = await callGeminiService(messages);
        
        // 결과 표시 및 저장
        displayExperiment(result);
        dataStore.setExperiment(result);
        
        // 입력 필드 초기화
        document.getElementById('revisionRequest').value = '';
        
        hideLoading();
        
    } catch (error) {
        console.error('실험 수정 오류:', error);
        showError('실험 수정 중 오류가 발생했습니다: ' + error.message);
        hideLoading();
    }
}

// 내보내기 처리
async function handleExport(type) {
    const experiment = dataStore.getExperiment();
    
    if (!experiment) {
        alert('내보낼 실험이 없습니다.');
        return;
    }
    
    try {
        const filename = `실험설계안_${new Date().toLocaleDateString('ko-KR')}`;
        await downloadAsDocx(experiment, filename);
    } catch (error) {
        console.error('파일 다운로드 오류:', error);
        alert('파일 다운로드 중 오류가 발생했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('revisionModal');
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