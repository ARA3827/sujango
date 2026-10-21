import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Eye, 
  BookOpen, 
  Camera, 
  Share2, 
  Tag, 
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ZoomIn,
  X,
  Crown,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import WatermarkSettingsModal from './WatermarkSettingsModal';
import ShareLinkModal from './ShareLinkModal';
import { 
  getArtworks, 
  saveSingleArtwork, 
  deleteArtwork, 
  exportArchiveBackup, 
  importArchiveBackup,
  syncArtworksFromSupabase 
} from '../utils/archiveStorage';
import { generateWatermarkedPreview, generateThumbnail, compressImage } from '../utils/imageCompressor';
import { fetchWatermarkSettings } from '../utils/supabaseClient';
import { saveOriginalToVault, getOriginalFromVault, deleteOriginalFromVault } from '../utils/rawImageVault';

export default function ArchiveStudio({ onBack, onNavigateToCaption, onNavigateToStatement, onOpenPricing, user, initialArtworkId }) {
  const [artworks, setArtworks] = useState(() => getArtworks(user));
  const [selectedId, setSelectedId] = useState(() => {
    const list = getArtworks(user);
    if (initialArtworkId && list.some(a => a.id === initialArtworkId)) {
      return initialArtworkId;
    }
    return list.length > 0 ? list[0].id : null;
  });

  // 유저 계정 변경 시 해당 유저의 수장고 작품 목록으로 즉각 갱신
  useEffect(() => {
    const userArts = getArtworks(user);
    setArtworks(userArts);
    if (userArts.length > 0) {
      if (!selectedId || !userArts.some(a => a.id === selectedId)) {
        setSelectedId(userArts[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [user]);

  // 대시보드 등 외부에서 특정 작품을 선택하여 진입했을 때 즉시 포커싱
  useEffect(() => {
    if (initialArtworkId && artworks.some(a => a.id === initialArtworkId)) {
      setSelectedId(initialArtworkId);
    }
  }, [initialArtworkId, artworks]);

  const [activeTab, setActiveTab] = useState('statement'); // 'statement' | 'insta' | 'blog'
  const [copied, setCopied] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // 무료 30점 한도 초과 모달 상태
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // 워터마크 보안 설정 모달 상태
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);

  // 보안 공유 링크 모달 상태
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetArtwork, setShareTargetArtwork] = useState(null);

  // 모달 상태 (새 작품 등록 / 수정)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAttention, setModalAttention] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [modalForm, setModalForm] = useState({
    title: '',
    artist: user?.name || '작가',
    year: new Date().getFullYear().toString(),
    size: '',
    medium: '',
    price: '',
    isNfs: false,
    imageUrl: '',
    statement: '',
    instaCaption: '',
    blogStory: ''
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [pendingRawFile, setPendingRawFile] = useState(null);
  const fileInputRef = useRef(null);
  const backupInputRef = useRef(null);

  // 현재 선택된 작품
  const currentArt = artworks.find(a => a.id === selectedId) || artworks[0];

  // 텍스트 인라인 수정 상태
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Supabase 클라우드 데이터 동기화
  useEffect(() => {
    syncArtworksFromSupabase(user).then(cloudList => {
      if (cloudList && cloudList.length > 0) {
        setArtworks(cloudList);
      }
    });
  }, [user]);

  useEffect(() => {
    if (currentArt) {
      if (activeTab === 'statement') setEditedText(currentArt.statement || '');
      if (activeTab === 'insta') setEditedText(currentArt.instaCaption || '');
      if (activeTab === 'blog') setEditedText(currentArt.blogStory || '');
      setIsEditingText(false);
    }
  }, [selectedId, activeTab, currentArt]);

  // 원본 이미지 다운로드 상태
  const [isDownloading, setIsDownloading] = useState(false);

  // 복사 핸들러
  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 내 기기(PC/모바일)에 원본 이미지 다운로드 (IndexedDB 무손실 원본 1순위 -> Canvas 고화질 2순위)
  const handleDownloadOriginal = async (artwork) => {
    if (!artwork) {
      alert('다운로드할 작품을 선택해 주세요.');
      return;
    }

    setIsDownloading(true);
    try {
      const cleanTitle = (artwork.title || '작품').replace(/[\/\\:*?"<>|]/g, '_').trim();
      const artistName = (artwork.artist || user?.name || '작가').replace(/[\/\\:*?"<>|]/g, '_').trim();

      // 1순위: IndexedDB 원본 금고에서 사용자가 업로드했던 무손실 원본 파일(8.23MB) 조회
      const vaultBlob = await getOriginalFromVault(artwork.id);

      if (vaultBlob && vaultBlob.size > 0) {
        // 원본 파일의 원래 확장자(.jpg, .jpeg, .png 등)를 100% 그대로 보존
        let extension = 'jpg';
        if (vaultBlob.originalName && vaultBlob.originalName.includes('.')) {
          const parts = vaultBlob.originalName.split('.');
          extension = parts[parts.length - 1].toLowerCase();
        } else if (vaultBlob.type && vaultBlob.type.includes('png')) {
          extension = 'png';
        } else if (vaultBlob.type && vaultBlob.type.includes('webp')) {
          extension = 'webp';
        }

        const fileName = `${artistName}_《${cleanTitle}》_원본.${extension}`;
        console.log(`[ArchiveStudio] 무손실 원본 다운로드: ${fileName} (${(vaultBlob.size / (1024 * 1024)).toFixed(2)} MB)`);
        const blobUrl = window.URL.createObjectURL(vaultBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }

      // 2순위: 원본 금고에 등록되기 전 구버전 작품인 경우 Canvas JPG 변환 다운로드 (Fallback)
      if (!artwork.imageUrl) {
        alert('등록된 작품 이미지가 없습니다.');
        return;
      }

      const isPng = artwork.imageUrl.startsWith('data:image/png') || artwork.imageUrl.toLowerCase().endsWith('.png');
      const targetMime = isPng ? 'image/png' : 'image/jpeg';
      const extension = isPng ? 'png' : 'jpg';
      const fileName = `${artistName}_《${cleanTitle}》_원본.${extension}`;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = artwork.imageUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');

      if (!isPng) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, targetMime, 0.98);
      });

      if (blob) {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        throw new Error('Blob 변환 실패');
      }
    } catch (err) {
      console.warn('다운로드 중 오류 발생, 대체 방식으로 실행:', err);
      if (artwork.imageUrl) {
        const link = document.createElement('a');
        link.href = artwork.imageUrl;
        const cleanTitle = (artwork.title || '작품').replace(/[\/\\:*?"<>|]/g, '_').trim();
        link.download = `${cleanTitle}_원본.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  // 모달 열기 (새 등록)
  const handleOpenAddModal = () => {
    // 무료 플랜 30점 한도 검증
    if (!user?.isPro && artworks.length >= 30) {
      setIsLimitModalOpen(true);
      return;
    }
    setEditingArtwork(null);
    setModalForm({
      title: '',
      artist: user?.name || currentArt?.artist || '작가',
      year: new Date().getFullYear().toString(),
      size: '53.0 × 45.5 cm (10F)',
      medium: '캔버스에 유채 (Oil on canvas)',
      price: '',
      isNfs: false,
      imageUrl: '',
      statement: '',
      instaCaption: '',
      blogStory: ''
    });
    setIsModalOpen(true);
  };

  // 모달 열기 (수정)
  const handleOpenEditModal = (art) => {
    setEditingArtwork(art);
    setModalForm({
      title: art.title || '',
      artist: art.artist || user?.name || '작가',
      year: art.year || '',
      size: art.size || '',
      medium: art.medium || '',
      price: art.price || '',
      isNfs: art.isNfs || false,
      imageUrl: art.imageUrl || '',
      statement: art.statement || '',
      instaCaption: art.instaCaption || '',
      blogStory: art.blogStory || ''
    });
    setIsModalOpen(true);
  };

  // 바깥 배경 클릭 시 실수로 닫히는 사고 방지 (통통 튀는 피드백)
  const handleBackdropClick = () => {
    setModalAttention(true);
    setTimeout(() => setModalAttention(false), 260);
  };

  // 모달 안전 닫기 핸들러 (작성 중인 데이터 보존 안내)
  const handleSafeCloseModal = () => {
    const isDirty = Boolean(
      modalForm.title.trim() || 
      modalForm.imageUrl || 
      (modalForm.statement && modalForm.statement.trim()) ||
      (modalForm.instaCaption && modalForm.instaCaption.trim())
    );

    if (isDirty) {
      if (window.confirm('작성 중인 작품 정보가 있습니다. 저장을 취소하고 창을 닫으시겠습니까?')) {
        setIsModalOpen(false);
      }
    } else {
      setIsModalOpen(false);
    }
  };

  // 이미지 파일 선택 시 처리
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // 원본 파일 객체 임시 보관 (저장 시 IndexedDB 무손실 금고에 보관)
      setPendingRawFile(file);

      // 1. 작가의 워터마크 보안 설정 조회
      const watermarkSettings = await fetchWatermarkSettings(user?.email || 'local_user') || {};

      // 2. 수장고 화면 뷰어용 깨끗한 고화질 이미지 (localStorage 5MB 한도 안전 크기: 1200px / 워터마크 0개)
      const cleanViewerDataUrl = await compressImage(file, 1200, 0.78);

      // 3. 400px 초경량 목록용 썸네일 생성
      const thumbDataUrl = await generateThumbnail(file, 400, 0.72);

      setModalForm(prev => ({ 
        ...prev, 
        imageUrl: cleanViewerDataUrl, // 수장고 내부에는 워터마크 없는 깨끗한 작품 표시
        thumbnailUrl: thumbDataUrl,
        fileSizeBytes: file.size
      }));
    } catch (err) {
      alert('이미지 처리 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  // 모달 저장 (폼 태그 없이 버튼 클릭으로 직통 저장)
  const handleSaveModal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!modalForm.title || !modalForm.title.trim()) {
      alert('작품 제목을 입력해 주세요.');
      return;
    }

    const itemToSave = {
      ...(editingArtwork ? editingArtwork : {}),
      ...modalForm,
      id: editingArtwork ? editingArtwork.id : 'art-' + Date.now()
    };

    // 1. IndexedDB 무손실 원본 금고에 대용량 원본 파일(10.6MB 등) 영구 저장 (방어 처리)
    if (pendingRawFile) {
      try {
        await saveOriginalToVault(itemToSave.id, pendingRawFile, pendingRawFile.name);
      } catch (vaultErr) {
        console.warn('[Raw Vault] 금고 저장 경고:', vaultErr);
      }
      setPendingRawFile(null);
    }

    // 2. 작품 메타데이터 및 뷰어 이미지 저장
    const updated = saveSingleArtwork(itemToSave, user);
    setArtworks(updated);
    setSelectedId(itemToSave.id);
    setIsModalOpen(false);

    try {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#0F172A', '#38BDF8', '#10B981']
      });
    } catch (e) {}
  };

  // 본문 텍스트 인라인 저장
  const handleSaveInlineText = () => {
    if (!currentArt) return;
    const field = activeTab === 'statement' ? 'statement' : activeTab === 'insta' ? 'instaCaption' : 'blogStory';
    const updatedItem = { ...currentArt, [field]: editedText };
    const updatedList = saveSingleArtwork(updatedItem, user);
    setArtworks(updatedList);
    setIsEditingText(false);
  };

  // 작품 삭제
  const handleDelete = async (id, title) => {
    if (window.confirm(`《${title}》 작품과 관련된 모든 기록을 수장고에서 삭제하시겠습니까?`)) {
      // IndexedDB 원본 금고에서도 삭제
      await deleteOriginalFromVault(id);
      const updated = deleteArtwork(id, user);
      setArtworks(updated);
      if (selectedId === id && updated.length > 0) {
        setSelectedId(updated[0].id);
      }
    }
  };

  // 백업 파일 불러오기 핸들러
  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importArchiveBackup(file, user);
      setArtworks(restored);
      if (restored.length > 0) setSelectedId(restored[0].id);
      alert(`성공적으로 ${restored.length}점의 작품 기록을 복원했습니다!`);
    } catch (err) {
      alert('백업 파일 복원 실패: ' + err.message);
    } finally {
      if (backupInputRef.current) backupInputRef.current.value = '';
    }
  };

  return (
    <div className="workspace-wrapper">
      {/* 1. 상단 글로벌 워크스페이스 바 */}
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 메인 대시보드로
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => exportArchiveBackup(user)} 
            className="btn-outline" 
            title="모든 작품 사진과 글을 내 컴퓨터에 안전하게 백업"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
          >
            <Download size={14} /> 전체 백업 다운로드
          </button>
          
          <button 
            onClick={() => backupInputRef.current?.click()} 
            className="btn-outline" 
            title="저장해둔 백업 파일(JSON)을 불러와 복원"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
          >
            <Upload size={14} /> 백업 복원
          </button>
          <input 
            type="file" 
            ref={backupInputRef} 
            accept=".json" 
            style={{ display: 'none' }} 
            onChange={handleImportBackup} 
          />

          <button 
            onClick={() => setIsWatermarkModalOpen(true)} 
            className="btn-outline" 
            title="클라이언트 시안용 워터마크 문구 및 서명 로고 설정"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', borderColor: '#0284C7', color: '#0369A1', background: '#F0F9FF' }}
          >
            <ShieldCheck size={14} color="#0284C7" /> 워터마크 설정
          </button>

          <button 
            onClick={() => onNavigateToStatement ? onNavigateToStatement() : handleOpenAddModal()} 
            className="btn-primary" 
            style={{ width: 'auto', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            title="새 작품을 수장고에 등록합니다"
          >
            <Plus size={15} /> 새 작품 등록
          </button>
        </div>
      </div>

      {/* 2. 타이틀 영역 */}
      <div className="workspace-title-area" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h2>나의 작품 디지털 수장고</h2>
          {user?.isPro ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0369A1', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 }}>
              <Crown size={13} color="#0284C7" />
              <span>Sujango Pro: 무제한 등록 & 기기 간 실시간 클라우드 동기화 중</span>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
                📁 무료 수장고: <strong>{artworks.length}</strong> / 30점 (내 PC 저장)
              </span>
              <button 
                onClick={onOpenPricing}
                className="header-pricing-btn"
                style={{ fontSize: '0.76rem', padding: '0.28rem 0.65rem' }}
                title="무제한 등록 및 기기 간 자동 동기화 Pro 플랜 안내"
              >
                <Crown size={12} color="#D97706" />
                <span>무제한 & 클라우드 수장고 Pro</span>
              </button>
            </div>
          )}
        </div>
        <p>
          창작자를 위한 프라이빗 디지털 수장고(Sujango). 
          작품 사진, 도록용 작가노트, 캡션 명패 규격을 세월이 흘러도 변치 않게 안전하게 보관하세요.
        </p>
      </div>

      {/* 3. 상단 작품 셀렉터 캐러셀 / 탭 스트립 */}
      {artworks.length > 0 && (
        <div className="archive-filmstrip-wrapper">
          <div className="archive-filmstrip">
            {artworks.map((art) => (
              <div 
                key={art.id}
                className={`archive-filmstrip-item ${art.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(art.id)}
              >
                <div className="filmstrip-thumb">
                  {art.imageUrl ? (
                    <img src={art.imageUrl} alt={art.title} />
                  ) : (
                    <div className="filmstrip-empty-thumb">
                      <ImageIcon size={18} color="#94A3B8" />
                    </div>
                  )}
                </div>
                <div className="filmstrip-info">
                  <div className="filmstrip-title">{art.title}</div>
                  <div className="filmstrip-sub">{art.year} • {art.size.split('(')[0].trim()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 본문: 선택된 작품의 2-Depth 도록 뷰 */}
      {currentArt ? (
        <div className="workspace-grid archive-workspace-grid">
          
          {/* 좌측: 시각적 자산 (작품 사진 프레임 & 미술관 표준 캡션 명패) */}
          <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="panel-card-title">
              <span>작품 시각 자산</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => handleOpenEditModal(currentArt)}
                  className="btn-outline" 
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                >
                  <Edit3 size={13} /> 정보 수정
                </button>
                <button 
                  onClick={() => handleDelete(currentArt.id, currentArt.title)}
                  className="btn-outline" 
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem', color: '#EF4444' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* 메인 캔버스 뷰어 프레임 */}
            <div className="archive-image-frame" onClick={() => currentArt.imageUrl && setLightboxImage(currentArt.imageUrl)}>
              {currentArt.imageUrl ? (
                <>
                  <img src={currentArt.imageUrl} alt={currentArt.title} />
                  <div className="image-frame-overlay">
                    <ZoomIn size={20} color="#FFFFFF" />
                    <span>클릭하여 크게 보기</span>
                  </div>
                </>
              ) : (
                <div className="archive-no-image">
                  <ImageIcon size={42} color="#CBD5E1" />
                  <p>등록된 사진이 없습니다</p>
                  <button 
                    type="button" 
                    className="btn-outline" 
                    style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}
                    onClick={() => handleOpenEditModal(currentArt)}
                  >
                    사진 등록하기
                  </button>
                </div>
              )}
            </div>

            {/* 미술관 표준 캡션 명패 카드 */}
            <div className="archive-caption-plaque">
              <div className="plaque-artist">{currentArt.artist || '김아라'}</div>
              <div className="plaque-title">
                《{currentArt.title}》
                <span className="plaque-year">, {currentArt.year}</span>
              </div>
              <div className="plaque-medium">{currentArt.medium}</div>
              <div className="plaque-size">{currentArt.size}</div>
              {currentArt.price && (
                <div className="plaque-price">
                  {currentArt.isNfs ? 'NFS (비매품 / 소장품)' : currentArt.price}
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => {
                  setShareTargetArtwork(currentArt);
                  setIsShareModalOpen(true);
                }}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', background: '#0F172A', fontSize: '0.86rem', padding: '0.65rem' }}
                title="워터마크가 합성된 1080px 안전 시안과 7일 만료 보안 링크 발급"
              >
                <Share2 size={15} /> 클라이언트 보안 시안 공유 링크 발급
              </button>

              <button 
                onClick={() => handleDownloadOriginal(currentArt)}
                className="btn-outline"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  fontSize: '0.85rem', 
                  padding: '0.65rem',
                  background: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  color: currentArt.imageUrl ? '#0F172A' : '#94A3B8',
                  fontWeight: 600
                }}
                title="내 기기(PC/모바일)에 원본 고화질 이미지 다운로드"
                disabled={!currentArt.imageUrl || isDownloading}
              >
                <Download size={15} /> {isDownloading ? '기기에 저장하는 중...' : '내 기기에 원본 이미지 다운로드'}
              </button>

              {onNavigateToCaption && (
                <button 
                  onClick={() => onNavigateToCaption(currentArt)}
                  className="btn-outline"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}
                >
                  <Tag size={15} /> 이 작품 캡션 명패 출력하기
                </button>
              )}
            </div>
          </div>

          {/* 우측: 텍스트 자산 (도록용 평론 작가노트 / 인스타 / 블로그) */}
          <div className="panel-card">
            {/* 3대 텍스트 탭 */}
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
                인스타 캡션 & 해시태그
              </button>
              <button 
                className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
                onClick={() => setActiveTab('blog')}
              >
                <Share2 size={15} style={{ display: 'inline', marginRight: '5px' }} />
                블로그 비하인드
              </button>
            </div>

            {/* 헤더 및 컨트롤 바 */}
            <div className="panel-card-title" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span>
                  {activeTab === 'statement' && '미술평론풍 작가노트'}
                  {activeTab === 'insta' && '인스타그램 감성 피드 & 태그'}
                  {activeTab === 'blog' && '블로그 작업실 비하인드 스토리'}
                </span>
                {editedText && (
                  <span className="char-counter-badge" style={{ marginLeft: '8px' }}>
                    ({editedText.length.toLocaleString()}자)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {isEditingText ? (
                  <button 
                    onClick={handleSaveInlineText}
                    className="btn-primary"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', width: 'auto' }}
                  >
                    <Check size={13} /> 수정 완료
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditingText(true)}
                    className="btn-outline"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                  >
                    <Edit3 size={13} /> 본문 수정
                  </button>
                )}

                <button 
                  className={`btn-subtle-copy ${copied ? 'copied' : ''}`}
                  onClick={() => handleCopy(editedText)}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '복사 완료!' : '전체 복사'}
                </button>
              </div>
            </div>

            {/* 텍스트 뷰 / 에디터 */}
            {isEditingText ? (
              <textarea 
                className={`output-editor ${activeTab === 'statement' ? 'serif' : ''}`}
                style={{ minHeight: '380px' }}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="내용을 입력해 주세요..."
              />
            ) : editedText ? (
              <div 
                className={`output-box ${activeTab === 'statement' ? 'serif' : ''}`}
                style={{ minHeight: '380px', cursor: 'text' }}
                onDoubleClick={() => setIsEditingText(true)}
                title="더블클릭하면 바로 직접 수정할 수 있습니다"
              >
                {editedText}
              </div>
            ) : (
              <div className="output-box" style={{ minHeight: '380px', color: '#9CA3AF', textAlign: 'center', padding: '5rem 1rem' }}>
                아직 작성된 내용이 없습니다.<br />
                우측 상단의 <strong>[본문 수정]</strong> 버튼을 눌러 글을 보관해 보세요.
              </div>
            )}

            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
              <span>💡 더블클릭하거나 [본문 수정]을 눌러 글을 자유롭게 보완할 수 있습니다.</span>
              <span>등록일: {currentArt.createdAt || '최근'}</span>
            </div>
          </div>
        </div>
      ) : (
        /* 빈 서고 상태 */
        <div className="panel-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <ImageIcon size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '0.5rem' }}>아직 등록된 작품이 없습니다</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            작품 사진과 작가노트를 등록하고 인스타그램이나 SNS가 사라져도 끄떡없는 디지털 금고를 만들어 보세요.
          </p>
          <button 
            onClick={() => onNavigateToStatement ? onNavigateToStatement() : handleOpenAddModal()} 
            className="btn-primary" 
            style={{ width: 'auto', margin: '0 auto' }}
          >
            <Plus size={16} /> 첫 작품 등록하기
          </button>
        </div>
      )}

      {/* 5. 새 작품 등록 / 정보 수정 모달 */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div 
            className={`modal-dialog ${modalAttention ? 'pulse-attention' : ''}`}
            style={{ 
              maxWidth: '620px', 
              width: '100%', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              background: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 헤더 */}
            <div 
              className="modal-header"
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FFFFFF'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                {editingArtwork ? '✏️ 작품 및 작가노트 정보 수정' : '🎨 새 작품 아카이브 등록'}
              </h3>
              <button 
                type="button"
                onClick={handleSafeCloseModal} 
                className="modal-close-btn"
                style={{ padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                title="닫기"
              >
                <X size={18} />
              </button>
            </div>

            {/* 본문 입력 영역 (크롬 자동완성 버그 방지를 위해 form 대신 순수 div 사용) */}
            <div 
              className="modal-body" 
              style={{ 
                padding: '1.5rem 1.75rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem', 
                maxHeight: '68vh', 
                overflowY: 'auto',
                boxSizing: 'border-box'
              }}
            >
              {!editingArtwork && onNavigateToStatement && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#166534' }}>
                  <span>✨ AI로 작가노트, 전시 캡션, 인스타 글을 한 번에 생성하고 싶으신가요?</span>
                  <button 
                    type="button" 
                    onClick={() => { setIsModalOpen(false); onNavigateToStatement(); }}
                    style={{ background: '#16A34A', color: '#FFFFFF', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap', marginLeft: '8px' }}
                  >
                    AI 스튜디오로 이동 →
                  </button>
                </div>
              )}
              
              {/* 이미지 업로드 영역 */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">작품 사진 첨부 (선택사항)</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '10px',
                      border: '2px dashed #CBD5E1',
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
                    {modalForm.imageUrl ? (
                      <img src={modalForm.imageUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <ImageIcon size={22} color="#94A3B8" />
                        <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                          {isCompressing ? '저장 중...' : '사진 선택'}
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
                  <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5 }}>
                    스마트폰이나 고화질 카메라 원본 사진(수십 MB)도 단 1바이트 손실 없이,
                    브라우저 내장 대용량 금고에 <strong>100% 무손실 원본 그대로</strong> 안전하게 보관합니다.
                    {modalForm.imageUrl && (
                      <div style={{ marginTop: '6px' }}>
                        <button 
                          type="button" 
                          onClick={() => {
                            setModalForm(prev => ({ ...prev, imageUrl: '' }));
                            setPendingRawFile(null);
                          }}
                          style={{ fontSize: '0.75rem', color: '#EF4444', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          사진 제거
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="form-row" style={{ gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">작품 제목 (필수)</label>
                  <input 
                    type="text" 
                    name="artwork-title"
                    autoComplete="off"
                    className="form-input" 
                    placeholder="예: 새벽의 경계"
                    value={modalForm.title}
                    onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">작가명</label>
                  <input 
                    type="text" 
                    name="artwork-artist"
                    autoComplete="off"
                    className="form-input" 
                    value={modalForm.artist}
                    onChange={(e) => setModalForm({ ...modalForm, artist: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row" style={{ gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">제작 연도</label>
                  <input 
                    type="text" 
                    name="artwork-year"
                    autoComplete="off"
                    className="form-input" 
                    value={modalForm.year}
                    onChange={(e) => setModalForm({ ...modalForm, year: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">크기 / 호수</label>
                  <input 
                    type="text" 
                    name="artwork-size"
                    autoComplete="off"
                    className="form-input" 
                    placeholder="예: 53.0 × 45.5 cm (10F)"
                    value={modalForm.size}
                    onChange={(e) => setModalForm({ ...modalForm, size: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">재료 및 기법</label>
                <input 
                  type="text" 
                  name="artwork-medium"
                  autoComplete="off"
                  className="form-input" 
                  placeholder="예: 캔버스에 유채, 혼합재료"
                  value={modalForm.medium}
                  onChange={(e) => setModalForm({ ...modalForm, medium: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ gap: '12px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">작품 가격 / 비매품</label>
                  <input 
                    type="text" 
                    name="artwork-price"
                    autoComplete="off"
                    className="form-input" 
                    placeholder={modalForm.isNfs ? 'NFS (비매품)' : '예: 2,500,000원'}
                    value={modalForm.isNfs ? '' : modalForm.price}
                    onChange={(e) => setModalForm({ ...modalForm, price: e.target.value })}
                    disabled={modalForm.isNfs}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0, paddingBottom: '0.65rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={modalForm.isNfs}
                      onChange={(e) => setModalForm({ ...modalForm, isNfs: e.target.checked })}
                    />
                    <span>NFS (소장품 / 비매품)</span>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">도록용 평론 작가노트 (선택)</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '85px', fontSize: '0.86rem' }}
                  placeholder="이 작품에 얽힌 작가노트를 보관해 보세요..."
                  value={modalForm.statement}
                  onChange={(e) => setModalForm({ ...modalForm, statement: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">인스타그램 캡션 & 해시태그 (선택)</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '75px', fontSize: '0.86rem' }}
                  placeholder="SNS에 올렸거나 올릴 캡션을 보관해 보세요..."
                  value={modalForm.instaCaption}
                  onChange={(e) => setModalForm({ ...modalForm, instaCaption: e.target.value })}
                />
              </div>
            </div>

            {/* 하단 버튼 푸터 */}
            <div 
              className="modal-footer"
              style={{
                padding: '1rem 1.75rem',
                borderTop: '1px solid #F1F5F9',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              }}
            >
              <button 
                type="button" 
                onClick={handleSafeCloseModal} 
                className="btn-outline"
                style={{ width: 'auto', padding: '0.55rem 1.15rem', fontSize: '0.86rem' }}
              >
                취소
              </button>
              <button 
                type="button" 
                onClick={handleSaveModal}
                className="btn-primary" 
                style={{ width: 'auto', padding: '0.55rem 1.35rem', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                disabled={isCompressing}
              >
                <Check size={16} /> {editingArtwork ? '수정 완료' : '아카이브 보관'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 라이트박스 (사진 확대 모달) */}
      {lightboxImage && (
        <div className="lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: '-40px', right: 0, display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                className="lightbox-close-btn" 
                style={{ position: 'static' }}
                onClick={() => handleDownloadOriginal(currentArt)}
                title="내 기기에 원본 이미지 다운로드"
              >
                <Download size={22} />
              </button>
              <button 
                className="lightbox-close-btn" 
                style={{ position: 'static' }}
                onClick={() => setLightboxImage(null)}
                title="닫기"
              >
                <X size={24} />
              </button>
            </div>
            <img src={lightboxImage} alt="작품 크게 보기" />
          </div>
        </div>
      )}

      {/* 7. 무료 30점 한도 도달 안내 모달 */}
      {isLimitModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLimitModalOpen(false)}>
          <div 
            className="modal-dialog" 
            style={{ maxWidth: '480px', padding: '2rem 1.75rem', textAlign: 'center' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Crown size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
              무료 보관 한도(30점)에 도달했습니다
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              무료 플랜은 최대 30점까지 브라우저에 안전하게 보관할 수 있습니다.<br />
              <strong>작품 무제한 등록</strong>과 <strong>PC • 스마트폰 간 실시간 자동 로그인 동기화</strong>, 
              <strong>100GB 무손실 원본 금고</strong>를 이용하시려면 Pro 멤버십으로 업그레이드해 보세요!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsLimitModalOpen(false);
                  if (onOpenPricing) onOpenPricing();
                }}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.92rem' }}
              >
                <Crown size={16} color="#EAB308" />
                <span>👑 수장고프로 업그레이드</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLimitModalOpen(false)}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', color: '#64748B' }}
              >
                다음에 하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 나만의 워터마크 보안 설정 모달 */}
      <WatermarkSettingsModal 
        isOpen={isWatermarkModalOpen} 
        onClose={() => setIsWatermarkModalOpen(false)} 
        user={user} 
      />

      {/* 5. 클라이언트용 보안 공유 링크 모달 */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        artwork={shareTargetArtwork}
        user={user}
      />
    </div>
  );
}
