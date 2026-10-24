import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Users, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { fetchFoundingApplicants } from '../utils/supabaseClient';

const STORAGE_KEY = 'sujango_founding_applicants';

export default function FoundingApplicantsAdminModal({ isOpen, onClose }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // 신청자 목록 로드 (Supabase 우선, 로컬스토리지 병합)
  const loadApplicants = async () => {
    setLoading(true);
    let list = [];

    // 1. Supabase 클라우드 조회
    try {
      const res = await fetchFoundingApplicants();
      if (res.success && res.data && res.data.length > 0) {
        list = res.data.map(item => ({
          id: item.applicant_code || item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          genres: Array.isArray(item.genres) ? item.genres : [],
          genreOther: item.genre_other,
          experience: item.experience,
          activities: Array.isArray(item.activities) ? item.activities : [],
          portfolioUrl: item.portfolio_url,
          painPoint: item.pain_point,
          wantedFeatures: Array.isArray(item.wanted_features) ? item.wanted_features : [],
          currentStorage: Array.isArray(item.current_storage) ? item.current_storage : [],
          promoConsent: item.promo_consent,
          appliedAt: item.created_at
        }));
      }
    } catch (e) {
      console.warn('Cloud fetch failed, using local backup:', e);
    }

    // 2. 로컬스토리지 백업 데이터와 병합 (중복 이메일 제거)
    try {
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const emailMap = new Set(list.map(a => a.email));
      for (const item of local) {
        if (!emailMap.has(item.email)) {
          list.push(item);
          emailMap.add(item.email);
        }
      }
    } catch (e) {}

    // 최신 순 정렬
    list.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
    setApplicants(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadApplicants();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 검색 필터링
  const filtered = applicants.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      (a.name || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.phone || '').includes(q) ||
      (a.genres || []).some(g => g.toLowerCase().includes(q)) ||
      (a.painPoint || '').toLowerCase().includes(q)
    );
  });

  // 이메일 일괄 복사
  const handleCopyEmails = () => {
    const emails = filtered.map(a => a.email).filter(Boolean).join(', ');
    if (!emails) {
      alert('복사할 이메일 주소가 없습니다.');
      return;
    }
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 엑셀(CSV) 다운로드 (UTF-8 BOM 포함으로 한글 깨짐 방지)
  const handleDownloadCSV = () => {
    if (filtered.length === 0) {
      alert('내려받을 신청자 데이터가 없습니다.');
      return;
    }

    const headers = [
      '신청일시',
      '접수코드',
      '작가명',
      '이메일',
      '연락처',
      '활동분야',
      '경력',
      '창작고민(PainPoint)',
      '원하는기능',
      '포트폴리오',
      '작품소개동의'
    ];

    const rows = filtered.map(a => [
      a.appliedAt ? new Date(a.appliedAt).toLocaleString('ko-KR') : '',
      a.id || '',
      `"${(a.name || '').replace(/"/g, '""')}"`,
      a.email || '',
      a.phone || '',
      `"${[...(a.genres || []), a.genreOther].filter(Boolean).join(', ')}"`,
      a.experience || '',
      `"${(a.painPoint || '').replace(/"/g, '""')}"`,
      `"${(a.wantedFeatures || []).join(', ')}"`,
      a.portfolioUrl || '',
      `"${(a.promoConsent || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `수장고_1기_파운딩아티스트_신청명단_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '960px', 
          width: '100%', 
          maxHeight: '90vh',
          background: '#FFFFFF', 
          borderRadius: '16px', 
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* 모달 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', borderBottom: '1px solid #E2E8F0', background: '#0F172A', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#38BDF8', color: '#0F172A', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
              관리자 전용
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>1기 파운딩 아티스트 신청자 관리</span>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 400 }}>
                (총 {applicants.length}명 접수)
              </span>
            </h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 툴바 (검색 & 액션 버튼) */}
        <div style={{ padding: '0.9rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '380px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="작가명, 이메일, 분야, 고민 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={loadApplicants}
              disabled={loading}
              title="새로고침"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                background: '#FFFFFF',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? '조회중...' : '새로고침'}</span>
            </button>

            <button
              onClick={handleCopyEmails}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                background: copied ? '#ECFDF5' : '#FFFFFF',
                color: copied ? '#059669' : '#334155',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Copy size={13} />
              <span>{copied ? '이메일 복사완료!' : '이메일 일괄 복사'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={13} />
              <span>엑셀(CSV) 다운로드</span>
            </button>
          </div>
        </div>

        {/* 신청자 목록 영역 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', background: '#FFFFFF' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B' }}>
              <Users size={36} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {searchQuery ? '검색된 신청자가 없습니다.' : '아직 접수된 지원서가 없습니다.'}
              </div>
              <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#94A3B8' }}>
                작가님들이 지원서를 작성하면 이곳에 실시간으로 집계됩니다.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    background: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {/* 상단 1행: 번호, 작가명, 연락처, 신청일시 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.74rem', background: '#E2E8F0', color: '#334155', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                        #{filtered.length - idx}
                      </span>
                      <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{item.name} 작가님</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>({item.experience || '경력 미지정'})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: '#64748B' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={13} /> {item.email}
                      </span>
                      {item.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} /> {item.phone}
                        </span>
                      )}
                      <span style={{ color: '#94A3B8', fontSize: '0.76rem' }}>
                        {item.appliedAt ? new Date(item.appliedAt).toLocaleString('ko-KR') : ''}
                      </span>
                    </div>
                  </div>

                  {/* 중단 2행: 분야 뱃지 및 포트폴리오 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {(item.genres || []).map(g => (
                      <span key={g} style={{ fontSize: '0.72rem', background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                        {g}
                      </span>
                    ))}
                    {item.genreOther && (
                      <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '999px' }}>
                        기타: {item.genreOther}
                      </span>
                    )}

                    {item.portfolioUrl && (
                      <a 
                        href={item.portfolioUrl.startsWith('http') ? item.portfolioUrl : `https://${item.portfolioUrl}`}
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.76rem', color: '#2563EB', textDecoration: 'none', marginLeft: '6px', fontWeight: 600 }}
                      >
                        <ExternalLink size={12} /> 포트폴리오 열기
                      </a>
                    )}
                  </div>

                  {/* 하단 3행: 작가의 고민거리 (Pain Point) */}
                  <div style={{ fontSize: '0.84rem', color: '#334155', background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A', marginRight: '6px' }}>💬 작가 고민:</span>
                    <span>{item.painPoint}</span>
                  </div>

                  {/* 부가 정보: 원하는 기능 & 작품 소개 희망 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#64748B', flexWrap: 'wrap', gap: '6px' }}>
                    <div>
                      <strong>희망 기능:</strong> {(item.wantedFeatures || []).join(', ') || '전체 기능 관심'}
                    </div>
                    <div>
                      <strong>작품 소개:</strong> {item.promoConsent || '미선택'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div style={{ padding: '0.8rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748B' }}>
          <span>💡 신청 데이터는 Supabase 클라우드 DB와 로컬에 이중 안전 보관됩니다.</span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: '#FFFFFF',
              color: '#0F172A',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
