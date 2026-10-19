import React, { useState } from 'react';
import { Copy, Check, Printer, Sparkles, FileText, UserCheck, Calculator, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DocStudio({ onBack }) {
  const [activeTab, setActiveTab] = useState('lecture'); // 'lecture' | 'cv' | 'invoice'
  const [copied, setCopied] = useState(false);

  // 1. 강의계획서 상태
  const [lectureForm, setLectureForm] = useState({
    courseName: '나만의 색을 찾는 현대 유화 & 아크릴 기초',
    target: '성인취미',
    duration: '4주',
    classTime: '매주 토요일 14:00 ~ 16:00', // 수업 시간대 (몇 시 수업인지)
    sessionMinutes: '120',
    materialsBudget: '25,000',
    genre: '서양화 (유화/아크릴)',
    instructorName: '김아라',
    goal: '색채 이론을 감각적으로 체득하고, 자신만의 캔버스 소품 1점을 완성하여 전시 경험을 갖는다.'
  });
  const [lectureResult, setLectureResult] = useState('');

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
    let curriculum = '';
    if (lectureForm.duration === '1회 특강') {
      curriculum = `• [1차시 - 단기완성 (120분)]\n  - 도입: 강사 소개, 오늘의 색채 테마 및 영감 공유 (15분)\n  - 전개: 젯소 및 아크릴 기본 블렌딩 테크닉 시연 후 개별 캔버스 스케치 & 채색 (85분)\n  - 정리: 작품 서명, 보호 바니시 작업 및 미니 갤러리 크리틱 소감 공유 (20분)`;
    } else if (lectureForm.duration === '4주') {
      curriculum = `• [1주차 - 붓과 안료의 호흡]\n  - 도입 및 오리엔테이션, 팔레트 조색 기법과 물감의 농도 감각 익히기\n  - 실습: 나만의 감정 컬러 차트 10선 만들기\n\n• [2주차 - 형태와 빛의 조화]\n  - 명암과 붓터치 텍스처를 활용한 소품 정물 라이브 페인팅\n  - 실습: 빛의 방향에 따른 면 분할 연습\n\n• [3주차 - 본작업: 캔버스 위에 펼치는 내면의 풍경]\n  - 4호 F 캔버스 본작업 착수, 밑작업 및 주요 레이어 적층 테크닉\n  - 개별 1:1 맞춤형 밀착 피드백\n\n• [4주차 - 완성 및 전시 크리틱]\n  - 디테일 묘사, 마감 바니시 도포, 작품 캡션 카드 작성\n  - 수강생 합동 미니 전시회 및 소회 나누기`;
    } else {
      curriculum = `• [1~2주차 - 기초 이론 및 매체 탐구]\n  - 재료의 물성과 기본 브러시 스트로크 마스터\n\n• [3~4주차 - 조형 원리와 콘셉트 스케치]\n  - 나만의 시각적 언어 구체화 및 에스키스 완성\n\n• [5~6주차 - 본작업 제작 및 레이어링]\n  - 대형 캔버스/조형 작업 및 개별 테크닉 코칭\n\n• [7~8주차 - 마감 기법 및 최종 프레젠테이션]\n  - 작품 완성, 포트폴리오 캡션 작성 및 상호 비평 워크숍`;
    }

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

3. 주차별 세부 커리큘럼
${curriculum}

4. 강의실 환경 및 준비물
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
      totalAmt = rawAmt - taxAmt; // 원천징수 후 실수령
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

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content, filename) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'document.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderActionButtons = (content, defaultFilename) => {
    if (!content) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button 
          className={`btn-subtle-copy ${copied ? 'copied' : ''}`}
          onClick={() => handleCopy(content)}
          title="클립보드 전체 복사"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.78rem' }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? '복사 완료!' : '복사'}</span>
        </button>
        <button 
          className="btn-subtle-copy"
          onClick={() => handleDownload(content, defaultFilename)}
          title="텍스트 파일로 저장"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.78rem' }}
        >
          <Download size={13} />
          <span>다운로드</span>
        </button>
        <button 
          className="btn-subtle-copy"
          onClick={() => window.print()}
          title="A4 용지 규격 인쇄 및 PDF 저장"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.78rem' }}
        >
          <Printer size={13} />
          <span>A4 인쇄 / PDF</span>
        </button>
      </div>
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

  return (
    <div className="workspace-wrapper">
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 전체 도구 목록으로
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => window.print()} className="btn-outline">
            <Printer size={15} /> A4 인쇄 / PDF 저장
          </button>
        </div>
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
          공모전 표준 약력(CV) 정리기
        </button>
        <button 
          className={`tab-btn ${activeTab === 'invoice' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoice')}
        >
          <Calculator size={16} style={{ display: 'inline', marginRight: '6px' }} />
          예술 작업 견적·청구서
        </button>
      </div>

      {/* 1. 강의계획서 탭 */}
      {activeTab === 'lecture' && (
        <div className="workspace-grid">
          <div className="panel-card no-print">
            <div className="panel-card-title">
              <span>강좌 정보 입력</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>교육청/문화재단 제출 규격</span>
            </div>

            <div className="form-group">
              <label className="form-label">강좌명</label>
              <input 
                type="text" 
                className="form-input" 
                value={lectureForm.courseName}
                onChange={(e) => setLectureForm({...lectureForm, courseName: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">교육 대상</label>
                <select 
                  className="form-select"
                  value={lectureForm.target}
                  onChange={(e) => setLectureForm({...lectureForm, target: e.target.value})}
                >
                  <option value="초등학생 (저/고학년)">초등학생</option>
                  <option value="청소년 (중/고등)">청소년</option>
                  <option value="성인취미">성인취미 / 직장인</option>
                  <option value="시니어 (실버 세대)">시니어 (어르신)</option>
                  <option value="전 연령 가족">전 연령 가족</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">교육 차시</label>
                <select 
                  className="form-select"
                  value={lectureForm.duration}
                  onChange={(e) => setLectureForm({...lectureForm, duration: e.target.value})}
                >
                  <option value="1회 특강">1회 원데이 특강</option>
                  <option value="4주">4주 정규 강좌</option>
                  <option value="8주">8주 심화 아카데미</option>
                  <option value="12주">12주 학기제 강좌</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>수업 시간 (요일 및 몇 시 수업인지)</label>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>예: 매주 토요일 14:00 ~ 16:00</span>
              </div>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 매주 토요일 14:00 ~ 16:00 (오후 2시 ~ 4시)"
                value={lectureForm.classTime}
                onChange={(e) => setLectureForm({...lectureForm, classTime: e.target.value})}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '0.45rem' }}>
                {[
                  '매주 토요일 14:00 ~ 16:00',
                  '평일 오전 10:00 ~ 12:00',
                  '평일 오후 14:00 ~ 16:00',
                  '평일 저녁 19:00 ~ 21:00',
                  '일요일 오전 10:30 ~ 12:30'
                ].map((timePreset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="tag-chip"
                    onClick={() => setLectureForm({...lectureForm, classTime: timePreset})}
                  >
                    + {timePreset}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">회당 시간 (분)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={lectureForm.sessionMinutes}
                  onChange={(e) => setLectureForm({...lectureForm, sessionMinutes: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">1인당 재료비 예산 (원)</label>
                <input 
                  type="text" 
                  className="form-input" 
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
                value={lectureForm.genre}
                onChange={(e) => setLectureForm({...lectureForm, genre: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">교육 목표 / 기획 의도</label>
              <textarea 
                className="form-textarea" 
                value={lectureForm.goal}
                onChange={(e) => setLectureForm({...lectureForm, goal: e.target.value})}
              />
            </div>

            <button className="btn-primary" onClick={generateLecturePlan}>
              <Sparkles size={16} /> 강의계획서 자동 생성
            </button>
          </div>

          <div className="panel-card printable">
            <div className="panel-card-title no-print">
              <span>완성된 강의계획서</span>
              {renderActionButtons(lectureResult, `${lectureForm.courseName || '강좌'}_강의계획서.txt`)}
            </div>

            {lectureResult && (
              <div className="print-tip-banner no-print">
                <span>💡 <strong>인쇄 팁:</strong> 인쇄 창 오른쪽 [설정]에서 <strong>'머리글 및 바닥글'</strong> 체크를 해제하시면 URL(localhost) 없이 수장고 공식 라벨만 정갈하게 출력됩니다.</span>
              </div>
            )}

            {lectureResult ? (
              <div className="output-box print-document-sheet">
                <div>{lectureResult}</div>
                <div className="print-official-doc-footer">
                  Sujango (수장고) | 창작자를 위한 프라이빗 디지털 수장고
                </div>
              </div>
            ) : (
              <div className="output-box" style={{ color: '#9CA3AF', textAlign: 'center', padding: '3rem 1rem' }}>
                좌측에서 강좌 정보를 확인한 후<br />
                <strong>[강의계획서 자동 생성]</strong> 버튼을 누르면 완성본이 여기에 나타납니다.
              </div>
            )}
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
                  value={cvForm.nameKo}
                  onChange={(e) => setCvForm({...cvForm, nameKo: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">영문 성명</label>
                <input 
                  type="text" 
                  className="form-input" 
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
                value={cvForm.education}
                onChange={(e) => setCvForm({...cvForm, education: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">개인전 (Solo Exhibitions)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                value={cvForm.solo}
                onChange={(e) => setCvForm({...cvForm, solo: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">주요 단체전 (Group Exhibitions)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                value={cvForm.group}
                onChange={(e) => setCvForm({...cvForm, group: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">수상 및 지원사업 (Awards & Grants)</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                value={cvForm.awards}
                onChange={(e) => setCvForm({...cvForm, awards: e.target.value})}
              />
            </div>

            <button className="btn-primary" onClick={formatCV}>
              <Sparkles size={16} /> 미술계 표준 포맷으로 정렬
            </button>
          </div>

          <div className="panel-card printable">
            <div className="panel-card-title no-print">
              <span>표준 작가 약력(CV) 출력본</span>
              {renderActionButtons(cvResult, `${cvForm.nameKo || '작가'}_표준약력_CV.txt`)}
            </div>

            {cvResult && (
              <div className="print-tip-banner no-print">
                <span>💡 <strong>인쇄 팁:</strong> 인쇄 창 오른쪽 [설정]에서 <strong>'머리글 및 바닥글'</strong> 체크를 해제하시면 URL(localhost) 없이 수장고 공식 라벨만 정갈하게 출력됩니다.</span>
              </div>
            )}

            {cvResult ? (
              <div className="output-box print-document-sheet">
                <div>{cvResult}</div>
                <div className="print-official-doc-footer">
                  Sujango (수장고) | 창작자를 위한 프라이빗 디지털 수장고
                </div>
              </div>
            ) : (
              <div className="output-box" style={{ color: '#9CA3AF', textAlign: 'center', padding: '3rem 1rem' }}>
                좌측의 이력을 입력하고<br />
                <strong>[미술계 표준 포맷으로 정렬]</strong> 버튼을 누르면 규격화된 약력이 생성됩니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 견적서/청구서 탭 */}
      {activeTab === 'invoice' && (
        <div className="workspace-grid">
          <div className="panel-card no-print">
            <div className="panel-card-title">
              <span>견적 및 청구 정보</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>A4 간이 서식</span>
            </div>

            <div className="form-group">
              <label className="form-label">수신처 (기관 또는 의뢰인)</label>
              <input 
                type="text" 
                className="form-input" 
                value={invoiceForm.client}
                onChange={(e) => setInvoiceForm({...invoiceForm, client: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">프로젝트 / 용역명</label>
              <input 
                type="text" 
                className="form-input" 
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
                value={invoiceForm.bankInfo}
                onChange={(e) => setInvoiceForm({...invoiceForm, bankInfo: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">비고 / 산출 근거</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px' }}
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
              />
            </div>

            <button className="btn-primary" onClick={generateInvoice}>
              <Sparkles size={16} /> 견적 및 청구서 생성
            </button>
          </div>

          <div className="panel-card printable">
            <div className="panel-card-title no-print">
              <span>완성된 견적·청구서</span>
              {renderActionButtons(invoiceResult, `${invoiceForm.projectName || '프로젝트'}_견적청구서.txt`)}
            </div>

            {invoiceResult && (
              <div className="print-tip-banner no-print">
                <span>💡 <strong>인쇄 팁:</strong> 인쇄 창 오른쪽 [설정]에서 <strong>'머리글 및 바닥글'</strong> 체크를 해제하시면 URL(localhost) 없이 수장고 공식 라벨만 정갈하게 출력됩니다.</span>
              </div>
            )}

            {invoiceResult ? (
              <div className="output-box print-document-sheet">
                <div>{invoiceResult}</div>
                <div className="print-official-doc-footer">
                  Sujango (수장고) | 창작자를 위한 프라이빗 디지털 수장고
                </div>
              </div>
            ) : (
              <div className="output-box" style={{ color: '#9CA3AF', textAlign: 'center', padding: '3rem 1rem' }}>
                좌측 금액 및 프로젝트 정보를 입력하고<br />
                <strong>[견적 및 청구서 생성]</strong> 버튼을 누르시면 출력됩니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
