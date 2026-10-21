/**
 * Sujango Raw Image Vault (무손실 원본 금고)
 * - 브라우저 표준 IndexedDB를 사용하여 대용량(수 MB ~ 수십 MB) 원본 이미지를
 *   1바이트의 압축/손실도 없이 원본 그대로 안전하게 보관합니다.
 * - localStorage의 5MB 한계를 극복하여 작가의 소중한 고해상도 작품을 보존합니다.
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
 * @param {string} artworkId - 작품 고유 ID
 * @param {Blob|File} fileOrBlob - 원본 파일 객체
 * @param {string} originalFileName - 원본 파일 이름
 */
export async function saveOriginalToVault(artworkId, fileOrBlob, originalFileName = '') {
  if (!artworkId || !fileOrBlob) return false;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id: artworkId,
        blob: fileOrBlob,
        name: originalFileName,
        size: fileOrBlob.size,
        type: fileOrBlob.type,
        savedAt: new Date().toISOString()
      };

      const putRequest = store.put(record);

      putRequest.onsuccess = () => resolve(true);
      putRequest.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error('[Raw Vault] 원본 이미지 저장 실패:', error);
    return false;
  }
}

/**
 * 원본 이미지 파일(Blob) 꺼내기
 * @param {string} artworkId - 작품 고유 ID
 * @returns {Promise<Blob|null>} 원본 이미지 Blob
 */
export async function getOriginalFromVault(artworkId) {
  if (!artworkId) return null;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(artworkId);

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        if (result && result.blob) {
          // blob 자체에 원본 메타데이터(name, originalSize)를 프로퍼티로 바인딩하여 반환
          const blob = result.blob;
          blob.originalName = result.name || '';
          blob.originalSize = result.size || blob.size;
          resolve(blob);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn('[Raw Vault] 원본 이미지 조회 실패:', error);
    return null;
  }
}

/**
 * 작품 삭제 시 원본 금고에서도 제거
 * @param {string} artworkId - 작품 고유 ID
 */
export async function deleteOriginalFromVault(artworkId) {
  if (!artworkId) return false;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delRequest = store.delete(artworkId);

      delRequest.onsuccess = () => resolve(true);
      delRequest.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}
