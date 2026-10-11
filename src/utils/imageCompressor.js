/**
 * 브라우저 클라이언트 사이드 이미지 압축 유틸리티
 * 10MB~20MB 대용량 사진도 브라우저 Canvas를 이용해
 * 가로 최대 1200px, 웹 최적화 퀄리티(WebP/JPEG)로 변환하여 200~300KB로 다이어트합니다.
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('올바른 이미지 파일이 아닙니다.'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 비율을 유지하며 가로 최대 maxWidth로 축소
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // 고품질 렌더링 스무딩
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // WebP 지원 시 WebP로, 아니면 JPEG로 압축
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            return resolve(webpData);
          }
        } catch (e) {
          // fallback
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
