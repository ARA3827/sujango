import React, { useState, useRef, useEffect } from 'react';
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
  Plus,
  FolderOpen,
  AlertCircle,
  Search,
  Link as LinkIcon,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveSingleArtwork, getArtworks } from '../utils/archiveStorage';
import { generateArtworkId } from '../utils/artworkModel';
import { compressImage } from '../utils/imageCompressor';
import { getUserScopedKey } from '../utils/authStorage';
import { saveOriginalToVault } from '../utils/rawImageVault';


export default function StatementStudio({ onBack, user = null, onNavigateToArchive }) {
  const [activeTab, setActiveTab] = useState('statement'); // 'statement' | 'insta' | 'blog'
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // 직접 수정 모드 토글
  const [rawUploadFile, setRawUploadFile] = useState(null); // 무손실 원본 대용량 파일 (31.5MB 등)

  // 수장고 연동 및 버전 히스토리 상태 (Step 6-2-C)
  const [artworkId, setArtworkId] = useState(null); // 불러온 수장고 작품 고유 ID
  const [artworkUpdatedAt, setArtworkUpdatedAt] = useState(null); // 작품 최종 수정 시각
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // 수장고 작품 불러오기 모달
  const [importSearchQuery, setImportSearchQuery] = useState(''); // 모달 내 검색어
  const [syncWithVaultOnCreate, setSyncWithVaultOnCreate] = useState(true); // 새 작품 등록 시 수장고에도 보관
  const [vaultDiffNotice, setVaultDiffNotice] = useState(null); // 수장고 변경 감지 알림
  const [statementHistory, setStatementHistory] = useState(null); // 직전 1개 버전 히스토리 { statement, insta, blog, savedAt }
  const [toastMessage, setToastMessage] = useState(null);

  // 토스트 안내 헬퍼
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // 3번: 마지막으로 사용한 재료 복원 (초기값)
  const getLastMedium = () => {
    try {
      const key = getUserScopedKey('sujango_last_medium', user);
      const saved = localStorage.getItem(key);
      if (saved) return saved;
      return '지본채색'; // 누나의 단골 기법
    } catch (e) {
      return '지본채색';
    }
  };

  // 2번: 크기 단위 및 가로/세로 숫자 전용 상태
  const [sizeUnit, setSizeUnit] = useState('cm'); // 'cm' | 'inch' | 'direct'
  const [sizeW, setSizeW] = useState('');
  const [sizeH, setSizeH] = useState('');

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
    medium: getLastMedium(),
    size: '',
    price: '',
    isNfs: false,
    keywords: '',
    inspiration: ''
  });

  // 크기 업데이트 함수 (숫자만 입력받아 자동으로 'W × H cm/inch' 포맷 완성)
  const updateDimension = (w, h, unit) => {
    setSizeW(w);
    setSizeH(h);
    if (unit === 'direct') return;
    if (w.trim() && h.trim()) {
      setArtwork(prev => ({ ...prev, size: `${w.trim()} × ${h.trim()} ${unit}` }));
    } else if (w.trim() || h.trim()) {
      setArtwork(prev => ({ ...prev, size: `${w.trim() || h.trim()} ${unit}` }));
    } else {
      setArtwork(prev => ({ ...prev, size: '' }));
    }
  };

  const handleSizeWChange = (val) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    updateDimension(cleaned, sizeH, sizeUnit);
  };

  const handleSizeHChange = (val) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    updateDimension(sizeW, cleaned, sizeUnit);
  };

  const handleUnitChange = (newUnit) => {
    setSizeUnit(newUnit);
    if (newUnit !== 'direct') {
      updateDimension(sizeW, sizeH, newUnit);
    }
  };

  // 재료 변경 및 로컬 스토리지 실시간 영구 보관
  const handleMediumChange = (val) => {
    setArtwork(prev => ({ ...prev, medium: val }));
    try {
      const key = getUserScopedKey('sujango_last_medium', user);
      localStorage.setItem(key, val);
    } catch (e) {}
  };

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

  // 수장고에서 작품 선택 시 폼 및 글 채우기
  const handleSelectArtworkFromVault = (art) => {
    // 크기 파싱 시도 (가로/세로 규격 자동 복원)
    const rawSize = art.size || '';
    let parsedW = '';
    let parsedH = '';
    let parsedUnit = 'cm';

    if (rawSize.includes('×') || rawSize.includes('x')) {
      const parts = rawSize.split(/[×x]/);
      if (parts.length >= 2) {
        parsedW = parts[0].replace(/[^0-9.]/g, '').trim();
        parsedH = parts[1].replace(/[^0-9.]/g, '').trim();
        if (rawSize.toLowerCase().includes('inch')) parsedUnit = 'inch';
        else if (rawSize.toLowerCase().includes('cm')) parsedUnit = 'cm';
        else parsedUnit = 'direct';
      }
    }

    setSizeW(parsedW);
    setSizeH(parsedH);
    setSizeUnit(parsedUnit);

    setArtwork({
      title: art.title || '',
      artist: art.artist || user?.name || '작가',
      year: art.year || new Date().getFullYear().toString(),
      medium: art.medium || getLastMedium(),
      size: art.size || '',
      price: art.price || '',
      isNfs: Boolean(art.isNfs || art.price?.includes('NFS')),
      keywords: art.keywords || '',
      inspiration: art.inspiration || ''
    });

    setArtworkImage(art.imageUrl || '');
    setRawUploadFile(null);

    // 기존에 작성해둔 글이 있다면 즉시 뷰어에 로드
    const existingTexts = {
      statement: art.statement || '',
      insta: art.instaCaption || '',
      blog: art.blogStory || ''
    };
    setResults(existingTexts);
    setOriginalResults(existingTexts);

    // 기존 히스토리 로드
    if (art.statementHistory) {
      setStatementHistory(art.statementHistory);
    } else {
      setStatementHistory(null);
    }

    setArtworkId(art.id);
    setArtworkUpdatedAt(art.updatedAt || art.createdAt || null);
    setIsImportModalOpen(false);
    setVaultDiffNotice(null);

    showToast(`'${art.title || '작품'}'의 정보를 수장고에서 불러왔습니다.`);
  };

  // 연결 해제 (독립 작품으로 전환)
  const handleClearArtworkLink = () => {
    setArtworkId(null);
    setArtworkUpdatedAt(null);
    setVaultDiffNotice(null);
    showToast('수장고 연결을 해제했습니다. 이 글은 독립적으로 관리됩니다.');
  };

  // 수장고 변경 사항을 현재 폼에 반영
  const handleApplyVaultChanges = () => {
    if (!vaultDiffNotice?.artwork) return;
    const v = vaultDiffNotice.artwork;
    setArtwork(prev => ({
      ...prev,
      title: v.title || prev.title,
      artist: v.artist || prev.artist,
      year: v.year || prev.year,
      size: v.size || prev.size,
      medium: v.medium || prev.medium,
      price: v.price || prev.price,
      isNfs: Boolean(v.isNfs)
    }));
    if (v.imageUrl) setArtworkImage(v.imageUrl);
    setArtworkUpdatedAt(v.updatedAt || new Date().toISOString());
    setVaultDiffNotice(null);
    showToast('수장고의 최신 작품 정보를 반영했습니다.');
  };

  // 현재 글을 직전 버전 히스토리로 백업
  const backupCurrentToHistory = () => {
    if (results.statement || results.insta || results.blog) {
      setStatementHistory({
        statement: results.statement || '',
        insta: results.insta || '',
        blog: results.blog || '',
        savedAt: new Date().toISOString()
      });
    }
  };

  // [이전 버전으로 되돌리기] 핸들러
  const handleRevertHistory = () => {
    if (!statementHistory) return;
    setResults({
      statement: statementHistory.statement || '',
      insta: statementHistory.insta || '',
      blog: statementHistory.blog || ''
    });
    setIsEditMode(false);
    showToast('직전 버전의 글로 안전하게 되돌렸습니다.');
    triggerConfetti();
  };


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

  // 1) 글 먼저 확인 (AI 초안 생성 - 기존 글이 있으면 직전 히스토리 자동 보관)
  const handleGenerate = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!artwork.title.trim()) {
      alert('작품 제목을 먼저 입력해 주세요.');
      return;
    }

    // 기존 작성된 글이 있었다면 덮어쓰기 전 직전 히스토리로 안전 보관
    if (results.statement || results.insta || results.blog) {
      backupCurrentToHistory();
    }

    const generated = createGeneratedTexts();
    setResults(generated);
    setOriginalResults(generated);
    setIsEditMode(false);
    triggerConfetti();
    showToast('AI가 미술평론풍 작가노트와 SNS 글을 새롭게 작성했습니다.');
  };

  // 2) [원클릭 메인 핵심] AI 글 생성과 동시에 수장고에 즉시 영구 등록!
  const handleGenerateAndSaveToArchive = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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

    await executeSaveToArchive(finalTexts);
  };

  // 3) AI 글 없이 기본 정보 또는 현재 작성된 글 수장고에 등록 (중복 작품 방지 핵심)
  const handleSaveToArchive = async () => {
    if (!artwork.title.trim()) {
      alert('작품 제목을 먼저 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    await executeSaveToArchive(results);
  };

  // 실제 저장 실행 함수 (기존 작품은 해당 ID 갱신, 신규 작품은 수장고 보관 연동)
  const executeSaveToArchive = async (textsToSave) => {
    const authorName = artwork.artist || user?.name || '작가';
    let targetId = artworkId;
    const isUpdatingExisting = Boolean(targetId);

    if (!targetId) {
      // 새 작품인 경우
      if (syncWithVaultOnCreate) {
        targetId = generateArtworkId();
      } else {
        setIsSaving(false);
        showToast('작성된 글이 화면에 유지됩니다.');
        return;
      }
    }

    // 기존 작품 목록 조회
    const allArts = getArtworks(user) || [];
    const existingArt = isUpdatingExisting ? allArts.find(a => a.id === targetId) : null;

    // 히스토리 보관 (현재 수정된 적이 있다면 기존 버전을 statementHistory에 보관)
    const historyToKeep = statementHistory || (existingArt && existingArt.statementHistory) || null;

    const itemToSave = {
      ...(existingArt || {}),
      id: targetId,
      title: artwork.title.trim(),
      artist: authorName,
      year: artwork.year || new Date().getFullYear().toString(),
      medium: artwork.medium || '',
      size: artwork.size || '',
      price: artwork.isNfs ? 'NFS (비매품)' : (artwork.price ? artwork.price : '가격 협의'),
      isNfs: Boolean(artwork.isNfs),
      imageUrl: artworkImage || (existingArt && existingArt.imageUrl) || '',
      statement: textsToSave.statement || '',
      instaCaption: textsToSave.insta || '',
      blogStory: textsToSave.blog || '',
      keywords: artwork.keywords || '',
      inspiration: artwork.inspiration || '',
      statementHistory: historyToKeep,
      createdAt: existingArt?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    // 1. IndexedDB 무손실 금고에 대용량 원본 파일(31.5MB 등) 안전 보관
    if (rawUploadFile) {
      try {
        await saveOriginalToVault(targetId, rawUploadFile, rawUploadFile.name);
      } catch (e) {
        console.warn('[StatementStudio] 금고 저장 알림:', e);
      }
    }

    const updatedList = await saveSingleArtwork(itemToSave, user);
    setArtworkId(targetId);
    setArtworkUpdatedAt(itemToSave.updatedAt);
    triggerConfetti();
    setSavedNotice(true);

    showToast(isUpdatingExisting ? '기존 수장고 작품의 작가노트가 안전하게 갱신되었습니다.' : '수장고에 새 작품과 작가노트가 안전하게 보관되었습니다.');

    setTimeout(() => {
      setIsSaving(false);
      if (onNavigateToArchive) {
        const savedItem = updatedList.find(a => a.id === targetId) || updatedList[0];
        onNavigateToArchive(savedItem ? savedItem.id : null);
      } else if (onBack) {
        onBack();
      }
    }, 850);
  };


  // 이미지 파일 선택 시 자동 압축 및 대용량 원본(31.5MB 등) 안전 보관
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // 무손실 원본 파일 객체 보관 (31.5MB 대용량 등)
      setRawUploadFile(file);

      // 화면 뷰어용 깨끗한 압축 (화면 표시용)
      const compressed = await compressImage(file, 1200, 0.78);
      setArtworkImage(compressed);
    } catch (err) {
      alert('이미지 처리 중 오류가 발생했습니다: ' + err.message);
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

          {/* 수장고에서 작품 불러오기 버튼 (단정하고 정갈한 원클릭 로더) */}
          <button
            type="button"
            onClick={() => {
              setIsImportModalOpen(true);
              setImportSearchQuery('');
            }}
            className="btn-import-vault"
            style={{ marginBottom: '0.2rem' }}
            title="수장고에 보관된 작품 목록을 확인하고 작가노트로 가져옵니다"
          >
            <FolderOpen size={16} />
            수장고에서 작품 불러오기
          </button>

          {/* 수장고 원본 변경 감지 알림 배너 */}
          {vaultDiffNotice && (
            <div className="caption-vault-diff-banner" style={{ margin: 0 }}>
              <div className="caption-vault-diff-header">
                <AlertCircle size={15} />
                <span>수장고의 작품 정보가 변경되었습니다</span>
              </div>
              <div className="caption-vault-diff-msg">
                수장고의 원본 내용이 업데이트되었습니다. 작가노트에도 새 작품 정보를 반영할까요?
              </div>
              <div className="caption-vault-diff-actions">
                <button
                  type="button"
                  onClick={handleApplyVaultChanges}
                  className="btn-diff-apply"
                >
                  수장고 내용 반영하기
                </button>
                <button
                  type="button"
                  onClick={() => setVaultDiffNotice(null)}
                  className="btn-diff-dismiss"
                >
                  현재 내용 유지하기
                </button>
              </div>
            </div>
          )}

          {/* 연결된 수장고 작품 인디케이터 */}
          {artworkId && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.85rem', background: '#F1F5F9', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#334155' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LinkIcon size={14} color="#2563EB" />
                <span>수장고 작품과 연결됨: <strong>《{artwork.title || '작품'}》</strong></span>
              </span>
              <button
                type="button"
                onClick={handleClearArtworkLink}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                title="연결을 해제하고 새 작품으로 분리합니다"
              >
                연결 해제
              </button>
            </div>
          )}

          {/* 작품 사진 첨부 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>작품 사진 (선택)</label>
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
                      {isCompressing ? '등록 중' : '사진 첨부'}
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
            </div>
          </div>


          {/* 제목 & 작가명 */}
          <div className="form-row" style={{ gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">작품 제목 <span style={{ color: '#EF4444' }}>*</span></label>
              <input 
                type="text" 
                name="statement-artwork-title"
                autoComplete="off"
                data-lpignore="true"
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
                name="statement-artwork-artist"
                autoComplete="off"
                data-lpignore="true"
                className="form-input" 
                value={artwork.artist}
                onChange={(e) => setArtwork({...artwork, artist: e.target.value})}
              />
            </div>
          </div>

          {/* 제작 연도 & 크기 (2번 요구사항: 숫자만 입력 + cm/inch 선택) */}
          <div className="form-row" style={{ gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0, width: '130px', flex: 'none' }}>
              <label className="form-label">제작 연도</label>
              <input 
                type="text" 
                name="statement-artwork-year"
                autoComplete="off"
                data-lpignore="true"
                className="form-input" 
                value={artwork.year}
                onChange={(e) => setArtwork({...artwork, year: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>크기 / 규격</label>
                {/* cm / inch / 직접입력 단위 토글 버튼 */}
                <div style={{ display: 'flex', gap: '2px', background: '#F1F5F9', padding: '2px', borderRadius: '5px' }}>
                  <button
                    type="button"
                    onClick={() => handleUnitChange('cm')}
                    style={{
                      border: 'none',
                      background: sizeUnit === 'cm' ? '#FFFFFF' : 'transparent',
                      color: sizeUnit === 'cm' ? '#0F172A' : '#64748B',
                      fontWeight: sizeUnit === 'cm' ? 700 : 500,
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      boxShadow: sizeUnit === 'cm' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange('inch')}
                    style={{
                      border: 'none',
                      background: sizeUnit === 'inch' ? '#FFFFFF' : 'transparent',
                      color: sizeUnit === 'inch' ? '#0F172A' : '#64748B',
                      fontWeight: sizeUnit === 'inch' ? 700 : 500,
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      boxShadow: sizeUnit === 'inch' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    inch
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange('direct')}
                    style={{
                      border: 'none',
                      background: sizeUnit === 'direct' ? '#FFFFFF' : 'transparent',
                      color: sizeUnit === 'direct' ? '#0F172A' : '#64748B',
                      fontWeight: sizeUnit === 'direct' ? 700 : 500,
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      boxShadow: sizeUnit === 'direct' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    직접입력
                  </button>
                </div>
              </div>

              {sizeUnit !== 'direct' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="text" 
                    name="statement-size-w"
                    autoComplete="off"
                    data-lpignore="true"
                    inputMode="decimal"
                    className="form-input" 
                    placeholder="가로" 
                    value={sizeW}
                    onChange={(e) => handleSizeWChange(e.target.value)}
                    style={{ textAlign: 'center', fontWeight: 600 }}
                  />
                  <span style={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.9rem' }}>×</span>
                  <input 
                    type="text" 
                    name="statement-size-h"
                    autoComplete="off"
                    data-lpignore="true"
                    inputMode="decimal"
                    className="form-input" 
                    placeholder="세로" 
                    value={sizeH}
                    onChange={(e) => handleSizeHChange(e.target.value)}
                    style={{ textAlign: 'center', fontWeight: 600 }}
                  />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569', minWidth: '28px' }}>
                    {sizeUnit}
                  </span>
                </div>
              ) : (
                <input 
                  type="text" 
                  name="statement-size-direct"
                  autoComplete="off"
                  data-lpignore="true"
                  className="form-input" 
                  placeholder="예: 53.0 × 45.5 cm (10F) 또는 자유 입력"
                  value={artwork.size}
                  onChange={(e) => setArtwork({...artwork, size: e.target.value})}
                />
              )}
            </div>
          </div>

          {/* 재료 및 기법 (3번 요구사항: 마지막 입력값 자동 유지 & 단골 재료 원클릭 칩) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>재료 및 기법 (Medium)</label>
              <span style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 600 }}>💡 마지막 내용 자동 유지</span>
            </div>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 캔버스에 유채, 지본채색, 혼합재료"
              value={artwork.medium}
              onChange={(e) => handleMediumChange(e.target.value)}
            />
            {/* 단골 재료 원클릭 칩 */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
              {['지본채색', '캔버스에 유채', '한지에 수묵채색', '장지에 채색', '아크릴 및 혼합재료'].map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => handleMediumChange(mat)}
                  style={{
                    border: artwork.medium === mat ? '1px solid #0284C7' : '1px solid #E2E8F0',
                    background: artwork.medium === mat ? '#F0F9FF' : '#F8FAFC',
                    color: artwork.medium === mat ? '#0369A1' : '#64748B',
                    fontSize: '0.73rem',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontWeight: artwork.medium === mat ? 700 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {mat}
                </button>
              ))}
            </div>
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
              <span>창작 배경 / 영감 메모</span>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 400 }}>선택사항 (비워두셔도 AI 자동 생성)</span>
            </label>
            <textarea 
              className="form-textarea" 
              style={{ minHeight: '115px', fontSize: '0.88rem', lineHeight: '1.6' }}
              placeholder="예: 작업실 창가에 드리운 빛의 경계와 깊은 새벽의 공기에서 시작되었습니다."
              value={artwork.inspiration}
              onChange={(e) => setArtwork({...artwork, inspiration: e.target.value})}
            />
          </div>

          {/* 새 작품인 경우 수장고 동시 보관 체크박스 */}
          {!artworkId && (
            <div className="caption-vault-sync-box" style={{ margin: '0.4rem 0 0 0' }}>
              <label className="caption-vault-sync-label">
                <input
                  type="checkbox"
                  checked={syncWithVaultOnCreate}
                  onChange={(e) => setSyncWithVaultOnCreate(e.target.checked)}
                />
                <span>이 작품을 수장고에도 함께 보관하기</span>
              </label>
              <div className="caption-vault-sync-desc">
                수장고에 새 작품으로 자동 보관되어 도록과 전시 캡션 출력기에서도 바로 활용할 수 있습니다.
              </div>
            </div>
          )}

          {/* 좌측 액션 버튼: AI 초안 생성 & 내 글 바로 등록 (1:1 나란히 배치) */}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '1rem' }}>
            <button 
              type="button"
              className="btn-action-generate" 
              onClick={handleGenerate} 
              title="우측 화면에 미학 평론 작가노트 초안과 SNS 글을 생성합니다"
            >
              <Sparkles size={16} color="#0284C7" /> AI 초안 생성
            </button>
            <button 
              type="button"
              className="btn-action-save-direct" 
              onClick={handleSaveToArchive} 
              disabled={isSaving}
              title="입력한 사진과 작품 정보, 작가 본인의 글을 수장고에 안전하게 등록합니다"
            >
              <Archive size={16} color="#FFFFFF" /> 내 글 바로 등록
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
                {activeTab === 'statement' && '미술평론풍 작가노트'}
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
                {/* 직전 버전 히스토리 되돌리기 버튼 (Step 6-2-C) */}
                {statementHistory && (
                  <button 
                    type="button"
                    onClick={handleRevertHistory}
                    className="btn-outline"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', color: '#0F172A', borderColor: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="직전에 작성했던 이전 글 버전으로 복원합니다"
                  >
                    <RotateCcw size={13} /> 이전 버전으로 되돌리기
                  </button>
                )}

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
                  아직 작성된 작가노트가 없습니다
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '420px', lineHeight: 1.6, margin: 0 }}>
                  좌측에 작품 정보를 입력한 후<br />
                  <strong style={{ color: '#0284C7' }}>[✨ AI 초안 생성]</strong>을 누르시면 미술평론풍 작가노트, 인스타 캡션, 블로그 글이 함께 완성됩니다.<br />
                  <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.82rem', color: '#94A3B8' }}>
                    (직접 작성하신 글이 있다면 <strong style={{ color: '#0F172A' }}>[📁 내 글 바로 등록]</strong>으로 수장고에 즉시 보관하실 수 있습니다.)
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 수장고에서 작품 불러오기 모달 (Step 6-2-C) */}
      {isImportModalOpen && (() => {
        const allVaultArts = getArtworks(user) || [];
        const filteredArts = allVaultArts.filter(art => {
          if (!importSearchQuery.trim()) return true;
          const q = importSearchQuery.toLowerCase();
          const targetText = `${art.title || ''} ${art.year || ''} ${art.medium || ''} ${art.size || ''} ${art.artist || ''}`.toLowerCase();
          return targetText.includes(q);
        });

        return (
          <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
            <div className="caption-import-modal" onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="caption-import-header">
                <div className="caption-import-title">
                  <FolderOpen size={18} color="#0F172A" />
                  <span>수장고 작품 불러오기</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="caption-import-close-btn"
                  title="닫기"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 검색창 */}
              <div className="caption-import-search-bar">
                <Search size={15} className="caption-import-search-icon" />
                <input
                  type="text"
                  className="caption-import-search-input"
                  placeholder="작품 제목, 연도, 재료 등으로 검색..."
                  value={importSearchQuery}
                  onChange={(e) => setImportSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* 작품 리스트 */}
              <div className="caption-import-list">
                {filteredArts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B', fontSize: '0.88rem' }}>
                    {allVaultArts.length === 0 ? (
                      <>
                        수장고에 등록된 작품이 없습니다.<br />
                        수장고 아카이브에 먼저 작품을 등록해 보세요.
                      </>
                    ) : (
                      '검색 결과와 일치하는 작품이 없습니다.'
                    )}
                  </div>
                ) : (
                  filteredArts.map(art => (
                    <div key={art.id} className="caption-import-item">
                      <div className="caption-import-item-left">
                        {art.imageUrl ? (
                          <img
                            src={art.imageUrl}
                            alt={art.title || '작품'}
                            className="caption-import-thumb"
                          />
                        ) : (
                          <div className="caption-import-thumb">
                            <FolderOpen size={20} />
                          </div>
                        )}
                        <div className="caption-import-info">
                          <div className="caption-import-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{art.title || '무제'}</span>
                            {art.year && <span style={{ fontWeight: 400, color: '#64748B', fontSize: '0.82rem' }}>({art.year})</span>}
                            {art.statement && (
                              <span style={{ fontSize: '0.68rem', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                                작가노트 보관됨
                              </span>
                            )}
                          </div>
                          <div className="caption-import-sub">
                            {art.size ? `${art.size} · ` : ''}{art.medium || '재료 미기재'}
                          </div>
                          {art.price && (
                            <div style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 600 }}>
                              {art.isNfs ? 'NFS (비매품)' : art.price}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectArtworkFromVault(art)}
                        className="btn-import-select"
                        title="이 작품의 정보를 작가노트 스튜디오로 가져옵니다"
                      >
                        선택
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 작가노트 스튜디오 작업 토스트 안내 */}
      {toastMessage && (
        <div className="caption-studio-toast">
          <Check size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

