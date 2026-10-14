import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkzacvmcqpytludkdpm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 인스턴스
export const supabase = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Supabase 연결 활성화 여부 확인
 */
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * 로그인한 작가 프로필을 Supabase profiles 테이블에 자동 동기화
 */
export async function syncUserProfile(user) {
  if (!isSupabaseConfigured() || !supabase || !user?.email) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_email: user.email,
        artist_name: user.name || '작가',
        avatar_url: user.avatarUrl || '',
        is_pro: Boolean(user.isPro),
        plan_tier: user.planTier || (user.isPro ? 'pro' : 'free'),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_email'
      })
      .select();

    if (error) {
      console.warn('[Supabase] Profile sync notice:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] Profile sync error:', err);
    return null;
  }
}

/**
 * 작가의 워터마크 설정 조회
 */
export async function fetchWatermarkSettings(userEmail) {
  if (!isSupabaseConfigured() || !supabase || !userEmail) {
    // 로컬스토리지 폴백 지원
    const local = localStorage.getItem(`artflow_watermark_${userEmail}`);
    return local ? JSON.parse(local) : null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('watermark_type, watermark_text, watermark_image_url, watermark_opacity, watermark_position')
      .eq('user_email', userEmail)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] 워터마크 설정 조회 폴백:', err);
    const local = localStorage.getItem(`artflow_watermark_${userEmail}`);
    return local ? JSON.parse(local) : null;
  }
}

/**
 * 작가의 워터마크 설정 저장 (클라우드 + 로컬 하이브리드)
 */
export async function saveWatermarkSettings(userEmail, settings) {
  // 로컬스토리지 우선 백업
  try {
    localStorage.setItem(`artflow_watermark_${userEmail}`, JSON.stringify(settings));
  } catch (e) {
    console.warn('로컬 워터마크 저장 실패:', e);
  }

  if (!isSupabaseConfigured() || !supabase || !userEmail) return settings;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        watermark_type: settings.watermark_type || 'text',
        watermark_text: settings.watermark_text || '© 2026 Artist. All rights reserved',
        watermark_image_url: settings.watermark_image_url || null,
        watermark_opacity: settings.watermark_opacity ?? 0.35,
        watermark_position: settings.watermark_position || 'center_diagonal',
        updated_at: new Date().toISOString()
      })
      .eq('user_email', userEmail)
      .select();

    if (error) throw error;
    return data?.[0] || settings;
  } catch (err) {
    console.warn('[Supabase] 워터마크 설정 저장 실패 (로컬 유지):', err);
    return settings;
  }
}

/**
 * 클라이언트용 보안 공유 링크 생성 (로컬스토리지 100% 선저장 + Supabase 비동기 연동)
 */
export async function createShareLink({ userEmail, artworkId, clientName, expiresInDays = 7, pinCode = '', allowDownload = false }) {
  const shareToken = 'art_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const newLink = {
    user_email: userEmail,
    artwork_id: artworkId,
    share_token: shareToken,
    client_name: clientName || '클라이언트 시안 검토',
    expires_at: expiresAt,
    pin_code: pinCode ? String(pinCode).trim() : null,
    allow_download: Boolean(allowDownload),
    status: 'active',
    created_at: new Date().toISOString()
  };

  // 1. 로컬스토리지에 무조건 1순위 선(先) 저장 (오프라인/클라우드 에러 완벽 방어)
  try {
    const localLinks = JSON.parse(localStorage.getItem('artflow_share_links') || '[]');
    const filtered = localLinks.filter(l => l.share_token !== shareToken);
    filtered.push(newLink);
    localStorage.setItem('artflow_share_links', JSON.stringify(filtered));
  } catch (e) {
    console.warn('로컬 공유 링크 저장 실패:', e);
  }

  // 2. Supabase가 설정되어 있으면 클라우드에도 저장 시도
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('share_links')
        .insert(newLink)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[Supabase] 공유 링크 클라우드 동기화 폴백 (로컬 보존):', err);
    }
  }

  return newLink;
}

