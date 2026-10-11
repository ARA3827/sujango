import React, { useState } from 'react';
import { X, Sparkles, User, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { DEMO_USER } from '../utils/authStorage';
import confetti from 'canvas-confetti';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // 데모 계정 원클릭 로그인
  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess(DEMO_USER);
      setIsSubmitting(false);
      onClose();
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
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
      avatarUrl: ''
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '440px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-serif)' }}>
              ArtFlow 로그인
            </span>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          나만의 작품 아카이브 금고와 행정 서류, 정산 장부를 안전하게 관리하세요.
        </p>

        {/* 1. 가장 빠른 데모 계정 로그인 버튼 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#38BDF8" />
              <span>김아라 작가 계정으로 1초 입장</span>
            </div>
            <ArrowRight size={16} />
          </button>
          <div style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'center', marginTop: '6px' }}>
            * 테스트용 데모 계정으로 모든 기능이 즉시 활성화됩니다.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>또는 직접 로그인</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* 2. 일반 입력 폼 */}
        <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>작가명 (국문)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>이메일 주소 (선택)</label>
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
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}
          >
            로그인 / 회원가입 완료
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.25rem', fontSize: '0.75rem', color: '#64748B' }}>
          <ShieldCheck size={14} color="#059669" />
          <span>개인정보 및 작품 데이터는 기기(로컬)에 안전하게 암호화 보관됩니다.</span>
        </div>
      </div>
    </div>
  );
}
