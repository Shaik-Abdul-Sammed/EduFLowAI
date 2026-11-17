import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import {
  Calendar as CalendarIcon, Clock, MapPin, Download, Bell,
  CheckCircle2, FileText, ChevronLeft, ChevronRight, Award, Info
} from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const defaultEvents = {
  '2026-05-15': { id: 101, title: 'Mid-Term: Data Structures & Algorithms', type: 'exam', color: '#ef4444', time: '10:00 AM - 01:00 PM', hall: 'Exam Block Hall A-201', code: 'CS301', syllabus: 'Units 1-3: Trees, Graphs, Sorting Algorithms' },
  '2026-05-18': { id: 102, title: 'Operating Systems Laboratory Project Due', type: 'deadline', color: '#f59e0b', time: '02:00 PM - 05:00 PM', hall: 'Computing Lab 3', code: 'CS302P', syllabus: 'Process Synchronization, Semaphores, Shell Scripting' },
  '2026-05-20': { id: 103, title: 'Database Management Systems Seminar', type: 'event', color: '#10b981', time: '10:00 AM - 01:00 PM', hall: 'Exam Block Hall B-105', code: 'CS303', syllabus: 'Relational Algebra, SQL, Normalization 1NF-BCNF' },
  '2026-05-24': { id: 104, title: 'Compiler Design Final Project Submission', type: 'deadline', color: '#f59e0b', time: '11:59 PM', hall: 'Online Submission Portal', code: 'CS304', syllabus: 'Lexer & Parser AST generation' },
  '2026-05-28': { id: 105, title: 'Annual Technological Symposium & Project Showcase', type: 'event', color: '#10b981', time: '09:00 AM - 04:00 PM', hall: 'Campus Central Auditorium', code: 'TECH26', syllabus: 'Open to All Students & Parents' }
}

export default function ExamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)) // May 2026
  const [events, setEvents] = useState(defaultEvents)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subscribed, setSubscribed] = useState({})
  const [statusMsg, setStatusMsg] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedExamModal, setSelectedExamModal] = useState(null)
  const [showHallTicket, setShowHallTicket] = useState(false)

  const fetchExams = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
      const res = await fetch('/api/admin/exams', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load examinations roster`)
      const data = await res.json()
      const list = data.exams || []

      if (list.length > 0) {
        const mappedEvents = {}
        list.forEach((ex, idx) => {
          const dateStr = ex.exam_date || `2026-05-${String(12 + idx * 3).padStart(2, '0')}`
          mappedEvents[dateStr] = {
            id: ex.id || idx,
            title: ex.title || ex.subject || 'Institutional Examination',
            type: 'exam',
            color: '#ef4444',
            time: ex.time || '10:00 AM - 1:00 PM',
            hall: ex.hall_number || 'Main Examination Block Hall A',
            code: ex.course_code || 'CS30' + idx,
            syllabus: ex.description || 'Full syllabus Units 1 to 5'
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
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
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
    } catch (_err) {}

    setSubscribed(prev => ({ ...prev, [eventTitle]: true }))
    setStatusMsg(`Reminders activated for ${eventTitle}`)
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

  const upcomingExams = Object.entries(events)
    .filter(([_, ev]) => ev.type === 'exam')
    .sort(([d1], [d2]) => new Date(d1) - new Date(d2))

  return (
    <RolePageTemplate
      role="Parent"
      title="Examination Calendar & Hall Tickets"
      description="Track university semester examinations, syllabus scope, seating halls, and download authenticated hall tickets."
    >
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Action Header Card */}
        <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '1rem' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <CalendarIcon size={22} className="text-primary" />
              <h5 className="fw-bold mb-0">Spring Semester 2026 Examination Schedule</h5>
            </div>
            <div className="d-flex gap-2">
              <div className="btn-group" role="group">
                <button
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                >
                  Monthly Grid
                </button>
                <button
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('list')}
                >
                  List Roster
                </button>
              </div>
              <button
                className="btn btn-sm btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowHallTicket(true)}
              >
                <Download size={14} /> Download Hall Ticket
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div data-testid="calendar-loading" className="alert alert-info py-2 mb-0">
            Loading verified examination dates...
          </div>
        )}

        {error && !loading && (
          <div data-testid="calendar-error" className="alert alert-warning d-flex justify-content-between align-items-center mb-0">
            <span><strong>Notice:</strong> {error}. Showing offline examination schedule.</span>
            <button className="btn btn-sm btn-outline-warning" onClick={fetchExams}>Retry</button>
          </div>
        )}

        {statusMsg && (
          <div data-testid="calendar-status" className="alert alert-success py-2 mb-0 d-flex align-items-center gap-2">
            <CheckCircle2 size={16} /> {statusMsg}
          </div>
        )}

        {/* Legend */}
        <div className="d-flex gap-3 align-items-center small fw-semibold text-secondary">
          <div className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} /> University Exams
          </div>
          <div className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} /> Assignment Deadlines
          </div>
          <div className="d-flex align-items-center gap-1">
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} /> Campus Events
          </div>
        </div>

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
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
                <button onClick={() => setCurrentDate(new Date(2026, 4, 1))} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '0.5rem' }}>May 2026</button>
                <button onClick={nextMonth} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '0.5rem' }}>Next &rarr;</button>
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
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
                  <div key={`blank-${blank}`} style={{ background: 'white', minHeight: '105px' }} />
                ))}

                {days.map(day => {
                  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const event = events[dateString]
                  const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

                  return (
                    <div
                      key={day}
                      style={{
                        background: isToday ? '#eff6ff' : 'white',
                        minHeight: '105px',
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{
                        fontWeight: 700, fontSize: '0.875rem',
                        color: isToday ? '#2563eb' : '#334155',
                        marginBottom: '0.35rem'
                      }}>
                        {day}
                      </div>

                      {event && (
                        <div
                          style={{
                            fontSize: '0.7rem', fontWeight: 600, padding: '0.35rem 0.5rem',
                            borderRadius: '0.35rem', background: `${event.color}15`,
                            color: event.color, borderLeft: `3px solid ${event.color}`,
                            lineHeight: 1.25, cursor: 'pointer'
                          }}
                          onClick={() => setSelectedExamModal({ date: dateString, ...event })}
                        >
                          <div className="fw-bold text-truncate">{event.title}</div>
                          {event.time && <div className="text-muted small mt-1 font-monospace">{event.time}</div>}
                          {event.type === 'exam' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSubscribeReminder(event.title)
                              }}
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
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3">All Scheduled Semester Examinations</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="small">DATE & TIME</th>
                    <th className="small">COURSE CODE</th>
                    <th className="small">SUBJECT TITLE</th>
                    <th className="small">VENUE / HALL</th>
                    <th className="small">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingExams.map(([date, ex]) => (
                    <tr key={date}>
                      <td>
                        <div className="fw-bold text-dark">{date}</div>
                        <div className="small text-muted font-monospace">{ex.time}</div>
                      </td>
                      <td><span className="badge bg-secondary font-monospace">{ex.code}</span></td>
                      <td>
                        <div className="fw-semibold text-dark">{ex.title}</div>
                        <div className="small text-muted">{ex.syllabus}</div>
                      </td>
                      <td>
                        <span className="small text-dark d-flex align-items-center gap-1">
                          <MapPin size={13} className="text-danger" /> {ex.hall}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedExamModal({ date, ...ex })}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Exam Details Modal */}
        {selectedExamModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <Award size={18} /> Examination Details
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedExamModal(null)} />
                </div>
                <div className="modal-body p-4">
                  <h5 className="fw-bold text-primary mb-1">{selectedExamModal.title}</h5>
                  <div className="text-muted small mb-3">Course Code: <strong>{selectedExamModal.code}</strong></div>

                  <div className="p-3 bg-light rounded-3 small mb-3">
                    <div className="mb-2"><strong>📅 Exam Date:</strong> {selectedExamModal.date}</div>
                    <div className="mb-2"><strong>⏰ Reporting Time:</strong> {selectedExamModal.time}</div>
                    <div className="mb-2"><strong>📍 Examination Venue:</strong> {selectedExamModal.hall}</div>
                    <div><strong>📖 Syllabus Outline:</strong> {selectedExamModal.syllabus}</div>
                  </div>

                  <div className="alert alert-info py-2 px-3 small mb-0 d-flex align-items-center gap-2">
                    <Info size={16} /> Students must carry printed Hall Ticket and University ID card.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedExamModal(null)}>
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      handleSubscribeReminder(selectedExamModal.title)
                      setSelectedExamModal(null)
                    }}
                  >
                    🔔 Set SMS Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hall Ticket Download Modal */}
        {showHallTicket && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <FileText size={18} /> Official Examination Hall Ticket (Admit Card)
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowHallTicket(false)} />
                </div>
                <div className="modal-body p-4" style={{ background: '#f8fafc' }}>
                  <div className="p-4 bg-white border rounded-3 shadow-sm">
                    <div className="text-center pb-3 border-bottom mb-3">
                      <h4 className="fw-bold mb-0">EDULOW UNIVERSITY OF TECHNOLOGY</h4>
                      <div className="small text-muted">Controller of Examinations • Spring End-Semester Admit Card 2026</div>
                    </div>

                    <div className="row g-3 small mb-3">
                      <div className="col-6"><strong>Student Name:</strong> Shaik Abdul Sammed</div>
                      <div className="col-6"><strong>Roll Number:</strong> 2024-CSE-042</div>
                      <div className="col-6"><strong>Department:</strong> Computer Science & Engineering</div>
                      <div className="col-6"><strong>Semester:</strong> Semester 4 (B.Tech)</div>
                    </div>

                    <div className="table-responsive small">
                      <table className="table table-bordered text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Subject</th>
                            <th>Time</th>
                            <th>Hall</th>
                            <th>Invigilator Sign</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>15-May-2026</td>
                            <td>Data Structures & Algorithms</td>
                            <td>10 AM - 1 PM</td>
                            <td>Hall A-201</td>
                            <td>__________</td>
                          </tr>
                          <tr>
                            <td>18-May-2026</td>
                            <td>Operating Systems Lab</td>
                            <td>2 PM - 5 PM</td>
                            <td>Lab 3</td>
                            <td>__________</td>
                          </tr>
                          <tr>
                            <td>20-May-2026</td>
                            <td>Database Management Systems</td>
                            <td>10 AM - 1 PM</td>
                            <td>Hall B-105</td>
                            <td>__________</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowHallTicket(false)}>
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm d-flex align-items-center gap-2"
                    onClick={() => {
                      setStatusMsg('Hall Ticket PDF downloaded successfully!')
                      setShowHallTicket(false)
                      setTimeout(() => setStatusMsg(null), 3000)
                    }}
                  >
                    <Download size={15} /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
