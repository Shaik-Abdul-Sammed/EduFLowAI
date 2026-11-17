import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const PURPLE = '#7C3AED'
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const subjectColors = {
  'Mathematics': '#2563EB',
  'Physics': '#7C3AED',
  'Chemistry': '#10B981',
  'Physics Lab': '#F59E0B',
  'Chemistry Lab': '#EF4444',
  'Remedial Class': '#94a3b8',
  'Data Structures': '#2563EB',
  'Operating Systems': '#06B6D4'
}

export default function Page() {
  const [activeDay, setActiveDay] = useState('Monday')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submittingSlot, setSubmittingSlot] = useState(false)
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    time: '11:30 AM',
    room: 'Hall 302',
    course: 'Mathematics',
    faculty: 'Dr. Suresh Kumar',
    section: 'MPC-A'
  })

  const fetchTimetable = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/api/admin/timetable'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load timetable schedule (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.data) ? data.data : []
        setSlots(raw)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading faculty timetable')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchTimetable(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleAddSlot(e) {
    if (e && e.preventDefault) e.preventDefault()
    setSubmittingSlot(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/api/admin/timetable/slots'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newSlot)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to schedule class slot')

      setToastMessage(`Extra lecture for "${newSlot.course}" booked successfully on ${newSlot.day}!`)
      setShowAddModal(false)
      setTimeout(() => setToastMessage(''), 4500)
      await fetchTimetable(true)
    } catch (err) {
      setToastMessage(err.message || 'Slot scheduling error')
    } finally {
      setSubmittingSlot(false)
    }
  }

  // Filter slots for the current active day
  const daySlots = slots.filter(s => (s.day || '').toLowerCase() === activeDay.toLowerCase())
  const uniqueSubjects = new Set(slots.map(s => s.course || s.subject)).size
  const uniqueSections = new Set(slots.map(s => s.section)).size

  return (
    <RolePageTemplate role="Faculty" title="Class Timetable" description="View your weekly teaching schedule and room assignments.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="class-tt-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div data-testid="class-tt-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="class-tt-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Class Timetable</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchTimetable(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Weekly Classes', value: slots.length, color: PURPLE },
                { label: 'Subjects', value: uniqueSubjects || 3, color: '#2563EB' },
                { label: 'Sections', value: uniqueSections || 4, color: '#10B981' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Day Tabs and Schedule */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {days.map(d => (
                      <button
                        key={d}
                        onClick={() => setActiveDay(d)}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          background: activeDay === d ? `linear-gradient(135deg, ${PURPLE}, #2563EB)` : `${PURPLE}10`,
                          color: activeDay === d ? 'white' : PURPLE,
                          boxShadow: activeDay === d ? `0 4px 12px ${PURPLE}40` : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>

                  <button
                    className="btn btn-sm btn-outline-primary"
                    data-testid="open-add-slot-btn"
                    onClick={() => {
                      setNewSlot(p => ({ ...p, day: activeDay }))
                      setShowAddModal(true)
                    }}
                  >
                    + Schedule Extra Class
                  </button>
                </div>

                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: PURPLE }}>📅 {activeDay}</h2>

                {daySlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    🎉 No classes scheduled for {activeDay}.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {daySlots.map((cls, i) => {
                      const subjectName = cls.course || cls.subject || 'Lecture'
                      const color = subjectColors[subjectName] || '#64748b'
                      return (
                        <div
                          key={cls.id || i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 1.25rem',
                            borderRadius: '1rem',
                            background: `${color}08`,
                            border: `1px solid ${color}25`,
                            borderLeft: `4px solid ${color}`,
                          }}
                        >
                          <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 68 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color }}>{cls.time}</div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>SLOT</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{subjectName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              👥 {cls.section || 'General'} · 📍 {cls.room} {cls.faculty ? `· 👨‍🏫 ${cls.faculty}` : ''}
                            </div>
                          </div>
                          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '2rem', background: `${color}15`, color, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${color}25` }}>
                            50 min
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal for Extra Class Scheduling */}
            {showAddModal && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: '4px solid #7C3AED' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Schedule Extra Class / Slot</h3>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} />
                </div>
                <form onSubmit={handleAddSlot} data-testid="schedule-slot-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DAY</label>
                    <select className="form-select form-select-sm" value={newSlot.day} onChange={e => setNewSlot(p => ({...p, day: e.target.value}))}>
                      {days.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TIME</label>
                    <input className="form-control form-control-sm" value={newSlot.time} onChange={e => setNewSlot(p => ({...p, time: e.target.value}))} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>COURSE / SUBJECT</label>
                    <input className="form-control form-control-sm" value={newSlot.course} onChange={e => setNewSlot(p => ({...p, course: e.target.value}))} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ROOM</label>
                    <input className="form-control form-control-sm" value={newSlot.room} onChange={e => setNewSlot(p => ({...p, room: e.target.value}))} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SECTION</label>
                    <input className="form-control form-control-sm" value={newSlot.section} onChange={e => setNewSlot(p => ({...p, section: e.target.value}))} required />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" disabled={submittingSlot} data-testid="submit-slot-btn" className="btn btn-sm btn-primary">
                      {submittingSlot ? 'Reserving Slot...' : 'Reserve Class Slot'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
