import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, RefreshCw } from 'lucide-react';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, REFUND_POLICY } from '../data/policyTexts';

export default function PolicyModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const currentPolicy = activeTab === 'terms' 
    ? TERMS_OF_SERVICE 
    : activeTab === 'privacy' 
    ? PRIVACY_POLICY 
    : REFUND_POLICY;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="modal-header" style={{ paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#0F172A" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, fontFamily: 'var(--font-serif)' }}>
              Sujango (수장고) 서비스 정책 및 법적 고지
            </h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* 3대 정책 탭 */}
        <div className="tab-nav" style={{ padding: '0 1.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <button 
            className={`tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
            style={{ fontSize: '0.85rem' }}
          >
            <FileText size={14} style={{ display: 'inline', marginRight: '5px' }} />
            서비스 이용약관
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
            style={{ fontSize: '0.85rem' }}
          >
            <Lock size={14} style={{ display: 'inline', marginRight: '5px' }} />
            개인정보 처리방침
          </button>
          <button 
            className={`tab-btn ${activeTab === 'refund' ? 'active' : ''}`}
            onClick={() => setActiveTab('refund')}
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} style={{ display: 'inline', marginRight: '5px' }} />
            구독 및 환불 규정
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {currentPolicy.title}
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              최종 개정일: {currentPolicy.lastUpdated}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {currentPolicy.sections.map((sec, idx) => (
              <div key={idx} style={{ background: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
                  {sec.heading}
                </h5>
                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.65, whiteSpace: 'pre-line', margin: 0 }}>
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ padding: '0.85rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
            운영사: Ara Agent Lab | sujango.com
          </span>
          <button onClick={onClose} className="btn-primary" style={{ width: 'auto', padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
