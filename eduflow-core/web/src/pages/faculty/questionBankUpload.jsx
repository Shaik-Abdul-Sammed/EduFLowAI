import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const EMERALD = '#059669'

const subjects = ['Physics', 'Chemistry', 'Mathematics']
const difficulties = ['Easy', 'Medium', 'Hard']
const types = ['MCQ', 'Short Answer', 'Long Answer', 'Assertion-Reason', 'Match the Column']

const questionBank = [
  { id: 1, text: 'State Newton\'s second law of motion. Give its mathematical form.', subject: 'Physics', difficulty: 'Medium', type: 'Short Answer', marks: 4, year: '2024' },
  { id: 2, text: 'Derive an expression for kinetic energy of a rotating body.', subject: 'Physics', difficulty: 'Hard', type: 'Long Answer', marks: 8, year: '2024' },
  { id: 3, text: 'The SI unit of electric field intensity is: (A) N (B) N/C (C) C/N (D) V/m', subject: 'Physics', difficulty: 'Easy', type: 'MCQ', marks: 1, year: '2025' },
  { id: 4, text: 'Define molar mass. Calculate the molar mass of H₂SO₄.', subject: 'Chemistry', difficulty: 'Easy', type: 'Short Answer', marks: 3, year: '2025' },
  { id: 5, text: 'Explain hybridisation in methane (CH₄) with a diagram.', subject: 'Chemistry', difficulty: 'Medium', type: 'Long Answer', marks: 6, year: '2024' },
  { id: 6, text: 'Find the derivative of f(x) = x³ + 3x² − 5x + 2.', subject: 'Mathematics', difficulty: 'Medium', type: 'Short Answer', marks: 4, year: '2025' },
]

const diffColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
const typeColor  = { MCQ: '#2563EB', 'Short Answer': '#7C3AED', 'Long Answer': EMERALD, 'Assertion-Reason': '#F97316', 'Match the Column': '#DB2777' }

export default function Page() {
  const [questions, setQuestions] = useState(questionBank)
  const [filterSubject, setFilterSubject] = useState('All')
  const [filterDiff, setFilterDiff]       = useState('All')
  const [showForm, setShowForm]           = useState(false)
  const [form, setForm] = useState({ text: '', subject: 'Physics', difficulty: 'Medium', type: 'MCQ', marks: '2', year: '2026' })
  const [added, setAdded] = useState(false)

  const filtered = questions.filter(q =>
    (filterSubject === 'All' || q.subject === filterSubject) &&
    (filterDiff === 'All' || q.difficulty === filterDiff)
  )

  function addQuestion(e) {
    e.preventDefault()
    const parsedMarks = parseInt(form.marks, 10)
    const marks = Number.isNaN(parsedMarks) || parsedMarks <= 0 ? 1 : parsedMarks
    setQuestions(prev => [{ id: Date.now(), ...form, marks }, ...prev])
    setForm({ text: '', subject: 'Physics', difficulty: 'Medium', type: 'MCQ', marks: '2', year: '2026' })
    setShowForm(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  return (
    <RolePageTemplate role="Faculty" title="Question Bank Upload" description="Manage and upload questions for examinations and weekly tests.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {added && (
          <div style={{ padding: '0.875rem', background: '#10B98110', border: '1px solid #10B98130', borderRadius: '0.875rem', color: '#065f46', fontWeight: 600, fontSize: '0.875rem' }}>
            ✅ Question added to the bank successfully.
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Total Questions', value: questions.length, color: EMERALD },
            { label: 'Subjects',        value: [...new Set(questions.map(q => q.subject))].length, color: '#2563EB' },
            { label: 'Avg Marks',       value: questions.length > 0 ? Math.round(questions.reduce((a, q) => a + (Number(q.marks) || 0), 0) / questions.length) : 0, color: '#F59E0B' },
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
            <div style={{ width: 1, background: '#e2e8f0', margin: '0 0.25rem' }} />
            {['All', ...difficulties].map(d => (
              <button key={d} onClick={() => setFilterDiff(d)} style={{
                padding: '0.35rem 0.8rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem',
                background: filterDiff === d ? (diffColor[d] || '#64748b') : 'rgba(100,116,139,0.1)',
                color: filterDiff === d ? 'white' : (diffColor[d] || '#64748b'), transition: 'all 0.2s',
              }}>{d}</button>
            ))}
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn" style={{
            background: `linear-gradient(135deg,${EMERALD},#0EA5E9)`, color: 'white', border: 'none',
            fontWeight: 700, borderRadius: '0.875rem', boxShadow: `0 4px 14px ${EMERALD}40`,
          }}>
            {showForm ? '✕ Cancel' : '+ Add Question'}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', border: `1px solid ${EMERALD}25` }}>
            <div className="card-body p-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: EMERALD }}>📝 Add New Question</h2>
              <form onSubmit={addQuestion}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.875rem' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>QUESTION TEXT *</label>
                    <textarea required className="form-control" rows={3} placeholder="Enter the question..." value={form.text} onChange={e => setForm(p => ({...p, text: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>SUBJECT</label>
                    <select className="form-select" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}>
                      {subjects.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>TYPE</label>
                    <select className="form-select" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                      {types.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>DIFFICULTY</label>
                    <select className="form-select" value={form.difficulty} onChange={e => setForm(p => ({...p, difficulty: e.target.value}))}>
                      {difficulties.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>MARKS</label>
                    <input type="number" min="1" className="form-control" value={form.marks} onChange={e => setForm(p => ({...p, marks: e.target.value}))} />
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn" style={{ background: `linear-gradient(135deg,${EMERALD},#0EA5E9)`, color: 'white', border: 'none', fontWeight: 700, borderRadius: '0.875rem' }}>
                    ✚ Add to Bank
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Question List */}
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {filtered.map((q, i) => (
            <div key={q.id} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', flexShrink: 0, marginTop: 2 }}>Q{i+1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#1e293b', lineHeight: 1.5 }}>{q.text}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.375rem', background: `${typeColor[q.type] || '#64748b'}12`, color: typeColor[q.type] || '#64748b', fontSize: '0.68rem', fontWeight: 700 }}>{q.type}</span>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.375rem', background: `${diffColor[q.difficulty]}12`, color: diffColor[q.difficulty], fontSize: '0.68rem', fontWeight: 700 }}>{q.difficulty}</span>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.375rem', background: '#f1f5f9', color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>📚 {q.subject}</span>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.375rem', background: '#f1f5f9', color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.375rem', background: '#f1f5f9', color: '#94a3b8', fontSize: '0.68rem' }}>{q.year}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No questions match the selected filters.</div>
          )}
        </div>
      </div>
    </RolePageTemplate>
  )
}
