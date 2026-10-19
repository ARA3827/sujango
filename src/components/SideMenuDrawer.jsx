import React, { useEffect } from 'react';
import { 
  X, 
  Palette, 
  BookOpen, 
  Crown, 
  MessageSquarePlus, 
  HelpCircle, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  LogIn,
  LogOut,
  Mail,
  Building
} from 'lucide-react';

/**
 * 상단 햄버거 메뉴(☰) 클릭 시 우측에서 슬라이드로 열리는 사이드 드로어 메뉴
 */
export default function SideMenuDrawer({
  isOpen,
  onClose,
  user,
  onOpenLogin,
  onLogout,
  onOpenInfoTab,
  onNavigateAbout,
  onNavigateGuide,
  onOpenPricing,
  onOpenFeedback,
  onOpenPolicy
}) {
  // ESC 키로 드로어 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ zIndex: 1100, justifyContent: 'flex-end', padding: 0, animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '100vh',
          background: '#FFFFFF',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box'
        }}
      >
        {/* 드로어 상단 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={20} color="#0F172A" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Sujango</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>수장고</span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'flex', alignItems: 'center' }}
            aria-label="메뉴 닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 작가 프로필 카드 또는 로그인 유도 박스 */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '999px', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', overflow: 'hidden' }}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{user.name} 작가님</div>
                  <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {user.isPro ? <><Crown size={12} color="#EAB308" /> Sujango Pro</> : 'Free 기본 회원'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { onClose(); onLogout(); }}
                style={{ 
                  border: '1px solid #E2E8F0', 
                  background: '#FFFFFF', 
                  color: '#64748B', 
                  cursor: 'pointer', 
                  fontSize: '0.78rem', 
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.background = '#FEF2F2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
                title="로그아웃"
              >
                <LogOut size={13} />
                <span>로그아웃</span>
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                1인 예술가를 위한 프라이빗 수장고
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                로그인하시면 30점 무료 서고와 도록 보안 링크를 바로 이용하실 수 있습니다.
              </p>
              <button
                type="button"
                onClick={() => { onClose(); onOpenLogin(); }}
                className="btn-primary"
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.84rem', justifyContent: 'center' }}
              >
                <LogIn size={14} /> <span>수장고 로그인</span>
              </button>
            </div>
          )}
        </div>

        {/* 메인 메뉴 네비게이션 리스트 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          <div style={{ padding: '0 1.5rem', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>
            수장고 바로가기
          </div>

          {/* 1. 수장고 소개 */}
          <button
            type="button"
            onClick={() => { onClose(); if (onNavigateAbout) onNavigateAbout(); else onOpenInfoTab('about'); }}
            style={{ width: '100%', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Palette size={18} color="#0F172A" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>수장고 소개</span>
            </div>
            <ChevronRight size={16} color="#CBD5E1" />
          </button>

          {/* 2. 이용안내 (3단계 가이드 & Q&A) */}
          <button
            type="button"
            onClick={() => { onClose(); if (onNavigateGuide) onNavigateGuide(); else onOpenInfoTab('guide'); }}
            style={{ width: '100%', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={18} color="#0284C7" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>이용안내 & Q&A</span>
            </div>
            <ChevronRight size={16} color="#CBD5E1" />
          </button>

          {/* 3. 멤버십 요금제 안내 */}
          <button
            type="button"
            onClick={() => { onClose(); onOpenPricing(); }}
            style={{ width: '100%', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={18} color="#D97706" />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>멤버십 요금제</span>
                <span style={{ fontSize: '0.7rem', color: '#059669', background: '#ECFDF5', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', fontWeight: 700 }}>연간 20% 할인</span>
              </div>
            </div>
            <ChevronRight size={16} color="#CBD5E1" />
          </button>

          {/* 4. 새 도구 추가 아이디어 & 이용 후기 */}
          <button
            type="button"
            onClick={() => { onClose(); onOpenFeedback(); }}
            style={{ width: '100%', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquarePlus size={18} color="#7C3AED" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>새 도구 아이디어 & 후기</span>
            </div>
            <ChevronRight size={16} color="#CBD5E1" />
          </button>

          {/* 5. 자주 묻는 질문 (FAQ) */}
          <button
            type="button"
            onClick={() => { onClose(); onOpenInfoTab('faq'); }}
            style={{ width: '100%', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={18} color="#059669" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>자주 묻는 질문 (FAQ)</span>
            </div>
            <ChevronRight size={16} color="#CBD5E1" />
          </button>

          <div style={{ borderTop: '1px solid #F1F5F9', margin: '0.75rem 1.5rem' }} />

          {/* 6. 이용약관 및 개인정보 처리방침 */}
          {onOpenPolicy && (
            <div style={{ padding: '0 1.5rem', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => { onClose(); onOpenPolicy('terms'); }}
                style={{ border: 'none', background: 'transparent', color: '#64748B', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
              >
                이용약관
              </button>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <button
                type="button"
                onClick={() => { onClose(); onOpenPolicy('privacy'); }}
                style={{ border: 'none', background: 'transparent', color: '#64748B', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
              >
                개인정보처리방침
              </button>
            </div>
          )}
        </div>

        {/* 드로어 하단 푸터 (사업자 정보 & 문의 이메일) */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.76rem', color: '#64748B', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>Ara Agent Lab (김아라)</div>
          <div>문의: support@araagentlab.com</div>
          <div style={{ color: '#94A3B8', marginTop: '4px', fontSize: '0.7rem' }}>
            ArtFlow Workstation • 고유 포트 5198
          </div>
        </div>
      </div>
    </div>
  );
}
