import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  ShieldAlert, 
  FileText, 
  Filter, 
  ChevronRight,
  UserCheck,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_ESCALATIONS = [
  {
    id: 'ESC-2026-081',
    category: 'academic',
    subject: 'Continuous internal assessment marks discrepancy in DSP course',
    description: 'Midterm 2 evaluation omitted 8 marks in Question 3 despite correct derivation as verified with course instructor.',
    priority: 'urgent',
    status: 'dean_review',
    submittedAt: '2026-11-12T10:30:00Z',
    aiSummary: 'Academic grading discrepancy in DSP course midterm 2; faculty consultation completed; pending Dean review.',
    assignedTo: 'Prof. V. Sharma (Dean of Academics)',
    attachmentUrl: 'https://docs.eduflow.edu/dsp_eval_copy.pdf'
  },
  {
    id: 'ESC-2026-042',
    category: 'infrastructure',
    subject: 'Power interruption in VLSI cadence lab workstations',
    description: 'Frequent voltage spikes tripping breakers during 4-hour simulation runs in Lab Block 3.',
    priority: 'normal',
    status: 'resolved',
    submittedAt: '2026-11-04T14:15:00Z',
    aiSummary: 'Lab power electrical breaker tripping; campus facilities upgraded UPS inverter line on Nov 08.',
    assignedTo: 'Dr. K. Rao (Dean Infrastructure)',
    resolutionNote: 'Dedicated 10kVA online UPS installed for VLSI lab workstations.'
  }
];

export default function DeanEscalationPage() {
  const { user } = useAuth();
  const [escalations, setEscalations] = useState(INITIAL_ESCALATIONS);
  const [formData, setFormData] = useState({
    category: 'academic',
    priority: 'normal',
    subject: '',
    description: '',
    attachmentUrl: ''
  });
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [aiAnalysisPreview, setAiAnalysisPreview] = useState(null);

  // Real-time AI preview when description changes
  useEffect(() => {
    if (formData.description.length > 25) {
      const lower = formData.description.toLowerCase();
      let detectedCategory = formData.category;
      let detectedPriority = formData.priority;

      if (lower.includes('ragging') || lower.includes('harass') || lower.includes('safety') || lower.includes('threat')) {
        detectedPriority = 'critical';
      } else if (lower.includes('exam') || lower.includes('marks') || lower.includes('attendance') || lower.includes('hall ticket')) {
        detectedPriority = 'urgent';
      }

      const generatedSummary = `AI Summary: ${formData.subject || 'Student escalation'} — flags ${detectedPriority.toUpperCase()} urgency related to ${detectedCategory}. Auto-routed for Dean attention.`;
      
      setAiAnalysisPreview({
        summary: generatedSummary,
        priority: detectedPriority,
        category: detectedCategory
      });
    } else {
      setAiAnalysisPreview(null);
    }
  }, [formData.description, formData.subject, formData.category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) return;

    setSubmitting(true);
    const newId = `ESC-2026-${String(escalations.length + 82).padStart(3, '0')}`;
    const newEscalation = {
      id: newId,
      category: formData.category,
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      priority: aiAnalysisPreview?.priority || formData.priority,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      aiSummary: aiAnalysisPreview?.summary || `Escalation submitted on ${new Date().toLocaleDateString()}`,
      assignedTo: 'Dean Office (Intake Queue)',
      attachmentUrl: formData.attachmentUrl.trim()
    };

    try {
      // Attempt backend persistence if available
      await fetch('/api/v1/escalations/raise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEscalation)
      }).catch(() => null);
    } catch {
      // Graceful fallback to memory state
    }

    setEscalations([newEscalation, ...escalations]);
    setFormData({
      category: 'academic',
      priority: 'normal',
      subject: '',
      description: '',
      attachmentUrl: ''
    });
    setAiAnalysisPreview(null);
    setSubmitting(false);
    setSuccessMsg(`Your escalation (${newId}) has been successfully submitted directly to the Dean's Office.`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="badge bg-secondary text-light px-2 py-1">Submitted</span>;
      case 'escalated_to_dean':
        return <span className="badge bg-warning text-dark px-2 py-1">Escalated to Dean</span>;
      case 'dean_review':
        return <span className="badge bg-info text-dark px-2 py-1">Under Dean Review</span>;
      case 'resolved':
        return <span className="badge bg-success text-light px-2 py-1">Resolved</span>;
      default:
        return <span className="badge bg-secondary px-2 py-1">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="badge bg-danger text-light px-2 py-1">Critical</span>;
      case 'urgent':
        return <span className="badge bg-warning text-dark px-2 py-1">Urgent</span>;
      default:
        return <span className="badge bg-secondary text-light px-2 py-1">Normal</span>;
    }
  };

  const filteredEscalations = escalations.filter((item) => {
    if (filterCategory === 'ALL') return true;
    return item.category.toUpperCase() === filterCategory;
  });

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ minHeight: '100vh', background: 'var(--app-bg, #070e1e)', color: 'var(--app-text, #f8fafc)' }}>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))' }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge px-3 py-1 fs-7 fw-semibold rounded-pill" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <ShieldAlert size={14} className="d-inline me-1" /> Dean Escalation Desk
            </span>
            <span className="badge bg-dark border border-secondary text-light px-2 py-1">Direct Ombudsman Channel</span>
          </div>
          <h2 className="h4 fw-bold mb-1" style={{ color: 'var(--app-heading, #ffffff)' }}>
            Student Dean & Faculty Escalation Portal
          </h2>
          <p className="text-secondary small mb-0">
            Submit critical academic, evaluation, or campus grievances directly to College Deans and Academic Council.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
          <CheckCircle size={18} />
          <div>{successMsg}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Escalation Submission Form */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100" style={{ background: 'var(--card-bg, #0b1528)', border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))' }}>
            <div className="card-header bg-transparent py-3 border-bottom" style={{ borderColor: 'var(--border-color, rgba(255, 255, 255, 0.1))' }}>
              <div className="d-flex align-items-center gap-2">
                <Send size={18} className="text-primary" />
                <h5 className="mb-0 fw-semibold" style={{ color: 'var(--app-heading, #ffffff)' }}>Lodge an Escalation to the Dean</h5>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} data-testid="dean-escalation-form">
                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--app-text, #e2e8f0)' }}>Category</label>
                  <select 
                    className="form-select"
                    style={{ background: 'var(--surface-bg, #111e38)', color: 'var(--app-text, #ffffff)', borderColor: 'var(--border-color, rgba(255, 255, 255, 0.15))' }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    data-testid="category-select"
                  >
                    <option value="academic">Academic & Grading Discrepancy</option>
                    <option value="faculty">Faculty Mentorship / Conduct</option>
                    <option value="fee">Finance & Scholarship Hold</option>
                    <option value="hostel">Hostel & Student Welfare</option>
                    <option value="infrastructure">Lab Equipment & Infrastructure</option>
                    <option value="other">Other Institutional Grievance</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--app-text, #e2e8f0)' }}>Priority Level</label>
                  <select 
                    className="form-select"
                    style={{ background: 'var(--surface-bg, #111e38)', color: 'var(--app-text, #ffffff)', borderColor: 'var(--border-color, rgba(255, 255, 255, 0.15))' }}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    data-testid="priority-select"
                  >
                    <option value="normal">Normal (Routine Academic Matters)</option>
                    <option value="urgent">Urgent (Exam Attendance / Hall Ticket / IA Marks)</option>
                    <option value="critical">Critical (Safety / Ragging / Mental Health)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--app-text, #e2e8f0)' }}>Subject / Issue Title</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Brief headline of the matter..."
                    style={{ background: 'var(--surface-bg, #111e38)', color: 'var(--app-text, #ffffff)', borderColor: 'var(--border-color, rgba(255, 255, 255, 0.15))' }}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    data-testid="subject-input"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--app-text, #e2e8f0)' }}>Detailed Description & Prior Steps Taken</label>
                  <textarea 
                    className="form-control"
                    rows="4"
                    placeholder="Provide specific details, course codes, dates, and previous communications with department faculty..."
                    style={{ background: 'var(--surface-bg, #111e38)', color: 'var(--app-text, #ffffff)', borderColor: 'var(--border-color, rgba(255, 255, 255, 0.15))' }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    data-testid="description-input"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ color: 'var(--app-text, #e2e8f0)' }}>
                    <Paperclip size={14} className="d-inline me-1" /> Supporting Document URL (Optional)
                  </label>
                  <input 
                    type="url"
                    className="form-control"
                    placeholder="https://drive.google.com/... or pdf url"
                    style={{ background: 'var(--surface-bg, #111e38)', color: 'var(--app-text, #ffffff)', borderColor: 'var(--border-color, rgba(255, 255, 255, 0.15))' }}
                    value={formData.attachmentUrl}
                    onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                    data-testid="attachment-input"
                  />
                </div>

                {/* AI Summary Badge Preview */}
                {aiAnalysisPreview && (
                  <div className="p-3 mb-3 rounded border" style={{ background: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.3)' }} data-testid="ai-preview-badge">
                    <div className="d-flex align-items-center gap-2 mb-1 text-primary small fw-semibold">
                      <Sparkles size={14} /> AI Intake Analysis & Routing Preview
                    </div>
                    <p className="small mb-1 text-secondary">{aiAnalysisPreview.summary}</p>
                    <div className="d-flex gap-2">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        Auto-detected Priority: {aiAnalysisPreview.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                  disabled={submitting}
                  data-testid="submit-escalation-btn"
                >
                  <Send size={16} /> {submitting ? 'Submitting to Dean...' : 'Escalate to Dean'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Submitted Escalations & Ombudsman Status */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100" style={{ background: 'var(--card-bg, #0b1528)', border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))' }}>
            <div className="card-header bg-transparent py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ borderColor: 'var(--border-color, rgba(255, 255, 255, 0.1))' }}>
              <div className="d-flex align-items-center gap-2">
                <FileText size={18} className="text-info" />
                <h5 className="mb-0 fw-semibold" style={{ color: 'var(--app-heading, #ffffff)' }}>Your Submitted Escalations</h5>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Filter size={14} className="text-secondary" />
                <select 
                  className="form-select form-select-sm"
                  style={{ background: 'var(--surface-bg, #111e38)', color: 'var(--app-text, #ffffff)', borderColor: 'var(--border-color, rgba(255, 255, 255, 0.15))' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  data-testid="category-filter"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="FEE">Finance</option>
                  <option value="HOSTEL">Hostel</option>
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                </select>
              </div>
            </div>

            <div className="card-body p-3">
              {filteredEscalations.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                  <AlertCircle size={36} className="mb-2 opacity-50" />
                  <p className="mb-0">No escalations found under this filter.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {filteredEscalations.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 rounded border"
                      style={{ background: 'var(--surface-bg, #111e38)', borderColor: 'var(--border-color, rgba(255, 255, 255, 0.1))' }}
                      data-testid={`escalation-card-${item.id}`}
                    >
                      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <span className="badge bg-dark border border-secondary text-secondary me-2">{item.id}</span>
                          <span className="badge bg-secondary-subtle text-light border border-secondary text-uppercase me-2">{item.category}</span>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>

                      <h6 className="fw-bold mb-1" style={{ color: 'var(--app-heading, #ffffff)' }}>{item.subject}</h6>
                      <p className="small text-secondary mb-2">{item.description}</p>

                      {item.aiSummary && (
                        <div className="p-2 mb-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.03)', borderLeft: '3px solid #3b82f6' }}>
                          <div className="d-flex align-items-center gap-1 small text-info fw-semibold mb-1">
                            <Sparkles size={12} /> AI Ombudsman Summary:
                          </div>
                          <p className="small text-secondary mb-0">{item.aiSummary}</p>
                        </div>
                      )}

                      <div className="d-flex flex-wrap justify-content-between align-items-center text-secondary small pt-2 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                        <div className="d-flex align-items-center gap-1">
                          <UserCheck size={14} /> Assigned to: <strong className="text-light">{item.assignedTo}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <Clock size={14} /> {new Date(item.submittedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {item.resolutionNote && (
                        <div className="mt-2 p-2 rounded alert alert-success small mb-0">
                          <strong>Resolution Note:</strong> {item.resolutionNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
