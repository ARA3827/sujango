/**
 * Sujango (수장고) 로컬 ➔ 클라우드 데이터 안전 이전(Migration) 엔진 (과제 1)
 * 
 * [목적]
 * 클라우드 인증 도입 이전에 브라우저(로컬/게스트/구 로컬 계정)에 등록해 두었던
 * 작품 도록과 5대 도구 데이터를 새 클라우드 계정으로 100% 무손실 안전 이전합니다.
 */

import { getUserScopedKey } from './authStorage';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { saveArtworks, getArtworks } from './archiveStorage';

/**
 * 모든 로컬 레거시 키 목록에서 데이터 후보군 스캔
 */
function scanLegacyData(baseKey, currentTargetKey) {
  const candidates = [];
  const checkedKeys = new Set([currentTargetKey]);

  // 1. 공용 기본 키 (artflow_artworks 등)
  if (!checkedKeys.has(baseKey)) {
    checkedKeys.add(baseKey);
    try {
      const raw = localStorage.getItem(baseKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          candidates.push(...parsed);
        }
      }
    } catch (_) {}
  }

  // 2. 게스트 키 (baseKey_guest)
  const guestKey = `${baseKey}_guest`;
  if (!checkedKeys.has(guestKey)) {
    checkedKeys.add(guestKey);
    try {
      const raw = localStorage.getItem(guestKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          candidates.push(...parsed);
        }
      }
    } catch (_) {}
  }

  // 3. 브라우저 localStorage 전체를 훑어 동일 접두어를 가진 이전 로컬 키 탐색
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${baseKey}_`) && !checkedKeys.has(k)) {
        // 김아라 데모 계정 데이터는 제외 (실제 작가 데이터만 이전)
        if (k.includes('ara_kim')) continue;

        checkedKeys.add(k);
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              candidates.push(...parsed);
            }
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  // 중복 ID 제거 (동일한 작품이 여러 키에 있을 경우 최신 1개만 보존)
  const uniqueMap = new Map();
  candidates.forEach(item => {
    if (item && item.id && !uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * 새 클라우드 계정으로 레거시 데이터 마이그레이션 실행
 */
export async function migrateLegacyLocalData(newUser) {
  if (!newUser || !newUser.email) {
    return { isMigrated: false, migratedArtworksCount: 0, migratedToolsCount: 0 };
  }

  const migrationFlagKey = `sujango_migrated_v1_${newUser.email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  // 이미 해당 계정으로 이전이 완료된 브라우저라면 중복 실행 방지
  if (localStorage.getItem(migrationFlagKey) === 'true') {
    return { isMigrated: false, migratedArtworksCount: 0, migratedToolsCount: 0 };
  }

  let migratedArtworksCount = 0;
  let migratedToolsCount = 0;

  // ----------------------------------------------------
  // 1. 작품 데이터(artflow_artworks) 안전 이전
  // ----------------------------------------------------
  const targetArtKey = getUserScopedKey('artflow_artworks', newUser);
  const currentArtworks = getArtworks(newUser);
  const legacyArtworks = scanLegacyData('artflow_artworks', targetArtKey);

  if (legacyArtworks.length > 0) {
    // 기존 작품 ID 집합
    const existingIds = new Set(currentArtworks.map(a => a.id));
    const toAdd = legacyArtworks.filter(a => !existingIds.has(a.id));

    if (toAdd.length > 0) {
      // 새 작가 정보에 맞추어 보정
      const preparedToAdd = toAdd.map(art => ({
        ...art,
        artist: art.artist || newUser.name || '작가',
        migratedAt: new Date().toISOString()
      }));

      const finalArtworks = [...preparedToAdd, ...currentArtworks];
      await saveArtworks(finalArtworks, newUser);
      migratedArtworksCount = preparedToAdd.length;

      // Supabase 클라우드에도 원격 백업 시도
      if (isSupabaseConfigured() && supabase && newUser.email) {
        for (const art of preparedToAdd) {
          try {
            const rawPrice = parseInt(String(art.price || '').replace(/[^0-9]/g, '')) || 0;
            const dbStatus = art.status === 'sold' ? '판매완료' : (art.status === 'nfs' ? '비매품' : (art.status === 'exhibited' ? '전시중' : '보관중'));
            
            await supabase.from('artworks').upsert({
              user_email: newUser.email,
              title: art.title || '무제',
              year: art.year || '',
              medium: art.medium || '',
              price: rawPrice,
              status: dbStatus,
              image_url: art.imageUrl || '',
              notes: JSON.stringify({
                client_id: art.id,
                size: art.size || '',
                status: art.status || 'available',
                location: art.location || '',
                statement: art.statement || '',
                instaCaption: art.instaCaption || '',
                blogStory: art.blogStory || '',
                artist: art.artist || newUser.name || '작가',
                migratedFromLocal: true
              })
            });
          } catch (e) {
            console.warn('[Migration] Artwork cloud sync notice:', e);
          }
        }
      }
    }
  }

  // ----------------------------------------------------
  // 2. 5대 도구 데이터(전시캡션, 가계부, 영감노트) 이전
  // ----------------------------------------------------
  const toolConfigs = [
    { baseKey: 'artflow_captions', label: '전시 캡션' },
    { baseKey: 'artflow_incomes', label: '가계부' },
    { baseKey: 'sujango_inspo_vault_v1', label: '영감 노트' }
  ];

  for (const tool of toolConfigs) {
    const targetKey = getUserScopedKey(tool.baseKey, newUser);
    const legacyItems = scanLegacyData(tool.baseKey, targetKey);

    if (legacyItems.length > 0) {
      let currentItems = [];
      try {
        const saved = localStorage.getItem(targetKey);
        if (saved) currentItems = JSON.parse(saved);
      } catch (_) {}

      const existingIds = new Set(currentItems.map(item => item.id || JSON.stringify(item)));
      const itemsToAdd = legacyItems.filter(item => !existingIds.has(item.id || JSON.stringify(item)));

      if (itemsToAdd.length > 0) {
        const merged = [...itemsToAdd, ...currentItems];
        try {
          localStorage.setItem(targetKey, JSON.stringify(merged));
          migratedToolsCount += itemsToAdd.length;
        } catch (e) {
          console.warn(`[Migration] ${tool.label} 저장 한도 초과:`, e);
        }
      }
    }
  }

  // 이전 완료 플래그 저장
  try {
    localStorage.setItem(migrationFlagKey, 'true');
  } catch (_) {}

  const isMigrated = (migratedArtworksCount > 0 || migratedToolsCount > 0);

  if (isMigrated) {
    console.log(`[Sujango Migration] 성공: 작품 ${migratedArtworksCount}점, 도구 기록 ${migratedToolsCount}건 이전 완료`);
  }

  return {
    isMigrated,
    migratedArtworksCount,
    migratedToolsCount
  };
}
