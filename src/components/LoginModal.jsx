import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  AlertCircle, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { getGoogleClientId, saveGoogleClientId, decodeJwtResponse, formatGoogleUser } from '../utils/googleAuth';
import { getKakaoJsKey, saveKakaoJsKey, initKakaoSdk, loginWithKakao } from '../utils/kakaoAuth';
import { signInWithEmail, signUpWithEmail } from '../utils/supabaseClient';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  // 인증 방식 탭: 'email' | 'social'
  const [authMode, setAuthMode] = useState('email'); // 'email' (정식 이메일/비밀번호) | 'social' (카카오/구글)
  const [isSignUp, setIsSignUp] = useState(false); // false: 로그인, true: 회원가입

  // 정식 이메일/비밀번호 상태
  const [email, setEmail] = useState('digitalnote38@gmail.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('한서희');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google 상태
  const [googleClientId, setGoogleClientId] = useState(() => getGoogleClientId());
  const [googleInput, setGoogleInput] = useState(() => getGoogleClientId());
  
  // Kakao 상태
  const [kakaoKey, setKakaoKey] = useState(() => getKakaoJsKey());
  const [kakaoInput, setKakaoInput] = useState(() => getKakaoJsKey());

  // 키 설정 창 토글
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

    initKakaoSdk();

    // Google GIS 초기화
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

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // 1. Supabase 정식 이메일/비밀번호 로그인 및 회원가입 처리
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSavedSuccess('');

    if (!email.trim()) {
      setErrorMessage('이메일을 입력해 주세요.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        // 정식 회원가입
        const data = await signUpWithEmail(email.trim(), password.trim(), name.trim() || '작가');
        
        // Supabase에서 이메일 인증이 필요한 경우 안내
        if (data?.user && !data.session) {
          setSavedSuccess('회원가입 요청이 전송되었습니다! 이메일함을 확인하시거나, 바로 로그인을 시도해 주세요.');
          setIsSignUp(false);
          setIsSubmitting(false);
          return;
        }

        const newUser = {
          id: data?.user?.id || `user-${Date.now()}`,
          name: name.trim() || '작가',
          email: email.trim(),
          role: '창작 예술가',
          membership: 'Free Artist',
          isPro: false,
          avatarUrl: '',
          provider: 'supabase_email',
          signedAt: new Date().toISOString()
        };

        onLoginSuccess(newUser);
        onClose();
        triggerConfetti();
      } else {
        // 정식 로그인
        const data = await signInWithEmail(email.trim(), password.trim());
        const userMeta = data?.user?.user_metadata || {};
        
        const loggedInUser = {
          id: data?.user?.id || `user-${Date.now()}`,
          name: userMeta.name || name.trim() || '작가',
          email: data?.user?.email || email.trim(),
          role: userMeta.role || '창작 예술가',
          membership: 'Free Artist',
          isPro: false,
          avatarUrl: userMeta.avatarUrl || '',
          provider: 'supabase_email',
          signedAt: new Date().toISOString()
        };

        onLoginSuccess(loggedInUser);
        onClose();
        triggerConfetti();
      }
    } catch (err) {
      console.error('인증 실패:', err);
      let userMsg = err.message || '인증에 실패했습니다.';
      if (userMsg.includes('Invalid login credentials')) {
        userMsg = '이메일 또는 비밀번호가 올바르지 않습니다. 처음 이용하시는 경우 아래 [새 계정 만들기(회원가입)]를 눌러 가입해 주세요.';
      } else if (userMsg.includes('User already registered')) {
        userMsg = '이미 가입된 이메일입니다. [로그인]을 진행해 주세요.';
        setIsSignUp(false);
      }
      setErrorMessage(userMsg);
    } finally {
      setIsSubmitting(false);
    }
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
              <span>SUJANGO AUTHENTICATION</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              수장고(Sujango) 정식 로그인
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
              클라우드 서버(Supabase) 암호화 인증으로 안전하게 로그인하세요.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="닫기" style={{ padding: '4px', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {/* 인증 모드 탭 (이메일 정식 로그인 vs 소셜 로그인) */}
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: authMode === 'email' ? '#FFFFFF' : 'transparent',
              color: authMode === 'email' ? '#0F172A' : '#64748B',
              fontWeight: authMode === 'email' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: authMode === 'email' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            이메일 / 비밀번호 로그인
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('social'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: authMode === 'social' ? '#FFFFFF' : 'transparent',
              color: authMode === 'social' ? '#0F172A' : '#64748B',
              fontWeight: authMode === 'social' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: authMode === 'social' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            소셜 로그인 (카카오/구글)
          </button>
        </div>

        {/* 에러 및 성공 안내 메시지 */}
        {errorMessage && (
          <div style={{ padding: '0.65rem 0.85rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.5 }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}
        {savedSuccess && (
          <div style={{ padding: '0.65rem 0.85rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={16} />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* 탭 1: Supabase 정식 이메일/비밀번호 인증 */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailAuth}>
            {isSignUp && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  작가명 (또는 상호) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                    required={isSignUp}
                  />
                  <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '13px' }} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                이메일 주소 *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artist@example.com"
                  style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                  required
                />
                <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '13px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                비밀번호 (6자 이상) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                  required
                />
                <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '13px' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: '#0F172A',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <span>{isSubmitting ? '인증 처리 중...' : isSignUp ? '수장고 무료 회원가입 완료' : '수장고 로그인'}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '1rem', fontSize: '0.8rem', color: '#64748B' }}>
              <span>{isSignUp ? '이미 계정이 있으신가요?' : '처음 방문하셨나요?'}</span>
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                {isSignUp ? '기존 계정으로 로그인' : '새 계정 만들기 (회원가입)'}
              </button>
            </div>
          </form>
        )}

        {/* 탭 2: 소셜 로그인 (카카오 / 구글) */}
        {authMode === 'social' && (
          <div>
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
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.26 4.54 6.64-.17.65-.67 2.47-.77 2.85-.12.47.17.46.36.33.25-.17 2.92-2 4.09-2.8.58.08 1.17.12 1.78.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                </svg>
                <span>카카오 로그인</span>
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              {googleClientId ? (
                <div ref={googleBtnContainerRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', padding: '0.4rem' }}>Google 로그인 준비 중...</div>
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
                    border: '1px solid #CBD5E1',
                    fontWeight: 600,
                    fontSize: '0.9rem',
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

            {/* 소셜 로그인 키 설정 안내 (아코디언) */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem', fontSize: '0.78rem', color: '#64748B' }}>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                💡 카카오/구글 소셜 로그인이 처음이신가요?
              </div>
              <p style={{ margin: '0 0 6px 0', lineHeight: 1.5, fontSize: '0.74rem' }}>
                카카오 및 구글 공식 보안 정책상, 도메인(sujango.com)을 각 개발자 콘솔에 등록하고 발급받은 키를 1회 연동해야 팝업이 활성화됩니다.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveConfigTab(activeConfigTab === 'kakao' ? null : 'kakao')}
                  style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.74rem' }}
                >
                  ⚙️ 카카오 JavaScript 키 등록하기
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setActiveConfigTab(activeConfigTab === 'google' ? null : 'google')}
                  style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.74rem' }}
                >
                  ⚙️ Google Client ID 등록하기
                </button>
              </div>

              {activeConfigTab === 'kakao' && (
                <form onSubmit={handleSaveKakaoKey} style={{ display: 'flex', gap: '4px', marginTop: '0.65rem' }}>
                  <input
                    type="text"
                    placeholder="카카오 JavaScript 키 붙여넣기"
                    value={kakaoInput}
                    onChange={(e) => setKakaoInput(e.target.value)}
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.75rem' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.65rem', fontSize: '0.72rem' }}>저장</button>
                </form>
              )}

              {activeConfigTab === 'google' && (
                <form onSubmit={handleSaveGoogleId} style={{ display: 'flex', gap: '4px', marginTop: '0.65rem' }}>
                  <input
                    type="text"
                    placeholder="Google Client ID 붙여넣기"
                    value={googleInput}
                    onChange={(e) => setGoogleInput(e.target.value)}
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.75rem' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.65rem', fontSize: '0.72rem' }}>저장</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 푸터 보안 배너 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748B', marginTop: '1.25rem' }}>
          <ShieldCheck size={14} color="#059669" />
          <span>공식 암호화 보안 프로토콜로 작가님의 소중한 창작 자산을 안전하게 보호합니다.</span>
        </div>
      </div>
    </div>
  );
}
