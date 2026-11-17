import { useState, useEffect } from 'react'
import {
  ShieldAlert, Sparkles, Filter, CheckCircle2, Clock, AlertTriangle,
  Building, UserCheck, MessageSquare, Send, RefreshCw, FileText, Download
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import {
  getEscalations, updateEscalationStatus, aiDraftDeanResponse, aiSummarizeAll
} from '../../utils/escalationService'
import { getFullApiUrl } from '../../utils/apiConfig'

export default function StudentEscalationsPage() {
  const [escalations, setEscalations] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRecipient, setSelectedRecipient] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [activeTicket, setActiveTicket] = useState(null)
  const [directiveDraft, setDirectiveDraft] = useState('')
  const [newStatus, setNewStatus] = useState('Action Taken')
  const [aiSummary, setAiSummary] = useState(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  const reloadData = async () => {
    try {
      const local = getEscalations()
      const token = localStorage.getItem('token') || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        const data = await res.json()
        const tickets = Array.isArray(data) ? data : data.tickets || []
        if (tickets.length > 0) {
          const mapped = tickets.map(t => ({
            id: `ESC-2026-${t.id}`,
            recipient: 'Dean of Academic Affairs',
            category: t.category || 'Academic / Attendance',
            priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'High',
            subject: t.subject || 'Student Grievance',
            roomOrCourse: 'General Academic',
            description: t.description || '',
            isAnonymous: false,
            studentId: '22BCE1044',
            studentName: 'Ananya Sharma',
            department: 'Computer Science & Engineering',
            semester: '6th Semester (Section A)',
            status: t.status === 'resolved' ? 'Action Taken' : t.status === 'in_progress' ? 'Under Dean Review' : 'Submitted',
            submittedAt: t.created_at || new Date().toISOString(),
            updatedAt: t.updated_at || new Date().toISOString()
          }))
          const combined = [...local]
          mapped.forEach(m => {
            if (!combined.some(c => c.id === m.id || c.subject === m.subject)) {
              combined.unshift(m)
            }
          })
          setEscalations(combined)
          setAiSummary(aiSummarizeAll(combined))
          return
        }
      }
      setEscalations(local)
      setAiSummary(aiSummarizeAll(local))
    } catch {
      const list = getEscalations()
      setEscalations(list)
      setAiSummary(aiSummarizeAll(list))
    }
  }

  useEffect(() => {
    reloadData()
    const handleUpdate = () => reloadData()
    window.addEventListener('eduflow_escalations_updated', handleUpdate)
    return () => window.removeEventListener('eduflow_escalations_updated', handleUpdate)
  }, [])

  const handleOpenActionModal = (ticket) => {
    setActiveTicket(ticket)
    setNewStatus(ticket.status === 'Submitted' ? 'Under Dean Review' : 'Action Taken')
    setDirectiveDraft(ticket.deanRemarks || aiDraftDeanResponse(ticket))
  }

  const handleGenerateAIDraft = () => {
    if (activeTicket) {
      setDirectiveDraft(aiDraftDeanResponse(activeTicket))
    }
  }

  const handleSaveResolution = (e) => {
    e.preventDefault()
    if (!activeTicket) return

    updateEscalationStatus(activeTicket.id, newStatus, directiveDraft)
    setActiveTicket(null)
    reloadData()
  }

  const handleTriggerAISummarize = () => {
    setIsSummarizing(true)
    setTimeout(() => {
      setAiSummary(aiSummarizeAll(escalations))
      setIsSummarizing(false)
    }, 600)
  }

  const filteredList = escalations.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
    if (selectedRecipient !== 'all' && item.recipient !== selectedRecipient) return false
    if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false
    return true
  })

  return (
    <RolePageTemplate
      role="Faculty"
      title="Dean & Faculty Student Escalations Console"
      description="Executive AI review, categorisation, and resolution suite for student academic and institutional grievances."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>

        {/* Dean Executive Banner */}
        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)',
            color: '#ffffff'
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <span
                  className="badge px-3 py-1 mb-2 font-monospace"
                  style={{
                    background: 'rgba(16,185,129,0.2)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(16,185,129,0.3)',
                    fontSize: '0.75rem'
                  }}
                >
                  EXECUTIVE GOVERNANCE DESK
                </span>
                <h2 className="h4 fw-bold mb-1 text-white">Dean & Faculty Grievance Oversight</h2>
                <p className="text-white-50 small mb-0" style={{ maxWidth: '650px' }}>
                  Live intake of student escalations across CSE, ECE, and Campus Facilities with automated AI root-cause synthesis and formal directive generator.
                </p>
              </div>

              <button
                onClick={handleTriggerAISummarize}
                disabled={isSummarizing}
                className="btn btn-sm fw-bold px-3 py-2 d-flex align-items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.625rem'
                }}
              >
                <Sparkles size={16} />
                {isSummarizing ? 'Synthesizing...' : 'Re-Run AI Leadership Summary'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Executive Summary Card */}
        {aiSummary && (
          <div
            className="card border-0 shadow-sm p-4"
            style={{
              borderRadius: '1.25rem',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h3 className="h6 fw-bold mb-0 d-flex align-items-center gap-2 text-primary">
                <Sparkles size={18} />
                Dean's AI Executive Briefing & Incident Triage
              </h3>
              <span className="small text-muted font-monospace">Generated Real-Time</span>
            </div>

            <p className="small mb-3 text-body-secondary" style={{ lineHeight: 1.6 }}>
              {aiSummary.executiveSummary}
            </p>

            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <div className="p-3 rounded-3 text-center" style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="text-muted small">Total Escalations</div>
                  <div className="h4 fw-bold mb-0 text-primary">{aiSummary.total}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3 text-center" style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="text-muted small">Pending Action</div>
                  <div className="h4 fw-bold mb-0 text-warning">{aiSummary.pending}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3 text-center" style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="text-muted small">Critical Incidents</div>
                  <div className="h4 fw-bold mb-0 text-danger">{aiSummary.critical}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3 text-center" style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="text-muted small">In Review</div>
                  <div className="h4 fw-bold mb-0 text-info">{aiSummary.underReview}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="fw-semibold small text-muted mb-2">Recommended Leadership Directives:</div>
              <ul className="list-unstyled mb-0 d-grid gap-1 small text-muted">
                {aiSummary.recommendedDirectives.map((rec, i) => (
                  <li key={i} className="d-flex align-items-start gap-2">
                    <span className="badge bg-primary-subtle text-primary p-1">DIR-{i+1}</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Operational Filters */}
        <div
          className="card border-0 shadow-sm p-3"
          style={{
            borderRadius: '1.25rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted mb-1">Filter by Category</label>
              <select
                className="form-select form-select-sm"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
              >
                <option value="all">All Categories ({escalations.length})</option>
                <option value="Academic / Attendance">Academic / Attendance</option>
                <option value="Infrastructure & Labs">Infrastructure & Labs</option>
                <option value="Hostel & Campus Facilities">Hostel & Campus Facilities</option>
                <option value="Scholarships & Fees">Scholarships & Fees</option>
                <option value="Wellbeing & Urgent Support">Wellbeing & Urgent Support</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted mb-1">Filter by Recipient</label>
              <select
                className="form-select form-select-sm"
                value={selectedRecipient}
                onChange={e => setSelectedRecipient(e.target.value)}
                style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
              >
                <option value="all">All Addressees</option>
                <option value="Dean of Academic Affairs">Dean of Academic Affairs</option>
                <option value="Dean of Student Welfare">Dean of Student Welfare</option>
                <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                <option value="Course Faculty In-Charge">Course Faculty In-Charge</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted mb-1">Filter by Urgency</label>
              <select
                className="form-select form-select-sm"
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical Priority</option>
                <option value="High">High Priority</option>
                <option value="Normal">Normal Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Tickets List */}
        <div className="d-grid gap-3">
          {filteredList.map(ticket => (
            <div
              key={ticket.id}
              className="card border-0 shadow-sm p-4"
              style={{
                borderRadius: '1.25rem',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 pb-2 border-bottom">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="font-monospace fw-bold text-primary small">{ticket.id}</span>
                  <span className="badge bg-secondary-subtle text-secondary small">{ticket.category}</span>
                  <span className="small text-muted">Addressed to: <strong>{ticket.recipient}</strong></span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`badge ${
                      ticket.priority === 'Critical' ? 'bg-danger' : ticket.priority === 'High' ? 'bg-warning text-dark' : 'bg-info text-dark'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className={`badge ${
                      ticket.status === 'Resolved' ? 'bg-success' : ticket.status === 'Action Taken' ? 'bg-primary' : 'bg-warning text-dark'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-lg-8">
                  <h4 className="h6 fw-bold mb-1">{ticket.subject}</h4>
                  <div className="small text-muted mb-2">
                    Student: <strong>{ticket.studentName}</strong> ({ticket.studentId}) • {ticket.department} ({ticket.semester})
                  </div>
                  <p className="small text-body-secondary mb-3">{ticket.description}</p>

                  {/* AI Triage Card */}
                  {ticket.aiAnalysis && (
                    <div
                      className="p-3 rounded-3 mb-2"
                      style={{
                        background: 'var(--surface-bg)',
                        border: '1px dashed var(--border-color)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-primary d-flex align-items-center gap-1">
                          <Sparkles size={14} /> AI Root Cause & Urgency Index
                        </span>
                        <span className="badge bg-primary-subtle text-primary">Score: {ticket.aiAnalysis.urgencyScore}/100</span>
                      </div>
                      <div className="text-muted mb-1">
                        <strong>Root Cause:</strong> {ticket.aiAnalysis.rootCause}
                      </div>
                      <div className="text-muted">
                        <strong>AI Recommendation:</strong> {ticket.aiAnalysis.suggestedAction}
                      </div>
                    </div>
                  )}

                  {/* Existing Dean Remarks */}
                  {ticket.deanRemarks && (
                    <div
                      className="p-3 rounded-3"
                      style={{
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div className="fw-bold text-success mb-1 d-flex align-items-center gap-1">
                        <UserCheck size={16} /> Official Action Issued by {ticket.recipient}
                      </div>
                      <p className="mb-0 text-success-emphasis">{ticket.deanRemarks}</p>
                    </div>
                  )}
                </div>

                <div className="col-lg-4 d-flex flex-column justify-content-between align-items-end border-start ps-lg-4">
                  <div className="w-100 text-end mb-3">
                    <div className="small text-muted">Submitted</div>
                    <div className="fw-semibold small">{new Date(ticket.submittedAt).toLocaleString()}</div>
                    <div className="small text-muted mt-2">Location/Ref</div>
                    <div className="fw-semibold small">{ticket.roomOrCourse}</div>
                  </div>

                  <button
                    onClick={() => handleOpenActionModal(ticket)}
                    className="btn btn-primary btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  >
                    <Send size={14} />
                    Issue Directive / Update Status
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredList.length === 0 && (
            <div className="card border-0 p-5 text-center text-muted" style={{ background: 'var(--card-bg)' }}>
              No student escalations match the selected filters.
            </div>
          )}
        </div>

        {/* Modal: Issue Dean Resolution Directive */}
        {activeTicket && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              className="card border-0 shadow-lg p-4"
              style={{
                width: '100%',
                maxWidth: '650px',
                background: 'var(--card-bg)',
                borderRadius: '1.25rem',
                border: '1px solid var(--border-color)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                <h3 className="h6 fw-bold mb-0">
                  Issue Dean Directive: <span className="text-primary font-monospace">{activeTicket.id}</span>
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-close"
                  onClick={() => setActiveTicket(null)}
                />
              </div>

              <form onSubmit={handleSaveResolution}>
                <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--surface-bg)', fontSize: '0.8rem' }}>
                  <div className="fw-bold mb-1">{activeTicket.subject}</div>
                  <div className="text-muted">Student: {activeTicket.studentName} ({activeTicket.studentId}) • {activeTicket.department}</div>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label className="form-label small fw-semibold text-muted mb-0">Dean's Official Remarks / Directive</label>
                    <button
                      type="button"
                      onClick={handleGenerateAIDraft}
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold d-flex align-items-center gap-1"
                    >
                      <Sparkles size={14} /> AI Draft Directive
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    className="form-control font-monospace"
                    value={directiveDraft}
                    onChange={e => setDirectiveDraft(e.target.value)}
                    required
                    style={{
                      background: 'var(--surface-bg)',
                      color: 'var(--app-text)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Update Ticket Status</label>
                  <select
                    className="form-select form-select-sm"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="Under Dean Review">Under Dean Review (Officer Investigation)</option>
                    <option value="Action Taken">Action Taken (Executive Order Dispatched)</option>
                    <option value="Resolved">Resolved & Closed (Permanent Rectification)</option>
                  </select>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTicket(null)}
                    className="btn btn-sm btn-outline-secondary px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary px-4 fw-semibold"
                  >
                    Save & Broadcast Directive
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
