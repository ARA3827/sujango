import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

async function prerender() {
  console.log('[Prerender] Starting static HTML prerendering for public pages...');

  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html does not exist. Run vite build first.');
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf8');

  // =========================================================================
  // 1. 메인 랜딩 페이지 프리렌더링 (dist/index.html)
  // =========================================================================
  const landingSemanticContent = `
    <header class="main-header" style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: 'Noto Serif KR', serif; font-size: 1.25rem; font-weight: 700; color: #0F172A;">수장고 Sujango</span>
      </div>
      <nav style="display: flex; gap: 1rem; align-items: center;">
        <a href="/about" style="color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 500;">수장고 소개</a>
        <a href="/guide" style="color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 500;">이용안내 &amp; FAQ</a>
      </nav>
    </header>

    <main class="landing-wrapper">
      <section class="landing-hero" style="padding: 4rem 1.5rem 3rem; text-align: center; max-width: 960px; margin: 0 auto;">
        <div style="display: inline-flex; align-items: center; gap: 6px; background: #FEF3C7; color: #92400E; padding: 0.35rem 0.85rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; margin-bottom: 1.25rem;">
          <span>✨ 1인 창작자를 위한 프라이빗 수장고</span>
        </div>
        <h1 style="font-family: 'Noto Serif KR', serif; font-size: 2.75rem; font-weight: 700; color: #0F172A; line-height: 1.35; margin-bottom: 1.25rem; letter-spacing: -0.02em;">
          작가의 소중한 기록과 원본을<br />가장 안전하게 지키는 나만의 수장고
        </h1>
        <p style="font-size: 1.1rem; color: #475569; line-height: 1.8; max-width: 680px; margin: 0 auto 2.5rem;">
          고해상도 원본 보관부터 작가노트, 전시 캡션, 출강 서류, 수입·지출 정리까지.<br />
          복잡한 미술 행정은 수장고에 맡기고, 작가님은 오롯이 창작에만 몰입하세요.
        </p>
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 3.5rem;">
          <a href="/#landing" style="display: inline-flex; align-items: center; gap: 6px; background: #0F172A; color: #FFFFFF; padding: 0.85rem 1.8rem; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 0.96rem;">
            무료로 수장고 시작하기 →
          </a>
        </div>
      </section>

      <!-- 6대 핵심 창작 지원 도구 요약 -->
      <section style="background: #F8FAFC; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 4rem 1.5rem;">
        <div style="max-width: 1040px; margin: 0 auto;">
          <h2 style="font-family: 'Noto Serif KR', serif; font-size: 1.85rem; font-weight: 700; text-align: center; color: #0F172A; margin-bottom: 2.5rem;">
            창작자의 하루를 지탱하는 6대 전문 도구
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
            <article style="background: #FFFFFF; padding: 1.75rem; border-radius: 12px; border: 1px solid #E2E8F0;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">📁 무손실 원본 금고</h3>
              <p style="color: #64748B; font-size: 0.9rem; line-height: 1.6;">스마트폰·카메라 초고화질 사진을 압축 손실 없이 안전하게 영구 보관합니다.</p>
            </article>
            <article style="background: #FFFFFF; padding: 1.75rem; border-radius: 12px; border: 1px solid #E2E8F0;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">🏷️ 전시 캡션 출력기</h3>
              <p style="color: #64748B; font-size: 0.9rem; line-height: 1.6;">국영문 미술관 표준 규격 캡션을 원클릭으로 정렬하여 A4 규격 PDF로 출력합니다.</p>
            </article>
            <article style="background: #FFFFFF; padding: 1.75rem; border-radius: 12px; border: 1px solid #E2E8F0;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">✍️ AI 작가노트 스튜디오</h3>
              <p style="color: #64748B; font-size: 0.9rem; line-height: 1.6;">작품의 미학적 맥락을 살려 도록용 평론과 SNS 해시태그를 정돈해 드립니다.</p>
            </article>
            <article style="background: #FFFFFF; padding: 1.75rem; border-radius: 12px; border: 1px solid #E2E8F0;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">📑 출강·공모 서류 작성기</h3>
              <p style="color: #64748B; font-size: 0.9rem; line-height: 1.6;">출강 계획서, 표준 약력(CV), 간이 견적서 등 공문서를 규격에 맞게 자동 완성합니다.</p>
            </article>
            <article style="background: #FFFFFF; padding: 1.75rem; border-radius: 12px; border: 1px solid #E2E8F0;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">💰 창작 가계부 &amp; 정산서</h3>
              <p style="color: #64748B; font-size: 0.9rem; line-height: 1.6;">작품 판매 수익과 재료비 지출을 깔끔하게 정리하고 카드 영수증을 첨부합니다.</p>
            </article>
            <article style="background: #FFFFFF; padding: 1.75rem; border-radius: 12px; border: 1px solid #E2E8F0;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">🔒 안전 보안 모드</h3>
              <p style="color: #64748B; font-size: 0.9rem; line-height: 1.6;">도용 방지 워터마크 자동 합성과 안전한 단일 백업 파일(JSON)로 내 PC에 온전히 소유합니다.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  `;

  const prerenderedMain = baseHtml.replace('<div id="root"></div>', `<div id="root">${landingSemanticContent}</div>`);
  fs.writeFileSync(templatePath, prerenderedMain);
  console.log('✓ Prerendered Main Landing: dist/index.html');

  // =========================================================================
  // 2. 수장고 소개 페이지 프리렌더링 (dist/about/index.html)
  // =========================================================================
  const aboutDir = path.join(distDir, 'about');
  if (!fs.existsSync(aboutDir)) fs.mkdirSync(aboutDir, { recursive: true });

  const aboutSemanticContent = `
    <header class="main-header" style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <a href="/" style="font-family: 'Noto Serif KR', serif; font-size: 1.25rem; font-weight: 700; color: #0F172A; text-decoration: none;">수장고 Sujango</a>
      </div>
      <nav style="display: flex; gap: 1rem; align-items: center;">
        <a href="/" style="color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 500;">홈으로</a>
        <a href="/guide" style="color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 500;">이용안내 &amp; FAQ</a>
      </nav>
    </header>

    <main class="about-page-wrapper" style="max-width: 960px; margin: 0 auto; padding: 4.5rem 1.5rem 3.5rem; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 6px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.4rem 0.95rem; borderRadius: 999px; font-size: 0.82rem; font-weight: 600; color: #475569; margin-bottom: 1.5rem;">
        <span>수장고(Sujango) 브랜드 스토리 &amp; 창작 철학</span>
      </div>

      <h1 style="font-family: 'Noto Serif KR', serif; font-size: 2.85rem; font-weight: 700; line-height: 1.35; color: #0F172A; margin-bottom: 1.5rem;">
        작가는 왜 창작보다<br />행정과 보관에 더 지쳐야 할까요?
      </h1>

      <p style="font-size: 1.05rem; color: #475569; line-height: 1.8; max-width: 680px; margin: 0 auto 2.5rem;">
        물감 냄새 가득한 아틀리에에서 홀로 밤을 지새우는 1인 예술가.<br />
        정작 세상과 마주할 때는 낯선 계약서, 번거로운 전시 캡션 작업, 흩어진 작품 사진에 발목을 잡힙니다.<br />
        <strong>수장고(Sujango)</strong>는 예술가가 오롯이 창작에만 몰입할 수 있도록 탄생했습니다.
      </p>

      <section style="text-align: left; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 2.5rem; border-radius: 16px; margin-top: 3rem;">
        <h2 style="font-family: 'Noto Serif KR', serif; font-size: 1.6rem; font-weight: 700; color: #0F172A; margin-bottom: 1.5rem;">
          수장고가 지키는 3대 창작자 중심 원칙
        </h2>
        <ul style="color: #334155; line-height: 1.9; font-size: 1rem; padding-left: 1.25rem;">
          <li><strong>압축 없는 무손실 원본 보존:</strong> 작가님의 작품 원본은 1픽셀의 뭉개짐 없이 원형 그대로 지킵니다.</li>
          <li><strong>창작 주체성 존중:</strong> AI는 도울 뿐, 작가 고유의 문체와 예술관을 훼손하지 않습니다.</li>
          <li><strong>온전한 데이터 주권:</strong> 작가의 모든 데이터는 언제든 단일 JSON 파일로 내려받아 100% 소유할 수 있습니다.</li>
        </ul>
      </section>
    </main>
  `;

  let aboutHtml = baseHtml
    .replace('<title>수장고 Sujango | 1인 창작자를 위한 프라이빗 수장고</title>', '<title>수장고 소개 | 1인 창작자를 위한 프라이빗 수장고</title>')
    .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="작가는 왜 창작보다 행정과 보관에 더 지쳐야 할까요? 1인 예술가가 오롯이 창작에만 몰입할 수 있도록 돕는 수장고(Sujango)의 브랜드 스토리와 철학을 소개합니다."')
    .replace(/<meta property="og:title" content="[^"]*"/, '<meta property="og:title" content="수장고 소개 | 1인 창작자를 위한 프라이빗 수장고"')
    .replace(/<meta property="og:description" content="[^"]*"/, '<meta property="og:description" content="작가는 왜 창작보다 행정과 보관에 더 지쳐야 할까요? 1인 예술가가 오롯이 창작에만 몰입할 수 있도록 돕는 수장고(Sujango)의 브랜드 스토리와 철학을 소개합니다."')
    .replace(/<meta property="og:url" content="[^"]*"/, '<meta property="og:url" content="https://sujango.com/about"')
    .replace('<link rel="canonical" href="https://sujango.com/" />', '<link rel="canonical" href="https://sujango.com/about" />')
    .replace('<div id="root"></div>', `<div id="root">${aboutSemanticContent}</div>`);

  fs.writeFileSync(path.join(aboutDir, 'index.html'), aboutHtml);
  console.log('✓ Prerendered About Page: dist/about/index.html');

  // =========================================================================
  // 3. 이용안내 & FAQ 페이지 프리렌더링 (dist/guide/index.html)
  // =========================================================================
  const guideDir = path.join(distDir, 'guide');
  if (!fs.existsSync(guideDir)) fs.mkdirSync(guideDir, { recursive: true });

  const guideSemanticContent = `
    <header class="main-header" style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <a href="/" style="font-family: 'Noto Serif KR', serif; font-size: 1.25rem; font-weight: 700; color: #0F172A; text-decoration: none;">수장고 Sujango</a>
      </div>
      <nav style="display: flex; gap: 1rem; align-items: center;">
        <a href="/" style="color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 500;">홈으로</a>
        <a href="/about" style="color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 500;">수장고 소개</a>
      </nav>
    </header>

    <main class="guide-page-wrapper" style="max-width: 960px; margin: 0 auto; padding: 4.5rem 1.5rem 3.5rem;">
      <div style="text-align: center; margin-bottom: 3.5rem;">
        <div style="display: inline-flex; align-items: center; gap: 6px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.4rem 0.95rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; color: #475569; margin-bottom: 1.25rem;">
          <span>창작자 안내 센터 &amp; 자주 묻는 질문</span>
        </div>
        <h1 style="font-family: 'Noto Serif KR', serif; font-size: 2.75rem; font-weight: 700; color: #0F172A; line-height: 1.35; margin-bottom: 1.25rem;">
          이용안내 &amp; 자주 묻는 질문 (FAQ)
        </h1>
        <p style="font-size: 1.05rem; color: #475569; line-height: 1.8;">
          수장고(Sujango) 이용 전 창작자분들이 가장 궁금해하시는 핵심 내용을 모았습니다.
        </p>
      </div>

      <section style="display: flex; flex-direction: column; gap: 1.5rem;">
        <article style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.75rem;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: #0F172A; margin-bottom: 0.75rem;">
            Q. 수장고 서비스는 정말 무료로 시작할 수 있나요?
          </h2>
          <p style="color: #334155; line-height: 1.7; font-size: 0.95rem;">
            네, 기본 Free Artist 플랜으로 작품 30점 무료 보관, AI 작가노트 생성, A4 전시 캡션 출력, 행정 서식 스튜디오를 영구 무료로 이용하실 수 있습니다. 대용량 금고나 전용 보안 기능이 필요하실 때만 Pro 요금제로 전환하시면 됩니다.
          </p>
        </article>

        <article style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.75rem;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: #0F172A; margin-bottom: 0.75rem;">
            Q. 등록한 작품 이미지는 얼마나 안전하게 보관되나요?
          </h2>
          <p style="color: #334155; line-height: 1.7; font-size: 0.95rem;">
            수장고는 전송 구간 암호화(SSL 256-bit)와 안전한 분산 저장소 체계를 갖추고 있습니다. 또한 작가님의 로컬 기기에도 언제든 단일 백업 파일(JSON)로 이중 보관할 수 있어 플랫폼 장애 시에도 안전합니다.
          </p>
        </article>

        <article style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.75rem;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: #0F172A; margin-bottom: 0.75rem;">
            Q. 전시 캡션은 어떻게 출력하나요?
          </h2>
          <p style="color: #334155; line-height: 1.7; font-size: 0.95rem;">
            작품명, 연도, 크기, 재료를 등록하신 후 상단의 'A4 인쇄용 PDF 다운로드' 버튼을 누르면 국영문 표준 규격에 맞추어 깔끔하게 인쇄 및 저장됩니다.
          </p>
        </article>
      </section>
    </main>
  `;

  let guideHtml = baseHtml
    .replace('<title>수장고 Sujango | 1인 창작자를 위한 프라이빗 수장고</title>', '<title>이용안내 & 자주 묻는 질문(FAQ) | 수장고 Sujango</title>')
    .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="수장고의 무료 시작 혜택, 영구 분산 보관 보안 기술, A4 전시 캡션 출력법, AI 작가노트 생성 등 창작자분들이 가장 자주 묻는 질문 12문 12답."')
    .replace(/<meta property="og:title" content="[^"]*"/, '<meta property="og:title" content="이용안내 & 자주 묻는 질문(FAQ) | 수장고 Sujango"')
    .replace(/<meta property="og:description" content="[^"]*"/, '<meta property="og:description" content="수장고의 무료 시작 혜택, 영구 분산 보관 보안 기술, A4 전시 캡션 출력법, AI 작가노트 생성 등 창작자분들이 가장 자주 묻는 질문 12문 12답."')
    .replace(/<meta property="og:url" content="[^"]*"/, '<meta property="og:url" content="https://sujango.com/guide"')
    .replace('<link rel="canonical" href="https://sujango.com/" />', '<link rel="canonical" href="https://sujango.com/guide" />')
    .replace('<div id="root"></div>', `<div id="root">${guideSemanticContent}</div>`);

  fs.writeFileSync(path.join(guideDir, 'index.html'), guideHtml);
  console.log('✓ Prerendered Guide Page: dist/guide/index.html');

  console.log('[Prerender] All 3 public pages prerendered successfully!');
}

prerender().catch(err => {
  console.error('[Prerender Error]', err);
  process.exit(1);
});
