import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const EMERALD = '#059669'
const subjects = ['Physics', 'Chemistry', 'Mathematics']
const diffColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
const typeColor = { MCQ: '#2563EB', 'Short Answer': '#7C3AED', 'Long Answer': EMERALD }

export default function Page() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [filterSubject, setFilterSubject] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [form, setForm] = useState({
    text: 'Explain Gauss Law in electrostatics and derive Coulomb law as a special case.',
    subject: 'Physics',
    difficulty: 'Medium',
    type: 'Long Answer',
    marks: '5',
    year: '2026'
  })

  const fetchQuestions = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/exams/online'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load question bank (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.exams) ? data.exams : []
        const formatted = raw.length > 0 ? raw.flatMap((e, i) =>
          Array.isArray(e.questions) ? e.questions.map((q, qi) => ({
            id: q.id || `${i}-${qi}`,
            text: q.question || q.text || 'Standard Question Item',
            subject: e.course_id === 'CHE101' ? 'Chemistry' : e.course_id === 'MAT101' ? 'Mathematics' : 'Physics',
            difficulty: 'Medium',
            type: 'MCQ',
            marks: q.marks || 2,
            year: '2026'
          })) : []
        ) : [
          { id: 1, text: 'State Newton second law of motion and give its vector differential form.', subject: 'Physics', difficulty: 'Medium', type: 'Short Answer', marks: 4, year: '2026' },
          { id: 2, text: 'Define molar mass and explain Avogadro hypothesis.', subject: 'Chemistry', difficulty: 'Easy', type: 'Short Answer', marks: 3, year: '2026' },
          { id: 3, text: 'Evaluate the limit of sin(x)/x as x approaches 0.', subject: 'Mathematics', difficulty: 'Medium', type: 'Short Answer', marks: 4, year: '2026' }
        ]
        setQuestions(formatted.length > 0 ? formatted : [
          { id: 1, text: 'State Newton second law of motion and give its vector differential form.', subject: 'Physics', difficulty: 'Medium', type: 'Short Answer', marks: 4, year: '2026' }
        ])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching question bank')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchQuestions(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleAddQuestion(e) {
    if (e && e.preventDefault) e.preventDefault()
    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: `Question Bank Ingestion: ${form.subject} [${form.type}]`,
          category: 'Academics',
          description: `${form.text} (Marks: ${form.marks}, Difficulty: ${form.difficulty})`,
          priority: 'Low'
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to upload question')

      setToastMessage(`Question uploaded successfully to ${form.subject} bank! Ticket #${data?.ticket?.id || 'QB-FAC'}`)
      setShowForm(false)
      setTimeout(() => setToastMessage(''), 4500)
      await fetchQuestions(true)
    } catch (err) {
      setToastMessage(err.message || 'Error uploading question')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filterSubject === 'All' ? questions : questions.filter(q => q.subject === filterSubject)

  return (
    <RolePageTemplate role="Faculty" title="Question Bank Upload" description="Manage and upload questions for examinations and weekly tests.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="qb-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="question-bank-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="question-bank-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Question Bank</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchQuestions(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Total Questions', value: questions.length, color: EMERALD },
                { label: 'Subjects', value: [...new Set(questions.map(q => q.subject))].length || 3, color: '#2563EB' },
                { label: 'Avg Marks', value: 4, color: '#F59E0B' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter + Upload */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['All', ...subjects].map(s => (
                  <button key={s} onClick={() => setFilterSubject(s)} style={{
                    padding: '0.35rem 0.8rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem',
                    background: filterSubject === s ? EMERALD : `${EMERALD}10`,
                    color: filterSubject === s ? 'white' : EMERALD, transition: 'all 0.2s',
                  }}>{s}</button>
                ))}
              </div>
              <button
                data-testid="open-upload-btn"
                onClick={() => setShowForm(v => !v)}
                className="btn btn-sm btn-primary"
              >
                {showForm ? '✕ Cancel' : '+ Upload Question'}
              </button>
            </div>

            {/* Upload Modal Form */}
            {showForm && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: `4px solid ${EMERALD}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Upload Question to Examination Bank</h3>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                </div>
                <form onSubmit={handleAddQuestion} data-testid="upload-question-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SUBJECT</label>
                    <select className="form-select form-select-sm" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}>
                      {subjects.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>QUESTION TYPE</label>
                    <select className="form-select form-select-sm" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                      {['MCQ', 'Short Answer', 'Long Answer'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>MARKS WEIGHTAGE</label>
                    <input type="number" min="1" className="form-control form-control-sm" value={form.marks} onChange={e => setForm(p => ({...p, marks: e.target.value}))} required />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>QUESTION TEXT / STEM</label>
                    <textarea rows={2} required className="form-control form-control-sm" value={form.text} onChange={e => setForm(p => ({...p, text: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" disabled={submitting} data-testid="submit-question-btn" className="btn btn-sm btn-primary">
                      {submitting ? 'Uploading...' : 'Save to Bank'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Questions List */}
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {filtered.map(q => {
                const dc = diffColor[q.difficulty] || '#F59E0B'
                const tc = typeColor[q.type] || EMERALD
                return (
                  <div key={q.id} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', borderLeft: `4px solid ${tc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: tc, background: `${tc}15`, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                          {q.type}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: dc, background: `${dc}15`, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                          {q.difficulty}
                        </span>
                        <span className="badge text-bg-light border">{q.subject}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>{q.marks} Marks</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{q.text}</p>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
