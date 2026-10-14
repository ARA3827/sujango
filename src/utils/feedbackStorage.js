import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getStoredUser } from './authStorage';

const FEEDBACK_STORAGE_KEY = 'artflow_community_feedbacks';

// 초기 기본 품격 있는 현장 작가 찐 후기 3건 (초기 썰렁함 방지용 시드 데이터)
const SEED_FEEDBACKS = [
  {
    id: 'fb-1',
    author: '김현우 (서양화 작가)',
    type: 'review', // 'review' | 'idea'
    rating: 5,
    text: '전시회 때마다 캡션 명패 사이즈 맞추고 자르는 게 제일 번거로웠는데, 수장고에서 A4 규격으로 일괄 인쇄하니까 전시 준비가 훨씬 편해졌습니다.',
    status: '전시중',
    createdAt: '2026-10-12'
  },
  {
    id: 'fb-2',
    author: '이지은 (도예·공예 아티스트)',
    type: 'review',
    rating: 5,
    text: '인스타그램 캡션이랑 평론 작가노트 쓰는 게 늘 막막했는데, 작품 키워드 3개만 넣으면 공모전용과 SNS용 글이 동시에 깔끔하게 나와서 놀랐습니다.',
    status: '전시중',
    createdAt: '2026-10-10'
  },
  {
    id: 'fb-3',
    author: '박서준 (현대 조각가)',
    type: 'idea',
    rating: 5,
    text: '클라이언트나 갤러리 미팅할 때 1080px 워터마크 찍힌 7일 만료 보안 링크로 보내니까 원본 도용 걱정 없이 안심하고 시안을 보낼 수 있어 든든합니다.',
    status: '반영완료',
    createdAt: '2026-10-08'
  }
];

/**
 * 전체 작가 피드백 및 후기 목록 가져오기
 */
export function getFeedbacks() {
  try {
    const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load feedbacks:', e);
  }
  return SEED_FEEDBACKS;
}

/**
 * 새 피드백 / 후기 등록 (로컬 영구 저장 + Supabase 클라우드 백업)
 */
export async function addFeedback({ author, type = 'review', text, rating = 5 }) {
  const newFeedback = {
    id: 'fb-' + Date.now(),
    author: author.trim() || '익명의 예술가',
    type,
    rating: Number(rating) || 5,
    text: text.trim(),
    status: type === 'idea' ? '검토중' : '전시중',
    createdAt: new Date().toISOString().split('T')[0]
  };

  const list = getFeedbacks();
  const updated = [newFeedback, ...list];

  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save feedback locally:', e);
  }

  // Supabase 클라우드 동기화 시도 (설정된 경우)
  if (isSupabaseConfigured() && supabase) {
    const user = getStoredUser();
    try {
      await supabase.from('feedbacks').insert({
        user_email: user?.email || 'guest_artist',
        author: newFeedback.author,
        type: newFeedback.type,
        text: newFeedback.text,
        rating: newFeedback.rating
      });
    } catch (err) {
      console.warn('Supabase feedback sync skipped:', err);
    }
  }

  return newFeedback;
}
