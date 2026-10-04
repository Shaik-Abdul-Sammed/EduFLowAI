import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { DEMO_ACCOUNTS } from '../../config/demoCredentials'
import { mapAuthError } from '../../services/authService'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('eduflow_remembered_email') || ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [institutionId, setInstitutionId] = useState('demo')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem('eduflow_remembered_email')) ||
        localStorage.getItem('eduflow_remember_me') === 'true'
    } catch {
      return false
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFillAdmin = () => {
    const adminAccount = DEMO_ACCOUNTS.find(a => a.id === 'admin') || {
      email: 'admin@demo.edu',
      password: 'Demo@2026',
      institutionId: 'demo',
    }
    setEmail(adminAccount.email)
    setPassword(adminAccount.password)
    setInstitutionId(adminAccount.institutionId || 'demo')
    setPhone('')
    setError('')
  }

  const handleFillDean = () => {
    const deanAccount = DEMO_ACCOUNTS.find(a => a.id === 'dean') || {
      email: 's9010150809@gmail.com',
      password: 'Demo@2026',
      institutionId: 'demo',
    }
    setEmail(deanAccount.email)
    setPassword(deanAccount.password)
    setInstitutionId(deanAccount.institutionId || 'demo')
    setPhone('9010150809')
    setError('')
  }

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked
    setRememberMe(checked)
    try {
      localStorage.setItem('eduflow_remember_me', String(checked))
      if (!checked) {
        localStorage.removeItem('eduflow_remembered_email')
      }
    } catch {
      // Ignore
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await login({
        email: email.trim(),
        username: email.trim(),
        password,
        institutionId: institutionId || 'demo',
      })

      try {
        if (rememberMe) {
          localStorage.setItem('eduflow_remembered_email', email.trim())
          localStorage.setItem('eduflow_remember_me', 'true')
        } else {
          localStorage.removeItem('eduflow_remembered_email')
        }
      } catch {
        // Ignore
      }

      const role = res?.user?.role || 'admin'
      navigate(`/${role}-dashboard`, { replace: true })
    } catch (err) {
      const friendly = mapAuthError(err)
      setError(friendly)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A2540 0%, #061325 50%, #0B192C 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: '#ffffff',
        borderRadius: '1.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        padding: '2.5rem 2.25rem',
      }}>
        {/* Section 1 - Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}>
            <img
              src="/logo.svg"
              alt="EduFlow AI"
              width="48"
              height="48"
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                objectFit: 'contain',
              }}
            />
            <span style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0A2540',
              letterSpacing: '-0.02em',
            }}>
              EduFlow AI
            </span>
          </div>
          <p style={{
            color: '#64748B',
            fontSize: '0.925rem',
            fontWeight: 500,
            margin: 0,
          }}>
            The Autonomous Institution Operating System
          </p>
        </div>

        {/* Section 2 - Demo Credentials Helper Card */}
        <div style={{
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: '0.875rem',
          padding: '1.25rem',
          marginBottom: '1.75rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.875rem',
          }}>
            <Sparkles size={16} color="#2563EB" />
            <h3 style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#0A2540',
              margin: 0,
            }}>
              Try the Demo
            </h3>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              background: '#DBEAFE',
              color: '#1D4ED8',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              marginLeft: 'auto',
            }}>
              One-Tap Access
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Admin option */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '0.625rem',
              padding: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B' }}>
                  For Administrators <span style={{ color: '#64748B', fontWeight: 500 }}>(NAAC / NIRF / Insights)</span>
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#475569', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                Email: <strong>admin@demo.edu</strong> • Password: <strong>Demo@2026</strong>
              </div>
              <button
                type="button"
                onClick={handleFillAdmin}
                style={{
                  width: '100%',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  transition: 'background 0.15s ease',
                }}
              >
                <span>Fill Admin Credentials</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Dean option */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '0.625rem',
              padding: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B' }}>
                  For College Dean <span style={{ color: '#64748B', fontWeight: 500 }}>(personal demo)</span>
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#475569', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                Email: <strong>s9010150809@gmail.com</strong> • Phone: <strong>9010150809</strong>
              </div>
              <button
                type="button"
                onClick={handleFillDean}
                style={{
                  width: '100%',
                  background: '#0F766E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  transition: 'background 0.15s ease',
                }}
              >
                <span>Fill Dean Credentials</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              padding: '0.75rem 1rem',
              borderRadius: '0.625rem',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              lineHeight: 1.45,
            }}
          >
            {error}
          </div>
        )}

        {/* Section 3 - Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Address Field */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1E293B',
                marginBottom: '0.35rem',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.edu"
                aria-label="Email Address"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  fontSize: '0.925rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '0.625rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Mail
                size={16}
                color="#94A3B8"
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
            {phone && (
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                Associated Phone: {phone}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1E293B',
                marginBottom: '0.35rem',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-label="Password"
                style={{
                  width: '100%',
                  padding: '0.65rem 2.75rem 0.65rem 2.5rem',
                  fontSize: '0.925rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '0.625rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Lock
                size={16}
                color="#94A3B8"
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748B',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#475569',
              cursor: 'pointer',
              userSelect: 'none',
            }}>
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                style={{ cursor: 'pointer' }}
              />
              <span>Remember Me</span>
            </label>

            <Link
              to="/forgot-password"
              style={{
                color: '#2563EB',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.625rem',
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(10, 37, 64, 0.25)',
              opacity: loading ? 0.75 : 1,
            }}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Authenticating...' : 'Login Securely'}</span>
          </button>
        </form>

        {/* Section 4 - Footer */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #F1F5F9',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748B',
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: '#2563EB',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Create one
            </Link>
          </p>
          <p style={{ margin: 0 }}>
            <Link
              to="/welcome"
              style={{
                color: '#64748B',
                textDecoration: 'none',
                fontSize: '0.8rem',
              }}
            >
              ← Back to Welcome
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
