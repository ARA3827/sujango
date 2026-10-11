import React from 'react';
import { 
  FileText, 
  PenTool, 
  Receipt, 
  Tag, 
  Plus, 
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Dashboard({ 
  onSelectView, 
  taxSummary = { totalIncome: 0, pendingAmount: 0 },
  captionCount = 3,
  onOpenNewToolModal
}) {
  const tools = [
    {
      id: 'doc',
      title: '서류·출강 스튜디오',
      tag: '행정 서류',
      icon: <FileText size={22} />,
      desc: '출강 강의계획서, 미술계 표준 전시 약력(CV), 예술 작업 간이 견적서를 공문서 규격으로 자동 완성합니다.',
      actionText: '서류 작성하기'
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
      id: 'tax',
      title: '예술소득 & 3.3% 정산소',
      tag: '세금 & 정산',
      icon: <Receipt size={22} />,
      desc: '출강비 3.3%, 특강 기타소득 8.8%, 갤러리 위탁판매 실수령액을 자동 계산하고 미수금과 5월 종합소득세를 관리합니다.',
      actionText: '장부 확인하기'
    },
    {
      id: 'caption',
      title: '전시 캡션 네임택 출력기',
      tag: '전시 & 아트페어',
      icon: <Tag size={22} />,
      desc: '작품 옆 벽면에 붙이는 국영문 표준 캡션(명패)을 자동 생성하고, 자르기 좋은 절취선과 함께 A4 용지 규격으로 일괄 인쇄합니다.',
      actionText: '캡션 명패 만들기'
    }
  ];

  return (
    <div className="dashboard-wrapper">
      {/* 1. 히어로 인트로 */}
      <section className="dashboard-hero">
        <h1 className="hero-quote">
          오롯이 작업에만 몰입하세요.<br />
          서류, 세금, SNS 행정은 아트플로우가 대신합니다.
        </h1>
        <p className="hero-sub">
          복잡한 로그인과 API 연동 없이, 1인 창작자에게 꼭 필요한 도구를 한곳에서 간편하게 복사하고 출력하세요.
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

        <div className="stat-item-box" onClick={() => onSelectView('doc')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">행정 서류 원클릭 빌더</div>
          <div className="stat-value" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={20} /> 서류 3종 지원
          </div>
          <div className="stat-sub">
            강의계획서 • 작가 CV • 간이 견적서
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
    </div>
  );
}
