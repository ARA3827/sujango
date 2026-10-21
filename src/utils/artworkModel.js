/**
 * Sujango Artwork Data Model & Migration Engine (v6.0)
 * - 단일 진실의 원천(Single Source of Truth) 공통 작품 데이터 모델
 * - Supabase artworks 테이블과 1:1 완벽 호환 (UUID, ownerId, createdAt, updatedAt)
 * - 독립 IndexedDB(sujango_backup_db) 기반 무손실 그림자 마이그레이션 & 3중 안전망
 * - navigator.storage.persist() 브라우저 영구 보존 연동
 */

import { getUserScopedKey, getStoredUser } from './authStorage';
import { hasOriginalInVault } from './rawImageVault';

const BACKUP_DB_NAME = 'sujango_backup_db';
const BACKUP_DB_VERSION = 1;
const STORE_LEGACY = 'legacy_backups';
const STORE_SHADOW = 'shadow_artworks';
const STORE_META = 'migration_meta';

// 변환 중 자가 치유 엔진 작동 방지용 전역 락
let _isMigrating = false;

export function isMigrationLocked() {
  return _isMigrating;
}

export function setMigrationLock(val) {
  _isMigrating = Boolean(val);
}

/**
 * 1. 표준 UUID v4 생성기 (모든 브라우저 100% 호환)
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (_) {}
  }
  // RFC4122 v4 Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 2. 표준 공통 Artwork 객체 정규화 및 생성
 * (Supabase artworks 테이블과 1:1 매핑 호환)
 */
export function normalizeArtwork(raw = {}, user = null) {
  const currentUser = user || getStoredUser();
  const nowIso = new Date().toISOString();
  const todayDate = nowIso.split('T')[0];

  // 숫자 가격 정제 (3500000)
  const rawPriceStr = String(raw.price || '');
  const priceAmount = parseInt(rawPriceStr.replace(/[^0-9]/g, ''), 10) || 0;

  // 크기(가로/세로/호수) 파싱 보조
  let sizeW = raw.sizeW || '';
  let sizeH = raw.sizeH || '';
  let sizeUnit = raw.sizeUnit || 'cm';
  let canvasNo = raw.canvasNo || '';

  if (raw.size && (!sizeW || !sizeH)) {
    const match = raw.size.match(/([0-9.]+)\s*[×xX*]\s*([0-9.]+)/);
    if (match) {
      sizeW = match[1];
      sizeH = match[2];
    }
    const noMatch = raw.size.match(/\(([0-9]+[FPM호]?)\)/i);
    if (noMatch) {
      canvasNo = noMatch[1];
    }
  }

  // ID는 기존 고유 ID(art-xxx)가 있으면 영구 유지하고, 신규 등록 시에만 UUID 발급
  const finalId = raw.id || generateUUID();

  return {
    // [식별자]
    id: finalId,
    ownerId: currentUser?.id || currentUser?.email || null, // 향후 Supabase auth.users 연동

    // [표기 정보]
    title: (raw.title || '무제').trim(),
    titleEn: (raw.titleEn || '').trim(),
    artist: (raw.artist || currentUser?.name || '작가').trim(),
    artistEn: (raw.artistEn || '').trim(),
    year: String(raw.year || new Date().getFullYear()).trim(),

    // [규격 및 재료]
    size: (raw.size || '').trim(),
    sizeW: sizeW ? String(sizeW).trim() : '',
    sizeH: sizeH ? String(sizeH).trim() : '',
    sizeUnit: sizeUnit,
    canvasNo: canvasNo ? String(canvasNo).trim() : '',
    medium: (raw.medium || '').trim(),
    mediumEn: (raw.mediumEn || '').trim(),

    // [가격 및 상태]
    isNfs: Boolean(raw.isNfs),
    price: raw.isNfs ? 'NFS (비매품)' : (rawPriceStr ? rawPriceStr.trim() : '가격 협의'),
    priceAmount: priceAmount,

    // [비주얼 에셋]
    imageUrl: raw.imageUrl || '',
    thumbnailUrl: raw.thumbnailUrl || raw.imageUrl || '',
    hasOriginalVault: Boolean(raw.hasOriginalVault),

    // [작가노트 및 SNS]
    statement: raw.statement || '',
    instaCaption: raw.instaCaption || '',
    blogStory: raw.blogStory || '',
    keywords: raw.keywords || '',
    inspiration: raw.inspiration || '',

    // [직전 1개 버전 히스토리 (되돌리기용)]
    statementHistory: raw.statementHistory || null,

    // [시스템 메타데이터]
    schemaVersion: '6.0',
    createdAt: raw.createdAt || todayDate,
    updatedAt: raw.updatedAt || nowIso
  };
}

/**
 * 3. 독립 IndexedDB 백업 데이터베이스 오픈
 */
function openBackupDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB를 지원하지 않는 브라우저입니다.'));
      return;
    }

    const req = window.indexedDB.open(BACKUP_DB_NAME, BACKUP_DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_LEGACY)) {
        db.createObjectStore(STORE_LEGACY, { keyPath: 'backupKey' });
      }
      if (!db.objectStoreNames.contains(STORE_SHADOW)) {
        db.createObjectStore(STORE_SHADOW, { keyPath: 'shadowKey' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'metaKey' });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * 4. 기존 로컬스토리지 데이터를 IndexedDB에 안전 복사 (Shadow Backup)
 */
export async function saveLegacyBackupToIndexedDB(userKey, rawData) {
  try {
    const db = await openBackupDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_LEGACY], 'readwrite');
      const store = tx.objectStore(STORE_LEGACY);
      const record = {
        backupKey: `legacy_${userKey}`,
        data: rawData,
        itemCount: Array.isArray(rawData) ? rawData.length : 0,
        savedAt: new Date().toISOString()
      };
      store.put(record);
      tx.oncomplete = () => {
        try { db.close(); } catch (_) {}
        resolve(true);
      };
      tx.onerror = (e) => {
        try { db.close(); } catch (_) {}
        reject(e.target.error);
      };
    });
  } catch (err) {
    console.error('[BackupDB] 레거시 스냅샷 저장 실패:', err);
    return false;
  }
}

/**
 * 5. 새 형식 그림자(Shadow) 데이터를 IndexedDB에 격리 보관
 */
export async function saveShadowDataToIndexedDB(userKey, shadowData) {
  try {
    const db = await openBackupDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SHADOW], 'readwrite');
      const store = tx.objectStore(STORE_SHADOW);
      const record = {
        shadowKey: `shadow_${userKey}`,
        data: shadowData,
        itemCount: Array.isArray(shadowData) ? shadowData.length : 0,
        savedAt: new Date().toISOString()
      };
      store.put(record);
      tx.oncomplete = () => {
        try { db.close(); } catch (_) {}
        resolve(true);
      };
      tx.onerror = (e) => {
        try { db.close(); } catch (_) {}
        reject(e.target.error);
      };
    });
  } catch (err) {
    console.error('[BackupDB] 그림자 데이터 저장 실패:', err);
    return false;
  }
}

/**
 * 6. 그림자 데이터 무결성 검증
 */
export function verifyShadowIntegrity(legacyList = [], shadowList = []) {
  if (!Array.isArray(legacyList) || !Array.isArray(shadowList)) return false;
  if (legacyList.length !== shadowList.length) {
    console.error('[Migration] 개수 불일치! 레거시:', legacyList.length, '그림자:', shadowList.length);
    return false;
  }

  for (let i = 0; i < legacyList.length; i++) {
    const orig = legacyList[i];
    const shadow = shadowList[i];

    // 제목 또는 ID 검증
    if (orig.id && shadow.id !== orig.id) return false;
    if (orig.title && shadow.title !== orig.title.trim()) return false;

    // 텍스트 길이 보존 검증 (작가노트/캡션 누락 방지)
    if (orig.statement && (!shadow.statement || shadow.statement.length < orig.statement.length * 0.9)) {
      return false;
    }
  }

  return true;
}

/**
 * 7. 브라우저 데이터 영구 보존(Persistent Storage) 자동 요청
 * (아이폰 사파리 7일 미방문 삭제 방어)
 */
export async function requestPersistentStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      localStorage.setItem('sujango_storage_persisted', isPersisted ? 'true' : 'false');
      console.log(`[Storage] 브라우저 영구 보존(Persistent Storage) 상태: ${isPersisted ? '허용됨 (안전)' : '권한 대기'}`);
      return isPersisted;
    } catch (e) {
      console.warn('[Storage] persist() 요청 중 알림:', e);
    }
  }
  return false;
}

/**
 * 8. 6단계 종합 마이그레이션 실행 함수 (Step 6-2-A 안전 전환 엔진)
 * - localStorage에는 최종 데이터 단 1벌만 남김!
 * - 레거시 복사본과 shadow 데이터는 IndexedDB(sujango_backup_db)에 완전 격리 보존
 */
export async function migrateArtworksToV6(user = null) {
  const currentUser = user || getStoredUser();
  if (!currentUser?.email) return { success: false, reason: 'no_user' };

  // 이미 6.0 마이그레이션이 성공한 경우 중복 실행 방지 (멱등성)
  const currentVersion = localStorage.getItem('sujango_schema_version');
  if (currentVersion === '6.0') {
    return { success: true, alreadyMigrated: true };
  }

  // 재시도 카운트 확인 (최대 3회 제한)
  const attempts = parseInt(localStorage.getItem('sujango_migration_attempts') || '0', 10);
  if (attempts >= 3) {
    console.warn('[Migration] 3회 이상 실패 이력 감지. 기존 데이터로 안전하게 유지합니다.');
    return { success: false, reason: 'max_attempts_exceeded' };
  }

  const rawKey = getUserScopedKey('artflow_artworks', currentUser);
  let rawList = [];

  try {
    const rawData = localStorage.getItem(rawKey);
    if (rawData) {
      rawList = JSON.parse(rawData);
    }
  } catch (err) {
    console.error('[Migration] 기존 데이터 파싱 오류:', err);
    return { success: false, reason: 'parse_error' };
  }

  // 기존 작품이 없는 깨끗한 신규 계정인 경우
  if (!Array.isArray(rawList) || rawList.length === 0) {
    localStorage.setItem('sujango_schema_version', '6.0');
    return { success: true, count: 0 };
  }

  // [1단계] 자가 치유 엔진 일시 잠금
  setMigrationLock(true);

  try {
    // [2단계] IndexedDB(sujango_backup_db)에 레거시 원본 "복사본" 스냅샷 격리 보관
    const backupOk = await saveLegacyBackupToIndexedDB(currentUser.email, rawList);
    if (!backupOk) {
      // IndexedDB 백업 실패 시 변환 절대 중단!
      setMigrationLock(false);
      window.dispatchEvent(new CustomEvent('sujango_migration_backup_failed'));
      return { success: false, reason: 'indexeddb_backup_failed' };
    }

    // [3단계] 금고 원본 여부 확인 및 V6 정규화 (Shadow 데이터 생성)
    const shadowList = [];
    for (const item of rawList) {
      const normalized = normalizeArtwork(item, currentUser);
      // 금고 원본 실제 존재 여부 비동기 확인
      if (item.id) {
        normalized.hasOriginalVault = await hasOriginalInVault(item.id);
      }
      shadowList.push(normalized);
    }

    // [4단계] IndexedDB에 그림자 데이터 격리 기록
    await saveShadowDataToIndexedDB(currentUser.email, shadowList);

    // [5단계] 무결성 검증 (개수, ID, 텍스트 길이)
    const isValid = verifyShadowIntegrity(rawList, shadowList);
    if (!isValid) {
      throw new Error('그림자 데이터 무결성 검증 실패');
    }

    // [6단계] localStorage 교체 (최종 새 데이터 딱 한 벌만 기록!)
    localStorage.setItem(rawKey, JSON.stringify(shadowList));
    localStorage.setItem('sujango_schema_version', '6.0');
    localStorage.removeItem('sujango_migration_attempts');

    console.log(`[Migration] 6.0 데이터 파이프라인 안전 전환 성공! (${shadowList.length}점)`);
    setMigrationLock(false);
    return { success: true, count: shadowList.length };

  } catch (migrationErr) {
    console.error('[Migration] 변환 실패, 안전 모드로 복구합니다:', migrationErr);
    setMigrationLock(false);

    // 실패 카운트 증가
    localStorage.setItem('sujango_migration_attempts', String(attempts + 1));

    // 이벤트 브로드캐스트 (안심 배너 및 백업 다운로드 버튼 노출)
    window.dispatchEvent(new CustomEvent('sujango_migration_error', { 
      detail: { error: migrationErr.message, attempts: attempts + 1 } 
    }));

    return { success: false, error: migrationErr.message };
  }
}
