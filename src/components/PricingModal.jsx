import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Download, 
  Share2, 
  HardDrive,
  CreditCard,
  Building,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PricingModal({ isOpen, onClose, user, onUpgradeSuccess, onOpenPolicy }) {
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  // 30일 무료 체험 및 Pro 업그레이드
  const handleStartFreeTrial = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      if (onUpgradeSuccess) {
        onUpgradeSuccess({
          ...user,
          isPro: true,
          membership: 'Pro Artist (체험 중)'
        });
      }
      setIsUpgrading(false);
      onClose();
      try {
        confetti({
          particleCount: 35,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284C7', '#0F172A', '#10B981']
        });
      } catch (e) {}
    }, 300);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem 1.75rem' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Crown size={14} />
              <span>ARTFLOW MEMBERSHIP</span>
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              당신의 평생 창작 자산을 위한 요금제
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
              기본 행정 서류는 평생 무료이며, 초고화질 무손실 원본 금고가 필요할 때 Pro로 업그레이드하세요.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* 결제 주기 선택 스위치 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div style={{ background: '#F1F5F9', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: billingCycle === 'monthly' ? '#FFFFFF' : 'transparent',
                color: billingCycle === 'monthly' ? '#0F172A' : '#64748B',
                boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              월간 결제
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: billingCycle === 'yearly' ? '#FFFFFF' : 'transparent',
                color: billingCycle === 'yearly' ? '#0F172A' : '#64748B',
                boxShadow: billingCycle === 'yearly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>연간 결제</span>
              <span style={{ fontSize: '0.7rem', background: '#ECFDF5', color: '#059669', padding: '1px 6px', borderRadius: '4px' }}>
                2개월 무료
              </span>
            </button>
          </div>
        </div>

        {/* 2단 요금제 카드 비교 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          
          {/* 1. Free 플랜 */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>무료 플랜 (Free)</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>창작과 행정 서식이 필요한 모든 예술가</p>
            </div>
            
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              0원 <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748B' }}>/ 평생 무료</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>출강 강의계획서 & 표준 CV 약력 무제한</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>도록용 작가노트 & 인스타 캡션 동시 추출</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>전시 캡션 네임택 A4 단일 PDF 일괄 인쇄</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>웹 최적화 확인용 작품 보관 (기기 내 저장)</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>내 컴퓨터 전체 데이터 단일 JSON 백업</span>
              </li>
            </ul>

            <button 
              type="button" 
              className="btn-outline" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', color: '#64748B' }}
              disabled
            >
              현재 이용 중인 기본 혜택
            </button>
          </div>

          {/* 2. Pro 플랜 */}
          <div style={{ background: '#FFFFFF', border: '2px solid #0F172A', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ position: 'absolute', top: '-11px', right: '16px', background: '#0F172A', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
              추천 플랜
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>ArtFlow Pro</h4>
                <Crown size={16} color="#EAB308" />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>인스타 해킹에도 안전한 평생 무손실 금고</p>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              {billingCycle === 'yearly' ? '연 49,000원' : '월 4,900원'}
              <span style={{ fontSize: '0.82rem', fontWeight: 400, color: '#64748B', marginLeft: '6px' }}>
                {billingCycle === 'yearly' ? '(월 약 4,080원)' : '/ 월'}
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <li style={{ fontSize: '0.84rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>초고화질 무손실 원본 클라우드 금고 (100GB)</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>3중 분산 데이터센터 영구 백업 (11 9s 내구성)</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>대형 전시/도록 인쇄용 원본 언제든 다운로드</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>큐레이터·컬렉터 전용 프라이빗 도록 공유 링크</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>1인 예술가 전용 1:1 행정/서식 템플릿 우선 지원</span>
              </li>
            </ul>

            <button 
              type="button" 
              onClick={handleStartFreeTrial}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', background: '#0F172A' }}
              disabled={isUpgrading}
            >
              <Sparkles size={16} color="#38BDF8" />
              <span>{user?.isPro ? 'Pro 멤버십 이용 중' : '🎉 30일 무료 체험으로 시작하기'}</span>
            </button>
          </div>
        </div>

        {/* 얼리버드 결제 안내 아코디언 */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div 
            onClick={() => setShowBankInfo(!showBankInfo)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              <Building size={16} color="#64748B" />
              <span>정기결제(카드) 및 무통장 입금 계좌 안내</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#0284C7' }}>
              {showBankInfo ? '접기 ▲' : '자세히 보기 ▼'}
            </span>
          </div>

          {showBankInfo && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.6 }}>
              • <strong>계좌 입금:</strong> 카카오뱅크 3333-01-1234567 (예금주: Ara Agent Lab 김아라)<br />
              • 입금 후 작가명과 함께 문의 주시면 당일 내로 Pro 클라우드 금고가 활성화됩니다.<br />
              • 온라인 신용카드 정기구독은 현재 전자상거래 PG사 심사 연동 중이며, 심사 기간 동안은 <strong>30일 무료 체험</strong>으로 바로 이용하실 수 있습니다.
            </div>
          )}
        </div>

        {/* 하단 법적 정책 바로가기 링크 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.75rem', color: '#94A3B8' }}>
          <button 
            type="button"
            onClick={() => onOpenPolicy('terms')}
            style={{ background: 'none', border: 'none', color: '#64748B', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            서비스 이용약관
          </button>
          <span>•</span>
          <button 
            type="button"
            onClick={() => onOpenPolicy('privacy')}
            style={{ background: 'none', border: 'none', color: '#64748B', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            개인정보 처리방침
          </button>
          <span>•</span>
          <button 
            type="button"
            onClick={() => onOpenPolicy('refund')}
            style={{ background: 'none', border: 'none', color: '#64748B', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            구독 및 환불 규정
          </button>
        </div>
      </div>
    </div>
  );
}
