import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const CYAN = '#06B6D4'
const weeks = ['Week 1 (May 5–10)', 'Week 2 (May 12–17)', 'Week 3 (May 19–24)']
const subjects = ['Mathematics', 'Physics', 'Chemistry']

const statusColor = { done: '#10B981', 'in-progress': '#F59E0B', pending: '#94a3b8' }
const statusIcon = { done: '✅', 'in-progress': '🔄', pending: '⏳' }

export default function Page() {
  const [week, setWeek] = useState(weeks[0])
  const [subject, setSubject] = useState('Mathematics')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ day: 'Mon', topic: 'Vector Calculus & Divergence', resources: 'Textbook Ch. 4', status: 'pending' })

  const fetchLessons = async (isMounted = true) => {
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
        throw new Error(`Failed to load lesson plans (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.assignments) ? data.assignments : []
        const formatted = raw.length > 0 ? raw.map((a, i) => ({
          id: a.id || i,
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i % 5],
          topic: a.title || 'Curriculum Module',
          resources: a.description || 'Reference Guide',
          status: i % 2 === 0 ? 'done' : 'in-progress'
        })) : [
          { id: 1, day: 'Mon', topic: 'Introduction to Derivatives', resources: 'Textbook Ch.5', status: 'done' },
          { id: 2, day: 'Tue', topic: 'Rules of Differentiation', resources: 'Textbook Ch.5, Worksheet A', status: 'done' },
          { id: 3, day: 'Wed', topic: 'Chain Rule and Applications', resources: 'Textbook Ch.6', status: 'in-progress' }
        ]
        setLessons(formatted)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error connecting to curriculum server')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchLessons(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleAddLesson(e) {
    if (e && e.preventDefault) e.preventDefault()
    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/academics/assignments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: `${subject}: ${form.topic}`,
          course_id: subject === 'Mathematics' ? 'MAT101' : subject === 'Physics' ? 'PHY101' : 'CHE101',
          faculty_id: 101,
          description: form.resources,
          due_date: '2026-05-30'
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to add lesson')

      setToastMessage(`Lesson plan "${form.topic}" saved successfully for ${subject}!`)
      setShowForm(false)
      setTimeout(() => setToastMessage(''), 4500)
      await fetchLessons(true)
    } catch (err) {
      setToastMessage(err.message || 'Error saving lesson plan')
    } finally {
      setSubmitting(false)
    }
  }

  const doneCount = lessons.filter(l => l.status === 'done').length

  return (
    <RolePageTemplate role="Faculty" title="Lesson Planner" description="Plan, schedule, and track lesson progress by subject and week.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="lesson-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="lesson-planner-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="lesson-planner-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Lesson Plans</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchLessons(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-4">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Week</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {weeks.map(w => (
                        <button key={w} onClick={() => setWeek(w)} style={{
                          padding: '0.4rem 0.8rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                          background: week === w ? CYAN : `${CYAN}12`,
                          color: week === w ? 'white' : CYAN, transition: 'all 0.2s',
                        }}>{w.split(' ')[0]} {w.split(' ')[1]}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Subject</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {subjects.map(s => (
                        <button key={s} onClick={() => setSubject(s)} style={{
                          padding: '0.4rem 0.8rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                          background: subject === s ? `linear-gradient(135deg,${CYAN},#2563EB)` : `${CYAN}12`,
                          color: subject === s ? 'white' : CYAN, transition: 'all 0.2s',
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <button
                    data-testid="open-add-lesson-btn"
                    onClick={() => setShowForm(v => !v)}
                    className="btn btn-sm btn-primary"
                    style={{ alignSelf: 'flex-end' }}
                  >
                    {showForm ? '✕ Close' : '+ Add Lesson'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            {showForm && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: `4px solid ${CYAN}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Schedule New Lesson Plan for {subject}</h3>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                </div>
                <form onSubmit={handleAddLesson} data-testid="lesson-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DAY</label>
                    <select className="form-select form-select-sm" value={form.day} onChange={e => setForm(p => ({...p, day: e.target.value}))}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TOPIC</label>
                    <input className="form-control form-control-sm" required value={form.topic} onChange={e => setForm(p => ({...p, topic: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>RESOURCES / CHAPTER</label>
                    <input className="form-control form-control-sm" required value={form.resources} onChange={e => setForm(p => ({...p, resources: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" disabled={submitting} data-testid="submit-lesson-btn" className="btn btn-sm btn-primary">
                      {submitting ? 'Saving...' : 'Save Lesson'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lesson List */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>📚 {subject} — Syllabus Modules</h2>
                <span className="badge text-bg-light border">{doneCount}/{lessons.length} Completed</span>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {lessons.map((item, idx) => {
                  const color = statusColor[item.status] || '#94a3b8'
                  return (
                    <div key={item.id || idx} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem',
                      borderRadius: '0.875rem', background: `${color}06`, border: `1px solid ${color}20`,
                      borderLeft: `4px solid ${color}`
                    }}>
                      <div style={{ fontWeight: 800, color: '#64748b', width: 40 }}>{item.day}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.topic}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📖 {item.resources}</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>
                        {statusIcon[item.status]} {item.status.toUpperCase()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
