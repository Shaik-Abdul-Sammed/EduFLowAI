import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Ticket, Check, Sparkles } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../utils/apiConfig'

export default function CampusEventsPage() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Smart India Hackathon 2026 (Internal College Round)',
      date: 'Nov 22, 2026 • 9:00 AM',
      venue: 'Main Auditorium & CS Labs',
      category: 'Hackathon',
      organizer: 'Dept of Computer Science & Innovation Council',
      registered: true
    },
    {
      id: 2,
      title: 'EduTech IEEE International Student Symposium',
      date: 'Nov 28, 2026 • 10:30 AM',
      venue: 'Convention Center, Hall 2',
      category: 'Conference',
      organizer: 'IEEE Student Branch',
      registered: false
    },
    {
      id: 3,
      title: 'Inter-College Annual Robotics Grand Prix',
      date: 'Dec 05, 2026 • 1:00 PM',
      venue: 'Indoor Sports Arena',
      category: 'Robotics',
      organizer: 'Mechatronics Club',
      registered: false
    }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCalendarEvents() {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(getFullApiUrl('/api/v1/calendar'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          const calEvents = data?.events || data?.calendar?.events || []
          if (calEvents.length > 0) {
            const mapped = calEvents.map((ce, idx) => ({
              id: 10 + idx,
              title: ce.title || ce.name || 'Campus Academic Assembly',
              date: ce.date || 'Dec 12, 2026 • 10:00 AM',
              venue: ce.venue || 'Campus Central Quad',
              category: ce.type || 'Institutional',
              organizer: 'Academic Affairs Cell',
              registered: false
            }))
            setEvents(prev => [...prev, ...mapped])
          }
        }
      } catch (err) {
        console.debug('Failed to load campus events:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCalendarEvents()
  }, [])

  const toggleRegister = async (id) => {
    const target = events.find(e => e.id === id)
    const nextState = !target?.registered
    setEvents(prev => prev.map(e => e.id === id ? { ...e, registered: nextState } : e))

    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          subject: `[Event Registration] ${target?.title || 'Campus Event'}`,
          description: `Student registered for event scheduled on ${target?.date || 'Upcoming'}.`,
          category: 'campus_event',
          priority: 'low'
        })
      })
    } catch {}
  }

  return (
    <RolePageTemplate
      role="Student"
      title="Campus Events, Hackathons & Tech Fests"
      description="Discover upcoming academic symposiums, inter-college hackathons, cultural festivals, and reserve entry passes."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="row g-3">
          {events.map(ev => (
            <div key={ev.id} className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm h-100 d-flex flex-column justify-content-between p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary">{ev.category}</span>
                    <span className="text-muted small d-flex align-items-center gap-1">
                      <Calendar size={14} /> {ev.date}
                    </span>
                  </div>
                  <h4 className="h6 fw-bold mb-2">{ev.title}</h4>
                  <div className="text-muted small d-flex align-items-center gap-1 mb-2">
                    <MapPin size={14} /> {ev.venue}
                  </div>
                  <div className="text-muted small d-flex align-items-center gap-1 mb-4">
                    <Users size={14} /> {ev.organizer}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleRegister(ev.id)}
                  className={`btn w-100 d-inline-flex align-items-center justify-content-center gap-2 ${ev.registered ? 'btn-success' : 'btn-primary'}`}
                >
                  {ev.registered ? (
                    <>
                      <Check size={16} /> Registered (Pass Issued)
                    </>
                  ) : (
                    <>
                      <Ticket size={16} /> 1-Click RSVP
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RolePageTemplate>
  )
}
