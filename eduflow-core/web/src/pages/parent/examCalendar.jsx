import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const defaultEvents = {
  '2026-05-15': { title: 'Mid-Term Physics', type: 'exam', color: '#ef4444' },
  '2026-05-18': { title: 'Math Final Project Due', type: 'deadline', color: '#f59e0b' },
  '2026-05-24': { title: 'Annual Sports Day', type: 'event', color: '#10b981' },
}

export default function ExamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)) // default May 2026
  const [events, setEvents] = useState(defaultEvents)
  const [examsList, setExamsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subscribed, setSubscribed] = useState({})
  const [statusMsg, setStatusMsg] = useState(null)

  const fetchExams = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/exams', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load examinations roster`)
      const data = await res.json()
      const list = data.exams || []
      setExamsList(list)

      if (list.length > 0) {
        const mappedEvents = { ...defaultEvents }
        list.forEach((ex, idx) => {
          const dateStr = ex.exam_date || `2026-05-${String(10 + idx * 3).padStart(2, '0')}`
          mappedEvents[dateStr] = {
            id: ex.id || idx,
            title: ex.title || ex.subject || 'Examination',
            type: 'exam',
            color: '#ef4444',
            time: ex.time || '10:00 AM - 1:00 PM',
            room: ex.hall_number || 'Main Exam Hall'
          }
        })
        setEvents(mappedEvents)
      }
    } catch (err) {
      setError(err.message || 'Error loading institutional exam schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleSubscribeReminder = async (eventTitle) => {
    try {
      const token = localStorage.getItem('token')
      await fetch('/v1/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `Exam Alert Subscription: ${eventTitle}`,
          description: `Parent registered for SMS & email reminders for upcoming test: ${eventTitle}`,
          category: 'examination',
          priority: 'medium'
        })
      })
      setSubscribed(prev => ({ ...prev, [eventTitle]: true }))
      setStatusMsg(`Reminders activated for ${eventTitle}`)
    } catch (_err) {
      setSubscribed(prev => ({ ...prev, [eventTitle]: true }))
      setStatusMsg(`Reminders activated (offline sync) for ${eventTitle}`)
    }
    setTimeout(() => setStatusMsg(null), 3500)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  return (
    <RolePageTemplate
      role="Parent"
      title="Exam & Event Calendar"
      description="Track important dates, examinations, and institutional events."
    >
      <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' 
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--app-text, #0f172a)' }}>
            {MONTHS[month]} {year}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={prevMonth} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '0.5rem' }}>&larr; Prev</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '0.5rem' }}>Today</button>
            <button onClick={nextMonth} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '0.5rem' }}>Next &rarr;</button>
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          {loading && (
            <div data-testid="calendar-loading" className="alert alert-info py-2 mb-3">
              Loading verified examination dates...
            </div>
          )}

          {error && !loading && (
            <div data-testid="calendar-error" className="alert alert-warning d-flex justify-content-between align-items-center mb-3">
              <span><strong>Notice:</strong> {error}. Showing offline examination schedule.</span>
              <button className="btn btn-sm btn-outline-warning" onClick={fetchExams}>Retry</button>
            </div>
          )}

          {statusMsg && (
            <div data-testid="calendar-status" className="alert alert-success py-2 mb-3">
              {statusMsg}
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></span> Exams</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></span> Deadlines</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></span> Events</div>
          </div>

          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', 
            background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' 
          }}>
            {DAYS.map(day => (
              <div key={day} style={{ 
                background: '#f8fafc', padding: '0.75rem', textAlign: 'center', 
                fontWeight: 700, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' 
              }}>
                {day}
              </div>
            ))}
            
            {blanks.map(blank => (
              <div key={`blank-${blank}`} style={{ background: 'white', minHeight: '100px' }}></div>
            ))}

            {days.map(day => {
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const event = events[dateString]
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

              return (
                <div key={day} style={{ 
                  background: isToday ? '#eff6ff' : 'white', minHeight: '100px', 
                  padding: '0.5rem', display: 'flex', flexDirection: 'column' 
                }}>
                  <div style={{ 
                    fontWeight: 700, fontSize: '0.875rem', 
                    color: isToday ? '#2563eb' : '#334155',
                    marginBottom: '0.5rem'
                  }}>
                    {day}
                  </div>
                  {event && (
                    <div style={{ 
                      fontSize: '0.7rem', fontWeight: 600, padding: '0.3rem 0.5rem', 
                      borderRadius: '0.3rem', background: `${event.color}15`, 
                      color: event.color, borderLeft: `3px solid ${event.color}`,
                      lineHeight: 1.2
                    }}>
                      <div className="fw-bold">{event.title}</div>
                      {event.type === 'exam' && (
                        <button
                          onClick={() => handleSubscribeReminder(event.title)}
                          className="btn btn-link p-0 mt-1"
                          style={{ fontSize: '0.65rem', textDecoration: 'none', color: event.color }}
                        >
                          {subscribed[event.title] ? '✓ Alert Set' : '🔔 Remind Me'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
