import React, { useState, useEffect } from 'react';
import { X, Plus, Lightbulb, Sparkles, Check, Trash2 } from 'lucide-react';

export default function NewToolModal({ isOpen, onClose }) {
  const [ideas, setIdeas] = useState(() => {
    try {
      const saved = localStorage.getItem('artflow_tool_ideas');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 1, text: '전시회 작품 옆에 붙이는 A6 규격 캡션 네임택 (Title, Size, Price) 원클릭 인쇄기', status: '계획중' },
      { id: 2, text: '공모전 지원서 전용 1000자 이내 예술가 작업 철학 요약기', status: '계획중' },
      { id: 3, text: '화방/화구 재료비 영수증 부착용 A4 정산 증빙 양식 생성기', status: '계획중' }
    ];
  });

  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('artflow_tool_ideas', JSON.stringify(ideas));
    } catch (e) {
      console.error(e);
    }
  }, [ideas]);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const newItem = {
      id: Date.now(),
      text: inputVal.trim(),
      status: '아이디어'
    };
    setIdeas([newItem, ...ideas]);
    setInputVal('');
  };

  const handleDelete = (id) => {
    setIdeas(ideas.filter(item => item.id !== id));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '540px',
        width: '100%',
        padding: '2rem',
        boxShadow: 'var(--shadow-modal)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={22} color="#D97706" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
              새 도구 아이디어 보관함
            </h3>
          </div>
          <button onClick={onClose} style={{ color: '#9CA3AF', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          "작업하다가 이런 소소한 도구가 있으면 좋겠다!" 싶은 기능이 떠오르면 언제든 적어두세요. 
          Ara Agent Lab의 로드맵에 반영하여 하나씩 추가됩니다.
        </p>

        {/* 입력창 */}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="예: 전시회 캡션 네임택 출력기..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.25rem' }}>
            <Plus size={16} /> 추가
          </button>
        </form>

        {/* 아이디어 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '240px', overflowY: 'auto' }}>
          {ideas.map((item) => (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.85rem',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.86rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, paddingRight: '8px' }}>
                <span style={{ fontSize: '0.72rem', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  {item.status}
                </span>
                <span style={{ color: '#1E293B' }}>{item.text}</span>
              </div>
              <button onClick={() => handleDelete(item.id)} style={{ color: '#94A3B8', padding: '2px' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-outline">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
