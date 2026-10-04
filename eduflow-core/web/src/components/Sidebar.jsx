import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const roleColors = {
  student: { bg: '#2563EB', light: 'rgba(37,99,235,0.1)', text: '#2563EB', icon: '👨‍🎓' },
  faculty: { bg: '#10B981', light: 'rgba(16,185,129,0.1)', text: '#059669', icon: '👨‍🏫' },
  parent:  { bg: '#F59E0B', light: 'rgba(245,158,11,0.1)', text: '#D97706', icon: '👨‍👩‍👧' },
  admin:   { bg: '#EF4444', light: 'rgba(239,68,68,0.1)',  text: '#DC2626', icon: '⚙️' },
}

const formatSlug = (slug) => {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export default function Sidebar({ routes, isOpen, setOpen }) {
  const { user, logout } = useAuth()
  
  if (!user) return null

  const role = user.role
  const themeData = roleColors[role] || roleColors.student
  
  // Filter routes for the current user's role
  const roleRoutes = routes.filter(r => r.role === role)

  // Quick categorization logic (can be expanded later)
  const categories = {
    'Academics': ['attendance-entry', 'marks-entry', 'lesson-planner', 'syllabus-tracker', 'class-timetable', 'academic-analytics', 'assignment-creator'],
    'Assessments': ['exam-invigilation', 'question-bank-upload', 'exam-calendar', 'online-exam', 'result-analysis'],
    'Communication': ['parent-messaging', 'department-notices', 'mentoring-log', 'feedback', 'student-messaging'],
    'Resources & Admin': ['resource-repository', 'leave-application', 'research-tracker', 'fee-payment', 'hostel-management', 'library-access'],
  }

  const getCategory = (slug) => {
    for (const [cat, slugs] of Object.entries(categories)) {
      if (slugs.includes(slug)) return cat
    }
    return 'General Modules'
  }

  const groupedRoutes = roleRoutes.reduce((acc, route) => {
    const cat = getCategory(route.slug)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(route)
    return acc
  }, {})

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setOpen(false)}
          className="d-lg-none"
          style={{
            position: 'fixed', inset: 0, zIndex: 1040,
            background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: 260,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-color, #e2e8f0)',
          height: '100vh',
          position: 'fixed',
          top: 0, left: 0,
          zIndex: 1050,
          display: 'flex', flexDirection: 'column',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <style>{`
          @media (min-width: 992px) {
            .sidebar { transform: translateX(0) !important; }
          }
        `}</style>
        
        {/* Brand Area */}
        <div style={{ 
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.25rem', borderBottom: '1px solid var(--border-color, #e2e8f0)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏫</span>
            <span style={{
              fontSize: '1.15rem', fontWeight: 800,
              background: 'linear-gradient(135deg,#2563EB,#06B6D4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              EduFlow AI
            </span>
          </div>
          <button 
            className="d-lg-none btn btn-sm" 
            onClick={() => setOpen(false)}
            style={{ padding: 0, fontSize: '1.2rem', color: 'var(--sidebar-muted)' }}
          >✕</button>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: themeData.bg, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem',
            }}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--app-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--app-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                {themeData.icon} {role}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          
          <NavLink 
            to={`/${role}-dashboard`}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.875rem', borderRadius: '0.5rem',
              marginBottom: '1rem', textDecoration: 'none',
              fontSize: '0.875rem', fontWeight: isActive ? 700 : 600,
              color: isActive ? themeData.text : 'var(--sidebar-text)',
              background: isActive ? themeData.light : 'transparent',
              transition: 'all 0.2s',
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>📊</span>
            Dashboard Overview
          </NavLink>

          {isDemoMode ? (
            <>
              {/* Demo Mode Curated AI Officers */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ 
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--app-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  marginBottom: '0.5rem', paddingLeft: '0.875rem'
                }}>
                  AI Officers (Live)
                </div>
                {[
                  { to: '/officer/accreditation', icon: '🏛️', label: 'Accreditation Officer' },
                  { to: '/officer/student-success', icon: '🎯', label: 'Student Success Officer' },
                  { to: '/officer/timetable', icon: '📅', label: 'Timetable Officer' },
                  { to: '/officer/admissions', icon: '🎓', label: 'Admission Officer' },
                  { to: '/officer/finance', icon: '💰', label: 'Finance Officer' },
                  { to: '/officers-dashboard', icon: '⚡', label: 'Officers Hub & ROI' },
                ].map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.55rem 0.875rem', borderRadius: '0.5rem',
                      marginBottom: '0.2rem', textDecoration: 'none',
                      fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                      color: isActive ? themeData.text : 'var(--sidebar-text)',
                      background: isActive ? themeData.light : 'transparent',
                      transition: 'all 0.2s',
                    })}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Demo Mode System & Core Tools */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ 
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--app-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  marginBottom: '0.5rem', paddingLeft: '0.875rem'
                }}>
                  System & Intelligence
                </div>
                {[
                  { to: '/ai-terminal', icon: '💻', label: 'AI Terminal' },
                  { to: '/admin-dashboard/audit-logs', icon: '📋', label: 'Audit Logs' },
                ].map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.55rem 0.875rem', borderRadius: '0.5rem',
                      marginBottom: '0.2rem', textDecoration: 'none',
                      fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                      color: isActive ? themeData.text : 'var(--sidebar-text)',
                      background: isActive ? themeData.light : 'transparent',
                      transition: 'all 0.2s',
                    })}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </>
          ) : (
            <>
              {role === 'admin' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ 
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--app-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    marginBottom: '0.5rem', paddingLeft: '0.875rem'
                  }}>
                    Accreditation AI
                  </div>
                  <NavLink
                    to="/admin-dashboard/naac-ai-analysis"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.55rem 0.875rem', borderRadius: '0.5rem',
                      marginBottom: '0.2rem', textDecoration: 'none',
                      fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                      color: isActive ? themeData.text : 'var(--sidebar-text)',
                      background: isActive ? themeData.light : 'transparent',
                      transition: 'all 0.2s',
                    })}
                  >
                    <span>🧠</span>
                    <span>NAAC AI Analysis</span>
                  </NavLink>
                  <NavLink
                    to="/admin-dashboard/insights"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.55rem 0.875rem', borderRadius: '0.5rem',
                      marginBottom: '0.2rem', textDecoration: 'none',
                      fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                      color: isActive ? themeData.text : 'var(--sidebar-text)',
                      background: isActive ? themeData.light : 'transparent',
                      transition: 'all 0.2s',
                    })}
                  >
                    <span>🧠</span>
                    <span>AI Insights</span>
                  </NavLink>
                  {!isDemoMode && (
                    <NavLink
                      to="/admin-dashboard/nirf"
                      onClick={() => setOpen(false)}
                      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.55rem 0.875rem', borderRadius: '0.5rem',
                        marginBottom: '0.2rem', textDecoration: 'none',
                        fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                        color: isActive ? themeData.text : 'var(--sidebar-text)',
                        background: isActive ? themeData.light : 'transparent',
                        transition: 'all 0.2s',
                      })}
                    >
                      <span>🏆</span>
                      <span>NIRF Ranking</span>
                    </NavLink>
                  )}
                </div>
              )}
              {Object.entries(groupedRoutes).map(([category, currentRoutes]) => (
                currentRoutes.length > 0 && (
                  <div key={category} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ 
                      fontSize: '0.7rem', fontWeight: 700, color: 'var(--app-text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      marginBottom: '0.5rem', paddingLeft: '0.875rem'
                    }}>
                      {category}
                    </div>
                    {currentRoutes.map(route => (
                      <NavLink
                        key={route.routePath}
                        to={route.routePath}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                          display: 'block',
                          padding: '0.55rem 0.875rem', borderRadius: '0.5rem',
                          marginBottom: '0.2rem', textDecoration: 'none',
                          fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                          color: isActive ? themeData.text : 'var(--sidebar-text)',
                          background: isActive ? themeData.light : 'transparent',
                          transition: 'all 0.2s',
                        })}
                      >
                        {formatSlug(route.slug)}
                      </NavLink>
                    ))}
                  </div>
                )
              ))}
            </>
          )}
        </div>
        
        {/* Footer Area */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavLink 
            to="/profile"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
              textDecoration: 'none', color: 'var(--sidebar-text)',
              fontSize: '0.85rem', fontWeight: 600,
            }}
          >
            ⚙️ Institution Settings
          </NavLink>
          <button 
            onClick={() => {
              setOpen(false)
              logout()
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
              border: 'none', background: 'transparent',
              color: '#EF4444', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, textAlign: 'left',
              width: '100%'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  )
}
