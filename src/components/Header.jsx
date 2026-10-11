import React from 'react';
import { Palette, Sparkles } from 'lucide-react';

export default function Header({ currentView, onGoHome }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <header className="artflow-header">
      <div className="header-container">
        <div className="brand-wrapper" onClick={onGoHome} role="button" tabIndex={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={22} strokeWidth={2.2} color="#0F172A" />
            <span className="brand-title">ArtFlow</span>
          </div>
          <span className="brand-badge">Ara Agent Lab</span>
        </div>

        <div className="header-actions">
          <span className="header-date-badge">{dateStr}</span>
          {currentView !== 'dashboard' && (
            <button 
              onClick={onGoHome}
              className="btn-outline"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
            >
              ← 대시보드 홈
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
