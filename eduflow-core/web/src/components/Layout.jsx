import { useState, Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import NavBar from './NavBar'
import Sidebar from './Sidebar'
import TourGuide from './TourGuide'
import SkeletonLoader from './SkeletonLoader'
import { useAuth } from '../hooks/useAuth'

export default function Layout({ routes }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isDashboardRoot = [
    '/',
    '/login',
    '/register-institution',
    '/signup',
    '/admin-dashboard',
    '/student-dashboard',
    '/faculty-dashboard',
    '/parent-dashboard',
    '/hod-dashboard',
    '/staff-dashboard',
  ].includes(location.pathname)

  // Explicitly hide Sidebar, Navbar, and Dashboard components on public authentication pages
  if (
    location.pathname === '/login' ||
    location.pathname.startsWith('/login') ||
    ['/register-institution', '/signup'].includes(location.pathname)
  ) {
    return (
      <main style={{ minHeight: '100vh', width: '100%' }}>
        <Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}>
          <Outlet />
        </Suspense>
      </main>
    )
  }

  // If no user, just render navbar and content (for entry/login)
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar routes={routes} onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1 }}>
          <Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    )
  }

  // If user is logged in, show Sidebar + Content area + TourGuide
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--app-bg)' }}>
      <Sidebar routes={routes} isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0, // prevents flex item from overflowing
        marginLeft: 0,
        transition: 'margin-left 0.3s ease'
      }} className="main-content-wrapper">
        <style>{`
          @media (min-width: 992px) {
            .main-content-wrapper { margin-left: 260px !important; }
          }
        `}</style>
        
        <NavBar routes={routes} onMenuClick={() => setSidebarOpen(true)} />
        
        <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', color: 'var(--app-text)' }}>
          {!isDashboardRoot && (
            <div className="d-flex align-items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1)
                  } else {
                    navigate(user?.role ? `/${user.role}-dashboard` : '/')
                  }
                }}
                className="btn btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{
                  borderRadius: '8px',
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border-color, rgba(148, 163, 184, 0.3))',
                  color: 'var(--app-text, #1e293b)',
                  cursor: 'pointer',
                }}
                title="Back to previous page"
                aria-label="Back to previous page"
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          )}
          <Suspense fallback={<div className="container-fluid py-3"><SkeletonLoader variant="card" /></div>}>
            <Outlet />
          </Suspense>
        </main>
        
        <footer style={{
          borderTop: '1px solid rgba(148,163,184,0.2)',
          padding: '0.85rem 1.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted, #64748b)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          background: 'transparent'
        }}>
          <div>© 2026 EduFlow Technologies Pvt Ltd • All Rights Reserved</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/dpa" style={{ color: 'inherit', textDecoration: 'none' }}>Data Processing Agreement (DPA)</a>
          </div>
        </footer>
      </div>
      <TourGuide />
    </div>
  )
}
