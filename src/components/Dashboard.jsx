import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowRight,
  Image as ImageIcon,
  ChevronRight,
  Tag,
  FileText,
  Receipt,
  PenTool,
  Quote,
  HardDrive,
  Crown,
  Sparkles,
  Layers,
  DollarSign,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { getArtworks } from '../utils/archiveStorage';
import { getStoredUser, getUserScopedKey } from '../utils/authStorage';
import { getArtworkStatusMeta } from '../utils/artworkModel';
import { TRADITIONAL_COLORS } from '../constants/themeColors';
import { getUserStoragePlan, calculateUsedStorage, formatBytes, checkStorageOverflow } from '../utils/storageMeter';

/**
 * 📱 모바일 퍼스트 수장고 대시보드 (Mobile-First App Dashboard)
 * - 디자인 철학: 화이트 바탕 텍스트 위주의 심플한 메인 + 클릭 시 2-Depth 세부 화면 진입 (AGENTS.md 준수)
 * - 스크롤 0회로 한눈에 파악하는 4대 현황 요약 카드 + 빠른 창작 액션 + 최근 보관작 1점 스포트라이트
 */
export default function Dashboard({ 
  onSelectView, 
  taxSummary = { totalIncome: 0, pendingAmount: 0 },
  captionCount: propCaptionCount = 0,
  onOpenNewToolModal,
  onOpenPricing,
  user = null
}) {
  const [artworks, setArtworks] = useState(() => getArtworks(user));
  const [inspoCount, setInspoCount] = useState(() => {
    if (!user) return 0;
    try {
      const key = getUserScopedKey('sujango_inspo_vault_v1', user);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved).length;
    } catch (e) {}
    return 0;
  });

  const [actualCaptionCount, setActualCaptionCount] = useState(() => {
    if (!user) return 0;
    try {
      const key = getUserScopedKey('artflow_captions', user);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved).length;
    } catch (e) {}
    return 0;
  });

  const [actualPendingAmount, setActualPendingAmount] = useState(() => {
    if (!user) return 0;
    try {
      const key = getUserScopedKey('artflow_incomes', user);
      const saved = localStorage.getItem(key);
      if (saved) {
        const list = JSON.parse(saved);
        return list
          .filter(item => item.status === 'pending' || item.status === 'unbilled')
          .reduce((sum, item) => sum + (Number(item.netAmount || item.grossAmount) || 0), 0);
      }
    } catch (e) {}
    return 0;
  });

  const refreshVault = () => {
    setArtworks(getArtworks(user));
    if (user) {
      try {
        const inspoKey = getUserScopedKey('sujango_inspo_vault_v1', user);
        const savedInspo = localStorage.getItem(inspoKey);
        setInspoCount(savedInspo ? JSON.parse(savedInspo).length : 0);

        const captionKey = getUserScopedKey('artflow_captions', user);
        const savedCaption = localStorage.getItem(captionKey);
        setActualCaptionCount(savedCaption ? JSON.parse(savedCaption).length : 0);

        const incomeKey = getUserScopedKey('artflow_incomes', user);
        const savedIncome = localStorage.getItem(incomeKey);
        if (savedIncome) {
          const list = JSON.parse(savedIncome);
          const pending = list
            .filter(item => item.status === 'pending' || item.status === 'unbilled')
            .reduce((sum, item) => sum + (Number(item.netAmount || item.grossAmount) || 0), 0);
          setActualPendingAmount(pending);
        } else {
          setActualPendingAmount(0);
        }
      } catch (e) {}
    } else {
      setInspoCount(0);
      setActualCaptionCount(0);
      setActualPendingAmount(0);
    }
  };

  useEffect(() => {
    refreshVault();
    window.addEventListener('focus', refreshVault);
    window.addEventListener('storage', refreshVault);
    return () => {
      window.removeEventListener('focus', refreshVault);
      window.removeEventListener('storage', refreshVault);
    };
  }, [user]);

  // 창작 지원 4대 핵심 도구 정의
  const tools = [
    {
      id: 'statement',
      title: '작가노트 & SNS',
      tag: '초안 작성',
      icon: PenTool,
      desc: '작품 키워드로 평론 작가노트, 인스타 캡션, 블로그 글 생성'
    },
    {
      id: 'caption',
      title: '전시 캡션 출력기',
      tag: '전시 · 명패',
      icon: Tag,
      badge: (user && actualCaptionCount > 0) ? `${actualCaptionCount}점 준비` : null,
      desc: '작품 벽면 국영문 표준 캡션을 A4 규격으로 일괄 인쇄'
    },
    {
      id: 'doc',
      title: '서류·출강 스튜디오',
      tag: '행정 공문서',
      icon: FileText,
      desc: '강의계획서, 미술계 표준 전시 약력(CV), 간이 견적서'
    },
    {
      id: 'tax',
      title: '창작 가계부',
      tag: '정산 · 세무',
      icon: Receipt,
      badge: (user && actualPendingAmount > 0) 
        ? `미수금 ${actualPendingAmount.toLocaleString()}원` 
        : null,
      desc: '출강·작품 수입 및 재료비 지출 정산 증빙서 보관'
    },
    {
      id: 'inspo',
      title: '영감 노트',
      tag: '사유 아카이브',
      icon: Quote,
      badge: (user && inspoCount > 0) ? `${inspoCount}개 보관` : null,
      desc: '책 속 문장, 번뜩이는 영감을 카드로 안전하게 수집'
    }
  ];

  // 스토리지 용량 계산
  const storagePlan = getUserStoragePlan(user);
  const usedStorageBytes = calculateUsedStorage(artworks);
  const storageStatus = checkStorageOverflow(usedStorageBytes, 0, storagePlan.limitBytes);

  // 가장 최근 보관된 대표작 1점
  const latestArtwork = artworks.length > 0 ? artworks[0] : null;
  const latestStatusMeta = latestArtwork 
    ? getArtworkStatusMeta(latestArtwork.status || (latestArtwork.isSold ? 'sold' : (latestArtwork.isNfs ? 'nfs' : 'available')))
    : null;

  return (
    <div className="mobile-app-shell">
      {/* 1. 상단 프로필 헤더 (모바일 컴팩트 스타일) */}
      <header className="mobile-header-card">
        <div className="mobile-header-text">
          <div className="mobile-header-badge">
            <Sparkles size={13} color="#D97706" />
            <span>디지털 수장고</span>
          </div>
          <h1 className="mobile-header-greeting">
            {user?.name ? `${user.name} 작가님` : '창작자님의 수장고'}
          </h1>
          <p className="mobile-header-sub">
            오롯이 창작에만 몰입할 수 있도록 안전하게 보관합니다.
          </p>
        </div>

        {/* 플랜 뱃지 & 확장 버튼 */}
        <div className="mobile-header-actions">
          {!user?.isPro && onOpenPricing && (
            <button
              type="button"
              onClick={onOpenPricing}
              className="mobile-pro-badge-btn"
              title="100GB 무손실 금고 요금제 안내"
            >
              <Crown size={12} color="#D97706" />
              <span>Pro 베타 신청</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. 🌟 한눈에 보는 4대 핵심 현황 요약 카드 (Summary Grid) */}
      <section className="mobile-summary-section" aria-label="창작 현황 한눈에 보기">
        <div className="mobile-summary-grid">
          {/* 카드 1: 보관 작품 */}
          <div 
            className="summary-card card-vault"
            onClick={() => onSelectView('archive')}
            role="button"
            tabIndex={0}
          >
            <div className="summary-card-top">
              <span className="summary-card-label">보관 작품</span>
              <div className="summary-icon-wrapper icon-vault">
                <ImageIcon size={16} />
              </div>
            </div>
            <div className="summary-card-value">
              <strong>{artworks.length}</strong>
              <span className="summary-card-unit">점</span>
            </div>
          </div>

          {/* 카드 2: 미수금 / 정산 */}
          <div 
            className="summary-card card-tax"
            onClick={() => onSelectView('tax')}
            role="button"
            tabIndex={0}
          >
            <div className="summary-card-top">
              <span className="summary-card-label">미수금 정산</span>
              <div className="summary-icon-wrapper icon-tax">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="summary-card-value">
              {actualPendingAmount > 0 ? (
                <>
                  <strong className="text-warning">{actualPendingAmount.toLocaleString()}</strong>
                  <span className="summary-card-unit">원</span>
                </>
              ) : (
                <strong className="text-muted" style={{ fontSize: '1.05rem' }}>정산 완료</strong>
              )}
            </div>
          </div>

          {/* 카드 3: 영감 서랍 */}
          <div 
            className="summary-card card-inspo"
            onClick={() => onSelectView('inspo')}
            role="button"
            tabIndex={0}
          >
            <div className="summary-card-top">
              <span className="summary-card-label">영감 메모</span>
              <div className="summary-icon-wrapper icon-inspo">
                <Quote size={16} />
              </div>
            </div>
            <div className="summary-card-value">
              <strong>{inspoCount}</strong>
              <span className="summary-card-unit">개</span>
            </div>
          </div>

          {/* 카드 4: 전시 캡션 */}
          <div 
            className="summary-card card-caption"
            onClick={() => onSelectView('caption')}
            role="button"
            tabIndex={0}
          >
            <div className="summary-card-top">
              <span className="summary-card-label">전시 캡션</span>
              <div className="summary-icon-wrapper icon-caption">
                <Tag size={16} />
              </div>
            </div>
            <div className="summary-card-value">
              <strong>{actualCaptionCount}</strong>
              <span className="summary-card-unit">점</span>
            </div>
          </div>
        </div>

        {/* 슬림형 저장 용량 인디케이터 */}
        <div className="mobile-storage-mini-bar" title={`저장 공간: ${formatBytes(usedStorageBytes)} / ${storagePlan.limitLabel}`}>
          <div className="storage-mini-labels">
            <span className="storage-mini-title">
              <HardDrive size={11} />
              <span>수장고 용량: {formatBytes(usedStorageBytes)} / {storagePlan.limitLabel}</span>
            </span>
            <span className="storage-mini-pct">{storageStatus.percentage}%</span>
          </div>
          <div className="storage-mini-track">
            <div 
              className="storage-mini-fill" 
              style={{ width: `${Math.max(2, storageStatus.percentage)}%` }} 
            />
          </div>
        </div>
      </section>

      {/* 3. 🚀 원클릭 빠른 창작 액션 (Quick Actions) */}
      <section className="mobile-actions-section">
        <button
          type="button"
          onClick={() => onSelectView('statement')}
          className="mobile-action-primary"
        >
          <div className="action-icon-circle primary">
            <Plus size={18} />
          </div>
          <div className="action-text">
            <strong>작품등록&작가노트</strong>
          </div>
          <ArrowRight size={16} className="action-arrow" />
        </button>

        <button
          type="button"
          onClick={() => onSelectView('inspo')}
          className="mobile-action-secondary"
        >
          <div className="action-icon-circle secondary">
            <Quote size={16} />
          </div>
          <div className="action-text">
            <strong>영감 한 줄 기록하기</strong>
          </div>
          <ChevronRight size={16} className="action-arrow" />
        </button>
      </section>

      {/* 4. 🖼️ 최근 보관 작품 스포트라이트 (Latest Artwork Spotlight) */}
      <section className="mobile-spotlight-section">
        <div className="section-title-row">
          <span className="section-title">최근 보관 작품</span>
          {artworks.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectView('archive')}
              className="section-link-btn"
            >
              전체 수장고 ({artworks.length}점) <ArrowRight size={13} />
            </button>
          )}
        </div>

        {latestArtwork ? (
          <div 
            className="latest-artwork-card"
            onClick={() => onSelectView('archive', latestArtwork.id)}
            role="button"
            tabIndex={0}
          >
            <div className="latest-artwork-thumb">
              {latestArtwork.imageUrl ? (
                <img src={latestArtwork.imageUrl} alt={latestArtwork.title} />
              ) : (
                <div className="thumb-placeholder">
                  <ImageIcon size={28} color="#94A3B8" />
                </div>
              )}
              {latestStatusMeta && (
                <span className={`latest-badge ${latestStatusMeta.badgeClass}`}>
                  {latestStatusMeta.shortLabel}
                </span>
              )}
            </div>

            <div className="latest-artwork-body">
              <div className="latest-title-row">
                <h3 className="latest-title">《{latestArtwork.title}》</h3>
                <span className="latest-year">{latestArtwork.year}년</span>
              </div>
              <p className="latest-meta">
                {latestArtwork.medium && <span>{latestArtwork.medium}</span>}
                {latestArtwork.size && <span> · {latestArtwork.size?.split('(')[0]?.trim() || latestArtwork.size}</span>}
              </p>
              <div className="latest-card-foot">
                <span className="latest-tap-hint">터치하여 도록 및 캡션 열람</span>
                <ChevronRight size={15} />
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="empty-spotlight-box"
            onClick={() => onSelectView('statement')}
            role="button"
            tabIndex={0}
          >
            <div className="empty-icon-circle">
              <ImageIcon size={22} color="#64748B" />
            </div>
            <h4>첫 작품을 수장고에 모셔보세요</h4>
            <p>사진과 기본 정보만 입력하면 작가노트와 캡션이 자동으로 정리됩니다.</p>
            <button type="button" className="btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.84rem' }}>
              <Plus size={14} /> 첫 작품 등록하기
            </button>
          </div>
        )}
      </section>

      {/* 5. 🧰 창작 행정 & 비즈니스 도구 메뉴 (Compact Service List) */}
      <section className="mobile-tools-section">
        <div className="section-title-row">
          <span className="section-title">창작 행정 & 비서 도구</span>
          <span className="section-sub">원클릭 실행</span>
        </div>

        <div className="mobile-tools-list">
          {tools.map((tool) => {
            const color = TRADITIONAL_COLORS[tool.id];
            const IconComponent = tool.icon;
            return (
              <div
                key={tool.id}
                className="tool-list-row"
                onClick={() => onSelectView(tool.id)}
                role="button"
                tabIndex={0}
              >
                <div 
                  className="tool-list-icon"
                  style={{
                    background: color.iconBg,
                    color: color.iconColor,
                    border: `1px solid ${color.border}`
                  }}
                >
                  <IconComponent size={18} />
                </div>
                <div className="tool-list-info">
                  <div className="tool-list-title-wrap">
                    <strong className="tool-list-title">{tool.title}</strong>
                    <span 
                      className="tool-list-tag"
                      style={{
                        background: color.tagBg,
                        color: color.tagColor,
                        border: `1px solid ${color.border}`
                      }}
                    >
                      {tool.tag}
                    </span>
                    {tool.badge && (
                      <span className="tool-list-badge">{tool.badge}</span>
                    )}
                  </div>
                  <p className="tool-list-desc">{tool.desc}</p>
                </div>
                <ChevronRight size={17} className="tool-list-arrow" />
              </div>
            );
          })}

          {/* 피드백 & 새 도구 제안 슬롯 */}
          <div
            className="tool-list-row feedback-row"
            onClick={onOpenNewToolModal}
            role="button"
            tabIndex={0}
          >
            <div className="tool-list-icon feedback-icon">
              <Lightbulb size={18} color="#D97706" />
            </div>
            <div className="tool-list-info">
              <div className="tool-list-title-wrap">
                <strong className="tool-list-title">새 도구 제안 & 작가 후기</strong>
                <span className="tool-list-tag feedback-tag">라운지</span>
              </div>
              <p className="tool-list-desc">필요한 기능 아이디어나 사용 소감을 남겨주세요</p>
            </div>
            <ChevronRight size={17} className="tool-list-arrow" />
          </div>
        </div>
      </section>
    </div>
  );
}
