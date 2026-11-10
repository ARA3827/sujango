import React from 'react';
import { 
  Home, 
  Vault, 
  Plus, 
  AlertCircle, 
  DollarSign, 
  Menu 
} from 'lucide-react';

/**
 * 📱 모바일 전용 6대 아이콘 하단 고정 내비게이션 바
 * 1. 홈: 집 (Home)
 * 2. 작품 보관함: 금고 (Vault)
 * 3. 작가노트/작품등록: + (Plus)
 * 4. 영감노트: 느낌표 (AlertCircle)
 * 5. 가계부: $ (DollarSign)
 * 6. 전체: 햄버거 ☰ (Menu)
 */
export default function BottomNavBar({ 
  currentView, 
  onNavigate, 
  onOpenSideMenu, 
  user 
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: '홈',
      icon: Home,
      view: user ? 'dashboard' : 'landing',
      isActive: currentView === 'dashboard' || currentView === 'landing'
    },
    {
      id: 'archive',
      label: '보관함',
      icon: Vault,
      view: 'archive',
      isActive: currentView === 'archive'
    },
    {
      id: 'statement',
      label: '등록',
      icon: Plus,
      view: 'statement',
      isCenterAction: true,
      isActive: currentView === 'statement'
    },
    {
      id: 'inspo',
      label: '영감',
      icon: AlertCircle,
      view: 'inspo',
      isActive: currentView === 'inspo'
    },
    {
      id: 'tax',
      label: '가계부',
      icon: DollarSign,
      view: 'tax',
      isActive: currentView === 'tax'
    },
    {
      id: 'menu',
      label: '전체',
      icon: Menu,
      isMenu: true,
      isActive: false
    }
  ];

  return (
    <nav className="mobile-bottom-nav mobile-only" aria-label="모바일 하단 고정 내비게이션 바">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav-item ${active ? 'active' : ''} ${item.isCenterAction ? 'center-action' : ''}`}
              onClick={() => {
                if (item.isMenu) {
                  onOpenSideMenu();
                } else {
                  onNavigate(item.view);
                }
              }}
              title={item.label}
              aria-label={item.label}
            >
              <div className="bottom-nav-icon-wrapper">
                <IconComponent size={item.isCenterAction ? 20 : 18} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="bottom-nav-label">{item.label}</span>
              {active && <span className="bottom-nav-active-dot" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
