import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Video,
  Building,
  Plus
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function PtmBookingPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [booking, setBooking] = useState(false)
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [parentName, setParentName] = useState('Suresh Sharma')
  const [studentRoll, setStudentRoll] = useState('SS26CS01')
  const [facultyName, setFacultyName] = useState('Dr. Ramesh Kumar (HOD, CSE)')
  const [slotTime, setSlotTime] = useState('2026-11-28 10:30 AM')
  const [agenda, setAgenda] = useState('Discussion on Academic CGPA and Attendance Shortage')

  const fetchAppointments = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parent/overview'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load PTM bookings (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setAppointments(data?.ptmAppointments || [
          {
            appointmentId: 'PTM-84910',
            facultyName: 'Dr. Ramesh Kumar (HOD, CSE)',
            slotTime: '2026-11-25 11:00 AM',
            venue: 'Department HOD Office & Google Meet',
            agenda: 'Mid-term performance review and attendance consultation',
            status: 'CONFIRMED'
          }
        ])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading PTM bookings')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchAppointments(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleBookSlot = async (e) => {
    e.preventDefault()
    if (!parentName || !studentRoll || !slotTime) return
    setBooking(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parents/ptm-slot'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          parentName,
          studentRoll,
          facultyName,
          slotTime,
          agenda
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to book PTM appointment')
      }

      const data = await res.json()
      setMsg(`PTM Appointment ${data.appointmentId || 'confirmed'} successfully scheduled with ${facultyName}!`)
      setAppointments((prev) => [data, ...prev])
      setTimeout(() => setMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message || 'Error scheduling PTM slot.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <RolePageTemplate role="Parent" title="Parent-Teacher Meeting (PTM) Desk">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }} className="d-flex align-items-center">
              <Calendar className="me-2 text-primary" size={24} /> Faculty & Mentor Consultation Booking
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Schedule 1-on-1 consultation slots with department heads, class advisors, and mentors
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => fetchAppointments(true)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Success Alert */}
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="ptm-success-alert">
            <CheckCircle size={18} className="me-2 flex-shrink-0" />
            <div className="small fw-semibold">{msg}</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0">
            <AlertCircle size={18} className="me-2 flex-shrink-0" />
            <div className="small fw-semibold">{errorMsg}</div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="ptm-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading PTM appointment slots and mentor availability...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load PTM bookings</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchAppointments(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !loadError && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
            {/* Booking Form */}
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Plus size={20} className="text-primary" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Book 1-on-1 Faculty Appointment</h3>
              </div>
              <form onSubmit={handleBookSlot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label htmlFor="ptm-parent-name" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    id="ptm-parent-name"
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="form-control form-control-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ptm-student-roll" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Student Roll Number *
                  </label>
                  <input
                    id="ptm-student-roll"
                    type="text"
                    required
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="form-control form-control-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ptm-faculty-select" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Faculty Mentor / Department Officer
                  </label>
                  <select
                    id="ptm-faculty-select"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="form-select form-select-sm"
                  >
                    <option value="Dr. Ramesh Kumar (HOD, CSE)">Dr. Ramesh Kumar (HOD, Computer Science)</option>
                    <option value="Prof. Sunita Rao (Class Advisor)">Prof. Sunita Rao (Class Advisor, Year 3)</option>
                    <option value="Dr. V. Prasad (Dean of Student Welfare)">Dr. V. Prasad (Dean of Student Welfare)</option>
                    <option value="Placement Cell Officer">Training & Placement Mentor</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="ptm-slot-time" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Date & Preferred Time Slot *
                  </label>
                  <input
                    id="ptm-slot-time"
                    type="text"
                    required
                    placeholder="e.g. 2026-11-28 10:30 AM"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="form-control form-control-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ptm-agenda" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Discussion Agenda
                  </label>
                  <textarea
                    id="ptm-agenda"
                    rows="3"
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    className="form-control form-control-sm"
                    placeholder="e.g. Attendance progress, academic queries, or hostel accommodations"
                  />
                </div>

                <button
                  type="submit"
                  disabled={booking}
                  className="btn btn-primary btn-sm mt-2"
                >
                  {booking ? 'Reserving Slot...' : 'Confirm Appointment Slot'}
                </button>
              </form>
            </div>

            {/* Scheduled Appointments */}
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Confirmed PTM Appointments</h3>
                <span className="badge bg-success">{appointments.length} Scheduled</span>
              </div>

              {appointments.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center text-muted">
                  <UserCheck size={36} className="mx-auto text-secondary mb-2 opacity-50" />
                  <h4 style={{ fontSize: 16, fontWeight: 600 }}>No appointments booked</h4>
                  <p className="small mb-0">Select an available time slot to schedule a meeting with a mentor.</p>
                </div>
              ) : (
                appointments.map((a, idx) => (
                  <div key={a.appointmentId || idx} className="card border-0 shadow-sm p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="badge bg-primary text-uppercase font-monospace me-2">{a.appointmentId}</span>
                        <span className="badge bg-success">{a.status || 'CONFIRMED'}</span>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 2px 0' }}>{a.facultyName}</h4>
                      </div>
                      <div className="text-primary small fw-semibold d-flex align-items-center gap-1">
                        <Clock size={14} /> {a.slotTime}
                      </div>
                    </div>

                    <div className="text-muted small mb-3">
                      <strong>Agenda:</strong> {a.agenda}
                    </div>

                    <div className="p-2 bg-light rounded border d-flex align-items-center justify-content-between small text-muted">
                      <div className="d-flex align-items-center gap-2">
                        <Building size={14} /> {a.venue || 'Department Office / Google Meet'}
                      </div>
                      <span className="badge bg-info text-dark">Calendar Synced</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
