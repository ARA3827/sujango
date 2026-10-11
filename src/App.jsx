import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocStudio from './components/DocStudio';
import StatementStudio from './components/StatementStudio';
import TaxStudio from './components/TaxStudio';
import FocusStudio from './components/FocusStudio';
import NewToolModal from './components/NewToolModal';

export default function App() {
  // 브라우저 Hash 기반 URL 파싱 (뒤로가기 완벽 연동)
  const getViewFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['doc', 'statement', 'tax', 'focus'];
    return validViews.includes(hash) ? hash : 'dashboard';
  };

  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [taxSummary, setTaxSummary] = useState({ totalIncome: 0, pendingAmount: 1200000 });
  const [ddaySummary, setDdaySummary] = useState({ 
    nextDday: { title: '시민 아카데미 4주차 출강 강의계획서 제출' }, 
    daysLeft: 9 
  });
  const [timerDone, setTimerDone] = useState(false);
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

  // 네비게이션 함수: 브라우저 History와 연동하여 뒤로가기 클릭 시 웹사이트 밖으로 튕김 원천 차단
  const navigate = (viewId) => {
    if (viewId === 'dashboard') {
      if (window.location.hash) {
        // 브라우저 히스토리 뒤로가기 지원
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
      window.history.back(); // 브라우저 이전 히스토리로 돌아가기
    } else {
      navigate('dashboard');
    }
  };

  return (
    <div className="artflow-app">
      {/* 글로벌 헤더 */}
      <Header 
        currentView={currentView} 
        onGoHome={handleBack} 
      />

      {/* 메인 뷰 컨테이너 (2-Depth 전환) */}
      <main className="artflow-main">
        {currentView === 'dashboard' && (
          <Dashboard 
            onSelectView={(viewId) => navigate(viewId)}
            taxSummary={taxSummary}
            ddaySummary={ddaySummary}
            timerDone={timerDone}
            onOpenNewToolModal={() => setIsNewToolModalOpen(true)}
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

        {currentView === 'focus' && (
          <FocusStudio 
            onBack={handleBack} 
            onUpdateTimerStatus={(status) => setTimerDone(status)}
            onUpdateDdaySummary={(summary) => setDdaySummary(summary)}
          />
        )}
      </main>

      {/* 새 도구 아이디어 상자 모달 */}
      <NewToolModal 
        isOpen={isNewToolModalOpen} 
        onClose={() => setIsNewToolModalOpen(false)} 
      />

      {/* 미니멀 푸터 */}
      <footer className="artflow-footer">
        <div className="footer-inner">
          <div>
            <strong>ArtFlow</strong> • 1인 예술가를 위한 AI 행정 비서 & 정산 워크스테이션
          </div>
          <div>
            Ara Agent Lab © {new Date().getFullYear()} • 모든 데이터는 기기(LocalStorage)에 안전하게 보관됩니다.
          </div>
        </div>
      </footer>
    </div>
  );
}
