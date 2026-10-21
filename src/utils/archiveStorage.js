import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getStoredUser, getUserScopedKey } from './authStorage';
import { hasOriginalInVault } from './rawImageVault';
import { isMigrationLocked, normalizeArtwork } from './artworkModel';

// 초기 기본 시연용 미술관 샘플 작품 데이터 (데모 계정 전용)
const DEFAULT_ARTWORKS = [
  {
    id: 'art-1',
    title: '새벽의 경계',
    artist: '김아라',
    year: '2026',
    medium: '캔버스에 유채, 혼합재료 (Oil and mixed media on linen)',
    size: '116.8 × 91.0 cm (50F)',
    status: 'available',
    isNfs: false,
    price: '3,500,000원',
    location: '작업실 2층 수장고 B랙',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231E293B"/><stop offset="50%" stop-color="%23334155"/><stop offset="100%" stop-color="%2364748B"/></linearGradient><linearGradient id="g2" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="%230F172A" stop-opacity="0.8"/><stop offset="100%" stop-color="%2394A3B8" stop-opacity="0.2"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g1)"/><circle cx="400" cy="280" r="180" fill="%23E2E8F0" fill-opacity="0.15"/><path d="M100 450 Q 400 320 700 480 L 800 600 L 0 600 Z" fill="url(%23g2)"/><text x="400" y="550" font-family="serif" font-size="20" fill="%23E2E8F0" text-anchor="middle" letter-spacing="4">The Boundary of Dawn (2026)</text></svg>',
    statement: `본 작업 《새벽의 경계》는 어둠과 빛이 교차하는 미명의 찰나에서 비롯된 침묵과 여백의 조형적 탐구이다.\n캔버스 위에 겹겹이 축적된 유채의 마티에르는 시간의 지층을 은유하며, 거친 질감과 부드러운 그라데이션의 대비는 인간 내면의 불안과 고요가 공존하는 심리적 완충 지대를 시각화한다. 작가는 대상을 직접적으로 재현하기보다 물성의 호흡을 통해 관객으로 하여금 비가시적인 사유의 공간으로 침잠하도록 유도한다.`,
    instaCaption: `새벽이 밤의 등을 밀어내는 시간.\n붓을 쥐고 캔버스 앞에 서면 세상의 모든 소음이 멎고 오직 안료와 린넨의 숨소리만 남습니다.\n\n《새벽의 경계》, 2026\n캔버스에 유채, 혼합재료\n116.8 × 91.0 cm (50F)\n\n#김아라작가 #현대미술 #유화 #회화 #작업실 #아틀리에 #작품도록 #전시준비`,
    blogStory: `[작업실 일기: 새벽의 경계 뒤에 숨겨진 이야기]\n\n이번 50호 작업은 유독 손이 많이 갔던 작품입니다. \n밑작업으로 젯소를 바르고 마르기를 기다리는 사흘 동안, 캔버스 위에 어떤 색채를 가장 먼저 올려야 할지 수없이 망설였습니다.\n\n결국 선택한 것은 가장 어두운 네이비 블루와 차가운 새벽빛 그레이의 충돌이었습니다. 물감이 채 마르기 전에 나이프로 긁어낸 흔적들은 제가 지난 계절 동안 지나온 수많은 고민의 파편들이기도 합니다. 도록에 실릴 글을 다듬으며 이 작품이 새로운 주인을 만나 어떤 온기를 전할지 기대해 봅니다.`,
    createdAt: '2026-10-10'
  },
  {
    id: 'art-2',
    title: '푸른 잔상 No. 3',
    artist: '김아라',
    year: '2025',
    medium: '캔버스에 아크릴 (Acrylic on canvas)',
    size: '53.0 × 45.5 cm (10F)',
    status: 'sold',
    isSold: true,
    isNfs: false,
    price: '1,200,000원',
    location: '김민준 컬렉터 소장',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%230284C7"/><stop offset="100%" stop-color="%230369A1"/></linearGradient></defs><rect width="800" height="600" fill="url(%23bg)"/><rect x="150" y="100" width="500" height="400" rx="20" fill="%2338BDF8" fill-opacity="0.25"/><circle cx="350" cy="300" r="120" fill="%23F0F9FF" fill-opacity="0.3"/><circle cx="480" cy="260" r="80" fill="%23BAE6FD" fill-opacity="0.4"/><text x="400" y="540" font-family="sans-serif" font-weight="600" font-size="18" fill="%23FFFFFF" text-anchor="middle" letter-spacing="3">Blue Afterimage No. 3</text></svg>',
    statement: `《푸른 잔상 No. 3》은 찰나의 시각적 기억이 뇌리에 남기는 파동을 아크릴 특유의 명료한 발색으로 포착한 소품이다.\n푸른색은 차가움의 상징이자 동시에 가장 깊은 내적 몰입의 온도이다. 중첩된 원형과 부드러운 유기적 형태들은 파편화된 일상의 감정들이 하나의 평면 위에서 조화를 이루어가는 회복의 과정을 표상한다.`,
    instaCaption: `깊고 맑은 파랑이 주는 위로.\n작업대 위에 올려두고 하루 종일 바라보아도 지치지 않는 푸른빛을 찾고 싶었습니다.\n\n《푸른 잔상 No. 3》, 2025\nAcrylic on canvas, 10F\n\n#김아라작가 #아크릴화 #회화작품 #컬렉터 #전시회 #파랑 #미술품소장`,
    blogStory: `[10호 소품 연작 이야기]\n\n대작을 작업하다 지칠 때면 늘 작은 10호 캔버스를 꺼냅니다.\n정형화된 구상에서 벗어나 오직 색채의 리듬감에만 몸을 맡기는 시간은 저에게 일종의 명상과도 같습니다. 푸른 안료를 겹겹이 붓질하며 마음의 번뇌를 씻어냈던 그날의 기억이 이 작은 캔버스 안에 고스란히 담겨 있습니다.`,
    createdAt: '2026-10-08'
  },
  {
    id: 'art-3',
    title: '무한의 궤적',
    artist: '김아라',
    year: '2024',
    medium: '한지에 먹, 채색 (Ink and color on Korean mulberry paper)',
    size: '72.7 × 60.6 cm (20F)',
    status: 'nfs',
    isNfs: true,
    price: 'NFS (비매품 / 작가 소장)',
    location: '작가 자택 거실 보관',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231E1B4B"/><stop offset="50%" stop-color="%23312E81"/><stop offset="100%" stop-color="%234338CA"/></linearGradient></defs><rect width="800" height="600" fill="url(%23bg3)"/><path d="M150 400 C 250 150, 550 150, 650 400 S 350 550, 150 400 Z" fill="none" stroke="%23A5B4FC" stroke-width="4" stroke-dasharray="8 4"/><circle cx="400" cy="300" r="90" fill="%23C7D2FE" fill-opacity="0.2"/><text x="400" y="540" font-family="serif" font-size="18" fill="%23E0E7FF" text-anchor="middle" letter-spacing="3">Trajectory of Infinity (2024)</text></svg>',
    statement: `《무한의 궤적》은 닥종이 특유의 결을 타고 번져나가는 먹의 자연스러운 흐름을 빌려 끝없는 순환과 영속성을 시각화한 작업이다. 작가의 첫 개인전 메인 출품작으로 영구 보존 소장본이다.`,
    instaCaption: `한지의 숨결과 먹의 침묵.\n끝나지 않을 것 같던 선들이 모여 하나의 궤적을 이룹니다.\n\n《무한의 궤적》, 2024\n닥종이에 수묵채색, 20F\n\n#김아라작가 #한국화 #수묵화 #수장고 #작가소장품 #NFS`,
    blogStory: `[개인전 메인 작품 회고: 무한의 궤적]\n\n제가 가장 아끼는 초기 연작 중 하나로, 수많은 관객분들께서 구매를 문의해 주셨지만 영구 소장으로 남겨두기로 결정했던 작품입니다.`,
    createdAt: '2026-09-15'
  }
];

// 1. 전체 작품 목록 가져오기 (작가 계정별 완벽 독립 격리)
export function getArtworks(user = null) {
  const currentUser = user || getStoredUser();

  // 비로그인 상태일 때는 빈 배열 반환 (보안 철저)
  if (!currentUser || !currentUser.email) {
    return [];
  }

  // 실제 로그인 작가님의 계정 전용 고유 금고 키
  const key = getUserScopedKey('artflow_artworks', currentUser);
  try {
    const data = localStorage.getItem(key);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load user artworks:', e);
  }

  // 시연용 데모 계정(김아라)인 경우에 최초 기본 시연용 샘플 제공
  if (currentUser.id === 'user-ara' || currentUser.email === 'ara.kim@sujango.com') {
    return DEFAULT_ARTWORKS;
  }

  // 신규 가입 작가님: 타인의 작품(김아라)이 섞이지 않는 깨끗한 빈 수장고 반환!
  return [];
}

// 2. 작가 전용 금고에 저장 (브라우저 5MB 한도 자가 치유 Self-Healing 엔진 탑재)
export async function saveArtworks(artworks, user = null) {
  const currentUser = user || getStoredUser();
  const key = getUserScopedKey('artflow_artworks', currentUser);

  // 0. 마이그레이션 진행 중에는 자가 치유 엔진 완전 잠금
  if (isMigrationLocked()) {
    try {
      localStorage.setItem(key, JSON.stringify(artworks));
      return true;
    } catch (e) {
      console.warn('[Storage] 변환 중 쓰기 잠금 상태:', e);
      return false;
    }
  }

  // 1차: 실시간 합성 가능한 중복 대형 필드(previewImageUrl) 제거하여 수 MB 용량 사전 확보
  const cleanedList = artworks.map(item => {
    const copy = { ...item };
    delete copy.previewImageUrl;
    return copy;
  });

  try {
    localStorage.setItem(key, JSON.stringify(cleanedList));
    return true;
  } catch (err) {
    console.warn('[Storage] 1차 저장 실패 (5MB 한도 초과 감지), 자가 치유 안전성 검증 착수:', err);

    // 2. 용량 초과 감지 시: 썸네일로 교체할 대상 작품들이 실제로 IndexedDB 금고에 있는지 비동기 사전 검증
    const candidateItems = cleanedList.filter(
      item => item.thumbnailUrl && item.imageUrl && item.imageUrl.length > 150000
    );

    let allOriginalsSafe = true;
    for (const cand of candidateItems) {
      const exists = await hasOriginalInVault(cand.id);
      if (!exists) {
        allOriginalsSafe = false;
        console.error(`[Storage] 위험 감지: 작품 [${cand.title || cand.id}]의 무손실 원본이 금고에 없습니다! 썸네일 강제 축소를 즉시 중단합니다.`);
        break;
      }
    }

    // 만약 금고에 원본이 없는 작품이 하나라도 있다면:
    // 원본 손실을 막기 위해 절대 강제로 썸네일 교체하지 않고, 사용자에게 안내 창을 띄우고 저장을 안전 중단!
    if (!allOriginalsSafe || candidateItems.length === 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sujango_storage_full_no_vault', {
          detail: {
            message: '브라우저 저장 공간이 부족합니다. 소중한 기록을 안전하게 보존하기 위해 백업 파일을 먼저 내려받거나 불필요한 작품을 정리해 주세요.'
          }
        }));
      }
      return false;
    }

    // 모든 대상 작품의 원본이 금고에 안전하게 존재함이 100% 입증된 경우에만:
    // 화면 표시용 사본만 썸네일로 경량화하여 저장
    try {
      const slimList = cleanedList.map(item => {
        const slim = { ...item };
        if (slim.thumbnailUrl && slim.imageUrl && slim.imageUrl.length > 150000) {
          slim.imageUrl = slim.thumbnailUrl;
          slim.hasOriginalVault = true;
        }
        return slim;
      });

      localStorage.setItem(key, JSON.stringify(slimList));
      console.log('[Storage] 자가 치유 안전 적용: 금고 원본 보존 검증 완료 후 화면용 사본 경량화 저장 성공!');

      // 사용자에게 조용히 넘기지 않고 투명하게 안내 토스트 발송
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sujango_self_healing_applied', {
          detail: {
            count: candidateItems.length,
            message: '저장 공간 확보를 위해 화면 표시용 이미지를 경량화했습니다. 원본은 금고에 무손실 보존되어 있습니다.'
          }
        }));
      }
      return true;
    } catch (err2) {
      console.error('[Storage] 슬림화 저장 최종 실패:', err2);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sujango_storage_full_no_vault', {
          detail: {
            message: '브라우저 저장 공간이 가득 찼습니다. 안전을 위해 백업 파일을 내려받아 주세요.'
          }
        }));
      }
      return false;
    }
  }
}

// 3. 단일 작품 추가 또는 업데이트 (작가 계정별 격리 저장 + 클라우드 백업)
export async function saveSingleArtwork(artwork, user = null) {
  const currentUser = user || getStoredUser();
  const list = getArtworks(currentUser);
  const normalized = normalizeArtwork(artwork, currentUser);
  const index = list.findIndex(item => item.id === normalized.id);
  let savedItem;
  
  if (index >= 0) {
    savedItem = { 
      ...list[index], 
      ...normalized, 
      artist: normalized.artist || currentUser?.name || '작가',
      updatedAt: new Date().toISOString()
    };
    list[index] = savedItem;
  } else {
    savedItem = {
      ...normalized,
      id: normalized.id,
      artist: normalized.artist || currentUser?.name || '작가',
      createdAt: normalized.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };
    list.unshift(savedItem); // 최신 작품을 맨 앞으로
  }
  
  await saveArtworks(list, currentUser);

  // Supabase 클라우드 비동기 백업
  if (isSupabaseConfigured() && supabase && currentUser?.email) {
    const rawPrice = parseInt(String(savedItem.price || '').replace(/[^0-9]/g, '')) || 0;

    const dbStatus = savedItem.status === 'sold' ? '판매완료' : (savedItem.status === 'nfs' ? '비매품' : (savedItem.status === 'exhibited' ? '전시중' : '보관중'));

    supabase
      .from('artworks')
      .upsert({
        user_email: currentUser.email,
        title: savedItem.title || '무제',
        year: savedItem.year || '',
        medium: savedItem.medium || '',
        price: rawPrice,
        status: dbStatus,
        image_url: savedItem.imageUrl || '',
        notes: JSON.stringify({
          client_id: savedItem.id,
          size: savedItem.size,
          status: savedItem.status,
          location: savedItem.location || '',
          statement: savedItem.statement,
          instaCaption: savedItem.instaCaption,
          blogStory: savedItem.blogStory,
          artist: savedItem.artist
        })
      })
      .then(({ error }) => {
        if (error) console.warn('[Supabase] Artwork sync notice:', error.message);
      })
      .catch(err => console.warn('[Supabase] Artwork sync error:', err));
  }

  return list;
}

// 4. 단일 작품 삭제 (작가 계정별 격리 삭제)
export function deleteArtwork(id, user = null) {
  const currentUser = user || getStoredUser();
  const list = getArtworks(currentUser).filter(item => item.id !== id);
  saveArtworks(list, currentUser);

  if (isSupabaseConfigured() && supabase && currentUser?.email) {
    supabase
      .from('artworks')
      .delete()
      .eq('user_email', currentUser.email)
      .eq('notes->>client_id', id)
      .catch(err => console.warn('[Supabase] Delete sync notice:', err));
  }

  return list;
}

// 5. Supabase 클라우드에서 최신 작품 목록 불러오기 & 동기화
export async function syncArtworksFromSupabase(user = null) {
  const currentUser = user || getStoredUser();
  if (!isSupabaseConfigured() || !supabase) return getArtworks(currentUser);
  
  if (!currentUser?.email) return getArtworks(currentUser);

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('user_email', currentUser.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch artworks:', error);
      return getArtworks(currentUser);
    }

    if (data && data.length > 0) {
      const statusMap = {
        '판매완료': 'sold',
        '비매품': 'nfs',
        '전시중': 'exhibited',
        '보관중': 'available'
      };

      const cloudArtworks = data.map(item => {
        let extra = {};
        try {
          if (item.notes) extra = JSON.parse(item.notes);
        } catch (_) {}

        const computedStatus = extra.status || statusMap[item.status] || (item.status === '비매품' ? 'nfs' : 'available');

        return {
          id: extra.client_id || item.id,
          title: item.title,
          artist: extra.artist || currentUser.name || '작가',
          year: item.year || '',
          medium: item.medium || '',
          size: extra.size || '',
          status: computedStatus,
          isNfs: computedStatus === 'nfs',
          isSold: computedStatus === 'sold',
          isExhibited: computedStatus === 'exhibited',
          price: item.price ? Number(item.price).toLocaleString() + '원' : '가격 협의',
          location: extra.location || '',
          imageUrl: item.image_url || '',
          statement: extra.statement || '',
          instaCaption: extra.instaCaption || '',
          blogStory: extra.blogStory || '',
          createdAt: item.created_at ? item.created_at.split('T')[0] : ''
        };
      });

      saveArtworks(cloudArtworks, currentUser);
      return cloudArtworks;
    }
  } catch (err) {
    console.warn('[Supabase] Cloud sync error:', err);
  }

  return getArtworks(currentUser);
}

// 6. 전체 데이터 백업 JSON 다운로드
export function exportArchiveBackup(user = null) {
  const currentUser = user || getStoredUser();
  const data = getArtworks(currentUser);
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  const artistName = currentUser?.name || '작가';
  a.download = `Sujango_${artistName}_수장고_백업_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 7. 백업 JSON 파일로부터 복원
export function importArchiveBackup(file, user = null) {
  const currentUser = user || getStoredUser();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) {
          saveArtworks(parsed, currentUser);
          resolve(parsed);
        } else {
          reject(new Error('올바른 Sujango 백업 파일 형식이 아닙니다.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
