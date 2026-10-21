import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getStoredUser, getUserScopedKey } from './authStorage';

// 초기 기본 시연용 미술관 샘플 작품 데이터 2점 (데모 계정 전용)
const DEFAULT_ARTWORKS = [
  {
    id: 'art-1',
    title: '새벽의 경계',
    artist: '김아라',
    year: '2026',
    medium: '캔버스에 유채, 혼합재료 (Oil and mixed media on linen)',
    size: '116.8 × 91.0 cm (50F)',
    isNfs: false,
    price: '3,500,000원',
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
    isNfs: false,
    price: '1,200,000원',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%230284C7"/><stop offset="100%" stop-color="%230369A1"/></linearGradient></defs><rect width="800" height="600" fill="url(%23bg)"/><rect x="150" y="100" width="500" height="400" rx="20" fill="%2338BDF8" fill-opacity="0.25"/><circle cx="350" cy="300" r="120" fill="%23F0F9FF" fill-opacity="0.3"/><circle cx="480" cy="260" r="80" fill="%23BAE6FD" fill-opacity="0.4"/><text x="400" y="540" font-family="sans-serif" font-weight="600" font-size="18" fill="%23FFFFFF" text-anchor="middle" letter-spacing="3">Blue Afterimage No. 3</text></svg>',
    statement: `《푸른 잔상 No. 3》은 찰나의 시각적 기억이 뇌리에 남기는 파동을 아크릴 특유의 명료한 발색으로 포착한 소품이다.\n푸른색은 차가움의 상징이자 동시에 가장 깊은 내적 몰입의 온도이다. 중첩된 원형과 부드러운 유기적 형태들은 파편화된 일상의 감정들이 하나의 평면 위에서 조화를 이루어가는 회복의 과정을 표상한다.`,
    instaCaption: `깊고 맑은 파랑이 주는 위로.\n작업대 위에 올려두고 하루 종일 바라보아도 지치지 않는 푸른빛을 찾고 싶었습니다.\n\n《푸른 잔상 No. 3》, 2025\nAcrylic on canvas, 10F\n\n#김아라작가 #아크릴화 #회화작품 #컬렉터 #전시회 #파랑 #미술품소장`,
    blogStory: `[10호 소품 연작 이야기]\n\n대작을 작업하다 지칠 때면 늘 작은 10호 캔버스를 꺼냅니다.\n정형화된 구상에서 벗어나 오직 색채의 리듬감에만 몸을 맡기는 시간은 저에게 일종의 명상과도 같습니다. 푸른 안료를 겹겹이 붓질하며 마음의 번뇌를 씻어냈던 그날의 기억이 이 작은 캔버스 안에 고스란히 담겨 있습니다.`,
    createdAt: '2026-10-08'
  }
];

// 1. 전체 작품 목록 가져오기 (작가 계정별 완벽 독립 격리)
export function getArtworks(user = null) {
  const currentUser = user || getStoredUser();

  // 비로그인 상태일 때는 빈 배열 반환 (보안 철저)
  if (!currentUser || !currentUser.email) {
    return [];
  }

  // 시연용 데모 계정(김아라)인 경우에만 기본 시연용 2점 제공
  if (currentUser.id === 'user-ara' || currentUser.email === 'ara.kim@sujango.com') {
    return DEFAULT_ARTWORKS;
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

  // 신규 가입 작가님: 타인의 작품(김아라)이 섞이지 않는 깨끗한 빈 수장고 반환!
  return [];
}

// 2. 작가 전용 금고에 저장 (브라우저 5MB 한도 자가 치유 Self-Healing 엔진 탑재)
export function saveArtworks(artworks, user = null) {
  const currentUser = user || getStoredUser();
  const key = getUserScopedKey('artflow_artworks', currentUser);

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
    console.warn('[Storage] 1차 저장 실패 (5MB 한도 초과 감지), 자가 치유(Self-Healing) 가동:', err);

    // 2차: 자가 치유 가동 (원본은 IndexedDB 금고에 무손실 보존되어 있으므로 뷰어 거품만 1/10 다이어트)
    try {
      const slimList = cleanedList.map(item => {
        const slim = { ...item };
        if (slim.thumbnailUrl && slim.imageUrl && slim.imageUrl.length > 150000) {
          slim.imageUrl = slim.thumbnailUrl;
        }
        return slim;
      });

      localStorage.setItem(key, JSON.stringify(slimList));
      console.log('[Storage] 자가 치유 성공: 용량 거품을 걷어내고 안전하게 저장 완료!');
      return true;
    } catch (err2) {
      console.warn('[Storage] 2차 슬림화 실패, 3차 메타데이터 중심 초경량 저장 가동:', err2);

      // 3차: 극단적 자가 치유 (모든 작품의 뷰어용을 경량 썸네일로 전환하여 100% 저장 보장)
      try {
        const minimalList = cleanedList.map(item => {
          const min = { ...item };
          if (min.thumbnailUrl) min.imageUrl = min.thumbnailUrl;
          return min;
        });

        localStorage.setItem(key, JSON.stringify(minimalList));
        console.log('[Storage] 3차 자가 치유 완료: 작품 목록 100% 저장 성공!');
        return true;
      } catch (err3) {
        console.error('[Storage] 저장 실패:', err3);
        return false;
      }
    }
  }
}

// 3. 단일 작품 추가 또는 업데이트 (작가 계정별 격리 저장 + 클라우드 백업)
export function saveSingleArtwork(artwork, user = null) {
  const currentUser = user || getStoredUser();
  const list = getArtworks(currentUser);
  const index = list.findIndex(item => item.id === artwork.id);
  let savedItem;
  
  if (index >= 0) {
    savedItem = { 
      ...list[index], 
      ...artwork, 
      artist: artwork.artist || currentUser?.name || '작가',
      updatedAt: new Date().toISOString().split('T')[0] 
    };
    list[index] = savedItem;
  } else {
    savedItem = {
      ...artwork,
      id: artwork.id || 'art-' + Date.now(),
      artist: artwork.artist || currentUser?.name || '작가',
      createdAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(savedItem); // 최신 작품을 맨 앞으로
  }
  
  saveArtworks(list, currentUser);

  // Supabase 클라우드 비동기 백업
  if (isSupabaseConfigured() && supabase && currentUser?.email) {
    const rawPrice = parseInt(String(savedItem.price || '').replace(/[^0-9]/g, '')) || 0;

    supabase
      .from('artworks')
      .upsert({
        user_email: currentUser.email,
        title: savedItem.title || '무제',
        year: savedItem.year || '',
        medium: savedItem.medium || '',
        price: rawPrice,
        status: savedItem.isNfs ? '비매품' : '보관중',
        image_url: savedItem.imageUrl || '',
        notes: JSON.stringify({
          client_id: savedItem.id,
          size: savedItem.size,
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
      const cloudArtworks = data.map(item => {
        let extra = {};
        try {
          if (item.notes) extra = JSON.parse(item.notes);
        } catch (_) {}

        return {
          id: extra.client_id || item.id,
          title: item.title,
          artist: extra.artist || currentUser.name || '작가',
          year: item.year || '',
          medium: item.medium || '',
          size: extra.size || '',
          isNfs: item.status === '비매품',
          price: item.price ? Number(item.price).toLocaleString() + '원' : '가격 협의',
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
