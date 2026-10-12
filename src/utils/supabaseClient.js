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
