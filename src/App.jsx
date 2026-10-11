import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocStudio from './components/DocStudio';
import StatementStudio from './components/StatementStudio';
import TaxStudio from './components/TaxStudio';
import CaptionStudio from './components/CaptionStudio';
import ArchiveStudio from './components/ArchiveStudio';
import NewToolModal from './components/NewToolModal';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import PolicyModal from './components/PolicyModal';
import PricingModal from './components/PricingModal';
import { getStoredUser, saveUser, DEMO_USER } from './utils/authStorage';
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

  // 브라우저 Hash 기반 URL 파싱 (뒤로가기 완벽 연동)
  const getViewFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['doc', 'statement', 'tax', 'caption', 'archive'];
    return validViews.includes(hash) ? hash : 'dashboard';
  };

  const [currentView, setCurrentView] = useState(getViewFromHash);
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
      setCurrentView(v);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // 캡션 수 실시간 동기화
  useEffect(() => {
    try {
      const saved = localStorage.getItem('artflow_captions');
      if (saved) setCaptionCount(JSON.parse(saved).length);
    } catch (e) {}
  }, [currentView]);

  // 로그인 성공 처리
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    saveUser(loggedInUser);
    setIsGuestExploring(false);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setUser(null);
    saveUser(null);
    setIsGuestExploring(false);
    navigate('dashboard');
  };

  // 네비게이션 함수
  const navigate = (viewId) => {
    if (viewId === 'dashboard') {
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
      setCurrentView('dashboard');
    } else {
      window.history.pushState({ view: viewId }, '', `#${viewId}`);
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

  // 비로그인 상태이고 둘러보기 모드가 아닐 때 ➔ 랜딩 페이지 표시
  const showLanding = !user && !isGuestExploring;

  return (
    <div className="artflow-app">
      {/* 🧪 간편 테스트 모드 스위처 바 */}
      <aside className="auth-mode-test-bar" aria-label="테스트 모드 스위처">
        <div className="test-bar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="test-bar-label">모드 전환 테스트:</span>
            {user ? (
              <span className="test-badge logged-in">
                <UserCheck size={13} /> 로그인 상태 ({user.name} 작가님)
              </span>
            ) : isGuestExploring ? (
              <span className="test-badge guest">
                <Sparkles size={13} /> 비로그인 (둘러보기 모드)
              </span>
            ) : (
              <span className="test-badge logged-out">
                <UserX size={13} /> 비로그인 (서비스 소개 랜딩)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {user ? (
              <button 
                onClick={handleLogout}
                className="test-toggle-btn"
                title="비로그인 상태(랜딩 페이지)로 전환"
              >
                비로그인 화면 보기
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleLoginSuccess(DEMO_USER)}
                  className="test-toggle-btn primary"
                  title="김아라 작가로 로그인한 화면 보기"
                >
                  로그인 화면 보기 (김아라)
                </button>
                {showLanding && (
                  <button 
                    onClick={() => setIsGuestExploring(true)}
                    className="test-toggle-btn"
                  >
                    대시보드 둘러보기
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

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
        {showLanding ? (
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
                onSelectView={(viewId) => navigate(viewId)}
                taxSummary={taxSummary}
                captionCount={captionCount}
                onOpenNewToolModal={() => setIsNewToolModalOpen(true)}
                onOpenPricing={() => setIsPricingModalOpen(true)}
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
              />
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

      {/* 공식 미니멀 푸터 (법적 고지 완비) */}
      <footer className="artflow-footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong>ArtFlow</strong>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <span>1인 예술가를 위한 AI 행정 비서 & 정산 워크스테이션</span>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <button 
                onClick={() => setIsPricingModalOpen(true)} 
                style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Crown size={12} /> Pro 멤버십 안내
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#64748B', flexWrap: 'wrap' }}>
              <span>운영사: Ara Agent Lab</span>
              <span>•</span>
              <button 
                onClick={() => handleOpenPolicy('terms')}
                style={{ background: 'none', border: 'none', color: '#475569', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '0.78rem' }}
              >
                서비스 이용약관
              </button>
              <span>•</span>
              <button 
                onClick={() => handleOpenPolicy('privacy')}
                style={{ background: 'none', border: 'none', color: '#475569', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '0.78rem' }}
              >
                개인정보 처리방침
              </button>
              <span>•</span>
              <button 
                onClick={() => handleOpenPolicy('refund')}
                style={{ background: 'none', border: 'none', color: '#475569', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '0.78rem' }}
              >
                구독 및 환불 규정
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#94A3B8' }}>
            Ara Agent Lab © {new Date().getFullYear()} • 모든 데이터는 기기(LocalStorage)에 안전하게 보관됩니다.
          </div>
        </div>
      </footer>
    </div>
  );
}
