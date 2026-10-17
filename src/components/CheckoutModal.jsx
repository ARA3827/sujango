import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CreditCard, 
  Building, 
  ShieldCheck, 
  Check, 
  Crown, 
  Sparkles, 
  HelpCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  plan, 
  billingCycle, 
  user, 
  onPaymentSuccess 
}) {
  const [paymentMethodTab, setPaymentMethodTab] = useState('toss'); // 'toss' | 'bank'
  const [ordererName, setOrdererName] = useState(user?.name || '');
  const [ordererEmail, setOrdererEmail] = useState(user?.email || '');
  const [ordererPhone, setOrdererPhone] = useState('');
  
  // 무통장 입금 전용 상태
  const [receiptType, setReceiptType] = useState('income'); // 'income'(소득공제) | 'expense'(지출증빙) | 'none'
  const [receiptNumber, setReceiptNumber] = useState('');
  const [bankSubmitted, setBankSubmitted] = useState(false);

  // 토스페이먼츠 위젯 상태
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);
  const [widgetError, setWidgetError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const paymentWidgetRef = useRef(null);
  const paymentMethodsRef = useRef(null);

  // 플랜별 금액 계산
  const isStudio = plan?.id === 'studio';
  const isYearly = billingCycle === 'yearly';
  
  // 금액 산출
  let amount = 9900;
  if (isStudio) {
    amount = isYearly ? 278400 : 29000;
  } else {
    amount = isYearly ? 94800 : 9900;
  }

  const planTitle = isStudio ? 'Sujango Studio (500GB)' : 'Sujango Pro (100GB)';

  // 토스페이먼츠 위젯 초기화
  useEffect(() => {
    if (!isOpen || paymentMethodTab !== 'toss') return;

    let isSubscribed = true;
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
    const customerKey = user?.email 
      ? user.email.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50) 
      : ANONYMOUS;

    async function initializeWidget() {
      try {
        setIsWidgetLoading(true);
        setWidgetError(null);

        // 토스페이먼츠 위젯 인스턴스 로드
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        
        if (!isSubscribed) return;

        // 결제 UI 렌더링
        const paymentMethods = paymentWidget.renderPaymentMethods(
          '#payment-widget', 
          { value: amount },
          { variantKey: 'DEFAULT' }
        );

        // 이용약관 UI 렌더링
        paymentWidget.renderAgreement(
          '#agreement',
          { variantKey: 'AGREEMENT' }
        );

        paymentWidgetRef.current = paymentWidget;
        paymentMethodsRef.current = paymentMethods;
        setIsWidgetLoading(false);
      } catch (err) {
        console.error('토스페이먼츠 위젯 초기화 실패:', err);
        if (isSubscribed) {
          setIsWidgetLoading(false);
          setWidgetError('결제창을 불러오는 중 일시적인 연결 지연이 발생했습니다. 무통장 입금으로 신청하시거나 잠시 후 다시 시도해 주세요.');
        }
      }
    }

    // DOM 마운트 후 위젯 초기화
    const timer = setTimeout(() => {
      initializeWidget();
    }, 100);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [isOpen, paymentMethodTab, amount, user]);

  // 금액 변경 시 위젯 금액 업데이트
  useEffect(() => {
    if (paymentMethodsRef.current) {
      paymentMethodsRef.current.updateAmount(amount);
    }
  }, [amount]);

  if (!isOpen) return null;

  // 토스 결제 요청 핸들러
  const handleRequestTossPayment = async () => {
    if (!paymentWidgetRef.current) {
      alert('결제 위젯이 아직 준비되지 않았습니다. 잠시 후 다시 클릭해 주세요.');
      return;
    }

    if (!ordererName.trim()) {
      alert('신청자(작가) 성함을 입력해 주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const uniqueOrderId = `SUJANGO_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const successRedirectUrl = `${window.location.origin}${window.location.pathname}?payment=success&planId=${isStudio ? 'studio' : 'pro'}&cycle=${billingCycle}&amount=${amount}&orderId=${uniqueOrderId}`;
      const failRedirectUrl = `${window.location.origin}${window.location.pathname}?payment=fail&orderId=${uniqueOrderId}`;

      await paymentWidgetRef.current.requestPayment({
        orderId: uniqueOrderId,
        orderName: `${planTitle} [${isYearly ? '연간 결제' : '월간 구독'}]`,
        successUrl: successRedirectUrl,
        failUrl: failRedirectUrl,
        customerEmail: ordererEmail || user?.email || 'artist@sujango.com',
        customerName: ordererName || user?.name || '작가',
      });
    } catch (err) {
      setIsProcessing(false);
      if (err.code === 'USER_CANCEL') {
        // 결제창 닫힘 (정상 취소)
        return;
      }
      console.error('토스 결제 요청 에러:', err);
      alert(`결제 처리 중 오류가 발생했습니다: ${err.message || '다시 시도해 주세요.'}`);
    }
  };

  // 무통장 입금 신청 완료 핸들러
  const handleBankTransferSubmit = (e) => {
    e.preventDefault();
    if (!ordererName.trim()) {
      alert('입금자명을 입력해 주세요.');
      return;
    }

    const orderData = {
      orderId: `BANK_${Date.now()}`,
      planId: isStudio ? 'studio' : 'pro',
      planTitle,
      billingCycle,
      amount,
      ordererName,
      ordererEmail,
      ordererPhone,
      receiptType,
      receiptNumber,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // 로컬 스토리지에 신청 내역 보관
    try {
      const existing = JSON.parse(localStorage.getItem('sujango_bank_orders') || '[]');
      existing.unshift(orderData);
      localStorage.setItem('sujango_bank_orders', JSON.stringify(existing));
    } catch (e) {}

    setBankSubmitted(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ 
          maxWidth: '820px', 
          width: '95%',
          maxHeight: '92vh', 
          overflowY: 'auto', 
          padding: '2rem 1.75rem',
          borderRadius: '16px',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', pb: '1rem', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', color: '#0284C7', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <ShieldCheck size={14} />
              <span>SUJANGO SECURE CHECKOUT</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              수장고(Sujango) 멤버십 신청 및 결제
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
              토스페이먼츠의 안전한 암호화 결제망을 통해 신속하고 안전하게 처리됩니다.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" style={{ padding: '6px', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {/* 2단 레이아웃: 주문 요약 & 결제 방식 탭 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* 주문 플랜 요약 카드 */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={18} color={isStudio ? '#7C3AED' : '#0284C7'} />
                <strong style={{ fontSize: '1.1rem', color: '#0F172A' }}>{planTitle}</strong>
                <span style={{ fontSize: '0.75rem', background: isYearly ? '#ECFDF5' : '#E2E8F0', color: isYearly ? '#059669' : '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {isYearly ? '연간 결제 (20% 할인)' : '월간 구독'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                  {amount.toLocaleString()}원
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '4px' }}>(VAT 포함)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#475569', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} color="#059669" /> 무손실 원본 {isStudio ? '500GB' : '100GB'} 클라우드 금고
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} color="#059669" /> 웹 시안 자동 워터마크 보안
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} color="#059669" /> 실시간 기기 간 동기화
              </span>
            </div>
          </div>

          {/* 신청자 정보 입력 */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.85rem 0' }}>
              1. 주문자 정보
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  작가명 (또는 상호명) *
                </label>
                <input 
                  type="text" 
                  value={ordererName} 
                  onChange={(e) => setOrdererName(e.target.value)}
                  placeholder="홍길동"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  이메일 (영수증 수신용) *
                </label>
                <input 
                  type="email" 
                  value={ordererEmail} 
                  onChange={(e) => setOrdererEmail(e.target.value)}
                  placeholder="artist@example.com"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  연락처 (선택)
                </label>
                <input 
                  type="tel" 
                  value={ordererPhone} 
                  onChange={(e) => setOrdererPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>

          {/* 결제 수단 선택 탭 */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethodTab('toss')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: paymentMethodTab === 'toss' ? '2px solid #0F172A' : '1px solid #E2E8F0',
                  background: paymentMethodTab === 'toss' ? '#F8FAFC' : '#FFFFFF',
                  fontWeight: paymentMethodTab === 'toss' ? 700 : 500,
                  color: paymentMethodTab === 'toss' ? '#0F172A' : '#64748B',
                  cursor: 'pointer'
                }}
              >
                <CreditCard size={18} color={paymentMethodTab === 'toss' ? '#0284C7' : '#64748B'} />
                <span>신용/체크카드 • 간편결제 (토스페이먼츠)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodTab('bank')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: paymentMethodTab === 'bank' ? '2px solid #0F172A' : '1px solid #E2E8F0',
                  background: paymentMethodTab === 'bank' ? '#F8FAFC' : '#FFFFFF',
                  fontWeight: paymentMethodTab === 'bank' ? 700 : 500,
                  color: paymentMethodTab === 'bank' ? '#0F172A' : '#64748B',
                  cursor: 'pointer'
                }}
              >
                <Building size={18} color={paymentMethodTab === 'bank' ? '#059669' : '#64748B'} />
                <span>무통장 입금 (세금계산서/현금영수증)</span>
              </button>
            </div>

            {/* TAB 1: 토스페이먼츠 결제위젯 */}
            {paymentMethodTab === 'toss' && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    2. 결제 수단 선택
                  </h4>
                  <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    🧪 토스페이먼츠 안전 테스트 모드 연동
                  </span>
                </div>

                {/* 로딩 인디케이터 */}
                {isWidgetLoading && (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#0284C7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>토스페이먼츠 보안 결제 모듈을 불러오는 중입니다...</p>
                  </div>
                )}

                {/* 에러 발생 시 안내 */}
                {widgetError && (
                  <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} />
                    <span>{widgetError}</span>
                  </div>
                )}

                {/* 토스 위젯 렌더링 컨테이너 */}
                <div id="payment-widget" style={{ minHeight: isWidgetLoading ? '0' : '260px' }} />
                <div id="agreement" style={{ minHeight: isWidgetLoading ? '0' : '90px' }} />

                {/* 결제 실행 버튼 */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    onClick={handleRequestTossPayment}
                    disabled={isProcessing || isWidgetLoading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      background: '#0F172A',
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: isProcessing || isWidgetLoading ? 'not-allowed' : 'pointer',
                      opacity: isProcessing || isWidgetLoading ? 0.7 : 1
                    }}
                  >
                    <CreditCard size={18} color="#EAB308" />
                    <span>{isProcessing ? '안전하게 결제 처리 중...' : `${amount.toLocaleString()}원 결제하기`}</span>
                  </button>

                  <p style={{ fontSize: '0.74rem', color: '#94A3B8', textAlign: 'center', marginTop: '0.65rem', marginBottom: 0 }}>
                    결제 시 Ara Agent Lab의 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: 무통장 입금 신청 */}
            {paymentMethodTab === 'bank' && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                {bankSubmitted ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <Check size={26} />
                    </div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                      무통장 입금 신청이 접수되었습니다!
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 1.25rem' }}>
                      아래 계좌로 입금해 주시면, 확인 즉시 <strong>{ordererName}</strong> 작가님의 {planTitle} 클라우드 금고를 활성화해 드립니다.
                    </p>

                    <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '1rem', maxWidth: '420px', margin: '0 auto 1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>
                      <div style={{ color: '#64748B', marginBottom: '4px' }}>입금 계좌 안내:</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                        카카오뱅크 3333-01-1234567
                      </div>
                      <div style={{ color: '#475569', marginTop: '2px' }}>예금주: Ara Agent Lab (한서희)</div>
                      <div style={{ color: '#0284C7', fontWeight: 600, marginTop: '6px' }}>입금액: {amount.toLocaleString()}원</div>
                    </div>

                    <button 
                      type="button"
                      onClick={onClose}
                      className="btn-primary"
                      style={{ padding: '0.65rem 1.5rem', background: '#0F172A' }}
                    >
                      확인 완료
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBankTransferSubmit}>
                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#0369A1', fontWeight: 600, marginBottom: '4px' }}>
                        입금 전용 전용 계좌 안내
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                        카카오뱅크 3333-01-1234567
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                        예금주: Ara Agent Lab (한서희) • 입금 금액: <strong>{amount.toLocaleString()}원</strong>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        증빙 서류 발급 신청 (선택)
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setReceiptType('income')}
                          style={{
                            flex: 1,
                            padding: '0.45rem',
                            borderRadius: '6px',
                            border: receiptType === 'income' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                            background: receiptType === 'income' ? '#F0F9FF' : '#FFFFFF',
                            fontSize: '0.8rem',
                            fontWeight: receiptType === 'income' ? 700 : 500,
                            color: receiptType === 'income' ? '#0369A1' : '#64748B'
                          }}
                        >
                          현금영수증 (개인소득공제)
                        </button>
                        <button
                          type="button"
                          onClick={() => setReceiptType('expense')}
                          style={{
                            flex: 1,
                            padding: '0.45rem',
                            borderRadius: '6px',
                            border: receiptType === 'expense' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                            background: receiptType === 'expense' ? '#F0F9FF' : '#FFFFFF',
                            fontSize: '0.8rem',
                            fontWeight: receiptType === 'expense' ? 700 : 500,
                            color: receiptType === 'expense' ? '#0369A1' : '#64748B'
                          }}
                        >
                          전자세금계산서 (사업자지출증빙)
                        </button>
                        <button
                          type="button"
                          onClick={() => setReceiptType('none')}
                          style={{
                            flex: 1,
                            padding: '0.45rem',
                            borderRadius: '6px',
                            border: receiptType === 'none' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                            background: receiptType === 'none' ? '#F0F9FF' : '#FFFFFF',
                            fontSize: '0.8rem',
                            fontWeight: receiptType === 'none' ? 700 : 500,
                            color: receiptType === 'none' ? '#0369A1' : '#64748B'
                          }}
                        >
                          미발행
                        </button>
                      </div>

                      {receiptType !== 'none' && (
                        <input
                          type="text"
                          value={receiptNumber}
                          onChange={(e) => setReceiptNumber(e.target.value)}
                          placeholder={receiptType === 'income' ? '휴대폰 번호 (- 없이 입력)' : '사업자등록번호 10자리 (- 없이 입력)'}
                          style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.88rem' }}
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        background: '#059669',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Building size={16} />
                      <span>무통장 입금 신청하기</span>
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
