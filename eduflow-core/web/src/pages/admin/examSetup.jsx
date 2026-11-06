import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const PURPLE = '#7C3AED'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const BLUE = '#2563EB'
const RED = '#EF4444'

const initialExams = [
  { id: 'EX01', name: 'Unit Assessment 1', subject: 'Mathematics I', type: 'unit', date: '2026-08-10', time: '10:00 AM - 11:30 AM', hall: 'Hall A1 (Main Block)', maxMarks: 25 },
  { id: 'EX02', name: 'Unit Assessment 1', subject: 'Physics I', type: 'unit', date: '2026-08-11', time: '10:00 AM - 11:30 AM', hall: 'Hall A2 (Science Wing)', maxMarks: 25 },
  { id: 'EX03', name: 'Midterm Examination I', subject: 'Mathematics I', type: 'midterm', date: '2026-09-14', time: '09:30 AM - 12:30 PM', hall: 'Auditorium Complex', maxMarks: 100 },
  { id: 'EX04', name: 'Midterm Examination I', subject: 'Physics I', type: 'midterm', date: '2026-09-15', time: '09:30 AM - 12:30 PM', hall: 'Auditorium Complex', maxMarks: 100 },
  { id: 'EX05', name: 'Semester Practical Viva', subject: 'Physics Lab', type: 'final', date: '2026-11-10', time: '09:00 AM - 04:00 PM', hall: 'Physics Lab 3', maxMarks: 50 },
]

export default function Page() {
  const [exams, setExams] = useState(initialExams)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ name: '', subject: '', type: 'midterm', date: '', time: '10:00 AM - 01:00 PM', hall: 'Hall A1', maxMarks: 100 })

  function handleCreate(e) {
    e.preventDefault()
    setFormError('')

    const numMarks = Number(form.maxMarks)
    if (!numMarks || numMarks <= 0) {
      setFormError('Max marks must be greater than zero.')
      return
    }

    if (!form.date) {
      setFormError('Please select a valid examination date.')
      return
    }

    setExams(prev => [...prev, { ...form, maxMarks: numMarks, id: `EX0${prev.length + 1}` }])
    setShowForm(false)
    setForm({ name: '', subject: '', type: 'midterm', date: '', time: '10:00 AM - 01:00 PM', hall: 'Hall A1', maxMarks: 100 })
  }

  function handleDelete(id) {
    setExams(prev => prev.filter(x => x.id !== id))
    setConfirmDeleteId(null)
  }

  const filtered = exams.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                          e.subject.toLowerCase().includes(search.toLowerCase()) ||
                          e.hall.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'ALL' || e.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <RolePageTemplate role="Admin" title="Examination & Seating Scheduler" description="Configure unit tests, schedule mid-terms, allocate exam halls, and publish guidelines.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

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
                <option value="ALL">All Exam Types</option>
                <option value="unit">Unit Tests</option>
                <option value="midterm">Midterms</option>
                <option value="final">Finals &amp; Labs</option>
              </select>
            </div>
            {!showForm && (
              <button
                className="btn btn-sm btn-primary shadow-sm"
                onClick={() => setShowForm(true)}
                style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
              >
                + Schedule Examination
              </button>
            )}
          </div>
        </div>

        {/* Schedule form */}
        {showForm && (
          <form onSubmit={handleCreate} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>📝 Schedule New Evaluation Session</h3>
              <button type="button" className="btn-close" onClick={() => { setShowForm(false); setFormError(''); }} aria-label="Close" />
            </div>

            {formError && (
              <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EXAMINATION TITLE</label>
                <input required className="form-control form-control-sm" placeholder="e.g. Continuous Assessment 1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SUBJECT NAME</label>
                <input required className="form-control form-control-sm" placeholder="e.g. Structural Engineering" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EVALUATION TIER</label>
                <select className="form-select form-select-sm" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="unit">Unit Assessment</option>
                  <option value="midterm">Midterm Examination</option>
                  <option value="final">Final / Practical Viva</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DATE OF EXAM</label>
                <input required type="date" className="form-control form-control-sm" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TIME WINDOW</label>
                <input className="form-control form-control-sm" placeholder="e.g. 10:00 AM - 01:00 PM" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EXAM HALL</label>
                <input className="form-control form-control-sm" placeholder="e.g. Hall A1 / Aud. 2" value={form.hall} onChange={e => setForm(p => ({ ...p, hall: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>MAX MARKS (MIN 1)</label>
                <input type="number" min="1" max="100" className="form-control form-control-sm" value={form.maxMarks} onChange={e => setForm(p => ({ ...p, maxMarks: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-sm btn-primary">Create Schedule</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Exams List Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Existing Exam Schedules</h2>
            <span className="badge bg-light text-dark border">{filtered.length} configured</span>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['Name', 'Subject', 'Type', 'Date & Time', 'Exam Hall', 'Max Marks', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No exam schedules match your query</div>
                      <div className="small">Try adjusting your search query or evaluation tier.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(exam => (
                    <tr key={exam.id}>
                      <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{exam.name}</td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{exam.subject}</td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '2rem',
                          background: exam.type === 'unit' ? `${BLUE}12` : exam.type === 'midterm' ? `${AMBER}12` : `${GREEN}12`,
                          color: exam.type === 'unit' ? BLUE : exam.type === 'midterm' ? AMBER : GREEN,
                          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {exam.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        📅 {exam.date} &bull; ⏰ {exam.time}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>🏫 {exam.hall}</td>
                      <td style={{ fontWeight: 700 }}>{exam.maxMarks}</td>
                      <td>
                        {confirmDeleteId === exam.id ? (
                          <div className="d-flex align-items-center gap-1">
                            <button className="btn btn-sm btn-danger px-2 py-0" onClick={() => handleDelete(exam.id)} style={{ fontSize: '0.7rem' }}>
                              Confirm
                            </button>
                            <button className="btn btn-sm btn-secondary px-2 py-0" onClick={() => setConfirmDeleteId(null)} style={{ fontSize: '0.7rem' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setConfirmDeleteId(exam.id)}
                            style={{ fontSize: '0.72rem' }}
                            title="Delete exam schedule"
                          >
                            Delete 🗑️
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

      </div>
    </RolePageTemplate>
  )
}
