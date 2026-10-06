import { Link } from 'react-router-dom'
import {
  Cpu,
  Bell,
  AlertTriangle,
  ArrowRight,
  Smartphone,
  RefreshCw
} from 'lucide-react'

export default function AttendanceExplainerPage() {
  const steps = [
    {
      step: '01',
      title: 'Multi-Modal Data Ingestion',
      icon: Cpu,
      desc: 'EduFlow connects to campus biometric hardware (eSSL, ZKTeco), existing ERP databases (MySQL, Oracle, Fedena), or accepts daily CSV roll-call registers uploaded by non-teaching staff.',
    },
    {
      step: '02',
      title: 'Canonical Normalization',
      icon: RefreshCw,
      desc: 'Incoming raw punch logs, timestamped clock-ins, or spreadsheet entries are instantly cleaned and normalized into a single canonical attendance schema linked to student roll numbers.',
    },
    {
      step: '03',
      title: 'Statutory Defaulter Risk Detection',
      icon: AlertTriangle,
      desc: 'Our real-time engine compares cumulative attendance against statutory AICTE/UGC 75% thresholds and predicts student dropout risk weeks before semester examinations.',
    },
    {
      step: '04',
      title: 'Automated Parental Alert Dispatch',
      icon: Bell,
      desc: 'When a student dips below 75%, HODs and academic staff can trigger automated SMS and WhatsApp notices to parents with one click, preserving a full compliance audit trail.',
    },
  ]

  return (
    <div className="bg-light min-vh-100">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm py-3 px-4">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold fs-4 text-primary">
            EduFlow<span className="text-dark">AI</span>
          </Link>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-secondary btn-sm">Sign In</Link>
            <Link to="/for-colleges" className="btn btn-primary btn-sm">Request Demo</Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="py-5 bg-white border-bottom text-center">
        <div className="container" style={{ maxWidth: '820px' }}>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 mb-3">
            Multi-Modal Institutional Attendance Architecture
          </span>
          <h1 className="display-5 fw-bold text-dark mb-3">
            How Attendance Ingestion Works
          </h1>
          <p className="lead text-muted mb-4">
            Zero hardware replacement. Zero migration downtime. EduFlow bridges biometric time clocks, classroom register sheets, and campus ERPs to give administrators real-time compliance oversight.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/onboarding" className="btn btn-primary px-4 py-2 shadow-sm">
              Connect Campus Attendance <ArrowRight size={16} className="ms-1" />
            </Link>
            <Link to="/why-eduflow" className="btn btn-outline-secondary px-4 py-2">
              Why EduFlow AI
            </Link>
          </div>
        </div>
      </section>

      {/* Ingestion Steps */}
      <section className="py-5">
        <div className="container" style={{ maxWidth: '960px' }}>
          <div className="row g-4">
            {steps.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden">
                    <span className="display-4 fw-bold text-light position-absolute top-0 end-0 pe-3 pt-2 user-select-none opacity-50">
                      {item.step}
                    </span>
                    <div className="p-3 rounded-circle bg-primary-subtle text-primary d-inline-block mb-3" style={{ width: 'fit-content' }}>
                      <Icon size={24} />
                    </div>
                    <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                    <p className="text-muted small mb-0">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Parental Dispatch Simulation */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="text-center mb-4">
            <h3 className="fw-bold text-dark">Statutory Parental Communication Channel</h3>
            <p className="text-muted small">
              Sample compliance alert dispatched to parents when attendance drops below the 75% cutoff:
            </p>
          </div>

          <div className="card border-0 shadow-sm bg-light p-4 mx-auto" style={{ maxWidth: '580px' }}>
            <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-2">
              <Smartphone size={24} className="text-success" />
              <div>
                <strong className="text-dark small d-block">Official SMS / WhatsApp Alert</strong>
                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Sender: SSIT-EDUNOTIFY &bull; Delivered</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-3 border small text-dark font-monospace">
              Dear Parent, this is an official academic notice from Sri Siddhartha Institute of Technology. Your ward Aarav Patel (Roll: 2023CSE01) has an attendance of 64.2% in Semester V, which is below the mandatory 75% UGC/University requirement. Please meet the CSE HOD before 15th October to avoid exam debarment.
            </div>
            <div className="mt-3 d-flex justify-content-between align-items-center small text-muted">
              <span>Timestamp: Auto-generated on biometric sync</span>
              <span className="badge bg-success-subtle text-success">Compliant with AICTE norms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-5 text-center">
        <div className="container">
          <h4 className="fw-bold mb-3">Ready to eliminate attendance blind spots?</h4>
          <Link to="/for-colleges" className="btn btn-primary px-4 py-2 shadow-sm">
            Talk to an EduFlow Solutions Architect
          </Link>
        </div>
      </section>
    </div>
  )
}
