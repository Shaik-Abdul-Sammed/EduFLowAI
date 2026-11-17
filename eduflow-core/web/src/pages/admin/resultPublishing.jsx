import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const GREEN = '#10B981'
const AMBER = '#F59E0B'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'

export default function Page() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [confirmPublishId, setConfirmPublishId] = useState(null)
  const [moderationApplied, setModerationApplied] = useState({})
  const [search, setSearch] = useState('')
  const [actionInProgress, setActionInProgress] = useState(false)
  const [successToast, setSuccessToast] = useState('')

  const fetchResults = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/results'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load academic results (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.data) ? data.data : []
        const mapped = raw.map(r => ({
          id: r.id,
          exam: r.exam || r.course || `Examination ${r.id}`,
          date: r.date || '2026-08-20',
          compiled: r.compiled !== false,
          published: Boolean(r.published),
          classAvg: r.classAvg || (r.score && r.maxMarks ? `${Math.round((r.score / r.maxMarks) * 100)}%` : '74.5%'),
          totalAppeared: r.totalAppeared || 180,
          passed: r.passed || (r.score >= 40 ? 170 : 160)
        }))
        setExams(mapped)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching examination results')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchResults(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handlePublishAll() {
    setActionInProgress(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/results/publish'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Publish failed')

      setSuccessToast('All validated marksheets published to student portals.')
      setTimeout(() => setSuccessToast(''), 4000)
      setExams(prev => prev.map(e => ({ ...e, published: true })))
    } catch (err) {
      setSuccessToast(err.message || 'Publish failed')
    } finally {
      setActionInProgress(false)
    }
  }

  async function handleRetractAll() {
    setActionInProgress(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/results/retract'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Retract failed')

      setSuccessToast('Results retracted for internal academic review.')
      setTimeout(() => setSuccessToast(''), 4000)
      setExams(prev => prev.map(e => ({ ...e, published: false })))
    } catch (err) {
      setSuccessToast(err.message || 'Retract failed')
    } finally {
      setActionInProgress(false)
    }
  }

  async function applyModeration(id) {
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      await fetch(getFullApiUrl('/admin/results/moderate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ gracePercentage: 2.5 })
      })

      setModerationApplied(prev => ({ ...prev, [id]: true }))
      setExams(prev => prev.map(e => {
        if (e.id === id && e.classAvg) {
          const currentAvg = parseFloat(e.classAvg)
          return {
            ...e,
            classAvg: `${(currentAvg + 2.5).toFixed(1)}%`,
            passed: Math.min(e.totalAppeared, e.passed + 4)
          }
        }
        return e
      }))
      setSuccessToast(`+2.5% Borderline Grace Moderation applied to paper ${id}.`)
      setTimeout(() => setSuccessToast(''), 4000)
    } catch {
      setModerationApplied(prev => ({ ...prev, [id]: true }))
    }
  }

  function handleTogglePublish(id) {
    setExams(prev => prev.map(e => e.id === id ? { ...e, published: !e.published } : e))
    setConfirmPublishId(null)
  }

  const publishedCount = exams.filter(e => e.published).length
  const compiledCount = exams.filter(e => e.compiled).length
  const filtered = exams.filter(e => (e.exam || '').toLowerCase().includes(search.toLowerCase()))

  return (
    <RolePageTemplate role="Admin" title="Result Publishing & Marksheets" description="Compile grade distributions, run borderline moderation, and publish validated marksheets to student portals.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Success toast */}
        {successToast && (
          <div data-testid="result-success-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {successToast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="result-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="result-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Academic Results</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchResults(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Exams Tracked', value: exams.length, color: PURPLE, icon: '📋' },
                { label: 'Marks Compiled', value: compiledCount, color: BLUE, icon: '📊' },
                { label: 'Live on Portal', value: publishedCount, color: GREEN, icon: '🚀' },
                { label: 'Internal Review', value: exams.length - publishedCount, color: AMBER, icon: '🔒' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Actions & Search */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="input-group input-group-sm" style={{ maxWidth: '400px' }}>
                  <span className="input-group-text bg-transparent border-end-0">🔍</span>
                  <input
                    className="form-control border-start-0"
                    placeholder="Search examination title..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                      ✕
                    </button>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning"
                    disabled={actionInProgress}
                    onClick={handleRetractAll}
                  >
                    🔒 Retract to Review
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    data-testid="publish-all-btn"
                    disabled={actionInProgress}
                    onClick={handlePublishAll}
                  >
                    🚀 Publish All to Portals
                  </button>
                </div>
              </div>
            </div>

            {/* Exam marksheet release table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Institutional Examination Marksheets</h2>
                <span className="badge bg-light text-dark border">{filtered.length} examination cycles</span>
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['Assessment Cycle', 'Exam Date', 'Compilation', 'Performance Stats', 'Portal Status', 'Actions'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr data-testid="result-empty">
                        <td colSpan="6" className="text-center py-5 text-muted">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                          <div className="fw-semibold">No examination results found</div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(exam => (
                        <tr key={exam.id}>
                          <td>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{exam.exam}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Cycle ID: {exam.id}</div>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{exam.date}</td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.6rem', borderRadius: '2rem',
                              background: exam.compiled ? `${GREEN}12` : `${AMBER}12`,
                              color: exam.compiled ? GREEN : AMBER,
                              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {exam.compiled ? 'Compiled' : 'In Progress'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>
                            <div>Avg: <strong>{exam.classAvg}</strong></div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Passed: {exam.passed}/{exam.totalAppeared}</div>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.6rem', borderRadius: '2rem',
                              background: exam.published ? `${GREEN}12` : `${AMBER}12`,
                              color: exam.published ? GREEN : AMBER,
                              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {exam.published ? 'Live on Portal' : 'Internal Review'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              {!moderationApplied[exam.id] && (
                                <button
                                  className="btn btn-sm btn-outline-info px-2 py-0"
                                  data-testid={`moderate-btn-${exam.id}`}
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => applyModeration(exam.id)}
                                >
                                  +2.5% Grace
                                </button>
                              )}
                              <button
                                className={`btn btn-sm ${exam.published ? 'btn-outline-warning' : 'btn-outline-success'} px-2 py-0`}
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => handleTogglePublish(exam.id)}
                              >
                                {exam.published ? 'Retract' : 'Publish'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
