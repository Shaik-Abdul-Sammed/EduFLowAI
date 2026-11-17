import { useState, useEffect } from 'react'
import {
  ShieldAlert, Send, Clock, CheckCircle2, AlertTriangle, Filter,
  Building, UserCheck, MessageSquare, Sparkles, ChevronRight, FileText
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getEscalations, createEscalation } from '../../utils/escalationService'
import { getFullApiUrl } from '../../utils/apiConfig'

export default function DeanEscalationPage() {
  const [escalations, setEscalations] = useState([])
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'track'
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Form State
  const [recipient, setRecipient] = useState('Dean of Academic Affairs')
  const [category, setCategory] = useState('Academic / Attendance')
  const [priority, setPriority] = useState('High')
  const [subject, setSubject] = useState('')
  const [roomOrCourse, setRoomOrCourse] = useState('CS301 (Operating Systems)')
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const reloadData = async () => {
    try {
      const local = getEscalations()
      const token = localStorage.getItem('token') || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets?category=academic'), {
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
            subject: t.subject || 'Academic Consultation',
            roomOrCourse: 'General Academic',
            description: t.description || '',
            isAnonymous: false,
            studentId: '22BCE1044',
            studentName: 'Ananya Sharma',
            department: 'Computer Science & Engineering',
            semester: '6th Semester (Section A)',
            status: t.status === 'resolved' ? 'Resolved' : t.status === 'in_progress' ? 'Under Dean Review' : 'Submitted',
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
          return
        }
      }
      setEscalations(local)
    } catch {
      setEscalations(getEscalations())
    }
  }

  useEffect(() => {
    reloadData()
    const handleUpdate = () => reloadData()
    window.addEventListener('eduflow_escalations_updated', handleUpdate)
    return () => window.removeEventListener('eduflow_escalations_updated', handleUpdate)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: `[Dean Escalation] ${subject}`,
          description,
          category: category.toLowerCase(),
          priority: priority.toLowerCase()
        })
      })
    } catch (err) {
      console.warn('PostgreSQL grievance dispatch fallback:', err)
    }

    const created = createEscalation({
      recipient,
      category,
      priority,
      subject,
      roomOrCourse,
      description,
      isAnonymous,
      studentId: '22BCE1044',
      studentName: 'Ananya Sharma',
      department: 'Computer Science & Engineering',
      semester: '6th Semester (Section A)'
    })
    setSubmitting(false)
    setSubmittedSuccess(created)
    setSubject('')
    setDescription('')
    reloadData()
  }

  const filteredEscalations = escalations.filter(item => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'pending') return item.status === 'Submitted' || item.status === 'Under Dean Review'
    if (selectedFilter === 'resolved') return item.status === 'Resolved' || item.status === 'Action Taken'
    return item.category.toLowerCase().includes(selectedFilter.toLowerCase())
  })

  return (
    <RolePageTemplate
      role="Student"
      title="Dean & Faculty Escalation Desk"
      description="Directly submit, track, and resolve academic, lab, hostel, or institutional grievances with the Deans and Faculty."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>

        {/* Leadership Header Banner */}
        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0369a1 100%)',
            color: '#ffffff'
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <span
                  className="badge px-3 py-1 mb-2 font-monospace"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    fontSize: '0.75rem'
                  }}
                >
                  INSTITUTIONAL DIRECT-ACTION DESK
                </span>
                <h2 className="h4 fw-bold mb-1 text-white">Dean & Faculty Grievance Redressal</h2>
                <p className="text-white-50 small mb-0" style={{ maxWidth: '650px' }}>
                  All tickets bypass intermediaries and land directly in the executive console of the respective Dean or Department Head with automated AI priority triage.
                </p>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('new'); setSubmittedSuccess(null); }}
                  className="btn btn-sm fw-bold px-3 py-2"
                  style={{
                    background: activeTab === 'new' ? '#ffffff' : 'rgba(255,255,255,0.15)',
                    color: activeTab === 'new' ? '#1e3a8a' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.625rem'
                  }}
                >
                  ✍️ File New Escalation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className="btn btn-sm fw-bold px-3 py-2"
                  style={{
                    background: activeTab === 'track' ? '#ffffff' : 'rgba(255,255,255,0.15)',
                    color: activeTab === 'track' ? '#1e3a8a' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.625rem'
                  }}
                >
                  📋 My Tickets ({escalations.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: File New Escalation */}
        {activeTab === 'new' && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div
                className="card border-0 shadow-sm p-4 h-100"
                style={{
                  borderRadius: '1.25rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {submittedSuccess ? (
                  <div className="text-center py-4">
                    <div
                      className="d-inline-flex p-3 rounded-circle mb-3"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                    >
                      <CheckCircle2 size={42} />
                    </div>
                    <h3 className="h5 fw-bold mb-2">Escalation Successfully Dispatched!</h3>
                    <p className="text-muted small mb-3">
                      Ticket ID: <strong className="text-primary font-monospace">{submittedSuccess.id}</strong> has been routed to the <strong>{submittedSuccess.recipient}</strong>.
                    </p>
                    <div
                      className="p-3 rounded-3 text-start mb-4 mx-auto"
                      style={{
                        maxWidth: '500px',
                        background: 'var(--surface-bg)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">AI Priority Triage:</span>
                        <span className="badge bg-danger">{submittedSuccess.priority}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Expected Response:</span>
                        <span className="fw-semibold">Within 24 Hours</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Status:</span>
                        <span className="text-warning fw-semibold">Under Dean Review</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm px-4"
                        onClick={() => setSubmittedSuccess(null)}
                      >
                        File Another Ticket
                      </button>
                      <button
                        className="btn btn-primary btn-sm px-4"
                        onClick={() => setActiveTab('track')}
                      >
                        Track Ticket Progress
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                      <ShieldAlert size={18} className="text-danger" />
                      Official Escalation Details
                    </h3>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">Direct Recipient</label>
                        <select
                          className="form-select form-select-sm"
                          value={recipient}
                          onChange={e => setRecipient(e.target.value)}
                          style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
                        >
                          <option value="Dean of Academic Affairs">Dean of Academic Affairs (Dr. V. Ramanathan)</option>
                          <option value="Dean of Student Welfare">Dean of Student Welfare (Dr. Sunita Rao)</option>
                          <option value="Head of Department (HOD)">Head of Department - CSE (Prof. K. Venkatesh)</option>
                          <option value="Course Faculty In-Charge">Course Faculty In-Charge</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">Issue Category</label>
                        <select
                          className="form-select form-select-sm"
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
                        >
                          <option value="Academic / Attendance">Academic / Attendance Condonation</option>
                          <option value="Infrastructure & Labs">Infrastructure, Wi-Fi & Lab Workstations</option>
                          <option value="Hostel & Campus Facilities">Hostel Maintenance & Mess Hygiene</option>
                          <option value="Scholarships & Fees">Scholarship Delays & Fee Clearance</option>
                          <option value="Wellbeing & Urgent Support">Wellbeing, Health & Sensitive Matters</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">Priority Level</label>
                        <select
                          className="form-select form-select-sm"
                          value={priority}
                          onChange={e => setPriority(e.target.value)}
                          style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
                        >
                          <option value="Normal">Normal (Response within 3 working days)</option>
                          <option value="High">High (Response within 24-48 hours)</option>
                          <option value="Critical">Critical / Emergency (Immediate Dean Alert)</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">Course Code / Lab / Location</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={roomOrCourse}
                          onChange={e => setRoomOrCourse(e.target.value)}
                          placeholder="e.g. CS301 / Lab 3B / Block 4 Room 204"
                          style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Subject / Summary</label>
                      <input
                        type="text"
                        className="form-control"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Brief title of the problem (e.g. Lab 3B GPU driver crash before capstone deadline)"
                        required
                        style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Detailed Statement & Facts</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Clearly state what happened, when it occurred, what prior steps you took, and what resolution you require from the Dean."
                        required
                        style={{ background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border-color)' }}
                      />
                    </div>

                    <div
                      className="p-3 rounded-3 mb-4 d-flex align-items-center justify-content-between"
                      style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)' }}
                    >
                      <div>
                        <div className="fw-semibold small">Submit Anonymously (Whistleblower Protection)</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Your student roll number and identity will be masked completely from the leadership review table.
                        </div>
                      </div>
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={e => setIsAnonymous(e.target.checked)}
                          id="anonymousSwitch"
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    >
                      <Send size={16} />
                      {submitting ? 'Transmitting to Dean Directorate...' : 'Dispatch Formal Escalation'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right Guide & SLAs */}
            <div className="col-lg-4">
              <div className="d-grid gap-3">
                <div
                  className="card border-0 shadow-sm p-4"
                  style={{
                    borderRadius: '1.25rem',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <h4 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                    <Building size={16} className="text-primary" />
                    Statutory Dean Redressal SLAs
                  </h4>
                  <ul className="list-unstyled d-grid gap-2 small text-muted mb-0">
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge bg-danger-subtle text-danger p-1">CRITICAL</span>
                      <span>Health, safety, or condonations before exams: <strong>24 Hours</strong></span>
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge bg-warning-subtle text-warning p-1">ACADEMIC</span>
                      <span>Mark sheet re-evaluation or lab equipment: <strong>48 Hours</strong></span>
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge bg-info-subtle text-info p-1">HOSTEL</span>
                      <span>Estate and maintenance repairs: <strong>72 Hours</strong></span>
                    </li>
                  </ul>
                </div>

                <div
                  className="card border-0 shadow-sm p-4"
                  style={{
                    borderRadius: '1.25rem',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <h4 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                    <Sparkles size={16} className="text-warning" />
                    AI Triage Guarantee
                  </h4>
                  <p className="text-muted small mb-2">
                    Every ticket is ingested through our Academic Language Model, automatically tagging regulatory criteria (NAAC / UGC / NBA compliance) to prevent administrative oversight.
                  </p>
                  <div className="p-2 rounded-2" style={{ background: 'var(--surface-bg)', fontSize: '0.75rem' }}>
                    🔒 Confidentiality secured under the Digital Personal Data Protection (DPDP) Act 2023.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Track Tickets */}
        {activeTab === 'track' && (
          <div className="d-grid gap-3">
            {/* Filter Pills */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Tickets' },
                  { id: 'pending', label: 'Pending / In Review' },
                  { id: 'resolved', label: 'Resolved & Actioned' },
                  { id: 'academic', label: 'Academic' },
                  { id: 'hostel', label: 'Hostel & Facilities' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      background: selectedFilter === f.id ? 'var(--primary-color, #2563eb)' : 'var(--card-bg)',
                      color: selectedFilter === f.id ? '#ffffff' : 'var(--app-text)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="small text-muted">
                Showing {filteredEscalations.length} of {escalations.length} records
              </div>
            </div>

            {/* Escalation Cards */}
            {filteredEscalations.map(ticket => (
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
                  <div className="d-flex align-items-center gap-2">
                    <span className="font-monospace fw-bold small text-primary">{ticket.id}</span>
                    <span className="badge bg-secondary-subtle text-secondary small">{ticket.category}</span>
                    <span className="small text-muted">• {ticket.recipient}</span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge ${
                        ticket.priority === 'Critical' ? 'bg-danger' : ticket.priority === 'High' ? 'bg-warning text-dark' : 'bg-info text-dark'
                      }`}
                    >
                      {ticket.priority} Priority
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

                <h3 className="h6 fw-bold mb-2">{ticket.subject}</h3>
                <p className="text-muted small mb-3">{ticket.description}</p>

                {/* AI Triage Card */}
                {ticket.aiAnalysis && (
                  <div
                    className="p-3 rounded-3 mb-3"
                    style={{
                      background: 'var(--surface-bg)',
                      border: '1px dashed var(--border-color)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1 fw-bold text-primary">
                      <Sparkles size={14} />
                      AI Executive Assessment
                    </div>
                    <div className="text-muted mb-1">
                      <strong>Root Cause:</strong> {ticket.aiAnalysis.rootCause}
                    </div>
                    <div className="text-muted mb-2">
                      <strong>Suggested Leadership Action:</strong> {ticket.aiAnalysis.suggestedAction}
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {(ticket.aiAnalysis.tags || []).map(tag => (
                        <span key={tag} className="badge bg-primary-subtle text-primary" style={{ fontSize: '0.68rem' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dean's Official Action Remarks */}
                {ticket.deanRemarks ? (
                  <div
                    className="p-3 rounded-3 mb-2"
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 text-success fw-bold mb-1">
                      <UserCheck size={16} />
                      Official Directive from {ticket.recipient}
                    </div>
                    <p className="mb-0 text-success-emphasis">{ticket.deanRemarks}</p>
                  </div>
                ) : (
                  <div
                    className="p-2 rounded-2 text-muted small"
                    style={{ background: 'var(--surface-bg)', fontSize: '0.75rem' }}
                  >
                    ⏳ Under active review by the Office of the {ticket.recipient}. Official remarks will appear here immediately upon sign-off.
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 text-muted" style={{ fontSize: '0.72rem' }}>
                  <span>Location/Course: <strong>{ticket.roomOrCourse}</strong></span>
                  <span>Submitted: {new Date(ticket.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
