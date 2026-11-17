import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const ROSE = '#EF4444'

const leaveTypes = ['Casual Leave', 'Medical Leave', 'Earned Leave', 'On-Duty Leave', 'Special Leave']

const defaultBalance = [
  { type: 'Casual Leave', total: 12, used: 4 },
  { type: 'Medical Leave', total: 10, used: 2 },
  { type: 'Earned Leave', total: 30, used: 8 },
  { type: 'On-Duty Leave', total: 15, used: 6 },
]

const statusStyle = {
  approved: { color: '#10B981', bg: '#10B98112', border: '#10B98128' },
  pending: { color: '#F59E0B', bg: '#F59E0B12', border: '#F59E0B28' },
  rejected: { color: '#EF4444', bg: '#EF444412', border: '#EF444428' },
}

export default function Page() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: 'Casual Leave',
    from: '2026-11-20',
    to: '2026-11-22',
    reason: 'Academic conference at IIT Madras',
    alternate: 'Dr. Suresh Kumar'
  })

  const fetchLeaveHistory = async (isMounted = true) => {
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
        throw new Error(`Failed to load faculty leave records (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.requests) ? data.requests : []
        setRequests(raw)
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
    fetchLeaveHistory(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault()
    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/leave/apply'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          applicant_name: 'Dr. Ramesh Kumar',
          applicant_role: 'faculty',
          leave_type: form.type,
          from_date: form.from,
          to_date: form.to,
          reason: form.reason,
          substitute_faculty: form.alternate,
          days: 2
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to submit leave application')

      setToastMessage(`Leave application for ${form.type} submitted successfully! Ticket #${data?.leave?.id || 'LV-FAC'}`)
      setTimeout(() => setToastMessage(''), 4500)
      await fetchLeaveHistory(true)
    } catch (err) {
      setToastMessage(err.message || 'Error applying for leave')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate role="Faculty" title="Leave Application" description="Apply for leave and track your leave balance and application status.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="faculty-leave-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div data-testid="faculty-leave-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="faculty-leave-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Leave Records</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchLeaveHistory(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Leave Balance Cards */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-4">
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📊 Leave Balance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem' }}>
                  {defaultBalance.map(lb => {
                    const remaining = lb.total - lb.used
                    const pct = Math.round((lb.used / lb.total) * 100)
                    const color = pct > 75 ? '#EF4444' : pct > 50 ? '#F59E0B' : '#10B981'
                    return (
                      <div key={lb.type} style={{ padding: '1rem', borderRadius: '0.875rem', background: `${color}08`, border: `1px solid ${color}20` }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{lb.type}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{remaining}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ {lb.total} days</span>
                        </div>
                        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>{lb.used} used</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

              {/* Application Form */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
                <div className="card-body p-4">
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>✍️ Apply for Leave</h2>
                  <form onSubmit={handleSubmit} data-testid="faculty-leave-form" style={{ display: 'grid', gap: '0.875rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>LEAVE TYPE</label>
                      <select className="form-select form-select-sm" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                        {leaveTypes.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>FROM DATE</label>
                        <input type="date" required className="form-control form-control-sm" value={form.from} onChange={e => setForm(p => ({...p, from: e.target.value}))} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TO DATE</label>
                        <input type="date" required className="form-control form-control-sm" value={form.to} onChange={e => setForm(p => ({...p, to: e.target.value}))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>REASON / PURPOSE</label>
                      <textarea rows={2} required className="form-control form-control-sm" value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SUBSTITUTE FACULTY</label>
                      <input className="form-control form-control-sm" value={form.alternate} onChange={e => setForm(p => ({...p, alternate: e.target.value}))} />
                    </div>
                    <button type="submit" disabled={submitting} data-testid="submit-leave-btn" className="btn btn-sm btn-primary w-100 mt-2">
                      {submitting ? 'Submitting Leave...' : 'Submit Leave Request'}
                    </button>
                  </form>
                </div>
              </div>

              {/* History Table */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
                <div className="card-body p-4">
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🕒 Recent Applications</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Duration</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.length === 0 ? (
                          <tr><td colSpan={3} className="text-center text-muted small py-3">No leave applications on file.</td></tr>
                        ) : (
                          requests.slice(0, 5).map((r, i) => {
                            const st = (r.status || 'pending').toLowerCase()
                            const style = statusStyle[st] || statusStyle.pending
                            return (
                              <tr key={r.id || i}>
                                <td style={{ fontWeight: 600 }}>{r.leave_type || r.type || 'Casual Leave'}</td>
                                <td className="small text-muted">{r.from_date || r.from || '2026-11-20'} ({r.days || 1}d)</td>
                                <td>
                                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                                    {st.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
