// src/components/RecordSection.jsx
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { formatSentenceBreak } from "../utils/textFormatter";
import confetti from "canvas-confetti";

export function RecordSection({ onAddQuote, isFormOpen, setIsFormOpen }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("uncategorized");
  const [source, setSource] = useState("");
  const [thought, setThought] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("마음에 남은 문장을 입력해주세요.");
      return;
    }

    // 마침표/물음표 뒤 자연스러운 줄바꿈 적용
    const formattedText = formatSentenceBreak(text.trim());

    onAddQuote({
      text: formattedText,
      category: category,
      workTitle: source.trim() || (category === "thought" ? "생각 메모" : "기록된 한 줄"),
      creator: "",
      context: "",
      userThought: thought.trim(),
      tags: ["영감"],
      date: new Date().toISOString().slice(0, 10),
      isFavorite: false
    });

    // 폼 초기화
    setText("");
    setSource("");
    setThought("");
    setCategory("uncategorized");

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.35 },
      colors: ["#2D4B3E", "#E6E1D6", "#D9A05B"]
    });
  };

  const handleCancel = () => {
    setText("");
    setSource("");
    setThought("");
    setCategory("uncategorized");
    if (setIsFormOpen) setIsFormOpen(false);
  };

  return (
    <section className="quote-record-section" id="record-section">
      <p className="record-header-text">마음에 남은 한 줄을, 나만의 서랍에.</p>

      {!isFormOpen ? (
        <button
          type="button"
          className="btn-record-trigger"
          onClick={() => setIsFormOpen && setIsFormOpen(true)}
        >
          <Plus size={16} />
          <span>+ 문장 기록</span>
        </button>
      ) : (
        <button
          type="button"
          className="btn-record-trigger"
          onClick={() => setIsFormOpen && setIsFormOpen(false)}
        >
          <span>- 기록창 닫기</span>
        </button>
      )}

      <div className="record-divider"></div>

      {isFormOpen && (
        <form className="record-form-card" onSubmit={handleSubmit}>
          {/* 마음에 남은 문장 */}
          <div className="form-group">
            <label className="form-label">마음에 남은 문장</label>
            <textarea
              className="form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="문장만 적어도 저장할 수 있어요."
              rows={4}
            />
          </div>

          {/* 2열: 어디에서 / 출처 · 선택 */}
          <div className="form-group">
            <div className="form-row-two-col">
              <div>
                <label className="form-label">어디에서</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="uncategorized">미분류</option>
                  <option value="book">책</option>
                  <option value="movie">영화</option>
                  <option value="tv">드라마</option>
                  <option value="thought">생각</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  출처 <span className="sub-label">· 선택</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="작품 제목, 페이지 또는 회차"
                />
              </div>
            </div>
          </div>

          {/* 생각한줌 · 선택 */}
          <div className="form-group">
            <label className="form-label">
              생각한줌 <span className="sub-label">· 선택</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="이 문장을 마주쳤을 때의 생각한줌"
            />
          </div>

          {/* 버튼들 */}
          <div className="form-actions-row">
            <button
              type="button"
              className="btn-form-cancel"
              onClick={handleCancel}
            >
              취소
            </button>
            <button type="submit" className="btn-form-submit">
              카드로 담기
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
