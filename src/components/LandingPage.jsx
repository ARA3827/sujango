import React from 'react';
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
  FileCheck
} from 'lucide-react';

export default function LandingPage({ onOpenLogin, onExploreGuest, onOpenPricing }) {
  return (
    <div className="landing-wrapper">
      {/* 1. 히어로 섹션 */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <Sparkles size={14} color="#0284C7" />
          <span>창작자를 위한 프라이빗 디지털 수장고</span>
        </div>

        <h1 className="landing-hero-title">
          오롯이 창작에만 몰입하세요.<br />
          서류, 세금, 아카이브는 수장고(Sujango)가 지킵니다.
        </h1>

        <p className="landing-hero-sub">
          복잡한 미술관 제출 서류 양식부터 3.3% 원천징수 계산, 
          그리고 세월이 흘러도 변치 않는 평생 작품 포트폴리오까지 한곳에서 관리하세요.
        </p>

        <div className="landing-hero-cta">
          <button onClick={onOpenLogin} className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', width: 'auto' }}>
            ✨ 무료로 내 수장고 시작하기
          </button>
          <button onClick={onExploreGuest} className="btn-outline" style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}>
            👀 대시보드 바로 둘러보기
          </button>
        </div>

        <div className="landing-trust-strip">
          <div className="trust-item">
            <CheckCircle2 size={16} color="#059669" />
            <span>회원가입 없이 즉시 체험 가능</span>
          </div>
          <div className="trust-item">
            <ShieldCheck size={16} color="#059669" />
            <span>내 컴퓨터에 100% 안전 저장 (개인정보 유출 제로)</span>
          </div>
          <div className="trust-item">
            <Download size={16} color="#059669" />
            <span>언제든 전체 데이터 단일 파일 백업</span>
          </div>
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
          {/* 기능 1 */}
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

          {/* 기능 2 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#F8FAFC', color: '#0F172A' }}>
              <Tag size={24} />
            </div>
            <h4>🏛️ 전시 캡션 네임택 출력기</h4>
            <p>
              벽면 부착용 캡션을 14대 표준 재료기법 국/영문 프리셋으로 생성하고,
              단정한 테두리 선을 따라 칼로 자를 수 있게 A4 단일 PDF로 일괄 인쇄합니다.
            </p>
            <div className="feature-tag">A4 규격 단일 PDF</div>
          </div>

          {/* 기능 3 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#FDF4FF', color: '#A855F7' }}>
              <PenTool size={24} />
            </div>
            <h4>✍️ 작가노트 & SNS OSMU</h4>
            <p>
              작품 키워드 3개만 넣으면 도록용 심층 평론 작가노트, 인스타 감성 캡션+태그,
              블로그 비하인드 스토리가 완성되며 자유롭게 다듬을 수 있습니다.
            </p>
            <div className="feature-tag">1작품 3대 콘텐츠 동시 추출</div>
          </div>

          {/* 기능 4 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
              <FileText size={24} />
            </div>
            <h4>📄 출강 강의계획서 & CV 정리기</h4>
            <p>
              수업 시간대와 커리큘럼이 포함된 출강 계획서, 국공립 미술관 규격의
              표준 전시 약력(CV)을 공문서 양식으로 단정하게 생성합니다.
            </p>
            <div className="feature-tag">교육청 / 문화재단 규격</div>
          </div>

          {/* 기능 5 */}
          <div className="feature-showcase-card" onClick={onExploreGuest}>
            <div className="feature-icon-box" style={{ background: '#FFFBEB', color: '#D97706' }}>
              <Receipt size={24} />
            </div>
            <h4>💰 예술소득 & 3.3% 안심 정산소</h4>
            <p>
              출강료 3.3%, 특강 8.8%, 갤러리 위탁판매 40% 수수료 실수령액을 즉시 계산하고
              미청구/미수금을 한눈에 확인하여 5월 종소세를 완벽 대비합니다.
            </p>
            <div className="feature-tag">원천징수 & 미수금 관리</div>
          </div>

          {/* 안내 카드 */}
          <div className="feature-showcase-card callout" onClick={onOpenLogin}>
            <div className="feature-icon-box" style={{ background: '#0F172A', color: '#FFFFFF' }}>
              <Sparkles size={24} />
            </div>
            <h4>🚀 지금 바로 시작해 보세요</h4>
            <p>
              로그인하면 모든 도구를 제한 없이 이용하고 나만의 작품 기록장을 만들 수 있습니다.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0284C7' }}>
              <span>간편하게 무료 시작</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. 요금제 안내 섹션 (Free vs Pro 클라우드 금고) */}
      <section className="landing-pricing-section">
        <div className="section-title-center">
          <span className="section-sub-tag">MEMBERSHIP PLAN</span>
          <h2>합리적이고 투명한 창작자 요금제</h2>
          <p>
            기본 기능은 무료로 영구 사용하고, 대용량 무손실 원본 보관이 필요할 때 Pro로 업그레이드하세요.
          </p>
        </div>

        <div className="landing-pricing-grid">
          {/* 무료 플랜 */}
          <div className="landing-pricing-card">
            <div className="pricing-card-header">
              <span className="plan-badge-simple">평생 무료</span>
              <h3 className="plan-title">Free 베이직</h3>
              <div className="plan-price-wrap">
                <span className="plan-price-num">0</span>
                <span className="plan-price-unit">원 / 평생</span>
              </div>
              <p className="plan-desc">행정 서류와 기본적인 작품 아카이빙을 위한 무료 플랜</p>
            </div>
            <ul className="plan-features">
              <li><CheckCircle2 size={16} color="#059669" /> <strong>작품 아카이브 최대 30점</strong> 안전 보관</li>
              <li><CheckCircle2 size={16} color="#059669" /> 웹 최적화 확인용 압축 (내 PC 브라우저 저장)</li>
              <li><CheckCircle2 size={16} color="#059669" /> 기기 교체 시 단일 JSON 파일 백업/복원 이동</li>
              <li><CheckCircle2 size={16} color="#059669" /> 4대 행정 서류·정산·캡션 도구 무제한 지원</li>
            </ul>
            <button onClick={onOpenLogin} className="btn-outline" style={{ width: '100%', marginTop: '1.5rem' }}>
              무료로 시작하기
            </button>
          </div>

          {/* Pro 플랜 (추천) */}
          <div className="landing-pricing-card featured">
            <div className="pricing-popular-tag">
              <Crown size={13} /> 작가 추천
            </div>
            <div className="pricing-card-header">
              <span className="plan-badge-pro">100GB 원본 금고</span>
              <h3 className="plan-title">Sujango Pro</h3>
              <div className="plan-price-wrap">
                <span className="plan-price-num">4,900</span>
                <span className="plan-price-unit">원 / 월 (연 49,000원)</span>
              </div>
              <p className="plan-desc">어디서든 로그인 동기화 + 100GB 평생 무손실 금고</p>
            </div>
            <ul className="plan-features">
              <li><CheckCircle2 size={16} color="#0284C7" /> <strong>작품 무제한 등록</strong> (30점 한도 완전 해제)</li>
              <li><CheckCircle2 size={16} color="#0284C7" /> <strong>PC • 스마트폰 어디서나 로그인 자동 동기화</strong></li>
              <li><CheckCircle2 size={16} color="#059669" /> <strong>100GB 무손실 원본</strong> 클라우드 금고 보관</li>
              <li><CheckCircle2 size={16} color="#059669" /> <strong>99.999999999% 내구성</strong> 3중 분산 백업</li>
              <li><CheckCircle2 size={16} color="#059669" /> 도록·인쇄용 <strong>원본 해상도 즉시 다운로드</strong></li>
              <li><CheckCircle2 size={16} color="#059669" /> 갤러리·컬렉터 전용 <strong>비밀번호 도록 공유 링크</strong></li>
            </ul>
            <button onClick={onOpenPricing} className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              👑 Pro 요금제 및 30일 무료체험 안내
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
              <div className="shield-item-title">⚖️ 100% 작가 저작권 보호</div>
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
