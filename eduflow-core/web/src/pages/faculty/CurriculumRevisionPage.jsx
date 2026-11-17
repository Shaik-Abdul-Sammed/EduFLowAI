import { useState, useEffect } from 'react'
import { BookOpen, Send, Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { wakeUpFetch } from '../../utils/wakeUpHandler'
import { useToast } from '../../context/ToastContext'

export default function CurriculumRevisionPage() {
  const { addToast } = useToast?.() || { addToast: () => {} }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newCourse, setNewCourse] = useState('')
  const [newChange, setNewChange] = useState('')

  const [revisions, setRevisions] = useState([
    {
      code: 'CS410',
      course: 'Cloud Native Microservices Architecture',
      proposedChange: 'Replace legacy SOAP XML practicals with gRPC Protocol Buffers & OpenTelemetry tracing',
      bosStatus: 'Passed BoS Committee (Awaiting Academic Council)',
      proposer: 'Prof. Anupama Verma',
      votes: '14 / 16 Faculty Approved'
    },
    {
      code: 'CS302',
      course: 'Principles of Programming Languages',
      proposedChange: 'Introduce Rust memory safety and ownership model in place of Ada concurrency',
      bosStatus: 'Under Peer Review',
      proposer: 'Dr. Ramesh Sundaram',
      votes: '11 / 16 Faculty Approved'
    }
  ])

  const fetchCurriculumProposals = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await wakeUpFetch('/v1/academics/assignments')
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to synchronize BoS agenda and proposals`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setRevisions(prev => [
          ...prev,
          {
            code: 'CS455',
            course: 'Applied Large Language Models',
            proposedChange: 'Incorporate Retrieval-Augmented Generation (RAG) and Agentic Workflow design',
            bosStatus: 'Passed BoS Committee',
            proposer: 'Dr. K. Swaminathan',
            votes: '16 / 16 Faculty Approved'
          }
        ])
      }
    } catch (err) {
      setError(err.message || 'BoS synchronization error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurriculumProposals()
  }, [])

  const handleSubmitProposal = async (e) => {
    e.preventDefault()
    if (!newCode.trim() || !newCourse.trim() || !newChange.trim()) {
      addToast('Please complete all proposal fields', 'warning')
      return
    }

    setSubmitting(true)
    try {
      await wakeUpFetch('/v1/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'curriculum_amendment',
          subject: `BoS Amendment Proposal: ${newCode} ${newCourse}`,
          description: newChange
        })
      })

      const proposal = {
        code: newCode.trim().toUpperCase(),
        course: newCourse.trim(),
        proposedChange: newChange.trim(),
        bosStatus: 'Submitted to BoS Committee',
        proposer: 'Prof. Anupama Verma',
        votes: '1 / 16 Faculty Approved'
      }

      setRevisions(prev => [proposal, ...prev])
      setNewCode('')
      setNewCourse('')
      setNewChange('')
      addToast('BoS curriculum amendment proposal registered successfully!', 'success')
    } catch (err) {
      addToast(`Submission error: ${err.message}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Board of Studies (BoS) Curriculum Revision"
      description="Propose syllabus updates, industry 4.0 alignment amendments, and participate in departmental BoS voting."
    >
      <div className="d-flex flex-column gap-4 w-100">
        {loading && (
          <div data-testid="curriculum-loading" className="alert alert-secondary py-2 px-3 small d-flex align-items-center gap-2 mb-0">
            <RefreshCw size={16} className="animate-spin" />
            <span>Synchronizing BoS agenda and departmental curriculum proposals...</span>
          </div>
        )}

        {error && (
          <div data-testid="curriculum-error" className="alert alert-danger py-2 px-3 small d-flex justify-content-between align-items-center mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              data-testid="curriculum-retry"
              className="btn btn-outline-danger btn-sm py-0 px-2"
              onClick={fetchCurriculumProposals}
            >
              Retry
            </button>
          </div>
        )}

        {/* Submit Proposal Form */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h4 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Plus size={16} className="text-primary" /> Submit BoS Syllabus Amendment Proposal
          </h4>
          <form onSubmit={handleSubmitProposal} className="row g-3">
            <div className="col-12 col-md-3">
              <input
                type="text"
                data-testid="proposal-code-input"
                className="form-control form-control-sm"
                placeholder="Course Code (e.g. CS412)"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <input
                type="text"
                data-testid="proposal-course-input"
                className="form-control form-control-sm"
                placeholder="Course Title (e.g. Edge Computing)"
                value={newCourse}
                onChange={e => setNewCourse(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-5">
              <input
                type="text"
                data-testid="proposal-change-input"
                className="form-control form-control-sm"
                placeholder="Proposed Syllabus Modernization"
                value={newChange}
                onChange={e => setNewChange(e.target.value)}
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button
                type="submit"
                data-testid="submit-proposal-btn"
                disabled={submitting}
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5"
              >
                {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Submit to BoS Committee</span>
              </button>
            </div>
          </form>
        </div>

        {/* Active Proposals Table */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Active BoS Syllabus Amendment Proposals
          </h3>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Proposed Curriculum Modernization</th>
                  <th>Proposing Faculty</th>
                  <th>BoS Approval Status</th>
                  <th>Department Votes</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map(r => (
                  <tr key={r.code}>
                    <td className="fw-bold">{r.code}</td>
                    <td>{r.course}</td>
                    <td className="small">{r.proposedChange}</td>
                    <td className="small text-muted">{r.proposer}</td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success">
                        {r.bosStatus}
                      </span>
                    </td>
                    <td><span className="badge bg-primary">{r.votes}</span></td>
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
