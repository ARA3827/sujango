import React, { useState, useEffect } from 'react';
import { 
  X, 
  Palette, 
  HelpCircle, 
  BookOpen, 
  Mail
} from 'lucide-react';

/**
 * 수장고 소개, 3단계 이용안내, 자주 묻는 질문(FAQ)
 * 조각난 박스 없이 단일 화이트 페이지에 텍스트 중심으로 정갈하게 출력되는 안내 모달
 */
export default function InfoModal({ isOpen, onClose, initialTab = 'about', onOpenPricing }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '580px', 
          width: '94%', 
          background: '#FFFFFF', 
          borderRadius: '16px', 
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 모달 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={20} color="#0F172A" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              수장고 (Sujango) 안내
            </h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 심플 언더라인 3대 탭 메뉴 */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 1.5rem', background: '#FAFAFA' }}>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
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
              fontSize: '0.88rem',
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
            <span>이용안내</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
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
            <span>자주 묻는 질문</span>
          </button>
        </div>

        {/* 단일 화이트 용지 텍스트 본문 (박스 잔치 완전 제거) */}
        <div style={{ padding: '1.75rem 1.75rem 1.5rem', background: '#FFFFFF', minHeight: '320px' }}>
          
          {/* TAB 1. 수장고 소개 */}
          {activeTab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#334155', lineHeight: 1.65, fontSize: '0.88rem' }}>
              <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                1인 창작 예술가를 위한 프라이빗 수장고
              </div>
              
              <p style={{ margin: 0, color: '#475569' }}>
                국보와 명작을 귀하게 모시는 국립 미술관의 지하 금고를 <strong>'수장고'</strong>라고 부릅니다.
                수장고(Sujango)는 예술가가 오직 창작에만 몰입할 수 있도록, 번거로운 행정 서류와 도록 보관을 정갈하게 정리해 주는 1인 창작자 전용 프라이빗 비서입니다.
              </p>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <strong style={{ color: '#0F172A' }}>• 워터마크 안심 보안 링크</strong>
                  <div style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '2px', paddingLeft: '12px' }}>
                    클라이언트나 갤러리에 시안을 보낼 때 1080px 워터마크가 찍힌 7일 만료 링크로 원본 도용을 방지합니다.
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#0F172A' }}>• 전시 캡션 명패 A4 일괄 인쇄</strong>
                  <div style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '2px', paddingLeft: '12px' }}>
                    치수 측정과 칼질 없이 공공 전시 규격의 캡션을 A4 단일 시트로 즉시 출력합니다.
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#0F172A' }}>• 3.3% 원천징수 정산 & 행정 서식</strong>
                  <div style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '2px', paddingLeft: '12px' }}>
                    출강 계획서, 표준 CV 약력, 사업소득세 원천징수 실수령액 장부를 자동으로 정리합니다.
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#0F172A' }}>• 작가 저작권 100% 본인 귀속</strong>
                  <div style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '2px', paddingLeft: '12px' }}>
                    업로드된 모든 작품과 글의 저작권은 전적으로 작가 본인에게 귀속되며 상업적 무단 활용이 없습니다.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2. 3단계 이용안내 */}
          {activeTab === 'guide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', color: '#334155', lineHeight: 1.6, fontSize: '0.88rem' }}>
              <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                수장고 3단계 빠른 이용 순서
              </div>

              <div>
                <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>1단계: 작품 등록 & 아카이빙</strong>
                <p style={{ margin: '3px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                  스마트폰이나 PC에 보관 중인 작품 사진을 올리고 작품명, 재료, 호수 규격을 등록합니다. 기본 30점까지 내 컴퓨터 브라우저에 안전하게 무료 저장됩니다.
                </p>
              </div>

              <div>
                <strong style={{ color: '#0284C7', fontSize: '0.92rem' }}>2단계: 워터마크 보안 링크 생성</strong>
                <p style={{ margin: '3px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                  작품 목록에서 [보안 링크]를 누르면 1080px 웹용 워터마크가 합성된 7일 만료 링크가 생성됩니다. 갤러리나 클라이언트 미팅 시 안심하고 링크만 전달하세요.
                </p>
              </div>

              <div>
                <strong style={{ color: '#059669', fontSize: '0.92rem' }}>3단계: 전시 캡션 A4 일괄 인쇄</strong>
                <p style={{ margin: '3px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                  전시회를 앞두고 계실 때 [전시 캡션 스튜디오]에서 출품할 작품들을 선택하고 [A4 단일 PDF 출력]을 누르면 전시용 명패 캡션이 한 번에 깔끔하게 출력됩니다.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3. 자주 묻는 질문 (FAQ) */}
          {activeTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', color: '#334155', lineHeight: 1.6, fontSize: '0.88rem' }}>
              <div>
                <strong style={{ color: '#0F172A' }}>Q. 업로드한 제 작품의 저작권은 누구에게 있나요?</strong>
                <p style={{ margin: '3px 0 0 0', color: '#64748B', fontSize: '0.84rem' }}>
                  <strong>100% 작가 본인에게 귀속됩니다.</strong> 수장고는 작가님의 작품 이미지를 외부 AI 학습이나 상업적 용도로 일절 사용하지 않으며 프라이빗 데이터 주권을 철저히 지킵니다.
                </p>
              </div>

              <div>
                <strong style={{ color: '#0F172A' }}>Q. 무료 플랜을 쓰다가 컴퓨터를 바꾸면 어떻게 되나요?</strong>
                <p style={{ margin: '3px 0 0 0', color: '#64748B', fontSize: '0.84rem' }}>
                  <strong>'단일 JSON 백업' 기능으로 안전하게 이동할 수 있습니다.</strong> 기기를 교체하기 전 [내 수장고 백업]으로 파일을 저장한 후 새 PC에서 복원하시면 그대로 유지됩니다.
                </p>
              </div>

              <div>
                <strong style={{ color: '#0F172A' }}>Q. 보안 링크의 유효기간이 왜 7일인가요?</strong>
                <p style={{ margin: '3px 0 0 0', color: '#64748B', fontSize: '0.84rem' }}>
                  시안 유출과 무단 전재를 차단하기 위한 예술계 표준 보호 조치입니다. 검토 기간이 지나면 링크가 자동 무효화되어 외부 유출 걱정이 없습니다.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* 모달 하단 푸터 (단정하게 정돈) */}
        <div style={{ padding: '0.9rem 1.5rem', borderTop: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94A3B8' }}>
            <Mail size={13} />
            <span>support@araagentlab.com</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-outline" 
            style={{ padding: '0.4rem 1.1rem', fontSize: '0.84rem', fontWeight: 600 }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
