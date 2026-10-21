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
import AboutPage from './components/AboutPage';
import GuidePage from './components/GuidePage';
import LoginModal from './components/LoginModal';
import PolicyModal from './components/PolicyModal';
import PricingModal from './components/PricingModal';
import CheckoutModal from './components/CheckoutModal';
import PaymentResultModal from './components/PaymentResultModal';
import ClientPreviewView from './components/ClientPreviewView';
import SideMenuDrawer from './components/SideMenuDrawer';
import InfoModal from './components/InfoModal';
import ShortcutModal from './components/ShortcutModal';
import { getStoredUser, saveUser, DEMO_USER } from './utils/authStorage';
import { syncUserProfile } from './utils/supabaseClient';
import { exportArchiveBackup } from './utils/archiveStorage';
import { requestPersistentStorage, migrateArtworksToV6 } from './utils/artworkModel';
import { UserCheck, UserX, Sparkles, Crown, AlertCircle, Download, CheckCircle2 } from 'lucide-react';

export default function App() {
  // 인증 상태 관리 (기본값: getStoredUser() 또는 null)
  const [user, setUser] = useState(getStoredUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialMode, setLoginInitialMode] = useState('select'); // 'select' | 'signup' | 'login'

  // 스토리지 안전 알림 배너 상태
  const [storageBanner, setStorageBanner] = useState(null); // { type: 'warning' | 'error', message: string, showDownload: boolean }

  const handleOpenLogin = (mode = 'select') => {
    setLoginInitialMode(mode);
    setIsLoginModalOpen(true);
  };

  // 법적 정책 모달 및 유료 요금제 모달 상태
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('terms');
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // 토스페이먼츠 결제 모달 및 결제 결과 모달 상태
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('yearly');
  const [paymentResult, setPaymentResult] = useState({ isOpen: false, status: 'success', details: null });

  // PWA 바탕화면/홈화면 바로가기 프롬프트 및 모달 상태
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // 6-2-A: 브라우저 영구 보존(Persistent Storage) 요청 & IndexedDB 안전 마이그레이션 실행
  useEffect(() => {
    // 1. 브라우저 영구 보존(Persistent Storage) 자동 요청
    requestPersistentStorage();

    // 2. 안전 마이그레이션 실행 (IndexedDB 스냅샷 기반, 멱등성 보장)
    if (user) {
      migrateArtworksToV6(user);
    }

    // 3. 자가 치유 및 용량 부족 이벤트 리스너 등록
    const handleSelfHealing = (e) => {
      setToastMessage({
        message: e.detail?.message || '저장 공간 확보를 위해 화면 표시용 이미지를 경량화했습니다. 원본은 금고에 무손실 보존되어 있습니다.',
        type: 'info'
      });
      setTimeout(() => setToastMessage(null), 4000);
    };

    const handleStorageFullNoVault = (e) => {
      setStorageBanner({
        type: 'warning',
        message: e.detail?.message || '브라우저 저장 공간이 부족합니다. 소중한 기록을 안전하게 보존하기 위해 백업 파일을 먼저 내려받거나 불필요한 작품을 정리해 주세요.',
        showDownload: true
      });
    };

    const handleMigrationError = (e) => {
      setStorageBanner({
        type: 'error',
        message: '데이터 정리 중 문제가 생겼어요. 작가님의 소중한 기록은 안전하게 남아 있으니 안심하세요.',
        showDownload: true
      });
    };

    window.addEventListener('sujango_self_healing_applied', handleSelfHealing);
    window.addEventListener('sujango_storage_full_no_vault', handleStorageFullNoVault);
    window.addEventListener('sujango_migration_error', handleMigrationError);

    return () => {
      window.removeEventListener('sujango_self_healing_applied', handleSelfHealing);
      window.removeEventListener('sujango_storage_full_no_vault', handleStorageFullNoVault);
      window.removeEventListener('sujango_migration_error', handleMigrationError);
    };
  }, [user]);

  const handleOpenCheckout = (plan, billingCycle = 'yearly') => {
    setSelectedPlanForCheckout(plan);
    setSelectedBillingCycle(billingCycle);
    setIsPricingModalOpen(false);
    setIsCheckoutOpen(true);
  };

  // 사이드 메뉴 드로어 및 2-Depth 안내 센터 모달 상태
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState('about');

  const handleOpenInfoModal = (tab = 'about') => {
    setInfoModalTab(tab);
    setIsInfoModalOpen(true);
  };

  const handleOpenPolicy = (tab = 'terms') => {
    setPolicyTab(tab);
    setIsPolicyModalOpen(true);
  };

  // 브라우저 URL 파싱 (Pathname, Hash 및 Query Search 삼방향 완벽 감지)
  const getViewFromHash = () => {
    // 1. Query Search 파라미터에 token이나 share가 있는 경우 즉시 보안 시안 뷰어로 진입
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('token') || searchParams.get('share') || window.location.search.includes('token=')) {
      return 'share';
    }

    // 2. Hash 기반 파싱 (#share?token=...)
    const rawHash = window.location.hash.replace('#', '').split('?')[0];
    if (rawHash.startsWith('share')) return 'share';

    // 3. Pathname 기반 파싱 (/about, /guide)
    const pathname = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    if (pathname === 'about') return 'about';
    if (pathname === 'guide') return 'guide';

    const validViews = ['doc', 'statement', 'tax', 'caption', 'archive', 'inspo', 'about', 'guide', 'landing'];
    return validViews.includes(rawHash) ? rawHash : (getStoredUser() ? 'dashboard' : 'landing');
  };

  const getArtIdFromHash = () => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1] || '');
    return urlParams.get('artId') || null;
  };

  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [selectedArtworkId, setSelectedArtworkId] = useState(getArtIdFromHash);
  const [taxSummary, setTaxSummary] = useState({ totalIncome: 0, pendingAmount: 0 });
  const [captionCount, setCaptionCount] = useState(() => {
    try {
      const saved = localStorage.getItem('artflow_captions');
      if (saved) return JSON.parse(saved).length;
    } catch (e) {}
    return 0;
  });
  const [isNewToolModalOpen, setIsNewToolModalOpen] = useState(false);

  // 브라우저 뒤로가기 / 앞으로가기 (popstate) 이벤트 감지
  useEffect(() => {
    const handlePopState = () => {
      const v = getViewFromHash();
      setSelectedArtworkId(getArtIdFromHash());
      if (v === 'share' || v === 'about' || v === 'guide') {
        setCurrentView(v);
        return;
      }
      if (!user && v !== 'landing' && v !== 'dashboard') {
        setCurrentView('landing');
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

  // 토스페이먼츠 결제 승인/실패 리다이렉트 URL 감지 및 멤버십 자동 업그레이드
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('payment');
    const paymentKey = searchParams.get('paymentKey');

    if (paymentStatus === 'success' || (paymentKey && !paymentStatus)) {
      const planId = searchParams.get('planId') || 'pro';
      const amount = searchParams.get('amount') || (planId === 'studio' ? '29000' : '9900');
      const orderId = searchParams.get('orderId') || `ORD_${Date.now()}`;
      const cycle = searchParams.get('cycle') || 'yearly';

      const isStudio = planId === 'studio';
      const membershipName = isStudio ? 'Sujango Studio' : 'Sujango Pro';
      const storageLimit = isStudio ? 500 * 1024 * 1024 * 1024 : 100 * 1024 * 1024 * 1024;

      const currentUser = user || getStoredUser() || DEMO_USER;
      const upgradedUser = {
        ...currentUser,
        isPro: true,
        membership: membershipName,
        storageTier: planId,
        storageLimit: storageLimit,
        planExpiresAt: new Date(Date.now() + (cycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
      };

      setUser(upgradedUser);
      saveUser(upgradedUser);
      syncUserProfile(upgradedUser);

      setPaymentResult({
        isOpen: true,
        status: 'success',
        details: {
          orderId,
          amount,
          planId,
          cycle
        }
      });

      // 주소창 깔끔하게 정리 (URL 파라미터 제거)
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    } else if (paymentStatus === 'fail') {
      const code = searchParams.get('code');
      const message = searchParams.get('message');
      const orderId = searchParams.get('orderId');

      setPaymentResult({
        isOpen: true,
        status: 'fail',
        details: {
          code,
          message,
          orderId
        }
      });

      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  }, []);

  // 안내 토스트(Toast) 메시지 상태
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 로그인 성공 처리 (신규 가입 / 기존 로그인 명확한 피드백 제공)
  const handleLoginSuccess = (loggedInUser, meta = {}) => {
    setUser(loggedInUser);
    saveUser(loggedInUser);
    syncUserProfile(loggedInUser);
    setCurrentView('dashboard');

    if (meta.isNewUser) {
      showToast(`🎉 수장고에 오신 것을 환영합니다! ${loggedInUser.name || '작가'}님의 회원가입이 완료되었습니다.`);
    } else {
      showToast(`✨ 다시 오신 것을 환영합니다, ${loggedInUser.name || '작가'}님! 기존 계정으로 로그인되었습니다.`);
    }
  };

  // 로그아웃 처리: 모든 개인 세션 및 둘러보기 상태 완전 초기화 ➔ 무조건 서비스 소개 랜딩 페이지로 복귀
  const handleLogout = () => {
    setUser(null);
    saveUser(null);
    setSelectedArtworkId(null);
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    setCurrentView('landing');
    showToast('안전하게 로그아웃되었습니다.', 'info');
  };

  // 네비게이션 함수 (비로그인 접근 차단 로그인 월 적용 및 특정 작품 ID 연동)
  const navigate = (viewId, artworkId = null) => {
    const isPublicView = ['about', 'guide', 'landing', 'share'].includes(viewId);

    // 비로그인 상태에서 보호된 작업공간(서류, 정산, 작가노트, 대시보드 등) 진입 시 ➔ 로그인 모달 강제 팝업
    if (!user && !isPublicView) {
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
    } else if (viewId === 'landing') {
      setSelectedArtworkId(null);
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
      setCurrentView('landing');
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
      navigate(user ? 'dashboard' : 'landing');
    }
  };

  return (
    <div className="artflow-app">
      {/* 글로벌 헤더 (로고 클릭 시 항상 메인 페이지 이동) */}
      <Header 
        currentView={currentView} 
        onGoHome={() => navigate('landing')} 
        onGoDashboard={() => navigate('dashboard')}
        user={user}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onNavigateAbout={() => navigate('about')}
        onNavigateGuide={() => navigate('guide')}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenSideMenu={() => setIsSideMenuOpen(true)}
      />

      {/* 🚀 상단 플로팅 안내 토스트 (로그인/회원가입/로그아웃 명확한 피드백) */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '0.65rem 1.25rem',
            borderRadius: '999px',
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.86rem',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            pointerEvents: 'none'
          }}
        >
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* 6-2-A: 스토리지 안전 배너 (저장 공간 부족 / 변환 실패 시 안심 안내 및 백업 다운로드 버튼) */}
      {storageBanner && (
        <div 
          style={{
            maxWidth: '1120px',
            margin: '0.75rem auto 0',
            padding: '0.85rem 1.25rem',
            background: storageBanner.type === 'error' ? '#FEF2F2' : '#FFFBEB',
            border: `1px solid ${storageBanner.type === 'error' ? '#FECACA' : '#FDE68A'}`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: storageBanner.type === 'error' ? '#991B1B' : '#92400E', fontSize: '0.88rem', fontWeight: 500 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{storageBanner.message}</span>
          </div>
          {storageBanner.showDownload && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => exportArchiveBackup(user)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>백업 파일 내려받기</span>
              </button>
              <button
                onClick={() => setStorageBanner(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                닫기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 메인 뷰 컨테이너 */}
      <main className="artflow-main">
        {currentView === 'share' ? (
          <ClientPreviewView onGoHome={() => navigate(user ? 'dashboard' : 'landing')} />
        ) : currentView === 'about' ? (
          /* 수장고 소개 (브랜드 스토리 및 철학) */
          <AboutPage 
            onOpenLogin={handleOpenLogin}
            onNavigateToGuide={() => navigate('guide')}
          />
        ) : currentView === 'guide' ? (
          /* 수장고 시각적 이용안내 및 FAQ (Q&A) */
          <GuidePage 
            onOpenLogin={handleOpenLogin}
            onNavigateToAbout={() => navigate('about')}
          />
        ) : currentView === 'landing' || !user ? (
          /* 메인 소개 및 쇼케이스 랜딩 페이지 (로고 클릭 시 표시) */
          <LandingPage 
            user={user}
            onOpenLogin={handleOpenLogin}
            onNavigateToGuide={() => navigate('guide')}
            onNavigateToAbout={() => navigate('about')}
            onOpenPricing={() => setIsPricingModalOpen(true)}
            onGoDashboard={() => navigate('dashboard')}
            onSelectView={(viewId) => navigate(viewId)}
          />
        ) : (
          /* 로그인 회원 전용: 실제 2-Depth 올인원 워크스페이스 */
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
              <DocStudio onBack={handleBack} user={user} />
            )}

            {currentView === 'statement' && (
              <StatementStudio 
                onBack={handleBack} 
                user={user}
                onNavigateToArchive={(newArtId) => navigate('archive', newArtId)}
                initialArtworkId={selectedArtworkId}
              />
            )}

            {currentView === 'tax' && (
              <TaxStudio 
                onBack={handleBack} 
                onUpdateSummary={(summary) => setTaxSummary(summary)}
                user={user}
              />
            )}

            {currentView === 'caption' && (
              <CaptionStudio 
                onBack={handleBack} 
                user={user} 
                initialArtworkId={selectedArtworkId}
              />
            )}

            {currentView === 'archive' && (
              <ArchiveStudio 
                onBack={handleBack} 
                onNavigateToCaption={(artId) => navigate('caption', artId)}
                onNavigateToStatement={(artId) => navigate('statement', artId)}
                onOpenPricing={() => setIsPricingModalOpen(true)}
                user={user}
                initialArtworkId={selectedArtworkId}
              />
            )}


            {currentView === 'inspo' && (
              <InspoVaultView onBack={handleBack} user={user} />
            )}
          </>
        )}
      </main>

      {/* 로그인 및 회원가입 모달 */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        initialMode={loginInitialMode}
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
        onSelectPlanForCheckout={handleOpenCheckout}
      />

      {/* 토스페이먼츠 보안 결제 및 주문서 모달 */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={selectedPlanForCheckout}
        billingCycle={selectedBillingCycle}
        user={user}
        onPaymentSuccess={(upgradedUser) => {
          setUser(upgradedUser);
          saveUser(upgradedUser);
          setIsCheckoutOpen(false);
        }}
      />

      {/* 결제 완료 축하 및 승인 결과 모달 */}
      <PaymentResultModal 
        isOpen={paymentResult.isOpen}
        onClose={() => setPaymentResult(prev => ({ ...prev, isOpen: false }))}
        status={paymentResult.status}
        details={paymentResult.details}
        onNavigateToArchive={() => navigate('archive')}
      />

      {/* 공식 3대 법적 정책 모달 */}
      <PolicyModal 
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        initialTab={policyTab}
      />

      {/* 새 도구 아이디어 & 작가 후기 모달 */}
      <NewToolModal 
        isOpen={isNewToolModalOpen} 
        onClose={() => setIsNewToolModalOpen(false)} 
        user={user}
      />

      {/* 우측 슬라이드 사이드 드로어 메뉴 (햄버거 ☰ 버튼 연동) */}
      <SideMenuDrawer 
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        user={user}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onNavigateAbout={() => navigate('about')}
        onNavigateGuide={() => navigate('guide')}
        onOpenInfoTab={handleOpenInfoModal}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenFeedback={() => setIsNewToolModalOpen(true)}
        onOpenPolicy={handleOpenPolicy}
        onOpenShortcut={() => setIsShortcutModalOpen(true)}
      />

      {/* 바탕화면 / 모바일 홈 화면 바로가기 추가 모달 */}
      <ShortcutModal 
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
        installPrompt={installPrompt}
      />

      {/* 수장고 소개 / 이용안내 / FAQ 2-Depth 안내 센터 모달 */}
      <InfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        initialTab={infoModalTab}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenFeedback={() => setIsNewToolModalOpen(true)}
      />

      {/* 공식 미니멀 푸터 (전자상거래법 & 카드사 심사 법적 고지 완비) */}
      <footer className="artflow-footer" style={{ borderTop: '1px solid #E2E8F0', background: '#F8FAFC', padding: '2.5rem 1.5rem 3rem' }}>
        <div className="footer-inner" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 상단 1행: 브랜드 & 약관 바로가기 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <img 
                src="/logo-brush.jpg" 
                alt="수장고" 
                style={{ height: '22px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} 
              />
              <strong style={{ fontSize: '0.88rem', color: '#0F172A', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Sujango</strong>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 600 }}>sujango.com</span>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>1인 창작자를 위한 프라이빗 수장고</span>
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
