import React from 'react';
import { 
  Palette, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight,
  UserCheck,
  Feather,
  Layers,
  Award
} from 'lucide-react';

export default function AboutPage({ onOpenLogin, onNavigateToGuide }) {
  return (
    <div className="about-page-wrapper" style={{ background: '#FFFFFF', color: '#0F172A', minHeight: '80vh' }}>
      
      {/* 1. 히어로 브랜드 스토리 */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '4.5rem 1.5rem 3.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.4rem 0.95rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '1.5rem' }}>
          <Palette size={14} color="#0F172A" />
          <span>수장고(Sujango) 브랜드 스토리 & 창작 철학</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4.5vw, 2.85rem)', fontWeight: 700, lineHeight: 1.35, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 1.5rem' }}>
          작가는 왜 창작보다<br />
          행정과 보관에 더 지쳐야 할까요?
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto 2.5rem' }}>
          물감 냄새 가득한 아틀리에에서 홀로 밤을 지새우는 1인 예술가.<br />
          정작 세상과 마주할 때는 낯선 계약서, 번거로운 전시 캡션 작업, 흩어진 작품 사진에 발목을 잡힙니다.<br />
          <strong>수장고(Sujango)</strong>는 예술가가 오롯이 창작에만 몰입할 수 있도록 탄생했습니다.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenLogin('signup')}
            className="hero-primary-btn"
            style={{ padding: '0.85rem 1.8rem', fontSize: '0.96rem' }}
          >
            <Sparkles size={18} />
            나만의 수장고 무료로 시작하기
          </button>
          <button
            onClick={onNavigateToGuide}
            className="btn-outline"
            style={{ padding: '0.85rem 1.6rem', fontSize: '0.96rem', background: '#FFFFFF', borderColor: '#CBD5E1', color: '#334155', fontWeight: 600 }}
          >
            기능 및 이용안내 둘러보기 →
          </button>
        </div>
      </section>

      {/* 2. 창작자가 겪어온 4대 현실적 결핍 */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#64748B' }}>REAL PROBLEM</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', color: '#0F172A', marginTop: '0.5rem' }}>
              1인 창작 예술가가 홀로 감당해 온 고충들
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* 고충 1 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ color: '#E11D48', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>01. 작품 유실과 화질 저하</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem' }}>SNS와 외장하드의 한계</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                SNS에 올린 사진은 강제로 해상도가 뭉개져 도록 인쇄에 쓸 수 없고, 외장하드는 갑작스러운 고장이나 분실에 무방비합니다.
              </p>
            </div>

            {/* 고충 2 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ color: '#E11D48', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>02. 낯선 미술계 행정 서류</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem' }}>양식조차 막막한 계약과 출강</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                미술관 표준 계약서, 출강 계획서, 작품 견적서 작성에 몇 시간씩 소모하며 정작 붓을 잡을 에너지를 뺏깁니다.
              </p>
            </div>

            {/* 고충 3 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ color: '#E11D48', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>03. 전시 캡션 수작업의 번거로움</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem' }}>전시 직전의 피로감</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                전시장 벽면에 붙이는 국영문 명패(캡션)를 워드로 일일이 줄 맞추고 출력하며 전날 밤을 꼬박 새우기 일쑤입니다.
              </p>
            </div>

            {/* 고충 4 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ color: '#E11D48', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>04. 무단 도용에 대한 불안</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem' }}>시안 전송 시의 저작권 노출</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                클라이언트나 갤러리에 원본 사진을 메일로 보낼 때마다 이미지 무단 도용이나 복제 위험에 늘 가슴을 졸여야 했습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 수장고(Sujango)의 3대 핵심 가치 */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#64748B' }}>CORE VALUES</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', color: '#0F172A', marginTop: '0.5rem' }}>
            수장고가 창작자에게 드리는 3가지 약속
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* 가치 1 */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem' }}>
            <div style={{ background: '#F1F5F9', padding: '1rem', borderRadius: '12px', color: '#0F172A', flexShrink: 0 }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.6rem' }}>
                1. 100% 작가 자주권 & 프라이빗 독립 금고
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                수장고는 타인에게 작품을 강제로 공개하는 오픈 마켓이 아닙니다. 
                오직 작가님 본인만이 열 수 있는 독립된 디지털 금고로 운영되며, 등록하신 모든 작품과 자료의 저작권은 온전히 작가님께 보존됩니다.
              </p>
            </div>
          </div>

          {/* 가치 2 */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem' }}>
            <div style={{ background: '#F1F5F9', padding: '1rem', borderRadius: '12px', color: '#0F172A', flexShrink: 0 }}>
              <Feather size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.6rem' }}>
                2. 미술 행정을 대신하는 전담 AI 행정 비서
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                작품 키워드 3개만 넣으면 평론가 수준의 심층 작가노트와 인스타그램 캡션을 완성하고, 
                벽면 전시 캡션(명패)을 A4 표준 규격으로 일괄 인쇄합니다. 행정에 쏟던 시간을 다시 창작의 시간으로 되돌려 드립니다.
              </p>
            </div>
          </div>

          {/* 가치 3 */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem' }}>
            <div style={{ background: '#F1F5F9', padding: '1rem', borderRadius: '12px', color: '#0F172A', flexShrink: 0 }}>
              <HeartHandshake size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.6rem' }}>
                3. 중개 수수료 0원, 예술가의 지속 가능한 자립
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                화랑이나 중개 플랫폼의 과도한 판매 수수료에서 벗어나, 작가님이 주체적으로 클라이언트와 계약하고 견적을 주고받을 수 있도록 돕습니다.
                1인 예술가의 안정적인 자립이 곧 문화의 힘입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 운영진 비전 (Ara Agent Lab) */}
      <section style={{ background: '#0F172A', color: '#FFFFFF', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
            <span>Ara Agent Lab • Sujango Project</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 700, lineHeight: 1.4, margin: '0 0 1.25rem' }}>
            "작가가 행복해야 세상이 더 아름다워집니다."
          </h2>

          <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.8, margin: '0 auto 2.5rem', maxWidth: '640px' }}>
            수장고는 1인 예술가 한 분 한 분의 아틀리에를 기술로 따뜻하게 돕고자 시작되었습니다.<br />
            복잡한 관리와 행정은 수장고에 맡겨두시고, 작가님께서는 오늘 밤도 마음껏 붓을 들고 캔버스를 채워주세요.
          </p>

          <button
            onClick={() => onOpenLogin('signup')}
            style={{
              padding: '0.9rem 2.2rem',
              fontSize: '0.98rem',
              fontWeight: 700,
              background: '#FFFFFF',
              color: '#0F172A',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}
          >
            <Sparkles size={18} color="#0F172A" />
            무료 회원가입으로 나만의 수장고 열기
          </button>
        </div>
      </section>

    </div>
  );
}
