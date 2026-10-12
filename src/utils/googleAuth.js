// Google Identity Services (GIS) 소셜 로그인 헬퍼 유틸리티

const GOOGLE_CLIENT_ID_KEY = 'sujango_google_client_id';

// 저장된 Google Client ID 조회 (LocalStorage 또는 Vite 환경변수)
export function getGoogleClientId() {
  try {
    return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  } catch (e) {
    return '';
  }
}

// Google Client ID 저장
export function saveGoogleClientId(clientId) {
  try {
    if (clientId) {
      localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
    } else {
      localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
    }
  } catch (e) {
    console.error('Failed to save Google Client ID:', e);
  }
}

// Google JWT (ID 토큰) Base64 디코딩
export function decodeJwtResponse(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT token:', e);
    return null;
  }
}

// Google 인증 정보를 Sujango 유저 객체로 정규화
export function formatGoogleUser(decodedPayload) {
  if (!decodedPayload) return null;
  return {
    id: `google-${decodedPayload.sub || Date.now()}`,
    name: decodedPayload.name || '구글 창작자',
    email: decodedPayload.email || '',
    avatarUrl: decodedPayload.picture || '',
    role: '창작 예술가',
    membership: 'Free Artist',
    isPro: false,
    provider: 'google',
    signedAt: new Date().toISOString()
  };
}
