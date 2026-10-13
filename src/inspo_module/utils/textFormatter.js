// src/utils/textFormatter.js

/**
 * 마침표(.), 물음표(?), 느낌표(!) 뒤에서 자연스럽게 한 문장씩 줄바꿈되도록 텍스트를 정돈
 * (단, 사용자가 이미 직접 엔터를 친 경우는 기존 줄바꿈을 보존)
 * @param {string} text 
 * @returns {string} 줄바꿈이 정돈된 텍스트
 */
export function formatSentenceBreak(text) {
  if (!text || typeof text !== "string") return "";

  // 이미 줄바꿈이 포함되어 있다면 사용자의 의도를 존중하여 그대로 유지
  if (text.includes("\n")) {
    return text.trim();
  }

  // 문장 부호(?, !, .) 뒤에 공백이 오는 경우 줄바꿈으로 변환
  // 따옴표(”, ", ')가 부호 바로 뒤에 붙은 경우도 고려: (예: 사랑한다고 했어요?" -> 줄바꿈)
  const formatted = text
    .replace(/([.?!]["”'’]?)\s+(?=[가-힣A-Za-z0-9"“'‘])/g, "$1\n")
    .trim();

  return formatted;
}
