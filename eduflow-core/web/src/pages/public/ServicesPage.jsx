import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  UserCheck,
  Calendar,
  UserPlus,
  DollarSign,
  Home,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react'

const AUTOMATION_SERVICES = [
  {
    id: 'accreditation',
    title: 'NAAC/NBA Report Automation',
    tagline: 'Self Study Reports (SSR) generated in 72 hours with audit-grade criterion metrics.',
    officer: 'Accreditation Officer',
    icon: FileText,
    price: '₹50,000',
    color: '#7C3AED',
    bgLight: 'rgba(124, 58, 237, 0.08)',
    features: ['Criterion 1-7 SSR Generation', 'Quantitative Metric Verification', 'Gap Analysis & Action Plan', 'Executive IQAC Summary PDF'],
    comingSoon: false,
  },
  {
    id: 'student-success',
    title: 'Student Dropout Risk Report',
    tagline: 'Predict at-risk students before exams with early warning attendance and grade analytics.',
    officer: 'Student Success Officer',
    icon: UserCheck,
    price: '₹15,000',
    color: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.08)',
    features: ['Attendance & Grade Pattern Scan', 'Intervention Urgency Matrix', 'Mentor Action Directives', 'Department Retention Forecast'],
    comingSoon: false,
  },
  {
    id: 'timetable',
    title: 'Timetable Generator',
    tagline: 'Automated conflict-free scheduling across faculty workloads, rooms, and labs.',
    officer: 'Timetable Officer',
    icon: Calendar,
    price: '₹20,000',
    color: '#2563EB',
    bgLight: 'rgba(37, 99, 235, 0.08)',
    features: ['Room & Lab Constraint Solver', 'Faculty Load Balancing', 'Clash-Free Master Grid', 'Export to PDF & Excel'],
    comingSoon: false,
  },
  {
    id: 'admissions',
    title: 'Admission Yield Predictor',
    tagline: 'Analyze applicant cohorts and forecast enrollment yield with AI targeting.',
    officer: 'Admissions Officer',
    icon: UserPlus,
    price: '₹15,000',
    color: '#10B981',
    bgLight: 'rgba(16, 185, 129, 0.08)',
    features: ['Application Pool Scoring', 'Demographic & Regional Trends', 'Conversion Funnel Analytics', 'Targeted Outreach Strategy'],
    comingSoon: false,
  },
  {
    id: 'finance',
    title: 'Fee Reconciliation',
    tagline: 'Instant ledger reconciliation, UPI/Bank matching, and defaulter surveillance.',
    officer: 'Finance Officer',
    icon: DollarSign,
    price: '₹10,000',
    color: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.08)',
    features: ['Automated Bank Statement Match', 'Defaulter Aging List', 'Cashflow Projection', 'GST-Ready Audit Trail'],
    comingSoon: false,
  },
  {
    id: 'hostel',
    title: 'Hostel Occupancy Optimizer',
    tagline: 'Dynamic room allocation, mess management, and curfew compliance tracking.',
    officer: 'Hostel Officer',
    icon: Home,
    price: '₹25,000',
    color: '#06B6D4',
    bgLight: 'rgba(6, 182, 212, 0.08)',
    features: ['Smart Bed Allocation', 'Mess Usage Analytics', 'Gate Pass & Attendance Sync', 'Maintenance Workflow Tracking'],
    comingSoon: true,
  },
  {
    id: 'placement',
    title: 'Placement Readiness Report',
    tagline: 'Skill-gap assessments, interview benchmark scoring, and campus recruiter matching.',
    officer: 'Placement Officer',
    icon: Briefcase,
    price: '₹30,000',
    color: '#EC4899',
    bgLight: 'rgba(236, 72, 153, 0.08)',
    features: ['Resume & Skill Matrix Score', 'Mock Interview Sentiment Analysis', 'Recruiter Alignment Forecast', 'Batch Readiness Index'],
    comingSoon: true,
  },
]

export default function ServicesPage() {
  const [filter, setFilter] = useState('all')

  const filtered = AUTOMATION_SERVICES.filter((svc) => {
    if (filter === 'active') return !svc.comingSoon
    if (filter === 'upcoming') return svc.comingSoon
    return true
  })

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'var(--app-bg, #f8fafc)' }}>
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 sticky-top shadow-sm">
        <div className="container-xl">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
              <Building size={20} />
            </div>
            <span className="fw-bold fs-4" style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EduFlow AI
            </span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <Link to="/for-colleges" className="btn btn-outline-primary rounded-pill px-4 btn-sm">
              Custom Inquiry
            </Link>
            <Link to="/login" className="btn btn-primary rounded-pill px-4 btn-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container-xl text-center py-4">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563EB', fontSize: '0.85rem', fontWeight: 700 }}>
            <Sparkles size={16} /> Autonomous Administrative Workflows
          </div>
          <h1 className="fw-extrabold display-5 mb-3" style={{ color: '#0f172a', fontWeight: 900 }}>
            Specialized AI Automation Services for Colleges
          </h1>
          <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: 720 }}>
            Deploy targeted AI Officers for your specific operational bottleneck. Available as standalone, turnkey deliverables with zero implementation hassle.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm rounded-pill px-4 ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            >
              All Services ({AUTOMATION_SERVICES.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`btn btn-sm rounded-pill px-4 ${filter === 'active' ? 'btn-primary' : 'btn-outline-secondary'}`}
            >
              Ready Now (5)
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`btn btn-sm rounded-pill px-4 ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline-secondary'}`}
            >
              Coming Soon (2)
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-5 flex-grow-1">
        <div className="container-xl">
          <div className="row g-4">
            {filtered.map((service) => {
              const Icon = service.icon
              return (
                <div key={service.id} className="col-12 col-md-6 col-lg-4">
                  <div
                    className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column"
                    style={{
                      background: '#ffffff',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      border: '1px solid #e2e8f0',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div className="p-4 flex-grow-1">
                      {/* Top Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: 48,
                            height: 48,
                            background: service.bgLight,
                            color: service.color,
                          }}
                        >
                          <Icon size={24} />
                        </div>
                        {service.comingSoon ? (
                          <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-3 py-1">
                            <Clock size={12} className="me-1" /> Coming Soon
                          </span>
                        ) : (
                          <span
                            className="badge rounded-pill px-3 py-1"
                            style={{ background: service.bgLight, color: service.color, border: `1px solid ${service.color}40` }}
                          >
                            Turnkey Pilot
                          </span>
                        )}
                      </div>

                      <div className="small fw-bold text-uppercase mb-1" style={{ color: service.color, letterSpacing: '0.05em' }}>
                        {service.officer}
                      </div>
                      <h3 className="h5 fw-bold text-dark mb-2">{service.title}</h3>
                      <p className="text-muted small mb-4" style={{ minHeight: '40px' }}>
                        {service.tagline}
                      </p>

                      {/* Pricing */}
                      <div className="p-3 rounded-3 mb-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <div className="small text-muted mb-1">Starting Turnkey Pilot Price</div>
                        <div className="d-flex align-items-baseline gap-1">
                          <span className="fs-4 fw-bold text-dark">{service.price}</span>
                          <span className="small text-muted">/ package + GST</span>
                        </div>
                      </div>

                      {/* Deliverables List */}
                      <div className="mb-4">
                        <div className="small fw-bold text-dark text-uppercase mb-2" style={{ letterSpacing: '0.04em' }}>
                          Key Deliverables
                        </div>
                        <ul className="list-unstyled mb-0 small">
                          {service.features.map((feat, i) => (
                            <li key={i} className="mb-2 d-flex align-items-center gap-2 text-secondary">
                              <CheckCircle size={15} style={{ color: service.color, flexShrink: 0 }} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 pt-0 mt-auto">
                      {service.comingSoon ? (
                        <Link
                          to={`/for-colleges?service=${service.id}`}
                          className="btn btn-outline-secondary w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                        >
                          Join Waitlist <ArrowRight size={16} />
                        </Link>
                      ) : (
                        <Link
                          to={`/for-colleges?service=${service.id}`}
                          className="btn btn-primary w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          style={{
                            background: service.color,
                            borderColor: service.color,
                          }}
                        >
                          Request Pilot Package <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-4 bg-white border-top mt-auto">
        <div className="container-xl d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <ShieldCheck size={18} className="text-success" />
            <span>All workflows comply with NAAC RAF 2024, NBA OBE, and AICTE frameworks.</span>
          </div>
          <div className="d-flex gap-3 small">
            <Link to="/for-colleges" className="text-decoration-none text-muted">Intake Form</Link>
            <Link to="/login" className="text-decoration-none text-muted">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
