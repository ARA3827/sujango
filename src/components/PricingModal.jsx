import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Crown, 
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 기능 제어 플래그
const CLOUD_ENABLED = false; // 클라우드 동기화 완료 후 true 전환
const STUDIO_ENABLED = false; // Studio 플랜 오픈 후 true 전환

export default function PricingModal({ 
  isOpen, 
  onClose, 
  user, 
  onUpgradeSuccess, 
  onOpenPolicy,
  onOpenFoundingModal,
  onSelectPlanForCheckout 
}) {
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  // 플랜 선택 시 결제 모달 호출
  const handleSelectPlan = (planId, planName) => {
    if (onSelectPlanForCheckout) {
      onSelectPlanForCheckout({ id: planId, name: planName }, billingCycle);
    } else {
      handleStartFreeTrial();
    }
  };

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
              기본 행정 서류와 작품 30점은 무료이며, 보관 용량과 갤러리 보안 협업이 필요할 때 최적의 플랜을 선택하세요.
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

        {/* 3단 요금제 카드 비교 그리드 (Studio 숨김 시 2단 중앙 정렬) */}
        <div className="landing-pricing-grid" style={{ marginBottom: '1.75rem', alignItems: 'stretch', maxWidth: STUDIO_ENABLED ? '100%' : '720px', margin: STUDIO_ENABLED ? '0 0 1.75rem 0' : '0 auto 1.75rem auto' }}>
          
          {/* 1. Free 플랜 */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            {/* 1. 플랜명 */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Free 스타터
            </h3>
            {/* 2. 대상 한 줄 */}
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '6px 0 0 0', minHeight: '1.3rem' }}>
              수장고를 처음 써보는 작가
            </p>
            
            {/* 3. 가격 */}
            <div style={{ minHeight: '58px', marginTop: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>0</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B' }}>원 / 월</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
                무료
              </div>
            </div>

            {/* 4. 핵심 박스 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem 0.9rem', minHeight: '66px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '0.9rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                작품 30점 보관
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '3px' }}>
                이 기기의 브라우저에 저장
              </div>
            </div>

            {/* 5. 구분선 */}
            <div style={{ borderTop: '1px solid #E2E8F0', margin: '1.1rem 0' }} />

            {/* 6. 기능 목록 */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>출강 강의계획서 · 전시 약력(CV) · 견적서 작성</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>전시 캡션 A4 PDF 인쇄</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>웹 확인용 압축본 보관</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>AI 작가노트 초안 월 3회</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>백업 파일 내려받기 · 불러오기</span>
              </li>
            </ul>

            {/* 7. 버튼 위 안내 (테두리 없는 작은 회색 글씨) */}
            <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.45, minHeight: '36px', marginBottom: '0.75rem' }}>
              기기를 바꾸거나 브라우저 기록을 지우면 사라질 수 있어요. 정기적으로 백업하세요.
            </div>

            <button 
              type="button" 
              className="btn-outline" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}
              disabled
            >
              무료로 시작하기
            </button>
          </div>

          {/* 2. Pro 플랜 */}
          <div style={{ background: '#FFFFFF', border: '2px solid #0F172A', borderRadius: '12px', padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', boxSizing: 'border-box', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
            {/* 추천 배지 (왕관 제거, 글자만) */}
            <div style={{ position: 'absolute', top: '-11px', right: '16px', background: '#0F172A', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' }}>
              추천
            </div>

            {/* 1. 플랜명 */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Sujango Pro
            </h3>
            {/* 2. 대상 한 줄 */}
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '6px 0 0 0', minHeight: '1.3rem' }}>
              작품을 꾸준히 기록하고 보여주는 작가
            </p>

            {/* 3. 가격 */}
            <div style={{ minHeight: '58px', marginTop: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {billingCycle === 'yearly' ? '7,900' : '9,900'}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B' }}>원 / 월</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
                {billingCycle === 'yearly' ? (
                  <>
                    <s>9,900원</s> · 연 94,800원 일괄 결제
                  </>
                ) : (
                  '매월 결제'
                )}
              </div>
            </div>

            {/* 4. 핵심 박스 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem 0.9rem', minHeight: '66px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '0.9rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                100GB 무손실 원본 보관
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <span>고화질 사진 약 5,000장 · PC와 스마트폰 자동 동기화</span>
              </div>
            </div>

            {/* 5. 구분선 */}
            <div style={{ borderTop: '1px solid #E2E8F0', margin: '1.1rem 0' }} />

            {/* 6. 기능 목록 */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <li style={{ fontSize: '0.83rem', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>무료의 모든 기능 +</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>작품 수 제한 해제 (5GB 클라우드)</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>웹 공유용 사본 자동 생성</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>AI 작가노트 초안 넉넉하게 (일 20회)</span>
              </li>
              <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#0F172A" />
                <span>3중 분산 저장으로 안전하게 보관</span>
              </li>
            </ul>

            {/* 버튼 정렬용 여백 (무료 카드 안내문 높이와 동일) */}
            <div style={{ minHeight: '36px', marginBottom: '0.75rem' }} />

            <button 
              type="button" 
              onClick={onOpenFoundingModal}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', background: '#0F172A', color: '#FFFFFF', fontWeight: 600 }}
            >
              <span>1기 파운딩 작가 신청하기</span>
            </button>
          </div>

          {/* 3. Studio 플랜 (STUDIO_ENABLED 플래그 제어) */}
          {STUDIO_ENABLED && (
            <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
              {/* 1. 플랜명 */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Sujango Studio
              </h3>
              {/* 2. 대상 한 줄 */}
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '6px 0 0 0', minHeight: '1.3rem' }}>
                영상 · 설치 · 대형 작업을 하는 작가와 작업실
              </p>

              {/* 3. 가격 */}
              <div style={{ minHeight: '58px', marginTop: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                    {billingCycle === 'yearly' ? '23,200' : '29,000'}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B' }}>원 / 월</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
                  {billingCycle === 'yearly' ? (
                    <>
                      <s>29,000원</s> · 연 278,400원 일괄 결제
                    </>
                  ) : (
                    '매월 결제'
                  )}
                </div>
              </div>

              {/* 4. 핵심 박스 */}
              <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '8px', padding: '0.75rem 0.9rem', minHeight: '66px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '0.9rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                  500GB 무손실 원본 보관
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '3px' }}>
                  4K 영상 약 20편 또는 사진 약 25,000장
                </div>
              </div>

              {/* 5. 구분선 */}
              <div style={{ borderTop: '1px solid #E2E8F0', margin: '1.1rem 0' }} />

              {/* 6. 기능 목록 */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                <li style={{ fontSize: '0.83rem', color: '#7C3AED', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} color="#7C3AED" />
                  <span>Pro의 모든 기능 +</span>
                </li>
                <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} color="#7C3AED" />
                  <span>작품에 서명 · 로고 워터마크 자동 삽입</span>
                </li>
                <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} color="#7C3AED" />
                  <span>7일 뒤 자동 만료되는 보안 공유 링크</span>
                </li>
                <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} color="#7C3AED" />
                  <span>공유 링크 비밀번호 설정</span>
                </li>
                <li style={{ fontSize: '0.83rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} color="#7C3AED" />
                  <span>공유받은 사람의 의견 모아보기</span>
                </li>
              </ul>

              {/* 버튼 정렬용 여백 (무료 카드 안내문 높이와 동일) */}
              <div style={{ minHeight: '36px', marginBottom: '0.75rem' }} />

              <button 
                type="button" 
                onClick={() => handleSelectPlan('studio', 'Sujango Studio')}
                className="btn-outline" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700, borderColor: '#7C3AED', color: '#7C3AED' }}
                disabled={isUpgrading}
              >
                <span>Studio 시작하기</span>
              </button>
            </div>
          )}
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
