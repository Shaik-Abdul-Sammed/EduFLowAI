import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react'
import { getApiBaseURL } from '../config/apiConfig'
import { useAuth } from '../hooks/useAuth'

export default function NotificationCenter() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      const userId = user?.id || 'demo'
      const res = await fetch(`${getApiBaseURL()}/v1/notifications?userId=${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch {
      // Fallback notifications if offline
      setNotifications([
        {
          id: 'notif-1',
          title: 'Pending Timetable Approval',
          message: 'Priya Sharma submitted draft schedule for CSE Dept',
          type: 'approval',
          link: '/hod-dashboard',
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          read: false,
        },
        {
          id: 'notif-2',
          title: 'New Institutional Lead',
          message: 'MVJ College of Engineering requested NAAC SSR Gap Analysis',
          type: 'lead',
          link: '/admin-dashboard/leads',
          created_at: new Date(Date.now() - 60 * 60000).toISOString(),
          read: false,
        },
      ])
      setUnreadCount(2)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      const userId = user?.id || 'demo'
      await fetch(`${getApiBaseURL()}/v1/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        const userId = user?.id || 'demo'
        await fetch(`${getApiBaseURL()}/v1/notifications/${notif.id}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ userId }),
        })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      }
    }

    if (notif.link) {
      setOpen(false)
      navigate(notif.link)
    }
  }

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diffMin = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.round(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.round(diffHours / 24)}d ago`
  }

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notification center"
        className="btn btn-sm position-relative d-flex align-items-center justify-content-center"
        onClick={() => {
          setOpen((o) => !o)
          if (!open) fetchNotifications()
        }}
        style={{
          background: 'rgba(37,99,235,0.08)',
          color: '#2563EB',
          border: 'none',
          borderRadius: '0.625rem',
          padding: '0.45rem 0.65rem',
          cursor: 'pointer',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="position-absolute badge rounded-pill bg-danger border border-white"
            style={{
              top: '-4px',
              right: '-4px',
              fontSize: '0.65rem',
              padding: '0.25em 0.45em',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card position-absolute shadow-lg border border-secondary border-opacity-25"
          style={{
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            maxWidth: '90vw',
            zIndex: 1150,
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          <div className="card-header bg-white dark-bg-dark border-bottom d-flex justify-content-between align-items-center py-2 px-3">
            <span className="fw-bold small text-dark">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none small d-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }}
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          <div
            className="list-group list-group-flush"
            style={{ maxHeight: '360px', overflowY: 'auto' }}
          >
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted small">
                No notifications right now
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`list-group-item list-group-item-action text-start p-3 border-bottom ${
                    !n.read ? 'bg-light bg-opacity-75' : ''
                  }`}
                  onClick={() => handleNotificationClick(n)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span
                      className={`fw-semibold small ${
                        !n.read ? 'text-primary' : 'text-dark'
                      }`}
                    >
                      {n.title}
                    </span>
                    <span
                      className="text-muted d-flex align-items-center gap-1"
                      style={{ fontSize: '0.7rem' }}
                    >
                      <Clock size={11} />
                      {formatTimeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-secondary small mb-1" style={{ fontSize: '0.78rem' }}>
                    {n.message}
                  </p>
                  {n.link && (
                    <div
                      className="text-primary small d-flex align-items-center gap-1"
                      style={{ fontSize: '0.72rem' }}
                    >
                      <span>View details</span>
                      <ExternalLink size={10} />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
