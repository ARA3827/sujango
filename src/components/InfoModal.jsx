import React from 'react';
import { 
  X, 
  Palette, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  FileText, 
  Printer, 
  Sparkles,
  Mail,
  Building
} from 'lucide-react';

/**
 * 수장고 소개, 3단계 이용안내, 자주 묻는 질문(FAQ)을
 * 2-Depth 탭으로 품격 있게 보여주는 다목적 모달
 */
export default function InfoModal({ isOpen, onClose, initialTab = 'about', onOpenPricing, onOpenFeedback }) {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px', width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* 모달 상단 헤더 */}
        <div className="modal-header" style={{ paddingBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={20} color="#0F172A" />
              <h3 className="modal-title">수장고 (Sujango) 안내 센터</h3>
            </div>
            <p className="modal-subtitle">1인 창작 예술가를 위한 프라이빗 수장고 & AI 행정 비서</p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 2-Depth 3대 탭 메뉴 */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 1.5rem', background: '#F8FAFC', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.86rem',
              fontWeight: activeTab === 'about' ? 700 : 500,
              color: activeTab === 'about' ? '#0F172A' : '#64748B',
              borderBottom: activeTab === 'about' ? '2px solid #0F172A' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Palette size={15} />
            <span>수장고 소개</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.86rem',
              fontWeight: activeTab === 'guide' ? 700 : 500,
              color: activeTab === 'guide' ? '#0F172A' : '#64748B',
              borderBottom: activeTab === 'guide' ? '2px solid #0F172A' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={15} />
            <span>이용안내 (3단계)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.86rem',
              fontWeight: activeTab === 'faq' ? 700 : 500,
              color: activeTab === 'faq' ? '#0F172A' : '#64748B',
              borderBottom: activeTab === 'faq' ? '2px solid #0F172A' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={15} />
            <span>자주 묻는 질문 (FAQ)</span>
          </button>
        </div>

        {/* 탭 본문 내용 (스크롤 가능 영역) */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          
          {/* TAB 1. 수장고 소개 */}
          {activeTab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                  🏛️ 왜 '수장고(Sujango)' 인가요?
                </h4>
                <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  국보와 명작을 귀하게 모시는 국립 미술관의 지하 금고를 <strong>수장고</strong>라고 부릅니다.<br />
                  수장고는 1인 창작 예술가가 창작에만 100% 몰입할 수 있도록, 
                  <strong>작품 아카이빙, 원본 도용 방지 보안 공유, 전시 캡션 일괄 출력, 3.3% 원천징수 정산 장부</strong>까지 모든 행정 부담을 덜어주는 프라이빗 디지털 금고입니다.
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                  수장고의 3대 핵심 가치
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem' }}>
                    <ShieldCheck size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>안심 보안 공유 (2-Way 워터마크)</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', lineHeight: 1.5 }}>
                        클라이언트나 갤러리에 시안을 보낼 때 워터마크가 찍힌 7일 만료 링크로 원본 도용을 원천 차단합니다.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem' }}>
                    <Printer size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>전시 캡션 A4 일괄 인쇄</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', lineHeight: 1.5 }}>
                        칼질하고 치수 재는 번거로움 없이, 공공 규격 명패 캡션을 A4 단일 시트로 즉시 인쇄합니다.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem' }}>
                    <FileText size={20} color="#7C3AED" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>작가 행정 & 세무 비서</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', lineHeight: 1.5 }}>
                        출강 계획서, 표준 CV 약력, 3.3% 사업소득 원천징수 실지급액 정산 장부를 깔끔하게 관리합니다.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>운영사: Ara Agent Lab (김아라)</span>
                {onOpenPricing && (
                  <button 
                    onClick={() => { onClose(); onOpenPricing(); }}
                    className="btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', color: '#0284C7', borderColor: '#0284C7' }}
                  >
                    요금제 자세히 보기 →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2. 3단계 이용안내 */}
          {activeTab === 'guide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0 }}>
                복잡한 학습 없이, 아래 3단계 행동 순서대로 따라 하시면 수장고를 손쉽게 활용하실 수 있습니다.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 1단계 */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#0F172A', color: '#FFFFFF', width: '22px', height: '22px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                      1
                    </span>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      작품 등록 & 디지털 아카이빙
                    </h5>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0, paddingLeft: '30px' }}>
                    작품 사진(또는 스마트폰 앨범 사진)을 업로드하고 작품명, 재료, 호수 규격을 등록합니다. 
                    기본 30점까지 내 PC 브라우저에 안전하게 보관됩니다.
                  </p>
                </div>

                {/* 2단계 */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#0284C7', color: '#FFFFFF', width: '22px', height: '22px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                      2
                    </span>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      워터마크 보안 링크 생성 & 시안 전달
                    </h5>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0, paddingLeft: '30px' }}>
                    등록된 작품에서 [보안 링크]를 누르면, 1080px 웹용 워터마크가 찍힌 <strong>7일 만료 링크(선택적 4자리 PIN 잠금)</strong>가 생성됩니다. 클라이언트나 갤러리에 원본 도용 걱정 없이 링크만 전달하세요.
                  </p>
                </div>

                {/* 3단계 */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#059669', color: '#FFFFFF', width: '22px', height: '22px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                      3
                    </span>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      전시 캡션 일괄 인쇄 & 서식 완성
                    </h5>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0, paddingLeft: '30px' }}>
                    전시회를 앞두고 계신가요? [전시 캡션 스튜디오]에서 전시할 작품들을 체크하고 <strong>A4 단일 PDF 출력</strong> 버튼만 누르면 명패 규격의 깔끔한 캡션이 즉시 완성됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3. 자주 묻는 질문 (FAQ) */}
          {activeTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  Q. 업로드한 제 작품의 저작권은 누구에게 귀속되나요?
                </div>
                <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  <strong>A. 100% 작가 본인에게 귀속됩니다.</strong><br />
                  수장고는 작가님의 소중한 작품 이미지를 외부 학습이나 상업적 용도로 일절 사용하지 않으며, 전적으로 작가님의 프라이빗 데이터 주권을 보장합니다.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  Q. 무료 플랜을 쓰다가 컴퓨터를 바꾸면 데이터가 사라지나요?
                </div>
                <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  <strong>A. 사라지지 않습니다. '단일 JSON 백업' 기능을 지원합니다.</strong><br />
                  무료 플랜은 브라우저에 안전 저장되므로, 기기를 교체하기 전 [내 수장고 백업] 버튼을 눌러 JSON 파일을 다운로드한 후 새 기기에서 복원하시면 그대로 유지됩니다. (Pro 이상은 클라우드 자동 동기화 지원)
                </p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  Q. 7일 만료 보안 링크는 왜 7일인가요?
                </div>
                <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  <strong>A. 시안 유출 및 무단 도용을 방지하기 위한 예술계 표준 보호 조치입니다.</strong><br />
                  갤러리나 클라이언트와의 검토 기간(보통 3~7일)이 지나면 링크가 자동 만료되어, 외부로 웹 링크가 재유포되더라도 원본 시안을 열람할 수 없도록 원천 보호합니다.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  Q. 서비스 개선 아이디어나 필요한 도구는 어디로 건의하나요?
                </div>
                <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  <strong>A. 상단 메뉴의 [새 도구 아이디어 & 후기]를 통해 언제든 제안하실 수 있습니다.</strong><br />
                  남겨주신 작가님들의 현장 목소리는 수장고 개발 로드맵에 최우선 순위로 반영됩니다.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* 모달 하단 푸터 */}
        <div style={{ padding: '0.9rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B' }}>
            <Mail size={13} />
            <span>문의: support@araagentlab.com</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-outline" 
            style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
