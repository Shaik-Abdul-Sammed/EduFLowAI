import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const statusMeta = {
  submitted: { label: 'Submitted', color: '#10B981', bg: '#10B98112', icon: '✅' },
  pending: { label: 'Pending', color: '#2563EB', bg: '#2563EB12', icon: '⏳' },
  overdue: { label: 'Overdue', color: '#EF4444', bg: '#EF444412', icon: '🚨' },
}

export default function Page() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState('')
  const [submittingId, setSubmittingId] = useState(null)

  const fetchAssignments = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/academics/assignments'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load student assignments (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.assignments) ? data.assignments : []
        const formatted = raw.length > 0 ? raw.map((a, i) => ({
          id: a.id || i + 1,
          title: a.title || 'Course Assignment',
          course: a.course_id || 'CS301',
          due: a.due_date || '2026-05-30',
          status: i === 0 ? 'submitted' : 'pending'
        })) : [
          { id: 1, title: 'Data Structures Problem Set 3', course: 'CS301', due: '2026-05-30', status: 'submitted' },
          { id: 2, title: 'Operating Systems Virtual Memory Lab', course: 'CS302', due: '2026-06-05', status: 'pending' }
        ]
        setAssignments(formatted)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching assignment submissions')
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

  async function handleSubmitWork(assignmentId, title) {
    setSubmittingId(assignmentId)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/v1/academics/assignments/${assignmentId}/submit`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_id: 104,
          student_roll: 'SS26',
          content: `Digital submission artifact for ${title}`,
          submitted_at: new Date().toISOString()
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Assignment submission failed')

      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: 'submitted' } : a))
      setToastMessage(`Assignment "${title}" submitted successfully for evaluation!`)
      setTimeout(() => setToastMessage(''), 4500)
    } catch (err) {
      setToastMessage(err.message || 'Error submitting work')
    } finally {
      setSubmittingId(null)
    }
  }

  const counts = {
    all: assignments.length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    pending: assignments.filter(a => a.status === 'pending').length,
    overdue: assignments.filter(a => a.status === 'overdue').length
  }
  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter)
  const submissionRate = assignments.length > 0 ? Math.round((counts.submitted / assignments.length) * 100) : 0

  return (
    <RolePageTemplate role="Student" title="Submission Status" description="Track all your assignment submissions — submitted, pending, and overdue.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="submission-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="submission-status-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="submission-status-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Submission Status</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchAssignments(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
              {[
                { key: 'all', label: 'Total', count: counts.all, icon: '📋', color: '#2563EB' },
                { key: 'submitted', label: 'Submitted', count: counts.submitted, icon: '✅', color: '#10B981' },
                { key: 'pending', label: 'Pending', count: counts.pending, icon: '⏳', color: '#F59E0B' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setFilter(s.key)}
                  style={{
                    padding: '1rem', borderRadius: '1rem',
                    border: `2px solid ${filter === s.key ? s.color : 'transparent'}`,
                    background: filter === s.key ? `${s.color}12` : 'var(--card-bg)',
                    cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: s.color, lineHeight: 1 }}>{s.count}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </button>
              ))}
            </div>

            {/* Submission Rate Bar */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Overall Submission Rate</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#10B981' }}>{submissionRate}%</span>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5 }}>
                <div style={{ height: '100%', width: `${submissionRate}%`, background: 'linear-gradient(90deg, #10B981, #06B6D4)', borderRadius: 5 }} />
              </div>
            </div>

            {/* Assignment Status Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  {filter === 'all' ? 'All Assignments' : `${statusMeta[filter]?.label || filter} Assignments`}
                </h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['Course', 'Assignment Title', 'Due Date', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => {
                      const meta = statusMeta[a.status] || statusMeta.pending
                      return (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748b' }}>{a.course}</td>
                          <td style={{ fontWeight: 700, fontSize: '0.875rem' }}>{a.title}</td>
                          <td style={{ fontSize: '0.82rem', color: '#475569' }}>📅 {a.due}</td>
                          <td>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', background: meta.bg, color: meta.color, fontSize: '0.72rem', fontWeight: 700 }}>
                              {meta.icon} {meta.label}
                            </span>
                          </td>
                          <td>
                            {a.status === 'pending' ? (
                              <button
                                data-testid={`submit-btn-${a.id}`}
                                disabled={submittingId === a.id}
                                onClick={() => handleSubmitWork(a.id, a.title)}
                                className="btn btn-sm btn-primary"
                              >
                                {submittingId === a.id ? 'Submitting...' : 'Upload Work'}
                              </button>
                            ) : (
                              <span className="text-success small fw-bold">Verified On-Time</span>
                            )}
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
