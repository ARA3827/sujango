import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Gift, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Users,
  Lock,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitFoundingApplication } from '../utils/supabaseClient';

const STORAGE_KEY = 'sujango_founding_applicants';
const HIDE_UNTIL_KEY = 'sujango_hide_founding_modal_until';

export default function FoundingArtistModal({ isOpen, onClose }) {
  const [step, setStep] = useState('notice'); // 'notice' | 'apply' | 'success'
  const [dontShowToday, setDontShowToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 신청 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    genres: [],
    genreOther: '',
    experience: '1~3년',
    activities: [],
    portfolioUrl: '',
    painPoint: '',
    currentStorage: [],
    wantedFeatures: [],
    primaryDevice: '둘 다 비슷하게 사용',
    canCommit: '네, 성실히 참여하겠습니다.',
    promoConsent: '네, 작품과 작가 소개를 희망합니다.',
    referralSource: '인스타그램',
    referralOther: '',
    privacyConsent: false,
    overFourteen: false,
    marketingConsent: false
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('notice');
      setFormError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 닫기 처리 (오늘 하루 보지 않기 반영)
  const handleClose = () => {
    if (dontShowToday) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      localStorage.setItem(HIDE_UNTIL_KEY, tomorrow.getTime().toString());
    }
    onClose();
  };

  // 체크박스 다중 선택 핸들러
  const handleCheckboxToggle = (field, value) => {
    setFormData(prev => {
      const list = prev[field] || [];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter(item => item !== value) };
      } else {
        // wantedFeatures는 최대 3개 제한
        if (field === 'wantedFeatures' && list.length >= 3) {
          alert('가장 먼저 써보고 싶은 기능은 최대 3개까지만 선택 가능합니다.');
          return prev;
        }
        return { ...prev, [field]: [...list, value] };
      }
    });
  };

  // 신청서 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // 필수 유효성 검증
    if (!formData.name.trim()) {
      setFormError('작가 활동명(성함)을 입력해 주세요.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (formData.genres.length === 0) {
      setFormError('주 활동 분야를 최소 하나 이상 선택해 주세요.');
      return;
    }
    if (!formData.painPoint.trim()) {
      setFormError('창작 외 번거로웠던 업무 고민을 1줄 이상 적어주세요.');
      return;
    }
    if (!formData.privacyConsent || !formData.overFourteen) {
      setFormError('필수 개인정보 수집 동의 및 만 14세 이상 확인에 체크해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const applicantRecord = {
        ...formData,
        id: `applicant-${Date.now()}`,
        appliedAt: new Date().toISOString()
      };

      // 1. Supabase 클라우드 데이터베이스 실시간 저장 시도
      try {
        await submitFoundingApplication(applicantRecord);
      } catch (cloudErr) {
        console.warn('[Founding] Cloud sync notice:', cloudErr);
      }

      // 2. 로컬스토리지 백업 보관
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.unshift(applicantRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

      // 3. 축하 폭죽 발사
      try {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0F172A', '#D97706', '#2563EB', '#10B981']
        });
      } catch (err) {}

      setIsSubmitting(false);
      setStep('success');
    } catch (err) {
      console.error('Failed to save applicant:', err);
      setIsSubmitting(false);
      setFormError('접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} style={{ zIndex: 99999, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: step === 'apply' ? '680px' : '620px', 
          width: '100%', 
          maxHeight: '90vh',
          background: '#FFFFFF', 
          borderRadius: '18px', 
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #E2E8F0',
          position: 'relative'
        }}
      >
        {/* 모달 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', background: '#0F172A', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              공식 모집
            </span>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              수장고 1기 파운딩 아티스트
            </h3>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            className="modal-close-btn" 
            aria-label="닫기"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 모달 본문 영역 (스크롤 지원) */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1, fontSize: '0.92rem', color: '#334155', lineHeight: 1.65 }}>
          
          {/* ========================================================
              [STEP 1] 공지사항 상세 뷰 (notice)
             ======================================================== */}
          {step === 'notice' && (
            <div>
              {/* 메인 타이틀 */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>
                  "더 편리한 창작 환경을 함께 빚어갈 50분의 작가님을 모십니다."
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
                  수장고(Sujango)는 홀로 창작과 행정을 도맡는 예술가를 위한 디지털 작업실입니다.<br />
                  세심한 소통을 위해 <strong>총 50분의 작가님을 1차와 2차로 나누어 순차적으로 맞이합니다.</strong>
                </p>
              </div>

              {/* 1차 / 2차 순차 시작 배너 */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  <Calendar size={17} color="#2563EB" />
                  <span>모집 및 2단계 순차 시작 일정</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>[1차 그룹] 25명</div>
                    <div style={{ color: '#2563EB', fontWeight: 600 }}>11월 10일(화) 시작</div>
                    <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '3px' }}>수장고의 뼈대를 함께 맞추어갈 그룹</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>[2차 그룹] 25명</div>
                    <div style={{ color: '#059669', fontWeight: 600 }}>11월 24일(화) 시작</div>
                    <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '3px' }}>1차 피드백을 반영해 안정화된 그룹</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '8px' }}>
                  • 모집: 10월 25일(일) ~ 11월 7일(토) · 발표: 11월 9일(월) 이메일 안내<br />
                  • 활동 기간은 각 그룹 시작일로부터 8주간 동일하게 보장됩니다.
                </div>
              </div>

              {/* 4대 실질 혜택 카드 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gift size={17} color="#D97706" />
                  <span>1기 파운딩 아티스트 4대 실질적 혜택</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                  <div style={{ padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '3px solid #0F172A' }}>
                    <strong>1. 클라우드 5GB 저장 공간 전액 지원:</strong> 작품사진 고화질 500~1,000장 분량 (베타 2개월 무료)
                  </div>
                  <div style={{ padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '3px solid #0F172A' }}>
                    <strong>2. 작품 등록 수 무제한 & AI 작가노트 초안:</strong> 등록 제한 없이 보관하며 AI 글쓰기 하루 20회 지원
                  </div>
                  <div style={{ padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '3px solid #0F172A' }}>
                    <strong>3. 파운딩 멤버십 가격 유지:</strong> 정식 출시 후에도 구독 유지 시 Pro 50% 할인(월 4,900원) 유지
                  </div>
                  <div style={{ padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '3px solid #0F172A' }}>
                    <strong>4. 작품 소개 지원 (희망 작가 한정):</strong> 사전 확인을 거친 작품을 수장고 공식 채널에 큐레이션 홍보
                  </div>
                </div>
              </div>

              {/* 안심 약속 섹션 */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                  <ShieldCheck size={18} color="#166534" />
                  <span>안심하고 신청하세요 (수장고의 3대 약속)</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.84rem', color: '#14532D', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li><strong>자동 결제 없음:</strong> 카드 번호나 결제 정보를 일체 요구하지 않습니다.</li>
                  <li><strong>데이터 보존 보장:</strong> 베타가 끝난 뒤 유료 결제를 하지 않으셔도 등록하신 작품과 기록은 절대 삭제되지 않습니다.</li>
                  <li><strong>사후 이용 안내:</strong> 무료 기준(30점)을 넘긴 기존 작품도 언제든 열람·다운로드 가능하며, 새 작품 추가만 Pro 전환 또는 30점 이하 정리 시 가능합니다.</li>
                </ul>
              </div>

              {/* 함께해 주실 일 */}
              <div style={{ fontSize: '0.82rem', color: '#64748B', background: '#FAFAFA', padding: '10px 14px', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
                <strong>함께해 주실 일:</strong> 2개월간 주 1회 이상 편하게 써보시고, 중간·마무리 설문(각 5분 소요)에 솔직한 의견을 들려주세요. 파운딩 할인 혜택은 마무리 설문까지 참여해 주신 분께 드립니다.
              </div>

              {/* 신청 버튼 */}
              <button
                type="button"
                onClick={() => setStep('apply')}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                }}
              >
                <span>1기 파운딩 아티스트 신청하기</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ========================================================
              [STEP 2] 지원서 폼 (apply)
             ======================================================== */}
          {step === 'apply' && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <button
                  type="button"
                  onClick={() => setStep('notice')}
                  style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem', padding: 0 }}
                >
                  <ArrowLeft size={16} />
                  <span>공지사항 다시 보기</span>
                </button>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>약 2~3분 소요</span>
              </div>

              {formError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '0.86rem', marginBottom: '1.2rem' }}>
                  {formError}
                </div>
              )}

              {/* 섹션 1: 기본 정보 */}
              <div style={{ marginBottom: '1.6rem' }}>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.94rem', marginBottom: '0.6rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                  1. 기본 정보
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    작가 활동명 또는 성함 <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="도록이나 전시에 표기하시는 활동명"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    이메일 주소 <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="수장고 가입 및 선정 안내를 받으실 이메일"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '3px' }}>
                    선정 안내 및 계정 권한 연결에 사용됩니다.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    휴대폰 번호 (선택)
                  </label>
                  <input
                    type="tel"
                    placeholder="예: 010-1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '3px' }}>
                    이메일 안내가 닿지 않을 경우에만 확인 연락용으로 사용됩니다.
                  </div>
                </div>
              </div>

              {/* 섹션 2: 작가 활동 */}
              <div style={{ marginBottom: '1.6rem' }}>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.94rem', marginBottom: '0.6rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                  2. 작가 활동
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    주 활동 분야 (복수 선택 가능) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', fontSize: '0.82rem' }}>
                    {['서양화', '한국화', '수채화·드로잉', '판화', '조각·입체·설치', '공예', '사진', '디지털·일러스트'].map(genre => (
                      <label key={genre} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: formData.genres.includes(genre) ? '#EFF6FF' : '#F8FAFC', padding: '6px 8px', borderRadius: '6px', border: '1px solid', borderColor: formData.genres.includes(genre) ? '#3B82F6' : '#E2E8F0' }}>
                        <input
                          type="checkbox"
                          checked={formData.genres.includes(genre)}
                          onChange={() => handleCheckboxToggle('genres', genre)}
                        />
                        <span>{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    활동 기간 (필수) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
                  >
                    <option value="미대 재학 또는 졸업 예정">미대 재학 또는 졸업 예정</option>
                    <option value="1년 미만 (신진 작가)">1년 미만 (신진 작가)</option>
                    <option value="1~3년">1년 ~ 3년</option>
                    <option value="3~10년">3년 ~ 10년</option>
                    <option value="10년 이상">10년 이상</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    작품을 볼 수 있는 곳 (선택)
                  </label>
                  <input
                    type="text"
                    placeholder="인스타그램 계정(@id), 포트폴리오 웹사이트, 블로그 링크 등"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '3px' }}>
                    선정 및 작품 소개 검토 시 참고합니다.
                  </div>
                </div>
              </div>

              {/* 섹션 3: 작업실의 고민 (선정에 가장 중요) */}
              <div style={{ marginBottom: '1.6rem' }}>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.94rem', marginBottom: '0.6rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                  3. 작업실의 고민 (가장 중요한 질문)
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    창작 외 업무 중 가장 번거롭거나 막막했던 일은 무엇인가요? <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="예: 캡션 규격 맞추기, 작가노트 글쓰기 막막함, 예전 작품 사진 찾기, 계산서나 강의계획서 서식 작성 등"
                    value={formData.painPoint}
                    onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                    이 답변을 토대로 작가님들이 가장 필요로 하시는 기능부터 우선 개발합니다.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    가장 먼저 써보고 싶은 기능 (최대 3개 선택)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.82rem' }}>
                    {[
                      '작품사진 보관 및 목록 관리',
                      '전시 캡션(명패) A4 PDF 인쇄',
                      '출강 강의계획서 · 견적서 완성',
                      '창작 가계부 (3.3% 세무 정산)',
                      'AI 작가노트 초안 & SNS 글',
                      '영감 노트 (아이디어 메모 서랍)'
                    ].map(feat => (
                      <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: formData.wantedFeatures.includes(feat) ? '#EFF6FF' : '#F8FAFC', padding: '6px 8px', borderRadius: '6px', border: '1px solid', borderColor: formData.wantedFeatures.includes(feat) ? '#3B82F6' : '#E2E8F0' }}>
                        <input
                          type="checkbox"
                          checked={formData.wantedFeatures.includes(feat)}
                          onChange={() => handleCheckboxToggle('wantedFeatures', feat)}
                        />
                        <span>{feat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 섹션 4: 베타 참여 및 동의 */}
              <div style={{ marginBottom: '1.6rem' }}>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.94rem', marginBottom: '0.6rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                  4. 베타 참여 및 법적 동의
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    2개월간 주 1회 이상 이용하고, 설문 2회(각 5분)에 참여해 주실 수 있나요? <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.84rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="canCommit"
                        value="네, 성실히 참여하겠습니다."
                        checked={formData.canCommit === '네, 성실히 참여하겠습니다.'}
                        onChange={(e) => setFormData({ ...formData, canCommit: e.target.value })}
                      />
                      <span>네, 성실히 참여하겠습니다.</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="canCommit"
                        value="일정상 참여가 어려울 수 있습니다."
                        checked={formData.canCommit === '일정상 참여가 어려울 수 있습니다.'}
                        onChange={(e) => setFormData({ ...formData, canCommit: e.target.value })}
                      />
                      <span>일정상 어려울 수 있습니다.</span>
                    </label>
                  </div>
                </div>

                {/* 개인정보 법정 고지 표 */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontSize: '0.78rem', color: '#475569', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>[필수] 개인정보 수집 및 이용 안내</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', margin: '4px 0' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #CBD5E1' }}>
                        <th style={{ padding: '2px 4px' }}>수집 항목</th>
                        <th style={{ padding: '2px 4px' }}>목적</th>
                        <th style={{ padding: '2px 4px' }}>보유 기간</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px' }}>활동명, 이메일, (선택)연락처, 작품링크, 설문응답</td>
                        <td style={{ padding: '4px' }}>베타 선발 심사, 계정 권한 부여, 피드백 반영</td>
                        <td style={{ padding: '4px' }}>미선정 시 발표 후 1개월, 선정 시 베타 종료 후 3개월 파기</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                    동의를 거부하실 권리가 있으며, 거부 시 1기 베타 작가 신청이 제한됩니다.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#0F172A' }}>
                    <input
                      type="checkbox"
                      checked={formData.privacyConsent}
                      onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                    />
                    <span>[필수] 개인정보 수집 및 이용에 동의합니다.</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#0F172A' }}>
                    <input
                      type="checkbox"
                      checked={formData.overFourteen}
                      onChange={(e) => setFormData({ ...formData, overFourteen: e.target.checked })}
                    />
                    <span>[필수] 만 14세 이상입니다.</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#64748B' }}>
                    <input
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                    />
                    <span>[선택] 수장고 주요 업데이트 및 혜택 안내 수신에 동의합니다.</span>
                  </label>
                </div>
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} />
                <span>{isSubmitting ? '접수 처리 중...' : '지원서 제출하기'}</span>
              </button>
            </form>
          )}

          {/* ========================================================
              [STEP 3] 신청 완료 축하 뷰 (success)
             ======================================================== */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>
                1기 파운딩 아티스트 지원서가 접수되었습니다
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                수장고를 함께 빚어갈 소중한 이야기를 들려주셔서 감사드립니다.<br />
                선정 결과 및 그룹 배정 안내는 <strong>11월 9일(월)</strong> 등록해 주신 이메일로 정성껏 전해드리겠습니다.
              </p>
              
              <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'inline-flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: '#64748B', marginBottom: '1.5rem', textAlign: 'left' }}>
                <div>• <strong>신청 작가명:</strong> <span style={{ color: '#0F172A', fontWeight: 600 }}>{formData.name}</span></div>
                <div>• <strong>결과 안내받으실 이메일:</strong> <span style={{ color: '#0284C7', fontWeight: 600 }}>{formData.email}</span></div>
                <div>• <strong>공식 접수·문의처:</strong> <span style={{ color: '#0F172A', fontWeight: 600 }}>auth@sujango.com</span></div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  내 수장고 둘러보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 모달 하단 푸터 (오늘 하루 보지 않기 / 문의처) */}
        {step !== 'success' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.5rem', borderTop: '1px solid #F1F5F9', background: '#FAFAFA', fontSize: '0.78rem', color: '#64748B' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
              />
              <span>오늘 하루 보지 않기</span>
            </label>
            <div>
              문의: <a href="mailto:auth@sujango.com" style={{ color: '#0F172A', textDecoration: 'underline' }}>auth@sujango.com</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
