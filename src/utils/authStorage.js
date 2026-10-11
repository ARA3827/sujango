const AUTH_KEY = 'artflow_auth_user';

export const DEMO_USER = {
  id: 'user-ara',
  name: '김아라',
  role: '서양화가 / 회화 작가',
  email: 'ara.kim@artflow.studio',
  isPro: true,
  membership: 'Pro Artist',
  avatarUrl: ''
};

export function getStoredUser() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to get user:', e);
  }
  return null; // 기본 상태: 비로그인(게스트)
}

export function saveUser(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch (e) {
    console.error('Failed to save user:', e);
  }
}
