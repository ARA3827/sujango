import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { getGoogleClientId, loginWithGoogle } from '../utils/googleAuth';
import { supabase, isSupabaseConfigured, signInWithEmail, signUpWithEmail, resendConfirmationEmail } from '../utils/supabaseClient';
import { registerLocalUser, loginLocalUser, findRegisteredUser, findRegisteredUserByName, saveOrUpdateSocialUser } from '../utils/authStorage';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) {
  // 화면 모드: 'login' | 'signup' | 'profile_setup' | 'email_sent' | 'signup_success' (가입 환영)
  const [viewMode, setViewMode] = useState(initialMode === 'signup' ? 'signup' : 'login');

  // 이메일 로그인/회원가입 입력값
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');
  const [signupSuccessData, setSignupSuccessData] = useState(null);
  const [existingAccountUser, setExistingAccountUser] = useState(null);

  // Google 로그인 진행 상태 & 소셜 사용자 정보
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [socialUser, setSocialUser] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');
    setIsGoogleLoading(false);
    setViewMode(initialMode === 'signup' ? 'signup' : 'login');
  }, [isOpen, initialMode]);

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

  // 가입 환영 화면에서 대시보드로 입장
  const handleEnterFromSuccess = () => {
    if (signupSuccessData) {
      onLoginSuccess(signupSuccessData, { isNewUser: true });
    }
    onClose();
  };

  // 기존 계정 감지 화면에서 대시보드로 입장
  const handleEnterFromExisting = () => {
    if (existingAccountUser) {
      onLoginSuccess(existingAccountUser, { isNewUser: false });
    }
    onClose();
    triggerConfetti();
  };

  // Google 로그인 / 회원가입 실행 (회원가입 모드에서 기존 회원이면 명확한 중복 안내 화면 노출)
  const handleGoogleAuth = () => {
    setErrorMessage('');
    setIsGoogleLoading(true);

    loginWithGoogle(
      (googleUser) => {
        setIsGoogleLoading(false);

        // 1. 기존 가입 여부 및 기설정된 활동명 확인
        const existing = findRegisteredUser(googleUser.email);
        
        // 닉네임 자동 결정: 기존 설정 이름 유지 -> 구글 프로필 이름 -> 이메일 아이디 -> '작가'
        const candidateName = (existing?.name && existing.name !== '작가')
          ? existing.name
          : (googleUser.name?.trim() || (googleUser.email ? googleUser.email.split('@')[0] : '작가'));

        const finalUser = saveOrUpdateSocialUser({
          ...googleUser,
          ...(existing || {}),
          name: candidateName
        });

        // 2. [회원가입 모드]에서 이미 가입된 Google 계정을 선택한 경우 -> 명확한 계정 확인 화면 노출!
        if (viewMode === 'signup' && existing) {
          setExistingAccountUser(finalUser);
          setViewMode('already_registered');
          return;
        }

        // 3. 신규 회원이면 가입 환영 축하 화면 노출!
        if (!existing) {
          setSignupSuccessData(finalUser);
          setViewMode('signup_success');
          triggerConfetti();
          return;
        }

        // 4. [로그인 모드]에서 정상 기존 로그인이면 즉시 대시보드 입장!
        onLoginSuccess(finalUser, { isNewUser: false });
        onClose();
        triggerConfetti();
      },
      (err) => {
        setIsGoogleLoading(false);
        console.warn('Google login notice:', err);
        if (typeof err === 'string' && (err.includes('origin') || err.includes('not allowed'))) {
          setErrorMessage('Google Cloud 승인 도메인 등록이 필요합니다. 아래 이메일로 바로 로그인하실 수 있습니다.');
        } else {
          setErrorMessage(typeof err === 'string' ? err : 'Google 로그인 창을 열지 못했습니다.');
        }
      }
    );
  };

  // 소셜 최초 가입 시 작가 프로필(활동명/아이디) 확정 (수동 전환 시 폴백용)
  const handleConfirmProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('수장고에서 활동하실 작가명을 입력해 주세요.');
      return;
    }

    const finalUser = saveOrUpdateSocialUser({
      ...(socialUser || {}),
      name: name.trim()
    });

    setSignupSuccessData(finalUser);
    setViewMode('signup_success');
    triggerConfetti();
  };

  // 인증 메일 재발송 처리
  const handleResendConfirmation = async () => {
    const targetEmail = registeredEmail || email;
    if (!targetEmail) return;
    setIsResending(true);
    setResendNotice('');
    try {
      await resendConfirmationEmail(targetEmail);
      setResendNotice('인증 메일을 다시 발송했습니다. 메일함을 확인해 주세요.');
    } catch (err) {
      console.warn('재발송 안내:', err);
      setResendNotice(err.message || '잠시 후 다시 시도해 주세요.');
    } finally {
      setIsResending(false);
    }
  };

  // 이메일/비밀번호 로그인 및 회원가입 처리 (중복 확인 3단계 철벽 방어 + 100% 로컬 영구 볼트)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResendNotice('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setErrorMessage('이메일 주소를 입력해 주세요.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    const isSigningUp = (viewMode === 'signup');

    if (isSigningUp && !cleanName) {
      setErrorMessage('활동하실 작가명(아이디)을 입력해 주세요.');
      return;
    }

    // [중복 확인 1단계: 로컬 사전 검증] 이메일 & 활동명(아이디) 중복 여부 철저 검증
    if (isSigningUp) {
      const existingEmail = findRegisteredUser(cleanEmail);
      if (existingEmail) {
        setErrorMessage('이미 등록된 이메일 주소입니다. 기존 계정으로 로그인해 주세요.');
        return;
      }

      const existingName = findRegisteredUserByName(cleanName);
      if (existingName) {
        setErrorMessage(`이미 사용 중인 활동명(아이디) '${cleanName}' 입니다. 다른 활동명을 입력해 주세요.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isSigningUp) {
        let newUser = null;

        // [중복 확인 2단계: Supabase 클라우드 가입 시도 및 중복 방어]
        if (isSupabaseConfigured() && supabase) {
          try {
            const data = await signUpWithEmail(cleanEmail, cleanPassword, cleanName || '작가');
            
            // Supabase '이메일 열거 방지' 활성화 상태: identities가 빈 배열이면 이미 등록된 계정임
            if (data?.user?.identities && data.user.identities.length === 0) {
              setErrorMessage('이미 등록된 이메일 주소입니다. 기존 계정으로 로그인해 주세요.');
              setIsSubmitting(false);
              return;
            }

            // 이메일 인증이 활성화되어 있어 세션이 아직 없는 경우 -> 인증 메일 확인 안내 화면으로 직관적 전환!
            if (data?.user && !data?.session) {
              setRegisteredEmail(cleanEmail);
              setViewMode('email_sent');
              triggerConfetti();
              return;
            }

            newUser = {
              id: data?.user?.id || `user-${Date.now()}`,
              name: cleanName || '작가',
              email: cleanEmail,
              role: '창작 예술가',
              membership: 'Free Artist',
              isPro: false,
              avatarUrl: '',
              provider: 'supabase_email',
              signedAt: new Date().toISOString()
            };
          } catch (cloudErr) {
            console.warn('[Supabase] 클라우드 가입 결과:', cloudErr);
            const cloudMsg = (cloudErr?.message || '').toLowerCase();
            
            // Supabase가 중복 가입 에러를 반환한 경우 (로컬 가입으로 무분별 폴백되지 않고 즉각 차단!)
            if (
              cloudMsg.includes('already registered') || 
              cloudMsg.includes('already exists') || 
              cloudMsg.includes('duplicate') ||
              cloudMsg.includes('user already registered')
            ) {
              setErrorMessage('이미 등록된 이메일 주소입니다. 기존 계정으로 로그인해 주세요.');
              setIsSubmitting(false);
              return;
            }
          }
        }

        // [중복 확인 3단계: 로컬 영구 볼트에 100% 안전 저장]
        if (!newUser) {
          newUser = registerLocalUser(cleanEmail, cleanPassword, cleanName || '작가');
        }

        // 🌟 [요청 2번] 회원가입 완료 축하 및 환영 화면으로 즉시 전환!
        setSignupSuccessData(newUser);
        setViewMode('signup_success');
        triggerConfetti();
      } else {
        let loggedInUser = null;

        // 1. 유효한 Supabase 설정이 있으면 클라우드 로그인 시도
        if (isSupabaseConfigured() && supabase) {
          try {
            const data = await signInWithEmail(cleanEmail, cleanPassword);
            const userMeta = data?.user?.user_metadata || {};
            loggedInUser = {
              id: data?.user?.id || `user-${Date.now()}`,
              name: userMeta.name || cleanName || '작가',
              email: data?.user?.email || cleanEmail,
              role: userMeta.role || '창작 예술가',
              membership: 'Free Artist',
              isPro: false,
              avatarUrl: userMeta.avatarUrl || '',
              provider: 'supabase_email',
              signedAt: new Date().toISOString()
            };
          } catch (cloudErr) {
            console.warn('[Supabase] 클라우드 로그인 스킵, 로컬 볼트 조회:', cloudErr);
            const cloudMsg = (cloudErr?.message || '').toLowerCase();
            if (cloudMsg.includes('invalid login credentials') || cloudMsg.includes('invalid_grant')) {
              // 로컬 유저가 아예 없는 경우: 가입되지 않은 이메일 안내
              const localUser = findRegisteredUser(cleanEmail);
              if (!localUser) {
                setErrorMessage('가입되지 않은 이메일 주소입니다. [새 계정으로 간편 회원가입]을 진행해 주세요.');
                setIsSubmitting(false);
                return;
              }
            }
          }
        }

        // 2. 로컬 영구 볼트 인증
        if (!loggedInUser) {
          loggedInUser = loginLocalUser(cleanEmail, cleanPassword);
        }

        onLoginSuccess(loggedInUser, { isNewUser: false });
        onClose();
        triggerConfetti();
      }
    } catch (err) {
      console.error('인증 실패:', err);
      let userMsg = err.message || '인증에 실패했습니다.';
      const lower = userMsg.toLowerCase();
      
      // 이메일 미인증 에러 감지 시 친절한 안내로 변환
      if (lower.includes('email not confirmed')) {
        setRegisteredEmail(cleanEmail);
        userMsg = '이메일 인증이 아직 완료되지 않았습니다. 메일함에서 인증 링크를 클릭해 주세요.';
      } else if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('이미 등록된 이메일')) {
        userMsg = '이미 등록된 이메일 주소입니다. 기존 계정으로 로그인해 주세요.';
      } else if (lower.includes('가입되지 않은 이메일') || lower.includes('user not found')) {
        userMsg = '가입되지 않은 이메일 주소입니다. [새 계정으로 간편 회원가입]을 진행해 주세요.';
      } else if (lower.includes('invalid login credentials') || lower.includes('비밀번호가 일치하지 않습니다')) {
        userMsg = '이메일 주소 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.';
      } else if (userMsg.includes('Failed to fetch')) {
        try {
          const fallbackUser = isSigningUp 
            ? registerLocalUser(cleanEmail, cleanPassword, cleanName || '작가')
            : loginLocalUser(cleanEmail, cleanPassword);
          onLoginSuccess(fallbackUser, { isNewUser: isSigningUp });
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.3rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '2px 8px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Sparkles size={12} />
              <span>{viewMode === 'signup' ? 'SUJANGO SIGNUP' : viewMode === 'email_sent' ? 'EMAIL VERIFICATION' : viewMode === 'signup_success' ? 'WELCOME TO SUJANGO' : viewMode === 'already_registered' ? 'ACCOUNT FOUND' : 'SUJANGO LOGIN'}</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              {viewMode === 'signup' 
                ? '수장고(Sujango) 회원가입' 
                : viewMode === 'signup_success'
                ? '수장고에 오신 것을 환영합니다!'
                : viewMode === 'already_registered'
                ? '이미 가입된 계정입니다'
                : viewMode === 'profile_setup' 
                ? '수장고 작가 프로필 설정' 
                : viewMode === 'email_sent'
                ? '이메일 인증 안내'
                : '수장고(Sujango) 로그인'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
              {viewMode === 'signup' 
                ? '원하는 방식으로 간편하게 회원가입하세요.' 
                : viewMode === 'signup_success'
                ? '작가님만의 프라이빗 디지털 아카이브가 개설되었습니다.'
                : viewMode === 'already_registered'
                ? '기존에 등록된 계정으로 안전하게 로그인하실 수 있습니다.'
                : viewMode === 'profile_setup'
                ? '활동하실 작가 활동명(아이디)을 확인해 주세요.'
                : viewMode === 'email_sent'
                ? '수신하신 메일함에서 인증을 완료하시면 가입이 완료됩니다.'
                : '등록하신 계정으로 안전하게 로그인하세요.'}
            </p>
          </div>
          <button 
            onClick={() => {
              if (viewMode === 'signup_success' && signupSuccessData) {
                onLoginSuccess(signupSuccessData, { isNewUser: true });
              } else if (viewMode === 'already_registered' && existingAccountUser) {
                onLoginSuccess(existingAccountUser, { isNewUser: false });
              }
              onClose();
            }} 
            className="modal-close-btn" 
            aria-label="닫기" 
            style={{ padding: '4px', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 재발송 성공 안내 메시지 */}
        {resendNotice && (
          <div style={{ padding: '0.8rem 0.95rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', color: '#065F46', fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
            <span>{resendNotice}</span>
          </div>
        )}

        {/* 에러 안내 메시지 및 스마트 전환 버튼 */}
        {errorMessage && (
          <div style={{ padding: '0.85rem 0.95rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', color: '#991B1B', fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
            {errorMessage.includes('이메일 인증이 아직 완료되지 않았습니다') && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => { setViewMode('email_sent'); setErrorMessage(''); }}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  인증 안내 화면 보기 →
                </button>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  style={{
                    background: '#FFFFFF',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isResending ? '재발송 중...' : '인증 메일 다시 보내기'}
                </button>
              </div>
            )}
            {(errorMessage.includes('이미 등록된 이메일') || errorMessage.includes('이미 가입된 이메일')) && (
              <button
                type="button"
                onClick={() => { setViewMode('login'); setErrorMessage(''); }}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '2px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                기존 계정으로 로그인하기 →
              </button>
            )}
            {errorMessage.includes('가입되지 않은 이메일') && (
              <button
                type="button"
                onClick={() => { setViewMode('signup'); setErrorMessage(''); }}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '2px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                새 계정으로 간편 회원가입 →
              </button>
            )}
          </div>
        )}

        {/* ➊ 회원가입 전용 화면 */}
        {viewMode === 'signup' && (
          <div>
            {/* Google로 회원가입 버튼 */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              style={{
                ...commonBtnStyle,
                background: '#FFFFFF',
                color: '#1F2937',
                border: '1.5px solid #CBD5E1',
                opacity: isGoogleLoading ? 0.7 : 1
              }}
            >
              {isGoogleLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#4285F4',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span>Google 연결 확인 중...</span>
                </div>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>구글로 회원가입</span>
                </>
              )}
            </button>

            {/* 구분선 */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span style={{ padding: '0 10px', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 500 }}>
                또는 이메일로 직접 회원가입
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {/* 이메일 회원가입 폼 */}
            <form onSubmit={handleEmailAuth}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  활동명 (작가명 / 닉네임) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="활동명 또는 작가명을 입력하세요"
                    style={{ 
                      width: '100%', 
                      padding: '0.65rem 0.75rem 0.65rem 2.2rem', 
                      border: Boolean(name.trim() && findRegisteredUserByName(name.trim())) ? '1.5px solid #F59E0B' : '1px solid #CBD5E1', 
                      borderRadius: '8px', 
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                    required
                  />
                  <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '14px' }} />
                </div>
                {Boolean(name.trim() && findRegisteredUserByName(name.trim())) && (
                  <div style={{ marginTop: '5px', padding: '4px 8px', background: '#FFFBEB', borderRadius: '6px', fontSize: '0.75rem', color: '#B45309' }}>
                    <span>이미 등록된 활동명(아이디)입니다. 다른 이름을 사용해 주세요.</span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  이메일 주소 (아이디) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="artist@example.com"
                    style={{ 
                      width: '100%', 
                      padding: '0.65rem 0.75rem 0.65rem 2.2rem', 
                      border: Boolean(email.trim() && findRegisteredUser(email.trim())) ? '1.5px solid #F59E0B' : '1px solid #CBD5E1', 
                      borderRadius: '8px', 
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                    required
                  />
                  <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '14px' }} />
                </div>
                {Boolean(email.trim() && findRegisteredUser(email.trim())) && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', padding: '5px 8px', background: '#FFFBEB', borderRadius: '6px', fontSize: '0.75rem', color: '#B45309' }}>
                    <span>이미 등록된 이메일 주소입니다.</span>
                    <button
                      type="button"
                      onClick={() => { setViewMode('login'); setErrorMessage(''); }}
                      style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      기존 계정으로 로그인 →
                    </button>
                  </div>
                )}
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

              {/* 하단 버튼: 회원가입 완료 */}
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
            {/* Google로 로그인 버튼 */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              style={{
                ...commonBtnStyle,
                background: '#FFFFFF',
                color: '#1F2937',
                border: '1.5px solid #CBD5E1',
                opacity: isGoogleLoading ? 0.7 : 1
              }}
            >
              {isGoogleLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#4285F4',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span>Google 연결 확인 중...</span>
                </div>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>구글로 로그인</span>
                </>
              )}
            </button>

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

        {/* ➌ Google 가입 직후 ➔ 작가 활동명(아이디) 확인 온보딩 화면 */}
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
                <span>Google 계정 인증 완료</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                연동 이메일: <strong>{socialUser?.email || 'Google 인증 계정'}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmProfile}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  수장고 활동명 (작가명 / 닉네임) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="활동명 또는 작가명을 입력하세요"
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
                  수장고에서 활동하실 작가명 또는 닉네임입니다. 언제든 프로필에서 변경하실 수 있어요.
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

        {/* ➎ 회원가입 완료 축하 및 환영 화면 (요청 2번) */}
        {viewMode === 'signup_success' && (
          <div style={{ textAlign: 'center', padding: '0.6rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ECFDF5',
              border: '2px solid #A7F3D0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={34} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', color: '#16A34A', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              <Sparkles size={13} />
              <span>회원가입 완료</span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>
              수장고에 오신 것을 환영합니다!
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              <strong>{signupSuccessData?.name || '작가'}</strong> 작가님만의 프라이빗 디지털 수장고가 성공적으로 개설되었습니다.
            </p>

            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem 1.1rem',
              marginBottom: '1.4rem',
              border: '1px solid #E2E8F0',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>활동명 (작가명)</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{signupSuccessData?.name || '작가'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B' }}>등록 계정</span>
                <span style={{ fontWeight: 600, color: '#0284C7' }}>{signupSuccessData?.email || ''}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnterFromSuccess}
              style={{
                ...commonBtnStyle,
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.96rem'
              }}
            >
              <span>내 수장고 바로 입장하기</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ➏ 회원가입 시 이미 등록된 계정 감지 화면 (누나 피드백 보강) */}
        {viewMode === 'already_registered' && (
          <div style={{ textAlign: 'center', padding: '0.6rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#F0F9FF',
              border: '2px solid #BAE6FD',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={34} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              <Sparkles size={13} />
              <span>기존 계정 감지</span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>
              이미 등록된 계정입니다
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              <strong>{existingAccountUser?.name || '작가'}</strong> 작가님은 이미 수장고에 등록되어 있습니다.<br />
              기존 계정으로 안전하게 입장하세요.
            </p>

            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem 1.1rem',
              marginBottom: '1.4rem',
              border: '1px solid #E2E8F0',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>활동명 (작가명)</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{existingAccountUser?.name || '작가'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B' }}>등록 계정</span>
                <span style={{ fontWeight: 600, color: '#0284C7' }}>{existingAccountUser?.email || ''}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnterFromExisting}
              style={{
                ...commonBtnStyle,
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.96rem'
              }}
            >
              <span>기존 계정으로 수장고 입장하기</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ➍ 이메일 인증 발송 완료 안내 화면 (과제 2) */}
        {viewMode === 'email_sent' && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#F0F9FF',
              border: '1.5px solid #BAE6FD',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7',
              marginBottom: '1rem'
            }}>
              <Mail size={28} />
            </div>

            <div style={{
              display: 'inline-block',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '1.1rem'
            }}>
              {registeredEmail || email || '가입하신 이메일'}
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.1rem',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: '#334155',
              lineHeight: 1.6,
              marginBottom: '1.4rem'
            }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                ✉️ 다음 순서로 인증을 완료해 주세요:
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#0284C7', minWidth: '16px' }}>1.</span>
                <span>수신하신 메일함(네이버, 지메일 등)을 열어주세요.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#0284C7', minWidth: '16px' }}>2.</span>
                <span><strong>수장고 (Sujango)</strong>에서 보낸 인증 링크를 클릭합니다.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#0284C7', minWidth: '16px' }}>3.</span>
                <span>인증 완료 후 아래 [로그인하기] 버튼을 눌러 입장하세요!</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '10px', borderTop: '1px dashed #E2E8F0', paddingTop: '8px' }}>
                * 공식 발신 주소: <strong>auth@sujango.com</strong><br />
                * 메일이 보이지 않는다면 스팸함도 확인해 주세요.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { setViewMode('login'); setErrorMessage(''); setResendNotice(''); }}
                className="btn-primary"
                style={{
                  ...commonBtnStyle,
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.92rem'
                }}
              >
                <span>인증 완료 후 로그인하기</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={isResending}
                style={{
                  ...commonBtnStyle,
                  background: '#FFFFFF',
                  color: '#64748B',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.82rem',
                  height: '42px',
                  opacity: isResending ? 0.7 : 1
                }}
              >
                <span>{isResending ? '인증 메일 발송 중...' : '인증 메일이 오지 않았나요? (재발송)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 하단 보안 보증 문구 (클라우드 정식 암호화 적용 전까지 숨김 처리) */}
        {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748B', marginTop: '1.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
          <ShieldCheck size={15} color="#059669" />
          <span>공식 암호화 보안 프로토콜로 작가님의 창작 자산을 안전하게 보호합니다.</span>
        </div> */}

      </div>
    </div>
  );
}
