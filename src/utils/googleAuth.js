// Google Identity Services (GIS) 소셜 로그인 헬퍼 유틸리티

const GOOGLE_CLIENT_ID_KEY = 'sujango_google_client_id';
export const DEFAULT_GOOGLE_CLIENT_ID = '433294194712-f2gtl99p5s7kc0mtqfiukq2d3gut26cc.apps.googleusercontent.com';

// 저장된 Google Client ID 조회 (Vite 환경변수 또는 프로젝트 기본값 또는 LocalStorage)
export function getGoogleClientId() {
  try {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  } catch (e) {
    return DEFAULT_GOOGLE_CLIENT_ID;
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

/**
 * Google 공식 OAuth2 팝업 로그인 실행 (Token Client)
 */
export function loginWithGoogle(onSuccess, onError) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    onError?.('Google 클라이언트 ID가 설정되지 않았습니다.');
    return;
  }

  if (!window.google?.accounts?.oauth2) {
    onError?.('Google 서비스 로드 중입니다. 잠시 후 다시 시도해 주세요.');
    return;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile openid',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          console.error('Google OAuth error:', tokenResponse);
          const errDetail = tokenResponse.error_description || tokenResponse.error;
          onError?.(`Google 로그인 오류: ${errDetail}`);
          return;
        }

        if (!tokenResponse.access_token) {
          onError?.('Google 인증 토큰을 수신하지 못했습니다.');
          return;
        }

        try {
          // Google userinfo API로 사용자 프로필(실제 이메일, 이름, 사진) 획득
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`
            }
          });

          if (!res.ok) {
            throw new Error(`Google API 응답 에러 (${res.status})`);
          }

          const data = await res.json();
          const googleUser = {
            id: `google-${data.sub || Date.now()}`,
            name: data.name || '창작 예술가',
            email: data.email || '',
            avatarUrl: data.picture || '',
            role: '창작 예술가',
            membership: 'Free Artist',
            isPro: false,
            provider: 'google',
            signedAt: new Date().toISOString()
          };

          onSuccess?.(googleUser);
        } catch (fetchErr) {
          console.error('Failed to fetch userinfo from Google:', fetchErr);
          onError?.('Google 프로필 정보를 가져오는 중 오류가 발생했습니다.');
        }
      }
    });

    tokenClient.requestAccessToken();
  } catch (err) {
    console.error('Google Token Client init error:', err);
    onError?.(err?.message || 'Google 로그인 창을 열지 못했습니다.');
  }
}
