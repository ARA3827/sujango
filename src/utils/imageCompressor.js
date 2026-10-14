/**
 * 브라우저 클라이언트 사이드 고성능 이미지 처리 및 워터마크 파이프라인
 * 1. compressImage: 가로 최대 maxWidth로 축소 압축
 * 2. generateWatermarkedPreview: 1080px 웹 최적화 + 작가 맞춤 워터마크(텍스트 또는 로고) 합성
 * 3. generateThumbnail: 400px 초경량 목록용 썸네일 생성
 */

export async function compressImage(fileOrDataUrl, maxWidth = 1200, quality = 0.82) {
  const img = await loadImage(fileOrDataUrl);
  return resizeAndExport(img, maxWidth, quality);
}

/**
 * 400px 경량 썸네일 생성
 */
export async function generateThumbnail(fileOrDataUrl, size = 400, quality = 0.78) {
  const img = await loadImage(fileOrDataUrl);
  return resizeAndExport(img, size, quality);
}

/**
 * 1080px 웹 최적화 시안 + 나만의 워터마크 1회 자동 합성 엔진
 * @param {File|string} fileOrDataUrl - 원본 이미지 파일 또는 dataURL
 * @param {Object} watermarkSettings - 워터마크 설정 (type, text, imageUrl, opacity, position)
 * @param {number} targetWidth - 웹 시안 표준 가로폭 (기본 1080px)
 */
export async function generateWatermarkedPreview(fileOrDataUrl, watermarkSettings = {}, targetWidth = 1080) {
  const baseImg = await loadImage(fileOrDataUrl);

  const {
    watermark_type = 'text',
    watermark_text = '© 2026 Artist. All rights reserved',
    watermark_image_url = null,
    watermark_opacity = 0.35,
    watermark_position = 'center_diagonal'
  } = watermarkSettings;

  // 워터마크 미적용인 경우 단순 1080px 압축만 수행
  if (watermark_type === 'none') {
    return resizeAndExport(baseImg, targetWidth, 0.85);
  }

  // 가로폭 1080px 기준으로 비율 계산
  let width = baseImg.width;
  let height = baseImg.height;

  if (width > targetWidth) {
    height = Math.round((height * targetWidth) / width);
    width = targetWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. 베이스 이미지 렌더링
  ctx.drawImage(baseImg, 0, 0, width, height);

  // 2. 워터마크 오버레이 적용
  ctx.save();
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, watermark_opacity));

  if (watermark_type === 'text') {
    renderTextWatermark(ctx, width, height, watermark_text, watermark_position);
  } else if (watermark_type === 'image' && watermark_image_url) {
    try {
      const logoImg = await loadImage(watermark_image_url);
      renderLogoWatermark(ctx, width, height, logoImg, watermark_position);
    } catch (e) {
      console.warn('워터마크 로고 로드 실패, 텍스트로 폴백합니다:', e);
      renderTextWatermark(ctx, width, height, watermark_text, watermark_position);
    }
  }

  ctx.restore();

  // 3. WebP/JPEG 고품질 내보내기
  return exportCanvas(canvas, 0.85);
}

/**
 * 텍스트 워터마크 Canvas 그리기
 */
function renderTextWatermark(ctx, width, height, text, position) {
  const displayText = text || 'PREVIEW ONLY';
  const fontSize = Math.max(18, Math.round(width * 0.038)); // 화면 비율에 비례하는 폰트 크기

  ctx.font = `700 ${fontSize}px sans-serif, -apple-system, system-ui`;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (position === 'center_diagonal') {
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-25 * (Math.PI / 180));
    ctx.fillText(displayText, 0, 0);
  } else if (position === 'bottom_right') {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    const padding = Math.round(width * 0.04);
    ctx.fillText(displayText, width - padding, height - padding);
  } else if (position === 'grid') {
    ctx.rotate(-18 * (Math.PI / 180));
    const stepX = width * 0.45;
    const stepY = height * 0.35;
    for (let x = -width; x < width * 2; x += stepX) {
      for (let y = -height; y < height * 2; y += stepY) {
        ctx.fillText(displayText, x, y);
      }
    }
  }
}

/**
 * 이미지 로고 워터마크 Canvas 그리기
 */
function renderLogoWatermark(ctx, width, height, logoImg, position) {
  let logoW = logoImg.width;
  let logoH = logoImg.height;

  if (position === 'bottom_right') {
    const maxLogoW = width * 0.22;
    if (logoW > maxLogoW) {
      logoH = (logoH * maxLogoW) / logoW;
      logoW = maxLogoW;
    }
    const padding = Math.round(width * 0.04);
    ctx.drawImage(logoImg, width - logoW - padding, height - logoH - padding, logoW, logoH);
  } else {
    // center_diagonal
    const maxLogoW = width * 0.38;
    if (logoW > maxLogoW) {
      logoH = (logoH * maxLogoW) / logoW;
      logoW = maxLogoW;
    }
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-15 * (Math.PI / 180));
    ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
  }
}

/**
 * 이미지 로드 헬퍼
 */
function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      reject(new Error('지원하지 않는 이미지 원본 형식입니다.'));
    }
  });
}

/**
 * Canvas 리사이징 헬퍼
 */
function resizeAndExport(img, maxWidth, quality) {
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return exportCanvas(canvas, quality);
}

/**
 * Canvas를 WebP/JPEG dataURL로 내보내기
 */
function exportCanvas(canvas, quality) {
  try {
    const webpData = canvas.toDataURL('image/webp', quality);
    if (webpData.startsWith('data:image/webp')) {
      return webpData;
    }
  } catch (e) {
    // WebP 미지원 브라우저 대응
  }
  return canvas.toDataURL('image/jpeg', quality);
}
