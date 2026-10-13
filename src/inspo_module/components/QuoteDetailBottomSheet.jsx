// src/components/QuoteDetailBottomSheet.jsx
import React, { useState } from "react";
import { X, Heart, Trash2, Copy, Check } from "lucide-react";
import { formatSentenceBreak } from "../utils/textFormatter";
import confetti from "canvas-confetti";

export function QuoteDetailBottomSheet({
  quote,
  onClose,
  onUpdateQuote,
  onDeleteQuote,
  onToggleFavorite
}) {
  const [memoText, setMemoText] = useState(quote.userThought || "");
  const [isCopied, setIsCopied] = useState(false);

  // 메모 자동 저장
  const handleMemoBlur = () => {
    if (memoText !== quote.userThought) {
      onUpdateQuote({
        ...quote,
        userThought: memoText
      });
    }
  };

  // 문장 복사
  const handleCopyQuote = () => {
    const formatted = formatSentenceBreak(quote.text);
    const source = quote.workTitle ? `\n- 《${quote.workTitle}》` : "";
    const thought = memoText ? `\n(생각한줌: ${memoText})` : "";
    const textToCopy = `“${formatted}”${source}${thought}`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 },
      colors: ["#2D4B3E", "#E6E1D6"]
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const displayText = formatSentenceBreak(quote.text);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sheet-container" onClick={(e) => e.stopPropagation()}>
        {/* 바텀시트 헤더 */}
        <div className="sheet-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--primary-green)", fontWeight: "700" }}>
              {quote.category === "book" ? "책 속 문장" : quote.category === "movie" ? "영화 속 대사" : quote.category === "tv" ? "드라마 대사" : quote.category === "thought" ? "생각 메모" : "미분류 문장"}
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {quote.date}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="card-heart-btn"
              onClick={() => onToggleFavorite(quote.id)}
            >
              <Heart size={18} fill={quote.isFavorite ? "#D94848" : "none"} color={quote.isFavorite ? "#D94848" : "var(--text-muted)"} />
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-sub)", padding: "4px" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="sheet-body">
          {/* 문장 출력 (한 문장 끝나면 줄바꿈) */}
          <div className="sheet-quote-box">
            <p className="sheet-quote-text" style={{ whiteSpace: "pre-line" }}>
              “{displayText}”
            </p>
            <div className="sheet-source-info">
              {quote.workTitle ? quote.workTitle : "출처 미입력"}
            </div>
          </div>

          {/* 생각한줌 (라벨 변경 및 인라인 메모) */}
          <div className="form-group" style={{ marginTop: "20px" }}>
            <label className="form-label" style={{ fontSize: "13px", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "5px" }}>
              <span>💭 생각한줌</span>
            </label>
            <textarea
              className="form-textarea"
              style={{ minHeight: "85px", fontSize: "13.5px", lineHeight: "1.6" }}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              onBlur={handleMemoBlur}
              placeholder="이 문장을 마주쳤을 때의 생각한줌을 남겨보세요..."
            />
          </div>

          {/* 군더더기 없는 문장 복사 버튼 */}
          <div style={{ marginTop: "18px" }}>
            <button
              type="button"
              className="btn-copy-quote"
              onClick={handleCopyQuote}
            >
              {isCopied ? <Check size={16} color="#2D4B3E" /> : <Copy size={16} />}
              <span>{isCopied ? "문장이 복사되었습니다!" : "문장 복사하기"}</span>
            </button>
          </div>
        </div>

        {/* 푸터 */}
        <div className="sheet-footer">
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#D94848",
              fontSize: "12.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
            onClick={() => {
              if (window.confirm("이 문장을 서랍에서 삭제하시겠습니까?")) {
                onDeleteQuote(quote.id);
                onClose();
              }
            }}
          >
            <Trash2 size={13} />
            <span>삭제</span>
          </button>

          <button
            type="button"
            className="btn-form-cancel"
            style={{ padding: "7px 16px", fontSize: "13px" }}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
