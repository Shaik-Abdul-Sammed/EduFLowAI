import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LazyMotionDiv, LazyMotionButton } from '../../components/LazyMotion'
import { useAuth } from '../../hooks/useAuth'
import { studentDummyIds } from '../../utils/studentCatalog'
import { useI18n } from '../../i18n'

const instituteName = 'EduFlow AI'

const roleDefaults = {
  student: { username: studentDummyIds[0].id, password: 'student123' },
  faculty: { username: 'faculty', password: 'faculty123' },
  parent:  { username: 'parent',  password: 'parent123'  },
  admin:   { username: 'admin',   password: 'admin123'   },
}

const roleInfo = {
  student: { icon: '👨‍🎓', color: '#2563EB', gradStart: '#2563EB', gradEnd: '#06B6D4', title: 'Student',  desc: 'Access your academics'  },
  faculty: { icon: '👨‍🏫', color: '#10B981', gradStart: '#10B981', gradEnd: '#0EA5E9', title: 'Faculty',  desc: 'Manage your courses'   },
  parent:  { icon: '👨‍👩‍👧', color: '#F59E0B', gradStart: '#F59E0B', gradEnd: '#EF4444', title: 'Parent',   desc: 'Monitor child progress' },
  admin:   { icon: '⚙️',   color: '#7C3AED', gradStart: '#7C3AED', gradEnd: '#EF4444', title: 'Admin',    desc: 'System control'        },
}

const sideFeatures = [
  { icon: '🔐', text: 'Role-based secure access' },
  { icon: '📊', text: 'Real-time dashboards' },
  { icon: '📱', text: 'PWA offline support' },
  { icon: '🌍', text: 'Multilingual interface' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useI18n()

  const [role, setRole] = useState('student')
  const [username, setUsername] = useState(roleDefaults.student.username)
  const [password, setPassword] = useState(roleDefaults.student.password)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleRoleChange(nextRole) {
    setRole(nextRole)
    setUsername(roleDefaults[nextRole].username)
    setPassword(roleDefaults[nextRole].password)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login({ role, username, password })
      navigate(`/${role}-dashboard`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const info = roleInfo[role]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <LazyMotionDiv
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1fr',
          width: '100%', maxWidth: 1000,
          borderRadius: '1.75rem', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(15,23,42,0.16)',
        }}
        className="login-grid"
      >
        {/* ── LEFT PANEL ── */}
        <div className="login-side-panel d-none d-lg-flex" style={{ 
          flexDirection: 'column', justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${info.gradStart}, ${info.gradEnd})`,
          padding: '3rem', color: 'white'
        }}>
          <div>
            <Link to="/entry" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '3rem', color: 'white' }}>
              <span style={{ fontSize: '1.5rem' }}>🏫</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.04em' }}>{instituteName}</span>
            </Link>

            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
              Welcome back to<br />the {info.title} Portal
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: 1.6, maxWidth: 320, marginBottom: '2.5rem' }}>
              {info.desc} and stay connected with the EduFlow AI core system seamlessly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sideFeatures.map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '0.625rem',
                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  }}>
                    {f.icon}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', fontWeight: 600 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Form) ── */}
        <div style={{
          background: '#ffffff', padding: 'clamp(2rem, 4vw, 3rem)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.2rem' }}>{t('sign_in')}</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Select your role to continue</p>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
            {Object.entries(roleInfo).map(([roleKey, roleData]) => {
              const isSelected = role === roleKey
              return (
                <LazyMotionButton
                  key={roleKey} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleRoleChange(roleKey)}
                  style={{
                    padding: '0.75rem 0.25rem', borderRadius: '0.875rem',
                    border: isSelected ? `2px solid ${roleData.color}` : '2px solid #e2e8f0',
                    background: isSelected ? `${roleData.color}12` : '#f8fafc',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{roleData.icon}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isSelected ? roleData.color : '#94a3b8', textTransform: 'uppercase' }}>
                    {roleData.title}
                  </span>
                </LazyMotionButton>
              )
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                {t('username_label')}
              </label>
              <input
                className="form-control"
                placeholder={t('username_label') + ` (${role})`}
                value={username} onChange={e => setUsername(e.target.value)}
                required style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem' }}
                onFocus={e => { e.currentTarget.style.borderColor = info.color; e.currentTarget.style.boxShadow = `0 0 0 3px ${info.color}20` }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            {/* Password */}
            <LazyMotionDiv key="password" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: 0 }}>{t('password_label')}</label>
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ fontSize: '0.75rem', color: info.color, background: 'none', border: 'none', fontWeight: 600, padding: 0 }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem', letterSpacing: showPassword ? 'normal' : '0.15em' }}
                onFocus={e => { e.currentTarget.style.borderColor = info.color; e.currentTarget.style.boxShadow = `0 0 0 3px ${info.color}20` }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </LazyMotionDiv>

            {/* Error */}
            {error && (
              <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit" disabled={loading}
                style={{
                  padding: '0.875rem', background: `linear-gradient(135deg, ${info.gradStart}, ${info.gradEnd})`,
                  border: 'none', borderRadius: '0.875rem', color: 'white',
                  fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 14px ${info.gradStart}50`, transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Authenticating...' : t('login_securely')}
              </button>
            </div>

          </form>
        </div>
      </LazyMotionDiv>

      <style>{`
        @media (max-width: 991px) {
          .login-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
