import React, { useState, useRef } from 'react';
import { Tag, Plus, Trash2, Printer, Download, Copy, Check, Sparkles, Scissors, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

export default function CaptionStudio({ onBack }) {
  const [styleMode, setStyleMode] = useState('classic'); // 'classic' | 'modern' | 'commercial'
  const [copiedId, setCopiedId] = useState(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const gridRef = useRef(null);

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
    if (window.confirm('이 작품 캡션을 삭제하시겠습니까?')) {
      saveCaptions(captions.filter(c => c.id !== id));
    }
  };

  // 개별 캡션 카드를 고해상도 PNG(300 DPI급)로 직접 다운로드
  const handleDownloadSingle = async (item) => {
    const cardEl = document.getElementById(`caption-card-${item.id}`);
    if (!cardEl) return;

    try {
      setDownloadingId(item.id);
      // 화면용 버튼들을 임시로 가리고 고해상도 캡처
      const dataUrl = await toPng(cardEl, {
        pixelRatio: 3, // 인쇄용 3배율 초고화질
        backgroundColor: '#FFFFFF',
        filter: (node) => !node.classList?.contains('no-print')
      });

      const link = document.createElement('a');
      link.download = `[캡션]_${item.titleKo}_${item.artistKo}.png`;
      link.href = dataUrl;
      link.click();
      triggerConfetti();
    } catch (err) {
      console.error('캡션 이미지 다운로드 실패:', err);
      alert('이미지 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setDownloadingId(null);
    }
  };

  // 전체 A4 인쇄 시트 일괄 다운로드
  const handleDownloadAllSheet = async () => {
    if (!gridRef.current) return;

    try {
      setIsDownloadingAll(true);
      const dataUrl = await toPng(gridRef.current, {
        pixelRatio: 2.5,
        backgroundColor: '#FFFFFF',
        filter: (node) => !node.classList?.contains('no-print')
      });

      const link = document.createElement('a');
      link.download = `[ArtFlow]전시캡션_전체출력시트_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      triggerConfetti();
    } catch (err) {
      console.error('전체 시트 다운로드 실패:', err);
      alert('전체 시트 생성 중 문제가 발생했습니다.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleCopyText = (item) => {
    const text = `${item.artistKo} (${item.artistEn})\n《${item.titleKo}》 (${item.titleEn}), ${item.year}\n${item.mediumKo} (${item.mediumEn})\n${item.size}\n${item.price}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0F172A', '#D97706', '#059669']
      });
    } catch (e) {}
  };

  return (
    <div className="workspace-wrapper">
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 전체 도구 목록으로
        </button>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleDownloadAllSheet} 
            className="btn-outline" 
            disabled={isDownloadingAll || captions.length === 0}
            style={{ fontWeight: 600 }}
          >
            <Download size={16} /> 
            {isDownloadingAll ? '시트 생성 중...' : '📥 전체 A4 시트 이미지 다운로드'}
          </button>
          <button 
            onClick={() => window.print()} 
            className="btn-primary" 
            style={{ width: 'auto' }}
          >
            <Printer size={16} /> 🖨️ A4 바로 인쇄
          </button>
        </div>
      </div>

      <div className="workspace-title-area" style={{ marginBottom: '1.5rem' }}>
        <h2>전시 캡션 네임택 출력기</h2>
        <p>복사할 필요 없이 <strong>카드 이미지(PNG)로 바로 다운로드</strong>받아 프린트하고 칼선대로 잘라서 전시장에 부착하세요.</p>
      </div>

      {/* 스타일 선택 바 */}
      <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab-btn ${styleMode === 'classic' ? 'active' : ''}`}
          onClick={() => setStyleMode('classic')}
        >
          🏛️ 국공립 미술관 클래식형 (명조 세리프)
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
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>A6 절취 규격</span>
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

        {/* 우측: 실시간 캡션 미리보기 & 다운로드 영역 */}
        <div className="panel-card printable-caption-container">
          <div className="panel-card-title no-print">
            <span>
              출력용 캡션 명패 ({captions.length}점)
            </span>
            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
              ✂️ 테두리 점선 절취선을 따라 오려 사용하세요
            </span>
          </div>

          {captions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: '#9CA3AF' }}>
              등록된 작품 캡션이 없습니다.<br />
              좌측에서 작품 정보를 입력하여 캡션을 추가해 보세요.
            </div>
          ) : (
            <div className="caption-print-grid" ref={gridRef}>
              {captions.map((item) => (
                <div 
                  key={item.id} 
                  id={`caption-card-${item.id}`}
                  className={`caption-card-item ${styleMode}`}
                >
                  {/* 자르는 선 가이드 헤더 (인쇄 및 다운로드 이미지에 포함) */}
                  <div className="cut-line-indicator">
                    <Scissors size={12} strokeWidth={2} />
                    <span>자르는 선 (Cut Line)</span>
                  </div>

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

                  <div className="caption-meta-box">
                    <div className="caption-medium">
                      {item.mediumKo}
                      {item.mediumEn && <span className="caption-sub"> ({item.mediumEn})</span>}
                    </div>
                    <div className="caption-size">{item.size}</div>
                  </div>

                  {styleMode === 'commercial' && (
                    <div className="caption-price-tag">
                      <span>{item.price}</span>
                      {!item.isNfs && <span className="caption-red-dot" title="판매 가능" />}
                    </div>
                  )}

                  {/* 화면용 액션 버튼: 개별 다운로드 및 삭제 (인쇄 및 캡처 시 숨김) */}
                  <div className="caption-card-actions no-print">
                    <button 
                      onClick={() => handleDownloadSingle(item)}
                      className="btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', fontWeight: 600, color: '#0F172A', borderColor: '#0F172A' }}
                      title="고해상도 PNG 이미지로 다운로드"
                      disabled={downloadingId === item.id}
                    >
                      <Download size={13} />
                      {downloadingId === item.id ? '저장 중...' : '📥 캡션 다운로드'}
                    </button>
                    <button 
                      onClick={() => handleCopyText(item)}
                      className={`btn-subtle-copy ${copiedId === item.id ? 'copied' : ''}`}
                      title="텍스트 복사"
                    >
                      {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === item.id ? '복사됨' : '텍스트'}
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ color: '#9CA3AF', padding: '4px' }}
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
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
