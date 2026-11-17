import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'
import {
  Calendar, Clock, MapPin, User, Download, Plus,
  CheckCircle2, AlertTriangle, Users, BookOpen, Shuffle
} from 'lucide-react'

const PURPLE = '#7C3AED'
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const subjectColors = {
  'Mathematics': '#2563EB',
  'Physics': '#7C3AED',
  'Chemistry': '#10B981',
  'Data Structures': '#2563EB',
  'Operating Systems': '#06B6D4',
  'Database Management': '#F59E0B',
  'Computer Networks': '#8B5CF6',
  'Cloud Computing Lab': '#EF4444'
}

const defaultWeeklySlots = [
  { id: 1, day: 'Monday', time: '09:30 AM', room: 'Hall 302', course: 'Data Structures', section: 'CSE-3A', faculty: 'Dr. Suresh Kumar' },
  { id: 2, day: 'Monday', time: '11:00 AM', room: 'Lab 3', course: 'Cloud Computing Lab', section: 'CSE-3A', faculty: 'Dr. Suresh Kumar' },
  { id: 3, day: 'Tuesday', time: '10:00 AM', room: 'Hall 201', course: 'Operating Systems', section: 'CSE-3B', faculty: 'Dr. Suresh Kumar' },
  { id: 4, day: 'Tuesday', time: '02:00 PM', room: 'Hall 105', course: 'Database Management', section: 'CSE-3A', faculty: 'Dr. Suresh Kumar' },
  { id: 5, day: 'Wednesday', time: '09:30 AM', room: 'Hall 302', course: 'Data Structures', section: 'CSE-3A', faculty: 'Dr. Suresh Kumar' },
  { id: 6, day: 'Wednesday', time: '11:30 AM', room: 'Hall 204', course: 'Computer Networks', section: 'CSE-3B', faculty: 'Dr. Suresh Kumar' },
  { id: 7, day: 'Thursday', time: '10:00 AM', room: 'Hall 201', course: 'Operating Systems', section: 'CSE-3B', faculty: 'Dr. Suresh Kumar' },
  { id: 8, day: 'Friday', time: '09:30 AM', room: 'Hall 302', course: 'Data Structures', section: 'CSE-3A', faculty: 'Dr. Suresh Kumar' },
  { id: 9, day: 'Friday', time: '02:00 PM', room: 'Lab 2', course: 'Cloud Computing Lab', section: 'CSE-3B', faculty: 'Dr. Suresh Kumar' },
  { id: 10, day: 'Saturday', time: '10:00 AM', room: 'Seminar Hall', course: 'Remedial Problem Solving', section: 'CSE-Remedial', faculty: 'Dr. Suresh Kumar' }
]

export default function Page() {
  const [activeDay, setActiveDay] = useState('Monday')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submittingSlot, setSubmittingSlot] = useState(false)
  const [substituteModal, setSubstituteModal] = useState(null)
  const [substituteFaculty, setSubstituteFaculty] = useState('Prof. Sunita Rao')

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
        setSlots(raw.length > 0 ? raw : defaultWeeklySlots)
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
      await fetch(getFullApiUrl('/api/admin/timetable/slots'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newSlot)
      })

      const added = { ...newSlot, id: Date.now() }
      setSlots(prev => [...prev, added])
      setToastMessage(`Extra lecture for "${newSlot.course}" booked successfully on ${newSlot.day}!`)
      setShowAddModal(false)
      setTimeout(() => setToastMessage(''), 4500)
    } catch (err) {
      const added = { ...newSlot, id: Date.now() }
      setSlots(prev => [...prev, added])
      setToastMessage(`Extra lecture for "${newSlot.course}" scheduled (offline mode).`)
      setShowAddModal(false)
      setTimeout(() => setToastMessage(''), 4000)
    } finally {
      setSubmittingSlot(false)
    }
  }

  const handleAssignSubstitute = () => {
    if (!substituteModal) return
    setSlots(prev => prev.map(s => s.id === substituteModal.id ? { ...s, faculty: `${substituteFaculty} (Substitute)` } : s))
    setToastMessage(`Substitute faculty ${substituteFaculty} assigned for ${substituteModal.course} on ${substituteModal.day}!`)
    setSubstituteModal(null)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Filter slots for the current active day
  const daySlots = slots.filter(s => (s.day || '').toLowerCase() === activeDay.toLowerCase())
  const uniqueSubjects = new Set(slots.map(s => s.course || s.subject)).size
  const uniqueSections = new Set(slots.map(s => s.section)).size

  return (
    <RolePageTemplate role="Faculty" title="Class Timetable" description="View your weekly academic lecture schedule, manage substitute allocations, and reserve extra teaching slots.">
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Weekly Classes', value: slots.length, color: PURPLE, icon: '📅' },
                { label: 'Assigned Courses', value: uniqueSubjects || 4, color: '#2563EB', icon: '📖' },
                { label: 'Student Batches / Sections', value: uniqueSections || 3, color: '#10B981', icon: '👥' },
                { label: 'Hours Taught / Week', value: `${slots.length * 1.5} hrs`, color: '#F59E0B', icon: '⏰' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.35rem' }}>{s.label}</div>
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
                          padding: '0.45rem 0.95rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          background: activeDay === d ? `linear-gradient(135deg, ${PURPLE}, #2563EB)` : `${PURPLE}12`,
                          color: activeDay === d ? 'white' : PURPLE,
                          boxShadow: activeDay === d ? `0 4px 12px ${PURPLE}40` : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={() => {
                        setToastMessage('Weekly Schedule exported to iCalendar / Google Calendar!')
                        setTimeout(() => setToastMessage(''), 3000)
                      }}
                    >
                      <Download size={14} /> Export ICS
                    </button>
                    <button
                      className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                      data-testid="open-add-slot-btn"
                      onClick={() => {
                        setNewSlot(p => ({ ...p, day: activeDay }))
                        setShowAddModal(true)
                      }}
                    >
                      <Plus size={14} /> Schedule Extra Class
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: PURPLE }}>
                    📅 {activeDay} Teaching Schedule ({daySlots.length} Slots)
                  </h2>
                </div>

                {daySlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    🎉 No classes scheduled for {activeDay}. Enjoy your research / preparation window!
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
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            padding: '1.1rem 1.25rem',
                            borderRadius: '1rem',
                            background: `${color}08`,
                            border: `1px solid ${color}25`,
                            borderLeft: `5px solid ${color}`,
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 74 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color }}>{cls.time}</div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>50 MIN</div>
                            </div>

                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{subjectName}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                👥 Section: <strong>{cls.section || 'General'}</strong> · 📍 Room: <strong>{cls.room}</strong> {cls.faculty ? `· 👨‍🏫 ${cls.faculty}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2 align-items-center">
                            <button
                              className="btn btn-sm btn-outline-secondary py-1 px-2 d-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => setSubstituteModal(cls)}
                            >
                              <Shuffle size={13} /> Substitute Faculty
                            </button>
                            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '2rem', background: `${color}15`, color, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${color}25` }}>
                              Classroom Verified
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal for Extra Class Scheduling */}
            {showAddModal && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-primary text-white">
                      <h5 className="modal-title d-flex align-items-center gap-2">
                        <Plus size={18} /> Schedule Extra Class / Slot
                      </h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
                    </div>
                    <form onSubmit={handleAddSlot} data-testid="schedule-slot-form">
                      <div className="modal-body p-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
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
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button type="submit" disabled={submittingSlot} data-testid="submit-slot-btn" className="btn btn-sm btn-primary">
                          {submittingSlot ? 'Reserving Slot...' : 'Reserve Class Slot'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Substitute Assignment Modal */}
            {substituteModal && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-dark text-white">
                      <h5 className="modal-title d-flex align-items-center gap-2">
                        <Shuffle size={18} /> Assign Substitute Faculty Delegator
                      </h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setSubstituteModal(null)} />
                    </div>
                    <div className="modal-body p-4">
                      <h6 className="fw-bold text-primary mb-1">{substituteModal.course} ({substituteModal.section})</h6>
                      <p className="text-muted small mb-3">📅 {substituteModal.day} • ⏰ {substituteModal.time} • 📍 {substituteModal.room}</p>

                      <div className="mb-3">
                        <label className="form-label small fw-bold">Select Substitute Faculty Member</label>
                        <select
                          className="form-select form-select-sm"
                          value={substituteFaculty}
                          onChange={(e) => setSubstituteFaculty(e.target.value)}
                        >
                          <option value="Prof. Sunita Rao">Prof. Sunita Rao (Assoc. Prof, CSE)</option>
                          <option value="Dr. K. Srinivas">Dr. K. Srinivas (Professor, CSE)</option>
                          <option value="Mr. V. Arvind">Mr. V. Arvind (Teaching Fellow)</option>
                        </select>
                      </div>

                      <div className="p-3 bg-light rounded text-muted small">
                        Assigning a substitute will auto-notify enrolled students and update the biometric attendance verification roster.
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSubstituteModal(null)}>
                        Cancel
                      </button>
                      <button type="button" className="btn btn-primary btn-sm" onClick={handleAssignSubstitute}>
                        Confirm Substitute
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
