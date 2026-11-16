import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import SkeletonLoader from '../../components/SkeletonLoader'
import apiClient from '../../services/apiClient'

const BLUE = '#2563EB'

function getGrade(score, max) {
  if (max <= 0) return null
  const pct = (score / max) * 100
  if (pct >= 90) return { label: 'A+', color: '#10B981' }
  if (pct >= 75) return { label: 'A',  color: '#2563EB' }
  if (pct >= 60) return { label: 'B',  color: '#F59E0B' }
  if (pct >= 45) return { label: 'C',  color: '#F97316' }
  return { label: 'F', color: '#EF4444' }
}

export default function Page() {
  const [subjects, setSubjects] = useState([
    { code: 'PHY101', name: 'Physics',     maxInternal: 30, maxExternal: 70 },
    { code: 'CHE101', name: 'Chemistry',   maxInternal: 30, maxExternal: 70 },
    { code: 'MAT101', name: 'Mathematics', maxInternal: 30, maxExternal: 70 },
    { code: 'BIO101', name: 'Biology',     maxInternal: 30, maxExternal: 70 },
  ])
  const [subject, setSubject] = useState(subjects[0])
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const fetchMarks = async (subjCode) => {
    setLoading(true)
    setApiError(null)
    try {
      const res = await apiClient.get(`/academics/marks?subject=${subjCode || subject.code}`)
      const data = res.data || {}
      if (data.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects)
      }
      if (data.subject) {
        setSubject(data.subject)
      }
      const stList = data.students || []
      setStudents(stList)

      const serverMarks = data.marks || {}
      const initialMarks = {}
      stList.forEach((s) => {
        initialMarks[s.id] = {
          internal: serverMarks[s.id]?.internal !== undefined ? serverMarks[s.id].internal : '',
          external: serverMarks[s.id]?.external !== undefined ? serverMarks[s.id].external : '',
        }
      })
      setMarks(initialMarks)
      setPublished(Boolean(data.published))
    } catch (err) {
      console.error('[MarksEntry] Fetch error:', err)
      setApiError(err.response?.data?.error || err.message || 'Failed to fetch academic marks from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarks(subject.code)
  }, [subject.code])

  function update(id, field, val) {
    setPublished(false)
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], [field]: val } }))
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    setApiError(null)
    setFeedback(null)
    try {
      const res = await apiClient.post('/academics/marks', {
        subjectCode: subject.code,
        marks,
        published: false,
      })
      if (res.data?.success || res.status === 200) {
        setPublished(false)
        setFeedback({ type: 'info', message: 'Marks saved as draft.' })
        setTimeout(() => setFeedback(null), 4000)
      } else {
        throw new Error(res.data?.error || 'Failed to save marks draft')
      }
    } catch (err) {
      console.error('[MarksEntry] Save draft error:', err)
      setApiError(err.response?.data?.error || err.message || 'Error saving marks draft.')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    setSaving(true)
    setApiError(null)
    setFeedback(null)
    try {
      const res = await apiClient.post('/academics/marks/publish', {
        subjectCode: subject.code,
        marks,
      })
      if (res.data?.success || res.status === 200) {
        setPublished(true)
        setFeedback({ type: 'success', message: 'Marks successfully published to student portal!' })
        setTimeout(() => setFeedback(null), 5000)
      } else {
        throw new Error(res.data?.error || 'Failed to publish marks')
      }
    } catch (err) {
      console.error('[MarksEntry] Publish error:', err)
      setApiError(err.response?.data?.error || err.message || 'Error publishing marks to portal.')
    } finally {
      setSaving(false)
    }
  }

  const totalMax = (subject.maxInternal || 30) + (subject.maxExternal || 70)

  return (
    <RolePageTemplate role="Faculty" title="Marks Entry" description="Enter and publish continuous assessment and final examination marks.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {apiError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3" role="alert" data-testid="marks-api-error">
            <div>⚠️ {apiError}</div>
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => fetchMarks(subject.code)}>Retry</button>
          </div>
        )}

        {feedback && (
          <div className={`alert alert-${feedback.type === 'success' ? 'success' : 'info'} p-3`} role="alert" data-testid="marks-feedback">
            {feedback.type === 'success' ? '✓ ' : 'ℹ️ '}{feedback.message}
          </div>
        )}

        {/* Subject Tabs */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-4">
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Select Subject</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} data-testid="subject-selector">
              {subjects.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setSubject(s)}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    background: subject.code === s.code ? `linear-gradient(135deg,${BLUE},#06B6D4)` : 'rgba(37,99,235,0.08)',
                    color: subject.code === s.code ? 'white' : BLUE,
                    boxShadow: subject.code === s.code ? `0 4px 12px ${BLUE}40` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>✏️ {subject.name} ({subject.code})</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                  Internal: /{subject.maxInternal} · External: /{subject.maxExternal} · Total: /{totalMax}
                </p>
              </div>
              {published && (
                <span
                  data-testid="published-badge"
                  style={{ padding: '0.35rem 0.85rem', borderRadius: '2rem', background: '#10B98115', color: '#10B981', fontWeight: 700, fontSize: '0.78rem', border: '1px solid #10B98130' }}
                >
                  ✓ Published
                </span>
              )}
            </div>

            {loading ? (
              <div data-testid="marks-loading">
                <SkeletonLoader variant="table" rows={4} />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} data-testid="marks-table">
                  <thead>
                    <tr>
                      {['#', 'Student', 'Section', 'Internal', 'External', 'Total', 'Grade'].map((h) => (
                        <th
                          key={h}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '0.6rem 0.75rem',
                            textAlign: h === '#' ? 'center' : 'left',
                            borderBottom: '2px solid #e2e8f0',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted" data-testid="empty-marks-students">
                          No enrolled students found for this course section.
                        </td>
                      </tr>
                    ) : (
                      students.map((st, idx) => {
                        const m = marks[st.id] || { internal: '', external: '' }
                        const intern = parseInt(m.internal, 10) || 0
                        const extern = parseInt(m.external, 10) || 0
                        const total = intern + extern
                        const hasScore = m.internal !== '' || m.external !== ''
                        const grade = hasScore ? getGrade(total, totalMax) : null
                        return (
                          <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }} data-testid={`marks-row-${st.id}`}>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{st.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{st.id}</div>
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.82rem', color: '#475569' }}>{st.section}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <input
                                aria-label={`Internal marks for ${st.name}`}
                                type="number"
                                min="0"
                                max={subject.maxInternal}
                                value={m.internal}
                                onChange={(e) => update(st.id, 'internal', e.target.value)}
                                style={{
                                  width: 64,
                                  padding: '0.4rem 0.5rem',
                                  border: '2px solid #e2e8f0',
                                  borderRadius: '0.5rem',
                                  fontWeight: 600,
                                  fontSize: '0.88rem',
                                  textAlign: 'center',
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <input
                                aria-label={`External marks for ${st.name}`}
                                type="number"
                                min="0"
                                max={subject.maxExternal}
                                value={m.external}
                                onChange={(e) => update(st.id, 'external', e.target.value)}
                                style={{
                                  width: 64,
                                  padding: '0.4rem 0.5rem',
                                  border: '2px solid #e2e8f0',
                                  borderRadius: '0.5rem',
                                  fontWeight: 600,
                                  fontSize: '0.88rem',
                                  textAlign: 'center',
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 800, fontSize: '1rem', color: grade ? grade.color : '#94a3b8' }}>
                              {grade ? total : '—'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {grade && (
                                <span
                                  style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '0.5rem',
                                    background: `${grade.color}15`,
                                    color: grade.color,
                                    fontWeight: 800,
                                    fontSize: '0.82rem',
                                    border: `1px solid ${grade.color}25`,
                                  }}
                                >
                                  {grade.label}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || loading}
                className="btn btn-sm btn-outline-secondary"
                data-testid="save-draft-btn"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving || loading}
                className="btn btn-sm"
                style={{ background: `linear-gradient(135deg,${BLUE},#06B6D4)`, color: 'white', border: 'none', fontWeight: 700, boxShadow: `0 4px 12px ${BLUE}40` }}
                data-testid="publish-marks-btn"
              >
                {saving ? 'Publishing...' : '📤 Publish Marks'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
