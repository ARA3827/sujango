// src/components/CategoryChips.jsx
import React from "react";
import { Heart } from "lucide-react";

export function CategoryChips({
  currentCategory,
  onSelectCategory,
  showOnlyFavorites,
  onToggleFavorites,
  categoryCounts
}) {
  const categories = [
    { key: "all", label: "전체", count: categoryCounts.all },
    { key: "uncategorized", label: "미분류", count: categoryCounts.uncategorized || 0 },
    { key: "book", label: "책", count: categoryCounts.book || 0 },
    { key: "movie", label: "영화", count: categoryCounts.movie || 0 },
    { key: "tv", label: "드라마", count: categoryCounts.tv || 0 },
    { key: "thought", label: "생각", count: categoryCounts.thought || 0 },
  ];

  return (
    <div className="category-chips-scroll">
      {categories.map((cat) => {
        const isActive = !showOnlyFavorites && currentCategory === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            className={`chip-btn ${isActive ? "active" : ""}`}
            onClick={() => {
              if (showOnlyFavorites) onToggleFavorites();
              onSelectCategory(cat.key);
            }}
          >
            <span>{cat.label}</span>
            {cat.count > 0 && (
              <span style={{ opacity: 0.7, fontSize: "11px" }}>{cat.count}</span>
            )}
          </button>
        );
      })}

      {/* 보관함 (즐겨찾기) 칩 */}
      <button
        type="button"
        className={`chip-btn ${showOnlyFavorites ? "active" : ""}`}
        onClick={onToggleFavorites}
        style={{
          color: showOnlyFavorites ? "#FFFFFF" : "#D94848",
          borderColor: showOnlyFavorites ? "var(--primary-green)" : "#F2D4D4",
          backgroundColor: showOnlyFavorites ? "var(--primary-green)" : "#FFF8F8"
        }}
      >
        <Heart size={12} fill={showOnlyFavorites ? "#FFFFFF" : "#D94848"} />
        <span>보관함</span>
      </button>
    </div>
  );
}
