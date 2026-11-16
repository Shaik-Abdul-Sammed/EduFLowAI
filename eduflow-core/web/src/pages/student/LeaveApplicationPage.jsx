import { useState, useEffect } from 'react'
import { Calendar, Clock, Send } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function LeaveApplicationPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [leaveType, setLeaveType] = useState('Medical')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [parentConsent, setParentConsent] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchRequests = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/leave/requests'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) {
        throw new Error(`Failed to load leave requests (${res.status})`)
      }
      const data = await res.json()
      if (isMounted) {
        setRequests(data?.requests || [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching leave records')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchRequests(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fromDate || !toDate || !reason.trim()) return
    setSubmitting(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/leave/apply'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_roll: 'SS26',
          student_name: 'Ananya Sharma',
          department: 'Computer Science',
          leave_type: leaveType,
          from_date: fromDate,
          to_date: toDate,
          reason,
          parent_consent: parentConsent
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to apply for leave')
      }

      setMsg('Leave application forwarded to HOD for approval.')
      setReason('')
      setFromDate('')
      setToDate('')
      fetchRequests(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to apply for leave.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate role="student" title="Student Leave & Outing Applications">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="leave-success-alert">
            ✓ {msg}
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0" role="alert">
            ❌ {errorMsg}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="leave-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading leave application history and department status...</p>
          </div>
        )}

        {/* Load Error State */}
        {loadError && !loading && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0" role="alert">
            <div>
              <strong>Error:</strong> {loadError}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchRequests(true)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* Leave Application Form */}
            <div className="card border-0 shadow-sm p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 10, borderRadius: 8 }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Apply for Leave</h2>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Statutory attendance preservation for authorized absence</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label htmlFor="leave-classification" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Leave Classification *</label>
                  <select
                    id="leave-classification"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="form-select form-select-sm"
                  >
                    <option value="Medical">Medical Rest (Hospital / Campus Dispensary)</option>
                    <option value="OnDuty">On Duty (Hackathons, Research Symposia, Sports)</option>
                    <option value="Personal">Personal / Family Emergency</option>
                    <option value="HostelOuting">Hostel Weekend Hometown Outing</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="leave-from-date" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>From Date *</label>
                    <input
                      id="leave-from-date"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="leave-to-date" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>To Date *</label>
                    <input
                      id="leave-to-date"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="leave-reason-text" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Reason & Event Details *</label>
                  <textarea
                    id="leave-reason-text"
                    rows={3}
                    placeholder="State the reason clearly. For OnDuty leaves, cite event name..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="form-control form-control-sm"
                  />
                </div>

                <div className="d-flex align-items-center gap-2 p-2 rounded border" style={{ background: 'var(--surface-bg)' }}>
                  <input
                    type="checkbox"
                    id="parentConsent"
                    checked={parentConsent}
                    onChange={(e) => setParentConsent(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="parentConsent" style={{ fontSize: 12, color: '#475569', cursor: 'pointer', margin: 0 }}>
                    Parent has been informed and given consent via registered mobile number
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2"
                >
                  <Send size={16} />
                  {submitting ? 'Transmitting...' : 'Submit Leave Request'}
                </button>
              </form>
            </div>

            {/* Status History */}
            <div className="card border-0 shadow-sm p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#F1F5F9', color: '#475569', padding: 10, borderRadius: 8 }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Application Log</h2>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>HOD approval statuses & gate verification passes</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
                {requests.length === 0 ? (
                  <div className="text-center py-4 text-muted small">No past leave applications on record.</div>
                ) : (
                  requests.map((r) => {
                    const isApproved = r.status === 'APPROVED'
                    const isPending = r.status === 'PENDING'
                    return (
                      <div key={r.id} className="p-3 rounded border" style={{ background: 'var(--surface-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{r.leave_type} Leave</span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 999,
                              background: isApproved ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2',
                              color: isApproved ? '#15803D' : isPending ? '#B45309' : '#B91C1C'
                            }}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          {r.from_date} to {r.to_date}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>{r.reason}</div>
                        {r.review_comment && (
                          <div style={{ background: '#F0FDF4', border: '1px dashed #86EFAC', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#166534', marginTop: 8 }}>
                            <strong>{r.reviewed_by || 'HOD'}:</strong> {r.review_comment}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
