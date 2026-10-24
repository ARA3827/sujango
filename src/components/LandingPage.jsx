import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  Archive, 
  Tag, 
  PenTool, 
  FileText, 
  Receipt, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Layers,
  Download,
  Crown,
  HardDrive,
  FileCheck,
  Star,
  Quote
} from 'lucide-react';
import { getFeedbacks } from '../utils/feedbackStorage';
import { TRADITIONAL_COLORS } from '../constants/themeColors';

export default function LandingPage({ 
  user,
  onOpenLogin, 
  onNavigateToGuide, 
  onNavigateToAbout, 
  onOpenPricing,
  onOpenFoundingModal,
  onGoDashboard,
  onSelectView
}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'yearly' | 'monthly'
  const SHOW_REVIEWS = false; // 후기 섹션 제어 플래그 (지시서 1단계: 숨김 처리, 추후 true 전환 가능)
  const CLOUD_ENABLED = false; // 클라우드 동기화 완료 후 true 전환
  const STUDIO_ENABLED = false; // Studio 플랜 오픈 후 true 전환

  useEffect(() => {
    setFeedbacks(getFeedbacks());
  }, []);

  const handleCardClick = (viewId) => {
    if (user) {
      if (onSelectView) onSelectView(viewId);
    } else {
      if (onOpenLogin) onOpenLogin('login');
    }
  };
  return (
    <div className="landing-wrapper">
      {/* 1. 히어로 섹션 (아틀리에 작업대 실물 전면 배경 적용) */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-text-col">
            <div className="landing-hero-badge">
              <Sparkles size={14} color="#B45309" />
              <span>1인 창작자를 위한 프라이빗 수장고</span>
            </div>

            <h1 className="landing-hero-title">
              작가님은 오롯이<br />창작에만 몰입하세요.
            </h1>

            <p className="landing-hero-sub desktop-only">
              고해상도 원본 보관부터 작가노트, 전시 캡션, 출강 서류, 수입·지출 정리까지.<br />
              작품과 작가의 모든 기록을 한 곳에서 품격 있게 관리하세요.
            </p>
            <p className="landing-hero-sub mobile-only">
              원본 보관부터 캡션, 출강 서류, 정산까지. 작가의 모든 기록을 한 곳에서.
            </p>

            <div className="landing-hero-cta" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {user ? (
                <button onClick={onGoDashboard} className="hero-primary-btn">
                  <Palette size={18} />
                  {user.name && user.name !== '작가' ? `${user.name} 작가님의 수장고` : '내 수장고로 이동'} →
                </button>
              ) : (
                <button onClick={() => onOpenLogin('login')} className="hero-primary-btn">
                  <Sparkles size={18} />
                  무료로 수장고 열기
                </button>
              )}
              <button 
                type="button" 
                onClick={() => {
                  const el = document.querySelector('.landing-features-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="hero-secondary-btn"
              >
                기능 둘러보기 ↓
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 핵심 통찰: 일반 SNS 보관 vs 수장고(Sujango) 비교 (차분한 무채색 & 딥네이비 톤다운) */}
      <section className="landing-comparison-section">
        <div className="comparison-card">
          <div className="comparison-header muted">
            <Lock size={19} color="#64748B" />
            <h3>SNS나 개인 기기에만 보관할 때</h3>
          </div>
          <ul className="comparison-list">
            <li>
              <span className="comparison-bullet-muted">✕</span>
              <span>계정 분실이나 기기 고장 한 번에 수년간의 작품과 기록이 사라질 수 있어요</span>
            </li>
            <li>
              <span className="comparison-bullet-muted">✕</span>
              <span>업로드할 때마다 화질이 떨어져 도록이나 인쇄용으로 다시 쓰기 어려워요</span>
            </li>
            <li>
              <span className="comparison-bullet-muted">✕</span>
              <span>호수, 연도, 재료, 가격이 흩어져 있어 매번 다시 정리해야 해요</span>
            </li>
            <li>
              <span className="comparison-bullet-muted">✕</span>
              <span>큐레이터나 갤러리에 보낼 정돈된 포트폴리오가 없어요</span>
            </li>
          </ul>
        </div>

        <div className="comparison-card highlight">
          <div className="comparison-header safe">
            <ShieldCheck size={20} color="#0F172A" />
            <h3 style={{ color: '#0F172A' }}>수장고에 보관할 때</h3>
          </div>
          <ul className="comparison-list">
            <li>
              <span className="comparison-bullet-navy">
                <CheckCircle2 size={13} color="#FFFFFF" />
              </span>
              <span>원본은 화질을 낮추지 않고 그대로 보관하고, 화면용 사본은 자동으로 가볍게 만들어요</span>
            </li>
            <li>
              <span className="comparison-bullet-navy">
                <CheckCircle2 size={13} color="#FFFFFF" />
              </span>
              <span>작품을 누르면 작가노트와 캡션 정보가 한눈에 보여요</span>
            </li>
            <li>
              <span className="comparison-bullet-navy">
                <CheckCircle2 size={13} color="#FFFFFF" />
              </span>
              <span>클릭 한 번으로 전체 기록을 내 PC에 내려받을 수 있어, 플랫폼에 묶이지 않아요</span>
            </li>
            <li>
              <span className="comparison-bullet-navy">
                <CheckCircle2 size={13} color="#FFFFFF" />
              </span>
              <span>미술계 표준 규격으로 정리돼 바로 제출할 수 있어요</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. 5대 킬러 기능 쇼케이스 */}
      <section className="landing-features-section">
        <div className="section-title-center">
          <span className="section-sub-tag">CORE WORKSPACES</span>
          <h2>창작 외의 번거로운 일은 수장고가 정리합니다</h2>
          <p>미술관, 갤러리, 기관이 요구하는 형식에 맞춰 한 번에 준비하세요.</p>
        </div>

        <div className="landing-feature-grid">
          {[
            {
              id: 'archive',
              title: '나의 작품 수장고',
              tag: '원본 보관',
              icon: Archive,
              desc: '작품 사진과 작가노트, 캡션 정보를 작품별로 차곡차곡 모아두는 나만의 작품 보관함. 원본은 그대로, 공유용은 가볍게.'
            },
            {
              id: 'caption',
              title: '전시 캡션 출력기',
              tag: '전시 · 아트페어',
              icon: Tag,
              desc: '작품 옆 벽면에 붙이는 국영문 캡션을 자동으로 만들고, 재단선과 함께 A4 규격으로 한 번에 인쇄해요.'
            },
            {
              id: 'doc',
              title: '서류 · 출강 스튜디오',
              tag: '행정 서류',
              icon: FileText,
              desc: '출강 강의계획서, 전시 약력(CV), 작업 견적서를 기관 제출용 공문서 형식으로 단정하게 완성해요.'
            },
            {
              id: 'tax',
              title: '창작 가계부',
              tag: '수입 · 지출',
              icon: Receipt,
              desc: '출강비, 작품 판매 수입과 재료비 지출을 한눈에 정리하고, 카드 영수증이 첨부된 정산서를 PDF로 저장해요.'
            },
            {
              id: 'statement',
              title: '작가노트 & SNS',
              tag: '초안 작성',
              icon: PenTool,
              desc: '작품 키워드 세 개로 심층 작가노트 초안, 인스타그램 캡션, 블로그 글을 함께 잡아드려요. 마지막 문장은 작가님의 손으로.'
            },
            {
              id: 'inspo',
              title: '영감 노트',
              tag: '영감 · 문장',
              icon: Quote,
              desc: '책 속 한 줄, 영화 속 대사, 문득 떠오른 사유를 카드로 모아두는 창작의 소중한 씨앗 보관함.'
            }
          ].map((item) => {
            const color = TRADITIONAL_COLORS[item.id];
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id}
                className="feature-showcase-card" 
                onClick={() => handleCardClick(item.id)} 
                style={{ 
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ marginBottom: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: color.iconBg,
                    color: color.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${color.border}`
                  }}>
                    <IconComponent size={19} />
                  </div>
                  <span 
                    className="feature-tag"
                    style={{
                      background: color.tagBg,
                      color: color.tagColor,
                      border: `1px solid ${color.border}`,
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      margin: 0,
                      lineHeight: 1,
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.22rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.55rem', letterSpacing: '-0.02em' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3.5. 실제 작가들의 생생한 목소리 (Testimonials / Social Proof) - SHOW_REVIEWS 설정값으로 숨김 제어 */}
      {SHOW_REVIEWS && (
        <section className="landing-reviews-section" style={{ maxWidth: '1120px', margin: '4rem auto 2rem', padding: '0 1.5rem' }}>
          <div className="section-title-center">
            <span className="section-sub-tag">GLOBAL ARTIST COMMUNITY & REVIEWS</span>
            <h2>수장고와 함께하는 국내외 작가들의 생생한 목소리</h2>
            <p>
              국내외 1인 창작 예술가들이 현장에서 직접 경험한 솔직한 이용 소감과 생생한 후기입니다.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
            {feedbacks.slice(0, 6).map((fb) => (
              <div 
                key={fb.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '0.75rem' }}>
                    {[...Array(fb.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} color="#F59E0B" fill="#F59E0B" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                    "{fb.text}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                    {fb.author}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    {fb.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. 요금제 안내 섹션 (Free vs Pro 100GB vs Studio 500GB) */}
      <section className="landing-pricing-section">
        <div className="section-title-center">
          <span className="section-sub-tag">MEMBERSHIP PLAN</span>
          <h2>합리적이고 투명한 창작자 요금제</h2>
          <p>
            기본 기능과 작품 30점은 무료로 보관하고, 대용량 원본 금고와 워터마크 보안 링크가 필요할 때 Pro 또는 Studio로 확장하세요.
          </p>
        </div>

        {/* 결제 주기 선택 스위치 (월간 결제 vs 연간 결제 20% 할인) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.25rem' }}>
          <div style={{ background: '#F1F5F9', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '0.45rem 1.25rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: billingCycle === 'monthly' ? '#FFFFFF' : 'transparent',
                color: billingCycle === 'monthly' ? '#0F172A' : '#64748B',
                boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              월간 결제
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '0.45rem 1.25rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: billingCycle === 'yearly' ? '#FFFFFF' : 'transparent',
                color: billingCycle === 'yearly' ? '#0F172A' : '#64748B',
                boxShadow: billingCycle === 'yearly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>연간 결제</span>
              <span style={{ fontSize: '0.72rem', background: '#ECFDF5', color: '#059669', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                20% 할인
              </span>
            </button>
          </div>
        </div>

        <div className="landing-pricing-grid" style={{ alignItems: 'stretch', maxWidth: STUDIO_ENABLED ? '100%' : '720px', margin: STUDIO_ENABLED ? '0' : '0 auto' }}>
          {/* 1. 무료 플랜 */}
          <div className="landing-pricing-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            {/* 1. 플랜명 */}
            <h3 className="plan-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
              Free 스타터
            </h3>
            {/* 2. 대상 한 줄 */}
            <p className="plan-desc" style={{ fontSize: '0.82rem', color: '#64748B', margin: '6px 0 0 0', minHeight: '1.3rem' }}>
              수장고를 처음 써보는 작가
            </p>

            {/* 3. 가격 */}
            <div style={{ minHeight: '58px', marginTop: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>0</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B' }}>원 / 월</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
                무료
              </div>
            </div>

            {/* 4. 핵심 박스 */}
            <div className="plan-capacity-box" style={{ minHeight: '66px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '0.9rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                작품 30점 보관
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '3px' }}>
                이 기기의 브라우저에 저장
              </div>
            </div>

            {/* 5. 구분선 */}
            <div style={{ borderTop: '1px solid #E2E8F0', margin: '1.1rem 0' }} />

            {/* 6. 기능 목록 */}
            <ul className="plan-features" style={{ flex: 1, margin: '0 0 1.25rem 0' }}>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>출강 강의계획서 · 전시 약력(CV) · 견적서 작성</span></li>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>전시 캡션 A4 PDF 인쇄</span></li>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>웹 확인용 압축본 보관</span></li>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>AI 작가노트 초안 월 3회</span></li>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>백업 파일 내려받기 · 불러오기</span></li>
            </ul>

            {/* 7. 버튼 위 안내 (테두리 없는 작은 회색 글씨) */}
            <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.45, minHeight: '36px', marginBottom: '0.75rem' }}>
              기기를 바꾸거나 브라우저 기록을 지우면 사라질 수 있어요. 정기적으로 백업하세요.
            </div>

            <button onClick={onOpenLogin} className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
              무료로 시작하기
            </button>
          </div>

          {/* 2. Pro 플랜 */}
          <div className="landing-pricing-card featured" style={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', boxSizing: 'border-box' }}>
            {/* 추천 배지 (왕관 제거, 글자만) */}
            <div style={{ position: 'absolute', top: '-11px', right: '16px', background: '#0F172A', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' }}>
              추천
            </div>

            {/* 1. 플랜명 */}
            <h3 className="plan-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
              Sujango Pro
            </h3>
            {/* 2. 대상 한 줄 */}
            <p className="plan-desc" style={{ fontSize: '0.82rem', color: '#64748B', margin: '6px 0 0 0', minHeight: '1.3rem' }}>
              작품을 꾸준히 기록하고 보여주는 작가
            </p>

            {/* 3. 가격 */}
            <div style={{ minHeight: '58px', marginTop: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {billingCycle === 'yearly' ? '7,900' : '9,900'}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B' }}>원 / 월</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
                {billingCycle === 'yearly' ? (
                  <>
                    <s>9,900원</s> · 연 94,800원 일괄 결제
                  </>
                ) : (
                  '매월 결제'
                )}
              </div>
            </div>

            {/* 4. 핵심 박스 */}
            <div className="plan-capacity-box" style={{ minHeight: '66px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '0.9rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                100GB 무손실 원본 보관
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <span>고화질 사진 약 5,000장 · PC와 스마트폰 자동 동기화</span>
              </div>
            </div>

            {/* 5. 구분선 */}
            <div style={{ borderTop: '1px solid #E2E8F0', margin: '1.1rem 0' }} />

            {/* 6. 기능 목록 */}
            <ul className="plan-features" style={{ flex: 1, margin: '0 0 1.25rem 0' }}>
              <li><CheckCircle2 size={16} color="#0F172A" /> <strong style={{ color: '#0F172A' }}>무료의 모든 기능 +</strong></li>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>작품 수 제한 해제 (5GB 클라우드)</span></li>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>웹 공유용 사본 자동 생성</span></li>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>AI 작가노트 초안 넉넉하게 (일 20회)</span></li>
              <li><CheckCircle2 size={16} color="#0F172A" /> <span>3중 분산 저장으로 안전하게 보관</span></li>
            </ul>

            {/* 버튼 정렬용 여백 (무료 카드 안내문 높이와 동일) */}
            <div style={{ minHeight: '36px', marginBottom: '0.75rem' }} />

            <button 
              onClick={onOpenFoundingModal} 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', background: '#0F172A', color: '#FFFFFF', fontWeight: 600 }}
            >
              <span>1기 파운딩 작가 신청하기</span>
            </button>
          </div>

          {/* 3. Studio 플랜 (STUDIO_ENABLED 플래그 제어) */}
          {STUDIO_ENABLED && (
            <div className="landing-pricing-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
              {/* 1. 플랜명 */}
              <h3 className="plan-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                Sujango Studio
              </h3>
              {/* 2. 대상 한 줄 */}
              <p className="plan-desc" style={{ fontSize: '0.82rem', color: '#64748B', margin: '6px 0 0 0', minHeight: '1.3rem' }}>
                영상 · 설치 · 대형 작업을 하는 작가와 작업실
              </p>

              {/* 3. 가격 */}
              <div style={{ minHeight: '58px', marginTop: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                    {billingCycle === 'yearly' ? '23,200' : '29,000'}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B' }}>원 / 월</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
                  {billingCycle === 'yearly' ? (
                    <>
                      <s>29,000원</s> · 연 278,400원 일괄 결제
                    </>
                  ) : (
                    '매월 결제'
                  )}
                </div>
              </div>

              {/* 4. 핵심 박스 */}
              <div className="plan-capacity-box studio" style={{ minHeight: '66px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '0.9rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#581C87' }}>
                  500GB 무손실 원본 보관
                </div>
                <div style={{ fontSize: '0.76rem', color: '#7E22CE', marginTop: '3px' }}>
                  4K 영상 약 20편 또는 사진 약 25,000장
                </div>
              </div>

              {/* 5. 구분선 */}
              <div style={{ borderTop: '1px solid #E2E8F0', margin: '1.1rem 0' }} />

              {/* 6. 기능 목록 */}
              <ul className="plan-features" style={{ flex: 1, margin: '0 0 1.25rem 0' }}>
                <li><CheckCircle2 size={16} color="#7C3AED" /> <strong style={{ color: '#7C3AED' }}>Pro의 모든 기능 +</strong></li>
                <li><CheckCircle2 size={16} color="#7C3AED" /> <span>작품에 서명 · 로고 워터마크 자동 삽입</span></li>
                <li><CheckCircle2 size={16} color="#7C3AED" /> <span>7일 뒤 자동 만료되는 보안 공유 링크</span></li>
                <li><CheckCircle2 size={16} color="#7C3AED" /> <span>공유 링크 비밀번호 설정</span></li>
                <li><CheckCircle2 size={16} color="#7C3AED" /> <span>공유받은 사람의 의견 모아보기</span></li>
              </ul>

              {/* 버튼 정렬용 여백 (무료 카드 안내문 높이와 동일) */}
              <div style={{ minHeight: '36px', marginBottom: '0.75rem' }} />

              <button onClick={onOpenPricing} className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700, borderColor: '#7C3AED', color: '#7C3AED' }}>
                <span>Studio 시작하기</span>
              </button>
            </div>
          )}
        </div>

        {/* 수장고의 3가지 약속 배너 */}
        <div className="landing-legal-shield-box">
          <div className="legal-shield-header">
            <ShieldCheck size={20} color="#0284C7" />
            <h4>수장고가 지키는 3가지 약속</h4>
          </div>
          <div className="legal-shield-grid">
            <div className="shield-item">
              <div className="shield-item-title">작가 저작권 100% 귀속</div>
              <p className="shield-item-desc">
                등록하신 모든 작품 이미지와 작가노트의 권리는 오롯이 작가님께 있습니다. AI 무단 학습이나 상업적 목적으로 절대 활용하지 않습니다.
              </p>
            </div>
            <div className="shield-item">
              <div className="shield-item-title">투명하고 정직한 운영</div>
              <p className="shield-item-desc">
                과장 없이 서비스 현황과 운영 정책을 투명하게 안내하며, 정기적인 자가 백업 지원으로 소중한 데이터를 함께 지킵니다.
              </p>
            </div>
            <div className="shield-item">
              <div className="shield-item-title">완전한 데이터 주권과 통제권</div>
              <p className="shield-item-desc">
                작품 데이터는 작가님의 기기에 안전하게 보관됩니다. 원클릭 백업 파일로 언제든 소장할 수 있고, 원하실 때 직접 기기에서 완전히 비울 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 하단 CTA */}
      <section className="landing-bottom-cta">
        <h2>오늘의 작품부터 수장고에 모셔두세요</h2>
        <p>가입은 1분, 첫 작품 등록은 무료입니다.</p>
        <button onClick={() => onOpenLogin('signup')} className="hero-primary-btn" style={{ margin: '0 auto', padding: '0.95rem 2.2rem', fontSize: '1.02rem' }}>
          <Sparkles size={18} />
          무료로 시작하기
        </button>
      </section>
    </div>
  );
}
