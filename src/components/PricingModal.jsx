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
              <span>SUJANGO MEMBERSHIP</span>
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              당신의 소중한 창작 자산을 위한 요금제
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
              기본 행정 서류와 작품 30점은 무료이며, 대용량 무손실 원본 금고가 필요할 때 Sujango Pro로 확장하세요.
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
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                기본 무료 플랜
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>무료 플랜</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>창작과 행정 서식이 필요한 모든 예술가를 위한 기본 플랜</p>
            </div>
            
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              0원 <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748B' }}>(기본 제공)</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <li style={{ fontSize: '0.84rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>작품 아카이브 서고 최대 30점 보관</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>웹 최적화 확인용 압축 보관 (내 PC 브라우저 안전 저장)</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>기기 교체 시 단일 JSON 파일 백업/복원 이동</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>출강 강의계획서 & 표준 CV 약력 & 견적서 무제한</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>전시 캡션 A4 단일 PDF 일괄 인쇄</span>
              </li>
            </ul>

            <button 
              type="button" 
              className="btn-outline" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', color: '#0F172A', fontWeight: 600 }}
              disabled
            >
              작품 30점 무료 이용 (현재 혜택)
            </button>
          </div>

          {/* 2. Pro 플랜 */}
          <div style={{ background: '#FFFFFF', border: '2px solid #0F172A', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ position: 'absolute', top: '-11px', right: '16px', background: '#0F172A', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
              추천 플랜
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7', background: '#E0F2FE', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                100GB 원본 금고
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Sujango Pro</h4>
                <Crown size={16} color="#EAB308" />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>어디서든 로그인 동기화 + 100GB 초고화질 무손실 금고</p>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              {billingCycle === 'yearly' ? '연 49,000원' : '월 4,900원'}
              <span style={{ fontSize: '0.82rem', fontWeight: 400, color: '#64748B', marginLeft: '6px' }}>
                {billingCycle === 'yearly' ? '(월 약 4,080원)' : '/ 월'}
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <li style={{ fontSize: '0.84rem', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>작품 무제한 등록 (30점 등록 한도 해제)</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#0284C7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>PC • 스마트폰 • 태블릿 어디서나 로그인 자동 동기화</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>초고화질 무손실 원본 클라우드 금고 (100GB)</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>3중 분산 데이터센터 안전 보관 (11 9s 내구성)</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>대형 전시/인쇄/도록용 원본 즉시 다운로드</span>
              </li>
              <li style={{ fontSize: '0.84rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>큐레이터·컬렉터 전용 프라이빗 도록 공유 링크</span>
              </li>
            </ul>

            <button 
              type="button" 
              onClick={handleStartFreeTrial}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', background: '#0F172A' }}
              disabled={isUpgrading}
            >
              <Crown size={16} color="#EAB308" />
              <span>{user?.isPro ? 'Pro 멤버십 이용 중' : '수장고프로 업그레이드'}</span>
            </button>
          </div>
        </div>

        {/* 결제 및 활성화 안내 아코디언 */}
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
              • 입금 후 작가명과 함께 문의 주시면 당일 내로 Sujango Pro 클라우드 금고가 활성화됩니다.<br />
              • 온라인 신용카드 정기구독은 현재 전자상거래 PG사 심사 연동 중이며, 신청 시 계좌 입금 또는 관리자 확인을 통해 즉시 활성화됩니다.
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
