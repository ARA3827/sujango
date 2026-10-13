// src/components/BottomTabBar.jsx
import React from "react";
import { BookOpen, Quote, PenLine, Bookmark } from "lucide-react";

export function BottomTabBar({
  activeTab,
  onSelectTab,
  hasSelectedQuote
}) {
  return (
    <nav className="bottom-tab-bar">
      {/* 1. 홈 */}
      <button
        type="button"
        className={`tab-item ${activeTab === "home" ? "active" : ""}`}
        onClick={() => onSelectTab("home")}
      >
        <BookOpen size={20} className="tab-icon" />
        <span className="tab-label">홈</span>
      </button>

      {/* 2. 상세/공유 */}
      <button
        type="button"
        className={`tab-item ${activeTab === "detail" ? "active" : ""}`}
        onClick={() => onSelectTab("detail")}
      >
        <Quote size={20} className="tab-icon" />
        <span className="tab-label">상세/공유</span>
      </button>

      {/* 3. 기록 */}
      <button
        type="button"
        className={`tab-item ${activeTab === "record" ? "active" : ""}`}
        onClick={() => onSelectTab("record")}
      >
        <PenLine size={20} className="tab-icon" />
        <span className="tab-label">기록</span>
      </button>

      {/* 4. 컬렉션 */}
      <button
        type="button"
        className={`tab-item ${activeTab === "collection" ? "active" : ""}`}
        onClick={() => onSelectTab("collection")}
      >
        <Bookmark size={20} className="tab-icon" />
        <span className="tab-label">컬렉션</span>
      </button>
    </nav>
  );
}
