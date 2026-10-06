import React, { useState } from 'react'
import {
  HelpCircle,
  Search,
  BookOpen,
  Video,
  Send,
  CheckCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react'

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [ticket, setTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [ticketSuccess, setTicketSuccess] = useState('')
  const [ticketError, setTicketError] = useState('')

  const faqs = [
    { q: 'How do I start onboarding my college?', a: 'Administrators can navigate to /admin-dashboard/onboarding to complete the 6-step setup covering profile, departments, faculty, and student roster imports.' },
    { q: 'Can non-teaching staff generate and publish timetables?', a: 'Staff members with delegated DRAFT permissions can prepare schedule updates, but changes are routed to the HOD dashboard for mandatory approval before publishing.' },
    { q: 'What AI models power the officers?', a: 'EduFlow AI supports Google Gemini 1.5/2.0, OpenAI GPT-4o, Anthropic Claude 3.5, and local Ollama deployments with automatic offline fallback templates.' },
    { q: 'How does the 2026 Academic Calendar handle state holidays?', a: 'The calendar generator incorporates gazetted central holidays and state festival holidays (Karnataka, Telangana, AP, Tamil Nadu, Maharashtra).' },
    { q: 'What happens if we extend vacation dates?', a: 'The calendar engine automatically recalculates downstream internal exams and semester end dates by the exact extension delta.' },
    { q: 'How are attendance shortage warnings calculated?', a: 'The system flags any student with attendance below 75% for mandatory remedial notice and below 60% for academic detention alerts.' },
    { q: 'Can we upload our existing Excel timetable?', a: 'Yes! Navigate to /timetable/upload to import your schedule. Our engine checks 4 delta rules to resolve clashes automatically.' },
    { q: 'Are NAAC SSR reports aligned with the 2024 revised framework?', a: 'Yes. All 7 criteria generate specific qualitative descriptions, quantitative tables, and evidence checklists matching current NAAC RAF standards.' },
    { q: 'How does UPI collection work without payment gateway charges?', a: 'Institutions input their official UPI ID in Settings. Tax invoices generate dynamic UPI links and QR codes with zero transaction deductions.' },
    { q: 'How do administrators export all college data?', a: 'Click "Download My Data" in Institution Settings to receive a verified ZIP archive containing all CSV rosters and JSON schedules.' },
    { q: 'Is the platform compliant with the DPDP Act 2023?', a: 'Yes. EduFlow implements data minimization, sovereign data hosting in India, and complete institutional data portability guarantees.' },
    { q: 'How does session timeout protect administrative accounts?', a: 'Sessions automatically terminate after the configured inactivity window (default 30 minutes) requiring re-authentication.' },
    { q: 'Can we restrict admin login to college campus IPs?', a: 'Yes. Administrators can configure an optional IP Whitelist in Institution Settings.' },
    { q: 'What password strength is enforced on signup?', a: 'Minimum 10 characters with at least one uppercase letter, one lowercase letter, one digit, and one special character.' },
    { q: 'How do HODs review pending staff drafts?', a: 'Pending drafts appear in the HOD Dashboard with full diff inspection and one-click "Approve" or "Reject" buttons.' },
    { q: 'Can we simulate our portal connection without live API keys?', a: 'Yes. The SIS Connection page features a "Use Demo Portal" mode utilizing pre-seeded institutional records.' },
    { q: 'Where can we monitor system health and database latency?', a: 'Superadmins can view live ping, CPU load, and error trends at /admin-dashboard/system-health.' },
    { q: 'How often are automated backup integrity checks performed?', a: 'A nightly verification worker confirms database snapshot validity and logs results to monitoring events.' },
    { q: 'Can students access the AI officer administrative tools?', a: 'No. AI officer generation and administrative workflows are strictly guarded by role permissions for Admins, HODs, and authorized Staff.' },
    { q: 'Who do we contact if we encounter a critical system issue?', a: 'Submit a high-priority ticket below or contact our 24/7 priority support line at support@eduflow.ai.' }
  ]

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTicketSubmit = async (e) => {
    e.preventDefault()
    setTicketError('')
    setTicketSuccess('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/v1/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket')

      setTicketSuccess(`Support ticket #${data.ticket?.id || 'SUBMITTED'} created successfully! Our team will respond shortly.`)
      setTicket({ subject: '', category: 'general', priority: 'medium', description: '' })
    } catch (err) {
      setTicketError(err.message || 'Submission error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: '960px' }}>
      {/* Hero */}
      <div className="text-center mb-5">
        <h1 className="fw-bold d-flex align-items-center justify-content-center">
          <HelpCircle className="me-2 text-primary" /> EduFlow Help & Support Center
        </h1>
        <p className="text-muted">Guides, video tutorials, and technical support for institutional administrators.</p>

        {/* Search */}
        <div className="mx-auto mt-4" style={{ maxWidth: '600px' }}>
          <div className="input-group input-group-lg shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <Search size={20} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search guides, FAQs, or troubleshooting tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 5-Step Getting Started Walkthrough */}
      <div className="card shadow-sm border-0 p-4 bg-white mb-5">
        <h4 className="fw-bold mb-3 d-flex align-items-center">
          <BookOpen className="me-2 text-primary" /> Getting Started: 5-Step Quickstart
        </h4>
        <div className="row g-3">
          {[
            { step: '1', title: 'Complete Onboarding', desc: 'Configure college profile and academic department codes.' },
            { step: '2', title: 'Import Faculty & Students', desc: 'Batch import rosters using official CSV templates.' },
            { step: '3', title: 'Generate 2026 Calendar', desc: 'Sync state gazetted holidays and term boundaries.' },
            { step: '4', title: 'Delegate Staff Access', desc: 'Grant coordinators draft permissions with approval safeguards.' },
            { step: '5', title: 'Run AI Officers', desc: 'Draft NAAC SSR reports and generate conflict-free timetables.' }
          ].map((item) => (
            <div key={item.step} className="col-md">
              <div className="p-3 border rounded h-100 bg-light">
                <div className="badge bg-primary mb-2">Step {item.step}</div>
                <h6 className="fw-bold mb-1">{item.title}</h6>
                <small className="text-muted">{item.desc}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Tutorials Grid */}
      <div className="card shadow-sm border-0 p-4 bg-white mb-5">
        <h4 className="fw-bold mb-3 d-flex align-items-center">
          <Video className="me-2 text-primary" /> Video Masterclasses
        </h4>
        <div className="row g-3">
          {[
            { title: 'Accreditation Officer: Criteria 1–7 Walkthrough', duration: '8 min' },
            { title: 'Timetable Scheduling & Delta Clashes Resolution', duration: '6 min' },
            { title: 'Staff Delegation & HOD Approval Gateways', duration: '5 min' },
            { title: 'Attendance Shortage Analytics & Student Alerts', duration: '7 min' }
          ].map((vid, idx) => (
            <div key={idx} className="col-md-6">
              <div className="border rounded p-3 bg-light d-flex align-items-center">
                <div className="bg-secondary text-white rounded d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '45px' }}>
                  <Video size={20} />
                </div>
                <div>
                  <h6 className="fw-semibold mb-1">{vid.title}</h6>
                  <small className="text-muted">Video Tutorial • {vid.duration}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="card shadow-sm border-0 p-4 bg-white mb-5">
        <h4 className="fw-bold mb-3">Frequently Asked Questions ({filteredFaqs.length})</h4>
        <div className="accordion" id="faqAccordion">
          {filteredFaqs.map((faq, idx) => (
            <div className="accordion-item" key={idx}>
              <h2 className="accordion-header" id={`heading${idx}`}>
                <button
                  className="accordion-button collapsed fw-semibold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${idx}`}
                  aria-expanded="false"
                  aria-controls={`collapse${idx}`}
                >
                  {faq.q}
                </button>
              </h2>
              <div id={`collapse${idx}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body text-muted" style={{ lineHeight: '1.6' }}>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Ticket Submission */}
      <div className="card shadow-sm border-0 p-4 bg-white">
        <h4 className="fw-bold mb-3 d-flex align-items-center">
          <MessageSquare className="me-2 text-primary" /> Contact Institutional Support
        </h4>
        <p className="text-muted">Our dedicated technical engineering desk resolves institutional tickets within 2 hours.</p>

        {ticketSuccess && (
          <div className="alert alert-success d-flex align-items-center mb-3">
            <CheckCircle size={18} className="me-2" />
            {ticketSuccess}
          </div>
        )}

        {ticketError && (
          <div className="alert alert-danger d-flex align-items-center mb-3">
            <AlertCircle size={18} className="me-2" />
            {ticketError}
          </div>
        )}

        <form onSubmit={handleTicketSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Subject / Issue Summary</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Question regarding Odd Semester holiday sync"
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Category</label>
              <select
                className="form-select"
                value={ticket.category}
                onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
              >
                <option value="general">General Inquiry</option>
                <option value="calendar">Academic Calendar</option>
                <option value="timetable">Timetable Scheduling</option>
                <option value="accreditation">NAAC/NBA Accreditation</option>
                <option value="billing">Invoicing & UPI</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Priority</label>
              <select
                className="form-select"
                value={ticket.priority}
                onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Detailed Description</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Describe the issue, steps to reproduce, or support requested..."
                value={ticket.description}
                onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                required
              />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-primary d-inline-flex align-items-center" disabled={submitting}>
                <Send size={16} className="me-1" /> {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
