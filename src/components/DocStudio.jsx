import React, { useState } from 'react';
import { Printer, Sparkles, FileText, UserCheck, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';

// 한글 금액 변환 헬퍼 (예: 1,160,400 -> 일백일십육만사백)
function numberToKorean(number) {
  const num = parseInt(String(number).replace(/[^0-9]/g, ''), 10);
  if (isNaN(num) || num === 0) return '영';
  const units = ['', '만', '억', '조'];
  const smallUnits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const tens = ['', '십', '백', '천'];
  
  let result = '';
  let unitIdx = 0;
  let temp = num;

  while (temp > 0) {
    const chunk = temp % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      let cTemp = chunk;
      for (let i = 0; i < 4; i++) {
        const digit = cTemp % 10;
        if (digit > 0) {
          chunkStr = smallUnits[digit] + tens[i] + chunkStr;
        }
        cTemp = Math.floor(cTemp / 10);
      }
      result = chunkStr + units[unitIdx] + ' ' + result;
    }
    temp = Math.floor(temp / 10000);
    unitIdx++;
  }
  return result.trim();
}

// 주차별 커리큘럼 데이터 생성 헬퍼
function getCurriculumList(duration) {
  if (duration === '1회 특강') {
    return [
      {
        week: '1차시 (120분)',
        theme: '감성 아크릴 소품 단기 완성',
        details: '• 도입: 강사 소개, 오늘의 색채 테마 및 영감 공유 (15분)\n• 전개: 젯소 및 아크릴 기본 블렌딩 테크닉 시연 후 개별 캔버스 스케치 & 채색 (85분)\n• 정리: 작품 서명, 보호 바니시 작업 및 미니 갤러리 크리틱 소감 공유 (20분)'
      }
    ];
  } else if (duration === '4주') {
    return [
      {
        week: '1주차',
        theme: '붓과 안료의 호흡',
        details: '• 도입 및 오리엔테이션, 팔레트 조색 기법과 물감의 농도 감각 익히기\n• [실습] 나만의 감정 컬러 차트 10선 만들기'
      },
      {
        week: '2주차',
        theme: '형태와 빛의 조화',
        details: '• 명암과 붓터치 텍스처를 활용한 소품 정물 라이브 페인팅\n• [실습] 빛의 방향에 따른 면 분할 연습'
      },
      {
        week: '3주차',
        theme: '본작업: 내면의 풍경',
        details: '• 4호 F 캔버스 본작업 착수, 밑작업 및 주요 레이어 적층 테크닉\n• [실습] 개별 1:1 맞춤형 밀착 피드백 코칭'
      },
      {
        week: '4주차',
        theme: '완성 및 전시 크리틱',
        details: '• 디테일 묘사, 마감 바니시 도포, 작품 캡션 카드 작성\n• [실습] 수강생 합동 미니 전시회 및 소회 나누기'
      }
    ];
  } else {
    return [
      {
        week: '1~2주차',
        theme: '기초 이론 및 매체 탐구',
        details: '• 재료의 물성과 기본 브러시 스트로크 마스터\n• [실습] 다양한 매체 블렌딩 기법 연구'
      },
      {
        week: '3~4주차',
        theme: '조형 원리와 콘셉트 스케치',
        details: '• 나만의 시각적 언어 구체화 및 에스키스 완성\n• [실습] 개인별 작품 기획서 피드백'
      },
      {
        week: '5~6주차',
        theme: '본작업 제작 및 레이어링',
        details: '• 대형 캔버스/조형 작업 및 개별 테크닉 코칭\n• [실습] 중첩 레이어 질감 표현'
      },
      {
        week: '7~8주차',
        theme: '마감 기법 및 최종 프레젠테이션',
        details: '• 작품 완성, 포트폴리오 캡션 작성 및 상호 비평 워크숍\n• [실습] 수강생 합동 미니 갤러리 전시'
      }
    ];
  }
}

// CV 이력 텍스트 파싱 헬퍼 (연도와 내역 분리)
function parseCvEntries(text) {
  if (!text) return [];
  return text.split('\n').filter(line => line.trim()).map(line => {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d{4})\s+(.+)$/);
    if (match) {
      return { year: match[1], text: match[2] };
    }
    return { year: '—', text: trimmed };
  });
}

// 직접 입력한 주차별 커리큘럼 텍스트 파싱 헬퍼
function parseCustomCurriculum(text, defaultDuration) {
  if (!text || !text.trim()) {
    return getCurriculumList(defaultDuration);
  }

  // 1. "1주차", "1차시", "[1주차]", "• 1주차" 등으로 분할 시도
  const blocks = text.split(/(?=(?:^|\n)\s*(?:[\[\(]?\d+[주차|차시|회차|강][\]\)]?|•\s*\[?\d+[주차|차시]))/g).filter(b => b.trim());

  if (blocks.length > 0) {
    return blocks.map((block, idx) => {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const firstLine = lines[0] || '';
      
      // 주차 라벨과 주제 분리 (예: "[1주차 - 붓과 안료의 호흡]" 또는 "1주차: 붓과 안료")
      const weekMatch = firstLine.match(/^[•\s\-\[\(]*(\d+[주차|차시|회차|강][^\]\)\:\-]*)[\:\-\]\)]?\s*(.*)$/);
      let week = `${idx + 1}주차`;
      let theme = firstLine;
      let details = lines.slice(1).join('\n');

      if (weekMatch) {
        week = weekMatch[1].trim();
        theme = weekMatch[2] ? weekMatch[2].replace(/^[\-\:\s]+/, '').trim() : `${idx + 1}주차 주제`;
        if (!theme && lines.length > 1) {
          theme = lines[1];
          details = lines.slice(2).join('\n');
        }
      }

      return {
        week: week || `${idx + 1}주차`,
        theme: theme || '강의 주제',
        details: details || lines.join('\n')
      };
    });
  }

  // 만약 주차 키워드가 없다면 줄바꿈 기준으로 단순 분할
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length > 0) {
    return lines.map((line, idx) => ({
      week: `${idx + 1}주차`,
      theme: line.replace(/^[•\-\*]\s*/, ''),
      details: '• 이론 및 맞춤형 개별 실습 지도'
    }));
  }

  return getCurriculumList(defaultDuration);
}

export default function DocStudio({ onBack }) {
  const [activeTab, setActiveTab] = useState('lecture'); // 'lecture' | 'cv' | 'invoice'
  const [copied, setCopied] = useState(false);

  // 1. 강의계획서 상태
  const [lectureForm, setLectureForm] = useState({
    courseName: '나만의 색을 찾는 현대 유화 & 아크릴 기초',
    target: '성인취미',
    duration: '4주',
    classTime: '매주 토요일 14:00 ~ 16:00',
    sessionMinutes: '120',
    materialsBudget: '25,000',
    genre: '서양화 (유화/아크릴)',
    instructorName: '김아라',
    goal: '색채 이론을 감각적으로 체득하고, 자신만의 캔버스 소품 1점을 완성하여 전시 경험을 갖는다.',
    customCurriculum: '' // 선택사항: 비워두면 계획서에서 커리큘럼 표가 완전히 제외됨 (1회성 강의 등)
  });
  const [lectureResult, setLectureResult] = useState('');

  // 현재 커리큘럼: 작가가 직접 입력하거나 템플릿을 불러왔을 때만 파싱하고, 비어있으면 빈 배열 (출력 제외)
  const hasCurriculum = Boolean(lectureForm.customCurriculum && lectureForm.customCurriculum.trim());
  const currentCurriculum = hasCurriculum
    ? parseCustomCurriculum(lectureForm.customCurriculum, lectureForm.duration)
    : [];

  // 표준 템플릿 텍스트 불러오기 핸들러
  const handleLoadDefaultCurriculum = () => {
    const list = getCurriculumList(lectureForm.duration);
    const text = list.map(item => `[${item.week} - ${item.theme}]\n${item.details}`).join('\n\n');
    setLectureForm(prev => ({ ...prev, customCurriculum: text }));
  };

  // 2. 이력서(CV) 상태
  const [cvForm, setCvForm] = useState({
    nameKo: '김아라',
    nameEn: 'Ara Kim',
    education: '2024 한국예술종합학교 조형예술과 졸업\n2020 서울예술고등학교 미술과 졸업',
    solo: '2025 《흔적과 여백》, 갤러리 아라, 서울\n2024 《침묵의 색》, 공간 봄, 서울',
    group: '2025 《신진작가 발굴전》, 세종문화회관, 서울\n2024 《경계의 시선들》, 부산시립미술관, 부산',
    awards: '2025 서울문화재단 청년예술지원 선정\n2024 대한민국 현대미술대전 우수상',
    collections: '국립현대미술관 미술은행 (2025)'
  });
  const [cvResult, setCvResult] = useState('');

  // 3. 견적서/청구서 상태
  const [invoiceForm, setInvoiceForm] = useState({
    client: '종로문화재단 문화사업팀',
    projectName: '2026 하반기 시민 예술 아카데미 출강 및 워크숍 용역',
    date: new Date().toISOString().split('T')[0],
    amount: '1,200,000',
    taxType: '3.3%', // '3.3%' | '10%' | 'none'
    bankInfo: '카카오뱅크 3333-01-1234567 (예금주: 김아라)',
    notes: '본 견적은 재료비 및 강의 교안 제작비가 포함된 금액입니다.'
  });
  const [invoiceResult, setInvoiceResult] = useState('');

  // 강의계획서 생성 로직
  const generateLecturePlan = () => {
    let curriculumBlock = '';
    if (hasCurriculum && currentCurriculum.length > 0) {
      const curriculumText = currentCurriculum.map(item => `• [${item.week} - ${item.theme}]\n${item.details}`).join('\n\n');
      curriculumBlock = `\n3. 주차별 세부 커리큘럼\n${curriculumText}\n`;
    }

    const envSectionNum = hasCurriculum ? '4' : '3';

    const docText = `[출강 강의계획서]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 강좌 기본 정보
• 강좌명: ${lectureForm.courseName}
• 예술 장르: ${lectureForm.genre}
• 교육 대상: ${lectureForm.target}
• 수업 시간: ${lectureForm.classTime || '협의 후 결정 (예: 매주 토요일 14:00 ~ 16:00)'}
• 총 교육 기간: ${lectureForm.duration} (회당 ${lectureForm.sessionMinutes}분)
• 1인당 재료비: ${lectureForm.materialsBudget}원
• 담당 강사: ${lectureForm.instructorName}

2. 교육 목표
${lectureForm.goal}
${curriculumBlock}
${envSectionNum}. 강의실 환경 및 준비물
• 강사 준비: 시연용 도구, 교안 유인물, 특수 보조제
• 기관/수강생 준비: 캔버스, 기본 붓 세트, 물통, 앞치마
• 안전 수칙: 환기 시설 확보, 유화 테레핀/페트롤 사용 시 폐액 밀폐 처리 준수
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
작성일: ${new Date().toLocaleDateString('ko-KR')} / 작성자: ${lectureForm.instructorName}`;

    setLectureResult(docText);
    triggerConfetti();
  };

  // CV 포맷터 로직
  const formatCV = () => {
    const cvText = `CURRICULUM VITAE (작가 표준 약력)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[기본 정보]
성명: ${cvForm.nameKo} (${cvForm.nameEn})

[학력 (Education)]
${cvForm.education.trim()}

[개인전 (Solo Exhibitions)]
${cvForm.solo.trim()}

[주요 단체전 (Group Exhibitions)]
${cvForm.group.trim()}

[수상 및 지원사업 선정 (Awards & Grants)]
${cvForm.awards.trim()}

[작품 소장 및 레지던시 (Collections & Residencies)]
${cvForm.collections.trim()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
* 한국미술협회 및 주요 국공립 미술관 표준 심사 포맷 적용됨`;

    setCvResult(cvText);
    triggerConfetti();
  };

  // 견적서 생성 로직
  const generateInvoice = () => {
    const rawAmt = parseInt(invoiceForm.amount.replace(/[^0-9]/g, '')) || 0;
    let taxAmt = 0;
    let totalAmt = rawAmt;
    let taxLabel = '';

    if (invoiceForm.taxType === '3.3%') {
      taxAmt = Math.round(rawAmt * 0.033);
      totalAmt = rawAmt - taxAmt;
      taxLabel = `원천징수세액 (소득세 3% + 지방소득세 0.3%): -${taxAmt.toLocaleString()}원`;
    } else if (invoiceForm.taxType === '10%') {
      taxAmt = Math.round(rawAmt * 0.1);
      totalAmt = rawAmt + taxAmt;
      taxLabel = `부가가치세 (10%): +${taxAmt.toLocaleString()}원`;
    } else {
      taxLabel = '세액 공제 없음 (비과세)';
    }

    const invoiceText = `[예술 작업 견적 및 비용 청구서]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 수신(의뢰처): ${invoiceForm.client} 귀하
• 견적/청구일자: ${invoiceForm.date}
• 프로젝트명: ${invoiceForm.projectName}

[금액 산출 내역]
1. 공급가액: ${rawAmt.toLocaleString()}원
2. ${taxLabel}
────────────────────────────────────────
★ ${invoiceForm.taxType === '3.3%' ? '최종 실수령 입금액' : '최종 청구 총액'}: ${totalAmt.toLocaleString()}원
────────────────────────────────────────

[입금 계좌]
• ${invoiceForm.bankInfo}

[특이사항 및 비고]
• ${invoiceForm.notes}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
위와 같이 성실히 작업을 수행함을 확인하며 견적/청구합니다.`;

    setInvoiceResult(invoiceText);
    triggerConfetti();
  };

  // 브라우저 머릿글 노출을 방지하고 깔끔하게 인쇄하는 핸들러
  const handlePrintDoc = () => {
    const originalTitle = document.title;
    document.title = ' '; // 공백으로 설정하여 브라우저 헤더의 Sujango 서비스명 인쇄 차단
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const renderActionButtons = () => {
    return (
      <button 
        className="btn-primary"
        onClick={handlePrintDoc}
        title="A4 공문서 규격 인쇄 및 PDF 저장"
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '6px', 
          padding: '6px 14px', 
          width: 'auto',
          fontSize: '0.82rem', 
          background: '#0F172A', 
          color: '#FFFFFF', 
          fontWeight: 600, 
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        <Printer size={14} />
        <span>A4 인쇄 / PDF 저장</span>
      </button>
    );
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0F172A', '#64748B', '#059669']
      });
    } catch (e) {
      // ignore
    }
  };

  // 견적서 계산값
  const invoiceRawAmt = parseInt(invoiceForm.amount.replace(/[^0-9]/g, '')) || 0;
  const invoiceTaxAmt = invoiceForm.taxType === '3.3%' 
    ? Math.round(invoiceRawAmt * 0.033) 
    : invoiceForm.taxType === '10%' 
      ? Math.round(invoiceRawAmt * 0.1) 
      : 0;
  const invoiceTotalAmt = invoiceForm.taxType === '3.3%' 
    ? invoiceRawAmt - invoiceTaxAmt 
    : invoiceForm.taxType === '10%' 
      ? invoiceRawAmt + invoiceTaxAmt 
      : invoiceRawAmt;

  // CV 파싱 항목들
  const parsedEducation = parseCvEntries(cvForm.education);
  const parsedSolo = parseCvEntries(cvForm.solo);
  const parsedGroup = parseCvEntries(cvForm.group);
  const parsedAwards = parseCvEntries(cvForm.awards);

  return (
    <div className="workspace-wrapper">
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 전체 도구 목록으로
        </button>
      </div>

      <div className="workspace-title-area no-print" style={{ marginBottom: '1.5rem' }}>
        <h2>서류·출강 스튜디오</h2>
        <p>복잡한 행정 서류 양식 때문에 지치지 마세요. 기관과 미술관이 원하는 공문서 규격으로 단정하게 정리해 드립니다.</p>
      </div>

      {/* 내부 탭 내비게이션 */}
      <div className="tab-nav no-print">
        <button 
          className={`tab-btn ${activeTab === 'lecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('lecture')}
        >
          <FileText size={16} style={{ display: 'inline', marginRight: '6px' }} />
          출강 강의계획서 생성기
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cv' ? 'active' : ''}`}
          onClick={() => setActiveTab('cv')}
        >
          <UserCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
          작가 프로필 (CV) 정리기
        </button>
        <button 
          className={`tab-btn ${activeTab === 'invoice' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoice')}
        >
          <Calculator size={16} style={{ display: 'inline', marginRight: '6px' }} />
          작업 견적서 · 청구서 생성기
        </button>
      </div>

      {/* 1. 강의계획서 탭 */}
      {activeTab === 'lecture' && (
        <div className="workspace-grid">
          {/* 좌측 입력 폼 */}
          <div className="panel-card no-print">
            <div className="panel-card-title">
              <span>강좌 기본 정보 입력</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>기관 제출용 표준 서식</span>
            </div>

            <div className="form-group">
              <label className="form-label">강좌명</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 나만의 색을 찾는 현대 유화 & 아크릴 기초"
                value={lectureForm.courseName}
                onChange={(e) => setLectureForm({...lectureForm, courseName: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">담당 강사명</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 김아라"
                  value={lectureForm.instructorName}
                  onChange={(e) => setLectureForm({...lectureForm, instructorName: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">교육 대상</label>
                <select 
                  className="form-select"
                  value={lectureForm.target}
                  onChange={(e) => setLectureForm({...lectureForm, target: e.target.value})}
                >
                  <option value="성인취미">성인 취미 / 일반 시민</option>
                  <option value="아동·청소년">아동 · 청소년</option>
                  <option value="시니어">시니어 / 액티브 시니어</option>
                  <option value="예술전공생">예비 예술인 / 미술 전공생</option>
                  <option value="기업·기관임직원">기업 및 공공기관 임직원 워크숍</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">교육 차시</label>
                <select 
                  className="form-select"
                  value={lectureForm.duration}
                  onChange={(e) => setLectureForm({...lectureForm, duration: e.target.value})}
                >
                  <option value="1회 특강">1회 원데이 특강 (2시간 단기완성)</option>
                  <option value="4주">4주 완성 기초 코스 (주 1회)</option>
                  <option value="8주">8주 심화 마스터 코스 (주 1회)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">수업 시간대</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 매주 토요일 14:00 ~ 16:00"
                  value={lectureForm.classTime}
                  onChange={(e) => setLectureForm({...lectureForm, classTime: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">회당 시간 (분)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 120"
                  value={lectureForm.sessionMinutes}
                  onChange={(e) => setLectureForm({...lectureForm, sessionMinutes: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">1인당 재료비 예산 (원)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 25,000"
                  value={lectureForm.materialsBudget}
                  onChange={(e) => setLectureForm({...lectureForm, materialsBudget: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">장르 / 매체</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 서양화 (유화/아크릴)"
                value={lectureForm.genre}
                onChange={(e) => setLectureForm({...lectureForm, genre: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">교육 목표 / 기획 의도</label>
              <textarea 
                className="form-textarea" 
                placeholder="예: 색채 이론을 감각적으로 체득하고, 자신만의 캔버스 소품 1점을 완성하여 전시 경험을 갖는다."
                value={lectureForm.goal}
                onChange={(e) => setLectureForm({...lectureForm, goal: e.target.value})}
              />
            </div>

            {/* 주차별 세부 커리큘럼 (선택사항 - 미입력 시 표준 자동 적용) */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  주차별 세부 커리큘럼 <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>(선택사항)</span>
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={handleLoadDefaultCurriculum}
                    className="tag-chip"
                    style={{ fontSize: '0.74rem', padding: '2px 8px', background: '#F1F5F9', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                    title="현재 선택된 교육 차시의 표준 커리큘럼을 불러와서 수정합니다"
                  >
                    ⚡ 표준 커리큘럼 불러오기
                  </button>
                  {lectureForm.customCurriculum && (
                    <button
                      type="button"
                      onClick={() => setLectureForm({ ...lectureForm, customCurriculum: '' })}
                      className="tag-chip"
                      style={{ fontSize: '0.74rem', padding: '2px 8px', color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer' }}
                      title="직접 입력을 지우고 자동 추천 템플릿으로 되돌립니다"
                    >
                      비우기
                    </button>
                  )}
                </div>
              </div>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '115px', fontSize: '0.83rem', lineHeight: 1.55 }}
                placeholder={`입력하지 않으시면 계획서에서 커리큘럼 항목이 완전히 제외됩니다.\n(1회성 특강 및 단기 출강 시 깔끔한 1페이지 문서로 출력)\n\n주차별 커리큘럼을 넣으시려면 상단 [⚡ 표준 커리큘럼 불러오기]를 누르시거나 직접 작성하세요.`}
                value={lectureForm.customCurriculum}
                onChange={(e) => setLectureForm({...lectureForm, customCurriculum: e.target.value})}
              />
            </div>

            <button className="btn-primary" onClick={generateLecturePlan}>
              <Sparkles size={16} /> 강의계획서 서식 갱신
            </button>
          </div>

          {/* 우측 공문서 서식 뷰 (화면 & 인쇄 동시 적용) */}
          <div className="panel-card printable" style={{ background: '#F8FAFC', padding: '1.25rem' }}>
            <div className="panel-card-title no-print" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>완성된 강의계획서 미리보기</span>
              {renderActionButtons()}
            </div>

            {/* 정식 공문서 폼 컴포넌트 */}
            <div className="official-doc-container">
              {/* 상단 공문서 타이틀 */}
              <div className="official-doc-header">
                <h3 className="official-doc-title">출 강 강 의 계 획 서</h3>
              </div>

              {/* 1. 강좌 기본 정보 */}
              <div className="doc-section-title">
                <span className="doc-section-num">1</span>
                <span>강좌 기본 정보</span>
              </div>
              <table className="doc-form-table">
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '32%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '32%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th>강 좌 명</th>
                    <td colSpan={3} style={{ fontWeight: 700, fontSize: '0.94rem' }}>
                      {lectureForm.courseName || '미입력'}
                    </td>
                  </tr>
                  <tr>
                    <th>예술 장르</th>
                    <td>{lectureForm.genre || '미입력'}</td>
                    <th>교육 대상</th>
                    <td>{lectureForm.target || '미입력'}</td>
                  </tr>
                  <tr>
                    <th>수업 시간</th>
                    <td>{lectureForm.classTime || '협의 후 결정'}</td>
                    <th>총 교육 기간</th>
                    <td>{lectureForm.duration} (회당 {lectureForm.sessionMinutes || 120}분)</td>
                  </tr>
                  <tr>
                    <th>1인당 재료비</th>
                    <td>
                      {lectureForm.materialsBudget 
                        ? `${parseInt(String(lectureForm.materialsBudget).replace(/[^0-9]/g, '') || 0).toLocaleString()}원` 
                        : '협의'}
                    </td>
                    <th>담당 강사</th>
                    <td>
                      <span style={{ fontWeight: 600 }}>{lectureForm.instructorName || '강사'}</span>
                      <span className="doc-stamp-circle" style={{ marginLeft: '8px' }}>인</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 2. 교육 목표 */}
              <div className="doc-section-title">
                <span className="doc-section-num">2</span>
                <span>교육 목표</span>
              </div>
              <div className="doc-box-highlight">
                {lectureForm.goal || '색채 이론을 감각적으로 체득하고, 자신만의 캔버스 소품 1점을 완성하여 전시 경험을 갖는다.'}
              </div>

              {/* 3. 주차별 세부 커리큘럼 (입력 시에만 출력) */}
              {hasCurriculum && currentCurriculum.length > 0 && (
                <>
                  <div className="doc-section-title">
                    <span className="doc-section-num">3</span>
                    <span>주차별 세부 커리큘럼</span>
                  </div>
                  <table className="doc-form-table">
                    <colgroup>
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '56%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>주차 / 차시</th>
                        <th>강의 주제</th>
                        <th>세부 교육 및 실습 내용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCurriculum.map((item, idx) => (
                        <tr key={idx}>
                          <td className="center" style={{ fontWeight: 700, color: '#334155' }}>{item.week}</td>
                          <td style={{ fontWeight: 600 }}>{item.theme}</td>
                          <td style={{ whiteSpace: 'pre-line', fontSize: '0.83rem', lineHeight: 1.55 }}>
                            {item.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* 4. 강의실 환경 및 준비물 (커리큘럼 유무에 따라 번호 자동 조정) */}
              <div className="doc-section-title">
                <span className="doc-section-num">{hasCurriculum ? 4 : 3}</span>
                <span>강의 환경 및 준비물</span>
              </div>
              <table className="doc-form-table">
                <colgroup>
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '78%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th>강사 준비물</th>
                    <td>시연용 도구, 교안 유인물, 특수 보조제</td>
                  </tr>
                  <tr>
                    <th>기관 / 수강생 준비</th>
                    <td>캔버스, 기본 붓 세트, 물통, 앞치마</td>
                  </tr>
                  <tr>
                    <th>안전 및 관리 수칙</th>
                    <td style={{ color: '#475569', fontSize: '0.82rem' }}>
                      환기 시설 확보 필수, 유화 테레핀/페트롤 사용 시 폐액 밀폐 보관 및 전용 용기 수거 준수
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 하단 서명부 */}
              <div className="doc-sign-area">
                <div className="doc-sign-confirm-text">
                  위와 같이 문화예술 교육 출강 강의계획서를 성실히 작성하여 제출합니다.
                </div>
                <div className="doc-sign-date">
                  {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="doc-sign-name">
                  작성자 (담당 강사) : <span>{lectureForm.instructorName || '강사'}</span>
                  <span className="doc-stamp-circle">인</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CV 약력 정리기 탭 */}
      {activeTab === 'cv' && (
        <div className="workspace-grid">
          <div className="panel-card no-print">
            <div className="panel-card-title">
              <span>작가 이력 정보</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>최신순으로 줄바꿈 입력</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">국문 성명</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 김아라"
                  value={cvForm.nameKo}
                  onChange={(e) => setCvForm({...cvForm, nameKo: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">영문 성명</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: Ara Kim"
                  value={cvForm.nameEn}
                  onChange={(e) => setCvForm({...cvForm, nameEn: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">학력 (Education)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                placeholder="예: 2024 한국예술종합학교 조형예술과 졸업"
                value={cvForm.education}
                onChange={(e) => setCvForm({...cvForm, education: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">개인전 (Solo Exhibitions)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                placeholder="예: 2025 《흔적과 여백》, 갤러리 아라, 서울"
                value={cvForm.solo}
                onChange={(e) => setCvForm({...cvForm, solo: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">주요 단체전 (Group Exhibitions)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                placeholder="예: 2025 《신진작가 발굴전》, 세종문화회관, 서울"
                value={cvForm.group}
                onChange={(e) => setCvForm({...cvForm, group: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">수상 및 지원사업 (Awards & Grants)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                placeholder="예: 2025 서울문화재단 청년예술지원 선정"
                value={cvForm.awards}
                onChange={(e) => setCvForm({...cvForm, awards: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">작품 소장 및 레지던시 (Collections & Residencies)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '60px' }}
                placeholder="예: 국립현대미술관 미술은행 (2025)"
                value={cvForm.collections}
                onChange={(e) => setCvForm({...cvForm, collections: e.target.value})}
              />
            </div>

            <button className="btn-primary" onClick={formatCV}>
              <Sparkles size={16} /> 미술계 표준 포맷으로 정렬
            </button>
          </div>

          <div className="panel-card printable" style={{ background: '#F8FAFC', padding: '1.25rem' }}>
            <div className="panel-card-title no-print" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>작가 프로필(CV) 표준 서식 미리보기</span>
              {renderActionButtons()}
            </div>

            {/* 정식 CV 서식 뷰 */}
            <div className="official-doc-container">
              {/* 상단 프로필 헤더 */}
              <div className="official-doc-header" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div className="official-doc-badge">ARTIST CURRICULUM VITAE</div>
                  <h3 className="official-doc-title" style={{ fontSize: '1.5rem', letterSpacing: '1px' }}>
                    {cvForm.nameKo || '작가명'} <span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#475569' }}>({cvForm.nameEn || 'Artist'})</span>
                  </h3>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', textAlign: 'right' }}>
                  한국미술협회 표준 심사 서식<br />
                  최종 갱신: {new Date().toLocaleDateString('ko-KR')}
                </div>
              </div>

              {/* 1. 학력 */}
              {parsedEducation.length > 0 && (
                <>
                  <div className="doc-section-title">
                    <span className="doc-section-num">1</span>
                    <span>학력 (Education)</span>
                  </div>
                  <table className="doc-form-table">
                    <colgroup>
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '84%' }} />
                    </colgroup>
                    <tbody>
                      {parsedEducation.map((item, idx) => (
                        <tr key={idx}>
                          <td className="center" style={{ fontWeight: 700, color: '#334155' }}>{item.year}</td>
                          <td>{item.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* 2. 개인전 */}
              {parsedSolo.length > 0 && (
                <>
                  <div className="doc-section-title">
                    <span className="doc-section-num">2</span>
                    <span>개인전 (Solo Exhibitions)</span>
                  </div>
                  <table className="doc-form-table">
                    <colgroup>
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '84%' }} />
                    </colgroup>
                    <tbody>
                      {parsedSolo.map((item, idx) => (
                        <tr key={idx}>
                          <td className="center" style={{ fontWeight: 700, color: '#334155' }}>{item.year}</td>
                          <td style={{ fontWeight: 500 }}>{item.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* 3. 주요 단체전 */}
              {parsedGroup.length > 0 && (
                <>
                  <div className="doc-section-title">
                    <span className="doc-section-num">3</span>
                    <span>주요 단체전 (Group Exhibitions)</span>
                  </div>
                  <table className="doc-form-table">
                    <colgroup>
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '84%' }} />
                    </colgroup>
                    <tbody>
                      {parsedGroup.map((item, idx) => (
                        <tr key={idx}>
                          <td className="center" style={{ fontWeight: 700, color: '#334155' }}>{item.year}</td>
                          <td>{item.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* 4. 수상 및 지원사업 */}
              {parsedAwards.length > 0 && (
                <>
                  <div className="doc-section-title">
                    <span className="doc-section-num">4</span>
                    <span>수상 및 지원사업 선정 (Awards & Grants)</span>
                  </div>
                  <table className="doc-form-table">
                    <colgroup>
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '84%' }} />
                    </colgroup>
                    <tbody>
                      {parsedAwards.map((item, idx) => (
                        <tr key={idx}>
                          <td className="center" style={{ fontWeight: 700, color: '#334155' }}>{item.year}</td>
                          <td>{item.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* 5. 작품 소장 및 레지던시 */}
              {cvForm.collections && (
                <>
                  <div className="doc-section-title">
                    <span className="doc-section-num">5</span>
                    <span>작품 소장 및 레지던시 (Collections & Residencies)</span>
                  </div>
                  <div className="doc-box-highlight" style={{ fontSize: '0.85rem' }}>
                    {cvForm.collections}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. 견적서/청구서 탭 */}
      {activeTab === 'invoice' && (
        <div className="workspace-grid">
          <div className="panel-card no-print">
            <div className="panel-card-title">
              <span>견적 및 청구 정보</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>A4 공식 인보이스 서식</span>
            </div>

            <div className="form-group">
              <label className="form-label">수신처 (기관 또는 의뢰인)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 종로문화재단 문화사업팀"
                value={invoiceForm.client}
                onChange={(e) => setInvoiceForm({...invoiceForm, client: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">프로젝트 / 용역명</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 2026 하반기 시민 예술 아카데미 출강 및 워크숍 용역"
                value={invoiceForm.projectName}
                onChange={(e) => setInvoiceForm({...invoiceForm, projectName: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">공급가액 (원)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 1,200,000"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">세액 구분</label>
                <select 
                  className="form-select"
                  value={invoiceForm.taxType}
                  onChange={(e) => setInvoiceForm({...invoiceForm, taxType: e.target.value})}
                >
                  <option value="3.3%">프리랜서 원천징수 (3.3% 공제)</option>
                  <option value="10%">사업자 부가가치세 (10% 가산)</option>
                  <option value="none">비과세 / 공제 없음</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">입금 계좌번호</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 카카오뱅크 3333-01-1234567 (예금주: 김아라)"
                value={invoiceForm.bankInfo}
                onChange={(e) => setInvoiceForm({...invoiceForm, bankInfo: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">비고 / 산출 근거</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                placeholder="예: 본 견적은 재료비 및 강의 교안 제작비가 포함된 금액입니다."
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
              />
            </div>

            <button className="btn-primary" onClick={generateInvoice}>
              <Sparkles size={16} /> 견적 및 청구서 서식 갱신
            </button>
          </div>

          <div className="panel-card printable" style={{ background: '#F8FAFC', padding: '1.25rem' }}>
            <div className="panel-card-title no-print" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>완성된 견적·청구서 미리보기</span>
              {renderActionButtons()}
            </div>

            {/* 정식 견적서 폼 컴포넌트 */}
            <div className="official-doc-container">
              {/* 상단 공문서 타이틀 */}
              <div className="official-doc-header">
                <h3 className="official-doc-title">견 적 및 청 구 서</h3>
              </div>

              {/* 공급받는자 / 공급자 2분할 표 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '1rem' }}>
                {/* 공급받는 자 (수신처) */}
                <table className="doc-form-table" style={{ margin: 0 }}>
                  <tbody>
                    <tr>
                      <th style={{ width: '28%' }}>수 신</th>
                      <td style={{ fontWeight: 700 }}>{invoiceForm.client || '귀하'}</td>
                    </tr>
                    <tr>
                      <th>건 명</th>
                      <td style={{ fontSize: '0.82rem' }}>{invoiceForm.projectName || '용역 프로젝트'}</td>
                    </tr>
                    <tr>
                      <th>청구일자</th>
                      <td>{invoiceForm.date}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 공급자 (작가) */}
                <table className="doc-form-table" style={{ margin: 0 }}>
                  <tbody>
                    <tr>
                      <th style={{ width: '28%' }}>공급자</th>
                      <td>
                        <span style={{ fontWeight: 700 }}>김아라</span>
                        <span className="doc-stamp-circle" style={{ marginLeft: '6px' }}>인</span>
                      </td>
                    </tr>
                    <tr>
                      <th>입금계좌</th>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{invoiceForm.bankInfo || '계좌 정보'}</td>
                    </tr>
                    <tr>
                      <th>세액구분</th>
                      <td style={{ fontSize: '0.8rem' }}>
                        {invoiceForm.taxType === '3.3%' ? '프리랜서 원천징수 (3.3%)' : invoiceForm.taxType === '10%' ? '일반 과세 (10%)' : '비과세'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 청구 총액 강조 배너 */}
              <div className="invoice-total-banner">
                <span style={{ fontSize: '0.88rem', color: '#334155' }}>
                  {invoiceForm.taxType === '3.3%' ? '최종 실수령 입금액 (원천징수 차감 후)' : '최종 청구 총액'}
                </span>
                <span style={{ fontSize: '1.15rem', color: '#0F172A' }}>
                  일금 <strong style={{ textDecoration: 'underline' }}>{numberToKorean(invoiceTotalAmt)}</strong> 원정
                  <span style={{ marginLeft: '8px', fontSize: '1.05rem', color: '#0284C7' }}>
                    (₩{invoiceTotalAmt.toLocaleString()})
                  </span>
                </span>
              </div>

              {/* 금액 산출 세부 내역 표 */}
              <div className="doc-section-title">
                <span className="doc-section-num">1</span>
                <span>상세 산출 내역</span>
              </div>
              <table className="doc-form-table">
                <colgroup>
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '42%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>순번</th>
                    <th>품목 / 프로젝트 내역</th>
                    <th>수량</th>
                    <th>공급가액</th>
                    <th>세액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="center">1</td>
                    <td style={{ fontWeight: 600 }}>{invoiceForm.projectName}</td>
                    <td className="center">1 식</td>
                    <td className="right">{invoiceRawAmt.toLocaleString()}원</td>
                    <td className="right" style={{ color: invoiceForm.taxType === '3.3%' ? '#DC2626' : '#2563EB', fontWeight: 600 }}>
                      {invoiceForm.taxType === '3.3%' 
                        ? `-${invoiceTaxAmt.toLocaleString()}원 (3.3%)` 
                        : invoiceForm.taxType === '10%' 
                          ? `+${invoiceTaxAmt.toLocaleString()}원 (10%)` 
                          : '0원'}
                    </td>
                  </tr>
                  <tr style={{ background: '#F8FAFC', fontWeight: 700 }}>
                    <td colSpan={3} className="center">합 계</td>
                    <td className="right">{invoiceRawAmt.toLocaleString()}원</td>
                    <td className="right" style={{ color: '#0F172A' }}>
                      {invoiceTotalAmt.toLocaleString()}원
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 특이사항 및 비고 */}
              <div className="doc-section-title">
                <span className="doc-section-num">2</span>
                <span>특이사항 및 비고</span>
              </div>
              <div className="doc-box-highlight" style={{ fontSize: '0.84rem' }}>
                • {invoiceForm.notes || '본 견적은 재료비 및 강의 교안 제작비가 포함된 금액입니다.'}<br />
                • 입금 시 상기 명시된 계좌로 입금해 주시기 바랍니다.
              </div>

              {/* 하단 서명부 */}
              <div className="doc-sign-area">
                <div className="doc-sign-confirm-text">
                  위와 같이 성실히 작업을 수행함을 확인하며 견적 및 비용을 청구합니다.
                </div>
                <div className="doc-sign-date">{invoiceForm.date}</div>
                <div className="doc-sign-name">
                  청구인 (공급자) : <span>김아라</span>
                  <span className="doc-stamp-circle">인</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
