import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Mail, ArrowLeft, CheckCircle, ShieldCheck, HelpCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [institutionId, setInstitutionId] = useState('demo')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0E27 0%, #111827 50%, #030712 100%)',
        color: '#ffffff',
        padding: '1.5rem',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          borderRadius: '1.25rem',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(124, 58, 237, 0.2))',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#93c5fd'
            }}
          >
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Password Recovery
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Enter your verified institutional email to reset your account password.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.75rem',
                color: '#6ee7b7'
              }}
            >
              <CheckCircle size={32} style={{ margin: '0 auto 0.75rem', color: '#10B981', display: 'block' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem', color: '#ffffff' }}>
                Recovery Link Dispatched
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                If an account exists for <strong style={{ color: '#93c5fd' }}>{email}</strong> (Institution: <code>{institutionId}</code>), instructions to securely reset your credentials have been sent.
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.8rem',
                color: '#94a3b8',
                marginBottom: '1.75rem',
                textAlign: 'left',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#e2e8f0', fontWeight: 600 }}>
                <ShieldCheck size={16} color="#3b82f6" /> Demo Environment Note
              </div>
              For instant testing, pre-configured roles and one-click demo credentials are fully accessible directly on the Login page.
            </div>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                background: '#2563EB',
                color: '#ffffff',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              <ArrowLeft size={16} /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Institutional Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="e.g., admin@ssit.edu or user@eduflow.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Institution Code / Identifier
              </label>
              <input
                type="text"
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                placeholder="demo"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                background: loading ? '#475569' : 'linear-gradient(135deg, #2563EB, #7C3AED)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '1.25rem',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'Dispatched...' : 'Send Password Reset Link'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <Link
                to="/login"
                style={{
                  color: '#93c5fd',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>

              <Link
                to="/help"
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <HelpCircle size={14} /> Contact IT Support
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
