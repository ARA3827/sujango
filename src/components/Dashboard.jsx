import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  PenTool, 
  Receipt, 
  Tag, 
  Plus, 
  ArrowRight,
  Layers,
  Sparkles,
  Archive,
  Image as ImageIcon
} from 'lucide-react';
import { getArtworks } from '../utils/archiveStorage';
import { getStoredUser, getUserScopedKey } from '../utils/authStorage';

export default function Dashboard({ 
  onSelectView, 
  taxSummary = { totalIncome: 0, pendingAmount: 0 },
  captionCount = 3,
  onOpenNewToolModal,
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

  const refreshVault = () => {
    setArtworks(getArtworks(user));
    if (user) {
      try {
        const key = getUserScopedKey('sujango_inspo_vault_v1', user);
        const saved = localStorage.getItem(key);
        if (saved) setInspoCount(JSON.parse(saved).length);
        else setInspoCount(0);
      } catch (e) {}
    } else {
      setInspoCount(0);
    }
  };

  useEffect(() => {
    refreshVault();
    // 윈도우 포커스 시 및 저장소 변경 시 실시간 동기화
    window.addEventListener('focus', refreshVault);
    window.addEventListener('storage', refreshVault);
    return () => {
      window.removeEventListener('focus', refreshVault);
      window.removeEventListener('storage', refreshVault);
    };
  }, [user]);

  const tools = [
    {
      id: 'inspo',
      title: '영감 노트',
      tag: '창작 영감 & 문장',
      icon: <Sparkles size={24} />,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      badge: user ? `✨ ${inspoCount}개 보관` : '✨ 샘플 2개',
      badgeStyle: { background: '#F0FDFA', color: '#0F766E', border: '1px solid #CCFBF1' },
      desc: '책 속 한 줄, 영화 속 명대사, 일상의 번뜩이는 사유를 카드로 단정하게 아카이빙하고 창작의 소중한 씨앗으로 안전하게 보관합니다.',
      actionText: '영감 노트 열기'
    },
    {
      id: 'statement',
      title: '작가노트 & SNS',
      tag: 'AI 글 생성',
      icon: <PenTool size={24} />,
      iconBg: '#FDF4FF',
      iconColor: '#A855F7',
      badge: null,
      desc: '작품 키워드 3개로 공모전용 심층 미학 평론 작가노트, 인스타 감성 캡션 + 해시태그, 블로그 후기를 동시에 추출하고 직접 수정합니다.',
      actionText: '작가노트 & SNS 쓰기'
    },
    {
      id: 'caption',
      title: '전시 캡션 출력기',
      tag: '전시 & 아트페어',
      icon: <Tag size={24} />,
      iconBg: '#F8FAFC',
      iconColor: '#0F172A',
      badge: user ? `🏷️ ${captionCount}점 준비` : '🏷️ 샘플 2점',
      badgeStyle: { background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0' },
      desc: '작품 옆 벽면에 붙이는 국영문 표준 캡션(명패)을 자동 생성하고, 자르기 좋은 절취선과 함께 A4 용지 규격으로 일괄 인쇄합니다.',
      actionText: '캡션 명패 만들기'
    },
    {
      id: 'doc',
      title: '서류·출강 스튜디오',
      tag: '행정 서류',
      icon: <FileText size={24} />,
      iconBg: '#F0FDF4',
      iconColor: '#15803D',
      badge: null,
      desc: '출강 강의계획서, 미술계 표준 전시 약력(CV), 예술 작업 간이 견적서를 공문서 규격으로 자동 완성합니다.',
      actionText: '서류 작성하기'
    },
    {
      id: 'tax',
      title: '창작 가계부',
      tag: '수입 & 지출 증빙',
      icon: <Receipt size={24} />,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      badge: user && taxSummary.pendingAmount > 0 
        ? `💰 미수금 ${taxSummary.pendingAmount.toLocaleString()}원` 
        : '💰 정산 완료',
      badgeStyle: user && taxSummary.pendingAmount > 0 
        ? { background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' } 
        : { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
      desc: '출강·작품 수입과 재료비 지출을 한눈에 관리하고, A4 지출 정산 증빙서를 인쇄 및 PDF로 저장합니다.',
      actionText: '가계부 열기'
    }
  ];

  return (
    <div className="dashboard-wrapper">
      {/* 1. 히어로 인트로 */}
      <section className="dashboard-hero">
        <h1 className="hero-quote">
          작가님은 오롯이 창작에만 몰입하세요.
        </h1>
        <p className="hero-sub">
          마음을 울린 영감의 기록부터 소중한 작품 보관까지, 세월이 흘러도 변치 않는 나만의 디지털 수장고에서 안전하게 관리하세요.
        </p>
      </section>

      {/* 2. [메인 무대 최상단 전진 배치] 나의 작품 디지털 수장고 */}
      <div className="archive-board-section" style={{ marginTop: '1.25rem' }}>
        <div className="archive-board-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="archive-board-title">
                📁 {user?.name ? `${user.name} 작가님의 수장고` : '나의 작품 디지털 수장고'}
              </span>
              <span className="archive-board-count">
                총 {artworks.length}점 보관 중
              </span>
            </div>
            <p style={{ fontSize: '0.83rem', color: '#64748B', margin: '4px 0 0 0' }}>
              세월이 흘러도 변치 않는 {user?.name || '작가'}님만의 프라이빗 디지털 수장고. 작품을 클릭하면 상세 도록과 작가노트, 캡션을 바로 열람할 수 있습니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => onSelectView('statement')} 
              className="btn-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '5px' }}
              title="새 작품 등록 및 작가노트 작성을 시작합니다"
            >
              <Plus size={14} /> 새 작품 등록
            </button>
            <button 
              onClick={() => onSelectView('archive')} 
              className="archive-board-more-btn"
            >
              전체 수장고 열람 <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {artworks.length > 0 ? (
          <div className="archive-table-wrapper">
            <table className="archive-table">
              <thead>
                <tr>
                  <th style={{ width: '56px', textAlign: 'center' }}>작품</th>
                  <th>작품명</th>
                  <th>제작연도 / 규격</th>
                  <th>재료 및 기법</th>
                  <th>보관된 기록</th>
                  <th style={{ width: '90px', textAlign: 'right' }}>등록일</th>
                </tr>
              </thead>
              <tbody>
                {artworks.slice(0, 5).map((art) => (
                  <tr 
                    key={art.id} 
                    onClick={() => onSelectView('archive', art.id)}
                    style={{ cursor: 'pointer' }}
                    title="클릭하여 상세 도록 및 작가노트 열람"
                  >
                    <td style={{ textAlign: 'center' }}>
                      <div className="archive-mini-thumb">
                        {art.imageUrl ? (
                          <img src={art.imageUrl} alt={art.title} />
                        ) : (
                          <ImageIcon size={15} color="#94A3B8" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>《{art.title}》</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{art.artist || user?.name || '작가'}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 500 }}>{art.year}년</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '6px' }}>
                        ({art.size?.split('(')[0]?.trim() || art.size})
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {art.medium && art.medium.length > 20 ? art.medium.slice(0, 20) + '...' : art.medium || '-'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {art.statement && <span className="archive-badge badge-green">작가노트</span>}
                        {art.instaCaption && <span className="archive-badge badge-blue">인스타</span>}
                        {art.blogStory && <span className="archive-badge badge-purple">블로그</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '0.78rem', color: '#94A3B8' }}>
                      {art.createdAt || '최근'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div 
            className="archive-empty-box" 
            onClick={() => onSelectView('archive')}
            style={{
              padding: '2.5rem 1.5rem',
              background: '#FFFFFF',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '0.5rem'
            }}
          >
            <div style={{ width: '48px', height: '48px', margin: '0 auto 12px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={22} color="#64748B" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', margin: '0 0 6px 0' }}>
              {user?.name ? `${user.name} 작가님만의 프라이빗 수장고가 열렸습니다` : '아직 보관된 작품이 없습니다'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              소중한 첫 작품 사진과 기본 정보를 등록해 보세요.<br />
              미학적 작가노트, 전시 벽면 캡션, 인스타그램 피드 글까지 단정하게 정리해 드립니다.
            </p>
            <button 
              className="btn-primary" 
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectView('statement');
              }}
            >
              <Plus size={15} /> 첫 작품 등록하기
            </button>
          </div>
        )}
      </div>

      {/* 3. [하단 지원군] 창작 행정 & 비즈니스 비서 툴킷 */}
      <div className="section-headline" style={{ marginTop: '2.5rem' }}>
        <span>창작 행정 & 비즈니스 비서 도구</span>
        <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'none', fontWeight: 400 }}>
          카드를 눌러 바로 시작하세요
        </span>
      </div>

      <div className="tool-grid">
        {tools.map((tool) => (
          <div 
            key={tool.id} 
            className="tool-card" 
            onClick={() => onSelectView(tool.id)}
            role="button"
            tabIndex={0}
          >
            <div>
              <div className="tool-card-header">
                <div 
                  className="tool-card-icon"
                  style={{
                    background: tool.iconBg || 'var(--bg-subtle)',
                    color: tool.iconColor || 'var(--accent-black)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px'
                  }}
                >
                  {tool.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className="tool-tag">{tool.tag}</span>
                  {tool.badge && (
                    <span style={{ 
                      fontSize: '0.73rem', 
                      fontWeight: 600, 
                      padding: '2px 8px', 
                      borderRadius: '999px',
                      ...tool.badgeStyle
                    }}>
                      {tool.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="tool-card-body">
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
              </div>
            </div>
            <div className="tool-card-footer">
              <span>{tool.actionText}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        ))}

        {/* 5번째 모듈: 소소한 툴 추가 슬롯 */}
        <div 
          className="tool-card-placeholder" 
          onClick={onOpenNewToolModal}
          role="button"
          tabIndex={0}
        >
          <div className="placeholder-plus-circle">
            <Plus size={22} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
            새 도구 제안 & 작가 후기
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#9CA3AF', maxWidth: '200px' }}>
            필요한 기능 아이디어나 이용 소감을 남겨주세요. 수장고 로드맵과 작가 라운지에 반영됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
