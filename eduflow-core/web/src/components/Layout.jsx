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
      </div>
      <TourGuide />
    </div>
  )
}
