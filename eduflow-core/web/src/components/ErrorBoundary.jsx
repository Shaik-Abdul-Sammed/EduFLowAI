import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      fetch('/api/v1/admin/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          error: error?.message || String(error),
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently swallow reporting failure
      })
    } catch {
      // Ignore reporting error
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#030712',
          color: '#f8fafc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
          width: '100%',
        }}>
          <div style={{
            maxWidth: '520px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              fontSize: '1.6rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#f8fafc' }}>
              Something went wrong.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Something went wrong. Please refresh the page.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Reload
              </button>
              <button
                type="button"
                onClick={this.handleRetry}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
