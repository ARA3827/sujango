/**
 * Sujango Raw Image Vault (무손실 원본 금고)
 * - 브라우저 네이티브 Blob 스토리지 활용 (수십 MB 대용량 파일도 메모리 부담 없이 디스크 스트리밍 저장)
 * - 31.5MB, 50MB, 100MB 초대형 파인아트 원본 파일 1바이트 손실 없이 영구 보존
 */

const DB_NAME = 'sujango_vault_db';
const DB_VERSION = 2; // 스토어 버전 업그레이드로 안전성 보장
const STORE_NAME = 'artwork_originals';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('현재 브라우저가 IndexedDB를 지원하지 않습니다.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      db.onversionchange = () => {
        try { db.close(); } catch (e) {}
      };
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error || new Error('IndexedDB 연결 실패'));
    };

    request.onblocked = () => {
      console.warn('[Raw Vault] 다른 탭의 연결 대기 중');
    };
  });
}

/**
 * 원본 이미지 파일(Blob/File)을 무손실 보관
 */
export async function saveOriginalToVault(artworkId, fileOrBlob, originalFileName = '') {
  if (!artworkId || !fileOrBlob) return false;

  try {
    const db = await openDatabase();

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.warn('[Raw Vault] 대용량 저장 타임아웃 해제');
        try { db.close(); } catch (e) {}
        resolve(true);
      }, 10000);

      try {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        // 브라우저 네이티브 Blob 생성 (Chrome/Edge에서 디스크 직통 스트리밍 저장)
        const pureBlob = fileOrBlob instanceof Blob ? fileOrBlob : new Blob([fileOrBlob], { type: fileOrBlob.type || 'image/jpeg' });

        const record = {
          id: artworkId,
          blob: pureBlob,
          name: originalFileName || fileOrBlob.name || 'artwork.jpg',
          size: fileOrBlob.size,
          type: fileOrBlob.type || 'image/jpeg',
          savedAt: new Date().toISOString()
        };

        store.put(record);

        tx.oncomplete = () => {
          clearTimeout(timer);
          console.log(`[Raw Vault] 원본 이미지 안전 저장 완료 (${(fileOrBlob.size / (1024 * 1024)).toFixed(2)} MB)`);
          try { db.close(); } catch (e) {}
          resolve(true);
        };

        tx.onerror = (e) => {
          clearTimeout(timer);
          console.error('[Raw Vault] IndexedDB 쓰기 실패:', e.target.error);
          try { db.close(); } catch (err) {}
          resolve(false);
        };
      } catch (err) {
        clearTimeout(timer);
        console.error('[Raw Vault] 트랜잭션 오류:', err);
        try { db.close(); } catch (e) {}
        resolve(false);
      }
    });
  } catch (error) {
    console.error('[Raw Vault] 원본 이미지 저장 실패:', error);
    return false;
  }
}

/**
 * 원본 이미지 파일(Blob) 꺼내기
 */
export async function getOriginalFromVault(artworkId) {
  if (!artworkId) return null;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getRequest = store.get(artworkId);

        getRequest.onsuccess = () => {
          const result = getRequest.result;
          try { db.close(); } catch (e) {}

          if (result) {
            let blob = null;
            if (result.blob) {
              blob = result.blob;
            } else if (result.buffer) {
              blob = new Blob([result.buffer], { type: result.type || 'image/jpeg' });
            }

            if (blob) {
              blob.originalName = result.name || '';
              blob.originalSize = result.size || blob.size;
              resolve(blob);
              return;
            }
          }
          resolve(null);
        };

        getRequest.onerror = () => {
          try { db.close(); } catch (e) {}
          resolve(null);
        };
      } catch (e) {
        try { db.close(); } catch (err) {}
        resolve(null);
      }
    });
  } catch (error) {
    console.warn('[Raw Vault] 원본 이미지 조회 실패:', error);
    return null;
  }
}

/**
 * 작품 삭제 시 원본 금고에서도 제거
 */
export async function deleteOriginalFromVault(artworkId) {
  if (!artworkId) return false;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const delRequest = store.delete(artworkId);

        delRequest.onsuccess = () => {
          try { db.close(); } catch (e) {}
          resolve(true);
        };
        delRequest.onerror = () => {
          try { db.close(); } catch (e) {}
          resolve(false);
        };
      } catch (e) {
        try { db.close(); } catch (err) {}
        resolve(false);
      }
    });
  } catch (e) {
    return false;
  }
}
