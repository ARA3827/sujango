/**
 * Sujango (수장고) 작가별 저장 용량(Storage Meter) 계산 및 유틸리티
 * 플랜별 상한: Free 1GB / Pro 100GB / Studio 500GB
 */

export const STORAGE_LIMITS = {
  free: {
    key: 'free',
    name: 'Free Artist',
    limitBytes: 1 * 1024 * 1024 * 1024, // 1 GB
    limitLabel: '1 GB',
    maxArtworkCount: 30
  },
  pro: {
    key: 'pro',
    name: 'Pro Artist',
    limitBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    limitLabel: '100 GB',
    maxArtworkCount: Infinity
  },
  studio: {
    key: 'studio',
    name: 'Studio Partner',
    limitBytes: 500 * 1024 * 1024 * 1024, // 500 GB
    limitLabel: '500 GB',
    maxArtworkCount: Infinity
  }
};

/**
 * 작가의 현재 플랜 및 용량 한도 정보 조회
 */
export function getUserStoragePlan(user) {
  if (!user) return STORAGE_LIMITS.free;

  const tier = (user.planTier || '').toLowerCase();
  if (tier === 'studio') return STORAGE_LIMITS.studio;
  if (user.isPro || tier === 'pro') return STORAGE_LIMITS.pro;

  return STORAGE_LIMITS.free;
}

/**
 * 바이트 단위를 사람이 읽기 쉬운 문자열(KB, MB, GB)로 변환
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 MB';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  // 기본적으로 1MB 미만이라도 0.x MB 형태로 친절하게 보여줌
  if (bytes < k * k) {
    const mbVal = (bytes / (k * k)).toFixed(dm);
    return mbVal === '0.0' ? `${(bytes / k).toFixed(0)} KB` : `${mbVal} MB`;
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${val} ${sizes[i]}`;
}

/**
 * 현재 작가의 작품 목록에서 사용 중인 총 용량(bytes) 계산
 */
export function calculateUsedStorage(artworks = []) {
  if (!Array.isArray(artworks)) return 0;

  return artworks.reduce((total, art) => {
    // 1. 명시적 파일 크기가 있는 경우 (바이트)
    if (typeof art.fileSizeBytes === 'number' && art.fileSizeBytes > 0) {
      return total + art.fileSizeBytes;
    }
    if (typeof art.file_size_bytes === 'number' && art.file_size_bytes > 0) {
      return total + art.file_size_bytes;
    }

    // 2. Base64 이미지 URL 기반 추정치 (Base64 길이의 약 75%가 원본 바이트 크기)
    let estimated = 0;
    if (typeof art.imageUrl === 'string' && art.imageUrl.startsWith('data:')) {
      estimated += Math.round(art.imageUrl.length * 0.75);
    }
    if (typeof art.thumbnailUrl === 'string' && art.thumbnailUrl.startsWith('data:')) {
      estimated += Math.round(art.thumbnailUrl.length * 0.75);
    }

    // 3. 사진은 있으나 크기 정보가 누락된 경우 기본 2MB로 안전 보수적 추정
    if (estimated === 0 && (art.imageUrl || art.image_url)) {
      estimated = 2 * 1024 * 1024; // 2MB
    }

    return total + estimated;
  }, 0);
}

/**
 * 용량 상한 초과 여부 검증
 */
export function checkStorageOverflow(currentUsedBytes, newFileBytes = 0, limitBytes) {
  const projected = (currentUsedBytes || 0) + (newFileBytes || 0);
  const isOverflow = projected > limitBytes;
  const percentage = Math.min(100, Math.round((projected / limitBytes) * 100));

  return {
    isOverflow,
    projected,
    percentage,
    remainingBytes: Math.max(0, limitBytes - projected)
  };
}
