/**
 * 1기 파운딩 아티스트 신규 지원서 접수 시 관리자(auth@sujango.com)에게 실시간 이메일 발송
 */

const ADMIN_EMAIL = 'auth@sujango.com';
const FORM_SUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${ADMIN_EMAIL}`;

export async function sendApplicationEmailNotification(applicantData) {
  try {
    const payload = {
      _subject: `[수장고 1기 파운딩 아티스트] '${applicantData.name}' 작가님의 신규 지원서가 접수되었습니다`,
      _template: 'table',
      _captcha: 'false',
      email: applicantData.email,
      _replyto: applicantData.email,
      _autoresponse: '수장고 1기 파운딩 아티스트 지원서가 접수되었습니다. 11월 9일(월)에 이메일로 결과를 안내드릴게요. 문의: auth@sujango.com',
      '신청 접수 코드': applicantData.id || `FA-${Date.now()}`,
      '작가 활동명': applicantData.name || '',
      '작가 이메일': applicantData.email || '',
      '연락처': applicantData.phone || '(미입력)',
      '주 활동 분야': (applicantData.genres || []).join(', ') + (applicantData.genreOther ? ` (기타: ${applicantData.genreOther})` : ''),
      '활동 경력': applicantData.experience || '',
      '주요 활동 형태': (applicantData.activities || []).join(', '),
      '포트폴리오 / SNS': applicantData.portfolioUrl || '(미입력)',
      '창작 외 업무 고민 (Pain Point)': applicantData.painPoint || '',
      '현재 작품 보관 방식': (applicantData.currentStorage || []).join(', '),
      '써보고 싶은 기능': (applicantData.wantedFeatures || []).join(', '),
      '주 사용 기기': applicantData.primaryDevice || '',
      '성실 참여 동의': applicantData.canCommit || '',
      '공식 채널 작품 소개 희망': applicantData.promoConsent || '',
      '유입 경로': applicantData.referralSource || '' + (applicantData.referralOther ? ` (${applicantData.referralOther})` : ''),
      '접수 일시': new Date().toLocaleString('ko-KR')
    };

    const response = await fetch(FORM_SUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('[FormSubmit] Email notification result:', result);
    return { success: true, result };
  } catch (error) {
    console.warn('[FormSubmit] Email notification notice:', error);
    return { success: false, error: error.message };
  }
}
