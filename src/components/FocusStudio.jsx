import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FocusStudio({ onBack, onUpdateTimerStatus, onUpdateDdaySummary }) {
  // 1. D-Day 일정 관리 상태 (LocalStorage)
  const [ddays, setDdays] = useState(() => {
    try {
      const saved = localStorage.getItem('artflow_ddays');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 1, title: '2027 상반기 서울문화재단 청년예술지원 공모 마감', targetDate: '2026-10-31', category: '공모전' },
      { id: 2, title: '갤러리 아라 기획 단체전 작품 반입 및 설치', targetDate: '2026-11-15', category: '전시' },
      { id: 3, title: '시민 아카데미 4주차 출강 강의계획서 제출', targetDate: '2026-10-20', category: '출강' },
    ];
  });

  const [newDday, setNewDday] = useState({
    title: '',
    targetDate: '',
    category: '공모전'
  });

  // 2. 15분 행정 타임박스 타이머 상태
  const TOTAL_SECONDS = 15 * 60; // 15분
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef(null);

  // Web Audio 차임벨 사운드
  const playChimeSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // 맑고 아름다운 3단 아르페지오 (도-미-솔-도)
      playTone(523.25, 0, 1.2);    // C5
      playTone(659.25, 0.2, 1.2);  // E5
      playTone(783.99, 0.4, 1.4);  // G5
      playTone(1046.50, 0.6, 2.0); // C6
    } catch (e) {
      console.error(e);
    }
  };

  // 타이머 루프
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsCompleted(true);
            playChimeSound();
            if (onUpdateTimerStatus) onUpdateTimerStatus(true);
            triggerConfetti();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  // D-Day 저장 및 대시보드 갱신
  useEffect(() => {
    try {
      localStorage.setItem('artflow_ddays', JSON.stringify(ddays));
    } catch (e) {
      console.error(e);
    }

    if (onUpdateDdaySummary) {
      // 가장 임박한 D-Day 계산
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const sorted = [...ddays].map(item => {
        const target = new Date(item.targetDate);
        target.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
        return { ...item, diffDays };
      }).sort((a, b) => a.diffDays - b.diffDays);

      const next = sorted.find(item => item.diffDays >= 0) || sorted[0] || null;
      onUpdateDdaySummary({
        nextDday: next,
        daysLeft: next ? next.diffDays : null
      });
    }
  }, [ddays]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleStartTimer = () => setIsRunning(true);
  const handlePauseTimer = () => setIsRunning(false);
  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_SECONDS);
    setIsCompleted(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAddDday = (e) => {
    e.preventDefault();
    if (!newDday.title || !newDday.targetDate) return;

    const newItem = {
      id: Date.now(),
      title: newDday.title,
      targetDate: newDday.targetDate,
      category: newDday.category
    };

    setDdays([...ddays, newItem]);
    setNewDday({ title: '', targetDate: '', category: '공모전' });
  };

  const handleDeleteDday = (id) => {
    setDdays(ddays.filter(item => item.id !== id));
  };

  const getDaysLeft = (targetStr) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="workspace-wrapper">
      <div className="workspace-top-bar">
        <button onClick={onBack} className="back-btn">
          ← 전체 도구 목록으로
        </button>
      </div>

      <div className="workspace-title-area" style={{ marginBottom: '1.5rem' }}>
        <h2>창작 몰입 & 마감 캘린더</h2>
        <p>행정 업무에 하루 종일 에너지를 뺏기지 마세요. 15분 타임박스로 깔끔하게 끝내고 오롯이 캔버스로 돌아가세요.</p>
      </div>

      <div className="workspace-grid">
        {/* 1. 하루 15분 행정 타임박스 타이머 */}
        <div className="panel-card" style={{ textAlign: 'center' }}>
          <div className="panel-card-title" style={{ justifyContent: 'center' }}>
            <span>하루 15분 행정 타임박스</span>
          </div>

          <p style={{ fontSize: '0.86rem', color: '#6B7280', marginBottom: '1.75rem' }}>
            서류 정리, 메일 답장, 영수증 모으기는 딱 15분 안에 끝냅니다.<br />
            타이머가 울리면 컴퓨터를 닫고 작업실로 향하세요.
          </p>

          <div 
            className="timer-clock-display"
            style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: timeLeft <= 60 ? '#E11D48' : '#0F172A',
              margin: '1.25rem 0',
              userSelect: 'none'
            }}
          >
            {formatTime(timeLeft)}
          </div>

          {/* 진행바 */}
          <div style={{
            width: '100%',
            height: '6px',
            background: '#F1F5F9',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: `${((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100}%`,
              height: '100%',
              background: '#0F172A',
              transition: 'width 1s linear'
            }} />
          </div>

          {/* 타이머 컨트롤 버튼 */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {!isRunning ? (
              <button 
                onClick={handleStartTimer} 
                className="btn-primary" 
                style={{ width: 'auto', padding: '0.75rem 2rem' }}
                disabled={timeLeft === 0}
              >
                <Play size={18} /> {timeLeft === TOTAL_SECONDS ? '15분 집중 시작' : '계속하기'}
              </button>
            ) : (
              <button 
                onClick={handlePauseTimer} 
                className="btn-outline" 
                style={{ padding: '0.75rem 2rem', borderColor: '#0F172A' }}
              >
                <Pause size={18} /> 일시정지
              </button>
            )}

            <button 
              onClick={handleResetTimer} 
              className="btn-outline"
              style={{ padding: '0.75rem 1.25rem' }}
              title="타이머 리셋"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {isCompleted && (
            <div style={{
              marginTop: '1.75rem',
              padding: '1rem',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '8px',
              color: '#065F46',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} />
              <span>오늘의 행정 15분이 완료되었습니다! 이제 온전히 작업실로 가실 시간입니다 🎨</span>
            </div>
          )}
        </div>

        {/* 2. D-Day 마감 관리 */}
        <div className="panel-card">
          <div className="panel-card-title">
            <span>주요 마감 D-Day</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 400 }}>공모전 / 전시 / 서류</span>
          </div>

          {/* 새 D-Day 추가 폼 */}
          <form onSubmit={handleAddDday} style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #E5E7EB' }}>
            <div className="form-group">
              <label className="form-label">일정 내용</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 2027 ○○미술관 청년작가 공모 마감"
                value={newDday.title}
                onChange={(e) => setNewDday({...newDday, title: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">분류</label>
                <select 
                  className="form-select"
                  value={newDday.category}
                  onChange={(e) => setNewDday({...newDday, category: e.target.value})}
                >
                  <option value="공모전">공모전 / 지원사업</option>
                  <option value="전시">전시 / 반입 설치</option>
                  <option value="출강">출강 / 서류 제출</option>
                  <option value="기타">기타 마감</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">마감일자</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={newDday.targetDate}
                  onChange={(e) => setNewDday({...newDday, targetDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={15} /> 마감 일정 등록
            </button>
          </form>

          {/* D-Day 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ddays.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>
                등록된 마감 일정이 없습니다.
              </div>
            ) : (
              ddays.map((item) => {
                const diff = getDaysLeft(item.targetDate);
                const isUrgent = diff >= 0 && diff <= 3;
                const isPast = diff < 0;

                return (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.72rem', background: '#E2E8F0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {item.category}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        마감일: {item.targetDate}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        background: isUrgent ? '#FEE2E2' : isPast ? '#F3F4F6' : '#EFF6FF',
                        color: isUrgent ? '#DC2626' : isPast ? '#9CA3AF' : '#1D4ED8'
                      }}>
                        {diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`}
                      </span>
                      <button 
                        onClick={() => handleDeleteDday(item.id)}
                        style={{ color: '#9CA3AF', padding: '4px' }}
                        title="일정 삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
