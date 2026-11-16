import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'

export default function Page() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [leaveReason, setLeaveReason] = useState('')
  const [leaveDays, setLeaveDays] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  const fetchAttendance = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parent/overview'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) {
        throw new Error(`Failed to load child attendance (${res.status})`)
      }
      const data = await res.json()
      if (isMounted) {
        setOverview(data)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching child attendance')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchAttendance(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleApply(e) {
    e.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionSuccess('')

    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const today = new Date().toISOString().split('T')[0]
      const toDate = new Date(Date.now() + leaveDays * 24 * 3600000).toISOString().split('T')[0]

      const res = await fetch(getFullApiUrl('/v1/leave/apply'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_roll: overview?.child?.roll || 'SS26',
          student_name: overview?.child?.name || 'Child',
          leave_type: 'Medical',
          from_date: today,
          to_date: toDate,
          reason: leaveReason
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit leave application')
      }

      setActionSuccess('✓ Leave request submitted to class mentor for authorization.')
      setLeaveReason('')
      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setActionError(err.message || 'Error submitting leave request')
    } finally {
      setSubmitting(false)
    }
  }

  const child = overview?.child || {}
  const overall = child.overallAttendance || 0
  const subjects = child.subjectAttendance || []
  const totalAttended = subjects.reduce((a, b) => a + (b.attended || 0), 0)
  const totalClasses = subjects.reduce((a, b) => a + (b.total || b.classes || 0), 0)

  return (
    <RolePageTemplate role="Parent" title="Child Attendance Status" description="Monitor your child's presence rates, subject metrics, and request student leaves.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Loading State */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="attendance-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading child attendance and statutory compliance metrics...</p>
          </div>
        )}

        {/* Error State */}
        {loadError && !loading && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <div>
              <strong>Error:</strong> {loadError}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchAttendance(true)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* Child Profile Strip */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1rem 1.5rem', background: 'var(--surface-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{child.name || 'Student'}</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Roll: <strong style={{ color: '#2563EB' }}>{child.roll}</strong> | {child.branch} ({child.semester})
                  </div>
                </div>
                <div style={{ padding: '0.35rem 0.85rem', borderRadius: '2rem', background: overall >= 75 ? `${GREEN}15` : `${RED}15`, color: overall >= 75 ? GREEN : RED, fontWeight: 700, fontSize: '0.75rem' }}>
                  {child.attendanceStatus || (overall >= 75 ? 'ELIGIBLE' : 'ATTENDANCE SHORTAGE')}
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              
              {/* Donut score */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Overall Presence</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 90, height: 90, borderRadius: '50%', background: `conic-gradient(${overall >= 75 ? GREEN : RED} ${overall}%, #f1f5f9 0)`, position: 'relative', margin: '0 auto 1rem' }}>
                  <div style={{ width: 74, height: 74, borderRadius: '50%', background: 'var(--card-bg, white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.35rem', color: overall >= 75 ? GREEN : RED }}>
                    {overall}%
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Target: 75% for exam eligibility</div>
              </div>

              {/* Quick stats */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', gap: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📅</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{totalAttended} / {totalClasses}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Total Lectures Attended</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>👨‍🏫</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{overview?.mentor?.name || 'Class Mentor'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Assigned Mentor: {overview?.mentor?.phone || 'Available via Chat'}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Apply for leave */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>📝 Quick Leave Request Form</h3>
              
              {actionSuccess && (
                <div className="alert alert-success py-2 mb-3" data-testid="leave-success">
                  {actionSuccess}
                </div>
              )}

              {actionError && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                  ❌ {actionError}
                </div>
              )}

              <form onSubmit={handleApply} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 2, minWidth: 260 }}>
                  <label htmlFor="leave-reason" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>REASON FOR ABSENCE *</label>
                  <input
                    id="leave-reason"
                    required
                    className="form-control form-control-sm"
                    placeholder="e.g. Suffering from fever. Doctor advised rest."
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                  />
                </div>
                <div style={{ width: 100 }}>
                  <label htmlFor="leave-days" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DAYS</label>
                  <input
                    id="leave-days"
                    type="number"
                    min="1"
                    max="14"
                    className="form-control form-control-sm"
                    value={leaveDays}
                    onChange={e => setLeaveDays(Number(e.target.value))}
                  />
                </div>
                <button disabled={submitting} className="btn btn-sm btn-primary" type="submit" style={{ background: AMBER, border: 'none', fontWeight: 700 }}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            {/* Subject Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Subject-wise Lecture Attendance</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['Course Code', 'Subject Name', 'Lectures Attended', 'Attendance Rate'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(s => {
                      const pct = s.percent != null ? s.percent : (s.classes ? Math.round((s.attended / s.classes) * 100) : 0)
                      return (
                        <tr key={s.code || s.name}>
                          <td style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB' }}>{s.code || '—'}</td>
                          <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{s.name}</td>
                          <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{s.attended} / {s.total || s.classes} classes</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: 100, height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                                <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 75 ? GREEN : RED, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pct >= 75 ? GREEN : RED }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
