// Kakao JavaScript SDK 소셜 로그인 헬퍼 유틸리티

const KAKAO_KEY_STORAGE = 'sujango_kakao_js_key';

// 저장된 Kakao JavaScript 키 조회
export function getKakaoJsKey() {
  try {
    return localStorage.getItem(KAKAO_KEY_STORAGE) || import.meta.env.VITE_KAKAO_JS_KEY || '';
  } catch (e) {
    return '';
  }
}

// Kakao JavaScript 키 저장
export function saveKakaoJsKey(key) {
  try {
    if (key) {
      localStorage.setItem(KAKAO_KEY_STORAGE, key.trim());
      // SDK 재초기화 시도
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(key.trim());
      }
    } else {
      localStorage.removeItem(KAKAO_KEY_STORAGE);
    }
  } catch (e) {
    console.error('Failed to save Kakao key:', e);
  }
}

// Kakao SDK 초기화
export function initKakaoSdk() {
  const key = getKakaoJsKey();
  if (window.Kakao && key) {
    try {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(key);
      }
      return true;
    } catch (e) {
      console.warn('Kakao init error:', e);
    }
  }
  return false;
}

// Kakao 로그인 실행
export function loginWithKakao(onSuccess, onError) {
  const key = getKakaoJsKey();
  if (!window.Kakao) {
    onError?.('카카오 SDK가 로드되지 않았습니다.');
    return;
  }

  // 아직 키가 없는 경우
  if (!key) {
    onError?.('NEED_KEY');
    return;
  }

  try {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(key);
    }

    if (!window.Kakao.Auth || typeof window.Kakao.Auth.login !== 'function') {
      onError?.('카카오 SDK 초기화 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    window.Kakao.Auth.login({
      throughTalk: false,
      success: function (authObj) {
        // 사용자 정보 요청
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: function (res) {
            const kakaoAccount = res.kakao_account || {};
            const profile = kakaoAccount.profile || {};
            
            const kakaoUser = {
              id: `kakao-${res.id || Date.now()}`,
              name: profile.nickname || '카카오 창작자',
              email: kakaoAccount.email || `${res.id}@kakao.com`,
              avatarUrl: profile.profile_image_url || profile.thumbnail_image_url || '',
              role: '창작 예술가',
              membership: 'Free Artist',
              isPro: false,
              provider: 'kakao',
              signedAt: new Date().toISOString()
            };

            onSuccess?.(kakaoUser);
          },
          fail: function (error) {
            console.error('Kakao profile request error:', error);
            onError?.(error?.msg || '카카오 사용자 정보를 가져오지 못했습니다.');
          }
        });
      },
      fail: function (err) {
        console.error('Kakao login fail:', err);
        const errMsg = err?.error_description || err?.msg || '카카오 로그인에 실패했습니다. (카카오 로그인 활성화 상태를 확인해 주세요)';
        onError?.(errMsg);
      }
    });
  } catch (e) {
    console.error('Kakao login error:', e);
    onError?.(`카카오 로그인 오류: ${e.message || '도메인 및 활성화 설정을 확인해 주세요.'}`);
  }
}
