import React from 'react';
import { Palette, Sparkles, User, LogOut, LogIn, Crown, Menu, BookOpen, Info } from 'lucide-react';

export default function Header({ 
  currentView, 
  onGoHome, 
  onGoDashboard,
  user, 
  onOpenLogin, 
  onLogout,
  onNavigateAbout,
  onNavigateGuide,
  onOpenSideMenu
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const isAboutActive = currentView === 'about';
  const isGuideActive = currentView === 'guide';

  return (
    <header className="artflow-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E2E8F0' }}>
      <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1.5rem' }}>
        
        {/* 1. 좌측 브랜드 로고 */}
        <div 
          className="brand-wrapper" 
          onClick={onGoHome} 
          role="button" 
          tabIndex={0}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={22} strokeWidth={2.2} color="#0F172A" />
            <span className="brand-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
              Sujango
            </span>
          </div>
          <span className="brand-badge" style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
            수장고
          </span>
        </div>

        {/* 2. 중앙 메인 네비게이션: [수장고 소개] & [이용안내] */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onNavigateAbout}
            style={{
              background: isAboutActive ? '#F1F5F9' : 'transparent',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: isAboutActive ? 700 : 500,
              color: isAboutActive ? '#0F172A' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            수장고 소개
          </button>

          <button
            type="button"
            onClick={onNavigateGuide}
            style={{
              background: isGuideActive ? '#F1F5F9' : 'transparent',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: isGuideActive ? 700 : 500,
              color: isGuideActive ? '#0F172A' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            이용안내
          </button>
        </nav>

        {/* 3. 우측 사용자 컨트롤 & 상태 표시 */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* 2-Depth 세부 작업공간에서 대시보드 복귀 버튼 (로그인 회원 전용) */}
          {user && currentView !== 'dashboard' && (
            <button 
              onClick={() => onGoDashboard ? onGoDashboard() : onGoHome()}
              className="btn-outline"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: '#FFFFFF', borderColor: '#CBD5E1', color: '#0F172A', fontWeight: 600 }}
            >
              ← {user.name && user.name !== '작가' ? `${user.name}님의 수장고` : '내 수장고'}
            </button>
          )}

          {/* 실제 Pro 멤버십 유료 회원에게만 표시 */}
          {user && user.isPro && (
            <div
              className="header-pricing-btn"
              style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', background: '#FEF3C7', color: '#92400E', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}
              title="Sujango Pro 멤버십 회원"
            >
              <Crown size={14} color="#D97706" />
              <span>Pro 멤버십</span>
            </div>
          )}

          {/* 로그인 상태에 따른 프로필 / 로그인 버튼 */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="user-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.3rem 0.65rem', borderRadius: '999px' }}>
                <div className="user-avatar-circle" style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, overflow: 'hidden' }}>
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    (user.name || '작').charAt(0)
                  )}
                </div>
                <div className="user-info-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span className="user-name" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{user.name} 작가님</span>
                  <span className="user-role" style={{ fontSize: '0.7rem', color: '#64748B' }}>{user.membership || (user.isPro ? 'Pro' : 'Free')}</span>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', color: '#64748B', borderColor: '#E2E8F0', background: '#FFFFFF' }}
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
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem', color: '#475569', display: 'flex', alignItems: 'center' }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

