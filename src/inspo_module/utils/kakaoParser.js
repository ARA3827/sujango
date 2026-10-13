// src/utils/kakaoParser.js

/**
 * 카카오톡 대화 내용 내보내기 텍스트 파일(.txt)을 파싱하여 카드 후보 목록으로 변환
 * @param {string} rawText 
 * @returns {Array} 파싱된 문장 후보 목록
 */
export function parseKakaoChatText(rawText) {
  if (!rawText || typeof rawText !== "string") return [];

  const lines = rawText.split(/\r?\n/);
  const messages = [];
  let currentDate = new Date().toISOString().slice(0, 10);

  // 카카오톡 날짜 구분선 패턴 (예: --------------- 2026년 10월 12일 월요일 ---------------)
  const dateHeaderRegex = /-{3,}\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일.*?-{3,}/;
  
  // 카카오톡 일반 메시지 패턴 1: [이름] [오전/오후 10:20] 내용
  const msgPattern1 = /^\[(.*?)\]\s*\[(오전|오후|\d{1,2}:\d{2}).*?\]\s*(.*)$/;
  
  // 카카오톡 메시지 패턴 2: 2026. 10. 12. 15:30, 이름 : 내용
  const msgPattern2 = /^(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*\d{1,2}:\d{2}),\s*(.*?)\s*:\s*(.*)$/;

  let currentMsg = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 날짜 헤더 체크
    const dateMatch = line.match(dateHeaderRegex);
    if (dateMatch) {
      const year = dateMatch[1];
      const month = dateMatch[2].padStart(2, '0');
      const day = dateMatch[3].padStart(2, '0');
      currentDate = `${year}-${month}-${day}`;
      continue;
    }

    // 메시지 패턴 1 매칭
    const match1 = line.match(msgPattern1);
    if (match1) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = {
        sender: match1[1],
        content: match1[3],
        date: currentDate
      };
      continue;
    }

    // 메시지 패턴 2 매칭
    const match2 = line.match(msgPattern2);
    if (match2) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = {
        sender: match2[2],
        content: match2[3],
        date: currentDate
      };
      continue;
    }

    // 멀티라인 메시지인 경우 이전 메시지에 누적
    if (currentMsg) {
      currentMsg.content += "\n" + line;
    } else if (line.length >= 8) {
      // 일반 줄글 텍스트일 때 직접 후보로 취급
      messages.push({
        sender: "나",
        content: line,
        date: currentDate
      });
    }
  }

  if (currentMsg) {
    messages.push(currentMsg);
  }

  // 문장 후보 정제 및 지능형 필터링
  const candidates = [];
  const colorKeys = ["peach", "butter", "sage", "lavender", "sky", "rose"];

  messages.forEach((m, idx) => {
    let text = m.content.trim();
    // 이모티콘 단독, 사진, 동영상 전송 문구 필터링
    if (text === "이모티콘" || text === "사진" || text === "동영상" || text === "음성메시지" || text.startsWith("http")) {
      return;
    }
    // 너무 짧은 단순 대화(ㅇㅇ, 넹 등) 제외
    if (text.length < 10) return;

    // 카테고리 자동 추론
    let category = "thought";
    let workTitle = "나와의 채팅 메모";
    let creator = m.sender || "나";

    if (/책|도서|지은이|출판사|페이지|p\.|독서/i.test(text)) {
      category = "book";
      workTitle = "책 속 한 줄";
    } else if (/영화|감독|배우|시네마|무비|극장/i.test(text)) {
      category = "movie";
      workTitle = "영화 속 명대사";
    } else if (/드라마|방영|시즌|에피소드|tv|넷플릭스|티빙/i.test(text)) {
      category = "tv";
      workTitle = "드라마 속 명대사";
    }

    // 따옴표로 감싸진 경우 핵심 문장 추출 시도
    const quoteMatch = text.match(/["“「'](.*?)["”」']/);
    let extractedQuote = text;
    let memo = "";

    if (quoteMatch && quoteMatch[1].length > 10) {
      extractedQuote = quoteMatch[1];
      memo = text.replace(quoteMatch[0], "").trim();
    }

    // 출처 표기 정제 (예: - 헤어질 결심, 박찬욱 등 끝에 붙은 경우)
    const authorSplit = extractedQuote.split(/\n\s*[-—~]\s*/);
    if (authorSplit.length > 1) {
      extractedQuote = authorSplit[0].trim();
      const metaPart = authorSplit.slice(1).join(" ").trim();
      if (!memo) memo = `출처 표기: ${metaPart}`;
      if (metaPart.includes("<") && metaPart.includes(">")) {
        const titleMatch = metaPart.match(/<([^>]+)>/);
        if (titleMatch) workTitle = titleMatch[1];
      }
    }

    // 태그 자동 생성
    const tags = [];
    if (/사랑|이별|그리움|연인/.test(text)) tags.push("사랑");
    if (/위로|힘|용기|토닥/.test(text)) tags.push("위로");
    if (/성공|도전|열정|시작|창업/.test(text)) tags.push("도전");
    if (/생각|성찰|삶|인생/.test(text)) tags.push("인생");
    if (tags.length === 0) tags.push("영감");

    candidates.push({
      id: `kakao-${Date.now()}-${idx}`,
      category,
      text: extractedQuote,
      workTitle,
      creator,
      context: `카카오톡 기록 (${m.date})`,
      userThought: memo || "카카오톡 나와의 채팅에서 가져온 소중한 문장",
      tags,
      date: m.date || new Date().toISOString().slice(0, 10),
      isFavorite: false,
      colorTheme: colorKeys[idx % colorKeys.length]
    });
  });

  return candidates;
}
