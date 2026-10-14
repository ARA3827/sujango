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

export default function LandingPage({ onOpenLogin, onExploreGuest, onOpenPricing }) {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    setFeedbacks(getFeedbacks());
  }, []);
  return (
    <div className="landing-wrapper">
      {/* 1. 히어로 섹션 */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <Sparkles size={14} color="#0284C7" />
          <span>창작자를 위한 프라이빗 디지털 수장고</span>
        </div>

        <h1 className="landing-hero-title">
          작가님은 오롯이 창작에만 몰입하세요.
        </h1>

        <p className="landing-hero-sub">
          마음을 울린 영감의 기록부터 소중한 작품 보관까지, 세월이 흘러도 변치 않는 나만의 디지털 수장고에서 안전하게 관리하세요.
        </p>

        <div className="landing-hero-cta" style={{ justifyContent: 'center' }}>
          <button onClick={onOpenLogin} className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1.02rem', width: 'auto' }}>
            ✨ 무료로 내 수장고 시작하기
          </button>
        </div>
      </section>

      {/* 2. 핵심 통찰: 일반 SNS 보관 vs 수장고(Sujango) 비교 배너 */}
      <section className="landing-comparison-section">
        <div className="comparison-card">
          <div className="comparison-header warning">
            <AlertTriangle size={20} color="#DC2626" />
            <h3>일반 SNS나 개인 기기에만 보관할 때의 위험</h3>
          </div>
          <ul className="comparison-list">
            <li>❌ <strong>계정 분실/기기 고장 한 번에</strong> 수년간 쌓아온 작품과 기록이 소실될 위험</li>
            <li>❌ 사진이 강제로 저화질로 뭉개져 <strong>도록이나 인쇄용으로 재활용 불가</strong></li>
            <li>❌ 작품 호수, 연도, 재료, 가격 등 <strong>미술계 표준 규격 정리가 불가능</strong></li>
            <li>❌ 큐레이터나 갤러리 미팅 시 <strong>공식 포트폴리오로 제출하기 어려움</strong></li>
          </ul>
        </div>

        <div className="comparison-card highlight">
          <div className="comparison-header safe">
            <ShieldCheck size={20} color="#059669" />
            <h3>프라이빗 디지털 수장고</h3>
          </div>
          <ul className="comparison-list">
            <li>✅ <strong>어떤 플랫폼 변화에도 영원히 안전한</strong> 작가 본인 소유의 디지털 서고</li>
            <li>✅ 20MB 고화질 사진도 <strong>웹 최적화로 가볍게 자동 다이어트 압축</strong></li>
            <li>✅ 작품 사진을 누르면 <strong>도록용 작가노트와 미술관 캡션 명패가 한눈에</strong></li>
            <li>✅ 클릭 한 번으로 <strong>전체 데이터를 내 PC에 파일로 안전하게 백업</strong></li>
          </ul>
        </div>
      </section>

      {/* 3. 5대 킬러 기능 쇼케이스 */}
      <section className="landing-features-section">
        <div className="section-title-center">
          <span className="section-sub-tag">CORE WORKSPACES</span>
          <h2>창작 외의 모든 골칫거리를 해결해 드립니다</h2>
          <p>기관과 미술관, 갤러리가 요구하는 표준 규격으로 한 번에 정리하세요.</p>
        </div>

        <div className="landing-feature-grid">
          {/* 기능 1: 영감 노트 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
              <Sparkles size={24} />
            </div>
            <h4>✨ 영감 노트</h4>
            <p>
              책 속 한 줄, 영화 속 명대사, 일상의 번뜩이는 사유를 카드로 아카이빙하고
              카카오톡 대화를 깔끔하게 정리하여 가져옵니다.
            </p>
            <div className="feature-tag">창작 영감 & 문장</div>
          </div>

          {/* 기능 2: 작가노트 & SNS */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#FDF4FF', color: '#A855F7' }}>
              <PenTool size={24} />
            </div>
            <h4>✍️ 작가노트 & SNS</h4>
            <p>
              작품 키워드 3개로 공모전용 심층 미학 평론 작가노트, 인스타 감성 캡션 + 해시태그,
              블로그 후기를 동시에 추출하고 직접 수정합니다.
            </p>
            <div className="feature-tag">AI 글 생성</div>
          </div>

          {/* 기능 3: 전시 캡션 출력기 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#F8FAFC', color: '#0F172A' }}>
              <Tag size={24} />
            </div>
            <h4>🏛️ 전시 캡션 출력기</h4>
            <p>
              작품 옆 벽면에 붙이는 국영문 표준 캡션(명패)을 자동 생성하고,
              자르기 좋은 절취선과 함께 A4 용지 규격으로 일괄 인쇄합니다.
            </p>
            <div className="feature-tag">전시 & 아트페어</div>
          </div>

          {/* 기능 4: 서류·출강 스튜디오 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#F0FDF4', color: '#15803D' }}>
              <FileText size={24} />
            </div>
            <h4>📄 서류·출강 스튜디오</h4>
            <p>
              출강 강의계획서, 미술계 표준 전시 약력(CV), 예술 작업 간이 견적서를
              공문서 규격으로 자동 완성합니다.
            </p>
            <div className="feature-tag">행정 서류</div>
          </div>

          {/* 기능 5: 창작 가계부 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#FFFBEB', color: '#D97706' }}>
              <Receipt size={24} />
            </div>
            <h4>💰 창작 가계부</h4>
            <p>
              출강·작품 수입과 재료비 지출을 한눈에 관리하고,
              A4 지출 정산 증빙서를 인쇄 및 PDF로 저장합니다.
            </p>
            <div className="feature-tag">수입 & 지출 증빙</div>
          </div>

          {/* 기능 6: 나의 작품 디지털 수장고 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <Archive size={24} />
            </div>
            <h4>📁 나의 작품 디지털 수장고</h4>
            <p>
              작품 사진과 도록용 작가노트, 캡션 규격을 차곡차곡 모아두는 나만의 디지털 도록.
              스마트폰 사진도 깃털처럼 가볍게 자동 압축 보관됩니다.
            </p>
            <div className="feature-tag">프라이빗 영구 보존</div>
          </div>
        </div>
      </section>

      {/* 3.5. 실제 작가들의 생생한 목소리 (Testimonials / Social Proof) */}
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

      {/* 4. 요금제 안내 섹션 (Free vs Pro 100GB vs Studio 500GB) */}
      <section className="landing-pricing-section">
        <div className="section-title-center">
          <span className="section-sub-tag">MEMBERSHIP PLAN</span>
          <h2>합리적이고 투명한 창작자 요금제</h2>
          <p>
            기본 기능과 작품 30점은 무료로 보관하고, 대용량 원본 금고와 워터마크 보안 링크가 필요할 때 Pro 또는 Studio로 확장하세요.
          </p>
        </div>

        <div className="landing-pricing-grid">
          {/* 1. 무료 플랜 */}
          <div className="landing-pricing-card">
            <div className="pricing-card-header">
              <span className="plan-badge-simple">기본 무료 플랜</span>
              <h3 className="plan-title">무료 플랜</h3>
              <div className="plan-price-wrap">
                <span className="plan-price-num">0</span>
                <span className="plan-price-unit">원 (기본 제공)</span>
              </div>
              <p className="plan-desc">창작과 행정 서식이 필요한 모든 예술가를 위한 기본 플랜</p>
            </div>

            <div className="plan-capacity-box">
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>체감 보관 용량</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                📁 작품 아카이브 서고 최대 30점
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                내 PC 브라우저 안전 저장 & JSON 백업
              </div>
            </div>

            <ul className="plan-features">
              <li><CheckCircle2 size={16} color="#059669" /> <strong>작품 아카이브 서고 최대 30점</strong> 보관</li>
              <li><CheckCircle2 size={16} color="#059669" /> 웹 최적화 확인용 압축 보관 (내 PC 브라우저 안전 저장)</li>
              <li><CheckCircle2 size={16} color="#059669" /> 기기 교체 시 단일 JSON 파일 백업/복원 이동</li>
              <li><CheckCircle2 size={16} color="#059669" /> 출강 강의계획서 & 표준 CV 약력 & 견적서 무제한</li>
              <li><CheckCircle2 size={16} color="#059669" /> 전시 캡션 A4 단일 PDF 일괄 인쇄</li>
            </ul>
            <button onClick={onOpenLogin} className="btn-outline" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}>
              작품 30점 무료 이용
            </button>
          </div>

          {/* 2. Pro 플랜 (100GB) */}
          <div className="landing-pricing-card">
            <div className="pricing-card-header">
              <span className="plan-badge-pro">100GB 클라우드 금고</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 className="plan-title" style={{ margin: 0 }}>Sujango Pro</h3>
                <Crown size={18} color="#0284C7" />
              </div>
              <div className="plan-price-wrap" style={{ marginTop: '0.5rem' }}>
                <span className="plan-price-num">7,900</span>
                <span className="plan-price-unit">원 / 월 (연 94,800원 기준)</span>
              </div>
              <p className="plan-desc">개인 작가를 위한 100GB 초고화질 무손실 원본 보관 (월간 구독 시 9,900원)</p>
            </div>

            <div className="plan-capacity-box">
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>체감 보관 용량</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                📸 20MB 고화질 사진 약 5,000장
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                개인전 10회 분량의 아카이빙 평생 보관
              </div>
            </div>

            <ul className="plan-features">
              <li><CheckCircle2 size={16} color="#0284C7" /> <strong>작품 등록 한도 무제한 해제</strong></li>
              <li><CheckCircle2 size={16} color="#0284C7" /> <strong>PC • 스마트폰 어디서나 실시간 동기화</strong></li>
              <li><CheckCircle2 size={16} color="#0284C7" /> <strong>100GB 초고화질 무손실 원본</strong> 클라우드 금고</li>
              <li><CheckCircle2 size={16} color="#059669" /> 웹 시안용 1080px 자동 압축 프리뷰 제공</li>
              <li><CheckCircle2 size={16} color="#059669" /> 큐레이터 전용 <strong>프라이빗 도록 공유 링크</strong></li>
              <li><CheckCircle2 size={16} color="#059669" /> 3중 분산 데이터센터 안전 보관 (11 9s)</li>
            </ul>
            <button onClick={onOpenPricing} className="btn-outline" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', borderColor: '#0284C7', color: '#0284C7', fontWeight: 600 }}>
              Pro 30일 무료 체험
            </button>
          </div>

          {/* 3. Studio 플랜 (500GB - 추천 플랜) */}
          <div className="landing-pricing-card featured">
            <div className="pricing-popular-tag">
              <Sparkles size={12} color="#EAB308" /> 스튜디오 추천
            </div>
            <div className="pricing-card-header">
              <span className="plan-badge-studio">500GB 대용량 금고</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 className="plan-title" style={{ margin: 0 }}>Sujango Studio</h3>
                <Crown size={18} color="#7C3AED" />
              </div>
              <div className="plan-price-wrap" style={{ marginTop: '0.5rem' }}>
                <span className="plan-price-num">23,200</span>
                <span className="plan-price-unit">원 / 월 (연 278,400원 기준)</span>
              </div>
              <p className="plan-desc">영상•설치•대형 프로젝트 작가 및 작업실 전용 (월간 구독 시 29,000원)</p>
            </div>

            <div className="plan-capacity-box studio">
              <div style={{ fontSize: '0.74rem', color: '#7E22CE' }}>체감 보관 용량</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#581C87', marginTop: '2px' }}>
                🎬 4K 영상 약 20편 또는 사진 25,000장
              </div>
              <div style={{ fontSize: '0.72rem', color: '#7E22CE', marginTop: '2px' }}>
                초대용량 원본 영구 보존 & 작업실 공유
              </div>
            </div>

            <ul className="plan-features">
              <li><CheckCircle2 size={16} color="#7C3AED" /> <strong>500GB 초대용량 무손실 클라우드 금고</strong></li>
              <li><CheckCircle2 size={16} color="#7C3AED" /> <strong>나만의 워터마크 자동 합성 (문구 & 로고)</strong></li>
              <li><CheckCircle2 size={16} color="#7C3AED" /> <strong>7일 만료 보안 공유 링크 (Signed URL)</strong></li>
              <li><CheckCircle2 size={16} color="#059669" /> 선택적 4자리 PIN 비밀번호 클라이언트 잠금</li>
              <li><CheckCircle2 size={16} color="#059669" /> 클라이언트 실시간 피드백 및 리뷰 수합</li>
              <li><CheckCircle2 size={16} color="#059669" /> 3중 분산 데이터센터 안전 보관 (11 9s)</li>
            </ul>
            <button onClick={onOpenPricing} className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', background: '#0F172A' }}>
              <Crown size={16} color="#EAB308" />
              <span>Studio 플랜 시작하기</span>
            </button>
          </div>
        </div>

        {/* 3대 법적 신뢰 안심 보증 배너 */}
        <div className="landing-legal-shield-box">
          <div className="legal-shield-header">
            <ShieldCheck size={20} color="#0284C7" />
            <h4>Ara Agent Lab의 3대 안심 서비스 보증</h4>
          </div>
          <div className="legal-shield-grid">
            <div className="shield-item">
              <div className="shield-item-title">⚖️ 작가 저작권 본인 귀속 원칙</div>
              <p className="shield-item-desc">
                업로드된 모든 작품 이미지와 작가노트의 지식재산권은 전적으로 작가 본인에게 귀속되며 상업적으로 이용되지 않습니다.
              </p>
            </div>
            <div className="shield-item">
              <div className="shield-item-title">🛡️ 투명한 손해배상 및 약관</div>
              <p className="shield-item-desc">
                공정거래위원회 표준 전자상거래 지침을 준수하며, 명확한 손해배상 책임 한도와 자가 백업 권고로 상호 신뢰를 지킵니다.
              </p>
            </div>
            <div className="shield-item">
              <div className="shield-item-title">🔒 프라이빗 데이터 주권</div>
              <p className="shield-item-desc">
                언제든지 회원 탈퇴 시 보관된 모든 데이터는 즉시 복구 불가능하게 파기되며, 단일 파일로 모든 데이터를 소장할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 하단 CTA */}
      <section className="landing-bottom-cta">
        <h2>당신의 소중한 작품 세계, 이제 수장고(Sujango)에서 지키세요</h2>
        <p>어떤 복잡한 설정도 필요 없습니다. 오늘부터 당신만의 디지털 수장고가 시작됩니다.</p>
        <button onClick={onOpenLogin} className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem', width: 'auto', margin: '0 auto' }}>
          무료로 내 수장고 만들기
        </button>
      </section>
    </div>
  );
}
