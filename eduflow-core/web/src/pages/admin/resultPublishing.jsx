import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const GREEN = '#10B981'
const AMBER = '#F59E0B'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'

const initialExams = [
  { id: 'R1', exam: 'Continuous Assessment 1 (E1 Sem 1)', date: '2026-08-20', compiled: true, published: true, classAvg: '78.4%', totalAppeared: 184, passed: 172 },
  { id: 'R2', exam: 'Midterm Examination I (E2 Sem 1)', date: '2026-09-22', compiled: true, published: false, classAvg: '72.1%', totalAppeared: 190, passed: 168 },
  { id: 'R3', exam: 'Continuous Assessment 2 (E3 Sem 1)', date: '2026-10-18', compiled: false, published: false, classAvg: null, totalAppeared: 176, passed: 0 },
  { id: 'R4', exam: 'Semester Practical External Viva (E4)', date: '2026-11-15', compiled: true, published: false, classAvg: '84.2%', totalAppeared: 165, passed: 165 },
]

export default function Page() {
  const [exams, setExams] = useState(initialExams)
  const [confirmPublishId, setConfirmPublishId] = useState(null)
  const [moderationApplied, setModerationApplied] = useState({})
  const [search, setSearch] = useState('')

  function handleCompile(id) {
    setExams(prev => prev.map(e => e.id === id ? { ...e, compiled: true, classAvg: '76.8%', passed: Math.round(e.totalAppeared * 0.92) } : e))
  }

  function handlePublish(id) {
    setExams(prev => prev.map(e => e.id === id ? { ...e, published: true } : e))
    setConfirmPublishId(null)
  }

  function handleUnpublish(id) {
    setExams(prev => prev.map(e => e.id === id ? { ...e, published: false } : e))
  }

  function applyModeration(id) {
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
  }

  const publishedCount = exams.filter(e => e.published).length
  const compiledCount = exams.filter(e => e.compiled).length

  const filtered = exams.filter(e => e.exam.toLowerCase().includes(search.toLowerCase()))

  return (
    <RolePageTemplate role="Admin" title="Result Publishing & Marksheets" description="Compile grade distributions, run borderline moderation, and publish validated marksheets to student portals.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

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

        {/* Search Bar */}
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
                  {['Exam Title', 'Evaluation Date', 'Class Average', 'Pass Rate', 'Status', 'Moderation Tool', 'Publish Action'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No examinations found matching your query</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{e.exam}</td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{e.date}</td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 800, color: BLUE }}>{e.classAvg || '—'}</td>
                      <td>
                        {e.compiled ? (
                          <span className="badge bg-light text-dark border">
                            {e.passed} / {e.totalAppeared} ({Math.round((e.passed / e.totalAppeared) * 100)}%)
                          </span>
                        ) : (
                          <span className="text-muted small">Pending compile</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '2rem',
                          background: e.published ? `${GREEN}12` : e.compiled ? `${BLUE}12` : `${AMBER}12`,
                          color: e.published ? GREEN : e.compiled ? BLUE : AMBER,
                          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {e.published ? '📢 Published' : e.compiled ? '🔒 Verified' : '⏳ Raw Scores'}
                        </span>
                      </td>
                      <td>
                        {e.compiled && !e.published ? (
                          <button
                            type="button"
                            className={`btn btn-sm ${moderationApplied[e.id] ? 'btn-success' : 'btn-outline-info'} py-0 px-2`}
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => applyModeration(e.id)}
                            disabled={moderationApplied[e.id]}
                          >
                            {moderationApplied[e.id] ? '✓ Grace Applied' : '⚖️ Apply Grace'}
                          </button>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        {!e.compiled ? (
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleCompile(e.id)} style={{ fontSize: '0.72rem' }}>
                            Compile Marks 📊
                          </button>
                        ) : !e.published ? (
                          confirmPublishId === e.id ? (
                            <div className="d-flex align-items-center gap-1">
                              <button className="btn btn-sm btn-success px-2 py-0" onClick={() => handlePublish(e.id)} style={{ fontSize: '0.7rem' }}>
                                Confirm
                              </button>
                              <button className="btn btn-sm btn-secondary px-2 py-0" onClick={() => setConfirmPublishId(null)} style={{ fontSize: '0.7rem' }}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => setConfirmPublishId(e.id)}
                              style={{ fontSize: '0.72rem' }}
                            >
                              Publish to Portal 🚀
                            </button>
                          )
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: '0.75rem', color: GREEN, fontWeight: 700 }}>✓ Released</span>
                            <button
                              className="btn btn-sm btn-outline-secondary py-0 px-1"
                              onClick={() => handleUnpublish(e.id)}
                              style={{ fontSize: '0.68rem' }}
                              title="Retract / Unpublish for audit review"
                            >
                              Retract
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </RolePageTemplate>
  )
}
