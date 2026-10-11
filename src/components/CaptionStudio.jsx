import React, { useState, useRef } from 'react';
import { Plus, X, Printer, FileDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

export default function CaptionStudio({ onBack }) {
  const [styleMode, setStyleMode] = useState('classic'); // 'classic' | 'modern' | 'commercial'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // A4 시트 전체 참조 (실물 크기 1:1 캡처용)
  const a4SheetRef = useRef(null);

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

  // 새 캡션 입력 폼 상태
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

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.titleKo.trim()) {
      alert('작품 제목을 입력해주세요.');
      return;
    }

    const newItem = {
      id: Date.now(),
      ...form,
      price: form.isNfs ? 'NFS (비매품)' : form.price || '별도 문의'
    };

    saveCaptions([...captions, newItem]);
    setForm({
      ...form,
      titleKo: '',
      titleEn: '',
      mediumKo: '',
      mediumEn: '',
      size: '',
      price: '',
      isNfs: false
    });

    triggerConfetti();
  };

  const handleDelete = (id) => {
    saveCaptions(captions.filter(c => c.id !== id));
  };

  // 단 1개의 통합 PDF 다운로드 함수 (폰트 왜곡 방지: 원본 가로/세로 종횡비 100% 보존)
  const handleDownloadA4Pdf = async () => {
    if (!a4SheetRef.current || captions.length === 0) return;

    try {
      setIsGeneratingPdf(true);
      
      // 1. 순수 A4 종이 영역만 초고해상도로 캡처 (화면용 회색 테두리 및 그림자 제거, 폰트 CORS 에러 방지)
      const imgData = await toPng(a4SheetRef.current, {
        pixelRatio: 3, // 인쇄소급 300DPI 초고해상도
        backgroundColor: '#FFFFFF',
        skipFonts: true, // 외부 구글폰트/CDN의 CORS SecurityError 및 폰트 메트릭 왜곡 원천 차단
        style: {
          border: 'none',
          boxShadow: 'none',
          borderRadius: '0px'
        },
        filter: (node) => !node.classList?.contains('no-print')
      });

      // 2. 캡처된 이미지의 실제 픽셀 가로/세로 비율 측정
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => { 
        img.onload = resolve;
        img.onerror = resolve;
      });

      // 3. A4 규격(210 x 297 mm) PDF 생성
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      const imgAspectRatio = img.width / img.height;
      const pdfAspectRatio = pdfWidth / pdfHeight; // 210 / 297 ≈ 0.70707

      let renderWidth = pdfWidth;
      let renderHeight = pdfHeight;
      let posX = 0;
      let posY = 0;

      // 폰트가 세로/가로로 1mm도 늘어나지 않도록 종횡비 철저 보존 (Maintain Aspect Ratio)
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

      // 왜곡 없는 1:1 완벽 정비율로 A4 용지에 배치
      pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight);
      pdf.save(`[ArtFlow]전시캡션_A4출력용_${new Date().toISOString().split('T')[0]}.pdf`);
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
        <h2>전시 캡션 네임택 출력기</h2>
        <p>
          A4 한 페이지에 <strong>2열 4행 표 형식</strong>으로 정렬되어, <strong>옅은 회색 테두리 선</strong>을 따라 자와 칼을 대고 일직선으로 오려내면 정갈한 명패가 완성됩니다. 
          상단의 <strong>[📄 A4 인쇄용 PDF 다운로드]</strong> 버튼을 눌러 출력하세요.
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
        {/* 좌측: 새 캡션 추가 폼 */}
        <div className="panel-card no-print">
          <div className="panel-card-title">
            <span>새 작품 캡션 등록</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>테두리 규격 자동 생성</span>
          </div>

          <form onSubmit={handleAdd}>
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

            <div className="form-group">
              <label className="form-label">재료 및 기법 (국문)</label>
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
              <label className="form-label">재료 및 기법 (영문 병기)</label>
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

            <button type="submit" className="btn-primary">
              <Plus size={16} /> 캡션 목록에 추가하기
            </button>
          </form>
        </div>

        {/* 우측: 선명한 테두리 박스가 있는 A4 실물 크기 프리뷰 */}
        <div className="panel-card printable-caption-container" style={{ padding: '1rem' }}>
          <div className="panel-card-title no-print" style={{ marginBottom: '0.75rem' }}>
            <span>A4 인쇄 미리보기 (2열 4행 표 형식 / {captions.length}점 등록됨)</span>
            <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              ✂️ 옅은 회색 테두리 선을 따라 반듯하게 오려 사용하세요
            </span>
          </div>

          {captions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>
              등록된 작품 캡션이 없습니다.<br />
              좌측에서 작품 정보를 입력해 캡션을 추가해 보세요.
            </div>
          ) : (
            <div className="a4-sheet-container">
              <div className="a4-sheet-preview" ref={a4SheetRef}>
                <div className="caption-print-grid">
                  {/* 1. 등록된 캡션 카드 목록 (옅은 회색 직각 테두리 박스) */}
                  {captions.map((item) => (
                    <div 
                      key={item.id} 
                      className={`caption-card-item ${styleMode}`}
                    >
                      {/* 카드 삭제용 미니멀 X 버튼 (인쇄/PDF 시 자동 제외) */}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="caption-card-delete-btn no-print"
                        title="이 캡션 삭제"
                      >
                        <X size={13} />
                      </button>

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
                  ))}

                  {/* 2. 표 형식을 완성하는 A4 빈 슬롯 (8칸 정규격 표 유지) */}
                  {Array.from({ length: Math.max(0, 8 - captions.length) }).map((_, idx) => (
                    <div 
                      key={`empty-slot-${idx}`} 
                      className="caption-card-item empty-slot"
                    >
                      <div className="no-print" style={{ textAlign: 'center', opacity: 0.5 }}>
                        <span style={{ fontSize: '0.75rem', letterSpacing: '-0.3px' }}>
                          대기 칸 {captions.length + idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
