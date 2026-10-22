import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, CheckSquare, Square, ShieldAlert } from 'lucide-react';

/**
 * DeleteAccountModal - 수장고 회원 탈퇴 및 창작 데이터 영구 파기 확인 모달
 * 
 * [UX 원칙]
 * 1. 실수로 인한 탈퇴 방지: 2단계 동의 체크박스 필수
 * 2. 명확한 파기 데이터 범위 고지 (작품, 서류, 정산, 영감서랍, 워터마크)
 * 3. 깐깐한 컴플라이언스 준수: 백엔드/로컬 격리 스토리지 완전 파기
 */
export default function DeleteAccountModal({ isOpen, onClose, onConfirm, user }) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    if (!isAgreed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
      setIsAgreed(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsAgreed(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #FEE2E2',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
            backgroundColor: '#FEF2F2'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626'
              }}
            >
              <Trash2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#991B1B' }}>
                회원 탈퇴 안내
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#B91C1C' }}>
                {user.name || '작가'}님의 계정 및 모든 창작 자산 정리
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 모달 본문 */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* 탈퇴 대상 계정 정보 */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>탈퇴 대상 계정</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                {user.name} ({user.email})
              </span>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#64748B',
                backgroundColor: '#EDF2F7',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              {user.provider === 'google' ? '구글 연동' : '이메일 가입'}
            </span>
          </div>

          {/* 파기 데이터 안내 리스트 */}
          <div
            style={{
              backgroundColor: '#FFF5F5',
              border: '1px solid #FED7D7',
              borderRadius: '12px',
              padding: '1.1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
              <AlertTriangle size={16} color="#E53E3E" />
              <strong style={{ fontSize: '0.88rem', color: '#C53030' }}>
                탈퇴 시 즉시 영구 파기되는 항목
              </strong>
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.25rem',
                fontSize: '0.82rem',
                color: '#4A5568',
                lineHeight: 1.6
              }}
            >
              <li>보관 중인 <strong>작품 이미지 원본 및 웹용 워터마크 시안</strong></li>
              <li>발행된 <strong>진품보증서, 진위확인서, 작품 캡션</strong> 기록</li>
              <li>등록된 <strong>작품 판매·세무 정산 내역</strong></li>
              <li>수집한 <strong>영감 서랍 메모 및 나만의 워터마크</strong> 서명 설정</li>
              <li>회원 프로필 및 멤버십 정보</li>
            </ul>
          </div>

          {/* 복구 불가 고지 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '0.75rem 0.9rem',
              backgroundColor: '#F1F5F9',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#475569',
              lineHeight: 1.5
            }}
          >
            <ShieldAlert size={16} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>중요:</strong> 파기된 창작 데이터는 영구적으로 복구할 수 없습니다. 필요한 증명서나 정산 내역이 있다면 탈퇴 전에 미리 다운로드해 보관해 주세요.
            </div>
          </div>

          {/* 2단계 동의 체크박스 */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: isAgreed ? '#FEF2F2' : '#FAFAFA',
              border: isAgreed ? '1px solid #FECACA' : '1px solid #E2E8F0',
              transition: 'all 0.15s ease'
            }}
          >
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              disabled={isSubmitting}
              style={{ display: 'none' }}
            />
            <div style={{ marginTop: '2px', color: isAgreed ? '#DC2626' : '#94A3B8' }}>
              {isAgreed ? <CheckSquare size={18} /> : <Square size={18} />}
            </div>
            <span
              style={{
                fontSize: '0.84rem',
                color: isAgreed ? '#991B1B' : '#334155',
                fontWeight: isAgreed ? 700 : 500,
                lineHeight: 1.45
              }}
            >
              안내 사항을 모두 확인하였으며, 데이터 영구 삭제 및 회원 탈퇴에 동의합니다.
            </span>
          </label>
        </div>

        {/* 모달 하단 액션 버튼 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '1rem 1.5rem',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0'
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              padding: '0.65rem 1.15rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#475569',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            취소 및 계속 사용
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isAgreed || isSubmitting}
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: isAgreed ? '#DC2626' : '#FCA5A5',
              border: 'none',
              borderRadius: '8px',
              cursor: isAgreed && !isSubmitting ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              boxShadow: isAgreed ? '0 4px 12px rgba(220, 38, 38, 0.25)' : 'none'
            }}
          >
            <Trash2 size={16} />
            <span>{isSubmitting ? '탈퇴 처리 중...' : '회원 탈퇴 확정'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
