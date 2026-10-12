import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ArrowRight, ShieldCheck, Settings, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { DEMO_USER } from '../utils/authStorage';
import { getGoogleClientId, saveGoogleClientId, decodeJwtResponse, formatGoogleUser } from '../utils/googleAuth';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(() => getGoogleClientId());
  const [configSaved, setConfigSaved] = useState(false);
  const [googleInitError, setGoogleInitError] = useState('');
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const currentClientId = getGoogleClientId();
    setClientIdInput(currentClientId);

    // Google Identity Services (GIS) 초기화 시도
    if (window.google?.accounts?.id && currentClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: currentClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // 공식 구글 렌더 버튼 연결 (컨테이너가 있을 때)
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
  }, [isOpen, showConfig]);

  if (!isOpen) return null;

  // Google OAuth 응답 콜백
  const handleGoogleCredentialResponse = (response) => {
    if (!response || !response.credential) {
      alert('Google 로그인 응답을 받아오지 못했습니다.');
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

  // Google 로그인 버튼 클릭 핸들러
  const handleGoogleSignInClick = () => {
    const currentClientId = getGoogleClientId();

    // 1. Google Client ID가 설정되어 있고 SDK가 로드된 경우 -> 공식 Google 로그인 창 실행
    if (currentClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: currentClientId,
          callback: handleGoogleCredentialResponse
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMomentum()) {
            // One-tap이 차단되거나 안 뜰 경우 수동 프롬프트 유도
          }
        });
      } catch (e) {
        setGoogleInitError('Google 로그인 창 실행 중 오류가 발생했습니다. Client ID를 확인해 주세요.');
      }
      return;
    }

    // 2. Client ID가 아직 등록되지 않은 경우: 1인 기업가 친화적 빠른 Google 연동 시뮬레이션
    // (본인 구글 이메일을 입력하면 즉시 구글 계정으로 로그인 처리)
    const promptEmail = prompt(
      '[Google 원클릭 로그인]\n아직 Google Cloud Client ID가 등록되지 않은 개발/시연 모드입니다.\n\n로그인에 사용할 구글 이메일(또는 이름)을 입력해 주세요:',
      'artist.google@gmail.com'
    );

    if (!promptEmail) return;

    const extractedName = promptEmail.includes('@') ? promptEmail.split('@')[0] : promptEmail;
    const simGoogleUser = {
      id: `google-sim-${Date.now()}`,
      name: `${extractedName} (Google)`,
      email: promptEmail.includes('@') ? promptEmail : `${promptEmail}@gmail.com`,
      avatarUrl: '',
      role: '창작 예술가',
      membership: 'Free Artist',
      isPro: false,
      provider: 'google',
      signedAt: new Date().toISOString()
    };

    onLoginSuccess(simGoogleUser);
    onClose();
    triggerConfetti();
  };

  // 폭죽 효과
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // 데모 계정 원클릭 로그인
  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess(DEMO_USER);
      setIsSubmitting(false);
      onClose();
      triggerConfetti();
    }, 200);
  };

  // 직접 이메일/성함 입력 로그인
  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('작가명을 입력해 주세요.');
      return;
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      role: '창작 예술가',
      email: email.trim() || `${name.trim()}@artist.kr`,
      isPro: false,
      membership: 'Free Artist',
      avatarUrl: '',
      provider: 'custom',
      signedAt: new Date().toISOString()
    };

    onLoginSuccess(newUser);
    onClose();
    triggerConfetti();
  };

  // Google Client ID 저장 핸들러
  const handleSaveClientId = (e) => {
    e.preventDefault();
    saveGoogleClientId(clientIdInput);
    setConfigSaved(true);
    setGoogleInitError('');
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const hasClientId = Boolean(getGoogleClientId());

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '440px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-serif)' }}>
              Sujango (수장고) 시작하기
            </span>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          창작자를 위한 프라이빗 디지털 수장고와 행정 서류, 정산 장부를 안전하게 관리하세요.
        </p>

        {/* 1. Google 공식/간편 원클릭 소셜 로그인 버튼 */}
        <div style={{ marginBottom: '1rem' }}>
          {/* 공식 구글 렌더 컨테이너 (Client ID가 있을 때) */}
          <div 
            ref={googleBtnContainerRef} 
            style={{ 
              display: hasClientId ? 'flex' : 'none', 
              justifyContent: 'center', 
              marginBottom: '0.5rem' 
            }} 
          />

          {/* 범용 Google 소셜 버튼 (클릭 시 원클릭 실행) */}
          <button
            type="button"
            onClick={handleGoogleSignInClick}
            disabled={isSubmitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '0.85rem 1rem',
              background: '#FFFFFF',
              color: '#1F2937',
              borderRadius: '8px',
              border: '1px solid #DADCE0',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#DADCE0';
            }}
          >
            {/* Google 공식 4색 G 로고 */}
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google 계정으로 계속하기</span>
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', padding: '0 2px' }}>
            <span style={{ fontSize: '0.73rem', color: '#64748B' }}>
              {hasClientId ? '🟢 Google 실계정 연동 활성화' : '⚡ 1초 원클릭 계정 연동'}
            </span>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '0.73rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 4px'
              }}
              title="Google Cloud Console Client ID 설정"
            >
              <Settings size={12} />
              <span>{showConfig ? '설정 닫기' : 'Client ID 설정'}</span>
            </button>
          </div>
        </div>

        {/* Google Client ID 설정 아코디언 */}
        {showConfig && (
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.85rem',
            marginBottom: '1rem',
            fontSize: '0.8rem'
          }}>
            <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Google Cloud Client ID 등록</span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.75rem', margin: '0 0 8px 0', lineHeight: 1.4 }}>
              Google Cloud Console에서 발급받은 웹 클라이언트 ID를 등록하시면 공식 OAuth 팝업이 활성화됩니다.
            </p>
            <form onSubmit={handleSaveClientId} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                placeholder="예: 12345-xxxx.apps.googleusercontent.com"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
              />
              <button
                type="submit"
                className="btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}
              >
                저장
              </button>
            </form>
            {configSaved && (
              <div style={{ color: '#059669', fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={12} /> 저장되었습니다! 이제 공식 Google 로그인이 작동합니다.
              </div>
            )}
            {googleInitError && (
              <div style={{ color: '#DC2626', fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> {googleInitError}
              </div>
            )}
          </div>
        )}

        {/* 2. 데모 계정 로그인 버튼 */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.8rem 1rem',
              background: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#38BDF8" />
              <span>김아라 작가 샘플 계정으로 입장</span>
            </div>
            <ArrowRight size={15} />
          </button>
          <div style={{ fontSize: '0.73rem', color: '#94A3B8', textAlign: 'center', marginTop: '5px' }}>
            * 준비된 예시 작품과 정산 내역이 포함된 시연 계정입니다.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.73rem', color: '#94A3B8' }}>또는 작가명으로 직접 시작</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* 3. 작가명 / 이메일 직접 입력 폼 */}
        <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>작가명 (국문/영문)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 홍길동 작가"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>이메일 주소 (선택)</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="artist@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-outline" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}
          >
            작가 등록 후 입장
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.25rem', fontSize: '0.73rem', color: '#64748B' }}>
          <ShieldCheck size={14} color="#059669" />
          <span>개인정보 및 작품 데이터는 기기(로컬)에 안전하게 암호화 보관됩니다.</span>
        </div>
      </div>
    </div>
  );
}
