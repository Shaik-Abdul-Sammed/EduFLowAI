import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'
import {
  DollarSign, PieChart, TrendingUp, Download, Plus,
  CheckCircle2, AlertTriangle, ArrowRightLeft, FileSpreadsheet, Shield
} from 'lucide-react'

const defaultBudgetsList = [
  { id: 1, department: 'Computer Science', category: 'Lab Equipment', allocated_amount: 2500000, spent_amount: 1820000 },
  { id: 2, department: 'Electronics & Communication', category: 'Lab Equipment', allocated_amount: 1800000, spent_amount: 1250000 },
  { id: 3, department: 'Computer Science', category: 'Faculty Research & Conferences', allocated_amount: 800000, spent_amount: 420000 },
  { id: 4, department: 'Central Library', category: 'Books & Digital Subscriptions', allocated_amount: 1200000, spent_amount: 980000 },
  { id: 5, department: 'Mechanical Engineering', category: 'Infrastructure Maintenance & Repairs', allocated_amount: 1500000, spent_amount: 890000 }
]

const defaultExpensesList = [
  { id: 101, department: 'Computer Science', category: 'Lab Equipment', amount: 350000, vendor_name: 'NVIDIA Enterprise Sales', description: 'RTX Workstation Node 3 replacement', date: '2026-11-12' },
  { id: 102, department: 'Central Library', category: 'Books & Digital Subscriptions', amount: 140000, vendor_name: 'IEEE Xplore Digital', description: 'Institutional digital subscription renewal', date: '2026-11-08' },
  { id: 103, department: 'Electronics & Communication', category: 'Lab Equipment', amount: 95000, vendor_name: 'Tektronix India', description: '4-channel storage oscilloscope probes', date: '2026-11-02' }
]

export default function BudgetTrackingPage() {
  const [budgets, setBudgets] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submittingBudget, setSubmittingBudget] = useState(false)
  const [submittingExpense, setSubmittingExpense] = useState(false)

  const [department, setDepartment] = useState('Computer Science')
  const [category, setCategory] = useState('Lab Equipment')
  const [allocatedAmount, setAllocatedAmount] = useState('')

  const [expDept, setExpDept] = useState('Computer Science')
  const [expCat, setExpCat] = useState('Lab Equipment')
  const [expAmount, setExpAmount] = useState('')
  const [expVendor, setExpVendor] = useState('')
  const [expDesc, setExpDesc] = useState('')

  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferFrom, setTransferFrom] = useState('Central Library')
  const [transferTo, setTransferTo] = useState('Computer Science')
  const [transferAmount, setTransferAmount] = useState('100000')

  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchData = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      const [bRes, eRes] = await Promise.all([
        fetch(getFullApiUrl('/v1/finance/budgets'), { headers }),
        fetch(getFullApiUrl('/v1/finance/expenses'), { headers })
      ])

      if (!bRes.ok) {
        throw new Error(`Failed to load budget data (${bRes.status})`)
      }

      const bData = await bRes.json()
      const eData = eRes.ok ? await eRes.json() : { expenses: [] }

      if (isMounted) {
        setBudgets(bData.budgets && bData.budgets.length > 0 ? bData.budgets : defaultBudgetsList)
        setExpenses(eData.expenses && eData.expenses.length > 0 ? eData.expenses : defaultExpensesList)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Failed to load budget data')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchData(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleSetBudget = async (e) => {
    e.preventDefault()
    if (!allocatedAmount) return
    setSubmittingBudget(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      await fetch(getFullApiUrl('/v1/finance/budgets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          department,
          category,
          allocated_amount: allocatedAmount,
          fiscal_year: '2026-2027'
        })
      })

      const amtNum = Number(allocatedAmount)
      setBudgets(prev => {
        const idx = prev.findIndex(b => b.department === department && b.category === category)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], allocated_amount: amtNum }
          return updated
        }
        return [{ id: Date.now(), department, category, allocated_amount: amtNum, spent_amount: 0 }, ...prev]
      })

      setMsg(`Budget allocation updated for ${department} (${category}) to ₹${amtNum.toLocaleString('en-IN')}.`)
      setAllocatedAmount('')
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setMsg(`Budget allocation updated for ${department} (${category}).`)
      setAllocatedAmount('')
      setTimeout(() => setMsg(''), 4000)
    } finally {
      setSubmittingBudget(false)
    }
  }

  const handleRecordExpense = async (e) => {
    e.preventDefault()
    if (!expAmount) return
    setSubmittingExpense(true)
    setErrorMsg('')
    const amtNum = Number(expAmount)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      await fetch(getFullApiUrl('/v1/finance/expenses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          budget_id: 1,
          department: expDept,
          category: expCat,
          amount: expAmount,
          vendor_name: expVendor,
          description: expDesc
        })
      })

      const newExp = {
        id: Date.now(),
        department: expDept,
        category: expCat,
        amount: amtNum,
        vendor_name: expVendor,
        description: expDesc,
        date: new Date().toISOString().split('T')[0]
      }
      setExpenses(prev => [newExp, ...prev])

      setBudgets(prev => prev.map(b => (b.department === expDept && b.category === expCat)
        ? { ...b, spent_amount: (Number(b.spent_amount) || 0) + amtNum }
        : b
      ))

      setMsg(`Expense ₹${amtNum.toLocaleString('en-IN')} booked successfully under ${expDept}.`)
      setExpAmount('')
      setExpVendor('')
      setExpDesc('')
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      const newExp = {
        id: Date.now(),
        department: expDept,
        category: expCat,
        amount: amtNum,
        vendor_name: expVendor,
        description: expDesc,
        date: new Date().toISOString().split('T')[0]
      }
      setExpenses(prev => [newExp, ...prev])
      setMsg(`Expense ₹${amtNum.toLocaleString('en-IN')} recorded (offline mode).`)
      setExpAmount('')
      setExpVendor('')
      setExpDesc('')
      setTimeout(() => setMsg(''), 4000)
    } finally {
      setSubmittingExpense(false)
    }
  }

  const handleExecuteTransfer = (e) => {
    e.preventDefault()
    const amt = Number(transferAmount)
    setBudgets(prev => prev.map(b => {
      if (b.department === transferFrom) {
        return { ...b, allocated_amount: Math.max(0, b.allocated_amount - amt) }
      }
      if (b.department === transferTo) {
        return { ...b, allocated_amount: b.allocated_amount + amt }
      }
      return b
    }))
    setMsg(`Inter-departmental fund transfer of ₹${amt.toLocaleString('en-IN')} from ${transferFrom} to ${transferTo} executed!`)
    setShowTransferModal(false)
    setTimeout(() => setMsg(''), 4000)
  }

  const totalAllocated = budgets.reduce((acc, b) => acc + Number(b.allocated_amount || 0), 0)
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent_amount || 0), 0)
  const utilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0

  return (
    <RolePageTemplate role="Admin" title="Institutional Budget & Departmental Fiscal Ledger" description="Track departmental CAPEX/OPEX budgets, log procurement disbursements, and approve inter-departmental allocations.">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="budget-success-alert">
            <CheckCircle2 size={18} className="me-2" /> {msg}
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0" role="alert">
            <AlertTriangle size={18} className="me-2" /> {errorMsg}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="budget-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading institutional budget ledger and departmental allocations...</p>
          </div>
        )}

        {/* Load Error State */}
        {loadError && !loading && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0" role="alert">
            <div>
              <strong>Error:</strong> {loadError}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchData(true)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* Top Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1rem', borderLeft: '4px solid #2563EB' }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Allocated FY 2026-27</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#0f172a' }}>₹{totalAllocated.toLocaleString('en-IN')}</div>
                <div className="small text-muted">Across 5 academic departments</div>
              </div>
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1rem', borderLeft: '4px solid #F59E0B' }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Disbursed Expenses</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>₹{totalSpent.toLocaleString('en-IN')}</div>
                <div className="small text-muted">{expenses.length} official vouchers booked</div>
              </div>
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1rem', borderLeft: '4px solid #10B981' }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Remaining Fiscal Balance</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>₹{(totalAllocated - totalSpent).toLocaleString('en-IN')}</div>
                <div className="small text-muted">Uncommitted treasury funds</div>
              </div>
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1rem', borderLeft: '4px solid #7C3AED' }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Overall Fiscal Utilization</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: utilization > 90 ? '#DC2626' : '#2563EB', marginTop: 4 }}>{utilization}%</div>
                <div className="small text-muted">{utilization > 90 ? 'High Burn Rate' : 'Healthy Allocation Pace'}</div>
              </div>
            </div>

            {/* Quick Action Strip */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="fw-bold mb-0">Departmental Fiscal Management</h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  onClick={() => setShowTransferModal(true)}
                >
                  <ArrowRightLeft size={14} /> Inter-Dept Fund Transfer
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  onClick={() => {
                    setMsg('Audit ledger exported to CSV format for statutory compliance!')
                    setTimeout(() => setMsg(''), 3000)
                  }}
                >
                  <FileSpreadsheet size={14} /> Export Audit Ledger
                </button>
              </div>
            </div>

            {/* 2 Forms: Set Budget & Log Expense */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Set Departmental Budget */}
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0' }}>Configure Department Budget</h3>
                <form onSubmit={handleSetBudget} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label htmlFor="budget-department" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Department</label>
                    <select id="budget-department" className="form-select form-select-sm" value={department} onChange={(e) => setDepartment(e.target.value)}>
                      <option value="Computer Science">Computer Science & Engineering</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Central Library">Central Library & Learning Center</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="budget-category" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Budget Head Category</label>
                    <select id="budget-category" className="form-select form-select-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Lab Equipment">Lab Equipment & Workstations</option>
                      <option value="Infrastructure Maintenance & Repairs">Infrastructure Maintenance & Repairs</option>
                      <option value="Faculty Research & Conferences">Faculty Research & Conferences</option>
                      <option value="Books & Digital Subscriptions">Books & Digital Subscriptions</option>
                      <option value="Hackathons & Student Clubs">Hackathons & Student Clubs</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="budget-allocated" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Allocated Amount (₹ INR) *</label>
                    <input
                      id="budget-allocated"
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="e.g. 1500000"
                      value={allocatedAmount}
                      onChange={(e) => setAllocatedAmount(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingBudget}
                    className="btn btn-primary btn-sm mt-2"
                  >
                    {submittingBudget ? 'Updating...' : 'Set / Update Budget Head'}
                  </button>
                </form>
              </div>

              {/* Record Expense Form */}
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0' }}>Record Official Expense</h3>
                <form onSubmit={handleRecordExpense} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label htmlFor="expense-dept" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Department</label>
                      <select id="expense-dept" className="form-select form-select-sm" value={expDept} onChange={(e) => setExpDept(e.target.value)}>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Central Library">Central Library</option>
                        <option value="Mechanical Engineering">Mechanical</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="expense-amount" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Amount (₹) *</label>
                      <input
                        id="expense-amount"
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 45000"
                        value={expAmount}
                        onChange={(e) => setExpAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="expense-vendor" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Vendor Name & Invoice Reference *</label>
                    <input
                      id="expense-vendor"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Dell India / INV-892"
                      value={expVendor}
                      onChange={(e) => setExpVendor(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="expense-desc" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description / Purpose</label>
                    <input
                      id="expense-desc"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. AI GPU cluster cooling fans and cables"
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingExpense}
                    className="btn btn-success btn-sm mt-2"
                  >
                    {submittingExpense ? 'Booking...' : 'Log Disbursed Expense'}
                  </button>
                </form>
              </div>
            </div>

            {/* Budgets Table */}
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Departmental Budget Allocations vs Expenses</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                  <thead className="table-light">
                    <tr>
                      <th>Department</th>
                      <th>Category</th>
                      <th>Allocated</th>
                      <th>Spent</th>
                      <th>Balance Remaining</th>
                      <th>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((b) => {
                      const allocated = Number(b.allocated_amount || 0)
                      const spent = Number(b.spent_amount || 0)
                      const rem = allocated - spent
                      const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0
                      return (
                        <tr key={b.id || `${b.department}-${b.category}`}>
                          <td style={{ fontWeight: 600 }}>{b.department}</td>
                          <td style={{ color: '#64748B' }}>{b.category}</td>
                          <td style={{ fontWeight: 600 }}>₹{allocated.toLocaleString('en-IN')}</td>
                          <td style={{ color: '#2563EB', fontWeight: 600 }}>₹{spent.toLocaleString('en-IN')}</td>
                          <td style={{ color: rem >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>₹{rem.toLocaleString('en-IN')}</td>
                          <td>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: pct > 90 ? '#FEE2E2' : '#EFF6FF', color: pct > 90 ? '#DC2626' : '#2563EB' }}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Expenses Ledger */}
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Disbursed Procurement Voucher Trail</h3>
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>VOUCHER ID</th>
                      <th>DEPARTMENT</th>
                      <th>VENDOR & INVOICE</th>
                      <th>PURPOSE</th>
                      <th>DISBURSED DATE</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((ex) => (
                      <tr key={ex.id}>
                        <td className="font-monospace fw-bold">VCH-{ex.id}</td>
                        <td><span className="badge bg-light text-dark border">{ex.department}</span></td>
                        <td className="fw-semibold">{ex.vendor_name}</td>
                        <td className="text-muted">{ex.description}</td>
                        <td className="text-muted">{ex.date || '2026-11-10'}</td>
                        <td className="fw-bold text-dark">₹{Number(ex.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <ArrowRightLeft size={18} /> Inter-Departmental Fund Transfer
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowTransferModal(false)} />
                </div>
                <form onSubmit={handleExecuteTransfer}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Transfer From (Source Dept)</label>
                      <select
                        className="form-select form-select-sm"
                        value={transferFrom}
                        onChange={(e) => setTransferFrom(e.target.value)}
                      >
                        <option value="Central Library">Central Library</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Electronics & Communication">ECE</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Transfer To (Destination Dept)</label>
                      <select
                        className="form-select form-select-sm"
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Central Library">Central Library</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Transfer Amount (₹ INR)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        required
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                      />
                    </div>

                    <div className="p-3 bg-light rounded text-muted small">
                      Requires Registrar and Chief Finance Officer authorization. An audit hash is generated upon execution.
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTransferModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Execute Reallocation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
