import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import GlobalSearch from './GlobalSearch'
import { useI18n } from '../i18n'

export default function NavBar({ routes, onMenuClick }) {
  const { user, logout } = useAuth()
  const [langOpen, setLangOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('eduflow-ai-theme') || localStorage.getItem('sri-sudha-theme') || 'light')
  const { t, locale, setLanguage } = useI18n()

  const langRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('eduflow-ai-theme', theme)
    localStorage.removeItem('sri-sudha-theme')
  }, [theme])

  useEffect(() => {
    function onDoc(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी',   flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  ]

  const isDark = theme === 'dark'
  const navBg   = isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)'
  const dropBg   = isDark ? '#0f172a' : '#ffffff'
  const dropBorder = isDark ? '1px solid rgba(148,163,184,0.25)' : '1px solid #e2e8f0'

  return (
    <nav style={{
      background: navBg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: isDark ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(255,255,255,0.6)',
      boxShadow: isDark ? '0 8px 32px rgba(2,6,23,0.5)' : '0 4px 24px rgba(15,23,42,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      height: 64,
    }}>
      <div className="container-fluid px-3 px-lg-4" style={{ height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '1rem' }}>
          
          {/* Mobile Menu Toggle */}
          {user && (
            <button
              className="d-lg-none btn btn-sm"
              onClick={onMenuClick}
              style={{
                background: 'rgba(37,99,235,0.08)',
                color: '#2563EB', padding: '0.4rem 0.6rem',
                border: 'none', borderRadius: '0.5rem', fontSize: '1.2rem',
              }}
            >
              ☰
            </button>
          )}

          {/* Desktop Brand (if not logged in, or alongside sidebar) */}
          {!user && (
            <Link to="/entry" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <img src="/logo.svg" alt="EduFlow AI Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
              <span style={{
                fontSize: '1.2rem', fontWeight: 800,
                background: 'linear-gradient(135deg,#2563EB,#06B6D4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {t('brand')}
              </span>
            </Link>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

            <div className="d-none d-md-block" style={{ width: 220 }}>
              <GlobalSearch routes={routes} currentRole={user?.role} />
            </div>

            <button
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              style={{
                background: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(37,99,235,0.08)',
                color: isDark ? '#94a3b8' : '#2563EB',
                border: 'none', borderRadius: '0.625rem', padding: '0.45rem 0.7rem',
                cursor: 'pointer', fontSize: '1rem',
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <div style={{ position: 'relative' }} ref={langRef} className="d-none d-sm-block">
              <button
                onClick={() => setLangOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(37,99,235,0.08)', color: '#2563EB',
                  border: 'none', borderRadius: '0.625rem', padding: '0.45rem 0.75rem',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                }}
              >
                🌐 {locale.toUpperCase()} ▾
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: dropBg, border: dropBorder, borderRadius: '0.875rem',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.15)', minWidth: 160, zIndex: 1100, overflow: 'hidden'
                }}>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        width: '100%', padding: '0.65rem 1rem', border: 'none',
                        background: locale === lang.code ? 'rgba(37,99,235,0.1)' : 'transparent',
                        color: locale === lang.code ? '#2563EB' : (isDark ? '#e2e8f0' : '#1e293b'),
                        fontWeight: locale === lang.code ? 700 : 500,
                        fontSize: '0.875rem', cursor: 'pointer',
                      }}
                    >
                      <span>{lang.flag}</span> <span style={{ flex: 1, textAlign: 'left' }}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={logout}
                style={{
                  background: 'linear-gradient(135deg,#DC2626,#EF4444)', color: 'white',
                  border: 'none', borderRadius: '0.625rem', padding: '0.45rem 0.85rem',
                  fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                }}
              >
                🚪 {t('logout') || 'Logout'}
              </button>
            ) : (
              <Link
                to="/login"
                style={{
                  background: 'linear-gradient(135deg,#2563EB,#06B6D4)', color: 'white',
                  textDecoration: 'none', borderRadius: '0.625rem', padding: '0.45rem 1rem',
                  fontWeight: 700, fontSize: '0.85rem',
                }}
              >
                🔓 {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
