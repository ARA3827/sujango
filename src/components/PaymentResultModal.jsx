import React, { useEffect } from 'react';
import { Check, X, Sparkles, Crown, AlertTriangle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentResultModal({ 
  isOpen, 
  onClose, 
  status, // 'success' | 'fail'
  details, // { orderId, amount, planId, cycle, code, message }
  onNavigateToArchive 
}) {
  useEffect(() => {
    if (isOpen && status === 'success') {
      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0284C7', '#0F172A', '#10B981', '#EAB308']
        });
      } catch (e) {}
    }
  }, [isOpen, status]);

  if (!isOpen) return null;

  const isSuccess = status === 'success';
  const isStudio = details?.planId === 'studio';
  const planName = isStudio ? 'Sujango Studio (500GB)' : 'Sujango Pro (100GB)';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ 
          maxWidth: '540px', 
          width: '90%', 
          padding: '2.25rem 2rem', 
          textAlign: 'center',
          borderRadius: '16px',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: '#ECFDF5', 
              color: '#059669', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem' 
            }}>
              <Check size={32} strokeWidth={2.5} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '3px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              <Crown size={14} color="#EAB308" />
              <span>MEMBERSHIP ACTIVATED</span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>
              멤버십 결제가 안전하게 완료되었습니다!
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              <strong>{planName}</strong> 혜택이 즉시 적용되었습니다.<br />
              소중한 작품 원본을 안전하게 보관하고 관리해 보세요.
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', textAlign: 'left', fontSize: '0.82rem', color: '#475569', marginBottom: '1.75rem', lineHeight: 1.8 }}>
              {details?.orderId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>주문번호</span>
                  <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>{details.orderId}</span>
                </div>
              )}
              {details?.amount && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>결제금액</span>
                  <span style={{ fontWeight: 700, color: '#0284C7' }}>{Number(details.amount).toLocaleString()}원</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>클라우드 금고 용량</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{isStudio ? '500GB 초고용량' : '100GB 무손실 원본'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>결제 승인 상태</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>승인 완료 (토스페이먼츠)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateToArchive) onNavigateToArchive();
              }}
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
                gap: '8px'
              }}
            >
              <span>내 수장고 아카이브 시작하기</span>
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: '#FEF2F2', 
              color: '#DC2626', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem' 
            }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              결제가 완료되지 않았습니다
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              {details?.message || '결제 진행 중 사용자에 의해 취소되었거나 카드 승인이 완료되지 않았습니다.'}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                background: '#475569',
                justifyContent: 'center'
              }}
            >
              확인 및 닫기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
