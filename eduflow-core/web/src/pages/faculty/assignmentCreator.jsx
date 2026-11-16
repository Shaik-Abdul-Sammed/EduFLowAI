import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const AMBER = '#F59E0B'

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Page() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', subject: 'Physics', section: 'MPC-A', due: '', description: '', maxMarks: '10' })
  const [showForm, setShowForm] = useState(false)
  const [created, setCreated] = useState(false)

  const fetchAssignments = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/academics/assignments'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) {
        throw new Error(`Failed to load assignments (${res.status})`)
      }
      const data = await res.json()
      if (isMounted) {
        setAssignments(data.assignments || [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching assignments')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchAssignments(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    setActionError(null)

    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/academics/assignments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create assignment')
      }

      const data = await res.json()
      const newA = data.assignment || { id: Date.now(), ...form, submissions: 0, total: 32, status: 'active' }
      setAssignments(prev => [newA, ...prev])
      setForm({ title: '', subject: 'Physics', section: 'MPC-A', due: '', description: '', maxMarks: '10' })
      setShowForm(false)
      setCreated(true)
      setTimeout(() => setCreated(false), 3500)
    } catch (err) {
      setActionError(err.message || 'Error publishing assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const statusColor = { active: '#10B981', closed: '#94a3b8' }
  const statusBg    = { active: '#10B98115', closed: 'rgba(148,163,184,0.1)' }

  return (
    <RolePageTemplate role="Faculty" title="Assignment Creator" description="Create, manage, and track student assignment submissions.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Header Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { label: 'Total', value: assignments.length, color: '#2563EB' },
              { label: 'Active', value: assignments.filter(a => a.status === 'active').length, color: '#10B981' },
              { label: 'Closed', value: assignments.filter(a => a.status === 'closed').length, color: '#94a3b8' },
            ].map(s => (
              <div key={s.label} style={{ padding: '0.6rem 1.1rem', borderRadius: '0.875rem', background: `${s.color}10`, border: `1px solid ${s.color}25`, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { setShowForm(v => !v); setActionError(null) }} className="btn" style={{ background: `linear-gradient(135deg,${AMBER},#EF4444)`, color: 'white', border: 'none', fontWeight: 700, boxShadow: `0 4px 14px ${AMBER}50`, borderRadius: '0.875rem' }}>
            {showForm ? '✕ Cancel' : '+ New Assignment'}
          </button>
        </div>

        {created && (
          <div data-testid="assignment-created-alert" style={{ padding: '0.875rem 1rem', background: '#10B98110', border: '1px solid #10B98130', borderRadius: '0.875rem', color: '#065f46', fontWeight: 600, fontSize: '0.875rem' }}>
            ✅ Assignment created and published to students.
          </div>
        )}

        {actionError && (
          <div className="alert alert-danger mb-0" role="alert">
            ❌ {actionError}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', border: `1px solid ${AMBER}25` }}>
            <div className="card-body p-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: AMBER }}>📝 New Assignment</h2>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label htmlFor="assignment-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>TITLE *</label>
                    <input id="assignment-title" required className="form-control" placeholder="e.g. Thermodynamics Problem Set" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
                  </div>
                  <div>
                    <label htmlFor="assignment-subject" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>SUBJECT</label>
                    <select id="assignment-subject" className="form-select" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}>
                      {['Physics','Chemistry','Mathematics','Biology','English'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="assignment-section" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>SECTION</label>
                    <select id="assignment-section" className="form-select" value={form.section} onChange={e => setForm(p => ({...p, section: e.target.value}))}>
                      {['MPC-A','MPC-B','BIPC-A','BIPC-B','MBIPC-A'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="assignment-due" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>DUE DATE *</label>
                    <input id="assignment-due" required type="date" className="form-control" min={getTodayDate()} value={form.due} onChange={e => setForm(p => ({...p, due: e.target.value}))} />
                  </div>
                  <div>
                    <label htmlFor="assignment-maxmarks" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>MAX MARKS</label>
                    <input id="assignment-maxmarks" type="number" className="form-control" value={form.maxMarks} onChange={e => setForm(p => ({...p, maxMarks: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label htmlFor="assignment-desc" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>DESCRIPTION</label>
                    <textarea id="assignment-desc" className="form-control" rows={3} placeholder="Instructions for students..." value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-sm" style={{ background: `linear-gradient(135deg,${AMBER},#EF4444)`, color: 'white', border: 'none', fontWeight: 700 }}>
                    {submitting ? 'Publishing...' : '📤 Publish Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="assignments-loading">
            <div className="spinner-border text-warning mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading published assignments from academic portal...</p>
          </div>
        )}

        {/* Load Error State */}
        {loadError && !loading && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <div>
              <strong>Error:</strong> {loadError}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchAssignments(true)}>
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !loadError && assignments.length === 0 && (
          <div className="card border-0 shadow-sm p-5 text-center text-muted">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
            <div style={{ fontWeight: 600 }}>No assignments published yet.</div>
            <p className="small mb-0">Click "+ New Assignment" to publish coursework to student portals.</p>
          </div>
        )}

        {/* Assignment Cards */}
        {!loading && !loadError && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {assignments.map(a => {
              const pct = a.total > 0 ? Math.round(((a.submissions || 0) / a.total) * 100) : 0
              const currentStatus = a.status || 'active'
              return (
                <div key={a.id} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem 1.5rem', borderLeft: `4px solid ${statusColor[currentStatus] || '#94a3b8'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.title}</span>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: statusBg[currentStatus] || 'rgba(148,163,184,0.1)', color: statusColor[currentStatus] || '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{currentStatus}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>📚 {a.subject}</span><span>👥 {a.section}</span><span>📅 Due: {a.due}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: statusColor[currentStatus] || '#94a3b8' }}>{a.submissions || 0}/{a.total || 32}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>SUBMITTED</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Submission Progress</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: statusColor[currentStatus] || '#94a3b8' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${statusColor[currentStatus] || '#94a3b8'}, ${statusColor[currentStatus] || '#94a3b8'}88)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
