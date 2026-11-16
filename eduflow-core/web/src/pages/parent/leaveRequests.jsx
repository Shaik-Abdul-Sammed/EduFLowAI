import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Home,
  MapPin,
  Send
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function ParentLeaveRequestsPage() {
  const [leavePasses, setLeavePasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [studentRoll, setStudentRoll] = useState('SS26CS01')
  const [studentName, setStudentName] = useState('Aarav Sharma')
  const [guardianPhone, setGuardianPhone] = useState('+91 98765 43210')
  const [destination, setDestination] = useState('Home Town Visit (Guntur)')
  const [departureTime, setDepartureTime] = useState('2026-11-28 17:00')
  const [returnTime, setReturnTime] = useState('2026-11-30 20:00')

  const fetchLeavePasses = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/leave/requests'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load leave records (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setLeavePasses(data?.requests || [
          {
            id: 1,
            permissionId: 'OUTING_J8K92X',
            studentName: 'Aarav Sharma',
            studentRoll: 'SS26CS01',
            destination: 'Home Town Visit (Guntur)',
            departureTime: '2026-11-20 16:30',
            returnTime: '2026-11-23 20:00',
            guardianApprovalStatus: 'APPROVED_BY_GUARDIAN',
            gatePassGenerated: true
          }
        ])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading parent leave requests')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchLeavePasses(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmitOuting = async (e) => {
    e.preventDefault()
    if (!studentRoll || !destination || !departureTime || !returnTime) return
    setSubmitting(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parents/hostel-outing-leave'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studentRoll,
          studentName,
          guardianPhone,
          destination,
          departureTime,
          returnTime
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to submit hostel outing authorization')
      }

      const data = await res.json()
      setMsg(`Hostel night outing pass ${data.permissionId || 'generated'} authorized successfully!`)
      setLeavePasses((prev) => [data, ...prev])
      setTimeout(() => setMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message || 'Error authorizing outing leave.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate role="Parent" title="Hostel Outing & Leave Permission Desk">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }} className="d-flex align-items-center">
              <ShieldCheck className="me-2 text-primary" size={24} /> Digital Guardian Gate-Pass & Outing Sign-Off
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Authorize campus exit passes, weekend leaves, and emergency hostel outings with statutory digital tracking
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => fetchLeavePasses(true)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Success Alert */}
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="leave-success-alert">
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
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="leave-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading hostel outing records and gate passes...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load leave records</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchLeavePasses(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !loadError && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
            {/* Outing Form */}
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Home size={20} className="text-primary" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Authorize Hostel Outing / Weekend Pass</h3>
              </div>
              <form onSubmit={handleSubmitOuting} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="leave-student-name" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Student Name
                    </label>
                    <input
                      id="leave-student-name"
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="leave-student-roll" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Roll Number *
                    </label>
                    <input
                      id="leave-student-roll"
                      type="text"
                      required
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="leave-destination" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Destination & Reason *
                  </label>
                  <input
                    id="leave-destination"
                    type="text"
                    required
                    placeholder="e.g. Home Visit / Family Event / Medical Consultation"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="form-control form-control-sm"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="leave-departure" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Departure Date & Time *
                    </label>
                    <input
                      id="leave-departure"
                      type="text"
                      required
                      placeholder="e.g. 2026-11-28 17:00"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="leave-return" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Expected Return Date & Time *
                    </label>
                    <input
                      id="leave-return"
                      type="text"
                      required
                      placeholder="e.g. 2026-11-30 20:00"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="leave-phone" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Guardian Registered Phone Number
                  </label>
                  <input
                    id="leave-phone"
                    type="text"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="form-control form-control-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm mt-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <Send size={14} /> {submitting ? 'Transmitting Sign-Off...' : 'Grant Guardian Outing Permission'}
                </button>
              </form>
            </div>

            {/* Outing Passes List */}
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Gate-Pass Outing History</h3>
                <span className="badge bg-primary">{leavePasses.length} Records</span>
              </div>

              {leavePasses.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center text-muted">
                  <ShieldCheck size={36} className="mx-auto text-secondary mb-2 opacity-50" />
                  <h4 style={{ fontSize: 16, fontWeight: 600 }}>No active leave passes</h4>
                  <p className="small mb-0">Authorized hostel gate passes will appear here.</p>
                </div>
              ) : (
                leavePasses.map((p, idx) => (
                  <div key={p.permissionId || p.id || idx} className="card border-0 shadow-sm p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="badge bg-primary text-uppercase font-monospace me-2">
                          {p.permissionId || `PASS-${p.id}`}
                        </span>
                        <span className="badge bg-success">
                          {p.guardianApprovalStatus || p.status || 'APPROVED'}
                        </span>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 2px 0' }}>
                          {p.destination || p.reason}
                        </h4>
                      </div>
                      <span className="badge bg-light text-dark border">
                        {p.gatePassGenerated ? 'Turnstile Pass Active' : 'Digital Sign-Off Pending'}
                      </span>
                    </div>

                    <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                      <MapPin size={14} /> Student: <strong>{p.studentName || p.student_roll}</strong> ({p.studentRoll || p.student_roll})
                    </div>

                    <div className="p-2 bg-light rounded border d-flex justify-content-between small text-muted">
                      <div><Clock size={12} className="me-1" /> Out: {p.departureTime || p.from_date}</div>
                      <div><Clock size={12} className="me-1" /> In: {p.returnTime || p.to_date}</div>
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
