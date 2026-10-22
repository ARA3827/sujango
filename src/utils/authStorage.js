// Sujango (수장고) 작가 인증 및 로컬 영구 사용자 저장소

const AUTH_KEY = 'artflow_auth_user';
const USERS_DB_KEY = 'sujango_registered_users_vault';

export const DEMO_USER = {
  id: 'user-ara',
  name: '김아라',
  role: '서양화가 / 회화 작가',
  email: 'ara.kim@sujango.com',
  isPro: true,
  membership: 'Pro Artist',
  avatarUrl: ''
};

/**
 * 작가 계정별 독립 비밀 금고 키 생성 (멀티 테넌트 완벽 격리)
 */
export function getUserScopedKey(baseKey, user = null) {
  const currentUser = user || getStoredUser();
  if (!currentUser || !currentUser.email) {
    return `${baseKey}_guest`;
  }
  const safeEmail = (currentUser.email || '').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  return `${baseKey}_${safeEmail}`;
}

/**
 * 현재 로그인된 사용자 정보 조회
 */
export function getStoredUser() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to get user:', e);
  }
  return null; // 기본 상태: 비로그인(게스트)
}

/**
 * 현재 로그인된 사용자 세션 저장
 */
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

/**
 * 등록된 전체 회원 목록 조회
 */
export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * 등록된 회원 목록 영구 저장
 */
function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users database:', e);
  }
}

/**
 * 이메일로 등록된 사용자 조회
 */
export function findRegisteredUser(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return null;
  const users = getRegisteredUsers();
  return users.find(u => (u.email || '').toLowerCase() === cleanEmail) || null;
}

/**
 * 소셜(Google 등) 사용자 등록 또는 기존 활동명 유지 업데이트
 */
export function saveOrUpdateSocialUser(socialUser) {
  const cleanEmail = (socialUser.email || '').trim().toLowerCase();
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);

  if (existingIndex >= 0) {
    const existing = users[existingIndex];
    const updatedUser = {
      ...existing,
      ...socialUser,
      // 작가님이 한 번 설정한 소중한 활동명을 최우선으로 영구 보존
      name: existing.name || socialUser.name || '작가'
    };
    users[existingIndex] = updatedUser;
    saveRegisteredUsers(users);
    saveUser(updatedUser);
    return updatedUser;
  } else {
    const newUser = {
      ...socialUser,
      email: cleanEmail,
      id: socialUser.id || `user-google-${Date.now()}`,
      name: (socialUser.name || '').trim() || '작가',
      role: '창작 예술가',
      membership: 'Free Artist',
      isPro: false,
      signedAt: new Date().toISOString()
    };
    users.push(newUser);
    saveRegisteredUsers(users);
    saveUser(newUser);
    return newUser;
  }
}

/**
 * 1. 로컬 영구 회원가입 (오프라인 및 클라우드 지연 시 100% 보장)
 */
export function registerLocalUser(email, password, name = '작가') {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('이메일 주소를 입력해 주세요.');
  }
  if (!password || password.trim().length < 6) {
    throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
  }

  const users = getRegisteredUsers();
  const existing = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('이미 등록된 이메일입니다. [기존 계정 로그인]을 진행해 주세요.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: (name || '').trim() || '작가',
    email: cleanEmail,
    password: password.trim(),
    role: '창작 예술가',
    membership: 'Free Artist',
    isPro: false,
    avatarUrl: '',
    provider: 'email',
    signedAt: new Date().toISOString()
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // 현재 사용자 세션 즉시 저장 (비밀번호 제외)
  const safeUser = { ...newUser };
  delete safeUser.password;
  saveUser(safeUser);
  return safeUser;
}

/**
 * 2. 로컬 영구 로그인
 */
export function loginLocalUser(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  const users = getRegisteredUsers();
  const found = users.find(u => (u.email || '').toLowerCase() === cleanEmail);

  if (!found) {
    throw new Error('가입되지 않은 이메일입니다. [새 계정 회원가입]을 먼저 진행해 주세요.');
  }

  if (found.password !== cleanPassword) {
    throw new Error('비밀번호가 올바르지 않습니다. 다시 확인해 주세요.');
  }

  const safeUser = { ...found };
  delete safeUser.password;
  saveUser(safeUser);
  return safeUser;
}

/**
 * 3. 현재 로그인된 작가 프로필(이름, 역할 등) 수정 및 로컬 DB 영구 동기화
 */
export function updateUserProfile(updates = {}) {
  const currentUser = getStoredUser();
  if (!currentUser) return null;

  const updatedUser = {
    ...currentUser,
    ...updates
  };

  saveUser(updatedUser);

  // 전체 등록 회원 목록에도 안전하게 반영
  try {
    const users = getRegisteredUsers();
    const cleanEmail = (currentUser.email || '').trim().toLowerCase();
    const index = users.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);
    if (index >= 0) {
      users[index] = { ...users[index], ...updates };
      saveRegisteredUsers(users);
    }
  } catch (e) {
    console.error('Failed to sync updated user in database:', e);
  }

  return updatedUser;
}

