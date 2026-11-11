import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const GREEN = '#10B981'
const RED = '#EF4444'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'
const AMBER = '#F59E0B'

const initialPayroll = [
  { id: 'EMP-01', name: 'Dr. K. Srinivas', role: 'Professor & HOD', base: 120000, bonus: 15000, deductions: 12000, status: 'approved', dept: 'Mathematics' },
  { id: 'EMP-02', name: 'Prof. Ananya Roy', role: 'Associate Professor', base: 95000, bonus: 8000, deductions: 9500, status: 'approved', dept: 'Physics' },
  { id: 'EMP-03', name: 'Dr. M. Venkat', role: 'Assistant Professor', base: 75000, bonus: 5000, deductions: 7500, status: 'pending', dept: 'Chemistry' },
  { id: 'EMP-04', name: 'Mrs. Sunita Rao', role: 'Senior Lecturer', base: 65000, bonus: 4000, deductions: 6500, status: 'hold', dept: 'English' },
  { id: 'EMP-05', name: 'Dr. B. Prasad', role: 'Assistant Professor', base: 75000, bonus: 5000, deductions: 7500, status: 'approved', dept: 'Biology' },
]

export default function Page() {
  const [payroll, setPayroll] = useState(initialPayroll)
  const [released, setReleased] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedSlip, setSelectedSlip] = useState(null)

  function toggleStatus(id) {
    setPayroll(prev => prev.map(p => {
      if (p.id !== id) return p
      const next = p.status === 'approved' ? 'hold' : p.status === 'hold' ? 'pending' : 'approved'
      return { ...p, status: next }
    }))
  }

  // Broken Rule Fix: Never allow net payable to calculate negative
  const calculateNet = (p) => Math.max(0, p.base + p.bonus - p.deductions)

  const totalGross = payroll.reduce((acc, p) => acc + p.base + p.bonus, 0)
  const totalDeductions = payroll.reduce((acc, p) => acc + p.deductions, 0)
  const totalNet = payroll.reduce((acc, p) => acc + calculateNet(p), 0)

  const filtered = payroll.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))

  return (
    <RolePageTemplate role="Admin" title="Payroll Execution & Disbursals" description="Audit employee base compensation, compute tax deductions, issue payslips, and dispatch bank transfer files.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

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
            {!released ? (
              <button
                className="btn btn-primary shadow-sm"
                onClick={() => setReleased(true)}
                style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
              >
                🚀 Approve &amp; Release Payroll Batch
              </button>
            ) : (
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold">
                ✓ Batch Dispatched to Direct Deposit Gateway
              </span>
            )}
          </div>
        </div>

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
                  {['Emp ID', 'Employee Name', 'Role & Dept', 'Base Salary', 'Allowances', 'Deductions', 'Net Payable', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No employee payroll records match your search</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => {
                    const net = calculateNet(p)
                    return (
                      <tr key={p.id}>
                        <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{p.id}</td>
                        <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.name}</td>
                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          {p.role} &bull; <span className="badge bg-light text-dark border">{p.dept}</span>
                        </td>
                        <td style={{ fontSize: '0.875rem' }}>₹{p.base.toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '0.875rem', color: GREEN }}>+₹{p.bonus.toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '0.875rem', color: RED }}>-₹{p.deductions.toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '0.9rem', fontWeight: 800, color: BLUE }}>₹{net.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '2rem',
                            background: p.status === 'approved' ? `${GREEN}12` : p.status === 'hold' ? `${RED}12` : `${AMBER}12`,
                            color: p.status === 'approved' ? GREEN : p.status === 'hold' ? RED : AMBER,
                            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                          }}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              className="btn btn-sm btn-outline-secondary py-0 px-2"
                              onClick={() => toggleStatus(p.id)}
                              style={{ fontSize: '0.72rem' }}
                              title="Toggle approval status"
                            >
                              Toggle 🔄
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary py-0 px-2"
                              onClick={() => setSelectedSlip(p)}
                              style={{ fontSize: '0.72rem' }}
                              title="View and print employee payslip"
                            >
                              📄 Slip
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

      </div>

      {/* Payslip Modal */}
      {selectedSlip && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--app-text, #0f172a)',
              borderRadius: '1rem',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '2px solid var(--border-color, #e2e8f0)',
            }}
          >
            <div className="text-center mb-3 border-bottom pb-3">
              <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: '#64748b' }}>
                CONFIDENTIAL SALARY PAYSLIP
              </div>
              <h4 style={{ margin: '0.25rem 0', fontWeight: 800, color: '#1e293b' }}>EduFlow Autonomous College</h4>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Disbursal Cycle: November 2026 &bull; Form 16 Compliant</div>
            </div>

            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Employee ID:</span>
              <span className="fw-bold">{selectedSlip.id}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Name:</span>
              <span className="fw-bold">{selectedSlip.name}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Designation &amp; Dept:</span>
              <span className="fw-bold">{selectedSlip.role} ({selectedSlip.dept})</span>
            </div>

            <hr className="my-2" />

            <div className="d-flex justify-content-between mb-1 small">
              <span className="text-muted">Basic Pay:</span>
              <span className="fw-bold">₹{selectedSlip.base.toLocaleString('en-IN')}</span>
            </div>
            <div className="d-flex justify-content-between mb-1 small">
              <span className="text-muted">Special Allowances &amp; HRA:</span>
              <span className="text-success fw-bold">+₹{selectedSlip.bonus.toLocaleString('en-IN')}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Provident Fund (PF) &amp; Tax Deductions:</span>
              <span className="text-danger fw-bold">-₹{selectedSlip.deductions.toLocaleString('en-IN')}</span>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                padding: '1rem',
                borderRadius: '0.75rem',
                textAlign: 'center',
                margin: '1.25rem 0',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>NET PAYABLE (TAKE-HOME)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563eb' }}>
                ₹{calculateNet(selectedSlip).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Status: {selectedSlip.status.toUpperCase()} &bull; Disbursed to Bank Account</div>
            </div>

            <div className="d-flex justify-content-between gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-grow-1"
                onClick={() => setSelectedSlip(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm flex-grow-1"
                onClick={() => window.print()}
              >
                🖨️ Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </RolePageTemplate>
  )
}
