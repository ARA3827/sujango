// src/components/KakaoSheet.jsx
import React, { useState } from "react";
import { X, UploadCloud, FileText, CheckSquare, Square, Check, AlertCircle, HelpCircle } from "lucide-react";
import { parseKakaoChatText } from "../utils/kakaoParser";
import confetti from "canvas-confetti";

export function KakaoSheet({ onClose, onImportBatch }) {
  const [tab, setTab] = useState("import"); // 'import' | 'guide'
  const [importMode, setImportMode] = useState("file"); // 'file' | 'paste'
  const [rawText, setRawText] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // 파일 업로드
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const items = parseKakaoChatText(e.target.result);
      setCandidates(items);
      setSelectedIds(new Set(items.map((it) => it.id)));
    };
    reader.readAsText(file, "utf-8");
  };

  const handlePasteProcess = () => {
    if (!rawText.trim()) return;
    const items = parseKakaoChatText(rawText);
    setCandidates(items);
    setSelectedIds(new Set(items.map((it) => it.id)));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleConfirm = () => {
    const selected = candidates.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) {
      alert("담을 문장을 선택해주세요.");
      return;
    }
    onImportBatch(selected);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sheet-container" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="sheet-header" style={{ backgroundColor: "#FEE500", color: "#3C1E1E" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>💬</span>
            <strong style={{ fontSize: "14px" }}>카카오톡 연동 센터</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#3C1E1E" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 탭 버튼 */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", backgroundColor: "#FAF8F3" }}>
          <button
            type="button"
            onClick={() => setTab("import")}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "13px",
              fontWeight: tab === "import" ? "700" : "500",
              color: tab === "import" ? "var(--primary-green)" : "var(--text-sub)",
              borderBottom: tab === "import" ? "2px solid var(--primary-green)" : "none",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer"
            }}
          >
            대화 파일 불러오기
          </button>
          <button
            type="button"
            onClick={() => setTab("guide")}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "13px",
              fontWeight: tab === "guide" ? "700" : "500",
              color: tab === "guide" ? "var(--primary-green)" : "var(--text-sub)",
              borderBottom: tab === "guide" ? "2px solid var(--primary-green)" : "none",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer"
            }}
          >
            간편 가져오기 가이드 (3단계)
          </button>
        </div>

        {/* 바디 */}
        <div className="sheet-body">
          {tab === "import" ? (
            <div>
              {candidates.length === 0 ? (
                <div>
                  <div style={{
                    border: "2px dashed #E6CF00",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#FFFEF2",
                    padding: "28px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    marginBottom: "14px"
                  }}
                  onClick={() => document.getElementById("kakao-file-input-clean").click()}
                  >
                    <input
                      id="kakao-file-input-clean"
                      type="file"
                      accept=".txt"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
                      }}
                    />
                    <UploadCloud size={32} color="#D97706" style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#3C1E1E" }}>
                      카톡 대화 내보내기(.txt) 파일 선택
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-sub)", marginTop: "4px" }}>
                      클릭하여 PC의 텍스트 파일을 불러오세요
                    </p>
                  </div>

                  <div style={{
                    fontSize: "12px",
                    color: "#854D0E",
                    backgroundColor: "#FEF9C3",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    lineHeight: "1.5"
                  }}>
                    💡 카톡 나와의 채팅 우측 상단 메뉴 ➔ [설정] ➔ [대화 내용 내보내기] ➔ [텍스트만 보내기]로 다운로드한 파일을 넣으면 됩니다.
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-sub)", marginBottom: "6px" }}>
                      또는 텍스트를 직접 복사해서 붙여넣기:
                    </p>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      style={{ fontSize: "13px" }}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="카톡 대화창에서 복사한 텍스트를 붙여넣으세요..."
                    />
                    <button
                      type="button"
                      className="btn-form-submit"
                      style={{ width: "100%", marginTop: "8px", fontSize: "13px" }}
                      onClick={handlePasteProcess}
                    >
                      텍스트에서 문장 추출하기
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>
                      발견된 문장: {candidates.length}개
                    </span>
                    <button
                      type="button"
                      onClick={() => setCandidates([])}
                      style={{ fontSize: "11.5px", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      다시 올리기
                    </button>
                  </div>

                  <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {candidates.map((c) => {
                      const isChecked = selectedIds.has(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleSelect(c.id)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: isChecked ? "2px solid var(--primary-green)" : "1px solid var(--border-color)",
                            backgroundColor: isChecked ? "var(--primary-green-light)" : "#FFFFFF",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px"
                          }}
                        >
                          <div style={{ marginTop: "2px" }}>
                            {isChecked ? <CheckSquare size={16} color="var(--primary-green)" /> : <Square size={16} color="var(--text-placeholder)" />}
                          </div>
                          <div style={{ flex: 1, fontSize: "13px", color: "var(--text-main)" }}>
                            “{c.text}”
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: "13.5px", lineHeight: "1.65", color: "var(--text-main)", padding: "4px 2px" }}>
              <div style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#166534",
                fontWeight: "600"
              }}>
                💬 1단계, 2단계, 3단계만 실행하면 카톡 메시지를 간편하게 가져올 수 있어요!
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{
                    minWidth: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-green)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>1</div>
                  <div>
                    <strong style={{ color: "#1E293B" }}>카카오톡 대화방 열기</strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "var(--text-sub)" }}>
                      문장이나 대사를 모아둔 카톡 <strong>'나와의 채팅'</strong> 또는 메모 대화방으로 들어갑니다.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{
                    minWidth: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-green)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>2</div>
                  <div>
                    <strong style={{ color: "#1E293B" }}>대화 내용 내보내기</strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "var(--text-sub)" }}>
                      채팅방 우측 상단 메뉴(≡) ➔ [설정 ⚙️] ➔ [대화 내용 내보내기] ➔ <strong>[텍스트만 보내기]</strong>를 눌러 텍스트 파일(.txt)을 저장합니다.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{
                    minWidth: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-green)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>3</div>
                  <div>
                    <strong style={{ color: "#1E293B" }}>파일 불러오기 & 영감 카드 담기</strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "var(--text-sub)" }}>
                      저장된 텍스트 파일을 왼쪽 <strong>[대화 파일 불러오기]</strong>에 넣으면, 좋은 문장만 자동으로 정돈되어 영감노트에 담깁니다.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: "18px",
                padding: "10px 12px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#64748B"
              }}>
                💡 <strong>꿀팁:</strong> 카카오 비즈니스 무료 채널을 하나 만들어 카톡 상단에 고정해두면, 읽던 책이나 영상 속 문장을 메모하듯 편하게 모아둘 수 있습니다.
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="sheet-footer">
          <button type="button" className="btn-form-cancel" onClick={onClose}>
            닫기
          </button>
          {candidates.length > 0 && tab === "import" && (
            <button type="button" className="btn-form-submit" onClick={handleConfirm}>
              선택한 {selectedIds.size}개 카드로 담기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
