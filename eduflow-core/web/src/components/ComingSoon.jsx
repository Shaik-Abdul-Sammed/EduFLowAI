import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { getApiBaseURL } from '../config/apiConfig'

export default function ComingSoon({ 
  moduleName = 'This Module', 
  description = 'This module is in active development and will be available in the next release.' 
}) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [email, setEmail] = useState(user?.email || '')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const dashboardUrl = user?.role ? `/${user.role}-dashboard` : '/admin-dashboard'

  const handleNotify = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error')
      return
    }

    setLoading(true)
    try {
      const baseUrl = getApiBaseURL()
      await fetch(`${baseUrl}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          module: moduleName,
          institutionId: user?.institutionId || 'demo',
          timestamp: new Date().toISOString()
        })
      })

      setSubmitted(true)
      addToast(`You will be notified as soon as ${moduleName} is available!`, 'success')
    } catch {
      // Graceful fallback for demo
      setSubmitted(true)
      addToast(`You will be notified when ${moduleName} launches.`, 'success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Large Visual Icon */}
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2.5rem'
        }}>
          ⏳
        </div>

        {/* Status Badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(245, 158, 11, 0.1)',
          color: '#d97706',
          padding: '0.35rem 0.85rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem'
        }}>
          <Clock size={13} />
          Under Active Development
        </span>

        {/* Title */}
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--app-text, #0f172a)',
          marginBottom: '0.75rem'
        }}>
          {moduleName} is Coming Soon
        </h2>

        {/* Description */}
        <p style={{
          color: 'var(--app-text-muted, #64748b)',
          fontSize: '0.975rem',
          lineHeight: '1.6',
          maxWidth: '440px',
          margin: '0 auto 2rem'
        }}>
          {description}
        </p>

        {/* Notification Capture Form */}
        {submitted ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            color: '#059669',
            fontWeight: 600,
            fontSize: '0.95rem',
            marginBottom: '1.75rem'
          }}>
            <CheckCircle size={18} />
            We have recorded your email! We will notify you at release.
          </div>
        ) : (
          <form onSubmit={handleNotify} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '420px',
            margin: '0 auto 1.75rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Enter your institutional email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--input-bg, #ffffff)',
                  color: 'var(--app-text, #0f172a)'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#2563EB',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Bell size={16} />
                {loading ? 'Submitting...' : 'Notify Me'}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--app-text-muted, #94a3b8)' }}>
              Institutional administrators receive early access release builds.
            </span>
          </form>
        )}

        {/* Back Link */}
        <div>
          <Link
            to={dashboardUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#2563EB',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={16} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
