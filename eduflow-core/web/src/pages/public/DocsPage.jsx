import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Copy,
  Check,
  Search,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Zap,
  Info,
  AlertTriangle,
  Layers
} from 'lucide-react'

const DOC_SECTIONS = [
  {
    category: 'Getting Started',
    items: [
      { id: 'quickstart', title: 'Quickstart Guide' },
      { id: 'architecture', title: 'System Architecture' },
      { id: 'requirements', title: 'System Requirements' },
    ],
  },
  {
    category: 'AI Officers',
    items: [
      { id: 'officer-accreditation', title: 'Accreditation Officer' },
      { id: 'officer-timetable', title: 'Timetable Officer' },
      { id: 'officer-admissions', title: 'Admissions Officer' },
      { id: 'officer-finance', title: 'Finance Officer' },
      { id: 'officer-student-success', title: 'Student Success Officer' },
    ],
  },
  {
    category: 'Data Integration',
    items: [
      { id: 'integration-portals', title: 'ERP & DB Portals' },
      { id: 'integration-csv', title: 'CSV & Bulk Uploads' },
      { id: 'integration-biometric', title: 'Biometric Devices' },
      { id: 'integration-webhooks', title: 'Webhooks & Events' },
    ],
  },
  {
    category: 'Admin Guide',
    items: [
      { id: 'admin-roles', title: 'Roles & Permissions' },
      { id: 'admin-tenants', title: 'Multi-Tenant Architecture' },
      { id: 'admin-subdomains', title: 'Subdomains & Routing' },
      { id: 'admin-security', title: 'Security Best Practices' },
    ],
  },
  {
    category: 'Security & Compliance',
    items: [
      { id: 'compliance-sovereignty', title: 'Data Sovereignty' },
      { id: 'compliance-dpdp', title: 'FERPA & DPDP Act' },
      { id: 'compliance-encryption', title: 'Encryption & Key Mgmt' },
    ],
  },
  {
    category: 'API Reference',
    items: [
      { id: 'api-rest', title: 'REST Endpoints' },
      { id: 'api-sse', title: 'SSE Streaming Streams' },
      { id: 'api-errors', title: 'Error Codes & Handling' },
    ],
  },
]

function CodeBlock({ code, language = 'bash' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-3 overflow-hidden my-3 border border-dark-subtle shadow-sm" style={{ backgroundColor: '#0d1117' }}>
      <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom border-secondary border-opacity-25" style={{ backgroundColor: '#161b22' }}>
        <span className="font-monospace small text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>{language}</span>
        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none text-light p-0 d-flex align-items-center gap-1 small"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          <span className="small">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 mb-0 text-light overflow-x-auto font-monospace small" style={{ lineHeight: '1.6', fontSize: '0.85rem' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Callout({ type = 'note', title, children }) {
  const configs = {
    note: { bg: 'rgba(13, 110, 253, 0.08)', border: '#0d6efd', text: '#0d6efd', icon: Info, defaultTitle: 'Note' },
    tip: { bg: 'rgba(25, 135, 84, 0.08)', border: '#198754', text: '#198754', icon: Zap, defaultTitle: 'Tip' },
    warning: { bg: 'rgba(255, 193, 7, 0.12)', border: '#ffc107', text: '#d39e00', icon: AlertTriangle, defaultTitle: 'Warning' },
  }
  const config = configs[type] || configs.note
  const Icon = config.icon

  return (
    <div className="p-3 my-3 rounded-3 border-start border-4" style={{ backgroundColor: config.bg, borderColor: config.border }}>
      <div className="d-flex align-items-center gap-2 mb-1 fw-bold small" style={{ color: config.text }}>
        <Icon size={16} />
        <span>{title || config.defaultTitle}</span>
      </div>
      <div className="small text-body">{children}</div>
    </div>
  )
}

const SECTION_CONTENT = {
  quickstart: {
    title: 'Quickstart Guide',
    description: 'Get up and running with EduFlow AI OS in under 5 minutes.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">1. Setting up your Environment</h4>
        <p>EduFlow AI OS runs as a distributed modern web application backed by Node.js and React with live AI streaming capabilities.</p>
        <CodeBlock
          language="bash"
          code={`# Clone the repository
git clone https://github.com/your-org/EduFLowAI.git
cd EduFLowAI

# Install backend dependencies
cd eduflow-backend && npm install

# Start the development server
npm run dev`}
        />
        <Callout type="tip" title="Prerequisites">
          Ensure you have Node.js 20+ installed. For multi-tenant databases, a PostgreSQL 15+ instance is recommended, though memory mode is supported out of the box for testing.
        </Callout>

        <h4 className="fw-bold mt-4 mb-3 pb-2 border-bottom">2. Initializing AI Officers</h4>
        <p>Authenticate with your campus credentials to obtain a Bearer JWT, then connect to the Officer streaming gateway:</p>
        <CodeBlock
          language="javascript"
          code={`const response = await fetch('/api/v1/officers/accreditation/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({ reportType: 'NAAC_CRITERIA_3' })
});`}
        />
      </>
    ),
  },
  architecture: {
    title: 'System Architecture',
    description: 'Deep dive into the 3-tier reactive architecture and AI Officer orchestration.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Architecture Overview</h4>
        <p>The platform separates user interaction, business logic orchestration, and real-time LLM inference streams.</p>
        <div className="p-3 rounded-3 border mb-3" style={{ background: 'var(--card-bg, #fff)' }}>
          <div className="d-flex align-items-center gap-2 mb-2 fw-semibold text-primary">
            <Layers size={18} /> EduFlow AI Multi-Tenant Pipeline
          </div>
          <ul className="mb-0 small text-muted">
            <li><strong>Frontend Layer:</strong> React 18, Vite 5, Bootstrap 5 UI with CSS variable theming.</li>
            <li><strong>Application Core:</strong> Express Node.js API with Zod schema validation &amp; JWT RBAC.</li>
            <li><strong>Streaming Engine:</strong> Server-Sent Events (SSE) with unbuffered chunk flushing.</li>
            <li><strong>Data Layer:</strong> PostgreSQL with tenant-isolated row filtering &amp; memory failover.</li>
          </ul>
        </div>
        <Callout type="note" title="Zero Vendor Lock-in">
          The provider abstraction layer allows hot-swapping between Gemini 1.5, OpenAI GPT-4o, Claude 3.5, and Ollama local models without restarting backend nodes.
        </Callout>
      </>
    ),
  },
  requirements: {
    title: 'System Requirements',
    description: 'Hardware, software, and network requirements for running EduFlow AI on-premise or cloud.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Hardware &amp; OS Requirements</h4>
        <table className="table table-bordered small align-middle mb-4">
          <thead className="table-light">
            <tr>
              <th>Component</th>
              <th>Minimum</th>
              <th>Recommended</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>CPU</td><td>2 Cores</td><td>4+ Cores (ARM64 or x86_64)</td></tr>
            <tr><td>Memory</td><td>4 GB RAM</td><td>8 GB RAM (16 GB if running Ollama)</td></tr>
            <tr><td>Storage</td><td>20 GB SSD</td><td>50 GB NVMe</td></tr>
            <tr><td>Network</td><td>10 Mbps egress</td><td>100 Mbps with WSS support</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  'officer-accreditation': {
    title: 'Accreditation Officer',
    description: 'Autonomous generation of 7-Criteria NAAC SSR, NBA OBE portfolios, and NIRF audits.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Role &amp; Capabilities</h4>
        <p>The Accreditation Officer acts as a Senior NAAC/NBA peer review auditor. It reads institutional ERP records and cross-checks with official NAAC RAF manuals.</p>
        <CodeBlock
          language="bash"
          code={`curl -X POST https://api.eduflow.edu/v1/officers/accreditation/stream \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"reportType": "NAAC_SSR_CYCLE_2"}'`}
        />
        <Callout type="tip" title="Report Export">
          All generated accreditation reports can be exported directly to compliant PDF format with official IQAC timestamps.
        </Callout>
      </>
    ),
  },
  'officer-timetable': {
    title: 'Timetable Officer',
    description: 'Operations research constraint satisfaction solver for conflict-free campus scheduling.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Constraint Satisfaction Engine</h4>
        <p>Solves multi-variable scheduling across faculty workload constraints, classroom capacity, laboratory splits, and student elective clash limits.</p>
        <CodeBlock
          language="json"
          code={`{
  "department": "Computer Science & Engineering",
  "semester": 6,
  "max_faculty_hours_per_day": 4,
  "lab_block_duration": 3
}`}
        />
      </>
    ),
  },
  'officer-admissions': {
    title: 'Admissions Officer',
    description: 'Enrollment yield forecaster, applicant scoring, and lead conversion funnel intelligence.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Yield Prediction</h4>
        <p>Analyzes historical application cut-offs, student demographic intake, and seat retention ratios to optimize counselling rounds.</p>
      </>
    ),
  },
  'officer-finance': {
    title: 'Finance Officer',
    description: 'Fee collection reconciliation, automated defaulter tracking, and GST-ready ledger accounting.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Ledger Reconciliation</h4>
        <p>Reconciles offline bank slips, UPI receipts, and scholarship disbursements with student ledger accounts.</p>
      </>
    ),
  },
  'officer-student-success': {
    title: 'Student Success Officer',
    description: 'Predictive dropout early-warning engine tracking attendance anomalies and GPA trajectory.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Early Warning Matrix</h4>
        <p>Flags students crossing below the 75% attendance threshold or showing sudden CGPA dips before semester exams.</p>
      </>
    ),
  },
  'integration-portals': {
    title: 'ERP & DB Portals',
    description: 'Connect directly to legacy MySQL, PostgreSQL, Oracle, Fedena, Campus 365, or Classpro.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Direct Database Handshake</h4>
        <p>Read-only canonical synchronization connects to your campus ERP replica without requiring data migrations.</p>
        <CodeBlock
          language="bash"
          code={`POST /api/v1/portal/test-connection
{
  "sourceType": "POSTGRES",
  "host": "erp-replica.internal.campus.edu",
  "port": 5432,
  "database": "campus_db",
  "username": "eduflow_ro"
}`}
        />
      </>
    ),
  },
  'integration-csv': {
    title: 'CSV & Bulk Uploads',
    description: 'Bulk ingestion formats for student master records, faculty lists, and marks rosters.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Standard CSV Schema</h4>
        <p>Upload comma-separated values matching canonical column headers: <code>roll_no, full_name, email, department, semester</code>.</p>
      </>
    ),
  },
  'integration-biometric': {
    title: 'Biometric Devices',
    description: 'Push/pull integration with ZKTeco, eSSL, and BioTime biometric attendance machines.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Hardware Attendance Hook</h4>
        <p>Configure device push protocol to sync biometric check-ins directly into EduFlow attendance streams.</p>
      </>
    ),
  },
  'integration-webhooks': {
    title: 'Webhooks & Events',
    description: 'Outbound HTTP POST payloads triggered on report generation or risk alerts.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Event Payloads</h4>
        <CodeBlock
          language="json"
          code={`{
  "event": "student.risk_detected",
  "timestamp": "2026-10-17T10:00:00Z",
  "data": {
    "student_id": 4120,
    "risk_level": "CRITICAL",
    "attendance_pct": 58.4
  }
}`}
        />
      </>
    ),
  },
  'admin-roles': {
    title: 'Roles & Permissions',
    description: 'Granular access control covering Admin, Dean, HOD, Faculty, Staff, and Auditor roles.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Role-Based Access Control (RBAC)</h4>
        <p>Every API route and dashboard module enforces strict institutional tenant and role boundaries.</p>
      </>
    ),
  },
  'admin-tenants': {
    title: 'Multi-Tenant Architecture',
    description: 'Institutional isolation, data sandboxing, and database connection pooling.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Tenant Sandboxing</h4>
        <p>All database queries include parameterized <code>institution_id</code> guards preventing cross-tenant data exposure.</p>
      </>
    ),
  },
  'admin-subdomains': {
    title: 'Subdomains & Routing',
    description: 'Custom campus vanity URLs (e.g. ssit.eduflow.ai or portal.ssit.edu.in).',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Domain Verification</h4>
        <p>CNAME verification and automatic TLS certificate provisioning for campus subdomains.</p>
      </>
    ),
  },
  'admin-security': {
    title: 'Security Best Practices',
    description: 'Hardening recommendations for enterprise institutional deployments.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Campus Security Checklist</h4>
        <Callout type="warning" title="API Keys">
          Never commit production LLM keys or JWT secrets into client repositories. Utilize environment variables injected through CI/CD secrets.
        </Callout>
      </>
    ),
  },
  'compliance-sovereignty': {
    title: 'Data Sovereignty',
    description: 'Local cloud storage, VPC peering, and on-premise model deployment guarantees.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Indian Data Residency</h4>
        <p>Complies with sovereign data storage mandates, storing student and institutional records exclusively within Indian data centers.</p>
      </>
    ),
  },
  'compliance-dpdp': {
    title: 'FERPA & DPDP Act',
    description: 'Compliance with India DPDP Act 2023 and international student privacy standards.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Privacy &amp; Data Rights</h4>
        <p>Guarantees student consent management, right-to-erasure workflows, and parental access oversight.</p>
      </>
    ),
  },
  'compliance-encryption': {
    title: 'Encryption & Key Management',
    description: 'AES-256 at rest, TLS 1.3 in transit, and HSM-backed cryptographic token rotation.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Cryptographic Standards</h4>
        <p>All sensitive student identifiers and database connection credentials are stored using salted AES-256-GCM encryption.</p>
      </>
    ),
  },
  'api-rest': {
    title: 'REST Endpoints',
    description: 'Complete API reference for programmatic integration and automations.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Endpoints Summary</h4>
        <CodeBlock
          language="http"
          code={`GET    /api/health
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/officers/{type}/stream
POST   /api/v1/officers/{type}/export-pdf
GET    /api/v1/portal/sources
POST   /api/v1/portal/test-connection`}
        />
      </>
    ),
  },
  'api-sse': {
    title: 'SSE Streaming Streams',
    description: 'Event-stream wire protocol for real-time generative responses.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Server-Sent Events Specification</h4>
        <CodeBlock
          language="json"
          code={`data: {"type": "thinking", "text": "Auditing Criteria 3 research publications..."}
data: {"type": "token", "text": "## Criterion 3.1: Research Innovation\\n\\n"}
data: {"type": "done", "roi": {"timeSavedHours": 40, "costSaved": 25000}}`}
        />
      </>
    ),
  },
  'api-errors': {
    title: 'Error Codes & Handling',
    description: 'Standardized error responses and recovery mechanisms.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom">Error Code Matrix</h4>
        <table className="table table-bordered small align-middle">
          <thead className="table-light">
            <tr>
              <th>Status</th>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>400</td><td><code>VALIDATION_ERROR</code></td><td>Request body failed Zod schema checks</td></tr>
            <tr><td>401</td><td><code>UNAUTHORIZED</code></td><td>Missing or expired Bearer JWT token</td></tr>
            <tr><td>403</td><td><code>FORBIDDEN</code></td><td>Insufficient role permissions for endpoint</td></tr>
            <tr><td>409</td><td><code>SUBDOMAIN_CONFLICT</code></td><td>Requested campus short code is taken</td></tr>
            <tr><td>429</td><td><code>RATE_LIMITED</code></td><td>Too many requests within 15-minute window</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
}

export default function DocsPage() {
  const [selectedId, setSelectedId] = useState('quickstart')
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter sections by search query
  const filteredSections = DOC_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.category.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0)

  const activeDoc = SECTION_CONTENT[selectedId] || {
    title: 'Documentation',
    description: 'Select a guide from the sidebar to view technical documentation.',
    content: <p className="text-muted">Documentation chapter coming soon.</p>,
  }

  return (
    <div className="min-vh-100 bg-body text-body" style={{ background: 'var(--app-bg, #f8f9fa)' }}>
      {/* Top Navbar Header */}
      <header className="border-bottom bg-body sticky-top shadow-sm px-4 py-3" style={{ zIndex: 1020, background: 'var(--card-bg, #fff)' }}>
        <div className="container-fluid d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3" style={{ maxWidth: '1400px' }}>
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-decoration-none text-body d-flex align-items-center gap-2 fw-bold fs-5">
              <span className="p-2 rounded bg-primary text-white d-flex align-items-center justify-content-center">
                <BookOpen size={18} />
              </span>
              <span>EduFlow <span className="text-primary">Docs</span></span>
            </Link>
            <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 small">
              v2.4.0 — Production
            </span>
          </div>

          {/* Search bar */}
          <div className="position-relative flex-grow-1 mx-md-4" style={{ maxWidth: '480px' }}>
            <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              className="form-control form-control-sm ps-5 pe-4 rounded-pill bg-body border"
              placeholder="Search docs... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search documentation"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-close position-absolute top-50 end-0 translate-middle-y me-3 small"
                style={{ fontSize: '0.65rem' }}
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>

          {/* Quick links */}
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setSelectedId('api-rest')}
            >
              API Reference
            </button>
            <a
              href="https://github.com/your-org/EduFLowAI"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            >
              GitHub <ExternalLink size={13} />
            </a>
            <Link to="/login" className="btn btn-sm btn-primary d-flex align-items-center gap-1">
              <ArrowLeft size={14} /> Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container-fluid py-4 px-4" style={{ maxWidth: '1400px' }}>
        <div className="row g-4">
          {/* Left Sidebar */}
          <aside className="col-12 col-md-3 col-xl-2">
            <div className="sticky-top" style={{ top: '85px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
              <div className="card border-0 shadow-sm rounded-3 p-3" style={{ background: 'var(--card-bg, #fff)' }}>
                {filteredSections.map((section) => (
                  <div key={section.category} className="mb-3">
                    <div className="text-uppercase fw-bold text-muted small mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                      {section.category}
                    </div>
                    <ul className="list-unstyled mb-0">
                      {section.items.map((item) => (
                        <li key={item.id} className="mb-1">
                          <button
                            type="button"
                            className={`btn btn-sm w-100 text-start px-2 py-1 rounded d-flex align-items-center justify-content-between ${
                              selectedId === item.id
                                ? 'btn-primary text-white fw-semibold shadow-sm'
                                : 'btn-light bg-transparent text-body hover-bg-light border-0'
                            }`}
                            onClick={() => setSelectedId(item.id)}
                            style={{ fontSize: '0.85rem' }}
                          >
                            <span>{item.title}</span>
                            {selectedId === item.id && <ChevronRight size={14} />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {filteredSections.length === 0 && (
                  <div className="text-muted small py-3 text-center">
                    No matching sections found.
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="col-12 col-md-9 col-xl-10">
            <div className="card border-0 shadow-sm rounded-3 p-4 p-md-5" style={{ background: 'var(--card-bg, #fff)', minHeight: '650px' }}>
              <div style={{ maxWidth: '800px' }}>
                {/* Header breadcrumb & Title */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                    <span>Docs</span>
                    <ChevronRight size={12} />
                    <span className="text-primary fw-medium">{activeDoc.title}</span>
                  </div>
                  <h1 className="h2 fw-bold text-body mb-2">{activeDoc.title}</h1>
                  {activeDoc.description && (
                    <p className="text-muted lead fs-6 mb-0">{activeDoc.description}</p>
                  )}
                </div>

                {/* Rendered Technical Guide Content */}
                <article className="docs-article" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {activeDoc.content}
                </article>

                {/* Footer nav */}
                <div className="mt-5 pt-4 border-top d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Last updated: October 2026 • EduFlow Technical Documentation
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Back to top ↑
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
