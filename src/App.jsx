import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocStudio from './components/DocStudio';
import StatementStudio from './components/StatementStudio';
import TaxStudio from './components/TaxStudio';
import FocusStudio from './components/FocusStudio';
import NewToolModal from './components/NewToolModal';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [taxSummary, setTaxSummary] = useState({ totalIncome: 0, pendingAmount: 1200000 });
  const [ddaySummary, setDdaySummary] = useState({ 
    nextDday: { title: '시민 아카데미 4주차 출강 강의계획서 제출' }, 
    daysLeft: 9 
  });
  const [timerDone, setTimerDone] = useState(false);
  const [isNewToolModalOpen, setIsNewToolModalOpen] = useState(false);

  return (
    <div className="artflow-app">
      {/* 글로벌 헤더 */}
      <Header 
        currentView={currentView} 
        onGoHome={() => setCurrentView('dashboard')} 
      />

      {/* 메인 뷰 컨테이너 (2-Depth 전환) */}
      <main className="artflow-main">
        {currentView === 'dashboard' && (
          <Dashboard 
            onSelectView={(viewId) => setCurrentView(viewId)}
            taxSummary={taxSummary}
            ddaySummary={ddaySummary}
            timerDone={timerDone}
            onOpenNewToolModal={() => setIsNewToolModalOpen(true)}
          />
        )}

        {currentView === 'doc' && (
          <DocStudio onBack={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'statement' && (
          <StatementStudio onBack={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'tax' && (
          <TaxStudio 
            onBack={() => setCurrentView('dashboard')} 
            onUpdateSummary={(summary) => setTaxSummary(summary)}
          />
        )}

        {currentView === 'focus' && (
          <FocusStudio 
            onBack={() => setCurrentView('dashboard')} 
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
            Ara Agent Lab © {new Date().getFullYear()} • 모든 데이터는 브라우저(LocalStorage)에 안전하게 보관됩니다.
          </div>
        </div>
      </footer>
    </div>
  );
}
