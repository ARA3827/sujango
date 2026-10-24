/**
 * 수장고(Sujango) 관리자 권한 및 마스터 키 유틸리티
 */

// 공식 관리자 대표님 이메일 목록
export const ADMIN_EMAILS = [
  'auth@sujango.com',
  'digitalnote38@gmail.com',
  'ara.agent.lab@gmail.com'
];

// 관리자 마스터 핀코드 (수장고 고유 포트 5198)
export const ADMIN_MASTER_PIN = '5198';

/**
 * 현재 로그인한 사용자가 관리자인지 검증
 */
export function isAdminUser(user) {
  if (!user || !user.email) return false;
  const normalized = user.email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalized);
}

/**
 * 핀코드를 통한 관리자 세션 인증 (로컬 세션)
 */
export function checkAdminPin(pin) {
  return pin === ADMIN_MASTER_PIN;
}
