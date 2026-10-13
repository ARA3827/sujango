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

export default function Dashboard({ 
  onSelectView, 
  taxSummary = { totalIncome: 0, pendingAmount: 0 },
  captionCount = 3,
  onOpenNewToolModal
}) {
  const [artworks, setArtworks] = useState([]);
  const [inspoCount, setInspoCount] = useState(() => {
    try {
      const saved = localStorage.getItem('sujango_inspo_vault_v1');
      if (saved) return JSON.parse(saved).length;
    } catch (e) {}
    return 0;
  });

  useEffect(() => {
    setArtworks(getArtworks());
    try {
      const saved = localStorage.getItem('sujango_inspo_vault_v1');
      if (saved) setInspoCount(JSON.parse(saved).length);
    } catch (e) {}
  }, []);

  const tools = [
    {
      id: 'inspo',
      title: '영감노트/밑줄',
      tag: '창작 영감 & 문장',
      icon: <Sparkles size={22} style={{ color: '#059669' }} />,
      desc: '책 속 한 줄, 영화 속 명대사, 일상의 번뜩이는 사유를 카드로 아카이빙하고 카카오톡 대화를 1초 만에 파싱합니다.',
      actionText: '영감노트 열기'
    },
    {
      id: 'statement',
      title: '작가노트 & SNS OSMU',
      tag: '원소스 멀티유즈',
      icon: <PenTool size={22} />,
      desc: '작품 키워드 3개로 공모전용 심층 미학 평론 작가노트, 인스타 감성 캡션 + 해시태그, 블로그 후기를 동시에 추출하고 직접 수정합니다.',
      actionText: '콘텐츠 생성하기'
    },
    {
      id: 'caption',
      title: '전시 캡션 네임택 출력기',
      tag: '전시 & 아트페어',
      icon: <Tag size={22} />,
      desc: '작품 옆 벽면에 붙이는 국영문 표준 캡션(명패)을 자동 생성하고, 자르기 좋은 절취선과 함께 A4 용지 규격으로 일괄 인쇄합니다.',
      actionText: '캡션 명패 만들기'
    },
    {
      id: 'doc',
      title: '서류·출강 스튜디오',
      tag: '행정 서류',
      icon: <FileText size={22} />,
      desc: '출강 강의계획서, 미술계 표준 전시 약력(CV), 예술 작업 간이 견적서를 공문서 규격으로 자동 완성합니다.',
      actionText: '서류 작성하기'
    },
    {
      id: 'tax',
      title: '예술소득 & 3.3% 정산소',
      tag: '세금 & 정산',
      icon: <Receipt size={22} />,
      desc: '출강비 3.3%, 특강 기타소득 8.8%, 갤러리 위탁판매 실수령액을 자동 계산하고 미수금과 5월 종합소득세를 관리합니다.',
      actionText: '장부 확인하기'
    }
  ];

  return (
    <div className="dashboard-wrapper">
      {/* 1. 히어로 인트로 */}
      <section className="dashboard-hero">
        <h1 className="hero-quote">
          오롯이 작업에만 몰입하세요.<br />
          서류, 세금, SNS 행정은 수장고(Sujango)가 대신합니다.
        </h1>
        <p className="hero-sub">
          창작자를 위한 프라이빗 디지털 수장고. 꼭 필요한 도구를 한곳에서 간편하게 복사하고 출력하세요.
        </p>
      </section>

      {/* 2. 빠른 상태 요약 스트립 (3-Stat Strip) */}
      <div className="dashboard-stats-strip">
        <div className="stat-item-box" onClick={() => onSelectView('tax')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">이번 달 확인된 미수금</div>
          <div className="stat-value" style={{ color: taxSummary.pendingAmount > 0 ? '#D97706' : '#111827' }}>
            {taxSummary.pendingAmount.toLocaleString()}원
          </div>
          <div className="stat-sub">
            {taxSummary.pendingAmount > 0 ? '입금 확인 필요한 항목 있음' : '모든 정산 완료'}
          </div>
        </div>

        <div className="stat-item-box" onClick={() => onSelectView('caption')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">준비된 전시 캡션 명패</div>
          <div className="stat-value" style={{ color: '#0F172A' }}>
            {captionCount}점 보관 중
          </div>
          <div className="stat-sub">
            A4 절취선 일괄 인쇄 준비 완료
          </div>
        </div>

        <div className="stat-item-box" onClick={() => onSelectView('archive')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">📁 내 작품 디지털 수장고</div>
          <div className="stat-value" style={{ color: '#0284C7' }}>
            {artworks.length}점 보관 중
          </div>
          <div className="stat-sub">
            사진 • 작가노트 영구 보존
          </div>
        </div>

        <div className="stat-item-box" onClick={() => onSelectView('doc')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">행정 서류 공문서 빌더</div>
          <div className="stat-value" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={20} /> 서류 3종 지원
          </div>
          <div className="stat-sub">
            강의계획서 • 작가 CV • 간이 견적서
          </div>
        </div>

        <div className="stat-item-box" onClick={() => onSelectView('inspo')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">✨ 영감노트/밑줄 보관함</div>
          <div className="stat-value" style={{ color: '#0D9488' }}>
            {inspoCount}개 보관 중
          </div>
          <div className="stat-sub">
            문장 카드 • 카톡 1초 파싱
          </div>
        </div>
      </div>

      {/* 3. 4대 핵심 도구 그리드 */}
      <div className="section-headline">
        <span>핵심 워크스페이스 도구</span>
        <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'none', fontWeight: 400 }}>
          클릭 시 2-Depth 상세 작업공간으로 진입합니다
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
                <div className="tool-card-icon">{tool.icon}</div>
                <span className="tool-tag">{tool.tag}</span>
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
            새 도구 추가 / 아이디어
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#9CA3AF', maxWidth: '200px' }}>
            필요한 소소한 기능이 떠오르면 언제든 여기에 추가하고 확장하세요.
          </p>
        </div>
      </div>

      {/* 4. 나의 작품 아카이브 서고 (1-Depth 슬림 게시판) */}
      <div className="archive-board-section">
        <div className="archive-board-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="archive-board-title">📁 나의 작품 디지털 수장고</span>
              <span className="archive-board-count">총 {artworks.length}점 보관 중</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0 0' }}>
              세월이 흘러도 변치 않는 나만의 프라이빗 디지털 수장고. 사진을 클릭하면 상세 도록과 작가노트, 캡션을 열람할 수 있습니다.
            </p>
          </div>
          <button 
            onClick={() => onSelectView('archive')} 
            className="archive-board-more-btn"
          >
            전체 수장고 열람 <ArrowRight size={14} />
          </button>
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
                    onClick={() => onSelectView('archive')}
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
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{art.artist || '김아라'}</div>
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
          <div className="archive-empty-box" onClick={() => onSelectView('archive')}>
            <p>아직 등록된 작품이 없습니다. 클릭하여 첫 작품 사진과 작가노트를 등록해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
