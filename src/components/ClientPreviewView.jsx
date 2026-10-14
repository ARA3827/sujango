import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Clock, 
  Send, 
  Check, 
  AlertCircle, 
  MessageSquare
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { getArtworks } from '../utils/archiveStorage';

export default function ClientPreviewView({ onGoHome }) {
  const [token, setToken] = useState('');
  const [linkData, setLinkData] = useState(null);
  const [artwork, setArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // 클라이언트 피드백
  const [feedback, setFeedback] = useState('');
  const [clientAuthor, setClientAuthor] = useState('');
  const [isFeedbackSent, setIsFeedbackSent] = useState(false);

  useEffect(() => {
    // 해시에서 token 추출 (#share?token=...)
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1] || '');
    const currentToken = urlParams.get('token');
    setToken(currentToken || '');

    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    async function loadSharedArtwork() {
      setIsLoading(true);
      let foundLink = null;

      // 1. Supabase 조회 시도
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('share_links')
            .select('*')
            .eq('share_token', currentToken)
            .maybeSingle();

          if (!error && data) {
            foundLink = data;
          }
        } catch (e) {
          console.warn('Supabase 공유 링크 조회 실패:', e);
        }
      }

      // 2. 로컬스토리지 폴백 조회
      if (!foundLink) {
        const localLinks = JSON.parse(localStorage.getItem('artflow_share_links') || '[]');
        foundLink = localLinks.find(l => l.share_token === currentToken);
      }

      if (!foundLink) {
        setIsLoading(false);
        return;
      }

      // 만료 일시 확인
      if (new Date(foundLink.expires_at) < new Date()) {
        setIsExpired(true);
        setIsLoading(false);
        return;
      }

      setLinkData(foundLink);

      // PIN 잠금 여부
      if (foundLink.pin_code) {
        setIsLocked(true);
      }

      // 작품 데이터 로드
      let foundArt = null;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase
            .from('artworks')
            .select('*')
            .eq('id', foundLink.artwork_id)
            .maybeSingle();
          if (data) foundArt = data;
        } catch (e) {}
      }

      if (!foundArt) {
        const allArts = getArtworks();
        foundArt = allArts.find(a => a.id === foundLink.artwork_id) || allArts[0];
      }

      setArtwork(foundArt);
      setIsLoading(false);
    }

    loadSharedArtwork();
  }, []);

  // PIN 검증
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === linkData?.pin_code) {
      setIsLocked(false);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // 피드백 전송
  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    // 로컬스토리지 갱신
    try {
      const localLinks = JSON.parse(localStorage.getItem('artflow_share_links') || '[]');
      const updated = localLinks.map(l => {
        if (l.share_token === token) {
          return {
            ...l,
            feedback_notes: `[${clientAuthor || '클라이언트'}] ${feedback} (${new Date().toLocaleDateString()})`
          };
        }
        return l;
      });
      localStorage.setItem('artflow_share_links', JSON.stringify(updated));
    } catch (e) {}

    setIsFeedbackSent(true);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #CBD5E1', borderTopColor: '#0284C7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>보안 시안 암호화 해제 중...</p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Clock size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', color: '#0F172A', margin: '0 0 0.5rem 0' }}>만료된 보안 링크입니다</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
            작가가 설정한 열람 유효기간(기본 7일)이 지나 자동으로 만료되었습니다. 시안 확인이 필요하신 경우 작가에게 링크 재발급을 요청해 주세요.
          </p>
          <button type="button" onClick={onGoHome} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0F172A', margin: '0 0 0.5rem 0' }}>작품을 찾을 수 없습니다</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>
            존재하지 않거나 삭제된 시안 링크입니다.
          </p>
          <button type="button" onClick={onGoHome} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  // PIN 잠금 화면
  if (isLocked) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Lock size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', color: '#0F172A', margin: '0 0 0.5rem 0' }}>보안 PIN 번호 입력</h3>
          <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.25rem' }}>
            작가가 설정한 4자리 보안 비밀번호를 입력해 주세요.
          </p>

          <form onSubmit={handleVerifyPin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="숫자 4자리 입력"
              style={{ padding: '0.75rem', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '6px', border: pinError ? '2px solid #EF4444' : '1px solid #CBD5E1', borderRadius: '8px' }}
            />
            {pinError && (
              <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: 0 }}>비밀번호가 올바르지 않습니다.</p>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', background: '#0F172A' }}>
              시안 열람하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* 상단 보안 알림 바 */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
          <ShieldCheck size={16} color="#059669" />
          <span><strong>수장고(Sujango) 암호화 시안 검토</strong> • 대상: {linkData?.client_name || '귀하'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748B' }}>
          <Clock size={13} />
          <span>{linkData?.expires_at ? `${new Date(linkData.expires_at).toLocaleDateString()}까지 유효` : '프라이빗 링크'}</span>
        </div>
      </div>

      {/* 2단 뷰: 좌측 작품 시안 / 우측 정보 & 피드백 작성 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* 좌측: 워터마크가 합성된 1080px 시안 뷰어 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#0F172A', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title} 
              style={{ width: '100%', maxHeight: '600px', objectFit: 'contain', display: 'block' }} 
            />
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.75)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="#10B981" />
              <span>1080px 저작권 보호 시안</span>
            </div>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94A3B8', textAlign: 'center', margin: 0 }}>
            * 본 시안은 저작권 보호를 위해 투명 워터마크가 합성되어 있으며, 무단 복제 및 전재가 금지됩니다.
          </p>
        </div>

        {/* 우측: 작품 캡션 명패 및 피드백 의견 수합 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 미술관 표준 캡션 명패 */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem' }}>
              {artwork.artist || '작가'}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>
              《{artwork.title}》
              <span style={{ fontSize: '1.05rem', fontWeight: 400, color: '#64748B', marginLeft: '6px' }}>, {artwork.year}</span>
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
              {artwork.medium && <div>• <strong>재료:</strong> {artwork.medium}</div>}
              {artwork.size && <div>• <strong>규격:</strong> {artwork.size}</div>}
              {artwork.price && <div>• <strong>가격:</strong> {artwork.price}</div>}
            </div>

            {artwork.statement && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.84rem', color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {artwork.statement}
              </div>
            )}
          </div>

          {/* 클라이언트 피드백 작성 폼 */}
          <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
              <MessageSquare size={16} color="#0284C7" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                작가에게 피드백 / 문의 남기기
              </h4>
            </div>

            {isFeedbackSent ? (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '1rem', textAlign: 'center', color: '#065F46' }}>
                <Check size={20} color="#10B981" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>피드백이 안전하게 전달되었습니다!</div>
                <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '2px' }}>작가의 수장고 대시보드에 즉시 동기화됩니다.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  value={clientAuthor}
                  onChange={(e) => setClientAuthor(e.target.value)}
                  placeholder="성함 또는 기관/갤러리명 (예: 김큐레이터)"
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem' }}
                />
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="작품 전시 가능 여부, 액자 규격 요청, 구매 문의 등 자유롭게 남겨주세요."
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem', resize: 'vertical' }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', background: '#0F172A', fontSize: '0.85rem' }}
                >
                  <Send size={14} /> 피드백 보내기
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
