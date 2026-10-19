import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Download, 
  Sparkles, 
  Share2, 
  PlusSquare, 
  Check, 
  Copy,
  ExternalLink,
  Laptop
} from 'lucide-react';

/**
 * 햄버거 메뉴에서 호출되는 바탕화면 / 모바일 홈 화면 바로가기 생성 모달
 * - PWA 네이티브 설치 프롬프트 (Chrome/Edge/Android) 원클릭 트리거
 * - Windows PC용 .url 바로가기 원클릭 다운로드
 * - Android / iPhone / PC 기기별 3단계 직관적인 가이드
 */
export default function ShortcutModal({ isOpen, onClose, installPrompt }) {
  const [activeTab, setActiveTab] = useState(() => {
    // 접속 환경 자동 감지 (iOS / Android / Desktop)
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'pc';
  });

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. PWA 네이티브 설치 실행
  const handleNativeInstall = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          onClose();
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
  };

  // 2. Windows PC용 원클릭 바탕화면 바로가기 파일(.url) 생성 다운로드
  const handleDownloadWindowsShortcut = () => {
    const currentUrl = window.location.origin;
    const urlFileContent = `[InternetShortcut]\nURL=${currentUrl}\nIconIndex=0\nIconFile=${currentUrl}/favicon.svg\n`;
    const blob = new Blob([urlFileContent], { type: 'application/internet-shortcut' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '수장고(Sujango).url';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 3. 현재 주소 복사
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{ zIndex: 1200, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* 모달 상단 헤더 */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={17} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                홈 화면 및 바탕화면 바로가기 추가
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>
                앱처럼 아이콘을 터치하여 수장고에 즉시 접속하세요
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'flex', alignItems: 'center' }}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 원클릭 PWA 설치 지원 시 최상단 배너 */}
        {installPrompt && (
          <div style={{ padding: '1rem 1.5rem', background: '#F0F9FF', borderBottom: '1px solid #BAE6FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={15} /> 원클릭 바로가기 설치 지원 브라우저
              </div>
              <div style={{ fontSize: '0.78rem', color: '#0284C7', marginTop: '2px' }}>
                버튼을 누르시면 홈 화면 / 바탕화면에 즉시 설치됩니다.
              </div>
            </div>
            <button
              type="button"
              onClick={handleNativeInstall}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.84rem', flexShrink: 0 }}
            >
              지금 추가하기
            </button>
          </div>
        )}

        {/* 기기별 탭 네비게이션 */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            style={{
              flex: 1,
              padding: '0.85rem 0.5rem',
              border: 'none',
              background: activeTab === 'android' ? '#FFFFFF' : '#F8FAFC',
              borderBottom: activeTab === 'android' ? '2.5px solid #0F172A' : 'none',
              fontWeight: activeTab === 'android' ? 700 : 500,
              color: activeTab === 'android' ? '#0F172A' : '#64748B',
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            📱 안드로이드
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            style={{
              flex: 1,
              padding: '0.85rem 0.5rem',
              border: 'none',
              background: activeTab === 'ios' ? '#FFFFFF' : '#F8FAFC',
              borderBottom: activeTab === 'ios' ? '2.5px solid #0F172A' : 'none',
              fontWeight: activeTab === 'ios' ? 700 : 500,
              color: activeTab === 'ios' ? '#0F172A' : '#64748B',
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            🍎 아이폰 (Safari)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pc')}
            style={{
              flex: 1,
              padding: '0.85rem 0.5rem',
              border: 'none',
              background: activeTab === 'pc' ? '#FFFFFF' : '#F8FAFC',
              borderBottom: activeTab === 'pc' ? '2.5px solid #0F172A' : 'none',
              fontWeight: activeTab === 'pc' ? 700 : 500,
              color: activeTab === 'pc' ? '#0F172A' : '#64748B',
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            💻 PC (Windows/Mac)
          </button>
        </div>

        {/* 탭 내용 */}
        <div style={{ padding: '1.5rem' }}>
          {/* 1. 안드로이드 가이드 */}
          {activeTab === 'android' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
                삼성 인터넷 또는 크롬(Chrome) 브라우저 3단계:
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', flexShrink: 0 }}>
                  1
                </span>
                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  화면 오른쪽 상단의 <strong>더보기 메뉴 (점 3개 ⋮)</strong>를 터치합니다.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', flexShrink: 0 }}>
                  2
                </span>
                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  메뉴에서 <strong>[홈 화면에 추가]</strong> 또는 <strong>[앱 설치]</strong>를 선택합니다.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', flexShrink: 0 }}>
                  3
                </span>
                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  스마트폰 바탕화면에 생성된 <strong>수장고 팔레트 아이콘</strong>을 눌러 바로 실행하세요!
                </div>
              </div>
            </div>
          )}

          {/* 2. 아이폰 Safari 가이드 */}
          {activeTab === 'ios' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
                사파리(Safari) 브라우저 3단계:
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', flexShrink: 0 }}>
                  1
                </span>
                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  사파리 화면 하단 중앙의 <strong>공유 버튼 (네모 위 화살표 ⎋)</strong>을 터치합니다.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', flexShrink: 0 }}>
                  2
                </span>
                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  메뉴를 아래로 살짝 스크롤하여 <strong>[홈 화면에 추가]</strong>를 터치합니다.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', flexShrink: 0 }}>
                  3
                </span>
                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  우측 상단 <strong>[추가]</strong>를 누르면 아이폰 홈 화면에 전용 앱처럼 등록됩니다!
                </div>
              </div>
            </div>
          )}

          {/* 3. PC 윈도우/맥 가이드 & 원클릭 파일 다운로드 */}
          {activeTab === 'pc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* 추천 1: 주소창 드래그 앤 드롭 (가장 쉽고 오류 없음) */}
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#0369A1', marginBottom: '6px' }}>
                  <Sparkles size={16} /> 추천: 주소창 아이콘 끌어다 놓기
                </div>
                <div style={{ fontSize: '0.84rem', color: '#0C4A6E', lineHeight: 1.55 }}>
                  브라우저 상단 주소창 맨 왼쪽의 <strong>자물쇠(🔒) 또는 설정 아이콘</strong>을 마우스로 꾹 누른 상태에서 <strong>바탕화면 빈 곳으로 끌어다 놓으시면</strong> 바로가기 아이콘이 즉시 완성됩니다!
                </div>
              </div>

              {/* 추천 2: 크롬/엣지 공식 바로가기 만들기 */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  크롬 / 엣지 브라우저 메뉴로 만들기
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55 }}>
                  브라우저 오른쪽 상단 <strong>더보기 (점 3개 ⋮)</strong> ➔ <strong>[저장 및 공유]</strong> ➔ <strong>[바로가기 만들기]</strong>를 누르시면 바탕화면에 전용 수장고 아이콘이 쏙 들어갑니다.
                </div>
              </div>

              {/* 방법 3: 파일 다운로드 방식 & 앱 선택 팁 */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                    바로가기 파일 받기 (.url)
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadWindowsShortcut}
                    className="btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', padding: '0.4rem 0.75rem', background: '#FFFFFF', borderColor: '#CBD5E1', color: '#0F172A', fontWeight: 600 }}
                  >
                    <Download size={13} /> 파일 다운
                  </button>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5, background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px' }}>
                  💡 <strong>'열 앱을 선택하세요' 창이 뜰 때:</strong><br />
                  목록에서 <strong>Chrome</strong> 또는 <strong>Edge</strong>를 누르신 후, <strong>[항상]</strong>을 선택하시면 다음부터 클릭 시 바로 열립니다.
                </div>
              </div>

            </div>
          )}
        </div>

        {/* 모달 하단 주소 복사 바 */}
        <div style={{ padding: '0.9rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
            접속 주소: {window.location.origin}
          </div>
          <button
            type="button"
            onClick={handleCopyUrl}
            style={{ 
              border: '1px solid #CBD5E1', 
              background: '#FFFFFF', 
              borderRadius: '6px', 
              padding: '0.35rem 0.75rem', 
              fontSize: '0.78rem', 
              color: '#334155', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
            <span>{copied ? '주소 복사됨!' : '주소 복사'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
