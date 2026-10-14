import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocStudio from './components/DocStudio';
import StatementStudio from './components/StatementStudio';
import TaxStudio from './components/TaxStudio';
import CaptionStudio from './components/CaptionStudio';
import ArchiveStudio from './components/ArchiveStudio';
import InspoVaultView from './inspo_module/InspoVaultView';
import NewToolModal from './components/NewToolModal';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import PolicyModal from './components/PolicyModal';
import PricingModal from './components/PricingModal';
import ClientPreviewView from './components/ClientPreviewView';
import { getStoredUser, saveUser, DEMO_USER } from './utils/authStorage';
import { syncUserProfile } from './utils/supabaseClient';
import { UserCheck, UserX, Sparkles, Crown } from 'lucide-react';

export default function App() {
  // 인증 상태 관리 (기본값: getStoredUser() 또는 null)
  const [user, setUser] = useState(getStoredUser);
  const [isGuestExploring, setIsGuestExploring] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 법적 정책 모달 및 유료 요금제 모달 상태
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('terms');
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const handleOpenPolicy = (tab = 'terms') => {
    setPolicyTab(tab);
    setIsPolicyModalOpen(true);
  };

  // 브라우저 URL 파싱 (Hash 및 Query Search 양방향 완벽 감지)
  const getViewFromHash = () => {
    // 1. Query Search 파라미터에 token이나 share가 있는 경우 즉시 보안 시안 뷰어로 진입
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('token') || searchParams.get('share') || window.location.search.includes('token=')) {
      return 'share';
    }

    // 2. Hash 기반 파싱 (#share?token=...)
    const rawHash = window.location.hash.replace('#', '').split('?')[0];
    if (rawHash.startsWith('share')) return 'share';

    const validViews = ['doc', 'statement', 'tax', 'caption', 'archive', 'inspo'];
    return validViews.includes(rawHash) ? rawHash : 'dashboard';
  };

  const getArtIdFromHash = () => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1] || '');
    return urlParams.get('artId') || null;
  };

  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [selectedArtworkId, setSelectedArtworkId] = useState(getArtIdFromHash);
  const [taxSummary, setTaxSummary] = useState({ totalIncome: 0, pendingAmount: 1200000 });
  const [captionCount, setCaptionCount] = useState(() => {
    try {
      const saved = localStorage.getItem('artflow_captions');
      if (saved) return JSON.parse(saved).length;
    } catch (e) {}
    return 3;
  });
  const [isNewToolModalOpen, setIsNewToolModalOpen] = useState(false);

  // 브라우저 뒤로가기 / 앞으로가기 (popstate) 이벤트 감지
  useEffect(() => {
    const handlePopState = () => {
      const v = getViewFromHash();
      setSelectedArtworkId(getArtIdFromHash());
      if (v === 'share') {
        setCurrentView('share');
        return;
      }
      if (!user && v !== 'dashboard') {
        setCurrentView('dashboard');
        setIsLoginModalOpen(true);
      } else {
        setCurrentView(v);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [user]);

  // 캡션 수 실시간 동기화
  useEffect(() => {
    try {
      const saved = localStorage.getItem('artflow_captions');
      if (saved) setCaptionCount(JSON.parse(saved).length);
    } catch (e) {}
  }, [currentView]);

  // 초기 로드 시 기존 로그인 작가 프로필 동기화
  useEffect(() => {
    if (user) {
      syncUserProfile(user);
    }
  }, [user]);

  // 로그인 성공 처리
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    saveUser(loggedInUser);
    syncUserProfile(loggedInUser);
    setIsGuestExploring(false);
  };

  // 로그아웃 처리: 모든 개인 세션 및 둘러보기 상태 완전 초기화 ➔ 무조건 서비스 소개 랜딩 페이지로 복귀
  const handleLogout = () => {
    setUser(null);
    saveUser(null);
    setIsGuestExploring(false);
    setSelectedArtworkId(null);
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    setCurrentView('dashboard');
  };

  // 네비게이션 함수 (비로그인 접근 차단 로그인 월 적용 및 특정 작품 ID 연동)
  const navigate = (viewId, artworkId = null) => {
    // 비로그인(게스트) 상태에서 세부 작업공간(서류, 정산, 작가노트 등) 진입 시 ➔ 로그인 모달 강제 팝업
    if (!user && viewId !== 'dashboard') {
      setIsLoginModalOpen(true);
      return;
    }

    if (artworkId) {
      setSelectedArtworkId(artworkId);
    }

    if (viewId === 'dashboard') {
      setSelectedArtworkId(null);
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
      setCurrentView('dashboard');
    } else {
      const hashStr = artworkId ? `#${viewId}?artId=${artworkId}` : `#${viewId}`;
      window.history.pushState({ view: viewId, artworkId }, '', hashStr);
      setCurrentView(viewId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (window.location.hash) {
      window.history.back();
    } else {
      navigate('dashboard');
    }
  };

  // 비로그인 상태이고 둘러보기 모드가 아닐 때 (단, 보안 공유 링크는 제외) ➔ 랜딩 페이지 표시
  const showLanding = !user && !isGuestExploring && currentView !== 'share';

  return (
    <div className="artflow-app">
      {/* 글로벌 헤더 */}
      <Header 
        currentView={showLanding ? 'landing' : currentView} 
        onGoHome={handleBack} 
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isGuestExploring={isGuestExploring}
        onExitGuest={() => setIsGuestExploring(false)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
      />

      {/* 메인 뷰 컨테이너 */}
      <main className="artflow-main">
        {currentView === 'share' ? (
          <ClientPreviewView onGoHome={() => navigate('dashboard')} />
        ) : showLanding ? (
          /* 비로그인: 서비스 소개 및 쇼케이스 랜딩 페이지 */
          <LandingPage 
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onExploreGuest={() => setIsGuestExploring(true)}
            onOpenPricing={() => setIsPricingModalOpen(true)}
          />
        ) : (
          /* 로그인 또는 게스트 둘러보기: 실제 2-Depth 올인원 워크스페이스 */
          <>
            {currentView === 'dashboard' && (
              <Dashboard 
                onSelectView={(viewId, artworkId) => navigate(viewId, artworkId)}
                taxSummary={taxSummary}
                captionCount={captionCount}
                onOpenNewToolModal={() => setIsNewToolModalOpen(true)}
                onOpenPricing={() => setIsPricingModalOpen(true)}
                user={user}
              />
            )}

            {currentView === 'doc' && (
              <DocStudio onBack={handleBack} />
            )}

            {currentView === 'statement' && (
              <StatementStudio onBack={handleBack} />
            )}

            {currentView === 'tax' && (
              <TaxStudio 
                onBack={handleBack} 
                onUpdateSummary={(summary) => setTaxSummary(summary)}
              />
            )}

            {currentView === 'caption' && (
              <CaptionStudio onBack={handleBack} />
            )}

            {currentView === 'archive' && (
              <ArchiveStudio 
                onBack={handleBack} 
                onNavigateToCaption={() => navigate('caption')}
                onOpenPricing={() => setIsPricingModalOpen(true)}
                user={user}
                initialArtworkId={selectedArtworkId}
              />
            )}

            {currentView === 'inspo' && (
              <InspoVaultView onBack={handleBack} />
            )}
          </>
        )}
      </main>

      {/* 로그인 모달 */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Pro 멤버십 요금제 모달 */}
      <PricingModal 
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        user={user}
        onUpgradeSuccess={(upgradedUser) => {
          setUser(upgradedUser);
          saveUser(upgradedUser);
        }}
        onOpenPolicy={handleOpenPolicy}
      />

      {/* 공식 3대 법적 정책 모달 */}
      <PolicyModal 
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        initialTab={policyTab}
      />

      {/* 새 도구 아이디어 상자 모달 */}
      <NewToolModal 
        isOpen={isNewToolModalOpen} 
        onClose={() => setIsNewToolModalOpen(false)} 
      />

      {/* 공식 미니멀 푸터 (전자상거래법 & 카드사 심사 법적 고지 완비) */}
      <footer className="artflow-footer" style={{ borderTop: '1px solid #E2E8F0', background: '#F8FAFC', padding: '2.5rem 1.5rem 3rem' }}>
        <div className="footer-inner" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 상단 1행: 브랜드 & 약관 바로가기 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A', fontFamily: 'var(--font-serif)' }}>Sujango</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>수장고</span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 600 }}>sujango.com</span>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>창작자를 위한 프라이빗 디지털 수장고</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem' }}>
              <button 
                onClick={() => handleOpenPolicy('terms')}
                style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 500, cursor: 'pointer', padding: 0 }}
              >
                이용약관
              </button>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <button 
                onClick={() => handleOpenPolicy('privacy')}
                style={{ background: 'none', border: 'none', color: '#0F172A', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                개인정보 처리방침
              </button>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <button 
                onClick={() => handleOpenPolicy('refund')}
                style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 500, cursor: 'pointer', padding: 0 }}
              >
                구독 및 환불 규정
              </button>
            </div>
          </div>

          {/* 중단 2행: 전자상거래법 법적 필수 사업자 등록 정보 */}
          <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <span><strong>상호:</strong> Ara Agent Lab</span>
              <span><strong>대표자:</strong> 한서희</span>
              <span><strong>사업자등록번호:</strong> 133-16-68446</span>
              <span><strong>통신판매업신고:</strong> 신고 준비 중</span>
              <span><strong>개인정보보호책임자:</strong> 한서희</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <span><strong>사업장 소재지:</strong> 경기도 화성시 병점구 효행로(진안동,메디피아) 1069. 601-P215호</span>
              <span><strong>고객센터:</strong> <a href="mailto:digitalnote38@gmail.com" style={{ color: '#0284C7', textDecoration: 'none' }}>digitalnote38@gmail.com</a></span>
              <span><strong>호스팅 서비스:</strong> Vercel Inc.</span>
            </div>
          </div>

          {/* 하단 3행: 카피라이트 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem', color: '#94A3B8', paddingTop: '0.5rem' }}>
            <span>Ara Agent Lab © {new Date().getFullYear()} Sujango (sujango.com) • All Rights Reserved.</span>
            <span>수장고는 1인 창작 예술가의 안전한 작품 보관과 행정 업무를 지원합니다.</span>
          </div>

        </div>
      </footer>
    </div>
  );
}
