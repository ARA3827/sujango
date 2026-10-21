import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

async function generateAssets() {
  console.log('[Assets] Generating Favicons & OG Image from logo-brush.jpg...');

  const logoPath = path.join(publicDir, 'logo-brush.jpg');
  if (!fs.existsSync(logoPath)) {
    throw new Error('logo-brush.jpg not found in public folder');
  }

  // 1. 파비콘용 단순화 붓글씨 아이콘 리사이징
  // 16x16, 32x32, 180x180 (Apple Touch), 192x192, 512x512 (Android)
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  for (const item of sizes) {
    const dest = path.join(publicDir, item.name);
    await sharp(logoPath)
      .resize(item.size, item.size, { fit: 'cover' })
      .png({ quality: 95 })
      .toFile(dest);
    console.log(`✓ Created ${item.name} (${item.size}x${item.size})`);
  }

  // favicon.ico (32x32 png 복사 형태 지원)
  await sharp(logoPath)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created favicon.ico');

  // favicon.svg
  const fav32Buf = await sharp(logoPath).resize(64, 64).png().toBuffer();
  const favSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#FFFFFF"/><image width="64" height="64" href="data:image/png;base64,${fav32Buf.toString('base64')}"/></svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favSvg);
  console.log('✓ Created favicon.svg');

  // 2. 가로 1200 x 세로 630 규격의 공유용 대표 이미지 (OG Image) 생성
  // 로고를 좌측에 배치하고 우측에 정갈한 브랜드 카피라이팅 렌더링
  const ogWidth = 1200;
  const ogHeight = 630;

  // 로고를 380x380 크기로 리사이징한 버퍼 생성
  const resizedLogoBuffer = await sharp(logoPath)
    .resize(380, 380, { fit: 'contain' })
    .png()
    .toBuffer();

  const logoBase64 = `data:image/png;base64,${resizedLogoBuffer.toString('base64')}`;

  // 고화질 SVG 오버레이 디자인 (동양적인 미학과 미니멀 모던의 조화)
  const svgOverlay = `
    <svg width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDFDFE"/>
          <stop offset="100%" stop-color="#F8FAFC"/>
        </linearGradient>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#0F172A" flood-opacity="0.06"/>
        </filter>
      </defs>

      <!-- 백그라운드 -->
      <rect width="100%" height="100%" fill="url(#bgGrad)" />

      <!-- 미세한 상단 및 외곽 프레임 라인 -->
      <rect x="32" y="32" width="1136" height="566" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>

      <!-- 좌측: 수장고 붓글씨 로고 카드 -->
      <rect x="72" y="125" width="380" height="380" rx="16" fill="#F8FAFC" stroke="#EEF2F6" stroke-width="1"/>
      <image href="${logoBase64}" x="72" y="125" width="380" height="380" preserveAspectRatio="xMidYMid meet"/>

      <!-- 우측 텍스트 컨텐츠 영역 -->
      <g transform="translate(500, 150)">
        <!-- 상단 브랜드 태그 -->
        <rect x="0" y="0" width="138" height="32" rx="16" fill="#0F172A"/>
        <text x="69" y="21" font-family="'Pretendard', -apple-system, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">
          SUJANGO.COM
        </text>

        <!-- 메인 헤드라인 타이틀 -->
        <text x="0" y="85" font-family="'Noto Serif KR', serif, -apple-system" font-size="44" font-weight="700" fill="#0F172A" letter-spacing="-0.5">
          수장고 Sujango
        </text>
        <text x="0" y="132" font-family="'Pretendard', -apple-system, sans-serif" font-size="24" font-weight="600" fill="#334155">
          1인 창작자를 위한 프라이빗 수장고
        </text>

        <!-- 구분선 -->
        <line x1="0" y1="162" x2="590" y2="162" stroke="#E2E8F0" stroke-width="1.5"/>

        <!-- 설명문 (2줄 분할) -->
        <text x="0" y="205" font-family="'Pretendard', -apple-system, sans-serif" font-size="18" font-weight="500" fill="#475569" letter-spacing="-0.2">
          고해상도 원본 보관부터 작가노트, 전시 캡션,
        </text>
        <text x="0" y="235" font-family="'Pretendard', -apple-system, sans-serif" font-size="18" font-weight="500" fill="#475569" letter-spacing="-0.2">
          출강 서류, 수입·지출 정리까지. 작가의 모든 기록을 한 곳에서.
        </text>

        <!-- 하단 피처 뱃지들 -->
        <g transform="translate(0, 275)">
          <rect x="0" y="0" width="130" height="34" rx="8" fill="#F1F5F9"/>
          <text x="65" y="21" font-family="'Pretendard', -apple-system, sans-serif" font-size="13" font-weight="600" fill="#334155" text-anchor="middle">
            📁 무손실 원본 금고
          </text>

          <rect x="140" y="0" width="120" height="34" rx="8" fill="#F1F5F9"/>
          <text x="200" y="21" font-family="'Pretendard', -apple-system, sans-serif" font-size="13" font-weight="600" fill="#334155" text-anchor="middle">
            🏷️ 전시 캡션 출력
          </text>

          <rect x="270" y="0" width="135" height="34" rx="8" fill="#F1F5F9"/>
          <text x="337" y="21" font-family="'Pretendard', -apple-system, sans-serif" font-size="13" font-weight="600" fill="#334155" text-anchor="middle">
            📑 작가노트 &amp; 정산
          </text>
        </g>
      </g>
    </svg>
  `;

  const ogDest = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(svgOverlay))
    .png({ quality: 95 })
    .toFile(ogDest);
  console.log(`✓ Created og-image.png (${ogWidth}x${ogHeight})`);

  // SVG 버전도 저장
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), svgOverlay);
  console.log('✓ Created og-image.svg');

  console.log('[Assets] All assets generated successfully!');
}

generateAssets().catch(err => {
  console.error('[Assets Error]', err);
  process.exit(1);
});
