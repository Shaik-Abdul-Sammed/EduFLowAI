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
    category: 'API Reference',
    items: [
      { id: 'api-overview', title: 'API Overview' },
      { id: 'api-auth', title: 'Authentication (JWT)' },
      { id: 'api-rate-limits', title: 'Rate Limits' },
      { id: 'api-curl-examples', title: 'Example cURL Requests' },
      { id: 'api-rest', title: 'REST Endpoints' },
      { id: 'api-sse', title: 'SSE Streaming Streams' },
      { id: 'api-errors', title: 'Error Codes & Handling' },
    ],
  },
  {
    category: 'Webhooks & Events',
    items: [
      { id: 'webhooks-overview', title: 'Webhooks Overview' },
      { id: 'webhooks-fee-paid', title: 'Event: Fee Paid' },
      { id: 'webhooks-attendance-marked', title: 'Event: Attendance Marked' },
      { id: 'webhooks-risk-alert', title: 'Event: Student Risk Alert' },
    ],
  },
  {
    category: 'SSO & Identity',
    items: [
      { id: 'sso-saml', title: 'SAML 2.0 Integration' },
      { id: 'sso-oidc', title: 'OpenID Connect (OIDC)' },
      { id: 'sso-ldap', title: 'Active Directory & LDAP' },
    ],
  },
  {
    category: 'Security & Compliance',
    items: [
      { id: 'compliance-sovereignty', title: 'Data Sovereignty' },
      { id: 'compliance-dpdp', title: 'DPDP Act 2023 Compliance' },
      { id: 'compliance-encryption', title: 'Encryption Standards' },
    ],
  },
  {
    category: 'Billing & Invoices',
    items: [
      { id: 'billing-upi-collection', title: 'UPI Fee Collection' },
      { id: 'billing-gst-invoicing', title: 'GST-Compliant Invoicing' },
      { id: 'billing-reconciliation', title: 'Reconciliation & Ledger' },
    ],
  },
  {
    category: 'Data Integration',
    items: [
      { id: 'integration-portals', title: 'ERP & DB Portals' },
      { id: 'integration-csv', title: 'CSV & Bulk Uploads' },
      { id: 'integration-biometric', title: 'Biometric Devices' },
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
]

function CodeBlock({ code, language = 'bash' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-3 overflow-hidden my-3 border shadow-sm" style={{ backgroundColor: '#0d1117', borderColor: 'var(--border-color, #30363d)' }}>
      <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{ backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)' }}>
        <span className="font-monospace text-uppercase" style={{ fontSize: '0.75rem', color: '#8b949e' }}>{language}</span>
        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
          style={{ color: '#c9d1d9' }}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          <span style={{ fontSize: '0.75rem' }}>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 mb-0 overflow-x-auto font-monospace" style={{ lineHeight: '1.6', fontSize: '0.85rem', color: '#e6edf3' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Callout({ type = 'note', title, children }) {
  const configs = {
    note: { bg: 'rgba(13, 110, 253, 0.12)', border: '#3b82f6', text: '#60a5fa', icon: Info, defaultTitle: 'Note' },
    tip: { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', text: '#34d399', icon: Zap, defaultTitle: 'Tip' },
    warning: { bg: 'rgba(245, 158, 11, 0.14)', border: '#f59e0b', text: '#fbbf24', icon: AlertTriangle, defaultTitle: 'Warning' },
  }
  const config = configs[type] || configs.note
  const Icon = config.icon

  return (
    <div className="p-3 my-3 rounded-3 border-start border-4" style={{ backgroundColor: config.bg, borderColor: config.border }}>
      <div className="d-flex align-items-center gap-2 mb-1 fw-bold small" style={{ color: config.text }}>
        <Icon size={16} />
        <span>{title || config.defaultTitle}</span>
      </div>
      <div className="small" style={{ color: 'var(--app-text, inherit)' }}>{children}</div>
    </div>
  )
}

const SECTION_CONTENT = {
  // GETTING STARTED
  quickstart: {
    title: 'Quickstart Guide',
    description: 'Get up and running with EduFlow AI OS in under 5 minutes.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>1. Setting up your Environment</h4>
        <p style={{ color: 'var(--app-text)' }}>EduFlow AI OS runs as a distributed modern web application backed by Node.js and React with live AI streaming capabilities.</p>
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

        <h4 className="fw-bold mt-4 mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>2. Initializing AI Officers</h4>
        <p style={{ color: 'var(--app-text)' }}>Authenticate with your campus credentials to obtain a Bearer JWT, then connect to the Officer streaming gateway:</p>
        <CodeBlock
          language="javascript"
          code={`const response = await fetch('https://eduflow-backend-jvn8.onrender.com/api/v1/officers/accreditation/stream', {
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
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Architecture Overview</h4>
        <p style={{ color: 'var(--app-text)' }}>The platform separates user interaction, business logic orchestration, and real-time LLM inference streams.</p>
        <div className="p-3 rounded-3 border mb-3" style={{ background: 'var(--surface-bg, rgba(255,255,255,0.05))', borderColor: 'var(--border-color)' }}>
          <div className="d-flex align-items-center gap-2 mb-2 fw-semibold text-primary">
            <Layers size={18} /> EduFlow AI Multi-Tenant Pipeline
          </div>
          <ul className="mb-0 small" style={{ color: 'var(--app-text-muted)' }}>
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
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Hardware &amp; OS Requirements</h4>
        <table className="table table-bordered small align-middle mb-4" style={{ color: 'var(--app-text)', borderColor: 'var(--border-color)' }}>
          <thead style={{ background: 'var(--surface-bg)', color: 'var(--app-text)' }}>
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

  // AI OFFICERS
  'officer-accreditation': {
    title: 'Accreditation Officer',
    description: 'Autonomous generation of 7-Criteria NAAC SSR, NBA OBE portfolios, and NIRF audits.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Role &amp; Capabilities</h4>
        <p style={{ color: 'var(--app-text)' }}>The Accreditation Officer acts as a Senior NAAC/NBA peer review auditor. It reads institutional ERP records and cross-checks with official NAAC RAF manuals.</p>
        <CodeBlock
          language="bash"
          code={`curl -X POST https://eduflow-backend-jvn8.onrender.com/api/v1/officers/accreditation/stream \\
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
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Constraint Satisfaction Engine</h4>
        <p style={{ color: 'var(--app-text)' }}>Solves multi-variable scheduling across faculty workload constraints, classroom capacity, laboratory splits, and student elective clash limits.</p>
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
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Yield Prediction</h4>
        <p style={{ color: 'var(--app-text)' }}>Analyzes historical application cut-offs, student demographic intake, and seat retention ratios to optimize counselling rounds.</p>
      </>
    ),
  },
  'officer-finance': {
    title: 'Finance Officer',
    description: 'Fee collection reconciliation, automated defaulter tracking, and GST-ready ledger accounting.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Ledger Reconciliation</h4>
        <p style={{ color: 'var(--app-text)' }}>Reconciles offline bank slips, UPI receipts, and scholarship disbursements with student ledger accounts.</p>
      </>
    ),
  },
  'officer-student-success': {
    title: 'Student Success Officer',
    description: 'Predictive dropout early-warning engine tracking attendance anomalies and GPA trajectory.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Early Warning Matrix</h4>
        <p style={{ color: 'var(--app-text)' }}>Flags students crossing below the 75% attendance threshold or showing sudden CGPA dips before semester exams.</p>
      </>
    ),
  },

  // API REFERENCE (EXPANDED)
  'api-overview': {
    title: 'API Overview',
    description: 'Architecture, foundational concepts, and connectivity for the EduFlow AI REST and Real-Time Gateway.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>REST &amp; Streaming Architecture</h4>
        <p style={{ color: 'var(--app-text)' }}>
          The EduFlow API follows REST conventions for entity mutation and Server-Sent Events (SSE) for real-time generative streaming from AI Officers.
        </p>
        <div className="p-3 rounded-3 border mb-4" style={{ background: 'var(--surface-bg)', borderColor: 'var(--border-color)' }}>
          <div className="small mb-1" style={{ color: 'var(--app-text-muted)' }}><strong>Production Gateway Base URL:</strong></div>
          <code className="text-primary font-monospace fs-6">https://eduflow-backend-jvn8.onrender.com/api</code>
        </div>
        <p style={{ color: 'var(--app-text)' }}>
          All requests require HTTPS with TLS 1.3. Payloads and responses are encoded as JSON (<code>application/json</code>) with UTF-8 character encoding.
        </p>
      </>
    ),
  },
  'api-auth': {
    title: 'Authentication (JWT)',
    description: 'How to authenticate API requests using short-lived Bearer tokens and refresh mechanics.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Bearer Token Authorization</h4>
        <p style={{ color: 'var(--app-text)' }}>
          Every authenticated request must include an <code>Authorization</code> header containing your issued JSON Web Token:
        </p>
        <CodeBlock
          language="http"
          code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
        />
        <h4 className="fw-bold mt-4 mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Obtaining a Token</h4>
        <CodeBlock
          language="bash"
          code={`curl -X POST https://eduflow-backend-jvn8.onrender.com/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@demo.edu",
    "password": "Demo@2026"
  }'`}
        />
        <Callout type="note" title="Token Expiry">
          Access tokens expire in 15 minutes. Use the <code>POST /api/v1/auth/refresh</code> endpoint with your 7-day refresh token to generate new access credentials seamlessly.
        </Callout>
      </>
    ),
  },
  'api-rate-limits': {
    title: 'Rate Limits',
    description: 'Production traffic management, throttling quotas, and header inspection.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Traffic Quotas</h4>
        <p style={{ color: 'var(--app-text)' }}>To ensure high availability across campus tenants, the API enforces tiered rate limiting:</p>
        <table className="table table-bordered small align-middle mb-4" style={{ color: 'var(--app-text)', borderColor: 'var(--border-color)' }}>
          <thead style={{ background: 'var(--surface-bg)', color: 'var(--app-text)' }}>
            <tr>
              <th>Tier</th>
              <th>Quota Window</th>
              <th>Max Requests</th>
              <th>Response on Exceeded</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Authenticated User</td><td>15 Minutes</td><td>100 requests</td><td>HTTP 429 Too Many Requests</td></tr>
            <tr><td>Public / Unauthenticated</td><td>15 Minutes</td><td>20 requests</td><td>HTTP 429 Too Many Requests</td></tr>
            <tr><td>AI Officer Streaming</td><td>15 Minutes</td><td>30 active streams</td><td>HTTP 429 Stream Limit</td></tr>
          </tbody>
        </table>
        <h4 className="fw-bold mt-4 mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Response Headers</h4>
        <p style={{ color: 'var(--app-text)' }}>Each response includes headers indicating your current quota status:</p>
        <CodeBlock
          language="http"
          code={`RateLimit-Limit: 100
RateLimit-Remaining: 84
RateLimit-Reset: 1729175400`}
        />
      </>
    ),
  },
  'api-curl-examples': {
    title: 'Example cURL Requests',
    description: 'Copy-pasteable cURL recipes for interacting with EduFlow services programmatically.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>1. Health Check</h4>
        <CodeBlock
          language="bash"
          code={`curl -i https://eduflow-backend-jvn8.onrender.com/api/health`}
        />

        <h4 className="fw-bold mt-4 mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>2. Stream NAAC Criteria 3 Audit</h4>
        <CodeBlock
          language="bash"
          code={`curl -N -X POST https://eduflow-backend-jvn8.onrender.com/api/v1/officers/accreditation/stream \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"reportType": "NAAC_CRITERIA_3", "criterion": 3}'`}
        />

        <h4 className="fw-bold mt-4 mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>3. List Connected ERP Data Sources</h4>
        <CodeBlock
          language="bash"
          code={`curl https://eduflow-backend-jvn8.onrender.com/api/v1/portal/sources \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
        />
      </>
    ),
  },
  'api-rest': {
    title: 'REST Endpoints',
    description: 'Comprehensive endpoint catalog for authentication, officers, and portals.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Endpoints Summary</h4>
        <CodeBlock
          language="http"
          code={`GET    /api/health
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
POST   /api/v1/officers/{type}/stream
POST   /api/v1/officers/{type}/export-pdf
GET    /api/v1/portal/sources
POST   /api/v1/portal/test-connection
GET    /api/v1/invoices
POST   /api/v1/invoices`}
        />
      </>
    ),
  },
  'api-sse': {
    title: 'SSE Streaming Streams',
    description: 'Event-stream wire protocol for real-time generative responses.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Server-Sent Events Specification</h4>
        <p style={{ color: 'var(--app-text)' }}>All AI Officers stream token events over standard HTTP with <code>text/event-stream</code> encoding:</p>
        <CodeBlock
          language="json"
          code={`data: {"type": "thinking", "message": "Auditing Criteria 3 research publications..."}
data: {"type": "token", "text": "## Criterion 3.1: Research Resource Mobilization\\n\\n"}
data: {"type": "done", "officerType": "accreditation", "roi": {"hoursSaved": 40, "moneySaved": 25000}}`}
        />
      </>
    ),
  },
  'api-errors': {
    title: 'Error Codes & Handling',
    description: 'Standardized error responses, recovery mechanisms, and HTTP status mappings.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Error Code Matrix</h4>
        <table className="table table-bordered small align-middle" style={{ color: 'var(--app-text)', borderColor: 'var(--border-color)' }}>
          <thead style={{ background: 'var(--surface-bg)', color: 'var(--app-text)' }}>
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
            <tr><td>500</td><td><code>INTERNAL_ERROR</code></td><td>Unexpected backend exception (alert logged)</td></tr>
          </tbody>
        </table>
      </>
    ),
  },

  // WEBHOOKS & EVENTS
  'webhooks-overview': {
    title: 'Webhooks Overview',
    description: 'Subscribe to real-time asynchronous notifications for critical campus operational events.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Architecture &amp; Security</h4>
        <p style={{ color: 'var(--app-text)' }}>
          Webhooks emit HTTPS POST requests to your designated server endpoint within 500ms of an event occurrence.
          Every payload is signed with your shared webhook secret in the <code>X-EduFlow-Signature</code> header.
        </p>
        <CodeBlock
          language="javascript"
          code={`// Verifying webhook signature in Node.js
const crypto = require('crypto');
function verifySignature(payload, signatureHeader, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
}`}
        />
      </>
    ),
  },
  'webhooks-fee-paid': {
    title: 'Event: Fee Paid',
    description: 'Real-time payload dispatched when a student tuition fee or term dues are reconciled.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Payload: invoice.payment_received</h4>
        <CodeBlock
          language="json"
          code={`{
  "event": "invoice.payment_received",
  "id": "evt_9841029412",
  "timestamp": "2026-10-17T11:20:00Z",
  "data": {
    "invoice_id": "EDU-2026-0812",
    "student_id": 4120,
    "student_name": "Rahul Sharma",
    "amount": 45000,
    "currency": "INR",
    "payment_method": "UPI",
    "utr_reference": "UPI/608291039412/15000",
    "status": "PAID"
  }
}`}
        />
      </>
    ),
  },
  'webhooks-attendance-marked': {
    title: 'Event: Attendance Marked',
    description: 'Notification triggered when biometric devices or faculty registers sync attendance.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Payload: attendance.batch_synced</h4>
        <CodeBlock
          language="json"
          code={`{
  "event": "attendance.batch_synced",
  "id": "evt_7102948123",
  "timestamp": "2026-10-17T09:30:00Z",
  "data": {
    "course_id": "CS401",
    "section": "CSE-3A",
    "total_strength": 60,
    "present_count": 54,
    "absent_count": 6,
    "device_source": "Main Campus BioTime Device Server"
  }
}`}
        />
      </>
    ),
  },
  'webhooks-risk-alert': {
    title: 'Event: Student Risk Alert',
    description: 'Dispatched when Student Success Officer detects a student crossing critical risk thresholds.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Payload: student.critical_risk</h4>
        <CodeBlock
          language="json"
          code={`{
  "event": "student.critical_risk",
  "id": "evt_1048291042",
  "timestamp": "2026-10-17T10:00:00Z",
  "data": {
    "student_id": 4120,
    "roll_no": "CS-042",
    "student_name": "Rahul Sharma",
    "risk_score": 88,
    "risk_level": "CRITICAL",
    "attendance_pct": 48.2,
    "backlogs": 4,
    "assigned_mentor": "Dr. Anita Rao"
  }
}`}
        />
      </>
    ),
  },

  // SSO & IDENTITY
  'sso-saml': {
    title: 'SAML 2.0 Integration',
    description: 'Configure enterprise single sign-on using Microsoft Entra ID (Azure AD), Okta, or Google Workspace.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Step-by-Step SAML Configuration</h4>
        <p style={{ color: 'var(--app-text)' }}>1. In your Identity Provider (IdP) console, create a new SAML 2.0 application.</p>
        <p style={{ color: 'var(--app-text)' }}>2. Configure the Service Provider (SP) parameters:</p>
        <div className="p-3 rounded-3 border mb-3" style={{ background: 'var(--surface-bg)', borderColor: 'var(--border-color)' }}>
          <div className="small mb-1" style={{ color: 'var(--app-text-muted)' }}><strong>SP Entity ID / Audience URI:</strong></div>
          <code className="text-primary font-monospace">https://eduflow-backend-jvn8.onrender.com/saml/metadata</code>
          <div className="small mt-2 mb-1" style={{ color: 'var(--app-text-muted)' }}><strong>Single Sign-On (ACS) URL:</strong></div>
          <code className="text-primary font-monospace">https://eduflow-backend-jvn8.onrender.com/api/v1/auth/saml/callback</code>
        </div>
        <p style={{ color: 'var(--app-text)' }}>3. Map claim attributes: <code>email</code> &rarr; <code>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress</code>.</p>
        <p style={{ color: 'var(--app-text)' }}>4. Upload your IdP Metadata XML in the EduFlow Admin Dashboard under <strong>Campus Settings &rarr; SSO</strong>.</p>
      </>
    ),
  },
  'sso-oidc': {
    title: 'OpenID Connect (OIDC)',
    description: 'Modern identity federation via OAuth 2.0 / OpenID Connect authorization code flow.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>OIDC Parameters</h4>
        <p style={{ color: 'var(--app-text)' }}>Register EduFlow AI as an OAuth 2.0 Client in your institutional identity directory:</p>
        <CodeBlock
          language="json"
          code={`{
  "client_id": "eduflow_campus_client_id",
  "issuer_url": "https://auth.campus.edu/realms/main",
  "redirect_uri": "https://eduflow-backend-jvn8.onrender.com/api/v1/auth/oidc/callback",
  "scopes": ["openid", "profile", "email"]
}`}
        />
      </>
    ),
  },
  'sso-ldap': {
    title: 'Active Directory & LDAP',
    description: 'Direct intranet directory synchronization for campus servers and computer labs.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>LDAP Connection Configuration</h4>
        <CodeBlock
          language="json"
          code={`{
  "url": "ldaps://dc1.campus.edu:636",
  "bind_dn": "CN=EduFlowService,OU=ServiceAccounts,DC=campus,DC=edu",
  "search_base": "DC=campus,DC=edu",
  "search_filter": "(&(objectCategory=person)(sAMAccountName={{username}}))",
  "tls_options": { "rejectUnauthorized": true }
}`}
        />
      </>
    ),
  },

  // SECURITY & COMPLIANCE
  'compliance-sovereignty': {
    title: 'Data Sovereignty',
    description: 'Guaranteed in-country data residency, VPC peering, and zero cross-border telemetry.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Indian Data Residency</h4>
        <p style={{ color: 'var(--app-text)' }}>
          In accordance with UGC, AICTE, and national sovereign cloud guidelines, all institutional relational records, student marks, biometric logs, and financial records reside exclusively within Tier-IV MeitY-empaneled Indian data centers.
        </p>
        <Callout type="tip" title="Data Isolation">
          Every institution operates on isolated logical partitions. Dedicated database clusters or customer-managed encryption keys (CMEK) are available for University Tier deployments.
        </Callout>
      </>
    ),
  },
  'compliance-dpdp': {
    title: 'DPDP Act 2023 Compliance',
    description: 'Adherence to the Digital Personal Data Protection Act 2023 and FERPA educational privacy rights.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Privacy &amp; Consent Management</h4>
        <p style={{ color: 'var(--app-text)' }}>
          EduFlow provides verifiable consent logging, purpose-limited data processing, student right-to-erasure workflows, and parental oversight interfaces in compliance with the DPDP Act 2023.
        </p>
      </>
    ),
  },
  'compliance-encryption': {
    title: 'Encryption Standards',
    description: 'End-to-end cryptographic defense covering storage at rest and network streams in transit.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Cryptographic Framework</h4>
        <table className="table table-bordered small align-middle mb-4" style={{ color: 'var(--app-text)', borderColor: 'var(--border-color)' }}>
          <thead style={{ background: 'var(--surface-bg)', color: 'var(--app-text)' }}>
            <tr>
              <th>Layer</th>
              <th>Protocol / Cipher</th>
              <th>Key Management</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Data at Rest</td><td>AES-256-GCM</td><td>Hardware Security Module (HSM) with 90-day rotation</td></tr>
            <tr><td>Data in Transit</td><td>TLS 1.3 / Perfect Forward Secrecy</td><td>Automated Let&apos;s Encrypt &amp; Cloudflare ECC Certificates</td></tr>
            <tr><td>User Passwords</td><td>bcrypt (12 rounds)</td><td>Salted per user instance</td></tr>
            <tr><td>API Signatures</td><td>HMAC-SHA256</td><td>Institution-specific rotating secrets</td></tr>
          </tbody>
        </table>
      </>
    ),
  },

  // BILLING & INVOICES
  'billing-upi-collection': {
    title: 'UPI Fee Collection',
    description: 'Zero-fee dynamic UPI payment links, QR generation, and real-time bank reconciliation.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Dynamic UPI Deep-Links</h4>
        <p style={{ color: 'var(--app-text)' }}>Generate parameterized NPCI-compliant UPI links with institutional VPA and student roll number:</p>
        <CodeBlock
          language="text"
          code={`upi://pay?pa=campus@hdfcbank&pn=Sri+Sudha+Institute&tr=EDU-2026-0812&am=45000&cu=INR&tn=Term+2+Tuition+CS402`}
        />
      </>
    ),
  },
  'billing-gst-invoicing': {
    title: 'GST-Compliant Invoicing',
    description: 'Automatic sequential tax invoicing, SAC 9992 categorization, and CGST/SGST ledger splits.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>GST Invoice Structure</h4>
        <p style={{ color: 'var(--app-text)' }}>Invoices conform to statutory Indian tax standards:</p>
        <ul style={{ color: 'var(--app-text-muted)', lineHeight: '1.8' }} className="small">
          <li><strong>Invoice Numbering:</strong> Formatted as <code>EDU-YYYY-XXXX</code> with non-repeating sequence.</li>
          <li><strong>SAC Code:</strong> SAC 9992 (Education Services) with tax exemption / 18% GST calculation flags.</li>
          <li><strong>PDF Output:</strong> Downloadable, signed PDF invoices with institutional seal and bank NEFT details.</li>
        </ul>
      </>
    ),
  },
  'billing-reconciliation': {
    title: 'Reconciliation & Ledger',
    description: 'Automated matching between bank statements, UPI references, and student ledger accounts.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Bank Statement Parser</h4>
        <p style={{ color: 'var(--app-text)' }}>
          Ingest daily bank CSV/Excel feeds. The Finance Officer automatically maps UTR transaction references against outstanding tuition fee invoices, instantly highlighting unmatched deposits.
        </p>
      </>
    ),
  },

  // DATA INTEGRATION
  'integration-portals': {
    title: 'ERP & DB Portals',
    description: 'Connect directly to legacy MySQL, PostgreSQL, Oracle, Fedena, Campus 365, or Classpro.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Direct Database Handshake</h4>
        <p style={{ color: 'var(--app-text)' }}>Read-only canonical synchronization connects to your campus ERP replica without requiring data migrations.</p>
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
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Standard CSV Schema</h4>
        <p style={{ color: 'var(--app-text)' }}>Upload comma-separated values matching canonical column headers: <code>roll_no, full_name, email, department, semester</code>.</p>
      </>
    ),
  },
  'integration-biometric': {
    title: 'Biometric Devices',
    description: 'Push/pull integration with ZKTeco, eSSL, and BioTime biometric attendance machines.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Hardware Attendance Hook</h4>
        <p style={{ color: 'var(--app-text)' }}>Configure device push protocol to sync biometric check-ins directly into EduFlow attendance streams.</p>
      </>
    ),
  },

  // ADMIN GUIDE
  'admin-roles': {
    title: 'Roles & Permissions',
    description: 'Granular access control covering Admin, Dean, HOD, Faculty, Staff, and Auditor roles.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Role-Based Access Control (RBAC)</h4>
        <p style={{ color: 'var(--app-text)' }}>Every API route and dashboard module enforces strict institutional tenant and role boundaries.</p>
      </>
    ),
  },
  'admin-tenants': {
    title: 'Multi-Tenant Architecture',
    description: 'Institutional isolation, data sandboxing, and database connection pooling.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Tenant Sandboxing</h4>
        <p style={{ color: 'var(--app-text)' }}>All database queries include parameterized <code>institution_id</code> guards preventing cross-tenant data exposure.</p>
      </>
    ),
  },
  'admin-subdomains': {
    title: 'Subdomains & Routing',
    description: 'Custom campus vanity URLs (e.g. ssit.eduflow.app or portal.ssit.edu.in).',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Domain Verification</h4>
        <p style={{ color: 'var(--app-text)' }}>CNAME verification and automatic TLS certificate provisioning for campus subdomains.</p>
      </>
    ),
  },
  'admin-security': {
    title: 'Security Best Practices',
    description: 'Hardening recommendations for enterprise institutional deployments.',
    content: (
      <>
        <h4 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--app-text)' }}>Campus Security Checklist</h4>
        <Callout type="warning" title="API Keys">
          Never commit production LLM keys or JWT secrets into client repositories. Utilize environment variables injected through CI/CD secrets.
        </Callout>
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
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
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
    content: <p style={{ color: 'var(--app-text-muted)' }}>Documentation chapter coming soon.</p>,
  }

  return (
    <div className="min-vh-100" style={{ background: 'var(--app-bg, #071226)', color: 'var(--app-text, #f8fafc)' }}>
      {/* Top Navbar Header */}
      <header
        className="border-bottom sticky-top shadow-sm px-4 py-3"
        style={{
          zIndex: 1020,
          background: 'var(--card-bg, #0c121e)',
          borderColor: 'var(--border-color, rgba(255,255,255,0.1))',
          color: 'var(--app-text, #f8fafc)',
        }}
      >
        <div className="container-fluid d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3" style={{ maxWidth: '1400px' }}>
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 fw-bold fs-5" style={{ color: 'var(--app-text, inherit)' }}>
              <span className="p-2 rounded bg-primary text-white d-flex align-items-center justify-content-center">
                <BookOpen size={18} />
              </span>
              <span>EduFlow <span className="text-primary">Docs</span></span>
            </Link>
            <span
              className="badge border px-2 py-1 small"
              style={{
                background: 'var(--surface-bg, rgba(255,255,255,0.06))',
                borderColor: 'var(--border-color, rgba(255,255,255,0.15))',
                color: 'var(--app-text-muted, #94a3b8)',
              }}
            >
              v2.4.0 — Production
            </span>
          </div>

          {/* Search bar */}
          <div className="position-relative flex-grow-1 mx-md-4" style={{ maxWidth: '480px' }}>
            <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: 'var(--app-text-muted, #94a3b8)' }} />
            <input
              ref={searchInputRef}
              type="text"
              className="form-control form-control-sm ps-5 pe-4 rounded-pill border"
              style={{
                background: 'var(--surface-bg, rgba(255,255,255,0.05))',
                borderColor: 'var(--border-color, rgba(255,255,255,0.2))',
                color: 'var(--app-text, #f8fafc)',
              }}
              placeholder="Search docs... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search documentation"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-close position-absolute top-50 end-0 translate-middle-y me-3 small"
                style={{ fontSize: '0.65rem', filter: 'var(--close-btn-filter, invert(1))' }}
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>

          {/* Quick links */}
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setSelectedId('api-overview')}
            >
              API Reference
            </button>
            <a
              href="https://github.com/your-org/EduFLowAI"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              style={{ color: 'var(--app-text-muted)', borderColor: 'var(--border-color)' }}
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
              <div
                className="card border-0 shadow-sm rounded-3 p-3"
                style={{
                  background: 'var(--card-bg, #0c121e)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--app-text, #f8fafc)',
                }}
              >
                {filteredSections.map((section) => (
                  <div key={section.category} className="mb-3">
                    <div
                      className="text-uppercase fw-bold small mb-2"
                      style={{
                        fontSize: '0.72rem',
                        letterSpacing: '0.05em',
                        color: 'var(--app-text-muted, #94a3b8)',
                      }}
                    >
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
                                : 'btn-light border-0'
                            }`}
                            style={{
                              fontSize: '0.85rem',
                              background: selectedId === item.id ? undefined : 'transparent',
                              color: selectedId === item.id ? '#ffffff' : 'var(--app-text, #cbd5e1)',
                            }}
                            onClick={() => setSelectedId(item.id)}
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
                  <div className="small py-3 text-center" style={{ color: 'var(--app-text-muted)' }}>
                    No matching sections found.
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="col-12 col-md-9 col-xl-10">
            <div
              className="card border-0 shadow-sm rounded-3 p-4 p-md-5"
              style={{
                background: 'var(--card-bg, #0c121e)',
                borderColor: 'var(--border-color)',
                color: 'var(--app-text, #f8fafc)',
                minHeight: '650px',
              }}
            >
              <div style={{ maxWidth: '800px' }}>
                {/* Header breadcrumb & Title */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 small mb-2" style={{ color: 'var(--app-text-muted)' }}>
                    <span>Docs</span>
                    <ChevronRight size={12} />
                    <span className="text-primary fw-medium">{activeDoc.title}</span>
                  </div>
                  <h1 className="h2 fw-bold mb-2" style={{ color: 'var(--app-text)' }}>{activeDoc.title}</h1>
                  {activeDoc.description && (
                    <p className="lead fs-6 mb-0" style={{ color: 'var(--app-text-muted)' }}>{activeDoc.description}</p>
                  )}
                </div>

                {/* Rendered Technical Guide Content */}
                <article className="docs-article" style={{ lineHeight: '1.7', fontSize: '0.95rem', color: 'var(--app-text)' }}>
                  {activeDoc.content}
                </article>

                {/* Footer nav */}
                <div
                  className="mt-5 pt-4 border-top d-flex justify-content-between align-items-center"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="small" style={{ color: 'var(--app-text-muted)' }}>
                    Last updated: October 2026 • EduFlow Technical Documentation
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    style={{ color: 'var(--app-text-muted)', borderColor: 'var(--border-color)' }}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
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
