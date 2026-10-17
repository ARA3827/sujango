// src/inspo_module/InspoVaultView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Heart, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  Plus, 
  X, 
  Sparkles,
  ExternalLink,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_QUOTES } from './data/initialQuotes';
import { formatSentenceBreak } from './utils/textFormatter';
import { KakaoSheet } from './components/KakaoSheet';
import './inspo_styles.css';

// 카카오톡 공식 브랜드 심볼 SVG 아이콘
function KakaoSymbol({ size = 18 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="11" fill="#FEE500" />
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M12 5.8C8.47 5.8 5.6 7.95 5.6 10.6C5.6 12.28 6.7 13.76 8.4 14.58L7.73 17.1C7.65 17.39 7.99 17.61 8.24 17.45L11.25 15.44C11.5 15.46 11.75 15.47 12 15.47C15.53 15.47 18.4 13.32 18.4 10.67C18.4 8.02 15.53 5.8 12 5.8Z" 
        fill="#3C1E1E" 
      />
    </svg>
  );
}

import { getUserScopedKey } from '../utils/authStorage';

export function InspoVaultView({ onBack, user = null }) {
  const storageKey = getUserScopedKey('sujango_inspo_vault_v1', user);

  // 1. 영감 문장 상태 관리 (작가 계정별 분리)
  const [quotes, setQuotes] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    if (user?.id === 'user-ara' || user?.email === 'ara.kim@sujango.com') {
      return INITIAL_QUOTES;
    }

    return [];
  });

  // LocalStorage 영구 동기화
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(quotes));
    } catch (e) {
      console.error(e);
    }
  }, [quotes, storageKey]);

  // 2. 입력 폼 상태
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('book');
  const [newSource, setNewSource] = useState('');
  const [newThought, setNewThought] = useState('');

  // 3. 필터 및 검색 상태
  const [currentCategory, setCurrentCategory] = useState('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 4. 모달 상태
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isKakaoSheetOpen, setIsKakaoSheetOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // 카테고리별 개수 산출
  const categoryCounts = useMemo(() => {
    const counts = { all: quotes.length, book: 0, movie: 0, tv: 0, thought: 0, favorites: 0 };
    quotes.forEach((q) => {
      const cat = q.category || 'thought';
      if (counts[cat] !== undefined) counts[cat]++;
      if (q.isFavorite) counts.favorites++;
    });
    return counts;
  }, [quotes]);

  // 필터링된 문장 목록
  const filteredQuotes = useMemo(() => {
    let result = [...quotes];
    if (showOnlyFavorites) {
      result = result.filter((q) => q.isFavorite);
    } else if (currentCategory !== 'all') {
      result = result.filter((q) => (q.category || 'thought') === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          (item.workTitle && item.workTitle.toLowerCase().includes(q)) ||
          (item.userThought && item.userThought.toLowerCase().includes(q))
      );
    }
    return result;
  }, [quotes, currentCategory, showOnlyFavorites, searchQuery]);

  // 문장 등록
  const handleAddQuote = (e) => {
    e.preventDefault();
    if (!newText.trim()) {
      alert('마음에 남은 문장을 입력해주세요.');
      return;
    }

    const formattedText = formatSentenceBreak(newText.trim());
    const newQuote = {
      id: `inspo-${Date.now()}`,
      text: formattedText,
      category: newCategory,
      workTitle: newSource.trim() || (newCategory === 'thought' ? '생각 메모' : '기록된 한 줄'),
      creator: '',
      context: '',
      userThought: newThought.trim(),
      tags: ['영감'],
      date: new Date().toISOString().slice(0, 10),
      isFavorite: false
    };

    setQuotes((prev) => [newQuote, ...prev]);

    // 폼 초기화
    setNewText('');
    setNewSource('');
    setNewThought('');
    setNewCategory('book');

    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.4 },
        colors: ['#0F172A', '#38BDF8', '#64748B']
      });
    } catch (err) {}
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = (id) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isFavorite: !q.isFavorite } : q))
    );
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  // 문장 삭제
  const handleDeleteQuote = (id) => {
    if (window.confirm('이 영감 문장을 보관함에서 삭제하시겠습니까?')) {
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(null);
      }
    }
  };

  // 문장 복사
  const handleCopyQuote = (quote) => {
    const formatted = formatSentenceBreak(quote.text);
    const source = quote.workTitle ? `\n- 《${quote.workTitle}》` : '';
    const thought = quote.userThought ? `\n(생각한줌: ${quote.userThought})` : '';
    const textToCopy = `“${formatted}”${source}${thought}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 카카오톡 일괄 등록
  const handleImportBatch = (items) => {
    setQuotes((prev) => [...items, ...prev]);
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'book': return '책';
      case 'movie': return '영화';
      case 'tv': return '드라마';
      case 'thought': return '생각';
      default: return '기록';
    }
  };

  return (
    <div className="workspace-wrapper">
      {/* 1. 상단 워크스페이스 탑 바 */}
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 전체 도구 목록으로
        </button>
        <button
          type="button"
          onClick={() => setIsKakaoSheetOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            backgroundColor: '#FEE500',
            border: '1px solid #E6CF00',
            borderRadius: '6px',
            padding: '7px 15px',
            fontSize: '13px',
            fontWeight: '700',
            color: '#3C1E1E',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(60, 30, 30, 0.08)',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#FDD835';
            e.currentTarget.style.borderColor = '#D6B800';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FEE500';
            e.currentTarget.style.borderColor = '#E6CF00';
          }}
        >
          <KakaoSymbol size={18} />
          <span>카톡 대화 불러오기</span>
        </button>
      </div>

      {/* 2. 타이틀 영역 */}
      <div className="workspace-title-area" style={{ marginBottom: '1.5rem' }}>
        <h2>영감 노트</h2>
        <p>책, 영화, 일상에서 마주친 생각과 문장을 차곡차곡 기록하고, 카카오톡 메모도 간편하게 가져오세요.</p>
      </div>

      {/* 3. 데스크톱 2열 표준 워크스페이스 그리드 */}
      <div className="workspace-grid">
        {/* ========================================================
            좌측 열: 새 영감·문장 기록 폼 (Panel Card)
           ======================================================== */}
        <div className="panel-card">
          <div className="panel-card-title">
            <span>새 영감·문장 기록</span>
          </div>

          <form onSubmit={handleAddQuote}>
            <div className="form-group">
              <label className="form-label">
                마음에 남은 문장 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                className="form-input"
                style={{
                  minHeight: '130px',
                  fontFamily: "var(--font-serif, 'Gowun Batang', 'Noto Serif KR', serif)",
                  fontSize: '14.5px',
                  lineHeight: '1.6',
                  padding: '12px'
                }}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="마음을 울린 문장이나 대사를 기록해 보세요"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">어디에서</label>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="book">책</option>
                  <option value="movie">영화</option>
                  <option value="tv">드라마</option>
                  <option value="thought">생각/일상</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">출처 (작품명·페이지 등)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="예: 《헤어질 결심》, 128p"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                생각한줌 <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>· 선택 메모</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                placeholder="이 문장을 마주쳤을 때 든 내 생각이나 단상"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '14.5px',
                fontWeight: '600',
                backgroundColor: '#0F172A'
              }}
            >
              <Check size={16} />
              <span>저장</span>
            </button>
          </form>
        </div>

        {/* ========================================================
            우측 열: 수집된 영감 보관함 피드 (Panel Card)
           ======================================================== */}
        <div className="panel-card">
          {/* 카테고리 칩 필터 바 */}
          <div className="inspo-filter-chips-row">
            <button
              type="button"
              className={`inspo-chip-btn ${!showOnlyFavorites && currentCategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                setShowOnlyFavorites(false);
                setCurrentCategory('all');
              }}
            >
              <span>전체</span>
              <span style={{ opacity: 0.7, fontSize: '11px' }}>{categoryCounts.all}</span>
            </button>

            <button
              type="button"
              className={`inspo-chip-btn ${!showOnlyFavorites && currentCategory === 'book' ? 'active' : ''}`}
              onClick={() => {
                setShowOnlyFavorites(false);
                setCurrentCategory('book');
              }}
            >
              <span>책</span>
              <span style={{ opacity: 0.7, fontSize: '11px' }}>{categoryCounts.book}</span>
            </button>

            <button
              type="button"
              className={`inspo-chip-btn ${!showOnlyFavorites && currentCategory === 'movie' ? 'active' : ''}`}
              onClick={() => {
                setShowOnlyFavorites(false);
                setCurrentCategory('movie');
              }}
            >
              <span>영화</span>
              <span style={{ opacity: 0.7, fontSize: '11px' }}>{categoryCounts.movie}</span>
            </button>

            <button
              type="button"
              className={`inspo-chip-btn ${!showOnlyFavorites && currentCategory === 'tv' ? 'active' : ''}`}
              onClick={() => {
                setShowOnlyFavorites(false);
                setCurrentCategory('tv');
              }}
            >
              <span>드라마</span>
              <span style={{ opacity: 0.7, fontSize: '11px' }}>{categoryCounts.tv}</span>
            </button>

            <button
              type="button"
              className={`inspo-chip-btn ${!showOnlyFavorites && currentCategory === 'thought' ? 'active' : ''}`}
              onClick={() => {
                setShowOnlyFavorites(false);
                setCurrentCategory('thought');
              }}
            >
              <span>생각</span>
              <span style={{ opacity: 0.7, fontSize: '11px' }}>{categoryCounts.thought}</span>
            </button>

            <button
              type="button"
              className={`inspo-chip-btn favorite-chip ${showOnlyFavorites ? 'active' : ''}`}
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              title="즐겨찾기한 영감 모아보기"
            >
              <Heart size={12} fill={showOnlyFavorites ? '#FFFFFF' : '#E11D48'} />
              <span>즐겨찾기</span>
            </button>
          </div>

          {/* 검색 입력 바 */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '13px' }}
              placeholder="문장 내용, 출처, 생각한줌 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 영감 카드 피드 그리드 */}
          <div className="inspo-feed-grid">
            {filteredQuotes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 16px',
                color: '#94A3B8',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px dashed #CBD5E1'
              }}>
                <BookOpen size={32} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '13.5px', margin: 0 }}>일치하는 영감 문장이 없습니다.</p>
              </div>
            ) : (
              filteredQuotes.map((quote) => (
                <article key={quote.id} className="inspo-card-modern">
                  <div className="inspo-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`inspo-category-badge ${quote.category || 'uncategorized'}`}>
                        {getCategoryLabel(quote.category)}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>{quote.date}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(quote.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={quote.isFavorite ? '보관함에서 해제' : '보관함에 담기'}
                    >
                      <Heart
                        size={17}
                        fill={quote.isFavorite ? '#E11D48' : 'none'}
                        color={quote.isFavorite ? '#E11D48' : '#94A3B8'}
                      />
                    </button>
                  </div>

                  {/* 문장 본문 (명조체) */}
                  <div className="inspo-quote-text">
                    “{formatSentenceBreak(quote.text)}”
                  </div>

                  {/* 생각한줌 메모 */}
                  {quote.userThought && (
                    <div className="inspo-thought-box">
                      <span style={{ fontSize: '13px' }}>💭</span>
                      <div>
                        <strong style={{ color: '#0F172A' }}>생각한줌:</strong> {quote.userThought}
                      </div>
                    </div>
                  )}

                  {/* 카드 푸터 */}
                  <div className="inspo-card-footer">
                    <span className="inspo-source-badge">
                      {quote.workTitle || '출처 미입력'}
                    </span>

                    <div className="inspo-actions-row">
                      <button
                        type="button"
                        className="inspo-action-btn"
                        onClick={() => handleCopyQuote(quote)}
                        title="문장 복사"
                      >
                        {copiedId === quote.id ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                        <span>{copiedId === quote.id ? '복사됨' : '복사'}</span>
                      </button>

                      <button
                        type="button"
                        className="inspo-action-btn"
                        onClick={() => setSelectedQuote(quote)}
                        title="자세히 보기 및 생각한줌 수정"
                      >
                        <Edit3 size={13} />
                        <span>수정</span>
                      </button>

                      <button
                        type="button"
                        className="inspo-action-btn delete-btn"
                        onClick={() => handleDeleteQuote(quote.id)}
                        title="삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. 🔍 문장 상세 및 전체 내용(영감 본문/출처/메모) 수정 모달
         ======================================================== */}
      {selectedQuote && (
        <div className="modal-overlay" onClick={() => setSelectedQuote(null)} style={{ zIndex: 1000, overflowY: 'auto', padding: '20px 10px' }}>
          <div className="inspo-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="inspo-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={16} color="#38BDF8" />
                <span style={{ fontSize: '15px', fontWeight: '700' }}>
                  영감 문장 & 내용 수정
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="inspo-modal-body">
              {/* 1. 영감 문장 본문 수정 (Textarea) */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">
                  마음에 남은 영감 문장 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  className="form-input"
                  style={{
                    minHeight: '120px',
                    fontFamily: "var(--font-serif, 'Gowun Batang', 'Noto Serif KR', serif)",
                    fontSize: '15px',
                    lineHeight: '1.65',
                    padding: '12px'
                  }}
                  value={selectedQuote.text || ''}
                  onChange={(e) => {
                    const updated = { ...selectedQuote, text: e.target.value };
                    setSelectedQuote(updated);
                    setQuotes((prev) => prev.map((q) => (q.id === selectedQuote.id ? updated : q)));
                  }}
                  placeholder="마음을 울린 문장이나 대사를 기록해 보세요"
                  required
                />
              </div>

              {/* 2. 어디에서 (카테고리) & 출처 (작품명) 2열 수정 */}
              <div className="form-row" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">어디에서</label>
                  <select
                    className="form-select"
                    value={selectedQuote.category || 'book'}
                    onChange={(e) => {
                      const updated = { ...selectedQuote, category: e.target.value };
                      setSelectedQuote(updated);
                      setQuotes((prev) => prev.map((q) => (q.id === selectedQuote.id ? updated : q)));
                    }}
                  >
                    <option value="book">책</option>
                    <option value="movie">영화</option>
                    <option value="tv">드라마</option>
                    <option value="thought">생각/일상</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">출처 (작품명·페이지 등)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedQuote.workTitle || ''}
                    onChange={(e) => {
                      const updated = { ...selectedQuote, workTitle: e.target.value };
                      setSelectedQuote(updated);
                      setQuotes((prev) => prev.map((q) => (q.id === selectedQuote.id ? updated : q)));
                    }}
                    placeholder="예: 《헤어질 결심》, 128p"
                  />
                </div>
              </div>

              {/* 3. 생각한줌 메모 수정 */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>💭 생각한줌 메모</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>· 선택 기록</span>
                </label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', fontSize: '13.5px', lineHeight: '1.6' }}
                  value={selectedQuote.userThought || ''}
                  onChange={(e) => {
                    const updated = { ...selectedQuote, userThought: e.target.value };
                    setSelectedQuote(updated);
                    setQuotes((prev) => prev.map((q) => (q.id === selectedQuote.id ? updated : q)));
                  }}
                  placeholder="이 문장을 마주쳤을 때의 생각한줌을 남겨보세요..."
                />
              </div>
            </div>

            <div className="inspo-modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                style={{
                  padding: '8px 26px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  backgroundColor: '#0F172A',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => setSelectedQuote(null)}
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. 💬 카카오톡 연동 시트 모달
         ======================================================== */}
      {isKakaoSheetOpen && (
        <KakaoSheet
          onClose={() => setIsKakaoSheetOpen(false)}
          onImportBatch={handleImportBatch}
        />
      )}
    </div>
  );
}

export default InspoVaultView;
