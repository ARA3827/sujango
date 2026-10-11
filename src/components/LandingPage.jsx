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
  Download
} from 'lucide-react';

export default function LandingPage({ onOpenLogin, onExploreGuest }) {
  return (
    <div className="landing-wrapper">
      {/* 1. 히어로 섹션 */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <Sparkles size={14} color="#0284C7" />
          <span>1인 예술가를 위한 AI 행정 비서 & 작품 금고</span>
        </div>

        <h1 className="landing-hero-title">
          오롯이 창작에만 몰입하세요.<br />
          서류, 세금, 아카이브는 아트플로우가 지킵니다.
        </h1>

        <p className="landing-hero-sub">
          복잡한 미술관 제출 서류 양식부터 3.3% 원천징수 계산, 
          그리고 인스타그램이 사라져도 안전한 평생 작품 포트폴리오까지 한곳에서 관리하세요.
        </p>

        <div className="landing-hero-cta">
          <button onClick={onOpenLogin} className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', width: 'auto' }}>
            ✨ 무료로 내 작품 금고 시작하기
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

      {/* 2. 핵심 통찰: 인스타그램 vs 아트플로우 비교 배너 */}
      <section className="landing-comparison-section">
        <div className="comparison-card">
          <div className="comparison-header warning">
            <AlertTriangle size={20} color="#DC2626" />
            <h3>인스타그램 (SNS)에만 의존할 때의 위험</h3>
          </div>
          <ul className="comparison-list">
            <li>❌ <strong>계정 해킹/정지 한 번에</strong> 수년간 쌓아온 작품과 기록이 영구 소멸</li>
            <li>❌ 사진이 강제로 저화질로 뭉개져 <strong>도록이나 인쇄용으로 재활용 불가</strong></li>
            <li>❌ 작품 호수, 연도, 재료, 가격 등 <strong>미술계 표준 규격 정리가 불가능</strong></li>
            <li>❌ 큐레이터나 갤러리 미팅 시 <strong>공식 포트폴리오로 제출하기 어려움</strong></li>
          </ul>
        </div>

        <div className="comparison-card highlight">
          <div className="comparison-header safe">
            <ShieldCheck size={20} color="#059669" />
            <h3>아트플로우 (ArtFlow) 평생 작품 금고</h3>
          </div>
          <ul className="comparison-list">
            <li>✅ <strong>SNS가 폭파되어도 안전한</strong> 작가 본인 소유의 영구 디지털 서고</li>
            <li>✅ 20MB 고화질 사진도 <strong>0.2초 만에 웹 최적화로 자동 다이어트 압축</strong></li>
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
            <h4>📁 나의 작품 아카이브 서고</h4>
            <p>
              작품 사진과 도록용 작가노트, 캡션 규격을 차곡차곡 모아두는 나만의 디지털 도록.
              스마트폰 사진도 깃털처럼 가볍게 자동 압축 보관됩니다.
            </p>
            <div className="feature-tag">데이터 락인 영구 금고</div>
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
              <span>1초 만에 무료 시작</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. 하단 CTA */}
      <section className="landing-bottom-cta">
        <h2>당신의 소중한 작품 세계, 이제 아트플로우에서 지키세요</h2>
        <p>어떤 복잡한 설정도 필요 없습니다. 오늘부터 당신만의 디지털 아카이브가 시작됩니다.</p>
        <button onClick={onOpenLogin} className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem', width: 'auto', margin: '0 auto' }}>
          무료로 내 작품 보관소 만들기
        </button>
      </section>
    </div>
  );
}
