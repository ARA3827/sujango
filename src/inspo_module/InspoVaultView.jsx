// src/InspoVaultView.jsx
// SUJANGO (수장고) - 영감 수장고 (Inspo Vault) 메인 뷰
import React, { useState, useEffect, useMemo } from "react";
import { RecordSection } from "./components/RecordSection";
import { CategoryChips } from "./components/CategoryChips";
import { AppCard } from "./components/AppCard";
import { QuoteDetailBottomSheet } from "./components/QuoteDetailBottomSheet";
import { KakaoSheet } from "./components/KakaoSheet";
import { BottomTabBar } from "./components/BottomTabBar";
import { INITIAL_QUOTES } from "./data/initialQuotes";
import "./inspo_styles.css";

const STORAGE_KEY = "sujango_inspo_vault_v1";

export function InspoVaultView({ onBack }) {
  const [quotes, setQuotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_QUOTES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error(e);
    }
  }, [quotes]);

  const [currentCategory, setCurrentCategory] = useState("all");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(true);

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isKakaoSheetOpen, setIsKakaoSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const categoryCounts = useMemo(() => {
    const counts = { all: quotes.length, uncategorized: 0, book: 0, movie: 0, tv: 0, thought: 0 };
    quotes.forEach((q) => {
      const cat = q.category || "uncategorized";
      if (counts[cat] !== undefined) counts[cat]++;
      else counts.uncategorized++;
    });
    return counts;
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    let result = [...quotes];
    if (showOnlyFavorites) {
      result = result.filter((q) => q.isFavorite);
    } else if (currentCategory !== "all") {
      result = result.filter((q) => (q.category || "uncategorized") === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          (item.workTitle && item.workTitle.toLowerCase().includes(q)) ||
          (item.userThought && item.userThought.toLowerCase().includes(q))
      );
    }
    return result;
  }, [quotes, currentCategory, showOnlyFavorites, searchQuery]);

  const handleAddQuote = (newQuoteData) => {
    const newQuote = {
      id: `inspo-${Date.now()}`,
      ...newQuoteData
    };
    setQuotes((prev) => [newQuote, ...prev]);
  };

  const handleToggleFavorite = (id) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isFavorite: !q.isFavorite } : q))
    );
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  const handleUpdateQuote = (updatedQuote) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
    );
    setSelectedQuote(updatedQuote);
  };

  const handleDeleteQuote = (id) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote(null);
    }
  };

  const handleImportBatch = (items) => {
    setQuotes((prev) => [...items, ...prev]);
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab === "home") {
      setShowOnlyFavorites(false);
      setCurrentCategory("all");
      setSelectedQuote(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "detail") {
      if (!selectedQuote && quotes.length > 0) setSelectedQuote(quotes[0]);
    } else if (tab === "record") {
      setIsFormOpen(true);
      setSelectedQuote(null);
      const el = document.getElementById("record-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "collection") {
      setShowOnlyFavorites(true);
      setSelectedQuote(null);
    }
  };

  return (
    <div className="inspo-vault-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "16px 8px 40px 8px" }}>
      {onBack && (
        <div style={{ maxWidth: "520px", width: "100%", marginBottom: "12px", display: "flex", justifyContent: "flex-start" }}>
          <button
            type="button"
            onClick={onBack}
            className="back-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
            }}
          >
            ← 메인 대시보드로
          </button>
        </div>
      )}
      <div className="mobile-app-shell">
        <header className="app-header">
          <div className="app-brand">
            <h1 className="app-brand-title">
              <span>📦</span>
              <span>영감 수장고</span>
            </h1>
            <p className="app-brand-subtitle">
              창작자를 위한 밑줄 & 생각한줌 보관함 · {quotes.length}개의 영감
            </p>
          </div>

          <div className="app-header-actions">
            {onBack && (
              <button
                type="button"
                className="header-icon-btn"
                onClick={onBack}
                title="메인 대시보드로 돌아가기"
                style={{ fontSize: "14px", color: "var(--text-secondary)" }}
              >
                ✕
              </button>
            )}
            <button
              type="button"
              className="header-icon-btn"
              onClick={() => setIsKakaoSheetOpen(true)}
              title="카카오톡 대화 가져오기"
              style={{ backgroundColor: "#FEE500", borderColor: "#E6CF00", color: "#3C1E1E" }}
            >
              💬
            </button>
          </div>
        </header>

        <main className="app-content">
          <RecordSection
            onAddQuote={handleAddQuote}
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
          />

          <CategoryChips
            currentCategory={currentCategory}
            onSelectCategory={(cat) => {
              setCurrentCategory(cat);
              if (activeTab === "collection") setActiveTab("home");
            }}
            showOnlyFavorites={showOnlyFavorites}
            onToggleFavorites={() => {
              const next = !showOnlyFavorites;
              setShowOnlyFavorites(next);
              setActiveTab(next ? "collection" : "home");
            }}
            categoryCounts={categoryCounts}
          />

          <div className="cards-feed-list">
            {filteredQuotes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-muted)", fontSize: "13.5px" }}>
                수장고에 보관된 영감 문장이 없습니다. 위에서 기록해보세요.
              </div>
            ) : (
              filteredQuotes.map((quote) => (
                <AppCard
                  key={quote.id}
                  quote={quote}
                  onSelect={(q) => {
                    setSelectedQuote(q);
                    setActiveTab("detail");
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            )}
          </div>
        </main>

        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          hasSelectedQuote={!!selectedQuote}
        />

        {selectedQuote && (
          <QuoteDetailBottomSheet
            quote={selectedQuote}
            onClose={() => {
              setSelectedQuote(null);
              if (activeTab === "detail") setActiveTab("home");
            }}
            onUpdateQuote={handleUpdateQuote}
            onDeleteQuote={handleDeleteQuote}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {isKakaoSheetOpen && (
          <KakaoSheet
            onClose={() => setIsKakaoSheetOpen(false)}
            onImportBatch={handleImportBatch}
          />
        )}
      </div>
    </div>
  );
}

export default InspoVaultView;
