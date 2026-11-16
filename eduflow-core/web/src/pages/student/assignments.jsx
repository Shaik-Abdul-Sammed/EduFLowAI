import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const BLUE = '#2563EB'

const diffDays = (dateStr) => {
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const getStatus = (a, subs = {}) => {
  if (subs && subs[a.id]) return 'submitted'
  if (a.status === 'closed') return 'closed'
  const d = diffDays(a.due)
  if (d < 0) return 'overdue'
  return 'pending'
}

const statusMeta = {
  submitted: { label: 'Submitted', color: '#10B981', bg: '#10B98112' },
  pending:   { label: 'Pending',   color: '#2563EB', bg: '#2563EB12' },
  overdue:   { label: 'Overdue',   color: '#EF4444', bg: '#EF444412' },
  closed:    { label: 'Closed',    color: '#94a3b8', bg: '#94a3b812' },
}

export default function Page() {
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submittingId, setSubmittingId] = useState(null)

  const [filter, setFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [activeId, setActiveId] = useState(null)
  const [note, setNote] = useState('')
  const [toast, setToast] = useState(null)

  const fetchAssignmentsAndSubmissions = async (isMounted = true) => {
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
        setSubmissions(data.submissions || {})
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
    fetchAssignmentsAndSubmissions(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const subjects = ['all', ...new Set(assignments.map(a => a.subject))]

  const filtered = assignments.filter(a => {
    const st = getStatus(a, submissions)
    const matchStatus = filter === 'all' || st === filter
    const matchSubject = subjectFilter === 'all' || a.subject === subjectFilter
    return matchStatus && matchSubject
  })

  const counts = { all: assignments.length, submitted: 0, pending: 0, overdue: 0 }
  assignments.forEach(a => {
    const st = getStatus(a, submissions)
    if (st === 'submitted') counts.submitted++
    else if (st === 'overdue') counts.overdue++
    else if (st === 'pending') counts.pending++
  })

  async function handleSubmit(a) {
    setSubmittingId(a.id)
    setSubmitError(null)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/v1/academics/assignments/${a.id}/submit`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ note })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit assignment')
      }

      const data = await res.json()
      const newSubmission = data.submission || {
        assignmentId: a.id,
        submittedOn: new Date().toLocaleDateString('en-IN'),
        score: null,
        feedback: null
      }

      setSubmissions(prev => ({
        ...prev,
        [a.id]: newSubmission
      }))
      setActiveId(null)
      setNote('')
      setToast(`✅ "${a.title}" submitted successfully!`)
      setTimeout(() => setToast(null), 3500)
    } catch (err) {
      setSubmitError(err.message || 'Error submitting assignment')
    } finally {
      setSubmittingId(null)
    }
  }

  const statTabs = [
    { key: 'all',       label: 'All',       value: counts.all,       color: '#2563EB' },
    { key: 'pending',   label: 'Pending',   value: counts.pending,   color: '#F59E0B' },
    { key: 'submitted', label: 'Submitted', value: counts.submitted, color: '#10B981' },
    { key: 'overdue',   label: 'Overdue',   value: counts.overdue,   color: '#EF4444' },
  ]

  return (
    <RolePageTemplate role="Student" title="Assignments" description="View and submit assignments published by your faculty.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {toast && (
          <div data-testid="assignment-toast" style={{ padding: '0.875rem 1.25rem', background: '#10B98112', border: '1px solid #10B98135', borderRadius: '0.875rem', color: '#065f46', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {toast}
          </div>
        )}

        {submitError && (
          <div className="alert alert-danger mb-0" role="alert">
            ❌ {submitError}
          </div>
        )}

        {/* Stats Strip */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {statTabs.map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '0.875rem', border: `2px solid ${filter === s.key ? s.color : 'transparent'}`, background: filter === s.key ? `${s.color}15` : 'var(--card-bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', minWidth: 72, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
            </button>
          ))}

          {/* Subject filter */}
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
            className="form-select" style={{ width: 'auto', fontSize: '0.82rem', fontWeight: 600, marginLeft: 'auto' }}>
            {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>)}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="student-assignments-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading course assignments from faculty portal...</p>
          </div>
        )}

        {/* Load Error State */}
        {loadError && !loading && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <div>
              <strong>Error:</strong> {loadError}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchAssignmentsAndSubmissions(true)}>
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !loadError && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
            <div style={{ fontWeight: 600 }}>No assignments found for this filter.</div>
          </div>
        )}

        {/* Assignment Cards */}
        {!loading && !loadError && filtered.map(a => {
          const st = getStatus(a, submissions)
          const meta = statusMeta[st]
          const days = diffDays(a.due)
          const sub = submissions[a.id]
          const isExpanded = activeId === a.id

          return (
            <div key={a.id} className="card border-0 shadow-sm"
              style={{ borderRadius: '1.25rem', overflow: 'hidden', borderLeft: `4px solid ${meta.color}`, transition: 'box-shadow 0.2s ease' }}>
              <div className="card-body p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--svc-navy)' }}>{a.title}</span>
                      <span style={{ padding: '0.2rem 0.7rem', borderRadius: '2rem', background: meta.bg, color: meta.color, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{meta.label}</span>
                      {st === 'pending' && days <= 3 && days >= 0 && (
                        <span style={{ padding: '0.2rem 0.7rem', borderRadius: '2rem', background: '#F59E0B15', color: '#B45309', fontSize: '0.7rem', fontWeight: 700 }}>⚠️ Due Soon</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span>📚 {a.subject}</span>
                      <span>👨‍🏫 {a.faculty}</span>
                      <span>📅 Due: {a.due}</span>
                      <span>🏅 Max: {a.maxMarks} marks</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)', margin: 0, lineHeight: 1.6 }}>{a.description}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    {st === 'pending' && (
                      <div style={{ textAlign: 'center', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', background: days < 0 ? '#EF444412' : '#2563EB10' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: days < 0 ? '#EF4444' : BLUE }}>{Math.abs(days)}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{days < 0 ? 'Days Late' : 'Days Left'}</div>
                      </div>
                    )}
                    {sub && sub.score !== null && (
                      <div style={{ textAlign: 'center', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', background: '#10B98112' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981' }}>{sub.score}/{a.maxMarks}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Score</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub + Feedback */}
                {sub && (
                  <div style={{ marginTop: '0.875rem', padding: '0.75rem', borderRadius: '0.875rem', background: '#10B98108', border: '1px solid #10B98125' }}>
                    <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>✅ Submitted on {sub.submittedOn}</div>
                    {sub.feedback && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>💬 Faculty Feedback: {sub.feedback}</div>}
                  </div>
                )}

                {/* Submit CTA */}
                {(st === 'pending' || st === 'overdue') && (
                  <div style={{ marginTop: '1rem' }}>
                    {!isExpanded ? (
                      <button onClick={() => { setActiveId(a.id); setSubmitError(null) }} className="btn btn-primary btn-sm">
                        📤 Submit Assignment
                      </button>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.75rem', padding: '1rem', background: 'var(--surface-bg)', borderRadius: '0.875rem', border: '1px solid var(--border-color)' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Submission Note (Optional)</label>
                        <textarea className="form-control" rows={2} placeholder="Add a note for your faculty..." value={note} onChange={e => setNote(e.target.value)} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button disabled={submittingId === a.id} onClick={() => handleSubmit(a)} className="btn btn-primary btn-sm">
                            {submittingId === a.id ? 'Submitting...' : '📤 Confirm Submit'}
                          </button>
                          <button onClick={() => setActiveId(null)} className="btn btn-outline-secondary btn-sm">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </RolePageTemplate>
  )
}
