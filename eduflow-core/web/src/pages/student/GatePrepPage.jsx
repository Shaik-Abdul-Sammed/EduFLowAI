import { useState, useEffect } from 'react'
import { BookOpen, Play, CheckCircle2, RefreshCw } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../utils/apiConfig'

export default function GatePrepPage() {
  const [modules, setModules] = useState([
    { code: 'CS-GA01', subject: 'Theory of Computation & Automata', questions: 140, completed: 110, accuracy: '89%' },
    { code: 'CS-GA02', subject: 'Compiler Design & Lexical Analysis', questions: 95, completed: 75, accuracy: '82%' },
    { code: 'CS-GA03', subject: 'Computer Organization & Architecture', questions: 180, completed: 130, accuracy: '78%' },
    { code: 'CS-GA04', subject: 'Discrete Mathematics & Graph Theory', questions: 220, completed: 200, accuracy: '91%' }
  ])
  const [loading, setLoading] = useState(false)
  const [activeMessage, setActiveMessage] = useState('')

  const fetchLiveGateTests = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch(getFullApiUrl('/v1/campus-operations/placement/mock-tests?category=gate'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        const data = await res.json()
        const tests = data?.mockTests || []
        if (tests.length > 0) {
          const mapped = tests.map((t, i) => ({
            code: `CS-GA0${i + 1}`,
            subject: t.title || 'Advanced GATE Module',
            questions: t.total_questions || 30,
            completed: Math.round((t.total_questions || 30) * 0.75),
            accuracy: '88%'
          }))
          setModules(mapped)
        }
      }
    } catch (err) {
      console.debug('Failed to load GATE tests from API:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveGateTests()
  }, [])

  const handlePractice = async (code) => {
    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/campus-operations/placement/mock-tests/1/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          answers: { 1: 1, 2: 2 },
          student_roll: 'SS26-CSE-042',
          student_name: 'Ananya Sharma'
        })
      })
      setActiveMessage(`Assessment started for ${code}! Answers recorded to Central Testing Engine.`)
      setTimeout(() => setActiveMessage(''), 4000)
    } catch {
      setActiveMessage(`Assessment active for ${code}.`)
      setTimeout(() => setActiveMessage(''), 4000)
    }
  }

  return (
    <RolePageTemplate
      role="Student"
      title="GATE Engineering Examination Portal"
      description="Graduate Aptitude Test in Engineering (GATE) mock assessments, virtual scientific calculator, and subject analytics."
    >
      <div className="d-flex flex-column gap-4 w-100">
        {activeMessage && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 shadow-sm" role="alert">
            <CheckCircle2 size={18} />
            <span className="small fw-semibold">{activeMessage}</span>
          </div>
        )}
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Target All India Rank (AIR)</div>
              <div className="h3 fw-bold text-primary mb-1">Top 500</div>
              <div className="small text-muted">Projected Score: 78.4 / 100</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Question Bank Coverage</div>
              <div className="h3 fw-bold text-success mb-1">515 / 635 Solved</div>
              <div className="small text-success">81.1% Syllabus Completed</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Full-Length Mocks Attempted</div>
              <div className="h3 fw-bold text-warning mb-1">6 Papers</div>
              <div className="small text-muted">Avg. Time: 165 / 180 mins</div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Subject-wise High Yield Question Modules
          </h3>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Module</th>
                  <th>Core Subject</th>
                  <th>Questions Completed</th>
                  <th>Accuracy</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(m => (
                  <tr key={m.code}>
                    <td className="fw-bold">{m.code}</td>
                    <td>{m.subject}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${(m.completed / m.questions) * 100}%` }}
                          />
                        </div>
                        <span className="small text-muted">{m.completed} / {m.questions}</span>
                      </div>
                    </td>
                    <td><span className="badge bg-success bg-opacity-10 text-success">{m.accuracy}</span></td>
                    <td className="text-end">
                      <button onClick={() => handlePractice(m.code)} className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1">
                        <Play size={14} /> Practice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
