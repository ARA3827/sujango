import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Type, 
  Image as ImageIcon, 
  Eye, 
  Check, 
  Upload,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchWatermarkSettings, saveWatermarkSettings } from '../utils/supabaseClient';

export default function WatermarkSettingsModal({ isOpen, onClose, user }) {
  const userEmail = user?.email || 'local_user';
  const defaultArtistName = user?.name || '작가';

  const [watermarkType, setWatermarkType] = useState('text'); // 'text' | 'image' | 'none'
  const [watermarkText, setWatermarkText] = useState(`© 2026 ${defaultArtistName}. All rights reserved`);
  const [watermarkImage, setWatermarkImage] = useState('');
  const [opacity, setOpacity] = useState(35); // 10 ~ 80 (%)
  const [position, setPosition] = useState('center_diagonal'); // 'center_diagonal' | 'bottom_right' | 'grid'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 모달 열릴 때 기존 설정 로드
  useEffect(() => {
    if (!isOpen) return;
    setSaveSuccess(false);

    async function loadSettings() {
      const data = await fetchWatermarkSettings(userEmail);
      if (data) {
        if (data.watermark_type) setWatermarkType(data.watermark_type);
        if (data.watermark_text) setWatermarkText(data.watermark_text);
        if (data.watermark_image_url) setWatermarkImage(data.watermark_image_url);
        if (data.watermark_opacity !== undefined) setOpacity(Math.round(data.watermark_opacity * 100));
        if (data.watermark_position) setPosition(data.watermark_position);
      }
    }
    loadSettings();
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  // 로고 이미지 파일 선택
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('로고 이미지는 2MB 이하의 투명 배경(PNG) 파일을 권장합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setWatermarkImage(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // 빠른 문구 템플릿 적용
  const handleApplyTemplate = (text) => {
    setWatermarkText(text);
  };

  // 저장 처리
  const handleSave = async () => {
    setIsSaving(true);
    const settings = {
      watermark_type: watermarkType,
      watermark_text: watermarkText,
      watermark_image_url: watermarkImage,
      watermark_opacity: opacity / 100,
      watermark_position: position
    };

    await saveWatermarkSettings(userEmail, settings);
    setIsSaving(false);
    setSaveSuccess(true);

    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <ShieldCheck size={14} />
              <span>DIGITAL ASSET PROTECTION</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              나만의 작품 워터마크 보안 설정
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
              수장고의 원본 금고는 안전하게 지키고, 클라이언트에게 시안을 보낼 때만 <strong>1080px 웹용 이미지</strong>에 투명 워터마크를 자동으로 입혀 저작권을 보호합니다.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* 2단 그리드 (좌측: 설정 컨트롤 / 우측: 실시간 라이브 프리뷰) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* 좌측: 설정 입력 영역 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* 1. 방식 선택 (문구 vs 이미지 vs 끄기) */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                워터마크 보호 방식
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setWatermarkType('text')}
                  style={{
                    padding: '0.6rem 0.4rem',
                    border: watermarkType === 'text' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                    background: watermarkType === 'text' ? '#F0F9FF' : '#FFFFFF',
                    color: watermarkType === 'text' ? '#0369A1' : '#475569',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Type size={16} />
                  <span>텍스트 자동생성</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWatermarkType('image')}
                  style={{
                    padding: '0.6rem 0.4rem',
                    border: watermarkType === 'image' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                    background: watermarkType === 'image' ? '#F0F9FF' : '#FFFFFF',
                    color: watermarkType === 'image' ? '#0369A1' : '#475569',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ImageIcon size={16} />
                  <span>투명 서명 로고</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWatermarkType('none')}
                  style={{
                    padding: '0.6rem 0.4rem',
                    border: watermarkType === 'none' ? '2px solid #64748B' : '1px solid #E2E8F0',
                    background: watermarkType === 'none' ? '#F1F5F9' : '#FFFFFF',
                    color: watermarkType === 'none' ? '#0F172A' : '#64748B',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={16} />
                  <span>미적용 (원본형)</span>
                </button>
              </div>
            </div>

            {/* 2-A. 텍스트 입력창 (텍스트 선택 시) */}
            {watermarkType === 'text' && (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  워터마크에 표시할 문구
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="예: © 2026 작가명. All rights reserved"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
                
                {/* 빠른 추천 문구 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(`© 2026 ${defaultArtistName}. All rights reserved`)}
                    style={{ fontSize: '0.72rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '4px', color: '#475569', cursor: 'pointer' }}
                  >
                    + 기본 저작권 문구
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(`시안 검토용 - 무단 복제 및 전재 금지`)}
                    style={{ fontSize: '0.72rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '4px', color: '#475569', cursor: 'pointer' }}
                  >
                    + 시안 검토용
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(`PREVIEW ONLY • DO NOT REPRODUCE`)}
                    style={{ fontSize: '0.72rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '4px', color: '#475569', cursor: 'pointer' }}
                  >
                    + 영문 프리뷰용
                  </button>
                </div>
              </div>
            )}

            {/* 2-B. 이미지 업로드 (이미지 선택 시) */}
            {watermarkType === 'image' && (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  투명 서명/낙관/로고 이미지 (PNG 권장)
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label
                    style={{
                      flex: 1,
                      border: '1px dashed #94A3B8',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      textAlign: 'center',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Upload size={16} />
                    <span>서명 파일 선택 (PNG)</span>
                    <input 
                      type="file" 
                      accept="image/png,image/webp,image/svg+xml" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  {watermarkImage && (
                    <button
                      type="button"
                      onClick={() => setWatermarkImage('')}
                      style={{ padding: '0.6rem 0.8rem', border: '1px solid #E2E8F0', borderRadius: '6px', background: '#FFFFFF', fontSize: '0.78rem', color: '#EF4444', cursor: 'pointer' }}
                    >
                      삭제
                    </button>
                  )}
                </div>
                {!watermarkImage && (
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px', marginBottom: 0 }}>
                    * 배경이 투명한 PNG 서명이나 낙관 도장 파일을 올리시면 깔끔하게 합성됩니다.
                  </p>
                )}
              </div>
            )}

            {/* 3. 투명도 슬라이더 */}
            {watermarkType !== 'none' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                    투명도 조절
                  </label>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284C7' }}>
                    {opacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284C7', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <span>은은하게 (10%)</span>
                  <span>적정 권장 (35%)</span>
                  <span>또렷하게 (80%)</span>
                </div>
              </div>
            )}

            {/* 4. 워터마크 배치 스타일 */}
            {watermarkType !== 'none' && (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  배치 스타일
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPosition('center_diagonal')}
                    style={{
                      padding: '0.5rem',
                      border: position === 'center_diagonal' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                      background: position === 'center_diagonal' ? '#F0F9FF' : '#FFFFFF',
                      color: position === 'center_diagonal' ? '#0369A1' : '#475569',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    중앙 사선 회전 (추천)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('bottom_right')}
                    style={{
                      padding: '0.5rem',
                      border: position === 'bottom_right' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                      background: position === 'bottom_right' ? '#F0F9FF' : '#FFFFFF',
                      color: position === 'bottom_right' ? '#0369A1' : '#475569',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    우측 하단 서명형
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('grid')}
                    style={{
                      padding: '0.5rem',
                      border: position === 'grid' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                      background: position === 'grid' ? '#F0F9FF' : '#FFFFFF',
                      color: position === 'grid' ? '#0369A1' : '#475569',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    대각선 패턴 반복
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 우측: 실시간 라이브 프리뷰 화면 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                실제 클라이언트에게 보이는 시안 (1080px 미리보기)
              </label>
              <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: '4px' }}>
                실시간 렌더링
              </span>
            </div>

            {/* 시뮬레이션 액자 캔버스 */}
            <div 
              style={{
                width: '100%',
                height: '280px',
                borderRadius: '10px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #334155'
              }}
            >
              {/* 가상 작품 아트워크 (유화 느낌의 그라데이션) */}
              <div 
                style={{
                  position: 'absolute',
                  inset: '16px',
                  borderRadius: '6px',
                  background: 'radial-gradient(circle at 30% 30%, #F59E0B 0%, #D97706 20%, #475569 70%, #1E293B 100%)',
                  opacity: 0.85,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 300, letterSpacing: '2px' }}>
                  [ 예시 작품: 무제 Untitled, 2026 ]
                </div>
              </div>

              {/* 워터마크 레이어 오버레이 */}
              {watermarkType === 'text' && (
                <>
                  {position === 'center_diagonal' && (
                    <div 
                      style={{
                        position: 'absolute',
                        transform: 'rotate(-25deg)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        opacity: opacity / 100,
                        letterSpacing: '1px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        pointerEvents: 'none',
                        textAlign: 'center',
                        padding: '0 20px',
                        userSelect: 'none'
                      }}
                    >
                      {watermarkText || 'WATERMARK TEXT'}
                    </div>
                  )}

                  {position === 'bottom_right' && (
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '24px',
                        right: '24px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        opacity: opacity / 100,
                        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                        pointerEvents: 'none',
                        userSelect: 'none'
                      }}
                    >
                      {watermarkText || 'WATERMARK TEXT'}
                    </div>
                  )}

                  {position === 'grid' && (
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gridTemplateRows: 'repeat(3, 1fr)',
                        gap: '20px',
                        padding: '20px',
                        transform: 'rotate(-15deg)',
                        opacity: opacity / 100,
                        pointerEvents: 'none',
                        userSelect: 'none'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                          {watermarkText || 'WATERMARK'}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* 이미지 로고 워터마크 오버레이 */}
              {watermarkType === 'image' && (
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: position === 'bottom_right' ? 'flex-end' : 'center',
                    justifyContent: position === 'bottom_right' ? 'flex-end' : 'center',
                    padding: position === 'bottom_right' ? '28px' : '0',
                    pointerEvents: 'none'
                  }}
                >
                  {watermarkImage ? (
                    <img 
                      src={watermarkImage} 
                      alt="Watermark Logo" 
                      style={{
                        maxWidth: position === 'bottom_right' ? '120px' : '220px',
                        maxHeight: position === 'bottom_right' ? '60px' : '140px',
                        opacity: opacity / 100,
                        transform: position === 'center_diagonal' ? 'rotate(-20deg)' : 'none',
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
                      }} 
                    />
                  ) : (
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: '6px' }}>
                      PNG 서명 로고를 업로드해 주세요
                    </div>
                  )}
                </div>
              )}

              {/* 미적용 안내 */}
              {watermarkType === 'none' && (
                <div style={{ position: 'absolute', bottom: '24px', background: 'rgba(15, 23, 42, 0.75)', color: '#94A3B8', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px' }}>
                  워터마크 없음 (원본 그대로 노출)
                </div>
              )}
            </div>

            {/* 안내 박스 */}
            <div style={{ marginTop: '0.85rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="#0284C7" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B', lineHeight: 1.5 }}>
                설정한 워터마크는 <strong>작가의 수장고 원본을 훼손하지 않습니다</strong>. 클라이언트 공유 링크를 발급할 때만 가벼운 1080px 웹 시안에 자동으로 입혀집니다.
              </p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem', minWidth: '120px', justifyContent: 'center' }}
          >
            {isSaving ? '저장 중...' : saveSuccess ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check size={16} /> 저장 완료!
              </span>
            ) : (
              '워터마크 설정 저장'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
