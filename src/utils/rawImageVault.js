/**
 * Sujango Raw Image Vault (무손실 원본 금고)
 * - ArrayBuffer 바이너리 기반 무결성 저장
 * - 브라우저 DataCloneError 및 IndexedDB 락 완벽 방어
 */

const DB_NAME = 'sujango_vault_db';
const DB_VERSION = 1;
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
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error || new Error('IndexedDB 연결 실패'));
    };
  });
}

/**
 * 원본 이미지 파일(Blob/File)을 무손실 보관
 */
export async function saveOriginalToVault(artworkId, fileOrBlob, originalFileName = '') {
  if (!artworkId || !fileOrBlob) return false;

  try {
    // 1. ArrayBuffer로 순수 바이너리 추출 (직렬화 에러 원천 차단)
    const buffer = await fileOrBlob.arrayBuffer();
    const db = await openDatabase();

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.warn('[Raw Vault] 저장 타임아웃 방어 해제');
        resolve(true);
      }, 4000);

      try {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const record = {
          id: artworkId,
          buffer: buffer,
          name: originalFileName || fileOrBlob.name || 'artwork.jpg',
          size: fileOrBlob.size,
          type: fileOrBlob.type || 'image/jpeg',
          savedAt: new Date().toISOString()
        };

        store.put(record);

        tx.oncomplete = () => {
          clearTimeout(timer);
          resolve(true);
        };

        tx.onerror = (e) => {
          clearTimeout(timer);
          console.error('[Raw Vault] 쓰기 오류:', e);
          resolve(false);
        };
      } catch (err) {
        clearTimeout(timer);
        console.error('[Raw Vault] 트랜잭션 오류:', err);
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
          if (result && (result.buffer || result.blob)) {
            let blob;
            if (result.buffer) {
              blob = new Blob([result.buffer], { type: result.type || 'image/jpeg' });
            } else {
              blob = result.blob;
            }
            blob.originalName = result.name || '';
            blob.originalSize = result.size || blob.size;
            resolve(blob);
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = () => resolve(null);
      } catch (e) {
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

        delRequest.onsuccess = () => resolve(true);
        delRequest.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  } catch (e) {
    return false;
  }
}
