import React from 'react';
import { Palette, Sparkles, User, LogOut, LogIn, Eye, Crown, Menu } from 'lucide-react';

export default function Header({ 
  currentView, 
  onGoHome, 
  user, 
  onOpenLogin, 
  onLogout,
  isGuestExploring,
  onExitGuest,
  onOpenPricing,
  onOpenSideMenu
}) {
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
        {/* 좌측 브랜드 로고 */}
        <div className="brand-wrapper" onClick={onGoHome} role="button" tabIndex={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={22} strokeWidth={2.2} color="#0F172A" />
            <span className="brand-title">Sujango</span>
          </div>
          <span className="brand-badge">수장고</span>
        </div>

        {/* 우측 사용자 컨트롤 & 상태 표시 */}
        <div className="header-actions">
          <span className="header-date-badge">{dateStr}</span>

          {/* 게스트 체험 중 안내 뱃지 */}
          {isGuestExploring && !user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="guest-badge">
                <Eye size={12} /> 둘러보기(게스트) 모드
              </span>
              <button 
                onClick={onExitGuest}
                className="btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                title="서비스 소개 랜딩 페이지로 돌아가기"
              >
                소개 페이지로
              </button>
            </div>
          )}

          {/* 2-Depth 세부 화면에서 홈 복귀 버튼 */}
          {currentView !== 'dashboard' && currentView !== 'landing' && (
            <button 
              onClick={onGoHome}
              className="btn-outline"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              ← 대시보드 홈
            </button>
          )}

          {/* 실제 Pro 멤버십 유료 회원에게만 표시 */}
          {user && user.isPro && (
            <div
              className="header-pricing-btn"
              style={{ cursor: 'default' }}
              title="Sujango Pro 멤버십 회원"
            >
              <Crown size={14} color="#D97706" />
              <span>Pro 멤버십</span>
            </div>
          )}

          {/* 로그인 상태에 따른 프로필 / 로그인 버튼 */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="user-profile-badge">
                <div className="user-avatar-circle" style={{ overflow: 'hidden' }}>
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="user-info-text">
                  <span className="user-name">{user.name} 작가님</span>
                  <span className="user-role">{user.membership || (user.isPro ? 'Pro' : 'Free')}</span>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', color: '#64748B' }}
                title="로그아웃"
              >
                <LogOut size={13} />
                <span className="hide-mobile">로그아웃</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => onOpenLogin?.('login')}
                className="btn-outline"
                style={{ 
                  padding: '0.4rem 0.85rem', 
                  fontSize: '0.82rem', 
                  borderColor: '#CBD5E1', 
                  color: '#334155',
                  background: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LogIn size={13} />
                <span>로그인</span>
              </button>
              <button 
                onClick={() => onOpenLogin?.('signup')}
                className="btn-primary"
                style={{ 
                  padding: '0.4rem 0.95rem', 
                  fontSize: '0.82rem', 
                  background: '#0F172A', 
                  color: '#FFFFFF', 
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: 'auto'
                }}
              >
                <User size={13} />
                <span>회원가입</span>
              </button>
            </div>
          )}

          {/* 작대기 3개(햄버거) 전체 사이드 메뉴 버튼 */}
          <button
            type="button"
            onClick={onOpenSideMenu}
            className="header-menu-btn"
            aria-label="전체 메뉴 열기"
            title="수장고 소개 / 이용안내 / 전체 메뉴"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
