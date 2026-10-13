import React, { useState, useRef } from 'react';
import { Plus, X, Printer, FileDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

// 신진/취미/프로 작가 필수 14대 표준 재료기법 국/영문 프리셋 DB
const MATERIAL_PRESETS = [
  { ko: '캔버스에 유채', en: 'Oil on canvas' },
  { ko: '캔버스에 아크릴', en: 'Acrylic on canvas' },
  { ko: '캔버스에 유채, 혼합재료', en: 'Oil and mixed media on linen' },
  { ko: '캔버스에 혼합재료', en: 'Mixed media on canvas' },
  { ko: '패널에 아크릴, 혼합재료', en: 'Mixed media on wood panel' },
  { ko: '한지에 먹, 안료', en: 'Ink and pigment on Korean paper' },
  { ko: '한지에 수묵채색', en: 'Ink and color on Korean paper' },
  { ko: '장지에 채색', en: 'Color on thick Korean paper (Jangji)' },
  { ko: '종이에 수채', en: 'Watercolor on paper' },
  { ko: '종이에 과슈', en: 'Gouache on paper' },
  { ko: '종이에 오일파스텔', en: 'Oil pastel on paper' },
  { ko: '종이에 연필, 목탄', en: 'Pencil and charcoal on paper' },
  { ko: '디지털 드로잉, 아카이벌 피그먼트 프린트', en: 'Digital drawing, archival pigment print' },
  { ko: '도자, 백자토, 유약', en: 'Ceramic, porcelain, glaze' }
];

export default function CaptionStudio({ onBack }) {
  const [styleMode, setStyleMode] = useState('classic'); // 'classic' | 'modern' | 'commercial'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editingId, setEditingId] = useState(null); // 수정 중인 캡션 ID

  // 1페이지당 최대 6개 (2열 3행: 텍스트가 길어져도 세로 공간이 넉넉한 황금 비율)
  const ITEMS_PER_PAGE = 6;

  // 다중 A4 시트 참조 맵
  const pageRefs = useRef({});

  // 캡션 리스트 상태 (LocalStorage)
  const [captions, setCaptions] = useState(() => {
    try {
      const saved = localStorage.getItem('artflow_captions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 1,
        artistKo: '김아라',
        artistEn: 'Ara Kim',
        titleKo: '새벽의 경계',
        titleEn: 'The Boundary of Dawn',
        year: '2026',
        mediumKo: '캔버스에 유채, 혼합재료',
        mediumEn: 'Oil and mixed media on linen',
        size: '116.8 × 91.0 cm (50F)',
        price: '3,500,000원',
        isNfs: false
      },
      {
        id: 2,
        artistKo: '김아라',
        artistEn: 'Ara Kim',
        titleKo: '푸른 잔상 No. 3',
        titleEn: 'Blue Afterimage No. 3',
        year: '2025',
        mediumKo: '캔버스에 아크릴',
        mediumEn: 'Acrylic on canvas',
        size: '53.0 × 45.5 cm (10F)',
        price: '1,200,000원',
        isNfs: false
      },
      {
        id: 3,
        artistKo: '김아라',
        artistEn: 'Ara Kim',
        titleKo: '침묵의 심연',
        titleEn: 'Abyss of Silence',
        year: '2025',
        mediumKo: '한지에 먹, 안료',
        mediumEn: 'Ink and pigment on Korean paper',
        size: '72.7 × 60.6 cm (20F)',
        price: 'NFS (작가소장)',
        isNfs: true
      }
    ];
  });

  // 새 캡션 입력/수정 폼 상태
  const [form, setForm] = useState({
    artistKo: '김아라',
    artistEn: 'Ara Kim',
    titleKo: '',
    titleEn: '',
    year: new Date().getFullYear().toString(),
    mediumKo: '',
    mediumEn: '',
    size: '',
    price: '',
    isNfs: false
  });

  const saveCaptions = (newList) => {
    setCaptions(newList);
    try {
      localStorage.setItem('artflow_captions', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  // 등록 및 수정 완료 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titleKo.trim()) {
      alert('작품 제목을 입력해주세요.');
      return;
    }

    const calculatedPrice = form.isNfs ? 'NFS (비매품)' : form.price || '별도 문의';

    if (editingId) {
      // 1. 기존 캡션 오타/내용 수정
      const updatedList = captions.map((c) => {
        if (c.id === editingId) {
          return {
            ...c,
            ...form,
            price: calculatedPrice
          };
        }
        return c;
      });
      saveCaptions(updatedList);
      setEditingId(null);
    } else {
      // 2. 새 캡션 추가
      const newItem = {
        id: Date.now(),
        ...form,
        price: calculatedPrice
      };
      saveCaptions([...captions, newItem]);
    }

    // 폼 초기화 (작가명은 유지)
    setForm({
      artistKo: form.artistKo || '김아라',
      artistEn: form.artistEn || 'Ara Kim',
      titleKo: '',
      titleEn: '',
      year: new Date().getFullYear().toString(),
      mediumKo: '',
      mediumEn: '',
      size: '',
      price: '',
      isNfs: false
    });

    triggerConfetti();
  };

  // 미리보기 카드 클릭 시 좌측 폼으로 데이터 불러오기 (수정 모드 진입)
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setForm({
      artistKo: item.artistKo,
      artistEn: item.artistEn || '',
      titleKo: item.titleKo,
      titleEn: item.titleEn || '',
      year: item.year || new Date().getFullYear().toString(),
      mediumKo: item.mediumKo || '',
      mediumEn: item.mediumEn || '',
      size: item.size || '',
      price: item.isNfs ? '' : (item.price === 'NFS (비매품)' ? '' : item.price),
      isNfs: item.isNfs || item.price?.includes('NFS')
    });
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      artistKo: form.artistKo || '김아라',
      artistEn: form.artistEn || 'Ara Kim',
      titleKo: '',
      titleEn: '',
      year: new Date().getFullYear().toString(),
      mediumKo: '',
      mediumEn: '',
      size: '',
      price: '',
      isNfs: false
    });
  };

  const handleDelete = (id) => {
    if (editingId === id) setEditingId(null);
    saveCaptions(captions.filter(c => c.id !== id));
  };

  // 캡션들을 페이지별로 묶음 (1페이지당 최대 6개)
  const pages = [];
  for (let i = 0; i < captions.length; i += ITEMS_PER_PAGE) {
    pages.push(captions.slice(i, i + ITEMS_PER_PAGE));
  }

  // 다중 A4 페이지 지원 PDF 다운로드 함수 (폰트 왜곡 방지 및 다중 페이지 완벽 지원)
  const handleDownloadA4Pdf = async () => {
    if (captions.length === 0) return;

    try {
      setIsGeneratingPdf(true);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const pdfAspectRatio = pdfWidth / pdfHeight;

      // 모든 A4 시트를 순서대로 캡처하여 PDF 페이지로 추가
      for (let pIdx = 0; pIdx < pages.length; pIdx++) {
        const pageEl = pageRefs.current[pIdx];
        if (!pageEl) continue;

        if (pIdx > 0) {
          pdf.addPage('a4', 'p');
        }

        // 순수 A4 종이 영역만 초고해상도로 캡처
        const imgData = await toPng(pageEl, {
          pixelRatio: 3,
          backgroundColor: '#FFFFFF',
          skipFonts: true,
          style: {
            border: 'none',
            boxShadow: 'none',
            borderRadius: '0px'
          },
          filter: (node) => !node.classList?.contains('no-print')
        });

        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => { 
          img.onload = resolve;
          img.onerror = resolve;
        });

        const imgAspectRatio = img.width / img.height;
        let renderWidth = pdfWidth;
        let renderHeight = pdfHeight;
        let posX = 0;
        let posY = 0;

        // 종횡비 100% 보존
        if (Math.abs(imgAspectRatio - pdfAspectRatio) > 0.005) {
          if (imgAspectRatio > pdfAspectRatio) {
            renderWidth = pdfWidth;
            renderHeight = pdfWidth / imgAspectRatio;
            posY = (pdfHeight - renderHeight) / 2;
          } else {
            renderHeight = pdfHeight;
            renderWidth = pdfHeight * imgAspectRatio;
            posX = (pdfWidth - renderWidth) / 2;
          }
        }

        pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight);
      }

      pdf.save(`[Sujango]전시캡션_A4출력용_${new Date().toISOString().split('T')[0]}.pdf`);
      triggerConfetti();
    } catch (err) {
      console.error('A4 PDF 생성 실패:', err);
      alert('PDF 생성 중 문제가 발생했습니다. 브라우저 바로 인쇄 기능을 이용해 주세요.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#0F172A', '#D97706', '#059669']
      });
    } catch (e) {}
  };

  return (
    <div className="workspace-wrapper">
      {/* 상단 툴바: 오직 1개의 메인 PDF 다운로드 버튼으로 통일 */}
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 전체 도구 목록으로
        </button>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button 
            onClick={handleDownloadA4Pdf} 
            className="btn-primary" 
            disabled={isGeneratingPdf || captions.length === 0}
            style={{ width: 'auto', background: '#0F172A', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            title="테두리 박스를 따라 자르는 A4 인쇄용 정규격 PDF"
          >
            <FileDown size={18} />
            {isGeneratingPdf ? 'A4 PDF 생성 중...' : '📄 A4 인쇄용 PDF 다운로드'}
          </button>

          <button 
            onClick={() => window.print()} 
            className="btn-outline" 
            style={{ fontSize: '0.85rem' }}
          >
            <Printer size={15} /> 바로 인쇄
          </button>
        </div>
      </div>

      <div className="workspace-title-area" style={{ marginBottom: '1.25rem' }}>
        <h2>전시 캡션 출력기</h2>
        <p>
          각 작품마다 독립된 <strong>옅은 회색 테두리 박스</strong>가 둘러져 있어 선을 따라 자와 칼을 대고 오려내면 명패가 완성됩니다. 
          가로는 2열로 반듯하게 고정되고 세로는 글자 길이에 맞춰 유연하게 조정되며, 작품이 많아지면 자동으로 A4 다음 장이 생성됩니다.
        </p>
      </div>

      {/* 스타일 선택 바 */}
      <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab-btn ${styleMode === 'classic' ? 'active' : ''}`}
          onClick={() => setStyleMode('classic')}
        >
          🏛️ 국공립 미술관 클래식형 (명조)
        </button>
        <button 
          className={`tab-btn ${styleMode === 'modern' ? 'active' : ''}`}
          onClick={() => setStyleMode('modern')}
        >
          ⬛ 모던 갤러리 미니멀형 (산세리프)
        </button>
        <button 
          className={`tab-btn ${styleMode === 'commercial' ? 'active' : ''}`}
          onClick={() => setStyleMode('commercial')}
        >
          🔴 아트페어 / 상업 화랑형 (가격 표기)
        </button>
      </div>

      <div className="workspace-grid">
        {/* 좌측: 새 캡션 추가 및 오타 수정 폼 */}
        <div className="panel-card no-print">
          <div className="panel-card-title">
            <span>{editingId ? '✏️ 캡션 오타 / 내용 수정' : '새 작품 캡션 등록'}</span>
            <span style={{ fontSize: '0.78rem', color: editingId ? '#2563EB' : '#6B7280', fontWeight: editingId ? 600 : 400 }}>
              {editingId ? '수정 후 [수정 완료] 클릭' : '테두리 규격 자동 생성'}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">작가명 (국문)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={form.artistKo}
                  onChange={(e) => setForm({...form, artistKo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">작가명 (영문)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: Ara Kim"
                  value={form.artistEn}
                  onChange={(e) => setForm({...form, artistEn: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">작품 제목 (국문)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 새벽의 경계"
                  value={form.titleKo}
                  onChange={(e) => setForm({...form, titleKo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">작품 제목 (영문)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: The Boundary of Dawn"
                  value={form.titleEn}
                  onChange={(e) => setForm({...form, titleEn: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">제작 연도</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={form.year}
                  onChange={(e) => setForm({...form, year: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">크기 / 호수</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 116.8 × 91.0 cm (50호)"
                  value={form.size}
                  onChange={(e) => setForm({...form, size: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* 재료 및 기법 - 표준 영문 자동 완성 프리셋 */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>재료 및 기법 (국문)</label>
                <select 
                  className="form-select" 
                  style={{ 
                    fontSize: '0.78rem', 
                    padding: '0.25rem 0.5rem', 
                    maxWidth: '210px', 
                    border: '1px solid #CBD5E1', 
                    borderRadius: '4px', 
                    background: '#F8FAFC', 
                    cursor: 'pointer',
                    color: '#334155'
                  }}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const preset = MATERIAL_PRESETS.find(p => p.ko === e.target.value);
                    if (preset) {
                      setForm(prev => ({ ...prev, mediumKo: preset.ko, mediumEn: preset.en }));
                    }
                  }}
                  value=""
                >
                  <option value="" disabled>⚡ 14대 표준 재료 선택...</option>
                  {MATERIAL_PRESETS.map((p, idx) => (
                    <option key={idx} value={p.ko}>{p.ko} ({p.en})</option>
                  ))}
                </select>
              </div>

              {/* 인기 재료 원클릭 퀵 칩 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '0.5rem' }}>
                {MATERIAL_PRESETS.slice(0, 5).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="tag-chip"
                    onClick={() => setForm(prev => ({ ...prev, mediumKo: p.ko, mediumEn: p.en }))}
                    title={`${p.ko} (${p.en}) 국/영문 세트 자동 입력`}
                  >
                    + {p.ko.replace('캔버스에 ', '')}
                  </button>
                ))}
              </div>

              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 캔버스에 유채, 혼합재료"
                value={form.mediumKo}
                onChange={(e) => setForm({...form, mediumKo: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">재료 및 기법 (영문 병기 - 자동완성 또는 직접 입력)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: Oil and mixed media on linen"
                value={form.mediumEn}
                onChange={(e) => setForm({...form, mediumEn: e.target.value})}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>작품 가격 / 비매품</label>
                <label style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.isNfs}
                    onChange={(e) => setForm({...form, isNfs: e.target.checked})}
                  />
                  <span>NFS (비매품 / 소장품)</span>
                </label>
              </div>
              <input 
                type="text" 
                className="form-input" 
                placeholder={form.isNfs ? 'NFS (비매품)' : '예: 2,500,000원 또는 가격 별도 문의'}
                value={form.isNfs ? '' : form.price}
                disabled={form.isNfs}
                onChange={(e) => setForm({...form, price: e.target.value})}
              />
            </div>

            {editingId ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, background: '#0F172A' }}>
                  💾 캡션 수정 완료
                </button>
                <button type="button" onClick={handleCancelEdit} className="btn-outline">
                  취소
                </button>
              </div>
            ) : (
              <button type="submit" className="btn-primary">
                <Plus size={16} /> 캡션 목록에 추가하기
              </button>
            )}
          </form>
        </div>

        {/* 우측: 독립된 테두리 박스가 있는 실물 크기 A4 프리뷰 (다중 페이지 지원) */}
        <div className="panel-card printable-caption-container" style={{ padding: '1rem' }}>
          <div className="panel-card-title no-print" style={{ marginBottom: '0.75rem' }}>
            <span>A4 인쇄 미리보기 (총 {captions.length}점 등록 / A4 {pages.length}장)</span>
            <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              ✂️ 각 작품 테두리 선을 따라 오려 사용하세요 (가로 고정, 세로 자동)
            </span>
          </div>

          {captions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>
              등록된 작품 캡션이 없습니다.<br />
              좌측에서 작품 정보를 입력해 캡션을 추가해 보세요.
            </div>
          ) : (
            <div className="a4-sheets-wrapper">
              {pages.map((pageItems, pIdx) => (
                <div key={`page-${pIdx}`} className="a4-sheet-container">
                  <div className="a4-page-header no-print">
                    <span>📄 A4 {pIdx + 1}페이지 ({pageItems.length}점)</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>전체 {pages.length}장 중 {pIdx + 1}번째 장</span>
                  </div>

                  <div 
                    className="a4-sheet-preview" 
                    ref={(el) => { if (el) pageRefs.current[pIdx] = el; }}
                  >
                    <div className="caption-print-grid">
                      {pageItems.map((item) => {
                        const isCurrentEditing = item.id === editingId;
                        return (
                          <div 
                            key={item.id} 
                            className={`caption-card-item ${styleMode} ${isCurrentEditing ? 'is-editing' : ''}`}
                            onClick={() => handleEditClick(item)}
                            title="클릭 시 좌측 입력창에서 오타/내용을 바로 수정할 수 있습니다"
                            style={{ cursor: 'pointer' }}
                          >
                            {/* 카드 삭제용 미니멀 X 버튼 (인쇄/PDF 시 자동 제외) */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="caption-card-delete-btn no-print"
                              title="이 캡션 삭제"
                            >
                              <X size={13} />
                            </button>

                            {/* 수정 중 뱃지 (인쇄 시 자동 제외) */}
                            {isCurrentEditing && (
                              <div className="caption-editing-badge no-print">
                                ✏️ 수정 중
                              </div>
                            )}

                            <div className="caption-card-content">
                              {/* 상단: 작가 정보 및 작품 제목 */}
                              <div>
                              <div className="caption-card-header">
                                <span className="caption-artist-ko">{item.artistKo}</span>
                                {item.artistEn && <span className="caption-artist-en">{item.artistEn}</span>}
                              </div>

                              <div className="caption-title-box">
                                <div className="caption-title-ko">
                                  {styleMode === 'classic' ? `《${item.titleKo}》` : item.titleKo}
                                  <span className="caption-year">{item.year}</span>
                                </div>
                                {item.titleEn && (
                                  <div className="caption-title-en">{item.titleEn}</div>
                                )}
                              </div>
                            </div>

                            {/* 하단: 재료 및 규격 */}
                            <div className="caption-meta-box">
                              <div className="caption-medium">
                                {item.mediumKo}
                                {item.mediumEn && <span className="caption-sub"> ({item.mediumEn})</span>}
                              </div>
                              <div className="caption-size">{item.size}</div>
                            </div>
                          </div>

                          {/* 아트페어 가격 태그 (선택 시) */}
                          {styleMode === 'commercial' && (
                            <div className="caption-price-tag">
                              <span>{item.price}</span>
                              {!item.isNfs && <span className="caption-red-dot" title="판매 가능" />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
