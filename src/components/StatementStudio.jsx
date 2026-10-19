import React, { useState, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  Camera, 
  BookOpen, 
  Share2, 
  Edit3, 
  Eye, 
  RotateCcw, 
  Image as ImageIcon,
  Archive,
  Upload,
  ArrowRight,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveSingleArtwork } from '../utils/archiveStorage';
import { compressImage } from '../utils/imageCompressor';

export default function StatementStudio({ onBack, user = null, onNavigateToArchive }) {
  const [activeTab, setActiveTab] = useState('statement'); // 'statement' | 'insta' | 'blog'
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // 직접 수정 모드 토글

  // 사진 상태
  const [artworkImage, setArtworkImage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const fileInputRef = useRef(null);

  // 작품 기본 입력 상태
  const [artwork, setArtwork] = useState({
    title: '',
    artist: user?.name || '작가',
    year: new Date().getFullYear().toString(),
    medium: '',
    size: '',
    price: '',
    isNfs: false,
    keywords: '',
    inspiration: ''
  });

  // AI 생성 결과물 상태
  const [results, setResults] = useState({
    statement: '',
    insta: '',
    blog: ''
  });

  // 최초 생성된 AI 원본 초안 보관용
  const [originalResults, setOriginalResults] = useState({
    statement: '',
    insta: '',
    blog: ''
  });

  // AI 글 3종 텍스트 생성 헬퍼
  const createGeneratedTexts = () => {
    const { title, year, medium, size, keywords, inspiration } = artwork;
    const authorName = artwork.artist || user?.name || '작가';
    const displayTitle = title.trim() || '무제 (Untitled)';
    const displayMedium = medium.trim() || '캔버스에 혼합재료 (Mixed media on canvas)';
    const displaySize = size.trim() || '가변 크기';
    const displayKeywords = keywords.trim() || '빛과 어둠의 경계, 시간의 퇴적, 고요한 울림';
    const displayInspiration = inspiration.trim() || '작업실 창가에 드리운 빛의 경계와 깊은 새벽의 공기에서 시작되었습니다.';

    // 1. 미술평론풍 작가노트
    const statementText = `[작가노트 (Artist Statement)]
《${displayTitle}》 (${year})
${displayMedium}, ${displaySize}

우리의 시선이 닿지 않는 어둠의 끝자락에는 언제나 형언할 수 없는 고요한 찰나가 존재한다.
이번 작업 《${displayTitle}》은 ${displayInspiration}

캔버스 위에 중첩된 안료의 층위는 단순히 색채의 배열을 넘어, 시간의 퇴적과 내면의 심상을 시각화하는 과정이다. 화면을 채우는 ‘${displayKeywords}’의 감각은 구체적인 형태를 벗어나 화면 전체에 은은한 긴장감과 울림을 형성한다. 붓질의 호흡과 물성의 번짐이 교차하는 지점에서, 관람자는 대상의 재현이 아닌 비가시적인 감정의 심연을 마주하게 된다.

경계란 단절이 아니라 새로운 상태로의 이행이자 연결이다. 어둠이 흩어지고 빛이 스며드는 그 찰나의 순간, 캔버스에 응축된 시간들이 누군가의 내면에 가만히 말을 건네기를 바란다.`;

    // 2. 인스타그램 감성 캡션
    const hashtags = `#현대미술 #작업실 #회화 #${authorName.replace(/\s+/g, '')}작가 #아트컬렉터 #아티스트 #캔버스 #미술관 #전시회 #ContemporaryArt #OilPainting #StudioLife #ArtCollector #KoreanArt #ArtistStudio #Canvas #Artwork`;

    const instaText = `어둠이 완전히 걷히기 전,
작업실 창가에 머물던 푸른 공기와 미세한 빛.

《${displayTitle}》
${year}
${displayMedium}
${displaySize}

“${displayKeywords}”
${displayInspiration}

물감이 마르고 또 덧칠해지는 시간 동안
가만히 내 안의 소리에 귀를 기울였습니다.
여러분의 하루는 어떤 빛을 품고 있나요? 🕊️

.
.
.
${hashtags}`;

    // 3. 블로그/뉴스레터 작업실 비하인드
    const blogText = `[작업실 비하인드 스토리]
《${displayTitle}》이 태어나기까지의 기록

안녕하세요, 작업실에서 붓을 잡는 작가 ${authorName}입니다.

이번에 새롭게 완성한 작업 《${displayTitle}》에 대해 조금 더 편안하고 솔직한 이야기를 들려드리려 합니다.

1. 어디서 시작된 작업인가요?
${displayInspiration} 그 낯선 빛깔이 너무 강렬해서 며칠 동안 머릿속을 떠나지 않았고, 결국 이 감각을 화폭에 옮기지 않고는 견딜 수 없었습니다.

2. 물성과 붓질의 고민
이번 작업에서는 ${displayMedium}을 주재료로 사용했습니다. ${displayKeywords}의 느낌을 살리기 위해 안료를 묽게 여러 번 겹쳐 올리는 기법을 택했는데요, 밑칠이 비쳐 나오며 깊은 공간감을 낼 때까지 며칠 동안 말리고 올리는 인내의 시간을 보냈습니다.

3. 작업을 마치며
그림은 제 손을 떠나는 순간부터 관람객 여러분의 것이 된다고 믿습니다. 
이 작품 앞에 섰을 때, 하루의 분주함을 잠시 내려놓고 깊은 고요와 위로를 느끼실 수 있기를 진심으로 바랍니다.`;

    return {
      statement: statementText,
      insta: instaText,
      blog: blogText
    };
  };

  // 1) 글 먼저 확인 (미리보기만 생성)
  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    const generated = createGeneratedTexts();
    setResults(generated);
    setOriginalResults(generated);
    triggerConfetti();
  };

  // 2) [원클릭 메인 핵심] AI 글 생성과 동시에 수장고에 즉시 영구 등록!
  const handleGenerateAndSaveToArchive = (e) => {
    if (e) e.preventDefault();
    if (!artwork.title.trim()) {
      alert('작품 제목을 먼저 입력해 주세요.');
      return;
    }

    setIsSaving(true);

    // 이미 생성해둔 글이 있다면(수정된 내용 포함) 그것을 쓰고, 아직 없으면 즉시 생성
    let finalTexts = results;
    if (!results.statement) {
      finalTexts = createGeneratedTexts();
      setResults(finalTexts);
      setOriginalResults(finalTexts);
    }

    const authorName = artwork.artist || user?.name || '작가';
    const itemToSave = {
      title: artwork.title.trim(),
      artist: authorName,
      year: artwork.year || new Date().getFullYear().toString(),
      medium: artwork.medium || '',
      size: artwork.size || '',
      price: artwork.isNfs ? 'NFS (비매품)' : (artwork.price ? artwork.price : '가격 협의'),
      isNfs: Boolean(artwork.isNfs),
      imageUrl: artworkImage,
      statement: finalTexts.statement || '',
      instaCaption: finalTexts.insta || '',
      blogStory: finalTexts.blog || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedList = saveSingleArtwork(itemToSave, user);
    triggerConfetti();
    setSavedNotice(true);

    setTimeout(() => {
      setIsSaving(false);
      if (onNavigateToArchive) {
        const savedItem = updatedList.find(a => a.title === itemToSave.title) || updatedList[0];
        onNavigateToArchive(savedItem ? savedItem.id : null);
      } else if (onBack) {
        onBack();
      }
    }, 850);
  };

  // 3) AI 글 없이 기본 정보만 수장고에 등록
  const handleSaveToArchive = () => {
    if (!artwork.title.trim()) {
      alert('작품 제목을 먼저 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    const authorName = artwork.artist || user?.name || '작가';

    const itemToSave = {
      title: artwork.title.trim(),
      artist: authorName,
      year: artwork.year || new Date().getFullYear().toString(),
      medium: artwork.medium || '',
      size: artwork.size || '',
      price: artwork.isNfs ? 'NFS (비매품)' : (artwork.price ? artwork.price : '가격 협의'),
      isNfs: Boolean(artwork.isNfs),
      imageUrl: artworkImage,
      statement: results.statement || '',
      instaCaption: results.insta || '',
      blogStory: results.blog || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedList = saveSingleArtwork(itemToSave, user);
    triggerConfetti();
    setSavedNotice(true);

    setTimeout(() => {
      setIsSaving(false);
      if (onNavigateToArchive) {
        const savedItem = updatedList.find(a => a.title === itemToSave.title) || updatedList[0];
        onNavigateToArchive(savedItem ? savedItem.id : null);
      } else if (onBack) {
        onBack();
      }
    }, 850);
  };

  // 이미지 파일 선택 시 자동 압축
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 900, 0.75);
      setArtworkImage(compressed);
    } catch (err) {
      alert('이미지 압축 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  // 실시간 텍스트 수정 핸들러
  const handleTextChange = (newVal) => {
    setResults(prev => ({
      ...prev,
      [activeTab]: newVal
    }));
  };

  // 원본 초안으로 되돌리기
  const handleResetToOriginal = () => {
    if (!originalResults[activeTab]) return;
    if (window.confirm('AI가 생성했던 최초 초안으로 되돌리시겠습니까? (수정한 내용은 지워집니다)')) {
      setResults(prev => ({
        ...prev,
        [activeTab]: originalResults[activeTab]
      }));
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0F172A', '#38BDF8', '#10B981']
      });
    } catch (e) {}
  };

  const currentText = results[activeTab] || '';
  const isModified = originalResults[activeTab] && results[activeTab] !== originalResults[activeTab];

  return (
    <div className="workspace-wrapper">
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 메인 대시보드로
        </button>
        {onNavigateToArchive && (
          <button 
            onClick={() => onNavigateToArchive(null)} 
            className="btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', gap: '5px' }}
          >
            <Archive size={14} /> 내 수장고 열람
          </button>
        )}
      </div>

      <div className="workspace-title-area" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '1.25rem' }}>✍️</span>
          <h2 style={{ margin: 0 }}>작가노트 & SNS 스튜디오</h2>
        </div>
        <p>
          작품 사진과 키워드 3개만 넣으세요. AI가 미술평론 작가노트, 전시 벽면 캡션, 인스타그램 피드 글을 동시에 생성하여 {user?.name || '작가'}님의 프라이빗 수장고에 완벽한 도록으로 등록해 드립니다.
        </p>
      </div>

      <div className="workspace-grid">
        {/* 좌측: 작품 정보 & 사진 & 키워드 입력 패널 */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div className="panel-card-title">
            <span>1. 작품 기본 스펙 & 영감 키워드</span>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>필수 정보 입력</span>
          </div>

          {/* 작품 사진 첨부 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>작품 사진 (선택 - 자동 다이어트 압축)</label>
              {artworkImage && (
                <button 
                  type="button" 
                  onClick={() => setArtworkImage('')} 
                  style={{ fontSize: '0.75rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  사진 삭제
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '10px',
                  border: '1.5px dashed #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#F8FAFC',
                  overflow: 'hidden',
                  flexShrink: 0,
                  transition: 'border-color 0.15s ease'
                }}
              >
                {artworkImage ? (
                  <img src={artworkImage} alt="선택된 작품" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Upload size={18} color="#94A3B8" />
                    <span style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                      {isCompressing ? '압축 중' : '사진 첨부'}
                    </span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
                스마트폰 원본 사진을 그대로 올려도, 브라우저에서 <strong>가벼운 웹 최적화 이미지(300KB)</strong>로 자동 압축하여 기기에 안전하게 보관합니다.
              </div>
            </div>
          </div>

          {/* 제목 & 작가명 */}
          <div className="form-row" style={{ gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">작품 제목 <span style={{ color: '#EF4444' }}>*</span></label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 봄의 품격 (Spring Grace)"
                value={artwork.title}
                onChange={(e) => setArtwork({...artwork, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">작가명</label>
              <input 
                type="text" 
                className="form-input" 
                value={artwork.artist}
                onChange={(e) => setArtwork({...artwork, artist: e.target.value})}
              />
            </div>
          </div>

          {/* 제작 연도 & 크기 */}
          <div className="form-row" style={{ gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">제작 연도</label>
              <input 
                type="text" 
                className="form-input" 
                value={artwork.year}
                onChange={(e) => setArtwork({...artwork, year: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">크기 / 호수</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 53.0 × 45.5 cm (10F)"
                value={artwork.size}
                onChange={(e) => setArtwork({...artwork, size: e.target.value})}
              />
            </div>
          </div>

          {/* 재료 및 기법 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">재료 및 기법 (Medium)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 캔버스에 유채, 혼합재료 (Oil and mixed media on canvas)"
              value={artwork.medium}
              onChange={(e) => setArtwork({...artwork, medium: e.target.value})}
            />
          </div>

          {/* 작품 가격 & 비매품 */}
          <div className="form-row" style={{ gap: '12px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">작품 가격 / 비매품</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder={artwork.isNfs ? 'NFS (비매품)' : '예: 2,500,000원'}
                value={artwork.isNfs ? '' : artwork.price}
                onChange={(e) => setArtwork({...artwork, price: e.target.value})}
                disabled={artwork.isNfs}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0, paddingBottom: '0.65rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={artwork.isNfs}
                  onChange={(e) => setArtwork({...artwork, isNfs: e.target.checked})}
                />
                <span>NFS (소장품 / 비매품)</span>
              </label>
            </div>
          </div>

          {/* 핵심 감정 / 주제 키워드 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">핵심 감정 / 조형 키워드 3개 (쉼표 구분)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 봄날의 생동감, 화사한 모란꽃, 고요한 번영"
              value={artwork.keywords}
              onChange={(e) => setArtwork({...artwork, keywords: e.target.value})}
            />
          </div>

          {/* 창작 배경 / 영감 메모 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>창작 배경 / 영감 메모 (1~2줄)</span>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 400 }}>선택사항 (비워두셔도 AI 자동 생성)</span>
            </label>
            <textarea 
              className="form-textarea" 
              style={{ minHeight: '80px', fontSize: '0.86rem' }}
              placeholder="예: 작업실 창가에 드리운 빛의 경계와 깊은 새벽의 공기에서 시작되었습니다."
              value={artwork.inspiration}
              onChange={(e) => setArtwork({...artwork, inspiration: e.target.value})}
            />
          </div>

          {/* 좌측 액션 버튼: AI 작가노트 생성 & AI 없이 바로 등록 (1:1 나란히 배치) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '1rem' }}>
            <button 
              type="button"
              className="btn-action-generate" 
              onClick={handleGenerate} 
              title="우측 화면에 미학 평론 작가노트와 SNS 글을 생성합니다"
            >
              <Sparkles size={16} color="#38BDF8" /> AI 작가노트 생성
            </button>
            <button 
              type="button"
              className="btn-action-save-direct" 
              onClick={handleSaveToArchive} 
              disabled={isSaving}
              title="AI 글 생성 없이 입력한 사진과 작품 정보만 수장고에 안전하게 등록합니다"
            >
              <Archive size={16} color="#15803D" /> AI 없이 바로 등록
            </button>
          </div>
        </div>

        {/* 우측: AI 생성 글 & 수장고 최종 등록 패널 */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 상단 탭 내비게이션 */}
          <div className="tab-nav" style={{ marginBottom: '1rem' }}>
            <button 
              className={`tab-btn ${activeTab === 'statement' ? 'active' : ''}`}
              onClick={() => setActiveTab('statement')}
            >
              <BookOpen size={15} style={{ display: 'inline', marginRight: '5px' }} />
              미술평론풍 작가노트
            </button>
            <button 
              className={`tab-btn ${activeTab === 'insta' ? 'active' : ''}`}
              onClick={() => setActiveTab('insta')}
            >
              <Camera size={15} style={{ display: 'inline', marginRight: '5px' }} />
              인스타 감성 캡션
            </button>
            <button 
              className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={() => setActiveTab('blog')}
            >
              <Share2 size={15} style={{ display: 'inline', marginRight: '5px' }} />
              블로그 제작 후기
            </button>
          </div>

          {/* 타이틀 및 액션 컨트롤 바 */}
          <div className="panel-card-title" style={{ flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
            <div>
              <span>
                {activeTab === 'statement' && '미술평론풍 정통 작가노트'}
                {activeTab === 'insta' && '인스타그램 감성 캡션 & 해시태그'}
                {activeTab === 'blog' && '블로그 / 뉴스레터 작업실 일기'}
              </span>
              {currentText && (
                <span className="char-counter-badge" style={{ marginLeft: '8px' }}>
                  ({currentText.length.toLocaleString()}자)
                </span>
              )}
            </div>

            {currentText && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* 수정한 경우 원본 복원 버튼 */}
                {isModified && (
                  <button 
                    onClick={handleResetToOriginal}
                    className="btn-outline"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', color: '#6B7280' }}
                    title="초안으로 복원"
                  >
                    <RotateCcw size={13} /> 초안 복원
                  </button>
                )}

                {/* 보기 모드 vs 직접 수정 모드 토글 */}
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="btn-outline"
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.7rem',
                    background: isEditMode ? '#0F172A' : '#FFFFFF',
                    color: isEditMode ? '#FFFFFF' : '#111827',
                    borderColor: '#0F172A',
                    fontWeight: 600
                  }}
                >
                  {isEditMode ? (
                    <>
                      <Eye size={13} /> 보기 모드로 전환
                    </>
                  ) : (
                    <>
                      <Edit3 size={13} /> ✍️ 직접 수정하기
                    </>
                  )}
                </button>

                {/* 전체 복사 버튼 */}
                <button 
                  className={`btn-subtle-copy ${copied ? 'copied' : ''}`}
                  onClick={() => handleCopy(currentText)}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '복사 완료!' : '전체 복사'}
                </button>
              </div>
            )}
          </div>

          {/* 텍스트 뷰 (보기 모드 / 수정 모드) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {currentText ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {isEditMode ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#059669',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>✍️ <strong>수정 모드:</strong> 원하시는 문구를 자유롭게 보완하세요. 수정된 글이 수장고에 함께 등록됩니다.</span>
                    </div>
                    <textarea 
                      className={`output-editor ${activeTab === 'statement' ? 'serif' : ''}`}
                      style={{ flex: 1, minHeight: '340px' }}
                      value={currentText}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="내용을 자유롭게 수정해 보세요..."
                    />
                  </div>
                ) : (
                  <div 
                    className={`output-box ${activeTab === 'statement' ? 'serif' : ''}`}
                    onDoubleClick={() => setIsEditMode(true)}
                    title="더블클릭하면 바로 직접 수정할 수 있습니다"
                    style={{ cursor: 'text', flex: 1, minHeight: '340px', lineHeight: 1.7 }}
                  >
                    {currentText}
                  </div>
                )}

                {/* 하단 친절한 힌트 바 */}
                <div style={{ 
                  marginTop: '0.75rem', 
                  fontSize: '0.78rem', 
                  color: '#9CA3AF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    {isEditMode 
                      ? '✨ 수정이 끝나면 상단의 [보기 모드로 전환] 또는 하단의 [내 수장고에 등록]을 누르세요.' 
                      : '💡 더블클릭하거나 [✍️ 직접 수정하기]를 눌러 글을 자유롭게 보완할 수 있습니다.'}
                  </span>
                  {isModified && (
                    <span style={{ color: '#D97706', fontWeight: 600 }}>● 수정된 내용 반영됨</span>
                  )}
                </div>

                {/* [핵심 통합 버튼] 내 수장고에 영구 보관하기 */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                  <button 
                    onClick={handleSaveToArchive}
                    disabled={isSaving}
                    className="btn-action-main"
                    style={{
                      padding: '0.85rem 1.5rem',
                      fontSize: '0.96rem'
                    }}
                  >
                    <Archive size={18} />
                    <span>{isSaving ? '수장고에 저장 중...' : '📁 수장고에 저장하기 →'}</span>
                  </button>
                  {savedNotice && (
                    <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#059669', fontWeight: 600, marginTop: '8px', margin: '8px 0 0 0' }}>
                      ✓ 《{artwork.title || '작품'}》이(가) 수장고에 안전하게 등록되었습니다! 도록 화면으로 이동합니다...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="output-box" style={{ color: '#9CA3AF', textAlign: 'center', padding: '4.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={36} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.05rem', color: '#475569', margin: '0 0 8px 0', fontWeight: 600 }}>
                  아직 생성된 작가노트가 없습니다
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '380px', lineHeight: 1.6, margin: 0 }}>
                  좌측에 작품 제목과 키워드 3개를 입력한 후<br />
                  <strong>[✨ AI 작가노트 생성]</strong>을 누르시면 평론풍 작가노트, 인스타 캡션, 블로그 글이 한 번에 완성됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
