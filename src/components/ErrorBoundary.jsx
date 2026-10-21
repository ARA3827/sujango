import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] 감지된 런타임 오류:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#dashboard';
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '3rem 1.5rem',
          maxWidth: '600px',
          margin: '2rem auto',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            화면을 불러오는 중 일시적인 문제가 생겼습니다
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            작가님의 소중한 데이터는 안전하게 보관되어 있습니다.<br />
            아래 버튼을 눌러 안전하게 대시보드로 돌아가실 수 있습니다.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              className="btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
            >
              대시보드로 돌아가기
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-outline"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
