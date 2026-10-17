import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { getGoogleClientId, decodeJwtResponse, formatGoogleUser } from '../utils/googleAuth';
import { getKakaoJsKey, initKakaoSdk, loginWithKakao } from '../utils/kakaoAuth';
import { supabase, signInWithEmail, signUpWithEmail } from '../utils/supabaseClient';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  // 화면 모드: 'select' (3대 버튼) | 'email_form' (이메일/비밀번호 입력)
  const [viewMode, setViewMode] = useState('select');
  const [isSignUp, setIsSignUp] = useState(false);

  // 이메일 로그인 입력값
  const [email, setEmail] = useState('digitalnote38@gmail.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('한서희');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google / Kakao 상태
  const [googleClientId] = useState(() => getGoogleClientId());
  const [kakaoKey] = useState(() => getKakaoJsKey());
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');
    initKakaoSdk();

    // Google Identity Services (GIS) 초기화
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
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
            text: 'continue_with',
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

  // 1. 카카오 로그인 클릭 핸들러
  const handleKakaoLoginClick = async () => {
    setErrorMessage('');
    
    const activeKakaoKey = kakaoKey || getKakaoJsKey();
    // 카카오 SDK 등록된 경우 우선 호출
    if (activeKakaoKey && window.Kakao) {
      loginWithKakao(
        (user) => {
          onLoginSuccess(user);
          onClose();
          triggerConfetti();
        },
        (err) => {
          console.warn('Kakao login fail:', err);
          if (err && typeof err === 'string' && err !== 'NEED_KEY') {
            setErrorMessage(err);
          } else {
            setErrorMessage('카카오 로그인 창을 열지 못했습니다. 팝업 차단 여부 또는 설정을 확인해 주세요.');
          }
        }
      );
      return;
    }

    // Supabase OAuth 시도
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'kakao',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        return;
      } catch (err) {
        // 소셜 연동 준비 중일 때 이메일 로그인 폼으로 부드럽게 안내
        setViewMode('email_form');
        setErrorMessage('현재 소셜 계정 승인 준비 중입니다. 간편하게 이메일과 비밀번호로 로그인해 주세요.');
        return;
      }
    }

    setViewMode('email_form');
  };

  // 2. 구글 로그인 클릭 핸들러
  const handleGoogleLoginClick = async () => {
    setErrorMessage('');

    // Supabase OAuth 시도
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        return;
      } catch (err) {
        setViewMode('email_form');
        setErrorMessage('현재 소셜 계정 승인 준비 중입니다. 간편하게 이메일과 비밀번호로 로그인해 주세요.');
        return;
      }
    }

    setViewMode('email_form');
  };

  // 3. Supabase 정식 이메일/비밀번호 로그인 및 회원가입 처리
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');

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

  // 공통 버튼 스타일 (구글, 카카오, 이메일 버튼 동일한 규격 적용)
  const commonBtnStyle = {
    width: '100%',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxSizing: 'border-box'
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ 
          maxWidth: '440px', 
          width: '92%',
          padding: '2.25rem 2rem', 
          maxHeight: '92vh', 
          overflowY: 'auto',
          borderRadius: '16px',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '2px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Sparkles size={12} />
              <span>SUJANGO AUTHENTICATION</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              수장고(Sujango) 시작하기
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
              원하는 방식으로 안전하고 간편하게 로그인하세요.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="닫기" style={{ padding: '4px', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {/* 에러 안내 메시지 */}
        {errorMessage && (
          <div style={{ padding: '0.75rem 0.9rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.8rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.5 }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. 기본 선택 화면: 구글, 카카오, 이메일 동일한 크기의 3대 버튼 */}
        {viewMode === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* ➊ 구글 로그인 버튼 */}
            <button
              type="button"
              onClick={handleGoogleLoginClick}
              style={{
                ...commonBtnStyle,
                background: '#FFFFFF',
                color: '#1F2937',
                border: '1px solid #CBD5E1'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google 계정으로 계속하기</span>
            </button>

            {/* ➋ 카카오 로그인 버튼 */}
            <button
              type="button"
              onClick={handleKakaoLoginClick}
              style={{
                ...commonBtnStyle,
                background: '#FEE500',
                color: '#000000',
                border: 'none'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000" style={{ flexShrink: 0 }}>
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.26 4.54 6.64-.17.65-.67 2.47-.77 2.85-.12.47.17.46.36.33.25-.17 2.92-2 4.09-2.8.58.08 1.17.12 1.78.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              <span>카카오 로그인</span>
            </button>

            {/* ➌ 이메일 로그인 버튼 */}
            <button
              type="button"
              onClick={() => { setViewMode('email_form'); setErrorMessage(''); }}
              style={{
                ...commonBtnStyle,
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none'
              }}
            >
              <Mail size={18} style={{ flexShrink: 0 }} />
              <span>이메일로 시작하기</span>
            </button>

          </div>
        )}

        {/* 2. 이메일/비밀번호 정식 폼 화면 */}
        {viewMode === 'email_form' && (
          <div>
            <button
              type="button"
              onClick={() => { setViewMode('select'); setErrorMessage(''); }}
              style={{
                background: 'none',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#64748B',
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '0 0 1rem 0'
              }}
            >
              <ChevronLeft size={16} />
              <span>다른 로그인 방식 선택</span>
            </button>

            <form onSubmit={handleEmailAuth}>
              {isSignUp && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    작가명 (또는 상호) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
                      required={isSignUp}
                    />
                    <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '14px' }} />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  이메일 주소 *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artist@example.com"
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
                    required
                  />
                  <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '14px' }} />
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
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
                    required
                  />
                  <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '14px' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  ...commonBtnStyle,
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{isSubmitting ? '처리 중...' : isSignUp ? '수장고 무료 회원가입 완료' : '수장고 로그인'}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '1rem', fontSize: '0.82rem', color: '#64748B' }}>
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
          </div>
        )}

        {/* 하단 보안 보증 문구 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748B', marginTop: '1.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
          <ShieldCheck size={15} color="#059669" />
          <span>공식 암호화 보안 프로토콜로 작가님의 창작 자산을 안전하게 보호합니다.</span>
        </div>

      </div>
    </div>
  );
}
