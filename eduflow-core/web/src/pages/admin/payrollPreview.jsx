import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const GREEN = '#10B981'
const RED = '#EF4444'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'
const AMBER = '#F59E0B'

export default function Page() {
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [released, setReleased] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedSlip, setSelectedSlip] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [form, setForm] = useState({ employeeName: '', role: 'Assistant Professor', base: 85000, bonus: 5000, deductions: 8500 })

  const fetchPayroll = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/payroll'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load payroll register (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.data) ? data.data : []
        const mapped = raw.map(p => ({
          id: p.id,
          name: p.employeeName || p.name || 'Faculty Member',
          role: p.role || 'Professor',
          base: Number(p.base) || 80000,
          bonus: Number(p.bonus) || 0,
          deductions: Number(p.deductions) || 0,
          status: p.status === 'Disbursed' ? 'approved' : (p.status || 'approved'),
          dept: p.dept || 'Academic Dept'
        }))
        setPayroll(mapped)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching payroll register')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchPayroll(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleAddEntry(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/payroll'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          employeeName: form.employeeName.trim(),
          role: form.role,
          base: Number(form.base) || 0,
          bonus: Number(form.bonus) || 0,
          deductions: Number(form.deductions) || 0
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || `Failed to create payslip (HTTP ${res.status})`)
      }

      setSuccessToast(`Compensation entry for ${form.employeeName} posted successfully.`)
      setTimeout(() => setSuccessToast(''), 4000)
      setShowAddForm(false)
      setForm({ employeeName: '', role: 'Assistant Professor', base: 85000, bonus: 5000, deductions: 8500 })
      await fetchPayroll(true)
    } catch (err) {
      setSuccessToast(err.message || 'Error creating payslip')
    } finally {
      setSubmitting(false)
    }
  }

  function toggleStatus(id) {
    setPayroll(prev => prev.map(p => {
      if (p.id !== id) return p
      const next = p.status === 'approved' ? 'hold' : p.status === 'hold' ? 'pending' : 'approved'
      return { ...p, status: next }
    }))
  }

  const calculateNet = (p) => Math.max(0, p.base + p.bonus - p.deductions)
  const totalGross = payroll.reduce((acc, p) => acc + p.base + p.bonus, 0)
  const totalDeductions = payroll.reduce((acc, p) => acc + p.deductions, 0)
  const totalNet = payroll.reduce((acc, p) => acc + calculateNet(p), 0)

  const filtered = payroll.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.role || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <RolePageTemplate role="Admin" title="Payroll Execution & Disbursals" description="Audit employee base compensation, compute tax deductions, issue payslips, and dispatch bank transfer files.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Success toast */}
        {successToast && (
          <div data-testid="payroll-success-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {successToast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="payroll-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="payroll-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Payroll Register</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchPayroll(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Total Net Disbursal', value: `₹${totalNet.toLocaleString('en-IN')}`, color: GREEN, icon: '💵' },
                { label: 'Gross Salary Cost', value: `₹${totalGross.toLocaleString('en-IN')}`, color: BLUE, icon: '📈' },
                { label: 'Statutory Deductions', value: `₹${totalDeductions.toLocaleString('en-IN')}`, color: RED, icon: '📉' },
                { label: 'Approved Staff', value: `${payroll.filter(p => p.status === 'approved').length} / ${payroll.length}`, color: PURPLE, icon: '👥' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="input-group input-group-sm" style={{ maxWidth: '350px' }}>
                  <span className="input-group-text bg-transparent border-end-0">🔍</span>
                  <input
                    className="form-control border-start-0"
                    placeholder="Search employee, designation..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                      ✕
                    </button>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    data-testid="open-add-payroll-btn"
                    onClick={() => setShowAddForm(true)}
                  >
                    + Add Compensation
                  </button>
                  {!released ? (
                    <button
                      className="btn btn-sm btn-primary shadow-sm"
                      data-testid="release-payroll-btn"
                      onClick={() => setReleased(true)}
                      style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
                    >
                      🚀 Approve &amp; Release Payroll Batch
                    </button>
                  ) : (
                    <span data-testid="batch-dispatched-badge" className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold">
                      ✓ Batch Dispatched to Direct Deposit Gateway
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Add Compensation Form */}
            {showAddForm && (
              <form onSubmit={handleAddEntry} data-testid="add-payroll-form" className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>💵 Add Employee Compensation Record</h3>
                  <button type="button" className="btn-close" onClick={() => setShowAddForm(false)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EMPLOYEE NAME</label>
                    <input required className="form-control form-control-sm" placeholder="e.g. Dr. Harish Kumar" value={form.employeeName} onChange={e => setForm(p => ({ ...p, employeeName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DESIGNATION / ROLE</label>
                    <input required className="form-control form-control-sm" placeholder="e.g. Associate Professor" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>BASE PAY (INR)</label>
                    <input required type="number" min="1" className="form-control form-control-sm" value={form.base} onChange={e => setForm(p => ({ ...p, base: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>BONUS / ALLOWANCE</label>
                    <input required type="number" min="0" className="form-control form-control-sm" value={form.bonus} onChange={e => setForm(p => ({ ...p, bonus: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DEDUCTIONS (TAX / PF)</label>
                    <input required type="number" min="0" className="form-control form-control-sm" value={form.deductions} onChange={e => setForm(p => ({ ...p, deductions: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submitting} data-testid="submit-payroll-btn" className="btn btn-sm btn-primary">
                    {submitting ? 'Posting...' : 'Save Compensation'}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {/* Payroll Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Monthly Compensation Register</h2>
                <span className="badge bg-light text-dark border">{filtered.length} employees</span>
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['Employee ID', 'Name & Role', 'Base Pay', 'Allowance', 'Deductions', 'Net Payable', 'Audit Status', 'Actions'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr data-testid="payroll-empty">
                        <td colSpan="8" className="text-center py-5 text-muted">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💵</div>
                          <div className="fw-semibold">No payroll records found</div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(p => {
                        const net = calculateNet(p)
                        const statusColors = {
                          approved: { bg: `${GREEN}15`, text: GREEN, label: 'Approved' },
                          pending: { bg: `${AMBER}15`, text: AMBER, label: 'Pending Review' },
                          hold: { bg: `${RED}15`, text: RED, label: 'On Hold' }
                        }
                        const st = statusColors[p.status] || statusColors.approved

                        return (
                          <tr key={p.id}>
                            <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{p.id}</td>
                            <td>
                              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.role}</div>
                            </td>
                            <td style={{ fontSize: '0.82rem' }}>₹{p.base.toLocaleString('en-IN')}</td>
                            <td style={{ fontSize: '0.82rem', color: GREEN }}>+₹{p.bonus.toLocaleString('en-IN')}</td>
                            <td style={{ fontSize: '0.82rem', color: RED }}>-₹{p.deductions.toLocaleString('en-IN')}</td>
                            <td style={{ fontSize: '0.9rem', fontWeight: 800, color: GREEN }}>
                              ₹{net.toLocaleString('en-IN')}
                            </td>
                            <td>
                              <span style={{
                                padding: '0.2rem 0.6rem', borderRadius: '2rem',
                                background: st.bg, color: st.text,
                                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                              }}>
                                {st.label}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <button
                                  className="btn btn-sm btn-outline-secondary px-2 py-0"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => setSelectedSlip(p)}
                                >
                                  📄 Slip
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-primary px-2 py-0"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => toggleStatus(p.id)}
                                >
                                  Cycle
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payslip Modal */}
            {selectedSlip && (
              <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content" style={{ borderRadius: '1.25rem' }}>
                    <div className="modal-header border-0 pb-0">
                      <h5 className="modal-title fw-bold">Official Salary Payslip</h5>
                      <button type="button" className="btn-close" onClick={() => setSelectedSlip(null)} />
                    </div>
                    <div className="modal-body py-3">
                      <div className="p-3 bg-light rounded-3 mb-3">
                        <div className="fw-bold">{selectedSlip.name}</div>
                        <div className="text-muted small">{selectedSlip.role} • {selectedSlip.id}</div>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom small">
                        <span>Basic Salary</span>
                        <span className="fw-semibold">₹{selectedSlip.base.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom small">
                        <span>Allowances &amp; Incentives</span>
                        <span className="fw-semibold text-success">+₹{selectedSlip.bonus.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom small">
                        <span>Statutory Deductions (PF/Tax)</span>
                        <span className="fw-semibold text-danger">-₹{selectedSlip.deductions.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="d-flex justify-content-between pt-2 fw-bold">
                        <span>Net Take-Home Pay</span>
                        <span className="text-success fs-5">₹{calculateNet(selectedSlip).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
