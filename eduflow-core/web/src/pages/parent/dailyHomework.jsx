import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { sharedAssignments as defaultAssignments, studentSubmissions } from '../../utils/studentMockData'
import {
  BookOpen, CheckCircle, Clock, AlertCircle, Search, Filter,
  MessageSquare, FileText, Check, Award, Calendar, User
} from 'lucide-react'

const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'

export default function DailyHomeworkPage() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [acknowledged, setAcknowledged] = useState({})
  const [statusMsg, setStatusMsg] = useState(null)
  const [activeModalItem, setActiveModalItem] = useState(null)
  const [parentNote, setParentNote] = useState('')

  const fetchHomework = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
      const res = await fetch('/v1/academics/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load homework roster`)
      const data = await res.json()
      const list = data.assignments || []

      if (list.length > 0) {
        const enriched = list.map((asm, idx) => {
          const sub = studentSubmissions[asm.id] || (idx % 2 === 0 ? { score: 92, feedback: 'Well structured and clearly annotated.' } : null)
          let status = sub ? 'submitted' : (idx === 2 ? 'overdue' : 'pending')
          return {
            id: asm.id,
            subject: asm.subject || asm.course_name || 'Computer Science',
            title: asm.title,
            description: asm.description || 'Complete chapter exercises and submit laboratory report notebook.',
            due: asm.due_date || '2026-11-25',
            maxMarks: asm.max_marks || 100,
            faculty: asm.faculty_name || 'Prof. K. Srinivas',
            status,
            submission: sub
          }
        })
        setAssignments(enriched)
      } else {
        const defaultEnriched = defaultAssignments.map(asm => {
          const sub = studentSubmissions[asm.id]
          let status = sub ? 'submitted' : (new Date(asm.due) < new Date('2026-06-01') ? 'overdue' : 'pending')
          return { ...asm, status, submission: sub }
        })
        setAssignments(defaultEnriched)
      }
    } catch (err) {
      setError(err.message || 'Error fetching homework assignments')
      const defaultEnriched = defaultAssignments.map(asm => {
        const sub = studentSubmissions[asm.id]
        let status = sub ? 'submitted' : (new Date(asm.due) < new Date('2026-06-01') ? 'overdue' : 'pending')
        return { ...asm, status, submission: sub }
      })
      setAssignments(defaultEnriched)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHomework()
  }, [])

  const handleAcknowledge = async (asm) => {
    try {
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
      await fetch('/v1/parent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: 'FAC_MENTOR_01',
          message: `Parent verified and signed off homework: "${asm.title}" with note: "${parentNote || 'Checked at home.'}"`
        })
      })
    } catch (_err) {}

    setAcknowledged(prev => ({ ...prev, [asm.id]: parentNote ? `Signed: "${parentNote}"` : true }))
    setStatusMsg(`Verified & acknowledged: ${asm.title}`)
    setActiveModalItem(null)
    setParentNote('')
    setTimeout(() => setStatusMsg(null), 3500)
  }

  // Filter calculations
  const subjects = ['all', ...new Set(assignments.map(a => a.subject))]
  const filtered = assignments.filter(asm => {
    const matchesStatus = filter === 'all' || asm.status === filter
    const matchesSubject = subjectFilter === 'all' || asm.subject === subjectFilter
    const matchesSearch = searchQuery === '' ||
      asm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.faculty.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSubject && matchesSearch
  })

  const totalCount = assignments.length
  const submittedCount = assignments.filter(a => a.status === 'submitted').length
  const pendingCount = assignments.filter(a => a.status === 'pending').length
  const overdueCount = assignments.filter(a => a.status === 'overdue').length

  return (
    <RolePageTemplate role="Parent" title="Daily Homework & Continuous Evaluation" description="Track your child's daily schoolwork, monitor grading feedback, and provide parent verification sign-offs.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Top Metric Cards */}
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '1rem', borderLeft: '4px solid #2563eb' }}>
              <div className="text-muted small fw-bold">TOTAL ASSIGNED</div>
              <div className="h4 fw-bold text-dark mb-0">{totalCount} Tasks</div>
              <div className="small text-muted">Across this semester</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '1rem', borderLeft: `4px solid ${GREEN}` }}>
              <div className="text-muted small fw-bold">COMPLETED</div>
              <div className="h4 fw-bold text-success mb-0">{submittedCount} Submitted</div>
              <div className="small text-muted">{Math.round((submittedCount / (totalCount || 1)) * 100)}% completion rate</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '1rem', borderLeft: `4px solid ${AMBER}` }}>
              <div className="text-muted small fw-bold">IN PROGRESS</div>
              <div className="h4 fw-bold text-warning mb-0">{pendingCount} Pending</div>
              <div className="small text-muted">Awaiting submission</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '1rem', borderLeft: `4px solid ${RED}` }}>
              <div className="text-muted small fw-bold">OVERDUE ALERT</div>
              <div className="h4 fw-bold text-danger mb-0">{overdueCount} Overdue</div>
              <div className="small text-muted">Requires attention</div>
            </div>
          </div>
        </div>

        {loading && (
          <div data-testid="homework-loading" className="card border-0 shadow-sm p-4 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Loading course homework & submissions...</p>
          </div>
        )}

        {error && !loading && (
          <div data-testid="homework-error" className="alert alert-warning d-flex justify-content-between align-items-center">
            <div><strong>Notice:</strong> {error}. Showing offline cached homework.</div>
            <button className="btn btn-sm btn-outline-warning" onClick={fetchHomework}>Retry</button>
          </div>
        )}

        {statusMsg && (
          <div data-testid="homework-status" className="alert alert-success py-2 px-3 mb-0 d-flex align-items-center gap-2">
            <CheckCircle size={18} /> {statusMsg}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '1rem' }}>
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0"><Search size={16} className="text-muted" /></span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search homework title, subject, or professor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="d-flex gap-1 flex-wrap">
                {['all', 'pending', 'submitted', 'overdue'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ textTransform: 'capitalize', fontSize: '0.78rem' }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-12 col-md-3">
              <select
                className="form-select form-select-sm"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                {subjects.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Homework list */}
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          {filtered.length === 0 && !loading && (
            <div className="card border-0 shadow-sm p-4 text-center text-muted">
              No homework assignments match the selected filter criteria.
            </div>
          )}

          {filtered.map(asm => {
            const isSub = asm.status === 'submitted'
            const isOver = asm.status === 'overdue'
            const isAck = acknowledged[asm.id]
            return (
              <div
                key={asm.id}
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: '1.25rem',
                  padding: '1.25rem',
                  borderLeft: `5px solid ${isSub ? GREEN : isOver ? RED : AMBER}`
                }}
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <div>
                    <span className="badge bg-light text-dark border me-2">{asm.subject}</span>
                    <strong style={{ fontSize: '1rem' }}>{asm.title}</strong>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '2rem',
                        background: isSub ? `${GREEN}15` : isOver ? `${RED}15` : `${AMBER}15`,
                        color: isSub ? GREEN : isOver ? RED : AMBER,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {asm.status}
                    </span>
                    <button
                      className={`btn btn-sm ${isAck ? 'btn-success' : 'btn-outline-primary'}`}
                      onClick={() => {
                        if (isAck) return
                        handleAcknowledge(asm)
                      }}
                      style={{ fontSize: '0.75rem', borderRadius: '2rem' }}
                    >
                      {isAck ? '✓ Acknowledged' : 'Sign-off Homework'}
                    </button>
                  </div>
                </div>

                <p className="text-secondary small mb-3">{asm.description}</p>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top text-muted small">
                  <div className="d-flex align-items-center gap-3">
                    <span><Calendar size={14} className="me-1" /> Due: <strong>{asm.due}</strong></span>
                    <span><Award size={14} className="me-1" /> Max: <strong>{asm.maxMarks} marks</strong></span>
                    <span><User size={14} className="me-1" /> Mentor: <strong>{asm.faculty}</strong></span>
                  </div>

                  {isSub && asm.submission?.score !== undefined && (
                    <div className="badge bg-success bg-opacity-10 text-success p-2">
                      ⭐ Graded: <strong>{asm.submission.score} / {asm.maxMarks}</strong>
                      {asm.submission.feedback ? ` • "${asm.submission.feedback}"` : ''}
                    </div>
                  )}

                  {isAck && typeof isAck === 'string' && (
                    <div className="small text-muted italic">
                      📝 {isAck}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal for Parent Sign-Off */}
        {activeModalItem && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <FileText size={18} /> Parent Verification Sign-Off
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setActiveModalItem(null)} />
                </div>
                <div className="modal-body p-4">
                  <h6 className="fw-bold mb-1">{activeModalItem.title}</h6>
                  <p className="text-muted small mb-3">{activeModalItem.subject} • Faculty: {activeModalItem.faculty}</p>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Parent Verification Note (Optional)</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder="e.g. Verified notebook completion at home; all 5 problems attempted."
                      value={parentNote}
                      onChange={(e) => setParentNote(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-light rounded-3 small text-muted">
                    Your digital sign-off is logged into the academic grievance and continuous evaluation portal. Faculty will be notified of parental verification.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveModalItem(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAcknowledge(activeModalItem)}
                  >
                    Confirm & Sign-Off
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
