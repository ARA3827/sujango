import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Lock, 
  Calendar, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createShareLink } from '../utils/supabaseClient';

export default function ShareLinkModal({ isOpen, onClose, artwork, user }) {
  const [clientName, setClientName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [pinCode, setPinCode] = useState('');
  const [allowDownload, setAllowDownload] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !artwork) return null;

  // 보안 공유 링크 생성 실행
  const handleGenerateLink = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const result = await createShareLink({
      userEmail: user?.email || 'local_user',
      artworkId: artwork.id,
      clientName: clientName.trim() || '클라이언트 검토용',
      expiresInDays: Number(expiresInDays),
      pinCode: pinCode.trim(),
      allowDownload
    });

    const fullUrl = `${window.location.origin}/#share?token=${result.share_token}`;
    setGeneratedLink({
      ...result,
      fullUrl
    });

    setIsCreating(false);

    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  // 링크 복사
  const handleCopyLink = () => {
    if (!generatedLink?.fullUrl) return;
    navigator.clipboard.writeText(generatedLink.fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', color: '#16A34A', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <ShieldCheck size={14} />
              <span>SIGNED URL SECURITY</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              클라이언트 전용 보안 공유 링크 생성
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
              고화질 원본은 절대 노출되지 않으며, <strong>워터마크가 합성된 1080px 안전 시안</strong>만 일정 기간 열람할 수 있는 프라이빗 링크를 발급합니다.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* 공유 대상 작품 간략 카드 */}
        <div style={{ display: 'flex', gap: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          {artwork.imageUrl ? (
            <img src={artwork.imageUrl} alt={artwork.title} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px' }} />
          ) : (
            <div style={{ width: '56px', height: '56px', background: '#E2E8F0', borderRadius: '6px' }} />
          )}
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{artwork.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
              {artwork.year}년 • {artwork.medium || '혼합 매체'} • {artwork.size || '규격 미기재'}
            </div>
          </div>
        </div>

        {/* 링크 생성 폼 (아직 생성 안 됐을 때) */}
        {!generatedLink ? (
          <form onSubmit={handleGenerateLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 1. 수신처 / 클라이언트명 */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                전달 대상 (갤러리 / 큐레이터 / 클라이언트)
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="예: 삼청동 OO갤러리 김큐레이터님, 서울문화재단"
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* 2. 유효기간 선택 */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Clock size={15} color="#0284C7" />
                <span>링크 유효기간 (자동 폭파/만료)</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { days: 3, label: '3일 (빠른 검토)' },
                  { days: 7, label: '7일 (표준 권장)' },
                  { days: 30, label: '30일 (장기 전시)' }
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setExpiresInDays(item.days)}
                    style={{
                      padding: '0.6rem 0.4rem',
                      border: expiresInDays === item.days ? '2px solid #0284C7' : '1px solid #E2E8F0',
                      background: expiresInDays === item.days ? '#F0F9FF' : '#FFFFFF',
                      color: expiresInDays === item.days ? '#0369A1' : '#475569',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. PIN 비밀번호 설정 (선택사항) */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Lock size={15} color="#7C3AED" />
                <span>선택적 4자리 PIN 비밀번호 잠금</span>
              </label>
              <input
                type="password"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="비워두면 비밀번호 없이 링크로 즉시 열람"
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '4px', marginBottom: 0 }}>
                * 비공개 프로젝트나 미공개 신작 시안일 때 숫자 4자리를 설정하면 더욱 안전합니다.
              </p>
            </div>

            {/* 4. 원본 다운로드 허용 토글 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>초고화질 원본 파일 다운로드 허용</div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                  기본값은 무단 인쇄 방지를 위해 다운로드가 차단된 1080px 웹 시안만 보여줍니다.
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0F172A' }}
              />
            </div>

            {/* 하단 생성 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
                취소
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isCreating}
                style={{ padding: '0.6rem 1.5rem', background: '#0F172A', minWidth: '140px', justifyContent: 'center' }}
              >
                {isCreating ? '링크 발급 중...' : '보안 공유 링크 발급'}
              </button>
            </div>
          </form>
        ) : (
          /* 링크 발급 완료 화면 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                <Check size={22} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#065F46' }}>
                보안 공유 링크가 성공적으로 발급되었습니다!
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#047857' }}>
                만료 일시: {new Date(generatedLink.expires_at).toLocaleDateString()} {new Date(generatedLink.expires_at).toLocaleTimeString()} ({expiresInDays}일간 유효)
              </p>
            </div>

            {/* 링크 복사 인풋 */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                발급된 프라이빗 공유 주소
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={generatedLink.fullUrl}
                  style={{ flex: 1, padding: '0.65rem 0.85rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap', gap: '6px', background: isCopied ? '#059669' : '#0284C7' }}
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{isCopied ? '복사 완료!' : '주소 복사'}</span>
                </button>
              </div>
            </div>

            {generatedLink.pin_code && (
              <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#6B21A8' }}>
                🔒 <strong>보안 PIN 번호:</strong> {generatedLink.pin_code} (클라이언트에게 링크와 함께 안내해 주세요)
              </div>
            )}

            {/* 하단 완료 및 닫기 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setGeneratedLink(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.82rem', textDecoration: 'underline', cursor: 'pointer' }}
              >
                ← 새 링크 발급하기
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
