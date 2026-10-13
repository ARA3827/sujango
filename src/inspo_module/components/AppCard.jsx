// src/components/AppCard.jsx
import React from "react";
import { Heart } from "lucide-react";
import { formatSentenceBreak } from "../utils/textFormatter";

export function AppCard({ quote, onSelect, onToggleFavorite }) {
  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "book": return "책";
      case "movie": return "영화";
      case "tv": return "드라마";
      case "thought": return "생각";
      default: return "미분류";
    }
  };

  const formattedText = formatSentenceBreak(quote.text);

  return (
    <article className="app-quote-card" onClick={() => onSelect(quote)}>
      <div className="card-meta-top">
        <span className="category-tag-badge">
          {getCategoryLabel(quote.category)}
        </span>

        <button
          type="button"
          className={`card-heart-btn ${quote.isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(quote.id);
          }}
          title={quote.isFavorite ? "보관 해제" : "보관함에 담기"}
        >
          <Heart size={16} fill={quote.isFavorite ? "#D94848" : "none"} />
        </button>
      </div>

      <div className="card-quote-content" style={{ whiteSpace: "pre-line" }}>
        “{formattedText}”
      </div>

      {quote.userThought && (
        <div className="card-thought-preview">
          💭 <strong>생각한줌:</strong> {quote.userThought}
        </div>
      )}

      <div className="card-meta-bottom">
        <span className="card-source-text">
          {quote.workTitle ? quote.workTitle : "출처 미입력"}
        </span>
        <span>{quote.date}</span>
      </div>
    </article>
  );
}
