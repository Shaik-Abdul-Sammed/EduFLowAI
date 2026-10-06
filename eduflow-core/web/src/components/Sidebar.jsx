import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const roleColors = {
  student: { bg: '#2563EB', light: 'rgba(37,99,235,0.1)', text: '#2563EB', icon: '👨‍🎓' },
  faculty: { bg: '#10B981', light: 'rgba(16,185,129,0.1)', text: '#059669', icon: '👨‍🏫' },
  parent:  { bg: '#F59E0B', light: 'rgba(245,158,11,0.1)', text: '#D97706', icon: '👨‍👩‍👧' },
  admin:   { bg: '#EF4444', light: 'rgba(239,68,68,0.1)',  text: '#DC2626', icon: '⚙️' },
  hod:     { bg: '#8B5CF6', light: 'rgba(139,92,246,0.1)', text: '#7C3AED', icon: '🎓' },
  staff:   { bg: '#0EA5E9', light: 'rgba(14,165,233,0.1)', text: '#0284C7', icon: '📋' },
}

const formatSlug = (slug) => {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}


export default function Sidebar({ routes, isOpen, setOpen }) {
  const { user, logout } = useAuth()
  
  if (!user) return null

  const role = user.role
  const themeData = roleColors[role] || roleColors.student
  
  // Filter routes for the current user's role
  const roleRoutes = (routes || []).filter(r => r.role === role)

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
          background: 'var(--sidebar-bg, #ffffff)',
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
            <span style={{ fontSize: '1.4rem' }}>🎓</span>
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
              {(user.firstName || user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--app-text, #1e293b)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || user.email || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--app-text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>
                {themeData.icon} {role} {user.department ? `• ${user.department}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          
          {/* Main Dashboard Link */}
          <NavLink 
            to={role === 'staff' ? '/staff-dashboard' : role === 'hod' ? '/hod-dashboard' : `/${role}-dashboard`}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.875rem', borderRadius: '0.5rem',
              marginBottom: '1rem', textDecoration: 'none',
              fontSize: '0.875rem', fontWeight: isActive ? 700 : 600,
              color: isActive ? themeData.text : 'var(--sidebar-text, #334155)',
              background: isActive ? themeData.light : 'transparent',
              transition: 'all 0.2s',
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>📊</span>
            {role === 'hod' ? 'Department Dashboard' : role === 'staff' ? 'My Dashboard' : 'Dashboard Overview'}
          </NavLink>

          {/* ADMIN ROLE LINKS */}
          {role === 'admin' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ 
                fontSize: '0.7rem', fontWeight: 700, color: 'var(--app-text-muted, #94a3b8)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '0.5rem', paddingLeft: '0.875rem'
              }}>
                Academic Management
              </div>
              {[
                { to: '/officers-dashboard', icon: '⚡', label: 'AI Officers Hub' },
                { to: '/admin-dashboard/attendance', icon: '👥', label: 'Attendance Intelligence' },
                { to: '/admin-dashboard/portal', icon: '🔌', label: 'Portal Connections' },
                { to: '/admin-dashboard/calendar', icon: '📅', label: 'Academic Calendar' },
                { to: '/admin-dashboard/staff', icon: '🛡️', label: 'Staff Management' },
                { to: '/admin-dashboard/naac-ai-analysis', icon: '🏛️', label: 'NAAC Dashboard' },
                { to: '/admin-dashboard/nirf', icon: '🏆', label: 'NIRF Ranking' },
                { to: '/admin-dashboard/insights', icon: '🧠', label: 'AI Insights' },
                { to: '/admin-dashboard/leads', icon: '📈', label: 'Lead Management' },
                { to: '/admin-dashboard/invoices', icon: '💳', label: 'Invoice Generator' },
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
                    color: isActive ? themeData.text : 'var(--sidebar-text, #334155)',
                    background: isActive ? themeData.light : 'transparent',
                    transition: 'all 0.2s',
                  })}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {/* HOD ROLE LINKS */}
          {role === 'hod' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ 
                fontSize: '0.7rem', fontWeight: 700, color: 'var(--app-text-muted, #94a3b8)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '0.5rem', paddingLeft: '0.875rem'
              }}>
                Department Command
              </div>
              {[
                { to: '/hod-dashboard/staff', icon: '👥', label: 'Staff & Approvals' },
                { to: '/hod-dashboard/calendar', icon: '📅', label: 'Department Calendar' },
                { to: '/officer/timetable', icon: '🕒', label: 'Timetable Officer' },
                { to: '/officer/student-success', icon: '🎯', label: 'At-Risk Students' },
                { to: '/officers-dashboard', icon: '⚡', label: 'AI Officers' },
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
                    color: isActive ? themeData.text : 'var(--sidebar-text, #334155)',
                    background: isActive ? themeData.light : 'transparent',
                    transition: 'all 0.2s',
                  })}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {/* STAFF ROLE LINKS */}
          {role === 'staff' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ 
                fontSize: '0.7rem', fontWeight: 700, color: 'var(--app-text-muted, #94a3b8)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '0.5rem', paddingLeft: '0.875rem'
              }}>
                Staff Workflows
              </div>
              {[
                { to: '/staff-dashboard', icon: '📊', label: 'My Dashboard' },
                { to: '/officer/timetable', icon: '🕒', label: 'Timetable Officer' },
                { to: '/officer/accreditation', icon: '🏛️', label: 'Accreditation' },
                { to: '/officer/student-success', icon: '🎯', label: 'Student Success' },
                { to: '/officers-dashboard', icon: '⚡', label: 'My Officers' },
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
                    color: isActive ? themeData.text : 'var(--sidebar-text, #334155)',
                    background: isActive ? themeData.light : 'transparent',
                    transition: 'all 0.2s',
                  })}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {/* FACULTY / STUDENT / PARENT LINKS */}
          {['faculty', 'student', 'parent'].includes(role) && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ 
                fontSize: '0.7rem', fontWeight: 700, color: 'var(--app-text-muted, #94a3b8)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '0.5rem', paddingLeft: '0.875rem'
              }}>
                Modules
              </div>
              {roleRoutes.slice(0, 10).map(route => (
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
                    color: isActive ? themeData.text : 'var(--sidebar-text, #334155)',
                    background: isActive ? themeData.light : 'transparent',
                    transition: 'all 0.2s',
                  })}
                >
                  {formatSlug(route.slug)}
                </NavLink>
              ))}
            </div>
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
              textDecoration: 'none', color: 'var(--sidebar-text, #334155)',
              fontSize: '0.85rem', fontWeight: 600,
            }}
          >
            ⚙️ Settings
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
