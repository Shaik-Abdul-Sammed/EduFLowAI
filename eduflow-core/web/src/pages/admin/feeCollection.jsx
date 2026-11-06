import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { STUDENT } from '../../utils/studentMockData'

const GREEN = '#10B981'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'
const AMBER = '#F59E0B'

const initialLedger = [
  { id: 'RCP-8801', student: STUDENT.name, roll: STUDENT.roll, term: 'Term 1 Tuition', amount: 45000, date: '2026-06-15', method: 'Online' },
  { id: 'RCP-8802', student: 'Priya Singh', roll: '2024BIPC012', term: 'Hostel Fee S1', amount: 22000, date: '2026-06-16', method: 'DD' },
  { id: 'RCP-8803', student: 'Sneha Patel', roll: '2024BIPC005', term: 'Term 1 Tuition', amount: 45000, date: '2026-06-18', method: 'Online' },
  { id: 'RCP-8804', student: 'Kavya Naidu', roll: '2024MBIPC03', term: 'Lab Deposit', amount: 5000, date: '2026-06-20', method: 'Cash' },
  { id: 'RCP-8805', student: 'Rahul Varma', roll: '2024MPC009', term: 'Term 1 Tuition', amount: 45000, date: '2026-06-22', method: 'Online' },
]

export default function Page() {
  const [payments, setPayments] = useState(initialLedger)
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ student: '', roll: '', term: 'Term 1 Tuition', amount: 45000, method: 'Online' })

  function handleCreate(e) {
    e.preventDefault()
    setFormError('')

    // Broken Rule Fix: fee amount must be strictly positive
    const numAmount = Number(form.amount)
    if (!numAmount || numAmount <= 0) {
      setFormError('Fee transaction amount must be greater than zero.')
      return
    }

    const newPayment = {
      ...form,
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      id: `RCP-880${payments.length + 1}`
    }

    setPayments(prev => [newPayment, ...prev])
    setShowForm(false)
    setForm({ student: '', roll: '', term: 'Term 1 Tuition', amount: 45000, method: 'Online' })
    setSelectedReceipt(newPayment) // Automatically open printable receipt
  }

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0)
  const onlineCollected = payments.filter(p => p.method === 'Online').reduce((acc, p) => acc + p.amount, 0)
  const ddCollected = payments.filter(p => p.method === 'DD').reduce((acc, p) => acc + p.amount, 0)
  const cashCollected = payments.filter(p => p.method === 'Cash').reduce((acc, p) => acc + p.amount, 0)

  const filtered = payments.filter(p => {
    const matchesSearch = p.student.toLowerCase().includes(search.toLowerCase()) ||
                          p.roll.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toLowerCase().includes(search.toLowerCase()) ||
                          p.term.toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === 'ALL' || p.method === modeFilter
    return matchesSearch && matchesMode
  })

  return (
    <RolePageTemplate role="Admin" title="Fee Collection & Accounts" description="Process offline/online collections, issue institutional receipts, and balance bursary ledgers.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Dynamic counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Total Reconciled', value: `₹${totalCollected.toLocaleString('en-IN')}`, color: GREEN, icon: '💰' },
            { label: 'Digital / UPI', value: `₹${onlineCollected.toLocaleString('en-IN')}`, color: BLUE, icon: '💳' },
            { label: 'Demand Drafts', value: `₹${ddCollected.toLocaleString('en-IN')}`, color: PURPLE, icon: '🏦' },
            { label: 'Cash Desk', value: `₹${cashCollected.toLocaleString('en-IN')}`, color: AMBER, icon: '💵' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Directory Controls */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2 flex-grow-1 flex-wrap" style={{ maxWidth: '600px' }}>
              <div className="input-group input-group-sm flex-grow-1" style={{ minWidth: '220px' }}>
                <span className="input-group-text bg-transparent border-end-0">🔍</span>
                <input
                  className="form-control border-start-0"
                  placeholder="Search student, roll, receipt #..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                    ✕
                  </button>
                )}
              </div>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto', minWidth: '130px' }}
                value={modeFilter}
                onChange={e => setModeFilter(e.target.value)}
              >
                <option value="ALL">All Modes</option>
                <option value="Online">Online / UPI</option>
                <option value="DD">Demand Draft</option>
                <option value="Cash">Cash Desk</option>
              </select>
            </div>
            {!showForm && (
              <button
                className="btn btn-sm btn-primary shadow-sm"
                onClick={() => setShowForm(true)}
                style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
              >
                + Record Payment
              </button>
            )}
          </div>
        </div>

        {/* Payment form */}
        {showForm && (
          <form onSubmit={handleCreate} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>💳 Post Manual Fee Collection</h3>
              <button type="button" className="btn-close" onClick={() => { setShowForm(false); setFormError(''); }} aria-label="Close" />
            </div>

            {formError && (
              <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>STUDENT NAME</label>
                <input required className="form-control form-control-sm" placeholder="e.g. Vikramaditya Rao" value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ROLL NUMBER</label>
                <input required className="form-control form-control-sm" placeholder="e.g. 2024MPC044" value={form.roll} onChange={e => setForm(p => ({ ...p, roll: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>FEE CATEGORY / TERM</label>
                <select className="form-select form-select-sm" value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}>
                  <option>Term 1 Tuition</option>
                  <option>Term 2 Tuition</option>
                  <option>Hostel Fee S1</option>
                  <option>Hostel Fee S2</option>
                  <option>Lab Deposit</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>AMOUNT (₹ - MIN 1)</label>
                <input required type="number" min="1" step="1" className="form-control form-control-sm" placeholder="e.g. 45000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>PAYMENT MODE</label>
                <select className="form-select form-select-sm" value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                  <option>Online</option>
                  <option>DD</option>
                  <option>Cash</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-sm btn-primary">Record Payment &amp; Print Receipt</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Ledger table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Recent Ledger Postings</h2>
            <span className="badge bg-light text-dark border">{filtered.length} transactions</span>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['Receipt ID', 'Student', 'Roll', 'Description', 'Amount', 'Date', 'Mode', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No transactions match your search</div>
                      <div className="small">Try resetting your search query or mode filter.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{p.id}</td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.student}</td>
                      <td style={{ fontSize: '0.82rem', color: '#475569' }}>{p.roll}</td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.term}</td>
                      <td style={{ fontWeight: 800, color: GREEN }}>₹{p.amount.toLocaleString('en-IN')}</td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{p.date}</td>
                      <td><span className="badge text-bg-light" style={{ border: '1px solid var(--border-color)' }}>{p.method}</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary py-0 px-2"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setSelectedReceipt(p)}
                        >
                          📄 Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
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
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '1rem',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              border: '2px solid #e2e8f0',
            }}
          >
            <div className="text-center mb-3 border-bottom pb-3">
              <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', color: '#64748b' }}>
                INSTITUTIONAL BURSARY RECEIPT
              </div>
              <h4 style={{ margin: '0.25rem 0', fontWeight: 800, color: '#1e293b' }}>EduFlow Autonomous College</h4>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Official Statutory Account Voucher &bull; Tax Exempt</div>
            </div>

            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Receipt Ref:</span>
              <span className="fw-bold">{selectedReceipt.id}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Transaction Date:</span>
              <span className="fw-bold">{selectedReceipt.date}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Student Name:</span>
              <span className="fw-bold">{selectedReceipt.student}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Roll Number:</span>
              <span className="fw-bold">{selectedReceipt.roll}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Particulars:</span>
              <span className="fw-bold">{selectedReceipt.term}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 small">
              <span className="text-muted">Payment Instrument:</span>
              <span className="badge bg-light text-dark border">{selectedReceipt.method}</span>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                padding: '1rem',
                borderRadius: '0.75rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>TOTAL AMOUNT RECEIVED</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>
                ₹{selectedReceipt.amount.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Authorized Digital Ledger Signature Recorded</div>
            </div>

            <div className="d-flex justify-content-between gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-grow-1"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm flex-grow-1"
                onClick={() => window.print()}
              >
                🖨️ Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </RolePageTemplate>
  )
}
