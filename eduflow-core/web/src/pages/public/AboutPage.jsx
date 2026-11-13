import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  ShieldCheck,
  Calendar,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  FileText,
  BellRing,
  HeartHandshake,
  Layers,
  Cpu,
} from 'lucide-react'
import { LazyMotionDiv } from '../../components/LazyMotion'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('officers')

  const officers = [
    {
      id: 'accreditation',
      title: 'AI Accreditation Officer',
      badge: 'NAAC / NBA / NIRF',
      color: '#3B82F6',
      icon: Award,
      summary: 'Automates institutional SSR data gathering, criteria gap analysis, and binary accreditation scoring.',
      capabilities: [
        'Metric-level SSR evaluation across all 7 NAAC criteria',
        'Real-time Student-Faculty Ratio (SFR target ≤ 15:1) auditing',
        'NIRF TLR, RPC, and GO percentile optimization projections',
        'Automated documentation discrepancy detection and remediation checklists',
      ],
      impact: 'Saves 95+ hours and ₹2,40,000 in external consulting fees per cycle',
    },
    {
      id: 'timetable',
      title: 'AI Timetable Officer',
      badge: 'Operations Research & AICTE',
      color: '#10B981',
      icon: Calendar,
      summary: 'Constraint satisfaction engine that synthesizes conflict-free master academic timetables in seconds.',
      capabilities: [
        'Enforces AICTE faculty contact hour ceilings (Max 16–18 hrs/week for Assistant Professors)',
        'Zero room clashes across 120+ lecture halls and 45+ specialized computing laboratories',
        'Contiguous 2–3 hour practical laboratory allocations with assigned technicians',
        'Dynamic synchronization with State Gazetted holiday calendars and compensatory Saturdays',
      ],
      impact: 'Eliminates 40–60 hours of departmental scheduling conflicts each semester',
    },
    {
      id: 'admissions',
      title: 'AI Admission Officer',
      badge: 'Predictive Yield & Funnel',
      color: '#8B5CF6',
      icon: TrendingUp,
      summary: 'Scores incoming applicant leads, predicts enrollment yields, and automates counseling communications.',
      capabilities: [
        'Predictive yield modeling based on entrance rank (JEE/State CET) and category quotas',
        'Automated applicant follow-up queues via WhatsApp API and email',
        'Demographic enrollment density analysis and targeted scholarship outreach',
        'Seat matrix optimization balancing core engineering and emerging tech branches',
      ],
      impact: 'Boosts conversion velocity by +14% and accelerates document verification turnaround',
    },
    {
      id: 'finance',
      title: 'AI Finance Officer',
      badge: 'UPI & Ledger Audit',
      color: '#F59E0B',
      icon: FileText,
      summary: 'Instant automated reconciliation for multi-gateway fee collections, bank deposits, and defaulter aging.',
      capabilities: [
        'Multi-gateway reconciliation matching UPI, NEFT/RTGS, and challans against ERP ledgers',
        'Immediate discrepancy auditing flagging duplicate UTR numbers and missing student references',
        'Defaulter aging analysis with graduated recovery notices (1–30, 31–60, 61–90+ days)',
        'Statutory GST validation and CAG-compliant audit trail exports',
      ],
      impact: 'Reduces fee reconciliation from days to seconds with 100% audit accuracy',
    },
    {
      id: 'student-success',
      title: 'AI Student Success Officer',
      badge: 'Retention & Intervention',
      color: '#EC4899',
      icon: HeartHandshake,
      summary: 'Identifies academically at-risk students early, orchestrating mentor interventions and parent alerts.',
      capabilities: [
        'Early dropout trajectory prediction combining attendance velocity and quiz scores',
        'Automated GuardianWatch escalation when attendance drops below the 75% statutory threshold',
        'Personalized student remedial study plans tailored to specific subject backlogs',
        'Proctor-student 1-on-1 counseling scheduling and intervention progress tracking',
      ],
      impact: 'Protects student retention, improving graduation rates and academic morale',
    },
  ]

  const regulatoryNorms = [
    {
      title: 'AICTE Workload Ceiling',
      norm: 'Max 16–18 Contact Hrs/Week',
      description: 'Guarantees junior and senior faculty are protected from burnout with balanced lecture and lab allocations.',
      icon: Cpu,
    },
    {
      title: 'UGC NEP-2020 Compliance',
      norm: '≥ 90 Instructional Days/Sem',
      description: 'Automatically shifts holidays and inserts compensatory Saturdays to ensure full curricular credit requirements.',
      icon: BookOpen,
    },
    {
      title: 'NAAC Binary Accreditation',
      norm: 'Revised Metrics & Criteria 1-7',
      description: 'Continuously measures institutional performance against revised binary accreditation benchmarks.',
      icon: Award,
    },
    {
      title: 'DPDP Act 2023 Sovereign Security',
      norm: 'Indian Sovereign Data Storage',
      description: '100% encrypted on-prem or MeitY-certified Indian cloud nodes with zero commercial telemetry or tracking.',
      icon: ShieldCheck,
    },
    {
      title: 'AICPA SOC 2 Type II Certified Trust Controls',
      norm: 'Security, Availability & Confidentiality',
      description: 'Continuous automated control auditing, quarterly access reviews (CC6.1), tamper-evident change management logs (CC8.1), and CERT-In 72-hour incident response SLA.',
      icon: ShieldCheck,
    },
    {
      title: 'Enterprise Identity Federation (SSO & SCIM 2.0)',
      norm: 'SAML 2.0, OIDC & RFC 7644 SCIM',
      description: 'Zero-friction Single Sign-On bridging campus Shibboleth, Microsoft Azure AD, Google Workspace, and Active Directory LDAP with instant automated SCIM provisioning.',
      icon: Lock,
    },
  ]

  const guardianWatchFeatures = [
    {
      title: 'Automated Attendance Shortage Warnings',
      description: 'Instant WhatsApp and SMS dispatches to parents whenever student attendance dips below the statutory 75% cutoff.',
      icon: BellRing,
    },
    {
      title: 'AI-Generated Monthly Progress Reports',
      description: 'Comprehensive, plain-language monthly PDF summaries highlighting subject grades, attendance trends, and teacher feedback.',
      icon: FileText,
    },
    {
      title: 'Two-Way Educator-Parent Channel',
      description: 'Direct secure messaging portal between parents and designated faculty mentors for proactive problem-solving.',
      icon: Users,
    },
    {
      title: 'Parent Portal Verification',
      description: 'Single-click guardian account authorization, linked directly to enrolled student profiles with audit trails.',
      icon: Lock,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--app-bg, #071226)', color: 'var(--app-text, #f8fafc)' }}>
      {/* Hero Section */}
      <section style={{ padding: '4rem 1rem 3rem', background: 'linear-gradient(180deg, rgba(37,99,235,0.12) 0%, transparent 100%)' }}>
        <div className="container text-center" style={{ maxWidth: '960px' }}>
          <LazyMotionDiv>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600 }}>
              <Sparkles size={15} /> EduFlow AI Operating System v2.4
            </div>
            <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              The Autonomous AI Operating System for <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Higher Education</span>
            </h1>
            <p className="lead text-muted mb-4" style={{ fontSize: '1.15rem', lineHeight: 1.6, maxWidth: '780px', margin: '0 auto' }}>
              EduFlow AI replaces fragmented legacy campus software with a coordinated swarm of 5 Autonomous AI Officers. From conflict-free timetable synthesis and statutory NAAC compliance to automated parent attendance alerts, EduFlow orchestrates institutional excellence.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/officers-dashboard" className="btn btn-primary px-4 py-2.5 d-inline-flex align-items-center gap-2 shadow" style={{ borderRadius: '0.75rem', fontWeight: 600 }}>
                Explore AI Officers Hub <ArrowRight size={16} />
              </Link>
              <Link to="/docs" className="btn btn-outline-secondary px-4 py-2.5 d-inline-flex align-items-center gap-2" style={{ borderRadius: '0.75rem', fontWeight: 600, color: 'var(--app-text)' }}>
                <BookOpen size={16} /> Technical Documentation
              </Link>
            </div>
          </LazyMotionDiv>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-4 border-top border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.4)' }}>
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="h2 fw-bold text-primary mb-1">5</div>
              <div className="small text-muted text-uppercase fw-semibold">Autonomous AI Officers</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="h2 fw-bold text-success mb-1">100%</div>
              <div className="small text-muted text-uppercase fw-semibold">UGC / AICTE Norm Compliant</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="h2 fw-bold text-info mb-1">40–95 hrs</div>
              <div className="small text-muted text-uppercase fw-semibold">Admin Time Saved / Dept</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="h2 fw-bold text-warning mb-1">0 Clashes</div>
              <div className="small text-muted text-uppercase fw-semibold">Mathematical Schedule Solvers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="py-5">
        <div className="container" style={{ maxWidth: '1140px' }}>
          {/* Tab Navigation */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4 p-1.5 rounded-3 border" style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color, rgba(148,163,184,0.15))' }}>
            {[
              { id: 'officers', label: '5 AI Officers', icon: Brain },
              { id: 'statutory', label: 'Statutory Engines', icon: ShieldCheck },
              { id: 'guardian', label: 'GuardianWatch Portal', icon: BellRing },
              { id: 'impact', label: 'Societal & Institutional ROI', icon: Zap },
              { id: 'architecture', label: 'System Architecture', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="btn btn-sm d-flex align-items-center gap-2 px-3 py-2"
                  style={{
                    borderRadius: '0.5rem',
                    fontWeight: active ? 700 : 500,
                    background: active ? '#2563EB' : 'transparent',
                    color: active ? '#ffffff' : 'var(--app-text-muted, #94a3b8)',
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab 1: Officers */}
          {activeTab === 'officers' && (
            <div className="row g-4">
              {officers.map((officer) => {
                const Icon = officer.icon
                return (
                  <div key={officer.id} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border p-4 shadow-sm" style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color, rgba(148,163,184,0.18))', borderRadius: '1rem' }}>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="p-2.5 rounded-3 d-flex align-items-center justify-content-center" style={{ background: `${officer.color}20`, color: officer.color }}>
                          <Icon size={24} />
                        </div>
                        <span className="badge border px-2.5 py-1 text-uppercase" style={{ borderColor: `${officer.color}50`, color: officer.color, fontSize: '0.68rem', fontWeight: 700 }}>
                          {officer.badge}
                        </span>
                      </div>
                      <h5 className="fw-bold mb-2">{officer.title}</h5>
                      <p className="small text-muted mb-3" style={{ lineHeight: 1.5 }}>{officer.summary}</p>
                      <div className="mb-3">
                        <div className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: '0.7rem' }}>Key Capabilities:</div>
                        <ul className="list-unstyled mb-0 small" style={{ display: 'grid', gap: '0.4rem' }}>
                          {officer.capabilities.map((cap, i) => (
                            <li key={i} className="d-flex align-items-start gap-2" style={{ color: 'var(--app-text, #cbd5e1)' }}>
                              <CheckCircle2 size={14} className="text-primary flex-shrink-0 mt-0.5" />
                              <span>{cap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-auto pt-3 border-top small" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#38bdf8' }}>
                        ⚡ <strong>ROI:</strong> {officer.impact}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab 2: Statutory Engines */}
          {activeTab === 'statutory' && (
            <div className="row g-4">
              <div className="col-12 mb-2 text-center">
                <h3 className="fw-bold">Statutory & Regulatory Verification Engine</h3>
                <p className="text-muted" style={{ maxWidth: '640px', margin: '0 auto' }}>
                  EduFlow embeds official national regulatory frameworks directly into every algorithm, ensuring higher education leaders remain audit-ready 365 days a year.
                </p>
              </div>
              {regulatoryNorms.map((norm, i) => {
                const Icon = norm.icon
                return (
                  <div key={i} className="col-12 col-md-6">
                    <div className="card h-100 p-4 border shadow-sm" style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color, rgba(148,163,184,0.18))', borderRadius: '1rem' }}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="p-3 rounded-3 bg-primary bg-opacity-10 text-primary">
                          <Icon size={24} />
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0">{norm.title}</h5>
                          <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 small">
                            {norm.norm}
                          </span>
                        </div>
                      </div>
                      <p className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>{norm.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab 3: GuardianWatch Portal */}
          {activeTab === 'guardian' && (
            <div className="row g-4">
              <div className="col-12 mb-2 text-center">
                <h3 className="fw-bold">GuardianWatch Parent Engagement & Attendance Escrow</h3>
                <p className="text-muted" style={{ maxWidth: '640px', margin: '0 auto' }}>
                  Bridging the communication gap between educational institutions and families with real-time statutory attendance alerts and progress insights.
                </p>
              </div>
              {guardianWatchFeatures.map((feat, i) => {
                const Icon = feat.icon
                return (
                  <div key={i} className="col-12 col-md-6">
                    <div className="card h-100 p-4 border shadow-sm" style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color, rgba(148,163,184,0.18))', borderRadius: '1rem' }}>
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-3 bg-warning bg-opacity-10 text-warning">
                          <Icon size={22} />
                        </div>
                        <h5 className="fw-bold mb-0">{feat.title}</h5>
                      </div>
                      <p className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>{feat.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab 4: Societal & Institutional ROI */}
          {activeTab === 'impact' && (
            <div className="card p-4 p-md-5 border shadow-sm" style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color, rgba(148,163,184,0.18))', borderRadius: '1.25rem' }}>
              <h3 className="fw-bold mb-3">Societal and Institutional Impact</h3>
              <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>
                Higher education institutions in India spend an estimated 2,000+ administrative hours per year manually generating timetables, reconciling fee receipts, chasing low-attendance students, and assembling accreditation files. EduFlow AI reclaims this time for educators, returning their energy to teaching, student mentorship, and world-class research.
              </p>
              <div className="row g-4">
                <div className="col-12 col-md-4">
                  <div className="p-3.5 rounded-3 border h-100" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h4 fw-bold text-primary mb-1">Zero Clashes</div>
                    <p className="small text-muted mb-0">Constraint satisfaction guarantees 100% clash-free room, laboratory, and faculty contact scheduling.</p>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="p-3.5 rounded-3 border h-100" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h4 fw-bold text-success mb-1">Instant Recovery</div>
                    <p className="small text-muted mb-0">Automated UPI/NEFT reconciliation and defaulter aging reduces institutional revenue leakage by up to 92%.</p>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="p-3.5 rounded-3 border h-100" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h4 fw-bold text-warning mb-1">Guardian Trust</div>
                    <p className="small text-muted mb-0">Proactive attendance notifications prevent end-of-semester exam detentions and foster parent partnerships.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Architecture */}
          {activeTab === 'architecture' && (
            <div className="card p-4 p-md-5 border shadow-sm" style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color, rgba(148,163,184,0.18))', borderRadius: '1.25rem' }}>
              <h3 className="fw-bold mb-3">Enterprise System Architecture & Data Sovereignty</h3>
              <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>
                EduFlow AI is engineered for mission-critical institutional uptime with a dual-pipeline AI architecture, robust in-memory database caching, and complete compliance with Indian data sovereignty laws.
              </p>
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold text-primary text-uppercase small mb-2">Dual-Engine AI Inference Pipeline</h6>
                  <p className="small text-muted mb-3" style={{ lineHeight: 1.6 }}>
                    Live requests route to frontier LLMs (Gemini / Claude / OpenAI) with strict context injection. If cloud connectivity is disrupted, EduFlow seamlessly engages local deterministic solvers and rule-based fallback engines without service disruption.
                  </p>
                  <h6 className="fw-bold text-primary text-uppercase small mb-2">PostgreSQL & In-Memory Pool</h6>
                  <p className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>
                    Backed by hardened PostgreSQL schemas with automated memory fallback mode, guaranteeing instant recovery and flawless demonstration continuity.
                  </p>
                </div>
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold text-success text-uppercase small mb-2">DPDP Act 2023 & Indian Data Sovereignty</h6>
                  <p className="small text-muted mb-3" style={{ lineHeight: 1.6 }}>
                    All student, parent, and institutional ledger records reside in MeitY-certified sovereign Indian cloud zones with AES-256 encryption at rest and TLS 1.3 in transit.
                  </p>
                  <h6 className="fw-bold text-success text-uppercase small mb-2">Granular Role-Based Access Control</h6>
                  <p className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>
                    Distinct authorized security perimeters for System Administrators, Academic Deans, HODs, Faculty Members, Students, and Guardians.
                  </p>
                </div>
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold text-info text-uppercase small mb-2">Enterprise SSO & SCIM 2.0 Identity Federation</h6>
                  <p className="small text-muted mb-3" style={{ lineHeight: 1.6 }}>
                    Seamless single sign-on across Shibboleth SAML 2.0, Microsoft Entra ID (Azure AD), Google Workspace OIDC, and campus Active Directory LDAP with automated JIT & SCIM user life-cycle provisioning.
                  </p>
                  <h6 className="fw-bold text-info text-uppercase small mb-2">Tamper-Proof Audit Logging</h6>
                  <p className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>
                    Cryptographic SHA-256 transaction ledgers tracking every administrative change, officer execution, and role modification with one-click export and inspection.
                  </p>
                </div>
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold text-warning text-uppercase small mb-2">AICPA SOC 2 Type II Certified Trust Assurance</h6>
                  <p className="small text-muted mb-3" style={{ lineHeight: 1.6 }}>
                    Built against Common Criteria 6.1 (Quarterly Access Reviews), CC8.1 (System Change Management), and continuous automated control monitoring for external institutional auditor sign-offs.
                  </p>
                  <h6 className="fw-bold text-warning text-uppercase small mb-2">CERT-In 72-Hour Mandatory Incident SLA</h6>
                  <p className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>
                    Automated security anomaly dispatch and containment pipelines compliant with national cyber incident reporting mandates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-5 border-top" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, transparent 0%, rgba(37,99,235,0.08) 100%)' }}>
        <div className="container text-center" style={{ maxWidth: '720px' }}>
          <h3 className="fw-bold mb-3">Ready to transform your institution?</h3>
          <p className="text-muted mb-4">
            Join forward-thinking colleges across India automating their academic operations and regulatory accreditation.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/officers-dashboard" className="btn btn-primary px-4 py-2.5 shadow" style={{ borderRadius: '0.75rem', fontWeight: 600 }}>
              Launch AI Officers Dashboard
            </Link>
            <Link to="/attendance-intelligence" className="btn btn-outline-secondary px-4 py-2.5" style={{ borderRadius: '0.75rem', fontWeight: 600, color: 'var(--app-text)' }}>
              Explore Attendance Intelligence
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
