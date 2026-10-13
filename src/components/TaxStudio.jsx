import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Clock, AlertCircle, Calculator, TrendingUp } from 'lucide-react';

export default function TaxStudio({ onBack, onUpdateSummary }) {
  // 소득 목록 상태 (LocalStorage 영구 보관)
  const [incomes, setIncomes] = useState(() => {
    try {
      const saved = localStorage.getItem('artflow_incomes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 1,
        date: '2026-10-05',
        type: 'business', // 'business' (3.3%) | 'other' (8.8%) | 'gallery' (40%)
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
      }
    ];
  });

  // 새 항목 입력 폼 상태
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'business',
    client: '',
    title: '',
    grossAmount: ''
  });

  // LocalStorage 저장 및 상위 요약 갱신
  useEffect(() => {
    try {
      localStorage.setItem('artflow_incomes', JSON.stringify(incomes));
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
  }, [incomes]);

  // 계산 로직
  const calculateNet = (type, gross) => {
    const raw = parseInt(gross) || 0;
    if (type === 'business') {
      // 3.3% 사업소득 원천징수
      const tax = Math.round(raw * 0.033);
      return { tax, net: raw - tax };
    } else if (type === 'other') {
      // 8.8% 기타소득 (필요경비 60% 인정 -> 40%에 대해 22%)
      const tax = Math.round(raw * 0.088);
      return { tax, net: raw - tax };
    } else if (type === 'gallery') {
      // 갤러리 위탁 수수료 40% 공제
      const commission = Math.round(raw * 0.40);
      return { tax: commission, net: raw - commission };
    }
    return { tax: 0, net: raw };
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    const gross = parseInt(newEntry.grossAmount.replace(/[^0-9]/g, '')) || 0;
    if (!newEntry.title || gross <= 0) {
      alert('항목명과 금액을 올바르게 입력해주세요.');
      return;
    }

    const { tax, net } = calculateNet(newEntry.type, gross);

    const newItem = {
      id: Date.now(),
      date: newEntry.date,
      type: newEntry.type,
      client: newEntry.client || '개인/기타',
      title: newEntry.title,
      grossAmount: gross,
      taxAmount: tax,
      netAmount: net,
      status: 'pending' // 기본은 청구완료
    };

    setIncomes([newItem, ...incomes]);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      type: 'business',
      client: '',
      title: '',
      grossAmount: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('이 정산 항목을 삭제하시겠습니까?')) {
      setIncomes(incomes.filter(item => item.id !== id));
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
  const totalWithheldTax = incomes
    .filter(item => item.type === 'business' || item.type === 'other')
    .reduce((sum, item) => sum + item.taxAmount, 0);

  return (
    <div className="workspace-wrapper">
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 전체 도구 목록으로
        </button>
      </div>

      <div className="workspace-title-area" style={{ marginBottom: '1.5rem' }}>
        <h2>창작 수입 장부</h2>
        <p>출강비·특강료·작품 판매금의 실수령액을 확인하고, 입금 여부와 미수금을 깔끔하게 기록하세요.</p>
      </div>

      {/* 요약 카드 그리드 */}
      <div className="dashboard-stats-strip" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-item-box">
          <div className="stat-label">총 실수령 입금액 (누적)</div>
          <div className="stat-value">{totalNet.toLocaleString()}원</div>
          <div className="stat-sub">세전 총액: {totalGross.toLocaleString()}원</div>
        </div>
        <div className="stat-item-box">
          <div className="stat-label">입금 대기중 미수금 (청구완료)</div>
          <div className="stat-value" style={{ color: pendingTotal > 0 ? '#D97706' : '#111827' }}>
            {pendingTotal.toLocaleString()}원
          </div>
          <div className="stat-sub">상태 뱃지 클릭 시 즉시 변경</div>
        </div>
        <div className="stat-item-box">
          <div className="stat-label">원천징수 기납부 세액 합계</div>
          <div className="stat-value" style={{ color: '#059669' }}>
            {totalWithheldTax.toLocaleString()}원
          </div>
          <div className="stat-sub">5월 종소세 신고 시 기납부세액 공제 대상</div>
        </div>
      </div>

      <div className="workspace-grid">
        {/* 새 항목 등록 폼 */}
        <div className="panel-card">
          <div className="panel-card-title">
            <span>새 수입 내역 등록</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>자동 실수령액 산출</span>
          </div>

          <form onSubmit={handleAddEntry}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">일자</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">소득/세율 유형</label>
                <select 
                  className="form-select"
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
                >
                  <option value="business">출강/외주 (사업소득 3.3%)</option>
                  <option value="other">1회성 특강/자문 (기타소득 8.8%)</option>
                  <option value="gallery">갤러리 위탁판매 (수수료 40% 공제)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">지급처 / 의뢰 기관</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: ○○문화재단, 서울시립대, 갤러리"
                value={newEntry.client}
                onChange={(e) => setNewEntry({...newEntry, client: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">프로젝트 / 활동 항목명</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 현대미술 4주 출강, 50호 작품 판매"
                value={newEntry.title}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">세전 계약 금액 (원)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 1,000,000"
                value={newEntry.grossAmount}
                onChange={(e) => setNewEntry({...newEntry, grossAmount: e.target.value})}
                required
              />
            </div>

            {/* 실시간 계산 프리뷰 박스 */}
            {newEntry.grossAmount && (
              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.86rem' }}>
                {(() => {
                  const gross = parseInt(newEntry.grossAmount.replace(/[^0-9]/g, '')) || 0;
                  const { tax, net } = calculateNet(newEntry.type, gross);
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '4px' }}>
                        <span>공제액 ({newEntry.type === 'business' ? '3.3%' : newEntry.type === 'other' ? '8.8%' : '수수료 40%'}):</span>
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

        {/* 내역 테이블 패널 */}
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
                          {item.client} • {item.type === 'business' ? '사업 3.3%' : item.type === 'other' ? '기타 8.8%' : '위탁수수료'}
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
                          onClick={() => handleDelete(item.id)} 
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
    </div>
  );
}
