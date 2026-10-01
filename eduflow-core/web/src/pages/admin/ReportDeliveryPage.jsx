import { useState, useEffect, useCallback } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { useAuth } from '../../hooks/useAuth'

const SAMPLE_TEMPLATE = `EXECUTIVE SUMMARY & GAP ANALYSIS REPORT

1. INSTITUTIONAL ACCREDITATION READINESS
EduFlow AI OS has evaluated the qualitative and quantitative metrics submitted by the institution against the Revised Accreditation Framework (RAF).

2. CRITERION BREAKDOWN & KEY FINDINGS
- Criterion 1: Curricular Aspects (Score: 3.42 / 4.00)
  Strong feedback loop established; recommendation to formalize industry advisory board inputs.
- Criterion 2: Teaching-Learning & Evaluation (Score: 3.18 / 4.00)
  Student-to-full-time teacher ratio is compliant. Remedial coaching for slow learners requires documented LMS tracking.
- Criterion 3: Research, Innovations & Extension (Score: 2.85 / 4.00)
  High-priority gap: Seed money grants and Scopus-indexed faculty publications require institutional funding enhancement.
- Criterion 4: Infrastructure & Learning Resources (Score: 3.60 / 4.00)
  Robust Wi-Fi bandwidth and digital library automation; annual maintenance contracts up to date.
- Criterion 5: Student Support & Progression (Score: 3.25 / 4.00)
  Active placement cell; competitive exam guidance participation logs verified.
- Criterion 6: Governance, Leadership & Management (Score: 3.50 / 4.00)
  IQAC strategic plans and decentralized administrative committees effectively operating.
- Criterion 7: Institutional Values & Best Practices (Score: 3.75 / 4.00)
  Green campus initiatives, solar arrays, and rainwater harvesting demonstrate distinctive excellence.

3. IMMEDIATE ACTION PLAN & RECOMMENDED TIMELINE
- Week 1-2: Finalize SSR data templates for Criteria 3 & 5.
- Week 3-4: Verify supporting geotagged photos and student attendance sheets.
- Week 5: Submit IIQA and upload institutional SSR onto the NAAC HEI portal.

Report prepared automatically by EduFlow AI Accreditation Engine.`

export default function ReportDeliveryPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Delivery Form State
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [reportType, setReportType] = useState('NAAC_EXECUTIVE_SUMMARY')
  const [title, setTitle] = useState('NAAC Accreditation Executive Audit')
  const [reportContent, setReportContent] = useState(SAMPLE_TEMPLATE)

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')

      // Fetch delivered reports
      const resReports = await fetch(`${getApiBaseURL()}/v1/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resReports.ok) {
        const data = await resReports.json()
        setReports(data.reports || [])
      }

      // Fetch leads to make selector convenient
      const resLeads = await fetch(`${getApiBaseURL()}/v1/leads?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resLeads.ok) {
        const data = await resLeads.json()
        setLeads(data.leads || [])
      }
    } catch (err) {
      showToast(err.message, true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchData()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [user, fetchData])

  const handleLeadSelect = (e) => {
    const id = e.target.value
    setSelectedLeadId(id)
    if (!id) return

    const lead = leads.find((l) => String(l.id) === String(id))
    if (lead) {
      setCollegeName(lead.college_name)
      setContactEmail(lead.email)
      setTitle(`NAAC Audit Report & Readiness Review - ${lead.college_name}`)
    }
  }

  const handleDeliver = async (e) => {
    e.preventDefault()
    if (!collegeName.trim() || !contactEmail.trim() || !reportContent.trim()) {
      showToast('Please fill all required fields', true)
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/reports/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId: selectedLeadId ? parseInt(selectedLeadId, 10) : null,
          collegeName,
          contactEmail,
          reportType,
          title,
          reportContent,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Delivery failed')
      }

      await res.json()
      showToast(`Report successfully delivered to ${contactEmail}!`)
      fetchData()
    } catch (err) {
      showToast(err.message, true)
    } finally {
      setSubmitting(false)
    }
  }

  const copyLink = (token) => {
    const url = `${window.location.origin}/r/${token}`
    navigator.clipboard.writeText(url)
    showToast('Secure report link copied to clipboard!')
  }

  return (
    <RolePageTemplate
      role="Admin"
      title="Accreditation Report Delivery"
      description="Compile, brand, and securely deliver automated NAAC audit packages to college administrators."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              padding: '0.85rem 1.25rem',
              borderRadius: '0.5rem',
              color: '#ffffff',
              background: toastMessage.isError ? '#EF4444' : '#10B981',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {toastMessage.text}
          </div>
        )}

        {/* Dispatch Form Card */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
            🚀 Deliver New Audit Report
          </h3>
          <form onSubmit={handleDeliver} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Select Lead (Optional Auto-fill)
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedLeadId}
                  onChange={handleLeadSelect}
                  style={{ fontWeight: 600 }}
                >
                  <option value="">-- Choose from existing leads --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.id}: {l.college_name} ({l.contact_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  College Name *
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. St. Xavier's Institute of Engineering"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Recipient Email *
                </label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="principal@college.edu"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Report Classification
                </label>
                <select
                  className="form-select form-select-sm"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  <option value="NAAC_EXECUTIVE_SUMMARY">NAAC Executive Summary</option>
                  <option value="SSR_CRITERION_AUDIT">SSR Criterion 1-7 Audit</option>
                  <option value="FAST_TRACK_PILOT">Fast-Track Pilot Audit</option>
                  <option value="NBA_COMPLIANCE_REVIEW">NBA Outcome Compliance Review</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                Report Title *
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>
                  Report Document Text *
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none"
                  onClick={() => setReportContent(SAMPLE_TEMPLATE)}
                  style={{ fontSize: '0.75rem', padding: 0 }}
                >
                  Load Sample NAAC Audit Template
                </button>
              </div>
              <textarea
                className="form-control"
                rows={10}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ fontWeight: 700, padding: '0.6rem 1.75rem' }}
              >
                {submitting ? 'Generating PDF & Dispatching...' : '✉️ Deliver Report to College'}
              </button>
            </div>
          </form>
        </div>

        {/* Previously Delivered Reports Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Delivered Reports Archive ({reports.length})
            </h3>
            <button className="btn btn-sm btn-outline-secondary" onClick={fetchData} disabled={loading} style={{ fontSize: '0.78rem' }}>
              🔄 Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading records...</div>
            ) : reports.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No reports delivered yet. Use the form above to dispatch your first report.</div>
            ) : (
              <table className="table table-hover mb-0" style={{ verticalAlign: 'middle' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-bg)' }}>
                    {['Delivered On', 'College', 'Recipient Email', 'Type', 'Views', 'Actions'].map((h) => (
                      <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '0.75rem 1rem' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', padding: '0.75rem 1rem' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1rem' }}>
                        <div>{r.college_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>{r.title}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', padding: '0.75rem 1rem' }}>
                        <a href={`mailto:${r.contact_email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
                          {r.contact_email}
                        </a>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                          {r.report_type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', padding: '0.75rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: r.views_count > 0 ? '#10B981' : '#64748b' }}>
                          👁️ {r.views_count} views
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <a
                            href={`/r/${r.token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Open Link
                          </a>
                          <button
                            className="btn btn-sm btn-light border"
                            onClick={() => copyLink(r.token)}
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            📋 Copy
                          </button>
                          <a
                            href={`/r/${r.token}/pdf`}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            📥 PDF
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
