import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Crown, 
  Building
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
        style={{ maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto', padding: '2rem 1.75rem' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Crown size={14} />
              <span>SUJANGO MEMBERSHIP TIERS</span>
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              당신의 소중한 창작 자산을 위한 요금제
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
              기본 행정 서류와 작품 30점은 평생 무료이며, 보관 용량과 갤러리 보안 협업이 필요할 때 최적의 플랜을 선택하세요.
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
              <span style={{ fontSize: '0.7rem', background: '#ECFDF5', color: '#059669', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                20% 할인
              </span>
            </button>
          </div>
        </div>

        {/* 3단 요금제 카드 비교 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          
          {/* 1. Free 플랜 */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                기본 무료 플랜
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Free 스타터</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>창작과 행정 서식이 필요한 모든 예술가를 위한 기본 지원</p>
            </div>
            
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              0원 <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748B' }}>(평생 무료)</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.7rem', flex: 1 }}>
              <li style={{ fontSize: '0.83rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>작품 아카이브 최대 30점 보관</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>내 PC 브라우저 안전 저장</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>출강 강의계획서 & 표준 CV 약력 무제한</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>3.3% 사업소득세 원천징수 정산 장부</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span>전시 캡션 A4 단일 PDF 출력</span>
              </li>
            </ul>

            <button 
              type="button" 
              className="btn-outline" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', color: '#0F172A', fontWeight: 600 }}
              disabled
            >
              현재 이용 중 (기본 혜택)
            </button>
          </div>

          {/* 2. Pro 플랜 (100GB - 추천 플랜) */}
          <div style={{ background: '#FFFFFF', border: '2px solid #0F172A', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ position: 'absolute', top: '-11px', right: '16px', background: '#0F172A', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Crown size={11} color="#EAB308" />
              <span>작가 추천</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7', background: '#E0F2FE', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                100GB 클라우드 금고
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Sujango Pro</h4>
                <Crown size={16} color="#0284C7" />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>개인 작가를 위한 100GB 초고화질 무손실 원본 보관</p>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
              {billingCycle === 'yearly' ? '월 7,900원' : '월 9,900원'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 600, marginBottom: '1.25rem' }}>
              {billingCycle === 'yearly' ? '연 94,800원 일괄 결제' : '월간 구독'}
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                📸 20MB 고화질 사진 약 5,000장 무손실 보관
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '3px' }}>
                PC • 스마트폰 어디서나 실시간 클라우드 자동 동기화
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.7rem', flex: 1 }}>
              <li style={{ fontSize: '0.83rem', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>작품 등록 한도 무제한 해제</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>PC • 스마트폰 어디서나 실시간 자동 동기화</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>초고화질 무손실 원본 클라우드 금고 (100GB)</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>웹 시안용 1080px 자동 압축 프리뷰 제공</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0284C7" />
                <span>큐레이터 전용 프라이빗 도록 공유 링크</span>
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
              <span>{user?.isPro ? 'Pro 이용 중' : 'Pro 시작하기'}</span>
            </button>
          </div>

          {/* 3. Studio 플랜 (500GB) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', background: '#F3E8FF', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                500GB 대용량 금고
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Sujango Studio</h4>
                <Crown size={16} color="#7C3AED" />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>영상•설치•대형 프로젝트 작가 및 작업실 전용</p>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
              {billingCycle === 'yearly' ? '월 23,200원' : '월 29,000원'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 600, marginBottom: '1.25rem' }}>
              {billingCycle === 'yearly' ? '연 278,400원 일괄 결제' : '월간 구독'}
            </div>

            <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#581C87' }}>
                🎬 4K 고화질 영상 약 20편 또는 사진 약 25,000장 보관
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7E22CE', marginTop: '3px' }}>
                대용량 원본 안전 클라우드 보관 & 2-Way 워터마크 보안
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.7rem', flex: 1 }}>
              <li style={{ fontSize: '0.83rem', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#7C3AED" />
                <span>500GB 초대용량 무손실 클라우드 금고</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#7C3AED', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#7C3AED" />
                <span>나만의 워터마크 자동 합성 (문구 & 서명 로고)</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#7C3AED" />
                <span>7일 만료 보안 공유 링크 (Signed URL 기술)</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#7C3AED" />
                <span>선택적 4자리 PIN 비밀번호 클라이언트 잠금</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#7C3AED" />
                <span>클라이언트 실시간 피드백/리뷰 수합 기능</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#7C3AED" />
                <span>3중 분산 데이터센터 보관 (11 9s 내구성)</span>
              </li>
            </ul>

            <button 
              type="button" 
              onClick={handleStartFreeTrial}
              className="btn-outline" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.88rem', fontWeight: 700, borderColor: '#7C3AED', color: '#7C3AED' }}
              disabled={isUpgrading}
            >
              <span>Studio 플랜 시작하기</span>
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
