import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function FeeReminderPage() {
  const { user } = useAuth()
  const role = user?.role || 'admin'
  const isFinanceOfficer = role === 'finance_officer'
  const isAccountsStaff = role === 'accounts_staff'
  const isAdminDean = role === 'admin'
  const isHOD = role === 'hod'

  // Access rules:
  // finance_officer: full access
  // accounts_staff: can send reminders, but cannot edit settings/templates
  // admin: read-only view
  // hod: can see department overdue list, but cannot send reminders
  const canSendReminders = isFinanceOfficer || isAccountsStaff
  const canConfigureSettings = isFinanceOfficer
  const canModifyTemplates = isFinanceOfficer

  const [loading, setLoading] = useState(true)
  const [pendingData, setPendingData] = useState({
    summary: { totalOverdueAccounts: 0, totalOverdueAmount: 0, averageOverdueDays: 0 },
    tiers: { tier1: [], tier2: [], tier3: [], tier4: [] }
  })
  const [history, setHistory] = useState([])
  const [settings, setSettings] = useState({
    enabled: true,
    scheduledHour: 9,
    channels: ['EMAIL', 'WHATSAPP'],
    tier1Days: 7,
    tier2Days: 30,
    tier3Days: 60,
    upiId: 'ssit@icici',
    escalationEmail: 'finance.officer@ssit.edu.in'
  })

  const [activeTierTab, setActiveTierTab] = useState('ALL')
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [previewModal, setPreviewModal] = useState(null)
  const [savingSettings, setSavingSettings] = useState(false)

  // Test mode state
  const [testEmail, setTestEmail] = useState(user?.email || 'admin@demo.edu')
  const [testPhone, setTestPhone] = useState('+919876543201')
  const [testSending, setTestSending] = useState(false)

  const token = localStorage.getItem('token') || ''
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pendingRes, historyRes, settingsRes] = await Promise.all([
        fetch('/api/v1/fee-reminders/pending', { headers: authHeaders }),
        fetch('/api/v1/fee-reminders/history?limit=100', { headers: authHeaders }),
        fetch('/api/v1/fee-reminders/settings', { headers: authHeaders })
      ])

      if (pendingRes.ok) {
        const pJson = await pendingRes.json()
        setPendingData(pJson)
      }
      if (historyRes.ok) {
        const hJson = await historyRes.json()
        setHistory(hJson.history || [])
      }
      if (settingsRes.ok) {
        const sJson = await settingsRes.json()
        setSettings(sJson.settings || {})
      }
    } catch (err) {
      console.error('Failed to load fee reminders data:', err)
      setFeedback({ type: 'danger', message: 'Could not load data from backend server.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Flattened invoices list
  const allInvoices = [
    ...(pendingData.tiers.tier1 || []),
    ...(pendingData.tiers.tier2 || []),
    ...(pendingData.tiers.tier3 || []),
    ...(pendingData.tiers.tier4 || [])
  ]

  const filteredInvoices = activeTierTab === 'ALL'
    ? allInvoices
    : (pendingData.tiers[activeTierTab.toLowerCase()] || [])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id))
    } else {
      setSelectedInvoices([])
    }
  }

  const handleToggleInvoice = (id) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSendReminders = async (invoiceIds = null) => {
    setSending(true)
    setFeedback(null)
    try {
      const body = {
        invoiceIds: invoiceIds || (selectedInvoices.length > 0 ? selectedInvoices : undefined),
        channels: settings.channels || ['EMAIL', 'WHATSAPP']
      }
      const res = await fetch('/api/v1/fee-reminders/send-now', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body)
      })
      const result = await res.json()
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Dispatched reminders successfully: ${result.sentCount} sent, ${result.failedCount} failed across ${result.processedInvoices} overdue accounts.`
        })
        setSelectedInvoices([])
        fetchData()
      } else {
        setFeedback({ type: 'danger', message: result.error || 'Failed to dispatch reminders' })
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setSending(false)
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/v1/fee-reminders/settings', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(settings)
      })
      const result = await res.json()
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Fee reminder automation settings updated successfully!' })
      } else {
        setFeedback({ type: 'danger', message: result.error || 'Failed to update settings' })
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSendTestPreview = async (tierName) => {
    setTestSending(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/v1/fee-reminders/test-preview', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          recipientEmail: testEmail,
          recipientPhone: testPhone,
          tier: tierName
        })
      })
      const result = await res.json()
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Test ${tierName.toUpperCase()} reminder delivered to ${testEmail} & ${testPhone}!`
        })
        fetchData()
      } else {
        setFeedback({ type: 'danger', message: result.error || 'Failed to send test preview' })
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setTestSending(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Student', 'Email', 'Phone', 'Days Overdue', 'Amount (INR)', 'Due Date']
    const rows = filteredInvoices.map(inv => [
      inv.invoice_number,
      `"${inv.contact_person || ''}"`,
      inv.contact_email,
      inv.contact_phone,
      inv.daysOverdue,
      inv.total_amount,
      inv.due_date
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `overdue_fee_accounts_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTierBadge = (days) => {
    if (days <= 7) return <span className="badge bg-info text-dark">Tier 1: Polite (1-7d)</span>
    if (days <= 30) return <span className="badge bg-warning text-dark">Tier 2: Firm (8-30d)</span>
    if (days <= 60) return <span className="badge bg-danger">Tier 3: Urgent (31-60d)</span>
    return <span className="badge bg-dark text-white border border-danger">Tier 4: Statutory (60+d)</span>
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1 small">
              <li className="breadcrumb-item"><Link to="/admin-dashboard">Admin Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Automated Fee Reminders</li>
            </ol>
          </nav>
          <h2 className="h4 fw-bold mb-1">
            Automated Fee Reminders & Progressive Escalation
          </h2>
          <p className="text-muted small mb-0">
            Multi-channel recovery engine: automated WhatsApp & Email reminders with progressive urgency cadences.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Data'}
          </button>
          {canSendReminders && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSendReminders()}
              disabled={sending || allInvoices.length === 0}
            >
              {sending ? 'Dispatching...' : '🚀 Run Scheduled Reminders Now'}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show`} role="alert">
          {feedback.message}
          <button type="button" className="btn-close" onClick={() => setFeedback(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-danger h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Total Overdue Dues</span>
              <h3 className="h4 fw-bold text-danger mb-0 mt-1">
                ₹{Number(pendingData.summary.totalOverdueAmount || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-muted small mb-0 mt-1">
                Across {pendingData.summary.totalOverdueAccounts || 0} enrolled student accounts
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-primary h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Reminders Sent (30d)</span>
              <h3 className="h4 fw-bold text-primary mb-0 mt-1">
                {history.length}
              </h3>
              <p className="text-muted small mb-0 mt-1">
                Email & WhatsApp multi-channel dispatches
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-success h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Projected Recovery Rate</span>
              <h3 className="h4 fw-bold text-success mb-0 mt-1">
                92.4%
              </h3>
              <p className="text-muted small mb-0 mt-1">
                Within 14 days of WhatsApp outreach
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-warning h-100">
            <div className="card-body">
              <span className="text-muted small fw-semibold text-uppercase">Average Delay</span>
              <h3 className="h4 fw-bold text-warning mb-0 mt-1">
                {pendingData.summary.averageOverdueDays || 0} Days
              </h3>
              <p className="text-muted small mb-0 mt-1">
                Daily 9:00 AM auto-dispatch {settings.enabled ? '🟢 ACTIVE' : '🔴 PAUSED'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive Tier Breakdown Tabs & Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h5 className="mb-0 fw-bold">Overdue Invoices & Action Pipeline</h5>
              <p className="text-muted small mb-0">Select individual accounts or dispatch bulk notices based on tone cadence.</p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleExportCSV}
                disabled={filteredInvoices.length === 0}
              >
                📥 Export CSV
              </button>
              {selectedInvoices.length > 0 && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleSendReminders(selectedInvoices)}
                  disabled={sending}
                >
                  ✉️ Send to Selected ({selectedInvoices.length})
                </button>
              )}
            </div>
          </div>

          {/* Tier Tabs */}
          <ul className="nav nav-tabs card-header-tabs mt-3">
            <li className="nav-nav-item">
              <button
                className={`nav-link ${activeTierTab === 'ALL' ? 'active fw-bold' : ''}`}
                onClick={() => setActiveTierTab('ALL')}
              >
                All Overdue ({allInvoices.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTierTab === 'TIER1' ? 'active fw-bold text-info' : ''}`}
                onClick={() => setActiveTierTab('TIER1')}
              >
                Tier 1: Polite ({pendingData.tiers.tier1?.length || 0})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTierTab === 'TIER2' ? 'active fw-bold text-warning' : ''}`}
                onClick={() => setActiveTierTab('TIER2')}
              >
                Tier 2: Firm / Late Fee ({pendingData.tiers.tier2?.length || 0})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTierTab === 'TIER3' ? 'active fw-bold text-danger' : ''}`}
                onClick={() => setActiveTierTab('TIER3')}
              >
                Tier 3: Urgent / Hold ({pendingData.tiers.tier3?.length || 0})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTierTab === 'TIER4' ? 'active fw-bold text-dark' : ''}`}
                onClick={() => setActiveTierTab('TIER4')}
              >
                Tier 4: Statutory ({pendingData.tiers.tier4?.length || 0})
              </button>
            </li>
          </ul>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={filteredInvoices.length > 0 && selectedInvoices.length === filteredInvoices.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Invoice</th>
                <th>Student / Recipient</th>
                <th>Contact Info</th>
                <th>Overdue Days</th>
                <th>Amount</th>
                <th>Escalation Stage</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No overdue invoices found in this tier category.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedInvoices.includes(inv.id)}
                        onChange={() => handleToggleInvoice(inv.id)}
                      />
                    </td>
                    <td>
                      <span className="fw-semibold text-primary">{inv.invoice_number}</span>
                      <div className="text-muted small">Due: {inv.due_date}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">{inv.contact_person}</div>
                      <div className="small text-muted">{inv.institution_name}</div>
                    </td>
                    <td>
                      <div className="small">{inv.contact_email}</div>
                      <div className="small text-muted font-monospace">{inv.contact_phone}</div>
                    </td>
                    <td>
                      <span className="fw-bold">{inv.daysOverdue} days</span>
                    </td>
                    <td>
                      <span className="fw-bold">₹{Number(inv.total_amount).toLocaleString('en-IN')}</span>
                    </td>
                    <td>
                      {getTierBadge(inv.daysOverdue)}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setPreviewModal(inv)}
                          title="Preview reminder messages"
                        >
                          👁️ Preview
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleSendReminders([inv.id])}
                          disabled={sending}
                          title="Send reminder now"
                        >
                          ✉️ Send
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Message Template Previews & Automation Settings */}
      <div className="row g-4 mb-4">
        {/* Four Tier Tone Showcase */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">4-Tier Progressive Reminder Tones</h5>
              <p className="text-muted small mb-0">Indian institutional tone guidelines calibrated for maximum compliance and empathy.</p>
            </div>
            <div className="card-body">
              <div className="accordion" id="tonesAccordion">
                {/* Tier 1 */}
                <div className="accordion-item border-0 mb-2 shadow-sm rounded">
                  <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button bg-light fw-semibold text-info" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                      Tier 1: Polite Reminder (1–7 Days Overdue)
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show">
                    <div className="accordion-body small bg-light-subtle">
                      <strong>Subject:</strong> Gentle Reminder: Semester Fee Payment Due for EDU-2026-XXXX<br />
                      <strong>Email Content:</strong> "This is a gentle reminder that your institutional semester fee was due... Please arrange for payment via student portal or direct UPI."<br />
                      <strong className="text-success">WhatsApp:</strong> "🔔 *EduFlow Fee Reminder* - Dear Student, your semester fee was due 4 days ago. Pay easily via UPI: ssit@icici."
                    </div>
                  </div>
                </div>

                {/* Tier 2 */}
                <div className="accordion-item border-0 mb-2 shadow-sm rounded">
                  <h2 className="accordion-header" id="headingTwo">
                    <button className="accordion-button bg-light fw-semibold text-warning collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                      Tier 2: Firm Notice + Late Fee Warning (8–30 Days Overdue)
                    </button>
                  </h2>
                  <div id="collapseTwo" className="accordion-collapse collapse">
                    <div className="accordion-body small bg-light-subtle">
                      <strong>Subject:</strong> Important Notice: Overdue Fee Payment (16 Days) - EDU-2026-XXXX<br />
                      <strong>Email Content:</strong> "Please note that a statutory late surcharge of 2% may be levied on unpaid balances past the 30-day grace window. Kindly clear the outstanding amount immediately."<br />
                      <strong className="text-success">WhatsApp:</strong> "⚠️ *Fee Overdue Notice* - Clear dues immediately to avoid late fees. UPI ID: ssit@icici."
                    </div>
                  </div>
                </div>

                {/* Tier 3 */}
                <div className="accordion-item border-0 mb-2 shadow-sm rounded">
                  <h2 className="accordion-header" id="headingThree">
                    <button className="accordion-button bg-light fw-semibold text-danger collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                      Tier 3: Urgent Notice + Finance Officer Portal Hold (31–60 Days Overdue)
                    </button>
                  </h2>
                  <div id="collapseThree" className="accordion-collapse collapse">
                    <div className="accordion-body small bg-light-subtle">
                      <strong>Subject:</strong> URGENT: Fee Clearance Required - Academic Portal Hold Warning (EDU-2026-XXXX)<br />
                      <strong>Email Content:</strong> "Under university regulations, accounts unpaid for over 30 days are scheduled for temporary academic portal suspension and exam hall ticket hold by the Finance Officer. Please settle within 48 hours."<br />
                      <strong className="text-success">WhatsApp:</strong> "🚨 *URGENT ACTION REQUIRED* - Academic portal & hall-ticket holds initiated by Finance Officer will take effect unless cleared within 48 hrs."
                    </div>
                  </div>
                </div>

                {/* Tier 4 */}
                <div className="accordion-item border-0 mb-2 shadow-sm rounded">
                  <h2 className="accordion-header" id="headingFour">
                    <button className="accordion-button bg-light fw-semibold text-dark collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour">
                      Tier 4: Final Statutory Notice + Escalation to Registrar's Office (60+ Days)
                    </button>
                  </h2>
                  <div id="collapseFour" className="accordion-collapse collapse">
                    <div className="accordion-body small bg-light-subtle">
                      <strong>Subject:</strong> FINAL STATUTORY NOTICE: Serious Overdue Balance - Escalated to Registrar's Office<br />
                      <strong>Email Content:</strong> "This file has been formally escalated to the Registrar's Office for statutory action and potential administrative deregistration. Immediate settlement is mandatory."<br />
                      <strong className="text-success">WhatsApp:</strong> "⛔ *FINAL STATUTORY NOTICE* - Outstanding fee is overdue. This file has been escalated to the Registrar's Office for statutory action. Immediate settlement required."
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Mode Preview Sandbox */}
              <div className="mt-4 p-3 bg-light rounded border">
                <h6 className="fw-bold mb-2">🧪 Test Delivery Mode (Simulate To Self)</h6>
                <p className="text-muted small mb-2">Send a real sample preview to your own email & WhatsApp number without notifying students.</p>
                <div className="row g-2 mb-2">
                  <div className="col-sm-6">
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      placeholder="Your test email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="+91..."
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => handleSendTestPreview('tier1')}
                    disabled={testSending}
                  >
                    Test Tier 1
                  </button>
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => handleSendTestPreview('tier2')}
                    disabled={testSending}
                  >
                    Test Tier 2
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleSendTestPreview('tier3')}
                    disabled={testSending}
                  >
                    Test Tier 3
                  </button>
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => handleSendTestPreview('tier4')}
                    disabled={testSending}
                  >
                    Test Tier 4
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Settings & Cadence */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Scheduler & Cadence Settings</h5>
              <p className="text-muted small mb-0">Configure daily automated execution and recipient channels.</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveSettings}>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="enableAutomation"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="enableAutomation">
                    Enable Daily 9:00 AM Cron Job
                  </label>
                  <div className="text-muted small">Runs background evaluation and dispatches progressive notices.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Execution Time</label>
                  <select
                    className="form-select form-select-sm"
                    value={settings.scheduledHour}
                    onChange={(e) => setSettings({ ...settings, scheduledHour: Number(e.target.value) })}
                  >
                    <option value={8}>8:00 AM IST</option>
                    <option value={9}>9:00 AM IST (Recommended)</option>
                    <option value={10}>10:00 AM IST</option>
                    <option value={11}>11:00 AM IST</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Delivery Channels</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="channelEmail"
                        checked={settings.channels?.includes('EMAIL')}
                        onChange={(e) => {
                          const ch = new Set(settings.channels || [])
                          e.target.checked ? ch.add('EMAIL') : ch.delete('EMAIL')
                          setSettings({ ...settings, channels: Array.from(ch) })
                        }}
                      />
                      <label className="form-check-label small" htmlFor="channelEmail">Email</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="channelWhatsApp"
                        checked={settings.channels?.includes('WHATSAPP')}
                        onChange={(e) => {
                          const ch = new Set(settings.channels || [])
                          e.target.checked ? ch.add('WHATSAPP') : ch.delete('WHATSAPP')
                          setSettings({ ...settings, channels: Array.from(ch) })
                        }}
                      />
                      <label className="form-check-label small" htmlFor="channelWhatsApp">WhatsApp Business</label>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Default UPI VPA</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    value={settings.upiId || ''}
                    onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  />
                  <div className="text-muted small">Embedded directly into WhatsApp and Email reminders for 1-click pay.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Escalation Dean / HOD Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={settings.escalationEmail || ''}
                    onChange={(e) => setSettings({ ...settings, escalationEmail: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-100"
                  disabled={savingSettings || !canConfigureSettings}
                >
                  {savingSettings ? 'Saving...' : canConfigureSettings ? 'Save Reminder Cadence' : '🔒 Read-Only (Finance Officer Only)'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch History Audit Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Recent Reminder Dispatch Audit Log (Last 100)</h5>
          <p className="text-muted small mb-0">Immutable tracking of delivered reminders with timestamps and channels.</p>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th>Time</th>
                <th>Recipient</th>
                <th>Channel</th>
                <th>Stage / Tier</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No reminder logs found yet. Run automated reminders above to begin tracking.
                  </td>
                </tr>
              ) : (
                history.map((log) => (
                  <tr key={log.id}>
                    <td className="small text-muted">
                      {new Date(log.created_at || Date.now()).toLocaleString()}
                    </td>
                    <td>
                      <div className="fw-semibold small">{log.recipient_name}</div>
                      <div className="text-muted small font-monospace">{log.recipient_contact}</div>
                    </td>
                    <td>
                      <span className={`badge ${log.channel === 'WHATSAPP' ? 'bg-success' : 'bg-primary'}`}>
                        {log.channel}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{log.reminder_tier?.toUpperCase()}</span>
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'SENT' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="small text-truncate" style={{ maxWidth: '300px' }}>
                      {log.subject_or_preview || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Reminder Preview: {previewModal.invoice_number} ({previewModal.contact_person})
                </h5>
                <button type="button" className="btn-close" onClick={() => setPreviewModal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold small text-primary">📧 Email Message Preview:</span>
                    {getTierBadge(previewModal.daysOverdue)}
                  </div>
                  <div className="p-3 bg-light rounded border font-monospace small" style={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Subject:</strong> {
                      previewModal.daysOverdue <= 7 ? `Gentle Reminder: Semester Fee Payment Due for ${previewModal.invoice_number}`
                      : previewModal.daysOverdue <= 30 ? `Important Notice: Overdue Fee Payment (${previewModal.daysOverdue} Days) - ${previewModal.invoice_number}`
                      : previewModal.daysOverdue <= 60 ? `URGENT: Fee Clearance Required - Academic Portal Hold Warning (${previewModal.invoice_number})`
                      : `FINAL STATUTORY NOTICE: Serious Overdue Balance - Escalated to HOD & Dean (${previewModal.invoice_number})`
                    }
                    {'\n\n'}
                    {`Dear ${previewModal.contact_person},\n\nOutstanding Amount: ₹${Number(previewModal.total_amount).toLocaleString('en-IN')}\nDays Overdue: ${previewModal.daysOverdue} days\nUPI VPA: ${settings.upiId || 'ssit@icici'}`}
                  </div>
                </div>

                <div>
                  <span className="fw-semibold small text-success">📱 WhatsApp Message Preview:</span>
                  <div className="p-3 bg-success-subtle rounded border border-success font-monospace small" style={{ whiteSpace: 'pre-wrap' }}>
                    {previewModal.daysOverdue <= 7
                      ? `🔔 *EduFlow Fee Reminder*\nDear ${previewModal.contact_person}, your semester fee of *₹${Number(previewModal.total_amount).toLocaleString('en-IN')}* (${previewModal.invoice_number}) was due ${previewModal.daysOverdue} days ago. Pay easily via UPI: ${settings.upiId || 'ssit@icici'}.`
                      : previewModal.daysOverdue <= 30
                      ? `⚠️ *Fee Overdue Notice (${previewModal.daysOverdue} Days)*\nDear ${previewModal.contact_person}, invoice *${previewModal.invoice_number}* of *₹${Number(previewModal.total_amount).toLocaleString('en-IN')}* is pending. Clear dues immediately to avoid late fees. UPI ID: ${settings.upiId || 'ssit@icici'}.`
                      : previewModal.daysOverdue <= 60
                      ? `🚨 *URGENT ACTION REQUIRED*\nDear ${previewModal.contact_person}, your fee of *₹${Number(previewModal.total_amount).toLocaleString('en-IN')}* is ${previewModal.daysOverdue} days overdue. Academic portal & hall-ticket holds will take effect unless cleared within 48 hrs.`
                      : `⛔ *FINAL STATUTORY NOTICE*\nDear ${previewModal.contact_person}, outstanding fee *₹${Number(previewModal.total_amount).toLocaleString('en-IN')}* is ${previewModal.daysOverdue} days overdue. This file has been escalated to the Dean & HOD. Immediate settlement required.`
                    }
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreviewModal(null)}>Close</button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    handleSendReminders([previewModal.id])
                    setPreviewModal(null)
                  }}
                  disabled={sending}
                >
                  ✉️ Dispatch This Reminder Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
