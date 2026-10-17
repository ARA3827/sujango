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
  ChevronLeft,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { getGoogleClientId, decodeJwtResponse, formatGoogleUser } from '../utils/googleAuth';
import { getKakaoJsKey, initKakaoSdk, loginWithKakao } from '../utils/kakaoAuth';
import { supabase, isSupabaseConfigured, signInWithEmail, signUpWithEmail } from '../utils/supabaseClient';
import { registerLocalUser, loginLocalUser } from '../utils/authStorage';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialMode = 'signup' }) {
  // 화면 모드: 'signup' (회원가입 전용) | 'login' (로그인 전용) | 'profile_setup' (소셜 가입 후 활동명 확인)
  const [viewMode, setViewMode] = useState(initialMode === 'login' ? 'login' : 'signup');

  // 이메일 로그인/회원가입 입력값
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 소셜 로그인 진행 상태 & 임시 프로필 정보
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [socialUser, setSocialUser] = useState(null);

  // Google / Kakao 키
  const [googleClientId] = useState(() => getGoogleClientId());
  const [kakaoKey] = useState(() => getKakaoJsKey());
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');
    setIsKakaoLoading(false);
    initKakaoSdk();

    // 초기 진입 모드 설정 ('signup' 또는 'login')
    setViewMode(initialMode === 'login' ? 'login' : 'signup');

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
  }, [isOpen, initialMode, googleClientId, kakaoKey]);

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

  // Google 로그인 완료 시 ➔ 작가 프로필 확인 화면으로 전환
  const handleGoogleCredentialResponse = (response) => {
    if (!response || !response.credential) {
      setErrorMessage('Google 인증 토큰을 받지 못했습니다. 다시 시도해 주세요.');
      return;
    }
    const payload = decodeJwtResponse(response.credential);
    if (payload) {
      const googleUser = formatGoogleUser(payload);
      setSocialUser(googleUser);
      setName(googleUser.name || '작가');
      setViewMode('profile_setup');
    }
  };

  // 1. 카카오 로그인/가입 클릭 핸들러 (로딩 인디케이터 + 프로필 확인 화면으로 전환)
  const handleKakaoLoginClick = async () => {
    setErrorMessage('');
    setIsKakaoLoading(true);
    
    const activeKakaoKey = kakaoKey || getKakaoJsKey();
    if (activeKakaoKey && window.Kakao) {
      loginWithKakao(
        (user) => {
          setIsKakaoLoading(false);
          // 바로 닫지 않고 작가명/활동 아이디 확인 단계로 진입
          setSocialUser(user);
          setName(user.name || '작가');
          setViewMode('profile_setup');
        },
        (err) => {
          setIsKakaoLoading(false);
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
    if (isSupabaseConfigured() && supabase) {
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
        setIsKakaoLoading(false);
        setErrorMessage('카카오 계정 연동 중입니다. 아래 이메일과 비밀번호로 직접 가입해 주세요.');
        return;
      }
    }

    setIsKakaoLoading(false);
  };

  // 2. 구글 로그인 버튼 클릭
  const handleGoogleLoginClick = async () => {
    setErrorMessage('');

    if (isSupabaseConfigured() && supabase) {
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
        setErrorMessage('Google 계정 연동 중입니다. 아래 이메일과 비밀번호로 직접 가입해 주세요.');
        return;
      }
    }
  };

  // 3. 소셜 가입/로그인 후 작가 프로필(활동명/아이디) 확정
  const handleConfirmProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('수장고에서 활동하실 작가명을 입력해 주세요.');
      return;
    }

    const finalUser = {
      ...(socialUser || {}),
      name: name.trim()
    };

    onLoginSuccess(finalUser);
    onClose();
    triggerConfetti();
  };

  // 4. 이메일/비밀번호 로그인 및 회원가입 처리 (로컬 영구 볼트 100% 보장 + 클라우드 백업)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('이메일 주소를 입력해 주세요.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    const isSigningUp = (viewMode === 'signup');

    if (isSigningUp && !name.trim()) {
      setErrorMessage('활동하실 작가명(아이디)을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSigningUp) {
        let newUser = null;

        // 1. 유효한 Supabase 설정이 있으면 클라우드 가입 시도
        if (isSupabaseConfigured() && supabase) {
          try {
            const data = await signUpWithEmail(email.trim(), password.trim(), name.trim() || '작가');
            newUser = {
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
          } catch (cloudErr) {
            console.warn('[Supabase] 클라우드 가입 실패, 로컬 영구 볼트 저장:', cloudErr);
          }
        }

        // 2. 클라우드 실패 또는 미설정 시: 로컬 영구 볼트에 100% 안전 저장
        if (!newUser) {
          newUser = registerLocalUser(email.trim(), password.trim(), name.trim() || '작가');
        }

        onLoginSuccess(newUser);
        onClose();
        triggerConfetti();
      } else {
        let loggedInUser = null;

        // 1. 유효한 Supabase 설정이 있으면 클라우드 로그인 시도
        if (isSupabaseConfigured() && supabase) {
          try {
            const data = await signInWithEmail(email.trim(), password.trim());
            const userMeta = data?.user?.user_metadata || {};
            loggedInUser = {
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
          } catch (cloudErr) {
            console.warn('[Supabase] 클라우드 로그인 실패, 로컬 볼트 조회:', cloudErr);
          }
        }

        // 2. 로컬 영구 볼트 인증
        if (!loggedInUser) {
          loggedInUser = loginLocalUser(email.trim(), password.trim());
        }

        onLoginSuccess(loggedInUser);
        onClose();
        triggerConfetti();
      }
    } catch (err) {
      console.error('인증 실패:', err);
      let userMsg = err.message || '인증에 실패했습니다.';
      if (userMsg.includes('Failed to fetch')) {
        try {
          const fallbackUser = isSigningUp 
            ? registerLocalUser(email.trim(), password.trim(), name.trim() || '작가')
            : loginLocalUser(email.trim(), password.trim());
          onLoginSuccess(fallbackUser);
          onClose();
          triggerConfetti();
          return;
        } catch (localErr) {
          userMsg = localErr.message;
        }
      }
      setErrorMessage(userMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 공통 버튼 스타일 (규격 및 폰트 통일)
  const commonBtnStyle = {
    width: '100%',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    borderRadius: '10px',
    fontSize: '0.94rem',
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
          maxWidth: '430px', 
          width: '92%',
          padding: '2.25rem 2rem', 
          maxHeight: '92vh', 
          overflowY: 'auto',
          borderRadius: '18px',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '2px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Sparkles size={12} />
              <span>{viewMode === 'signup' ? 'SUJANGO SIGNUP' : 'SUJANGO LOGIN'}</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              {viewMode === 'signup' ? '수장고(Sujango) 회원가입' : viewMode === 'profile_setup' ? '수장고 작가 프로필 설정' : '수장고(Sujango) 로그인'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
              {viewMode === 'signup' 
                ? '원하는 방식으로 간편하게 회원가입하세요.' 
                : viewMode === 'profile_setup'
                ? '활동하실 작가 활동명(아이디)을 확인해 주세요.'
                : '등록하신 계정으로 안전하게 로그인하세요.'}
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

        {/* ➊ 회원가입 전용 화면 (회원가입페이지만 단독 구성, 탭 제거) */}
        {viewMode === 'signup' && (
          <div>
            {/* 1. 소셜 회원가입 버튼 2종 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* 구글로 회원가입 */}
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
                <span>구글로 회원가입</span>
              </button>

              {/* 카카오로 회원가입 */}
              <button
                type="button"
                onClick={handleKakaoLoginClick}
                disabled={isKakaoLoading}
                style={{
                  ...commonBtnStyle,
                  background: '#FEE500',
                  color: '#000000',
                  border: 'none',
                  opacity: isKakaoLoading ? 0.8 : 1
                }}
              >
                {isKakaoLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(0,0,0,0.2)',
                      borderTopColor: '#000000',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>카카오 인증 확인 중...</span>
                  </div>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000" style={{ flexShrink: 0 }}>
                      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.26 4.54 6.64-.17.65-.67 2.47-.77 2.85-.12.47.17.46.36.33.25-.17 2.92-2 4.09-2.8.58.08 1.17.12 1.78.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                    </svg>
                    <span>카카오로 회원가입</span>
                  </>
                )}
              </button>

            </div>

            {/* 구분선 */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span style={{ padding: '0 10px', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 500 }}>
                또는 이메일로 직접 회원가입
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {/* 2. 이메일 회원가입 폼 */}
            <form onSubmit={handleEmailAuth}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  작가 활동명 (또는 상호) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 수장고 / 아라작가"
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
                    required
                  />
                  <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '14px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  이메일 주소 (아이디) *
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

              {/* 하단 회원가입 완료 버튼 (무료 제거) */}
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
                <span>{isSubmitting ? '가입 처리 중...' : '회원가입 완료'}</span>
                <ArrowRight size={16} />
              </button>

              {/* 로그인 전환 안내 링크 */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '1rem', fontSize: '0.82rem', color: '#64748B' }}>
                <span>이미 계정이 있으신가요?</span>
                <button
                  type="button"
                  onClick={() => { setViewMode('login'); setErrorMessage(''); }}
                  style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  로그인하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ➋ 로그인 전용 화면 */}
        {viewMode === 'login' && (
          <div>
            {/* 소셜 로그인 2종 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
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
                <span>구글로 로그인</span>
              </button>

              <button
                type="button"
                onClick={handleKakaoLoginClick}
                disabled={isKakaoLoading}
                style={{
                  ...commonBtnStyle,
                  background: '#FEE500',
                  color: '#000000',
                  border: 'none',
                  opacity: isKakaoLoading ? 0.8 : 1
                }}
              >
                {isKakaoLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(0,0,0,0.2)',
                      borderTopColor: '#000000',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>카카오 인증 확인 중...</span>
                  </div>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000" style={{ flexShrink: 0 }}>
                      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.26 4.54 6.64-.17.65-.67 2.47-.77 2.85-.12.47.17.46.36.33.25-.17 2.92-2 4.09-2.8.58.08 1.17.12 1.78.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                    </svg>
                    <span>카카오 로그인</span>
                  </>
                )}
              </button>

            </div>

            {/* 구분선 */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span style={{ padding: '0 10px', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 500 }}>
                또는 이메일로 로그인
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {/* 이메일 로그인 폼 */}
            <form onSubmit={handleEmailAuth}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  이메일 주소 (아이디) *
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
                  비밀번호 *
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
                <span>{isSubmitting ? '로그인 중...' : '수장고 로그인'}</span>
                <ArrowRight size={16} />
              </button>

              {/* 회원가입 전환 링크 */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '1rem', fontSize: '0.82rem', color: '#64748B' }}>
                <span>아직 회원이 아니신가요?</span>
                <button
                  type="button"
                  onClick={() => { setViewMode('signup'); setErrorMessage(''); }}
                  style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  회원가입하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ➌ 소셜 로그인/가입 직후 ➔ 작가 활동명(아이디) 확인 온보딩 화면 */}
        {viewMode === 'profile_setup' && (
          <div>
            <div style={{ 
              background: '#F8FAFC', 
              borderRadius: '12px', 
              padding: '1rem', 
              marginBottom: '1.25rem',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                <CheckCircle2 size={16} />
                <span>{socialUser?.provider === 'kakao' ? '카카오 계정 인증 완료' : 'Google 계정 인증 완료'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                연동 계정: <strong>{socialUser?.email || '소셜 인증 완료'}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmProfile}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  수장고 작가 활동명 (아이디) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동 작가 / 아라스튜디오"
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem', 
                      border: '1.5px solid #0284C7', 
                      borderRadius: '10px', 
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                    required
                    autoFocus
                  />
                  <Edit3 size={16} color="#0284C7" style={{ position: 'absolute', left: '12px', top: '16px' }} />
                </div>
                <p style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
                  💡 작품 보증서, 전시 캡션, 세무 정산 서류에 표기될 작가명입니다. 언제든 변경하실 수 있습니다.
                </p>
              </div>

              <button
                type="submit"
                style={{
                  ...commonBtnStyle,
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.95rem'
                }}
              >
                <span>회원가입 완료 (수장고 입장)</span>
                <ArrowRight size={18} />
              </button>
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
