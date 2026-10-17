import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  AlertCircle, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  ArrowRight,
  User,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getGoogleClientId, saveGoogleClientId, decodeJwtResponse, formatGoogleUser } from '../utils/googleAuth';
import { getKakaoJsKey, saveKakaoJsKey, initKakaoSdk, loginWithKakao } from '../utils/kakaoAuth';
import { DEMO_USER } from '../utils/authStorage';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onExploreGuest }) {
  // Google 상태
  const [googleClientId, setGoogleClientId] = useState(() => getGoogleClientId());
  const [googleInput, setGoogleInput] = useState(() => getGoogleClientId());
  
  // Kakao 상태
  const [kakaoKey, setKakaoKey] = useState(() => getKakaoJsKey());
  const [kakaoInput, setKakaoInput] = useState(() => getKakaoJsKey());

  // 간편 작가 등록 상태
  const [customName, setCustomName] = useState('한서희');
  const [customEmail, setCustomEmail] = useState('digitalnote38@gmail.com');
  const [loginMode, setLoginMode] = useState('direct'); // 'direct' | 'social'

  // UI 탭 및 설정
  const [activeConfigTab, setActiveConfigTab] = useState(null); // 'kakao' | 'google' | null
  const [savedSuccess, setSavedSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const currentGoogleId = getGoogleClientId();
    setGoogleClientId(currentGoogleId);
    setGoogleInput(currentGoogleId);

    const currentKakaoKey = getKakaoJsKey();
    setKakaoKey(currentKakaoKey);
    setKakaoInput(currentKakaoKey);

    // Kakao SDK 초기화
    initKakaoSdk();

    // Google Identity Services (GIS) 초기화
    if (window.google?.accounts?.id && currentGoogleId) {
      try {
        window.google.accounts.id.initialize({
          client_id: currentGoogleId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'signin_with',
            logo_alignment: 'left',
            width: 380,
            locale: 'ko'
          });
        }
      } catch (err) {
        console.warn('Google SDK init error:', err);
      }
    }
  }, [isOpen, googleClientId, kakaoKey]);

  if (!isOpen) return null;

  // 폭죽 효과
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // 1. 대표 작가 계정(김아라)으로 원클릭 로그인
  const handleQuickDemoLogin = () => {
    onLoginSuccess(DEMO_USER);
    onClose();
    triggerConfetti();
  };

  // 2. 내 이름/이메일로 직접 계정 생성 및 로그인
  const handleCustomArtistLogin = (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('작가명을 입력해 주세요.');
      return;
    }

    const newArtistUser = {
      id: `artist-${Date.now()}`,
      name: customName.trim(),
      email: customEmail.trim() || 'artist@sujango.com',
      role: '창작 예술가',
      membership: 'Free Artist',
      isPro: false,
      avatarUrl: '',
      provider: 'direct',
      signedAt: new Date().toISOString()
    };

    onLoginSuccess(newArtistUser);
    onClose();
    triggerConfetti();
  };

  // Google 로그인 완료 콜백
  const handleGoogleCredentialResponse = (response) => {
    if (!response || !response.credential) {
      setErrorMessage('Google 인증 토큰을 받지 못했습니다. 다시 시도해 주세요.');
      return;
    }
    const payload = decodeJwtResponse(response.credential);
    if (payload) {
      const googleUser = formatGoogleUser(payload);
      onLoginSuccess(googleUser);
      onClose();
      triggerConfetti();
    }
  };

  // Kakao 로그인 클릭 핸들러
  const handleKakaoLoginClick = () => {
    setErrorMessage('');
    if (!kakaoKey) {
      // 카카오 키가 아직 등록되지 않은 경우: 간편 카카오 모의 로그인 지원 또는 키 설정 안내
      const kakaoUser = {
        id: `kakao-${Date.now()}`,
        name: customName || '카카오 작가',
        email: customEmail || 'kakao@sujango.com',
        role: '창작 예술가',
        membership: 'Free Artist',
        isPro: false,
        avatarUrl: '',
        provider: 'kakao',
        signedAt: new Date().toISOString()
      };
      onLoginSuccess(kakaoUser);
      onClose();
      triggerConfetti();
      return;
    }

    loginWithKakao(
      (user) => {
        onLoginSuccess(user);
        onClose();
        triggerConfetti();
      },
      (err) => {
        if (err === 'NEED_KEY') {
          setActiveConfigTab('kakao');
        } else {
          setErrorMessage(err || '카카오 로그인에 실패했습니다.');
        }
      }
    );
  };

  // Kakao Key 저장
  const handleSaveKakaoKey = (e) => {
    e.preventDefault();
    if (!kakaoInput.trim()) {
      alert('카카오 JavaScript 키를 입력해 주세요.');
      return;
    }
    saveKakaoJsKey(kakaoInput.trim());
    setKakaoKey(kakaoInput.trim());
    setSavedSuccess('카카오 키가 저장되었습니다!');
    setErrorMessage('');
    setTimeout(() => {
      setSavedSuccess('');
      setActiveConfigTab(null);
    }, 1500);
  };

  // Google Client ID 저장
  const handleSaveGoogleId = (e) => {
    e.preventDefault();
    if (!googleInput.trim()) {
      alert('Google Client ID를 입력해 주세요.');
      return;
    }
    saveGoogleClientId(googleInput.trim());
    setGoogleClientId(googleInput.trim());
    setSavedSuccess('Google Client ID가 저장되었습니다!');
    setErrorMessage('');
    setTimeout(() => {
      setSavedSuccess('');
      setActiveConfigTab(null);
    }, 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ 
          maxWidth: '460px', 
          width: '95%',
          padding: '2rem 1.75rem', 
          maxHeight: '92vh', 
          overflowY: 'auto',
          borderRadius: '16px',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '2px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Sparkles size={12} />
              <span>SUJANGO ARTIST WORKSTATION</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              수장고(Sujango) 시작하기
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
              나만의 안전한 디지털 작품 금고로 즉시 입장하세요.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="닫기" style={{ padding: '4px', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {/* 1순위: 내 이름/이메일로 바로 입장하는 간편 폼 (기본 열림) */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
            <UserCheck size={16} color="#0F172A" />
            <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>내 작가 계정으로 바로 시작하기</strong>
          </div>

          <form onSubmit={handleCustomArtistLogin}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                작가명 (또는 상호) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="예: 한서희"
                  style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                  required
                />
                <User size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                이메일 (작품 백업 및 영수증 수신용)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="digitalnote38@gmail.com"
                  style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                />
                <Mail size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                background: '#0F172A',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{customName || '내'} 수장고 입장하기</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* 원클릭 대표 작가 버튼 */}
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.76rem',
                color: '#0284C7',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              ✨ 대표 작가(김아라) 계정으로 바로 둘러보기
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>또는 소셜 계정으로 연결</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* 2. 카카오 로그인 버튼 */}
        <div style={{ marginBottom: '0.65rem' }}>
          <button
            type="button"
            onClick={handleKakaoLoginClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0.75rem 1rem',
              background: '#FEE500',
              color: '#000000',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000" style={{ flexShrink: 0 }}>
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.26 4.54 6.64-.17.65-.67 2.47-.77 2.85-.12.47.17.46.36.33.25-.17 2.92-2 4.09-2.8.58.08 1.17.12 1.78.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
            </svg>
            <span>카카오로 계속하기</span>
          </button>
        </div>

        {/* 3. Google 공식 로그인 버튼 */}
        <div style={{ marginBottom: '1rem' }}>
          {googleClientId ? (
            <div ref={googleBtnContainerRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '40px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', padding: '0.4rem' }}>Google 로그인 로딩 중...</div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleCustomArtistLogin({ preventDefault: () => {} })}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0.75rem 1rem',
                background: '#FFFFFF',
                color: '#1F2937',
                borderRadius: '8px',
                border: '1px solid #DADCE0',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google 계정으로 계속하기</span>
            </button>
          )}
        </div>

        {/* 에러 / 성공 메시지 */}
        {errorMessage && (
          <div style={{ color: '#DC2626', fontSize: '0.78rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}
        {savedSuccess && (
          <div style={{ color: '#059669', fontSize: '0.78rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* 관리자 전용 OAuth 키 설정 토글 (하단으로 깔끔하게 접어둠) */}
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '0.72rem', color: '#94A3B8' }}>
            <button
              type="button"
              onClick={() => setActiveConfigTab(activeConfigTab === 'kakao' ? null : 'kakao')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
            >
              {kakaoKey ? '🟢 카카오 연동됨' : '⚙️ 카카오 JavaScript 키 등록'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveConfigTab(activeConfigTab === 'google' ? null : 'google')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
            >
              {googleClientId ? '🟢 구글 연동됨' : '⚙️ 구글 Client ID 등록'}
            </button>
          </div>

          {activeConfigTab === 'kakao' && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#92400E', marginBottom: '3px' }}>카카오 JavaScript 키 등록</div>
              <form onSubmit={handleSaveKakaoKey} style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  placeholder="JavaScript 키 붙여넣기"
                  value={kakaoInput}
                  onChange={(e) => setKakaoInput(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem', border: '1px solid #FCD34D', borderRadius: '4px', fontSize: '0.75rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem' }}>저장</button>
              </form>
            </div>
          )}

          {activeConfigTab === 'google' && (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '3px' }}>Google Client ID 등록</div>
              <form onSubmit={handleSaveGoogleId} style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  placeholder="xxxx.apps.googleusercontent.com"
                  value={googleInput}
                  onChange={(e) => setGoogleInput(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.75rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem' }}>저장</button>
              </form>
            </div>
          )}
        </div>

        {/* 둘러보기 및 보안 안내 */}
        <div style={{ textAlign: 'center', paddingTop: '0.35rem' }}>
          {onExploreGuest && (
            <button
              type="button"
              onClick={onExploreGuest}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.76rem',
                cursor: 'pointer',
                marginBottom: '0.5rem',
                textDecoration: 'underline'
              }}
            >
              로그인 없이 둘러보기 모드로 이동
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.72rem', color: '#94A3B8' }}>
            <ShieldCheck size={13} color="#059669" />
            <span>수장고는 작가님의 개인정보와 작품 자산을 안전하게 암호화 보관합니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
