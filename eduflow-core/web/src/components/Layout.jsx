import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import Sidebar from './Sidebar'
import TourGuide from './TourGuide'
import { useAuth } from '../hooks/useAuth'

export default function Layout({ routes }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // If no user, just render navbar and content (for entry/login)
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar routes={routes} onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1 }}>
          <Outlet />
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
          <Outlet />
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
