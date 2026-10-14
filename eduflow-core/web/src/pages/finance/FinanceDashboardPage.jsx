import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function FinanceDashboardPage() {
  const { user } = useAuth()
  const isReadOnly = user?.role === 'admin'
  const isFinanceOfficer = user?.role === 'finance_officer'
  const isAccountsStaff = user?.role === 'accounts_staff'

  const [_loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  
  // Section 1: Financial Health Snapshot
  const [snapshot, setSnapshot] = useState({
    totalCollectedMonth: 18450000,
    totalOverdue: 223000,
    totalWaivedMonth: 120000,
    collectionEfficiency: 98.8,
    cashFlowForecast30d: 4500000
  })

  // Section 2: Overdue Breakdown
  const [overdueBreakdown] = useState({
    deptWise: [
      { dept: 'Computer Science & Engineering', code: 'CSE', overdue: 95000, count: 2 },
      { dept: 'Electronics & Communication', code: 'ECE', overdue: 54000, count: 1 },
      { dept: 'Mechanical Engineering', code: 'MECH', overdue: 48000, count: 1 },
      { dept: 'Civil Engineering', code: 'CIVIL', overdue: 26000, count: 1 }
    ],
    tiers: {
      tier1: { count: 1, amount: 59000, label: 'Tier 1 (1–7d: Polite)' },
      tier2: { count: 1, amount: 54000, label: 'Tier 2 (8–30d: Firm)' },
      tier3: { count: 1, amount: 48000, label: 'Tier 3 (31–60d: Urgent)' },
      tier4: { count: 1, amount: 62000, label: 'Tier 4 (60+d: Statutory)' }
    },
    trend12Months: [
      { month: 'Nov', collected: 14200000 },
      { month: 'Dec', collected: 15100000 },
      { month: 'Jan', collected: 19800000 },
      { month: 'Feb', collected: 17500000 },
      { month: 'Mar', collected: 21200000 },
      { month: 'Apr', collected: 16800000 },
      { month: 'May', collected: 14900000 },
      { month: 'Jun', collected: 18500000 },
      { month: 'Jul', collected: 24500000 },
      { month: 'Aug', collected: 22100000 },
      { month: 'Sep', collected: 19400000 },
      { month: 'Oct', collected: 18450000 }
    ]
  })

  // Section 3: Fee Collection Workflow state
  const [batchDept, setBatchDept] = useState('CSE')
  const [batchSemester, setBatchSemester] = useState('5')
  const [batchAmount, setBatchAmount] = useState('65000')
  const [manualUtr, setManualUtr] = useState('')
  const [manualInvoiceNo, setManualInvoiceNo] = useState('')
  const [manualAmount, setManualAmount] = useState('')

  // Section 4: Reconciliation Queue
  const [reconQueue, setReconQueue] = useState([
    {
      id: 'REC-101',
      bankRef: 'SBI-UTR-9928172635',
      bankAmount: 59000,
      studentName: 'Rahul Sharma (Roll: 1ST22CS089)',
      suggestedInvoice: 'EDU-2026-0041',
      matchConfidence: 'HIGH',
      date: '2026-10-12'
    },
    {
      id: 'REC-102',
      bankRef: 'HDFC-IMPS-88192019',
      bankAmount: 54000,
      studentName: 'Pooja Hegde (Roll: 1ST22EC045)',
      suggestedInvoice: 'EDU-2026-0042',
      matchConfidence: 'HIGH',
      date: '2026-10-11'
    },
    {
      id: 'REC-103',
      bankRef: 'ICICI-UPI-99482103',
      bankAmount: 48000,
      studentName: 'Unassigned VPA remitter',
      suggestedInvoice: 'EDU-2026-0043',
      matchConfidence: 'MEDIUM',
      date: '2026-10-10'
    }
  ])

  // Section 5: Scholarships & Waivers
  const [waivers] = useState([
    {
      id: 'WAV-01',
      studentName: 'Suresh Raina (Roll: 1ST23CS012)',
      requestedAmount: 150000,
      reason: 'National Sports Merit Scholarship Waiver',
      status: 'ROUTED_TO_DEAN',
      routedReason: 'Exceeds ₹1 Lakh threshold: Requires Dean Statutory Sanction'
    },
    {
      id: 'WAV-02',
      studentName: 'Meenakshi Iyer (Roll: 1ST22EC088)',
      requestedAmount: 35000,
      reason: 'Single Parent Income Concession',
      status: 'APPROVED_BY_FINANCE',
      routedReason: 'Within Finance Officer Sanction Limit (< ₹1 Lakh)'
    }
  ])

  useEffect(() => {
    // Simulated live query from backend fee reminders & invoices
    const loadData = async () => {
      try {
        const res = await fetch('/api/v1/fee-reminders/pending', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.summary) {
            setSnapshot(prev => ({
              ...prev,
              totalOverdue: json.summary.totalOverdueAmount || prev.totalOverdue
            }))
          }
        }
      } catch (err) {
        console.warn('Finance live metrics load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleGenerateBatch = (e) => {
    e.preventDefault()
    if (isReadOnly) return
    setFeedback({
      type: 'success',
      message: `Batch invoices successfully generated for ${batchDept} Semester ${batchSemester} (₹${Number(batchAmount).toLocaleString('en-IN')} per student).`
    })
  }

  const handleRecordManualPayment = (e) => {
    e.preventDefault()
    if (isReadOnly) return
    if (!manualUtr || !manualInvoiceNo) {
      setFeedback({ type: 'warning', message: 'Please provide both Invoice Number and UTR / Transaction ID.' })
      return
    }
    setFeedback({
      type: 'success',
      message: `Manual settlement of ₹${manualAmount || 'due amount'} recorded for ${manualInvoiceNo} with UTR: ${manualUtr}.`
    })
    setManualUtr('')
    setManualInvoiceNo('')
    setManualAmount('')
  }

  const handleApproveRecon = (recId) => {
    if (isReadOnly) return
    setReconQueue(prev => prev.filter(r => r.id !== recId))
    setFeedback({ type: 'success', message: `Entry ${recId} successfully reconciled and ledger balanced.` })
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary px-2 py-1">IIT / University Governance Model</span>
            {isReadOnly && <span className="badge bg-warning text-dark">Dean Read-Only Access</span>}
            {isFinanceOfficer && <span className="badge bg-success">Finance Officer Authority</span>}
            {isAccountsStaff && <span className="badge bg-info text-dark">Accounts Staff Scope</span>}
          </div>
          <h2 className="h4 fw-bold mb-1">Financial Governance & Accounts Command</h2>
          <p className="text-muted small mb-0">
            Institutional revenue, fee collections, bank ledger reconciliation, and scholarship governance.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link to="/finance-dashboard/fee-reminders" className="btn btn-outline-primary btn-sm">
            🔔 Fee Reminders Engine
          </Link>
          <Link to="/finance-dashboard/upi-collection" className="btn btn-outline-success btn-sm">
            📲 UPI Collection Desk
          </Link>
          <Link to="/finance-dashboard/invoices" className="btn btn-primary btn-sm">
            💳 Invoice Generator
          </Link>
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show`} role="alert">
          {feedback.message}
          <button type="button" className="btn-close" onClick={() => setFeedback(null)} aria-label="Close"></button>
        </div>
      )}

      {/* SECTION 1: Financial Health Snapshot */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wide">Section 1 — Financial Health Snapshot</h5>
        <div className="row g-3">
          <div className="col-md-2dot4 col-sm-6 col-12">
            <div className="card shadow-sm border-0 border-start border-4 border-success h-100">
              <div className="card-body p-3">
                <span className="text-muted small fw-semibold text-uppercase">Total Collected This Month</span>
                <h4 className="fw-bold text-success mb-0 mt-1">₹{Number(snapshot.totalCollectedMonth).toLocaleString('en-IN')}</h4>
                <div className="small text-muted mt-1">Across all colleges & hostels</div>
              </div>
            </div>
          </div>
          <div className="col-md-2dot4 col-sm-6 col-12">
            <div className="card shadow-sm border-0 border-start border-4 border-danger h-100">
              <div className="card-body p-3">
                <span className="text-muted small fw-semibold text-uppercase">Total Overdue</span>
                <h4 className="fw-bold text-danger mb-0 mt-1">₹{Number(snapshot.totalOverdue).toLocaleString('en-IN')}</h4>
                <div className="small text-muted mt-1">4 active escalated accounts</div>
              </div>
            </div>
          </div>
          <div className="col-md-2dot4 col-sm-6 col-12">
            <div className="card shadow-sm border-0 border-start border-4 border-info h-100">
              <div className="card-body p-3">
                <span className="text-muted small fw-semibold text-uppercase">Fee Waivers Approved</span>
                <h4 className="fw-bold text-info mb-0 mt-1">₹{Number(snapshot.totalWaivedMonth).toLocaleString('en-IN')}</h4>
                <div className="small text-muted mt-1">Merit & economic concessions</div>
              </div>
            </div>
          </div>
          <div className="col-md-2dot4 col-sm-6 col-12">
            <div className="card shadow-sm border-0 border-start border-4 border-primary h-100">
              <div className="card-body p-3">
                <span className="text-muted small fw-semibold text-uppercase">Collection Efficiency</span>
                <h4 className="fw-bold text-primary mb-0 mt-1">{snapshot.collectionEfficiency}%</h4>
                <div className="small text-muted mt-1">Benchmark: &gt; 95.0%</div>
              </div>
            </div>
          </div>
          <div className="col-md-2dot4 col-sm-6 col-12">
            <div className="card shadow-sm border-0 border-start border-4 border-warning h-100">
              <div className="card-body p-3">
                <span className="text-muted small fw-semibold text-uppercase">30-Day Cash Forecast</span>
                <h4 className="fw-bold text-warning mb-0 mt-1">₹{Number(snapshot.cashFlowForecast30d).toLocaleString('en-IN')}</h4>
                <div className="small text-muted mt-1">Projected fee inflows</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Overdue Breakdown (Aggregate Only) */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">Department-wise Overdue & Collection Breakdown</h6>
              <div className="text-muted small">Academic departments monitored for semester fee clearances.</div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th>Department</th>
                    <th>Code</th>
                    <th>Pending Accounts</th>
                    <th className="text-end">Total Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueBreakdown.deptWise.map((d, i) => (
                    <tr key={i}>
                      <td className="fw-semibold">{d.dept}</td>
                      <td><span className="badge bg-secondary">{d.code}</span></td>
                      <td>{d.count} Students</td>
                      <td className="text-end fw-bold text-danger">₹{Number(d.overdue).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0">Tier-wise Urgency Distribution</h6>
              <div className="text-muted small">Cadence progression across institutional delay tiers.</div>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center py-2 px-0 border-0">
                  <div>
                    <span className="badge bg-info text-dark me-2">Tier 1</span>
                    <span className="small">1–7 Days (Polite Notice)</span>
                  </div>
                  <span className="fw-bold">₹{Number(overdueBreakdown.tiers.tier1.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center py-2 px-0 border-0">
                  <div>
                    <span className="badge bg-warning text-dark me-2">Tier 2</span>
                    <span className="small">8–30 Days (Firm + Late Fee)</span>
                  </div>
                  <span className="fw-bold">₹{Number(overdueBreakdown.tiers.tier2.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center py-2 px-0 border-0">
                  <div>
                    <span className="badge bg-danger me-2">Tier 3</span>
                    <span className="small">31–60 Days (Finance Officer Hold)</span>
                  </div>
                  <span className="fw-bold text-danger">₹{Number(overdueBreakdown.tiers.tier3.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center py-2 px-0 border-0">
                  <div>
                    <span className="badge bg-dark text-white me-2">Tier 4</span>
                    <span className="small">60+ Days (Registrar Statutory)</span>
                  </div>
                  <span className="fw-bold text-danger">₹{Number(overdueBreakdown.tiers.tier4.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-light rounded border">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold">12-Month Inflow Peak:</span>
                  <span className="small fw-bold text-success">July (₹2.45 Cr)</span>
                </div>
                <div className="small text-muted">
                  Highest collection cycle coincides with odd-semester admissions & annual tuition windows.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Fee Collection Workflow */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="fw-bold mb-0">Section 3 — Fee Collection Workflows</h6>
          <div className="text-muted small">Batch billing and direct counter-UTR reconciliation desk.</div>
        </div>
        <div className="card-body">
          <div className="row g-4">
            {/* Batch Invoice Generation */}
            <div className="col-md-6 border-end">
              <h6 className="fw-semibold text-primary mb-2">📑 Batch Invoice Generation</h6>
              <p className="text-muted small mb-3">Emit semester invoices en-masse for an entire department cohort.</p>
              <form onSubmit={handleGenerateBatch}>
                <div className="row g-2 mb-2">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold">Target Department</label>
                    <select
                      className="form-select form-select-sm"
                      value={batchDept}
                      onChange={(e) => setBatchDept(e.target.value)}
                      disabled={isReadOnly}
                    >
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="MECH">Mechanical (MECH)</option>
                      <option value="CIVIL">Civil (CIVIL)</option>
                      <option value="IT">Information Tech (IT)</option>
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold">Semester</label>
                    <select
                      className="form-select form-select-sm"
                      value={batchSemester}
                      onChange={(e) => setBatchSemester(e.target.value)}
                      disabled={isReadOnly}
                    >
                      <option value="1">Semester 1</option>
                      <option value="3">Semester 3</option>
                      <option value="5">Semester 5</option>
                      <option value="7">Semester 7</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Tuition & Exam Fee (INR)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={batchAmount}
                    onChange={(e) => setBatchAmount(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isReadOnly}
                >
                  Generate Cohort Invoices
                </button>
              </form>
            </div>

            {/* Manual Payment Settlement */}
            <div className="col-md-6">
              <h6 className="fw-semibold text-success mb-2">💵 Counter & Offline UTR Receipting</h6>
              <p className="text-muted small mb-3">Record bank DD, NEFT, or Cash receipts against issued invoices.</p>
              <form onSubmit={handleRecordManualPayment}>
                <div className="row g-2 mb-2">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold">Invoice Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="EDU-2026-XXXX"
                      value={manualInvoiceNo}
                      onChange={(e) => setManualInvoiceNo(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold">Bank UTR / Chq No.</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="SBI-UTR-..."
                      value={manualUtr}
                      onChange={(e) => setManualUtr(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Amount Received (INR)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="59000"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success btn-sm"
                  disabled={isReadOnly}
                >
                  Post Payment & Reconcile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Reconciliation Queue */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold mb-0">Section 4 — Bank Statement Reconciliation Queue</h6>
            <div className="text-muted small">Auto-matched UPI and NEFT transactions awaiting Accounts clearance.</div>
          </div>
          <span className="badge bg-primary">{reconQueue.length} Pending Actions</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th>Bank Reference / UTR</th>
                <th>Remitter / Student</th>
                <th>Amount</th>
                <th>Suggested Invoice</th>
                <th>AI Confidence</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {reconQueue.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No pending reconciliation items. All bank feeds balanced.
                  </td>
                </tr>
              ) : (
                reconQueue.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="fw-semibold font-monospace small">{item.bankRef}</span>
                      <div className="text-muted small">{item.date}</div>
                    </td>
                    <td>{item.studentName}</td>
                    <td className="fw-bold">₹{Number(item.bankAmount).toLocaleString('en-IN')}</td>
                    <td><span className="badge bg-light text-primary border">{item.suggestedInvoice}</span></td>
                    <td>
                      <span className={`badge ${item.matchConfidence === 'HIGH' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {item.matchConfidence} MATCH
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => handleApproveRecon(item.id)}
                        disabled={isReadOnly}
                      >
                        ✓ Accept & Clear
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: Scholarship and Waiver Management */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h6 className="fw-bold mb-0">Scholarship & Fee Waiver Governance</h6>
          <div className="text-muted small">
            Statutory separation: Waivers &lt; ₹1 Lakh decided by Finance Officer; Waivers &gt; ₹1,00,000 auto-route to Dean.
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th>Ref ID</th>
                <th>Student</th>
                <th>Waiver Amount</th>
                <th>Concession Category</th>
                <th>Approval Governance Status</th>
                <th>Policy Rule</th>
              </tr>
            </thead>
            <tbody>
              {waivers.map((w) => (
                <tr key={w.id}>
                  <td className="font-monospace small fw-semibold">{w.id}</td>
                  <td className="fw-semibold">{w.studentName}</td>
                  <td className="fw-bold text-primary">₹{Number(w.requestedAmount).toLocaleString('en-IN')}</td>
                  <td>{w.reason}</td>
                  <td>
                    {w.status === 'ROUTED_TO_DEAN' ? (
                      <span className="badge bg-warning text-dark">
                        ⚖️ Pending Dean Approval (&gt; ₹1L)
                      </span>
                    ) : (
                      <span className="badge bg-success">
                        ✓ Sanctioned by Finance Officer
                      </span>
                    )}
                  </td>
                  <td className="small text-muted">{w.routedReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
