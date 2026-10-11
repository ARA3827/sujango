import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  Camera, 
  BookOpen, 
  Share2, 
  Edit3, 
  Eye, 
  RotateCcw 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StatementStudio({ onBack }) {
  const [activeTab, setActiveTab] = useState('statement'); // 'statement' | 'insta' | 'blog'
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 토글 (선택사항)

  // 입력 상태
  const [artwork, setArtwork] = useState({
    title: '새벽의 경계 (The Boundary of Dawn)',
    year: '2026',
    medium: 'Oil and mixed media on linen',
    size: '116.8 × 91.0 cm (50호)',
    keywords: '침묵, 찰나의 빛, 고요한 파동',
    inspiration: '비 내린 다음 날 이른 새벽, 작업실 창가에 드리운 푸른 그림자와 어둠을 가르는 미세한 빛의 경계에서 시작되었습니다.'
  });

  // 현재 편집 가능한 결과물 상태
  const [results, setResults] = useState({
    statement: '',
    insta: '',
    blog: ''
  });

  // 최초 생성된 AI 초안 보관용 (초안 복원 기능)
  const [originalResults, setOriginalResults] = useState({
    statement: '',
    insta: '',
    blog: ''
  });

  const handleGenerate = () => {
    const { title, year, medium, size, keywords, inspiration } = artwork;

    // 1. 미술평론풍 작가노트
    const statementText = `[작가노트 (Artist Statement)]
《${title}》 (${year})
${medium}, ${size}

우리의 시선이 닿지 않는 어둠의 끝자락에는 언제나 형언할 수 없는 고요한 찰나가 존재한다.
이번 작업 《${title}》은 ${inspiration}

캔버스 위에 중첩된 안료의 층위는 단순히 색채의 배열을 넘어, 시간의 퇴적과 내면의 심상을 시각화하는 과정이다. 화면을 채우는 ‘${keywords}’의 감각은 구체적인 형태를 벗어나 화면 전체에 은은한 긴장감과 울림을 형성한다. 붓질의 호흡과 물성의 번짐이 교차하는 지점에서, 관람자는 대상의 재현이 아닌 비가시적인 감정의 심연을 마주하게 된다.

경계란 단절이 아니라 새로운 상태로의 이행이자 연결이다. 어둠이 흩어지고 빛이 스며드는 그 찰나의 순간, 캔버스에 응축된 시간들이 누군가의 내면에 가만히 말을 건네기를 바란다.`;

    // 2. 인스타그램 감성 캡션
    const hashtags = '#현대미술 #작업실 #오일페인팅 #화실 #유화 #아트컬렉터 #아티스트 #캔버스 #미술관 #전시회 #회화 #작업일기 #ContemporaryArt #OilPainting #StudioLife #ArtCollector #KoreanArt #ArtistStudio #Canvas #Artwork';

    const instaText = `어둠이 완전히 걷히기 전,
작업실 창가에 머물던 푸른 공기와 미세한 빛.

《${title}》
${year}
${medium}
${size}

“${keywords}”
${inspiration}

물감이 마르고 또 덧칠해지는 시간 동안
가만히 내 안의 소리에 귀를 기울였습니다.
여러분의 새벽은 어떤 색을 품고 있나요? 🕊️

.
.
.
${hashtags}`;

    // 3. 블로그/뉴스레터 작업실 비하인드
    const blogText = `[작업실 비하인드 스토리]
《${title}》이 태어나기까지의 기록

안녕하세요, 작업실에서 붓을 잡는 작가 김아라입니다.

이번에 새롭게 완성한 작품 《${title}》에 대해 조금 더 편안하고 솔직한 이야기를 들려드리려 합니다.

1. 어디서 시작된 작업인가요?
어느 날 비가 내린 다음 날 새벽이었습니다. ${inspiration} 그 낯선 빛깔이 너무 강렬해서 며칠 동안 머릿속을 떠나지 않았고, 결국 이 감각을 화폭에 옮기지 않고는 견딜 수 없었습니다.

2. 물성과 붓질의 고민
이번 작업에서는 ${medium}을 주재료로 사용했습니다. ${keywords}의 느낌을 살리기 위해 안료를 묽게 여러 번 겹쳐 올리는 글레이징 기법을 택했는데요, 밑칠이 비쳐 나오며 깊은 공간감을 낼 때까지 며칠 동안 말리고 올리는 인내의 시간을 보냈습니다.

3. 작업을 마치며
그림은 제 손을 떠나는 순간부터 관람객 여러분의 것이 된다고 믿습니다. 
이 작품 앞에 섰을 때, 하루의 분주함을 잠시 내려놓고 깊은 고요와 위로를 느끼실 수 있기를 진심으로 바랍니다.`;

    const generated = {
      statement: statementText,
      insta: instaText,
      blog: blogText
    };

    setResults(generated);
    setOriginalResults(generated);
    triggerConfetti();
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
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0F172A', '#64748B', '#059669']
      });
    } catch (e) {
      // ignore
    }
  };

  // 현재 텍스트 및 수정 여부 판별
  const currentText = results[activeTab] || '';
  const isModified = originalResults[activeTab] && results[activeTab] !== originalResults[activeTab];

  return (
    <div className="workspace-wrapper">
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 전체 도구 목록으로
        </button>
      </div>

      <div className="workspace-title-area" style={{ marginBottom: '1.5rem' }}>
        <h2>작가노트 & SNS OSMU 스튜디오</h2>
        <p>작품 키워드 3개만 넣으세요. 도록용 미술평론 작가노트, 인스타그램 감성 피드, 블로그 제작 후기로 즉시 변환하고 자유롭게 다듬을 수 있습니다.</p>
      </div>

      <div className="workspace-grid">
        {/* 입력 패널 */}
        <div className="panel-card">
          <div className="panel-card-title">
            <span>작품 정보 & 영감 키워드</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>기본 정보 입력</span>
          </div>

          <div className="form-group">
            <label className="form-label">작품 제목 (국문/영문)</label>
            <input 
              type="text" 
              className="form-input" 
              value={artwork.title}
              onChange={(e) => setArtwork({...artwork, title: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">제작 연도</label>
              <input 
                type="text" 
                className="form-input" 
                value={artwork.year}
                onChange={(e) => setArtwork({...artwork, year: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">크기 / 호수</label>
              <input 
                type="text" 
                className="form-input" 
                value={artwork.size}
                onChange={(e) => setArtwork({...artwork, size: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">재료 및 기법 (Medium)</label>
            <input 
              type="text" 
              className="form-input" 
              value={artwork.medium}
              onChange={(e) => setArtwork({...artwork, medium: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">핵심 감정 / 주제 키워드 (쉼표 구분)</label>
            <input 
              type="text" 
              className="form-input" 
              value={artwork.keywords}
              onChange={(e) => setArtwork({...artwork, keywords: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">창작 배경 / 영감 메모 (1~2줄)</label>
            <textarea 
              className="form-textarea" 
              value={artwork.inspiration}
              onChange={(e) => setArtwork({...artwork, inspiration: e.target.value})}
            />
          </div>

          <button className="btn-primary" onClick={handleGenerate}>
            <Sparkles size={16} /> 3대 콘텐츠 동시 생성하기
          </button>
        </div>

        {/* 출력 및 수정 패널 */}
        <div className="panel-card">
          {/* 상단 탭 내비게이션 */}
          <div className="tab-nav" style={{ marginBottom: '1rem' }}>
            <button 
              className={`tab-btn ${activeTab === 'statement' ? 'active' : ''}`}
              onClick={() => setActiveTab('statement')}
            >
              <BookOpen size={15} style={{ display: 'inline', marginRight: '5px' }} />
              도록용 작가노트
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
          <div className="panel-card-title" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span>
                {activeTab === 'statement' && '미술평론풍 작가노트'}
                {activeTab === 'insta' && '인스타그램 캡션'}
                {activeTab === 'blog' && '블로그 비하인드 스토리'}
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

                {/* 보기 모드 vs 직접 수정 모드 토글 (선택사항) */}
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
                      <Edit3 size={13} /> ✍️ 직접 수정하기 (선택)
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
          {currentText ? (
            <div>
              {isEditMode ? (
                <div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#059669',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>✍️ <strong>수정 모드 활성화:</strong> 원하시는 문구나 어휘를 자유롭게 고치세요. 고친 내용이 그대로 복사됩니다.</span>
                  </div>
                  <textarea 
                    className={`output-editor ${activeTab === 'statement' ? 'serif' : ''}`}
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
                  style={{ cursor: 'text' }}
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
                    ? '✨ 수정이 끝나면 상단의 [보기 모드로 전환] 또는 [전체 복사]를 누르세요.' 
                    : '💡 내용에 나만의 어휘를 보태고 싶다면 상단의 [✍️ 직접 수정하기]를 누르세요.'}
                </span>
                {isModified && (
                  <span style={{ color: '#D97706', fontWeight: 600 }}>● 수정된 내용 적용됨</span>
                )}
              </div>
            </div>
          ) : (
            <div className="output-box" style={{ color: '#9CA3AF', textAlign: 'center', padding: '3.5rem 1rem' }}>
              좌측의 작품 정보와 키워드를 입력한 후<br />
              <strong>[3대 콘텐츠 동시 생성하기]</strong> 버튼을 누르시면<br />
              작가노트, 인스타 캡션, 블로그 글이 한 번에 완성되며 <strong>직접 수정도 가능</strong>합니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
