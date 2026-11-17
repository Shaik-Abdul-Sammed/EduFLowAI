import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const PURPLE = '#7C3AED'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const BLUE = '#2563EB'

export default function Page() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [form, setForm] = useState({
    course: '',
    type: 'midterm',
    date: '',
    time: '10:00 AM - 01:00 PM',
    hall: 'Hall A1 (Main Block)',
    maxMarks: 100
  })

  const fetchExams = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/exams'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load examination schedule (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.data) ? data.data : []
        const mapped = raw.map(e => ({
          id: e.id,
          name: e.course || e.name || 'Assessment',
          subject: e.course || e.subject || 'General Studies',
          type: e.type || (Number(e.maxMarks) <= 25 ? 'unit' : Number(e.maxMarks) <= 50 ? 'final' : 'midterm'),
          date: e.date || new Date().toISOString().split('T')[0],
          time: e.time || '10:00 AM - 01:00 PM',
          hall: e.hall || 'Main Auditorium',
          maxMarks: Number(e.maxMarks) || 100
        }))
        setExams(mapped)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching examination calendar')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchExams(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')

    const parsed = Number(form.maxMarks)
    const numMarks = Number.isNaN(parsed) ? 0 : parsed
    if (!numMarks || numMarks <= 0) {
      setFormError('Max marks must be greater than zero.')
      return
    }

    if (!form.date) {
      setFormError('Please select a valid examination date.')
      return
    }

    if (!form.course.trim()) {
      setFormError('Course / Subject name is required.')
      return
    }

    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/exams'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          course: form.course.trim(),
          date: form.date,
          time: form.time,
          hall: form.hall,
          maxMarks: numMarks,
          type: form.type
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || `Failed to schedule exam (HTTP ${res.status})`)
      }

      setSuccessToast(`Examination paper "${form.course}" scheduled successfully.`)
      setTimeout(() => setSuccessToast(''), 4000)
      setShowForm(false)
      setForm({ course: '', type: 'midterm', date: '', time: '10:00 AM - 01:00 PM', hall: 'Hall A1 (Main Block)', maxMarks: 100 })
      await fetchExams(true)
    } catch (err) {
      setFormError(err.message || 'Error scheduling exam')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/admin/exams/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (res.ok) {
        setSuccessToast(`Exam record cancelled successfully.`)
        setTimeout(() => setSuccessToast(''), 4000)
        await fetchExams(true)
      }
    } catch {
      setExams(prev => prev.filter(x => x.id !== id))
    } finally {
      setConfirmDeleteId(null)
    }
  }

  const filtered = exams.filter(e => {
    const matchesSearch = (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.subject || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.hall || '').toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'ALL' || e.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <RolePageTemplate role="Admin" title="Examination & Seating Scheduler" description="Configure unit tests, schedule mid-terms, allocate exam halls, and publish guidelines.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Success toast */}
        {successToast && (
          <div data-testid="exam-success-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {successToast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="exam-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="exam-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Examination Schedule</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchExams(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Exams Scheduled', value: exams.length, color: PURPLE, icon: '📝' },
                { label: 'Unit Tests', value: exams.filter(e => e.type === 'unit').length, color: BLUE, icon: '⏱️' },
                { label: 'Midterm Papers', value: exams.filter(e => e.type === 'midterm').length, color: AMBER, icon: '📊' },
                { label: 'Final Practicals', value: exams.filter(e => e.type === 'final').length, color: GREEN, icon: '🏆' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2 flex-grow-1 flex-wrap" style={{ maxWidth: '600px' }}>
                  <div className="input-group input-group-sm flex-grow-1" style={{ minWidth: '220px' }}>
                    <span className="input-group-text bg-transparent border-end-0">🔍</span>
                    <input
                      className="form-control border-start-0"
                      placeholder="Search exam, subject, hall..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                        ✕
                      </button>
                    )}
                  </div>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto', minWidth: '130px' }}
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <option value="ALL">All Paper Types</option>
                    <option value="unit">Unit Tests (25M)</option>
                    <option value="midterm">Midterm Exams (100M)</option>
                    <option value="final">Final Practicals (50M)</option>
                  </select>
                </div>
                {!showForm && (
                  <button
                    className="btn btn-sm btn-primary shadow-sm"
                    data-testid="open-exam-form-btn"
                    onClick={() => setShowForm(true)}
                    style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
                  >
                    + Schedule Exam
                  </button>
                )}
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <form onSubmit={handleCreate} data-testid="schedule-exam-form" className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>📅 Publish Exam Assessment Timetable</h3>
                  <button type="button" className="btn-close" onClick={() => { setShowForm(false); setFormError(''); }} aria-label="Close" />
                </div>

                {formError && (
                  <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>COURSE / SUBJECT NAME</label>
                    <input required className="form-control form-control-sm" placeholder="e.g. Mathematics II" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ASSESSMENT CATEGORY</label>
                    <select className="form-select form-select-sm" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      <option value="unit">Unit Assessment</option>
                      <option value="midterm">Midterm Examination</option>
                      <option value="final">Final Practical / Viva</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EXAMINATION DATE</label>
                    <input required type="date" data-testid="exam-date-input" className="form-control form-control-sm" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TIME WINDOW</label>
                    <input required className="form-control form-control-sm" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EXAM HALL / AUDITORIUM</label>
                    <input required className="form-control form-control-sm" value={form.hall} onChange={e => setForm(p => ({ ...p, hall: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>MAX MARKS</label>
                    <input required type="number" min="1" max="200" className="form-control form-control-sm" value={form.maxMarks} onChange={e => setForm(p => ({ ...p, maxMarks: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submitting} data-testid="submit-exam-btn" className="btn btn-sm btn-primary">
                    {submitting ? 'Scheduling...' : 'Schedule Exam'}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Exams Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['Paper ID', 'Course / Subject', 'Type', 'Date & Time', 'Exam Hall', 'Max Marks', 'Action'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr data-testid="exam-empty">
                        <td colSpan="7" className="text-center py-5 text-muted">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                          <div className="fw-semibold">No scheduled exams found</div>
                          <div className="small">Schedule a new examination using the button above.</div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(exam => (
                        <tr key={exam.id}>
                          <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{exam.id}</td>
                          <td>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{exam.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{exam.subject}</div>
                          </td>
                          <td>
                            <span className="badge text-bg-light border text-uppercase" style={{ fontSize: '0.7rem' }}>
                              {exam.type}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>
                            <div>📅 {exam.date}</div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>⏰ {exam.time}</div>
                          </td>
                          <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>🏛️ {exam.hall}</td>
                          <td style={{ fontSize: '0.85rem', fontWeight: 800, color: PURPLE }}>{exam.maxMarks} M</td>
                          <td>
                            {confirmDeleteId === exam.id ? (
                              <div className="d-flex align-items-center gap-1">
                                <button
                                  className="btn btn-sm btn-danger px-2 py-0"
                                  onClick={() => handleDelete(exam.id)}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary px-2 py-0"
                                  onClick={() => setConfirmDeleteId(null)}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-danger px-2 py-0"
                                onClick={() => setConfirmDeleteId(exam.id)}
                                style={{ fontSize: '0.7rem' }}
                              >
                                Cancel
                              </button>
                            )}
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
