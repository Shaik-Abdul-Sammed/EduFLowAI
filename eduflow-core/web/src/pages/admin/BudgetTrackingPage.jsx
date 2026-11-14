import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function BudgetTrackingPage() {
  const [budgets, setBudgets] = useState([])
  const [, setExpenses] = useState([])
  const [department, setDepartment] = useState('Computer Science')
  const [category, setCategory] = useState('Lab Equipment')
  const [allocatedAmount, setAllocatedAmount] = useState('')
  const [expDept, setExpDept] = useState('Computer Science')
  const [expCat] = useState('Lab Equipment')
  const [expAmount, setExpAmount] = useState('')
  const [expVendor, setExpVendor] = useState('')
  const [expDesc, setExpDesc] = useState('')
  const [msg, setMsg] = useState('')

  const fetchData = async () => {
    try {
      const bRes = await fetch(`${getApiBaseURL()}/v1/finance/budgets`)
      if (bRes.ok) {
        const bData = await safeJson(bRes)
        if (bData?.budgets) setBudgets(bData.budgets)
      }
      const eRes = await fetch(`${getApiBaseURL()}/v1/finance/expenses`)
      if (eRes.ok) {
        const eData = await safeJson(eRes)
        if (eData?.expenses) setExpenses(eData.expenses)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSetBudget = async (e) => {
    e.preventDefault()
    if (!allocatedAmount) return
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/finance/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          category,
          allocated_amount: allocatedAmount,
          fiscal_year: '2026-2027'
        })
      })
      if (res.ok) {
        setMsg(`Budget allocation updated for ${department} (${category}).`)
        setAllocatedAmount('')
        fetchData()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  const handleRecordExpense = async (e) => {
    e.preventDefault()
    if (!expAmount) return
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/finance/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_id: 1,
          department: expDept,
          category: expCat,
          amount: expAmount,
          vendor_name: expVendor,
          description: expDesc
        })
      })
      if (res.ok) {
        setMsg(`Expense ₹${Number(expAmount).toLocaleString()} booked successfully.`)
        setExpAmount('')
        setExpVendor('')
        setExpDesc('')
        fetchData()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  const totalAllocated = budgets.reduce((acc, b) => acc + Number(b.allocated_amount || 0), 0)
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent_amount || 0), 0)
  const utilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0

  return (
    <RolePageTemplate role="admin" title="Institutional Budget & Expense Ledger">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 13, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        {/* Top Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total Allocated FY 2026-27</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>₹{totalAllocated.toLocaleString()}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total Disbursed Expenses</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>₹{totalSpent.toLocaleString()}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Overall Fiscal Utilization</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: utilization > 90 ? '#DC2626' : '#16A34A', marginTop: 4 }}>{utilization}%</div>
          </div>
        </div>

        {/* 2 Forms: Set Budget & Log Expense */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Set Departmental Budget */}
          <div style={{ background: '#FFFFFF', padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0', color: '#0F172A' }}>Configure Department Budget</h3>
            <form onSubmit={handleSetBudget} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}>
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Central Library">Central Library & Learning Center</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Budget Head Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}>
                  <option value="Lab Equipment">Lab Equipment & Workstations</option>
                  <option value="Maintenance">Infrastructure Maintenance & Repairs</option>
                  <option value="Research">Faculty Research & Conferences</option>
                  <option value="Library">Books & Digital Subscriptions</option>
                  <option value="StudentActivities">Hackathons & Student Clubs</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Allocated Amount (₹ INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500000"
                  value={allocatedAmount}
                  onChange={(e) => setAllocatedAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: '#2563EB', color: '#FFFFFF', padding: '10px 16px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 4 }}
              >
                Set / Update Budget Head
              </button>
            </form>
          </div>

          {/* Record Expense Form */}
          <div style={{ background: '#FFFFFF', padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0', color: '#0F172A' }}>Record Official Expense</h3>
            <form onSubmit={handleRecordExpense} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Department</label>
                  <select value={expDept} onChange={(e) => setExpDept(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1' }}>
                    <option value="Computer Science">CSE</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Central Library">Library</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Vendor Name & Invoice Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Dell India / INV-892"
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Description / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. AI GPU cluster cooling fans and cables"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: '#10B981', color: '#FFFFFF', padding: '10px 16px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 4 }}
              >
                Log Disbursed Expense
              </button>
            </form>
          </div>
        </div>

        {/* Budgets & Expenses Table */}
        <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A' }}>Departmental Budget Allocations vs Expenses</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
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
                const rem = b.allocated_amount - b.spent_amount
                const pct = Math.round((b.spent_amount / b.allocated_amount) * 100)
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 12px', fontWeight: 600, color: '#0F172A' }}>{b.department}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{b.category}</td>
                    <td style={{ padding: '12px 12px', fontWeight: 600 }}>₹{Number(b.allocated_amount).toLocaleString()}</td>
                    <td style={{ padding: '12px 12px', color: '#2563EB', fontWeight: 600 }}>₹{Number(b.spent_amount).toLocaleString()}</td>
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
      </div>
    </RolePageTemplate>
  )
}
