/**
 * Sujango (수장고) 한국 전통색 테마 설정 (Korean Traditional Colors)
 * 
 * 모든 카드의 배경 밝기(Lightness 94~95%)와 채도를 동일한 수준으로 조율하여
 * 어느 카드도 혼자 튀지 않고, 한옥과 옛 화폭의 창호지처럼 단아하고 그윽한 통일감을 유지합니다.
 * 
 * 색상 변경이나 조율이 필요할 때 이 파일의 값만 수정하면
 * 메인 랜딩 페이지와 대시보드 전체에 일괄 반영됩니다.
 */

export const TRADITIONAL_COLORS = {
  // 1. 나의 작품 수장고 (먹색 / 墨色)
  archive: {
    id: 'archive',
    name: '먹색',
    hanja: '墨色',
    bg: '#F4F3F0',
    accent: '#3F3B36',
    border: '#E4E2DC',
    tagColor: '#3F3B36',
    tagBg: 'rgba(255, 255, 255, 0.92)',
    iconBg: '#EAE8E3',
    iconColor: '#3F3B36'
  },

  // 2. 전시 캡션 출력기 (쪽빛 / 藍色)
  caption: {
    id: 'caption',
    name: '쪽빛',
    hanja: '藍色',
    bg: '#EEF2F6',
    accent: '#3D5A80',
    border: '#DCE4ED',
    tagColor: '#3D5A80',
    tagBg: 'rgba(255, 255, 255, 0.92)',
    iconBg: '#E1E9F1',
    iconColor: '#3D5A80'
  },

  // 3. 서류·출강 스튜디오 (송화색 / 松花色)
  doc: {
    id: 'doc',
    name: '송화색',
    hanja: '松花色',
    bg: '#F6F4E8',
    accent: '#7A6F2E',
    border: '#E7E4D0',
    tagColor: '#7A6F2E',
    tagBg: 'rgba(255, 255, 255, 0.92)',
    iconBg: '#EDEAD6',
    iconColor: '#7A6F2E'
  },

  // 4. 창작 가계부 (황토색 / 黃土色)
  tax: {
    id: 'tax',
    name: '황토색',
    hanja: '黃土色',
    bg: '#F8F1E6',
    accent: '#A0703A',
    border: '#EADECF',
    tagColor: '#A0703A',
    tagBg: 'rgba(255, 255, 255, 0.92)',
    iconBg: '#EFE5D5',
    iconColor: '#A0703A'
  },

  // 5. 작가노트 & SNS (연지색 / 臙脂色)
  statement: {
    id: 'statement',
    name: '연지색',
    hanja: '臙脂色',
    bg: '#F7EFEF',
    accent: '#9E5A5A',
    border: '#E8DCDC',
    tagColor: '#9E5A5A',
    tagBg: 'rgba(255, 255, 255, 0.92)',
    iconBg: '#EEE2E2',
    iconColor: '#9E5A5A'
  },

  // 6. 영감 노트 (청자색 / 靑磁色)
  inspo: {
    id: 'inspo',
    name: '청자색',
    hanja: '靑磁色',
    bg: '#EEF4F1',
    accent: '#4F7F6E',
    border: '#DCE7E1',
    tagColor: '#4F7F6E',
    tagBg: 'rgba(255, 255, 255, 0.92)',
    iconBg: '#DFEAE4',
    iconColor: '#4F7F6E'
  }
};

/**
 * 기능 ID로 전통색 테마 조회 (기본값: 먹색)
 */
export function getTraditionalColor(toolId) {
  return TRADITIONAL_COLORS[toolId] || TRADITIONAL_COLORS.archive;
}
