import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Printer, 
  PenTool, 
  Lock, 
  FileText, 
  Share2, 
  ArrowRight,
  Eye,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function GuidePage({ onOpenLogin, onNavigateToAbout }) {
  // Q&A 아코디언 상태 관리 (첫 번째 질문 기본 오픈)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqList = [
    {
      q: '수장고(Sujango) 서비스는 정말 무료로 시작할 수 있나요?',
      a: '네, 그렇습니다! 기본 Free Artist 플랜으로 작품 30점 보관, AI 작가노트 생성, A4 전시 캡션(명패) 인쇄, 표준 계약서 및 간이 견적서 작성을 영구 무료로 자유롭게 이용하실 수 있습니다. 수백 기가바이트 단위의 원본 대용량 클라우드 금고나 무제한 보안 워터마크 링크가 필요하실 때만 Pro 또는 Studio 요금제로 업그레이드하시면 됩니다.'
    },
    {
      q: '등록한 작품 이미지의 저작권과 개인정보는 안전하게 보호되나요?',
      a: '100% 안전하게 보호됩니다. 수장고에 등록되는 모든 이미지, 작가노트, 정산 내역의 저작권과 소유권은 전적으로 작가님 본인에게 있습니다. 어떤 외부 기관이나 타인에게도 공개되지 않으며, 외부 AI 학습 데이터로 무단 활용되지 않는 프라이빗 암호화 보안 금고에 안전하게 보관됩니다.'
    },
    {
      q: '전시 캡션(명패) 출력은 일반 가정용·사무실 프린터로 바로 가능한가요?',
      a: '네, 일반 A4 프린터로 즉시 인쇄하실 수 있습니다! 갤러리나 미술관 벽면에 부착하는 국영문 표준 규격에 맞추어, 칼이나 가위로 자르기 좋은 정밀 절취선과 함께 원클릭으로 A4 용지에 꽉 차게 일괄 인쇄 및 PDF 저장이 가능합니다.'
    },
    {
      q: '클라이언트나 갤러리에 시안을 보낼 때 도용 위험을 어떻게 막아주나요?',
      a: '수장고의 [보안 시안 공유] 기능을 이용하시면, 원본 다운로드와 우클릭이 원천 차단되고 작가님의 텍스트 또는 로고 워터마크가 반투명하게 자동 합성된 7일 만료 전용 뷰어 링크가 생성됩니다. 클라이언트는 별도 가입 없이 스마트폰이나 PC에서 안전하게 작품 시안만 검토할 수 있습니다.'
    },
    {
      q: '다른 작가가 제 작품이나 판매 금액, 견적서 내용을 볼 수 있나요?',
      a: '절대 볼 수 없습니다. 수장고는 모든 회원(작가)의 데이터가 완벽히 독립 격리된 멀티 테넌트 보안 체계로 작동합니다. 오직 로그인하신 작가님 본인만이 본인의 수장고 대시보드와 서류를 열람하고 관리할 수 있습니다.'
    }
  ];

  return (
    <div className="guide-page-wrapper" style={{ background: '#FFFFFF', color: '#0F172A', minHeight: '80vh' }}>
      
      {/* 1. 히어로 헤더 */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '4.5rem 1.5rem 3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.4rem 0.95rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '1.5rem' }}>
          <BookOpen size={14} color="#0F172A" />
          <span>수장고 시각적 이용안내 & Q&A</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4.5vw, 2.85rem)', fontWeight: 700, lineHeight: 1.35, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 1.5rem' }}>
          복잡한 매뉴얼 대신,<br />
          눈으로 확인하는 수장고 이용안내
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto 2.5rem' }}>
          작품 등록부터 평론가급 작가노트 추출, 미술관 캡션 인쇄, 안전한 시안 전달까지.<br />
          단 3단계의 정갈한 흐름으로 창작 외의 모든 골칫거리를 해결해 드립니다.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenLogin('signup')}
            className="hero-primary-btn"
            style={{ padding: '0.85rem 1.8rem', fontSize: '0.96rem' }}
          >
            <Sparkles size={18} />
            수장고 시작하기
          </button>
          <button
            onClick={onNavigateToAbout}
            className="btn-outline"
            style={{ padding: '0.85rem 1.6rem', fontSize: '0.96rem', background: '#FFFFFF', borderColor: '#CBD5E1', color: '#334155', fontWeight: 600 }}
          >
            수장고 브랜드 스토리 보기 →
          </button>
        </div>
      </section>

      {/* 2. 직관적인 3단계 시작 가이드 (No Excuses, Clear 3 Steps) */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#64748B' }}>SIMPLE 3 STEPS</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: '#0F172A', marginTop: '0.5rem' }}>
              작가님이 따라 하실 수 있는 3단계 시작 순서
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Step 1 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.75rem', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: '#0F172A', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.6rem' }}>
                작품 사진과 규격 등록
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                스마트폰이나 카메라로 촬영한 작품 사진을 올리세요. 호수, 제작연도, 재료(Oil on canvas 등)를 입력하면 고화질 웹 최적화로 가볍고 안전하게 보관됩니다.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.75rem', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: '#0F172A', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.6rem' }}>
                AI 작가노트 & 캡션 추출
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                핵심 키워드 3개만 넣으면 미학 평론 작가노트와 SNS 해시태그가 자동 생성되며, 미술관 벽면 부착용 국영문 캡션(명패)이 A4 규격으로 완성됩니다.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.75rem', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: '#0F172A', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.6rem' }}>
                보안 시안 전송 & 서류 인쇄
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                반투명 워터마크가 적용된 7일 만료 링크로 클라이언트에게 도용 걱정 없이 시안을 전달하고, 표준 계약서와 전시 약력(CV)을 공문서로 인쇄하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 시각적 핵심 4대 기능 쇼케이스 (실물 그래픽 카드) */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#64748B' }}>VISUAL SHOWCASE</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.95rem', color: '#0F172A', marginTop: '0.5rem' }}>
            화면으로 미리 만나는 수장고 핵심 기능
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.5rem' }}>
            작업실에서 실제로 마주하게 될 수장고의 정갈한 화면을 미리 둘러보세요.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

          {/* 쇼케이스 1: AI 작가노트 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FDF4FF', color: '#A855F7', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                <PenTool size={14} /> AI 미학 평론 & SNS 스튜디오
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
                작품 키워드 3개로<br />평론가급 작가노트 완성
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
                공모전이나 도록에 실을 작가노트를 쓰느라 며칠씩 밤을 새우지 마세요. 
                작품의 핵심 정서와 재료를 입력하면, 미술 평론 규격의 미학 평론문과 인스타그램 감성 캡션, 추천 해시태그를 동시에 정갈하게 추출합니다.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#공모전 제출용 평론문</span>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#인스타 캡션 & 해시태그</span>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#블로그 전시 서문</span>
              </div>
            </div>

            {/* 시각적 목업 박스 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', fontFamily: 'var(--font-sans)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>미학 평론 작가노트 생성 시뮬레이션</span>
                <span style={{ fontSize: '0.72rem', background: '#059669', color: '#FFFFFF', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>완성</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <strong>입력 키워드:</strong> 푸른 여명, 침묵의 찰나, 유채 혼합재료
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem', color: '#1E293B', lineHeight: 1.6, fontStyle: 'italic' }}>
                "화면을 지배하는 짙푸른 색채는 침묵의 경계를 부유하는 작가의 내면적 사유를 투영한다. 덧칠된 물감의 층위는 시간의 무게를 머금고 있으며..."
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.74rem', color: '#0284C7' }}>
                <span>#새벽의경계</span> <span>#현대미술</span> <span>#아라작가</span> <span>#유화도록</span>
              </div>
            </div>
          </div>

          {/* 쇼케이스 2: A4 전시 캡션 출력기 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', color: '#0F172A', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                <Printer size={14} /> 미술관 벽면 명패 표준 출력기
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
                A4 표준 규격 국영문 캡션<br />절취선과 함께 원클릭 인쇄
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
                전시회 전날, 워드 파일로 글자 크기와 여백을 맞추느라 씨름할 필요가 없습니다. 
                국내 미술관과 아트페어 표준 규격에 맞추어 작품명, 영문명, 제작연도, 재료, 호수가 정렬된 명패를 A4 용지에 자르기 편한 점선과 함께 즉시 인쇄합니다.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#A4 6분할/8분할 절취선</span>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#국영문 병기 표준</span>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#PDF 원클릭 저장</span>
              </div>
            </div>

            {/* 시각적 목업 박스 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ border: '2px dashed #94A3B8', borderRadius: '8px', background: '#FFFFFF', padding: '1.5rem', textAlign: 'left', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '12px', background: '#475569', color: '#FFFFFF', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                  A4 절취선 표준 규격
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-serif)' }}>
                  새벽의 경계 (Boundary of Dawn)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                  김아라 (Ara Kim, b.1988)
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '10px' }}>
                  2026, 캔버스에 유채 (Oil on canvas), 116.8 × 91.0 cm (50호)
                </div>
                <div style={{ marginTop: '14px', borderTop: '1px solid #F1F5F9', paddingTop: '8px', fontSize: '0.75rem', color: '#94A3B8' }}>
                  수장고 디지털 아카이브 인증 No. SUJ-2026-0042
                </div>
              </div>
            </div>
          </div>

          {/* 쇼케이스 3: 보안 워터마크 & 시안 링크 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                <ShieldCheck size={14} /> 7일 만료 보안 시안 링크
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
                고화질 원본 도용 원천 방지,<br />투명 워터마크 안심 시안 전달
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
                클라이언트나 갤러리에 원본 이미지를 그대로 전송하기 불안하셨나요? 
                작가님의 이름이나 로고가 반투명하게 들어간 워터마크를 자동으로 합성하고, 우클릭 저장 방지와 7일 후 자동 만료되는 전용 시안 뷰어 링크로 안전하게 보낼 수 있습니다.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#텍스트/로고 2-Way 워터마크</span>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#7일 만료 보안 서명 링크</span>
                <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#475569' }}>#우클릭 및 다운로드 차단</span>
              </div>
            </div>

            {/* 시각적 목업 박스 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ background: '#1E293B', borderRadius: '10px', padding: '1.25rem', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                {/* 반투명 워터마크 시각 효과 */}
                <div style={{ position: 'absolute', top: '40%', left: '10%', transform: 'rotate(-25deg)', fontSize: '1.6rem', fontWeight: 900, color: 'rgba(255,255,255,0.18)', pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  © ARA KIM • CLIENT PREVIEW ONLY
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 700 }}>🔒 클라이언트 안심 뷰어</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>D-7일 후 자동 만료</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>작품 시안: 새벽의 경계 (50호)</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>원본 파일 다운로드가 비활성화된 보안 모드입니다.</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. 자주 묻는 질문 (FAQ / Q&A) 아코디언 섹션 */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#64748B' }}>FREQUENTLY ASKED QUESTIONS</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: '#0F172A', marginTop: '0.5rem' }}>
              수장고에 관해 자주 묻는 질문 (Q&A)
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '0.4rem' }}>
              작가님들이 가장 궁금해하시는 핵심 질문들을 정갈하게 모았습니다.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {faqList.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s ease',
                    boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#0284C7', fontWeight: 800, fontSize: '1.05rem' }}>Q.</span>
                      <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.4 }}>
                        {item.q}
                      </span>
                    </div>
                    <div style={{ color: '#64748B', flexShrink: 0 }}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.35rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.75, margin: 0 }}>
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. 최하단 최종 회원가입 전환 CTA */}
      <section style={{ maxWidth: '860px', margin: '4rem auto 5rem', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '3.5rem 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', background: '#F1F5F9', color: '#0F172A', marginBottom: '1.25rem' }}>
            <Sparkles size={24} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem' }}>
            지금 등록하고 나만의 첫 번째 디지털 도록을 완성해 보세요.
          </h2>

          <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2.25rem' }}>
            복잡한 절차 없이 간편하게 시작할 수 있습니다.<br />
            세월이 흘러도 변치 않는 프라이빗 수장고가 작가님의 창작 여정을 든든하게 지켜드립니다.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenLogin('signup')}
              className="hero-primary-btn"
              style={{ padding: '0.9rem 2rem', fontSize: '0.98rem' }}
            >
              <Sparkles size={18} />
              수장고 무료 회원가입 완료
            </button>
            <button
              onClick={() => onOpenLogin('login')}
              className="btn-outline"
              style={{ padding: '0.9rem 1.6rem', fontSize: '0.96rem', background: '#FFFFFF', borderColor: '#CBD5E1', color: '#334155', fontWeight: 600 }}
            >
              기존 계정으로 로그인
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
