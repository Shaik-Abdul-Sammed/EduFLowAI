import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react'
import { getApiBaseURL } from '../config/apiConfig'
import { safeJson } from '../utils/wakeUpHandler'
import { useAuth } from '../hooks/useAuth'

export default function NotificationCenter() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return (
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.getAttribute('data-bs-theme') === 'dark' ||
        localStorage.getItem('eduflow-ai-dark-mode') === 'true' ||
        localStorage.getItem('eduflow-ai-theme') === 'dark'
      )
    }
    return false
  })

  useEffect(() => {
    if (typeof document === 'undefined') return
    const checkDark = () => {
      const dark =
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.getAttribute('data-bs-theme') === 'dark' ||
        localStorage.getItem('eduflow-ai-dark-mode') === 'true' ||
        localStorage.getItem('eduflow-ai-theme') === 'dark'
      setIsDark(dark)
    }

    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-bs-theme'],
    })

    window.addEventListener('storage', checkDark)

    return () => {
      observer.disconnect()
      window.removeEventListener('storage', checkDark)
    }
  }, [])

  const fetchNotifications = async (isMounted = true) => {
    try {
      const token =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('accessToken') || localStorage.getItem('token')
          : null
      if (!token) {
        if (isMounted) {
          setNotifications([])
          setUnreadCount(0)
        }
        return
      }
      const userId = user?.id || 'demo'
      const res = await fetch(`${getApiBaseURL()}/v1/notifications?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await safeJson(res)
        const list = Array.isArray(data.notifications) ? data.notifications : []
        if (isMounted) {
          setNotifications(list)
          setUnreadCount(
            list.length === 0 ? 0 : data.unreadCount ?? list.filter((n) => !n.read).length
          )
        }
      } else {
        if (isMounted) {
          setNotifications([])
          setUnreadCount(0)
        }
      }
    } catch {
      if (isMounted) {
        setNotifications([])
        setUnreadCount(0)
      }
    }
  }

  useEffect(() => {
    let isMounted = true
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('token')
        : null
    if (!token) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    fetchNotifications(isMounted)
    const interval = setInterval(() => fetchNotifications(isMounted), 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated])

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
        className="btn btn-sm d-flex align-items-center justify-content-center"
        onClick={() => {
          setOpen((o) => !o)
          if (!open) fetchNotifications()
        }}
        style={{
          position: 'relative',
          background: open
            ? (isDark ? 'rgba(59, 130, 246, 0.22)' : 'rgba(37, 99, 235, 0.12)')
            : (isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(37, 99, 235, 0.08)'),
          color: open
            ? (isDark ? '#93c5fd' : '#2563EB')
            : (isDark ? '#cbd5e1' : '#2563EB'),
          border: isDark ? '1px solid rgba(148, 163, 184, 0.22)' : '1px solid transparent',
          borderRadius: '0.625rem',
          padding: '0.45rem 0.65rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Bell size={18} />
        {isAuthenticated && unreadCount > 0 && notifications.length > 0 && (
          <span
            className="position-absolute badge rounded-pill bg-danger border border-white"
            style={{
              top: '-4px',
              right: '-4px',
              fontSize: '0.65rem',
              padding: '0.25em 0.45em',
              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="eduflow-notification-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '380px',
            maxWidth: 'calc(100vw - 24px)',
            zIndex: 1250,
            borderRadius: '1rem',
            background: isDark ? '#0f172a' : '#ffffff',
            border: isDark ? '1px solid rgba(148, 163, 184, 0.25)' : '1px solid #e2e8f0',
            boxShadow: isDark
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12)'
              : '0 20px 45px -8px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        >
          <style>{`
            @media (max-width: 576px) {
              .eduflow-notification-menu {
                position: fixed !important;
                top: 70px !important;
                left: 12px !important;
                right: 12px !important;
                width: auto !important;
                max-width: none !important;
              }
            }
          `}</style>
          {/* Header */}
          <div
            style={{
              padding: '0.9rem 1.15rem',
              background: isDark ? '#0f172a' : '#f8fafc',
              borderBottom: isDark ? '1px solid rgba(148, 163, 184, 0.18)' : '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    color: isDark ? '#93c5fd' : '#2563EB',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    border: isDark
                      ? '1px solid rgba(59, 130, 246, 0.35)'
                      : '1px solid rgba(37, 99, 235, 0.2)',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.25rem 0.55rem',
                  color: isDark ? '#60a5fa' : '#2563EB',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderRadius: '6px',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark
                    ? 'rgba(59, 130, 246, 0.15)'
                    : 'rgba(37, 99, 235, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Body */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              background: isDark ? '#0f172a' : '#ffffff',
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '2.75rem 1.5rem',
                  textAlign: 'center',
                  color: isDark ? '#94a3b8' : '#64748b',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                  }}
                >
                  <Bell size={20} />
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: isDark ? '#e2e8f0' : '#1e293b',
                    marginBottom: '0.25rem',
                  }}
                >
                  All Caught Up
                </div>
                <div style={{ fontSize: '0.8rem' }}>No notifications right now</div>
              </div>
            ) : (
              notifications.slice(0, 20).map((n, idx) => {
                const isUnread = !n.read
                return (
                  <button
                    key={n.id || idx}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.95rem 1.15rem',
                      textAlign: 'left',
                      border: 'none',
                      borderBottom: isDark
                        ? '1px solid rgba(148, 163, 184, 0.12)'
                        : '1px solid #f1f5f9',
                      borderLeft: isUnread
                        ? '3px solid #3b82f6'
                        : '3px solid transparent',
                      background: isUnread
                        ? (isDark ? 'rgba(30, 58, 138, 0.22)' : '#f0f7ff')
                        : (isDark ? '#0f172a' : '#ffffff'),
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isUnread
                        ? (isDark ? 'rgba(30, 58, 138, 0.35)' : '#e0f0fe')
                        : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc')
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isUnread
                        ? (isDark ? 'rgba(30, 58, 138, 0.22)' : '#f0f7ff')
                        : (isDark ? '#0f172a' : '#ffffff')
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          flex: 1,
                        }}
                      >
                        {isUnread && (
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#38bdf8',
                              boxShadow: '0 0 6px #38bdf8',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontWeight: isUnread ? 700 : 600,
                            fontSize: '0.86rem',
                            color: isUnread
                              ? (isDark ? '#93c5fd' : '#1d4ed8')
                              : (isDark ? '#f1f5f9' : '#1e293b'),
                            lineHeight: 1.35,
                          }}
                        >
                          {n.title}
                        </span>
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          color: isDark ? '#94a3b8' : '#64748b',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={11} />
                        {formatTimeAgo(n.created_at)}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: isDark ? '#e2e8f0' : '#334155',
                        margin: '0 0 0.45rem 0',
                        lineHeight: 1.45,
                        paddingLeft: isUnread ? '0.7rem' : '0',
                      }}
                    >
                      {n.message}
                    </p>

                    {n.link && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.74rem',
                          color: isDark ? '#60a5fa' : '#2563EB',
                          fontWeight: 600,
                          paddingLeft: isUnread ? '0.7rem' : '0',
                        }}
                      >
                        <span>View details</span>
                        <ExternalLink size={11} />
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
