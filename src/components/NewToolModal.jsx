import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Lightbulb, 
  Sparkles, 
  Check, 
  Trash2, 
  Star, 
  MessageSquare, 
  Mail, 
  Send,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getFeedbacks, addFeedback } from '../utils/feedbackStorage';

export default function NewToolModal({ isOpen, onClose, user }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'idea'
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFeedbacks(getFeedbacks());
      if (user?.name) {
        setAuthorName(user.name + ' 작가');
      } else {
        setAuthorName('');
      }
      setJustSubmitted(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const newEntry = await addFeedback({
      author: authorName.trim() || (user?.name ? `${user.name} 작가` : '익명의 창작자'),
      type: activeTab,
      text: content.trim(),
      rating: activeTab === 'review' ? rating : 5
    });

    setFeedbacks([newEntry, ...feedbacks]);
    setContent('');
    setIsSubmitting(false);
    setJustSubmitted(true);

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  // 관리자에게 이메일로 직접 보내기 링크
  const handleSendEmailToAdmin = () => {
    const subject = encodeURIComponent(`[Sujango 수장고 피드백] ${authorName || '작가'}님의 소중한 의견`);
    const body = encodeURIComponent(
      `안녕하세요, 수장고 관리자님.\n\n작성자: ${authorName || '작가'}\n유형: ${activeTab === 'idea' ? '새 기능 아이디어 제안' : '이용 소감 및 후기'}\n\n내용:\n${content || '(모달에 작성된 내용)'}\n\n---\nSujango 워크스페이스에서 전송됨`
    );
    window.open(`mailto:auth@sujango.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', color: '#B45309', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Lightbulb size={14} />
              <span>COMMUNITY & FEEDBACK</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-serif)' }}>
              새 도구 제안 & 작가 생생 후기
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
              작가님의 소중한 아이디어는 제품 로드맵에 우선 반영되며, 따뜻한 후기는 소개 페이지에 명예롭게 전시됩니다.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* 2대 작성 탭 스위처 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            style={{
              padding: '0.65rem',
              border: activeTab === 'review' ? '2px solid #0284C7' : '1px solid #E2E8F0',
              background: activeTab === 'review' ? '#F0F9FF' : '#FFFFFF',
              color: activeTab === 'review' ? '#0369A1' : '#64748B',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Star size={16} color={activeTab === 'review' ? '#D97706' : '#94A3B8'} fill={activeTab === 'review' ? '#D97706' : 'none'} />
            <span>이용 소감 & 응원 후기</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('idea')}
            style={{
              padding: '0.65rem',
              border: activeTab === 'idea' ? '2px solid #059669' : '1px solid #E2E8F0',
              background: activeTab === 'idea' ? '#ECFDF5' : '#FFFFFF',
              color: activeTab === 'idea' ? '#047857' : '#64748B',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Lightbulb size={16} />
            <span>새 기능·도구 아이디어 제안</span>
          </button>
        </div>

        {/* 성공 완료 알림 바 */}
        {justSubmitted && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#065F46', fontSize: '0.84rem' }}>
            <Check size={18} color="#059669" />
            <span>소중한 의견이 등록되었습니다! 수장고 공식 로드맵과 작가 라운지에 안전하게 반영되었습니다.</span>
          </div>
        )}

        {/* 작성 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                창작자 닉네임 / 활동명
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="예: 아틀리에_새벽, 푸른화실, 익명의 조각가"
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* 후기일 때 별점 선택 */}
            {activeTab === 'review' ? (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  만족도 별점
                </label>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '36px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer' }}
                    >
                      <Star 
                        size={20} 
                        color={star <= rating ? '#F59E0B' : '#CBD5E1'} 
                        fill={star <= rating ? '#F59E0B' : 'none'} 
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D97706', marginLeft: '4px' }}>
                    {rating}점
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  제안 분야
                </label>
                <select style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem', background: '#FFFFFF' }}>
                  <option>행정 서류 & 증빙 양식</option>
                  <option>전시 & 캡션 명패</option>
                  <option>작가노트 & 글쓰기 AI</option>
                  <option>작품 도록 & 보안 링크</option>
                  <option>기타 창작 편의 기능</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
              {activeTab === 'review' ? '수장고 이용 소감 및 추천 한마디' : '필요한 기능 아이디어 상세 내용'}
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={activeTab === 'review' 
                ? "수장고를 사용하면서 가장 편리했던 점이나 다른 작가님들께 추천하고 싶은 점을 자유롭게 적어주세요!"
                : "작업실에서 이런 기능이 있으면 정말 유용하겠다 싶은 아이디어를 자유롭게 남겨주세요."}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.84rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleSendEmailToAdmin}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}
              title="관리자 메일함으로 바로 보내기"
            >
              <Mail size={13} />
              <span>관리자 메일로 직접 전송</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="btn-primary"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', width: 'auto', gap: '5px' }}
            >
              <Send size={14} />
              <span>등록하기</span>
            </button>
          </div>
        </form>

        {/* 작가님들이 남겨주신 최근 피드백 & 아이디어 피드 */}
        <div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={15} color="#0284C7" />
            <span>최근 작가님들이 남겨주신 목소리</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {feedbacks.map((fb) => (
              <div 
                key={fb.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.75rem 0.85rem',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontWeight: 700,
                      background: fb.type === 'review' ? '#FEF3C7' : '#ECFDF5',
                      color: fb.type === 'review' ? '#B45309' : '#047857'
                    }}>
                      {fb.type === 'review' ? '⭐ 찐 후기' : '💡 기능 제안'}
                    </span>
                    <strong style={{ color: '#1E293B', fontSize: '0.82rem' }}>{fb.author}</strong>
                  </div>

                  <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{fb.createdAt}</span>
                </div>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.5, fontSize: '0.82rem' }}>
                  {fb.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
          <button onClick={onClose} className="btn-outline" style={{ fontSize: '0.84rem', padding: '0.5rem 1rem' }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
