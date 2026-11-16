import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

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
        setBudgets(bData?.budgets || [])
        setExpenses(eData?.expenses || [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading institutional ledger')
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
      const res = await fetch(getFullApiUrl('/v1/finance/budgets'), {
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update budget allocation')
      }

      setMsg(`Budget allocation updated for ${department} (${category}).`)
      setAllocatedAmount('')
      fetchData(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Error updating budget')
    } finally {
      setSubmittingBudget(false)
    }
  }

  const handleRecordExpense = async (e) => {
    e.preventDefault()
    if (!expAmount) return
    setSubmittingExpense(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/finance/expenses'), {
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to record expense')
      }

      setMsg(`Expense ₹${Number(expAmount).toLocaleString()} booked successfully.`)
      setExpAmount('')
      setExpVendor('')
      setExpDesc('')
      fetchData(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Error recording expense')
    } finally {
      setSubmittingExpense(false)
    }
  }

  const totalAllocated = budgets.reduce((acc, b) => acc + Number(b.allocated_amount || 0), 0)
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent_amount || 0), 0)
  const utilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0

  return (
    <RolePageTemplate role="admin" title="Institutional Budget & Expense Ledger">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="budget-success-alert">
            ✓ {msg}
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0" role="alert">
            ❌ {errorMsg}
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
              <div className="card border-0 shadow-sm p-4">
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Allocated FY 2026-27</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>₹{totalAllocated.toLocaleString()}</div>
              </div>
              <div className="card border-0 shadow-sm p-4">
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Disbursed Expenses</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>₹{totalSpent.toLocaleString()}</div>
              </div>
              <div className="card border-0 shadow-sm p-4">
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Overall Fiscal Utilization</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: utilization > 90 ? '#DC2626' : '#16A34A', marginTop: 4 }}>{utilization}%</div>
              </div>
            </div>

            {/* 2 Forms: Set Budget & Log Expense */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Set Departmental Budget */}
              <div className="card border-0 shadow-sm p-4">
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
                      <option value="Maintenance">Infrastructure Maintenance & Repairs</option>
                      <option value="Research">Faculty Research & Conferences</option>
                      <option value="Library">Books & Digital Subscriptions</option>
                      <option value="StudentActivities">Hackathons & Student Clubs</option>
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
              <div className="card border-0 shadow-sm p-4">
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0' }}>Record Official Expense</h3>
                <form onSubmit={handleRecordExpense} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label htmlFor="expense-dept" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Department</label>
                      <select id="expense-dept" className="form-select form-select-sm" value={expDept} onChange={(e) => setExpDept(e.target.value)}>
                        <option value="Computer Science">CSE</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Central Library">Library</option>
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

            {/* Budgets & Expenses Table */}
            <div className="card border-0 shadow-sm p-4">
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Departmental Budget Allocations vs Expenses</h3>
              {budgets.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p className="mb-0">No departmental budget allocations configured yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-bg)' }}>
                        <th style={{ padding: '10px 12px' }}>Department</th>
                        <th style={{ padding: '10px 12px' }}>Category</th>
                        <th style={{ padding: '10px 12px' }}>Allocated</th>
                        <th style={{ padding: '10px 12px' }}>Spent</th>
                        <th style={{ padding: '10px 12px' }}>Balance Remaining</th>
                        <th style={{ padding: '10px 12px' }}>Utilization</th>
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
                            <td style={{ padding: '12px 12px', fontWeight: 600 }}>{b.department}</td>
                            <td style={{ padding: '12px 12px', color: '#64748B' }}>{b.category}</td>
                            <td style={{ padding: '12px 12px', fontWeight: 600 }}>₹{allocated.toLocaleString()}</td>
                            <td style={{ padding: '12px 12px', color: '#2563EB', fontWeight: 600 }}>₹{spent.toLocaleString()}</td>
                            <td style={{ padding: '12px 12px', color: rem >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>₹{rem.toLocaleString()}</td>
                            <td style={{ padding: '12px 12px' }}>
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
              )}
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
