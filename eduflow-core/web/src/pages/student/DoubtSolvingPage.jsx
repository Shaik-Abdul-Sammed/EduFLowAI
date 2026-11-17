import { useState } from 'react'
import { ThumbsUp, CheckCircle, Send, HelpCircle, Sparkles } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../utils/apiConfig'

export default function DoubtSolvingPage() {
  const [doubts, setDoubts] = useState([
    {
      id: 1,
      title: 'How does Multi-Version Concurrency Control (MVCC) eliminate read locks in PostgreSQL?',
      subject: 'Database Engineering',
      author: 'Rohit Verma (CSE)',
      upvotes: 14,
      answered: true,
      solution: 'PostgreSQL achieves MVCC by storing tuple transaction visibility fields (xmin and xmax). Readers do not block writers and writers do not block readers.'
    },
    {
      id: 2,
      title: 'Difference between Lamport Logical Clocks and Vector Clocks in network partitioning?',
      subject: 'Distributed Systems',
      author: 'Priya Sen (ECE)',
      upvotes: 9,
      answered: false,
      solution: null
    }
  ])
  const [newTitle, setNewTitle] = useState('')
  const [newSubject, setNewSubject] = useState('Computer Networks')

  const [isAnswering, setIsAnswering] = useState(false)

  const handlePost = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const questionText = newTitle.trim()
    const tempId = Date.now()
    const item = {
      id: tempId,
      title: questionText,
      subject: newSubject,
      author: 'You (Current Student)',
      upvotes: 0,
      answered: false,
      solution: null
    }

    setDoubts(prev => [item, ...prev])
    setNewTitle('')
    setIsAnswering(true)

    try {
      const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || '') : ''
      const res = await fetch(getFullApiUrl('/api/v1/advanced-tech/ai-tutor/ask'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          question: questionText,
          courseCode: newSubject
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.answer) {
          setDoubts(prev => prev.map(d => d.id === tempId ? {
            ...d,
            answered: true,
            solution: data.answer
          } : d))
        }
      }

      // Also dispatch to support tickets queue for faculty mentor visibility
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: `[Doubt Resolution] ${questionText}`,
          description: `Course: ${newSubject} | Technical inquiry posted by student`,
          category: 'academic_doubt',
          priority: 'medium'
        })
      }).catch(() => null)
    } catch (err) {
      console.debug('AI Tutor query failed:', err)
    } finally {
      setIsAnswering(false)
    }
  }

  const handleUpvote = (id) => {
    setDoubts(prev => prev.map(d => d.id === id ? { ...d, upvotes: d.upvotes + 1 } : d))
  }

  return (
    <RolePageTemplate
      role="Student"
      title="Peer & AI Collaborative Doubt Resolution"
      description="Ask questions on difficult course topics, upvote high-yield answers, and receive certified faculty/AI guidance."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <HelpCircle size={18} className="text-primary" /> Post a Technical Question
          </h3>
          <form onSubmit={handlePost} className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold">Course Domain</label>
              <select
                className="form-select"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              >
                <option value="Computer Networks">Computer Networks</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Algorithms & Complexity">Algorithms & Complexity</option>
                <option value="Database Engineering">Database Engineering</option>
              </select>
            </div>
            <div className="col-12 col-md-7">
              <label className="form-label small fw-semibold">Question Details</label>
              <input
                type="text"
                className="form-control"
                placeholder="Explain clearly what you are trying to understand..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-1.5">
                <Send size={14} /> Submit
              </button>
            </div>
          </form>
        </div>

        {/* List of Doubts */}
        <div className="d-flex flex-column gap-3">
          {doubts.map(d => (
            <div key={d.id} className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div className="d-flex gap-3">
                  <button
                    onClick={() => handleUpvote(d.id)}
                    className="btn btn-outline-light border text-dark d-flex flex-column align-items-center p-2 rounded-3"
                    style={{ minWidth: 50 }}
                    aria-label="Upvote question"
                  >
                    <ThumbsUp size={16} className="text-primary mb-1" />
                    <span className="small fw-bold">{d.upvotes}</span>
                  </button>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-primary bg-opacity-10 text-primary">{d.subject}</span>
                      <span className="text-muted small">Asked by {d.author}</span>
                      {d.answered && (
                        <span className="badge bg-success bg-opacity-10 text-success d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Resolved
                        </span>
                      )}
                    </div>
                    <h4 className="h6 fw-bold mb-2">{d.title}</h4>
                    {d.solution && (
                      <div className="p-3 rounded-3 bg-light border-start border-success border-3 small">
                        <strong>Verified Instructor Solution:</strong> {d.solution}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RolePageTemplate>
  )
}
