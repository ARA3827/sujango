import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  Camera, 
  FileText, 
  X, 
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

import { getUserScopedKey } from '../utils/authStorage';

export default function TaxStudio({ onBack, onUpdateSummary, user = null }) {
  const [activeTab, setActiveTab] = useState('income'); // 'income' | 'expense'

  // ==========================================
  // 1. 수입 상태 관리 (작가 계정별 격리)
  // ==========================================
  const [incomes, setIncomes] = useState(() => {
    const key = getUserScopedKey('artflow_incomes', user);
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    if (user?.id === 'user-ara' || user?.email === 'ara.kim@sujango.com') {
      return [
        {
          id: 1,
          date: '2026-10-05',
          type: 'business', // 'business' (3.3%) | 'other' (8.8%) | 'gallery' (40%) | 'personal' (0%)
          client: '종로문화재단',
          title: '가을 아카데미 4주 출강료',
          grossAmount: 1200000,
          taxAmount: 39600,
          netAmount: 1160400,
          status: 'pending' // 'unbilled' | 'pending' | 'paid'
        },
        {
          id: 2,
          date: '2026-09-28',
          type: 'other',
          client: '서울시립미술관',
          title: '신진작가 릴레이 1회 특강',
          grossAmount: 500000,
          taxAmount: 44000,
          netAmount: 456000,
          status: 'paid'
        },
        {
          id: 3,
          date: '2026-09-15',
          type: 'gallery',
          client: '갤러리 아라',
          title: '소품 10호 1점 위탁 판매',
          grossAmount: 2000000,
          taxAmount: 800000, // 40% 갤러리 수수료
          netAmount: 1200000,
          status: 'paid'
        },
        {
          id: 4,
          date: '2026-09-01',
          type: 'personal',
          client: '개인 컬렉터',
          title: '드로잉 소품 1점 직거래',
          grossAmount: 350000,
          taxAmount: 0,
          netAmount: 350000,
          status: 'paid'
        }
      ];
    }

    return [];
  });

  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'business',
    client: '',
    title: '',
    grossAmount: ''
  });

  // ==========================================
  // 2. 지출 상태 관리 (재료비, 화구, 표구 등 - 작가 계정별 격리)
  // ==========================================
  const [expenses, setExpenses] = useState(() => {
    const key = getUserScopedKey('artflow_expenses', user);
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    if (user?.id === 'user-ara' || user?.email === 'ara.kim@sujango.com') {
      return [
        {
          id: 101,
          date: '2026-10-08',
          category: '화구/재료비',
          store: '호미화방 홍대본점',
          item: '홀베인 유화물감 40ml 5종 & 젯소 1L',
          amount: 145000,
          receiptUrl: '',
          memo: '신작 연작 시리즈 베이스 작업용'
        },
        {
          id: 102,
          date: '2026-09-20',
          category: '캔버스/표구비',
          store: '인사동 성문액자',
          item: '가식 원목 띄움액자 20호 표구',
          amount: 180000,
          receiptUrl: '',
          memo: '가을 단체전 출품작 표구'
        }
      ];
    }

    return [];
  });

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '화구/재료비',
    store: '',
    item: '',
    amount: '',
    receiptUrl: '',
    memo: ''
  });

  const receiptFileInputRef = useRef(null);
  const modalReceiptInputRef = useRef(null);

  // A4 증빙서 인쇄 모달 상태
  const [printExpenseItem, setPrintExpenseItem] = useState(null);

  // 모달 내에서 직접 영수증 업로드 & 실시간 저장
  const handleModalReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !printExpenseItem) return;

    try {
      const compressedData = await compressImage(file, 800, 0.85);
      const updated = { ...printExpenseItem, receiptUrl: compressedData };
      setPrintExpenseItem(updated);
      setExpenses(prev => prev.map(exp => exp.id === printExpenseItem.id ? updated : exp));
    } catch (err) {
      alert('영수증 이미지 처리 실패: ' + err.message);
    } finally {
      if (modalReceiptInputRef.current) modalReceiptInputRef.current.value = '';
    }
  };

  // 모달 내에서 영수증 사진 삭제 (빈칸 점선 박스로 복원)
  const handleRemoveModalReceipt = () => {
    if (!printExpenseItem) return;
    const updated = { ...printExpenseItem, receiptUrl: '' };
    setPrintExpenseItem(updated);
    setExpenses(prev => prev.map(exp => exp.id === printExpenseItem.id ? updated : exp));
  };

  // LocalStorage 영구 동기화 (계정별 분리)
  useEffect(() => {
    try {
      const key = getUserScopedKey('artflow_incomes', user);
      localStorage.setItem(key, JSON.stringify(incomes));
    } catch (e) {
      console.error(e);
    }

    if (onUpdateSummary) {
      const totalIncome = incomes.reduce((sum, item) => sum + item.netAmount, 0);
      const pendingAmount = incomes
        .filter(item => item.status === 'pending')
        .reduce((sum, item) => sum + item.netAmount, 0);
      onUpdateSummary({ totalIncome, pendingAmount });
    }
  }, [incomes, user]);

  useEffect(() => {
    try {
      const key = getUserScopedKey('artflow_expenses', user);
      localStorage.setItem(key, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses, user]);

  // ==========================================
  // 계산 로직 (수입 세후 산출)
  // ==========================================
  const calculateNet = (type, gross) => {
    const raw = parseInt(gross) || 0;
    if (type === 'business') {
      const tax = Math.round(raw * 0.033);
      return { tax, net: raw - tax };
    } else if (type === 'other') {
      const tax = Math.round(raw * 0.088);
      return { tax, net: raw - tax };
    } else if (type === 'gallery') {
      const commission = Math.round(raw * 0.40);
      return { tax: commission, net: raw - commission };
    } else if (type === 'personal') {
      return { tax: 0, net: raw };
    }
    return { tax: 0, net: raw };
  };

  // 수입 항목 추가
  const handleAddIncome = (e) => {
    e.preventDefault();
    const gross = parseInt(newIncome.grossAmount.replace(/[^0-9]/g, '')) || 0;
    if (!newIncome.title || gross <= 0) {
      alert('항목명과 금액을 올바르게 입력해주세요.');
      return;
    }

    const { tax, net } = calculateNet(newIncome.type, gross);
    const newItem = {
      id: Date.now(),
      date: newIncome.date,
      type: newIncome.type,
      client: newIncome.client || '개인/기타',
      title: newIncome.title,
      grossAmount: gross,
      taxAmount: tax,
      netAmount: net,
      status: 'pending'
    };

    setIncomes([newItem, ...incomes]);
    setNewIncome({
      date: new Date().toISOString().split('T')[0],
      type: 'business',
      client: '',
      title: '',
      grossAmount: ''
    });
  };

  // 지출 영수증 이미지 업로드 (Canvas 압축 800px)
  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedData = await compressImage(file, 800, 0.85);
      setNewExpense(prev => ({ ...prev, receiptUrl: compressedData }));
    } catch (err) {
      alert('영수증 이미지 처리 실패: ' + err.message);
    } finally {
      if (receiptFileInputRef.current) receiptFileInputRef.current.value = '';
    }
  };

  // 지출 항목 추가
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amt = parseInt(newExpense.amount.replace(/[^0-9]/g, '')) || 0;
    if (!newExpense.item || amt <= 0) {
      alert('구입 품명과 금액을 올바르게 입력해주세요.');
      return;
    }

    const newItem = {
      id: Date.now(),
      date: newExpense.date,
      category: newExpense.category,
      store: newExpense.store || '일반 화방/구매처',
      item: newExpense.item,
      amount: amt,
      receiptUrl: newExpense.receiptUrl || '',
      memo: newExpense.memo || ''
    };

    setExpenses([newItem, ...expenses]);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: '화구/재료비',
      store: '',
      item: '',
      amount: '',
      receiptUrl: '',
      memo: ''
    });
  };

  const handleDeleteIncome = (id) => {
    if (window.confirm('이 수입 내역을 삭제하시겠습니까?')) {
      setIncomes(incomes.filter(item => item.id !== id));
    }
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('이 지출 내역을 삭제하시겠습니까?')) {
      setExpenses(expenses.filter(item => item.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setIncomes(incomes.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'unbilled' 
          ? 'pending' 
          : item.status === 'pending' 
          ? 'paid' 
          : 'unbilled';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // 통계 계산
  const totalGross = incomes.reduce((sum, item) => sum + item.grossAmount, 0);
  const totalNet = incomes.reduce((sum, item) => sum + item.netAmount, 0);
  const pendingTotal = incomes.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.netAmount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalNet - totalExpense;

  return (
    <div className="workspace-wrapper">
      {/* 1. 상단 글로벌 바 */}
      <div className="workspace-top-bar no-print">
        <button onClick={onBack} className="back-btn">
          ← 메인 대시보드로
        </button>
      </div>

      {/* 2. 타이틀 영역 */}
      <div className="workspace-title-area no-print" style={{ marginBottom: '1.25rem' }}>
        <h2>창작 가계부</h2>
        <p>출강·작품 수입과 재료비 지출을 한눈에 관리하고, A4 지출 정산 증빙서를 간편하게 출력하세요.</p>
      </div>

      {/* 3. 상단 4대 요약 통계 스트립 */}
      <div className="dashboard-stats-strip no-print" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-item-box">
          <div className="stat-label">총 수입 입금액 (누적)</div>
          <div className="stat-value" style={{ color: '#0F172A' }}>
            {totalNet.toLocaleString()}원
          </div>
          <div className="stat-sub">세전 총액 {totalGross.toLocaleString()}원</div>
        </div>

        <div className="stat-item-box">
          <div className="stat-label">총 재료·활동 지출</div>
          <div className="stat-value" style={{ color: '#DC2626' }}>
            {totalExpense.toLocaleString()}원
          </div>
          <div className="stat-sub">총 {expenses.length}건 집행</div>
        </div>

        <div className="stat-item-box">
          <div className="stat-label">순 창작 이익 (수입 - 지출)</div>
          <div className="stat-value" style={{ color: netProfit >= 0 ? '#059669' : '#DC2626' }}>
            {netProfit.toLocaleString()}원
          </div>
          <div className="stat-sub">실질 창작 수익 마진</div>
        </div>

        <div className="stat-item-box">
          <div className="stat-label">입금 대기중 미수금</div>
          <div className="stat-value" style={{ color: pendingTotal > 0 ? '#D97706' : '#111827' }}>
            {pendingTotal.toLocaleString()}원
          </div>
          <div className="stat-sub">상태 뱃지 클릭 시 즉시 변경</div>
        </div>
      </div>

      {/* 세무 참고용 안내 문구 (1단계 지시사항) */}
      <div className="no-print" style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '-0.75rem', marginBottom: '1.25rem', textAlign: 'right' }}>
        ※ 세율 계산은 참고용입니다. 실제 세금 신고는 세무 전문가와 확인하세요.
      </div>

      {/* 4. 수입 / 지출 탭 네비게이션 */}
      <div className="tab-nav no-print" style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
        <button 
          className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: activeTab === 'income' ? '#0F172A' : '#FFFFFF',
            color: activeTab === 'income' ? '#FFFFFF' : '#475569',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Wallet size={16} /> 수입 관리 (출강·판매·직거래)
        </button>

        <button 
          className={`tab-btn ${activeTab === 'expense' ? 'active' : ''}`}
          onClick={() => setActiveTab('expense')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: activeTab === 'expense' ? '#0F172A' : '#FFFFFF',
            color: activeTab === 'expense' ? '#FFFFFF' : '#475569',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Receipt size={16} /> 지출 관리 (화구·재료비·영수증)
        </button>
      </div>

      {/* ========================================================
          탭 1: 수입 관리 (Income Tab)
         ======================================================== */}
      {activeTab === 'income' && (
        <div className="workspace-grid no-print">
          {/* 수입 입력 폼 */}
          <div className="panel-card">
            <div className="panel-card-title">
              <span>새 수입 내역 등록</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>자동 실수령액 산출</span>
            </div>

            <form onSubmit={handleAddIncome}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">일자</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">소득/세율 유형</label>
                  <select 
                    className="form-select"
                    value={newIncome.type}
                    onChange={(e) => setNewIncome({...newIncome, type: e.target.value})}
                  >
                    <option value="business">출강/외주 (사업소득 3.3%)</option>
                    <option value="other">1회성 특강/자문 (기타소득 8.8%)</option>
                    <option value="gallery">갤러리 위탁판매 (수수료 40% 공제)</option>
                    <option value="personal">개인 거래 / 직거래 (공제 없음 0%)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">지급처 / 의뢰 기관</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 종로문화재단, 서울시립대, 개인 컬렉터"
                  value={newIncome.client}
                  onChange={(e) => setNewIncome({...newIncome, client: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">프로젝트 / 활동 항목명</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 현대미술 4주 출강, 50호 소품 판매"
                  value={newIncome.title}
                  onChange={(e) => setNewIncome({...newIncome, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">세전 계약 금액 (원)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 1,000,000"
                  value={newIncome.grossAmount}
                  onChange={(e) => setNewIncome({...newIncome, grossAmount: e.target.value})}
                  required
                />
              </div>

              {/* 실시간 계산 프리뷰 박스 */}
              {newIncome.grossAmount && (
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.86rem' }}>
                  {(() => {
                    const gross = parseInt(newIncome.grossAmount.replace(/[^0-9]/g, '')) || 0;
                    const { tax, net } = calculateNet(newIncome.type, gross);
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '4px' }}>
                          <span>공제액 ({newIncome.type === 'business' ? '3.3%' : newIncome.type === 'other' ? '8.8%' : newIncome.type === 'gallery' ? '수수료 40%' : '수수료 0%'}):</span>
                          <span>-{tax.toLocaleString()}원</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0F172A', fontSize: '0.98rem' }}>
                          <span>예상 실수령액:</span>
                          <span>{net.toLocaleString()}원</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <button type="submit" className="btn-primary">
                <Plus size={16} /> 수입 장부에 기록하기
              </button>
            </form>
          </div>

          {/* 수입 관리 대장 */}
          <div className="panel-card">
            <div className="panel-card-title">
              <span>수입 관리 대장</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>
                상태 클릭: ⚪ 미청구 ➔ 🟡 청구완료 ➔ 🟢 입금완료
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>일자</th>
                    <th>항목 / 지급처</th>
                    <th>실수령액 (세후)</th>
                    <th>상태</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#9CA3AF' }}>
                        등록된 수입 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    incomes.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '0.8rem', color: '#6B7280' }}>{item.date}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                            {item.client} • {item.type === 'business' ? '사업 3.3%' : item.type === 'other' ? '기타 8.8%' : item.type === 'gallery' ? '위탁수수료' : '개인직거래'}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {item.netAmount.toLocaleString()}원
                          <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 400 }}>
                            세전 {item.grossAmount.toLocaleString()}원
                          </div>
                        </td>
                        <td>
                          <span 
                            className={`badge-status ${item.status}`}
                            onClick={() => handleToggleStatus(item.id)}
                            title="클릭하여 입금 상태 변경"
                          >
                            {item.status === 'paid' && '🟢 입금완료'}
                            {item.status === 'pending' && '🟡 청구완료'}
                            {item.status === 'unbilled' && '⚪ 미청구'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDeleteIncome(item.id)} 
                            style={{ color: '#9CA3AF', padding: '4px' }}
                            title="삭제"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          탭 2: 지출 관리 (Expense Tab - 재료비 & 영수증)
         ======================================================== */}
      {activeTab === 'expense' && (
        <div className="workspace-grid no-print">
          {/* 지출 내역 등록 폼 */}
          <div className="panel-card">
            <div className="panel-card-title">
              <span>새 재료비·지출 등록</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>영수증 사진 첨부 지원</span>
            </div>

            <form onSubmit={handleAddExpense}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">일자</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">지출 분류</label>
                  <select 
                    className="form-select"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  >
                    <option value="화구/재료비">화구/재료비 (물감, 붓, 흙 등)</option>
                    <option value="캔버스/표구비">캔버스/표구비 (틀, 액자)</option>
                    <option value="인쇄/도록비">인쇄/도록비 (엽서, 포스터)</option>
                    <option value="공방/작업실비">공방/작업실비 (대여, 소모품)</option>
                    <option value="기타 경비">기타 경비 (운송비, 식비 등)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">구입처 / 상호명</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 호미화방, 한가람문구, 쿠팡, 알파문구"
                  value={newExpense.store}
                  onChange={(e) => setNewExpense({...newExpense, store: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">구입 품명 및 내역</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 리퀴텍스 아크릴 물감 12색 세트, M10호 캔버스 3개"
                  value={newExpense.item}
                  onChange={(e) => setNewExpense({...newExpense, item: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">결제 금액 (원)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 85,000"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">프로젝트 / 비고 (선택)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 청년예술인지원사업, 개인전 준비"
                  value={newExpense.memo}
                  onChange={(e) => setNewExpense({...newExpense, memo: e.target.value})}
                />
              </div>

              {/* 영수증 이미지 첨부 필드 */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>카드 영수증 / 모바일 캡처 첨부</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>선택사항 (A4 양식 자동 합성)</span>
                </label>

                <input 
                  type="file" 
                  ref={receiptFileInputRef}
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  style={{ display: 'none' }}
                />

                {newExpense.receiptUrl ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    border: '1px solid #BBF7D0',
                    backgroundColor: '#F0FDF4',
                    borderRadius: '8px'
                  }}>
                    <img 
                      src={newExpense.receiptUrl} 
                      alt="영수증 미리보기" 
                      style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #86EFAC' }} 
                    />
                    <div style={{ flex: 1, fontSize: '13px', color: '#166534' }}>
                      <strong>영수증 사진이 첨부되었습니다</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#15803D' }}>A4 정산서 출력 시 하단에 자동으로 얹어집니다.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setNewExpense(prev => ({ ...prev, receiptUrl: '' }))}
                      style={{ color: '#EF4444', fontSize: '12px', fontWeight: '600' }}
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => receiptFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#94A3B8'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                  >
                    <Camera size={16} /> 영수증 사진 또는 모바일 캡처 선택
                  </button>
                )}
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '5px' }}>
                  * 사진이 없어도 A4 증빙서를 출력할 수 있습니다. (실물 영수증 풀칠용 점선 박스 제공)
                </p>
              </div>

              <button type="submit" className="btn-primary">
                <Plus size={16} /> 지출 내역 기록하기
              </button>
            </form>
          </div>

          {/* 지출 관리 대장 */}
          <div className="panel-card">
            <div className="panel-card-title">
              <span>지출 관리 대장</span>
              <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>
                A4 정산 증빙서 원클릭 인쇄 지원
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>일자</th>
                    <th>분류 / 구입처</th>
                    <th>품명 및 내역</th>
                    <th>금액</th>
                    <th>영수증</th>
                    <th style={{ textAlign: 'center' }}>증빙 양식</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#9CA3AF' }}>
                        등록된 지출 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '0.8rem', color: '#6B7280' }}>{item.date}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{item.category}</div>
                          <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>{item.store}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.86rem', color: '#0F172A', fontWeight: 500 }}>{item.item}</div>
                          {item.memo && <div style={{ fontSize: '0.74rem', color: '#64748B' }}>({item.memo})</div>}
                        </td>
                        <td style={{ fontWeight: 700, color: '#DC2626' }}>
                          {item.amount.toLocaleString()}원
                        </td>
                        <td>
                          {item.receiptUrl ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              <Check size={11} /> 첨부됨
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#F1F5F9',
                              color: '#64748B',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              실물용
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setPrintExpenseItem(item)}
                            className="btn-outline"
                            style={{
                              padding: '4px 10px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              color: '#0F172A',
                              borderColor: '#CBD5E1'
                            }}
                            title="기관 제출용 A4 지출 정산서 인쇄"
                          >
                            <Printer size={13} style={{ marginRight: '4px' }} /> A4 증빙서
                          </button>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDeleteExpense(item.id)} 
                            style={{ color: '#9CA3AF', padding: '4px' }}
                            title="삭제"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. 🖨️ A4 지출 정산 증빙서 모달 (인쇄 & PDF 출력)
         ======================================================== */}
      {printExpenseItem && (
        <div className="modal-overlay" onClick={() => setPrintExpenseItem(null)} style={{ zIndex: 1000, overflowY: 'auto', padding: '20px 10px' }}>
          <div 
            className="printable-sheet-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '720px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              margin: 'auto'
            }}
          >
            {/* 상단 컨트롤 바 (화면에서만 보이고 인쇄 시 숨김) */}
            <div className="no-print" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#38BDF8" />
                <span style={{ fontSize: '14.5px', fontWeight: '700' }}>기관 제출용 A4 지출 정산 증빙서</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={15} /> A4 인쇄 / PDF 저장
                </button>
                <button
                  type="button"
                  onClick={() => setPrintExpenseItem(null)}
                  style={{ color: '#94A3B8', background: 'none', border: 'none', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 실제 A4 서류 출력 영역 */}
            <div className="printable-a4-document" style={{
              padding: '36px 32px',
              backgroundColor: '#FFFFFF',
              color: '#111827',
              fontFamily: "'Pretendard', sans-serif",
              lineHeight: 1.5
            }}>
              {/* 서류 헤더 */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  letterSpacing: '6px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '6px',
                  margin: '0 0 10px 0',
                  color: '#0F172A'
                }}>
                  재 료 비  지 출  정 산  증 빙 서
                </h1>
                <p style={{ fontSize: '12px', color: '#64748B' }}>
                  (문화예술 창작 및 지원사업 정산 증빙용)
                </p>
              </div>

              {/* 기본 정보 테이블 */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '18px',
                fontSize: '13px',
                border: '1.5px solid #111827'
              }}>
                <tbody>
                  <tr>
                    <th style={{ width: '18%', backgroundColor: '#F8FAFC', padding: '8px 10px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '700' }}>작 성 일 자</th>
                    <td style={{ width: '32%', padding: '8px 10px', border: '1px solid #CBD5E1' }}>{printExpenseItem.date}</td>
                    <th style={{ width: '18%', backgroundColor: '#F8FAFC', padding: '8px 10px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '700' }}>제 출 자 (작가)</th>
                    <td style={{ width: '32%', padding: '8px 10px', border: '1px solid #CBD5E1', fontWeight: '600' }}>김 아 라 (인)</td>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '700' }}>프로젝트 / 용도</th>
                    <td style={{ padding: '8px 10px', border: '1px solid #CBD5E1' }}>{printExpenseItem.memo || '작품 창작 활동'}</td>
                    <th style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '700' }}>구 입 처 (상호)</th>
                    <td style={{ padding: '8px 10px', border: '1px solid #CBD5E1' }}>{printExpenseItem.store || '-'}</td>
                  </tr>
                </tbody>
              </table>

              {/* 지출 상세 내역 테이블 */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                fontSize: '13px',
                border: '1.5px solid #111827'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9' }}>
                    <th style={{ padding: '8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>지출 일자</th>
                    <th style={{ padding: '8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>지출 분류</th>
                    <th style={{ padding: '8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>품명 및 내역</th>
                    <th style={{ padding: '8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>지출 금액</th>
                    <th style={{ padding: '8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>증빙 구분</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>{printExpenseItem.date}</td>
                    <td style={{ padding: '10px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '600' }}>{printExpenseItem.category}</td>
                    <td style={{ padding: '10px 10px', border: '1px solid #CBD5E1', fontWeight: '600' }}>{printExpenseItem.item}</td>
                    <td style={{ padding: '10px 10px', border: '1px solid #CBD5E1', textAlign: 'right', fontWeight: '700', fontSize: '14px' }}>
                      {printExpenseItem.amount.toLocaleString()}원
                    </td>
                    <td style={{ padding: '10px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontSize: '12px' }}>
                      {printExpenseItem.receiptUrl ? '전자영수증' : '실물영수증'}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#FAF5FF' }}>
                    <td colSpan="3" style={{ padding: '8px 10px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: '700' }}>
                      합 계 금 액
                    </td>
                    <td colSpan="2" style={{ padding: '8px 12px', border: '1px solid #CBD5E1', textAlign: 'right', fontWeight: '800', fontSize: '15px', color: '#7E22CE' }}>
                      일금 {printExpenseItem.amount.toLocaleString()}원정 (₩{printExpenseItem.amount.toLocaleString()})
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 숨겨진 모달 영수증 파일 입력창 */}
              <input 
                type="file" 
                ref={modalReceiptInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleModalReceiptUpload} 
              />

              {/* 하단 영수증 증빙 영역 (클릭 시 사진 업로드 & 미첨부 시 점선 빈칸 인쇄) */}
              <div style={{
                border: '1.5px solid #111827',
                borderRadius: '4px',
                padding: '16px',
                minHeight: '380px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                marginBottom: '20px'
              }}>
                {printExpenseItem.receiptUrl ? (
                  /* 1. 영수증 이미지가 있는 경우 */
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                      <button
                        type="button"
                        onClick={() => modalReceiptInputRef.current?.click()}
                        style={{
                          fontSize: '11.5px',
                          color: '#0284C7',
                          backgroundColor: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        사진 변경
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveModalReceipt}
                        style={{
                          fontSize: '11.5px',
                          color: '#EF4444',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        사진 삭제 (빈칸 복원)
                      </button>
                    </div>
                    <img 
                      src={printExpenseItem.receiptUrl} 
                      alt="영수증 원본 증빙" 
                      style={{
                        maxWidth: '90%',
                        maxHeight: '340px',
                        objectFit: 'contain',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    />
                  </div>
                ) : (
                  /* 2. 영수증 이미지가 없는 경우 (클릭 시 이미지 업로드, 미업로드 시 깨끗한 점선 빈칸 인쇄) */
                  <div 
                    onClick={() => modalReceiptInputRef.current?.click()}
                    className="receipt-dropzone-box"
                    style={{
                      width: '95%',
                      height: '320px',
                      border: '1.5px dashed #94A3B8',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#0284C7';
                      e.currentTarget.style.backgroundColor = '#F0F9FF';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#94A3B8';
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    title="클릭하여 영수증 사진을 바로 첨부하세요"
                  >
                    <Receipt size={34} color="#0284C7" className="no-print" style={{ marginBottom: '8px' }} />
                    <strong className="receipt-box-label" style={{ fontSize: '14px', color: '#334155', letterSpacing: '1px' }}>
                      【 영수증 부착 위치 】
                    </strong>
                    <span className="no-print" style={{ fontSize: '12px', color: '#0284C7', marginTop: '6px', fontWeight: '500' }}>
                      클릭하여 사진 첨부 (미첨부 시 빈칸으로 인쇄)
                    </span>
                  </div>
                )}
              </div>

              {/* 하단 서약 및 서명란 */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ fontSize: '13px', color: '#334155', marginBottom: '14px' }}>
                  위와 같이 작품 창작 및 예술 활동을 위한 재료비를 정당하게 집행하였음을 확인합니다.
                </p>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', display: 'flex', justifyContent: 'center', gap: '30px' }}>
                  <span>{printExpenseItem.date.split('-')[0]}년  {printExpenseItem.date.split('-')[1]}월  {printExpenseItem.date.split('-')[2]}일</span>
                  <span>제출자: 김 아 라 (서명 또는 인)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
