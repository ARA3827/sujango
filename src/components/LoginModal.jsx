import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, ExternalLink, HelpCircle, Key, Sparkles, ShieldCheck } from 'lucide-react';
import { getGoogleClientId, saveGoogleClientId, decodeJwtResponse, formatGoogleUser } from '../utils/googleAuth';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [clientId, setClientId] = useState(() => getGoogleClientId());
  const [clientIdInput, setClientIdInput] = useState(() => getGoogleClientId());
  const [isSaved, setIsSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const currentId = getGoogleClientId();
    setClientId(currentId);
    setClientIdInput(currentId);

    // Google Identity Services (GIS) 스크립트가 로드되어 있고 Client ID가 있을 때 버튼 렌더링
    if (window.google?.accounts?.id && currentId) {
      try {
        window.google.accounts.id.initialize({
          client_id: currentId,
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
            width: 360,
            locale: 'ko'
          });
        }
      } catch (err) {
        console.warn('Google SDK init error:', err);
      }
    }
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  // Google 공식 로그인 완료 콜백
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

  // Google Client ID 저장
  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      alert('Google Client ID를 입력해 주세요.');
      return;
    }
    saveGoogleClientId(clientIdInput.trim());
    setClientId(clientIdInput.trim());
    setIsSaved(true);
    setErrorMessage('');
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Client ID 삭제 (재설정)
  const handleResetClientId = () => {
    saveGoogleClientId('');
    setClientId('');
    setClientIdInput('');
    if (googleBtnContainerRef.current) {
      googleBtnContainerRef.current.innerHTML = '';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '460px', padding: '2rem 1.75rem', maxHeight: '92vh', overflowY: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              Sujango (수장고) 로그인
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
              구글 실계정으로 로그인하여 나만의 수장고를 시작하세요.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 1. Google Client ID가 등록되어 있는 경우 -> 공식 구글 실계정 로그인 버튼 */}
        {clientId ? (
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1rem', background: '#ECFDF5', padding: '3px 10px', borderRadius: '999px' }}>
              <Check size={13} />
              <span>Google 실계정 OAuth 연동 활성화됨</span>
            </div>

            {/* 공식 구글 로그인 버튼 렌더 영역 */}
            <div ref={googleBtnContainerRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748B', padding: '0.5rem' }}>
                Google 로그인 버튼 로딩 중...
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleResetClientId}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                다른 Client ID로 재설정
              </button>
            </div>
          </div>
        ) : (
          /* 2. Google Client ID가 아직 없는 경우 -> 실계정 전환을 위한 Client ID 등록 폼 */
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
              <Key size={16} color="#0284C7" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                Google 실계정 Client ID 등록
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
              일을 이중으로 하지 않도록 <strong>진짜 구글 로그인 창</strong>을 바로 띄웁니다!  
              Google Cloud Console에서 발급받은 웹 클라이언트 ID를 붙여넣어 주세요.
            </p>

            <form onSubmit={handleSaveClientId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="예: 123456789-xxxx.apps.googleusercontent.com"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '0.65rem 0.75rem', background: '#FFFFFF' }}
                required
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.85rem' }}
              >
                Google 실계정 연결하기
              </button>
            </form>

            {isSaved && (
              <div style={{ color: '#059669', fontSize: '0.75rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={13} /> 저장되었습니다! 이제 공식 Google 로그인 버튼이 뜹니다.
              </div>
            )}

            {/* 3분 발급 가이드 토글 */}
            <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0284C7',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  fontWeight: 600
                }}
              >
                <HelpCircle size={13} />
                <span>Google Client ID 발급받는 법 (3분 완성 가이드)</span>
              </button>

              {showGuide && (
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#334155',
                  lineHeight: 1.6
                }}>
                  <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    <li>
                      <strong>Google Cloud Console 접속:</strong><br />
                      <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: '#0284C7', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        console.cloud.google.com <ExternalLink size={10} />
                      </a>
                    </li>
                    <li>
                      <strong>사용자 인증 정보 만들기:</strong><br />
                      상단 [사용자 인증 정보 만들기] ➔ <strong>[OAuth 클라이언트 ID]</strong> 선택
                    </li>
                    <li>
                      <strong>애플리케이션 유형:</strong><br />
                      <strong>[웹 애플리케이션]</strong> 선택
                    </li>
                    <li>
                      <strong>승인된 자바스크립트 원본 추가:</strong><br />
                      <code>http://127.0.0.1:5198</code> 및 <code>http://localhost:5198</code> 입력
                    </li>
                    <li>
                      <strong>클라이언트 ID 복사:</strong><br />
                      완료 시 발급되는 <code>xxxx.apps.googleusercontent.com</code>을 위 입력창에 붙여넣기!
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div style={{ color: '#DC2626', fontSize: '0.78rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 보안 안내 푸터 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.73rem', color: '#64748B', marginTop: '0.5rem' }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Google 공식 OAuth 2.0 보안 인증을 통해 안전하게 로그인됩니다.</span>
        </div>
      </div>
    </div>
  );
}
