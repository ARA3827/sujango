import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, ExternalLink, HelpCircle, Key, ShieldCheck, MessageCircle } from 'lucide-react';
import { getGoogleClientId, saveGoogleClientId, decodeJwtResponse, formatGoogleUser } from '../utils/googleAuth';
import { getKakaoJsKey, saveKakaoJsKey, initKakaoSdk, loginWithKakao } from '../utils/kakaoAuth';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  // Google 상태
  const [googleClientId, setGoogleClientId] = useState(() => getGoogleClientId());
  const [googleInput, setGoogleInput] = useState(() => getGoogleClientId());
  
  // Kakao 상태
  const [kakaoKey, setKakaoKey] = useState(() => getKakaoJsKey());
  const [kakaoInput, setKakaoInput] = useState(() => getKakaoJsKey());

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
      // 아직 Kakao Key가 설정되지 않은 경우 -> 키 등록 탭 열기
      setActiveConfigTab('kakao');
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
        style={{ maxWidth: '440px', padding: '2rem 1.75rem', maxHeight: '92vh', overflowY: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              Sujango (수장고) 시작하기
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
              소셜 계정으로 안전하고 간편하게 로그인하세요.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 1. 카카오 간편 로그인 버튼 */}
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            type="button"
            onClick={handleKakaoLoginClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0.85rem 1rem',
              background: '#FEE500',
              color: '#000000',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.15s ease',
              letterSpacing: '-0.01em'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FDD800'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEE500'}
          >
            {/* 카카오 공식 심볼 아이콘 SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000" style={{ flexShrink: 0 }}>
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.26 4.54 6.64-.17.65-.67 2.47-.77 2.85-.12.47.17.46.36.33.25-.17 2.92-2 4.09-2.8.58.08 1.17.12 1.78.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
            </svg>
            <span style={{ fontWeight: 600 }}>카카오 로그인</span>
          </button>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveConfigTab(activeConfigTab === 'kakao' ? null : 'kakao')}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
            >
              {kakaoKey ? '🟢 카카오 연동됨 (설정 변경)' : '⚙️ 카카오 JavaScript 키 설정'}
            </button>
          </div>
        </div>

        {/* 2. Google 공식 로그인 버튼 */}
        <div style={{ marginBottom: '1.25rem' }}>
          {googleClientId ? (
            <div ref={googleBtnContainerRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B', padding: '0.5rem' }}>Google 로그인 로딩 중...</div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveConfigTab('google')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0.85rem 1rem',
                background: '#FFFFFF',
                color: '#1F2937',
                borderRadius: '8px',
                border: '1px solid #DADCE0',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google 계정으로 계속하기</span>
            </button>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveConfigTab(activeConfigTab === 'google' ? null : 'google')}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
            >
              {googleClientId ? '🟢 Google 연동됨 (설정 변경)' : '⚙️ Google Client ID 설정'}
            </button>
          </div>
        </div>

        {/* 에러 / 성공 메시지 */}
        {errorMessage && (
          <div style={{ color: '#DC2626', fontSize: '0.78rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}
        {savedSuccess && (
          <div style={{ color: '#059669', fontSize: '0.78rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* 3. 카카오 키 설정 창 */}
        {activeConfigTab === 'kakao' && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700, color: '#92400E', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} />
              <span>카카오 JavaScript 키 등록</span>
            </div>
            <p style={{ color: '#78350F', fontSize: '0.74rem', margin: '0 0 8px 0', lineHeight: 1.5 }}>
              카카오 디벨로퍼스 ➔ [내 애플리케이션] ➔ [앱 키]에서 <strong>JavaScript 키</strong>를 복사해 붙여넣어 주세요.
            </p>
            <form onSubmit={handleSaveKakaoKey} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', background: '#FFFFFF' }}
                placeholder="카카오 JavaScript 키 붙여넣기"
                value={kakaoInput}
                onChange={(e) => setKakaoInput(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.8rem', whiteSpace: 'nowrap' }}>
                저장
              </button>
            </form>
          </div>
        )}

        {/* 4. 구글 클라이언트 ID 설정 창 */}
        {activeConfigTab === 'google' && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} />
              <span>Google Cloud Client ID 등록</span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.74rem', margin: '0 0 8px 0', lineHeight: 1.5 }}>
              Google Cloud Console에서 발급받은 웹 클라이언트 ID를 붙여넣어 주세요.
            </p>
            <form onSubmit={handleSaveGoogleId} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', background: '#FFFFFF' }}
                placeholder="xxxx.apps.googleusercontent.com"
                value={googleInput}
                onChange={(e) => setGoogleInput(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.8rem', whiteSpace: 'nowrap' }}>
                저장
              </button>
            </form>
          </div>
        )}

        {/* 푸터 보안 배너 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.73rem', color: '#64748B', marginTop: '0.75rem' }}>
          <ShieldCheck size={14} color="#059669" />
          <span>공식 OAuth 보안 인증으로 작가님의 개인정보를 안전하게 보호합니다.</span>
        </div>
      </div>
    </div>
  );
}
