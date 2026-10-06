import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react'

export default function WhyEduFlowPage() {
  const comparisonData = [
    {
      capability: 'Non-teaching staff access',
      excel: 'Unrestricted file access',
      chatgpt: 'N/A',
      erp: 'Fixed role, no granularity',
      edtech: 'Fixed role',
      eduflow: 'Granular per-officer permissions',
    },
    {
      capability: 'Permission delegation',
      excel: 'No',
      chatgpt: 'No',
      erp: 'No',
      edtech: 'No',
      eduflow: 'Dean/HOD grants specific officer access',
    },
    {
      capability: 'Approval workflow',
      excel: 'Email back-and-forth',
      chatgpt: 'No',
      erp: 'No',
      edtech: 'No',
      eduflow: 'Built-in approve/reject with audit',
    },
    {
      capability: 'Daily usage limits',
      excel: 'No',
      chatgpt: 'No',
      erp: 'No',
      edtech: 'No',
      eduflow: 'Configurable per staff per officer',
    },
    {
      capability: 'Activity log',
      excel: 'No',
      chatgpt: 'No',
      erp: 'Basic',
      edtech: 'No',
      eduflow: 'Full log with prompts and outcomes',
    },
    {
      capability: 'Academic calendar',
      excel: 'Manual Excel',
      chatgpt: 'No',
      erp: 'Static',
      edtech: 'Static',
      eduflow: 'Government-synced, AI-generated',
    },
    {
      capability: 'Timetable reuse',
      excel: 'Copy-paste',
      chatgpt: 'No',
      erp: 'Manual',
      edtech: 'No',
      eduflow: 'Change detection + regenerate',
    },
    {
      capability: 'HOD workflow',
      excel: 'Manual',
      chatgpt: 'No',
      erp: 'Basic',
      edtech: 'No',
      eduflow: 'AI assistant + staff approvals',
    },
    {
      capability: 'Portal reader',
      excel: 'N/A',
      chatgpt: 'N/A',
      erp: 'Single portal',
      edtech: 'Single portal',
      eduflow: 'Reads 8 portal types without migration',
    },
    {
      capability: 'Deployment',
      excel: 'N/A',
      chatgpt: 'N/A',
      erp: '3-6 months',
      edtech: 'Weeks',
      eduflow: 'Instant cloud / on-premise',
    },
  ]

  return (
    <div className="bg-light min-vh-100">
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm py-3 px-4">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold fs-4 text-primary">
            EduFlow<span className="text-dark">AI</span>
          </Link>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-secondary btn-sm">Sign In</Link>
            <Link to="/for-colleges" className="btn btn-primary btn-sm">Request 30-Day Pilot</Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="py-5 bg-white border-bottom text-center">
        <div className="container" style={{ maxWidth: '860px' }}>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 mb-3">
            Why Indian Educational Institutions Choose EduFlow AI OS
          </span>
          <h1 className="display-5 fw-bold text-dark mb-3">
            Not Just an ERP. An Autonomous AI Team for Your Campus.
          </h1>
          <p className="lead text-muted mb-4">
            Traditional ERPs are static database entry forms that take months to set up. General LLMs hallucinate and leak campus data. EduFlow AI OS gives your Deans and HODs 5 specialized AI Officers with a delegated staff permission system that guarantees compliance, accuracy, and auditability.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/for-colleges" className="btn btn-primary px-4 py-2 fw-semibold shadow-sm">
              Start Free 30-Day Pilot <ArrowRight size={16} className="ms-1" />
            </Link>
            <Link to="/demo/observe" className="btn btn-outline-secondary px-4 py-2 fw-semibold">
              Watch 3-Min AI Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="h3 fw-bold text-dark">Platform Capability Matrix</h2>
            <p className="text-muted small">
              How EduFlow AI OS compares against manual processes, raw ChatGPT, legacy ERPs, and standard EdTech apps.
            </p>
          </div>

          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark small text-uppercase">
                  <tr>
                    <th style={{ width: '22%' }}>Capability</th>
                    <th style={{ width: '15%' }}>Manual Excel</th>
                    <th style={{ width: '13%' }}>ChatGPT</th>
                    <th style={{ width: '18%' }}>Traditional ERP</th>
                    <th style={{ width: '15%' }}>Existing EdTech</th>
                    <th style={{ width: '17%', backgroundColor: '#2563EB', color: '#fff' }}>EduFlow AI OS</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-dark">{row.capability}</td>
                      <td className="text-muted">{row.excel}</td>
                      <td className="text-muted">{row.chatgpt}</td>
                      <td className="text-muted">{row.erp}</td>
                      <td className="text-muted">{row.edtech}</td>
                      <td className="fw-bold text-primary bg-primary-subtle">
                        <CheckCircle2 size={14} className="text-primary me-1 d-inline" />
                        {row.eduflow}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3 bg-light border h-100">
                <div className="p-3 rounded-circle bg-primary-subtle text-primary d-inline-block mb-3">
                  <Shield size={24} />
                </div>
                <h4 className="h5 fw-bold text-dark mb-2">Non-Teaching Staff Delegation</h4>
                <p className="small text-muted mb-0">
                  Deans and HODs can delegate timetable building, attendance logging, and accreditation filing to office assistants without giving them unrestricted administrator power. Staff drafts require one-click HOD approval.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3 bg-light border h-100">
                <div className="p-3 rounded-circle bg-success-subtle text-success d-inline-block mb-3">
                  <Clock size={24} />
                </div>
                <h4 className="h5 fw-bold text-dark mb-2">Academic Calendar Intelligence</h4>
                <p className="small text-muted mb-0">
                  Government gazetted holidays are synchronized automatically. Semesters are structured to guarantee AICTE/UGC 90-day minimum teaching norms. Mid-term exams, practical assessments, and vacations adjust in real time.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3 bg-light border h-100">
                <div className="p-3 rounded-circle bg-warning-subtle text-warning d-inline-block mb-3">
                  <Layers size={24} />
                </div>
                <h4 className="h5 fw-bold text-dark mb-2">Zero-Migration Ingestion</h4>
                <p className="small text-muted mb-0">
                  Reads from MySQL, PostgreSQL, Oracle, Fedena, Campus365, Classpro, and biometric time clocks. Institutions keep their existing infrastructure while EduFlow AI adds intelligence on top.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-5 text-center">
        <div className="container" style={{ maxWidth: '640px' }}>
          <h2 className="h3 fw-bold text-dark mb-3">Ready to Modernize Your Campus Administration?</h2>
          <p className="text-muted small mb-4">
            Join forward-thinking colleges across India automating accreditation, scheduling, and student success.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/for-colleges" className="btn btn-primary btn-lg px-4 shadow-sm">
              Schedule Dean Briefing
            </Link>
            <Link to="/onboarding" className="btn btn-outline-secondary btn-lg px-4">
              Self-Guided Onboarding
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
