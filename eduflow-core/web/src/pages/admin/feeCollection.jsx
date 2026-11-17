import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import ConfirmationModal from '../../components/ConfirmationModal'
import { exportToCSV } from '../../utils/exportToCSV'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { getFullApiUrl } from '../../config/apiConfig'

const GREEN = '#10B981'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'
const AMBER = '#F59E0B'

export default function Page() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [selectedTxIds, setSelectedTxIds] = useState([])
  const [voidModalOpen, setVoidModalOpen] = useState(false)
  const [voidTarget, setVoidTarget] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [form, setForm] = useState({ student: '', roll: '', term: 'Term 1 Tuition', amount: 45000, method: 'Online' })

  const { clearDraft } = useAutoSave('fee_collection_form', form, setForm)

  const fetchFees = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/fees'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load fee ledger (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const rawList = Array.isArray(data?.data) ? data.data : []
        const mapped = rawList.map(item => ({
          id: item.id || item.receiptNo,
          student: item.studentName || item.student || 'Student',
          roll: item.studentRoll || item.roll || 'ROLL-01',
          term: item.term || 'Term 1 Tuition',
          amount: Number(item.amount) || 0,
          date: item.date || new Date().toISOString().split('T')[0],
          method: item.mode || item.method || 'Online'
        }))
        setPayments(mapped)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching fee collections')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchFees(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleCreate(e) {
    if (e?.preventDefault) e.preventDefault()
    setFormError('')

    const parsed = Number(form.amount)
    const numAmount = Number.isNaN(parsed) ? 0 : parsed
    if (!numAmount || numAmount <= 0) {
      setFormError('Fee transaction amount must be greater than zero.')
      return
    }

    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/fees'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studentName: form.student.trim(),
          studentRoll: form.roll.trim(),
          amount: numAmount,
          mode: form.method,
          term: form.term
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || `Failed to record payment (HTTP ${res.status})`)
      }

      const newPayment = {
        id: data?.receipt?.id || data?.receipt?.receiptNo || `RCP-${Date.now()}`,
        student: form.student,
        roll: form.roll,
        term: form.term,
        amount: numAmount,
        method: form.method,
        date: new Date().toISOString().split('T')[0]
      }

      setPayments(prev => [newPayment, ...prev])
      setShowForm(false)
      setForm({ student: '', roll: '', term: 'Term 1 Tuition', amount: 45000, method: 'Online' })
      clearDraft()
      setSelectedReceipt(newPayment)
      setSuccessToast(`Fee payment of ₹${numAmount.toLocaleString('en-IN')} posted successfully for ${form.student}.`)
      setTimeout(() => setSuccessToast(''), 4000)
    } catch (err) {
      setFormError(err.message || 'Error processing fee collection')
    } finally {
      setSubmitting(false)
    }
  }

  useKeyboardShortcuts({
    onNew: () => setShowForm(true),
    onSubmit: handleCreate,
    onEscape: () => {
      setShowForm(false)
      setSelectedReceipt(null)
      setVoidModalOpen(false)
    }
  })

  function handleVoid(id) {
    setPayments(prev => prev.filter(p => p.id !== id))
    setSelectedTxIds(prev => prev.filter(item => item !== id))
    setVoidModalOpen(false)
    setVoidTarget(null)
  }

  function handleBulkVoid() {
    setPayments(prev => prev.filter(p => !selectedTxIds.includes(p.id)))
    setSelectedTxIds([])
    setVoidModalOpen(false)
    setVoidTarget(null)
  }

  function handleExportCsv() {
    const exportData = filtered.map(p => ({
      'Receipt ID': p.id,
      'Student Name': p.student,
      'Roll Number': p.roll,
      'Description': p.term,
      'Amount': p.amount,
      'Payment Date': p.date,
      'Payment Mode': p.method
    }))
    exportToCSV(exportData, `Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0)
  const onlineCollected = payments.filter(p => p.method === 'Online').reduce((acc, p) => acc + p.amount, 0)
  const ddCollected = payments.filter(p => p.method === 'DD').reduce((acc, p) => acc + p.amount, 0)
  const cashCollected = payments.filter(p => p.method === 'Cash').reduce((acc, p) => acc + p.amount, 0)

  const filtered = payments.filter(p => {
    const matchesSearch = (p.student || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.roll || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.id || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.term || '').toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === 'ALL' || p.method === modeFilter
    return matchesSearch && matchesMode
  })

  return (
    <RolePageTemplate role="Admin" title="Fee Collection & Accounts" description="Process offline/online collections, issue institutional receipts, and balance bursary ledgers.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Success toast */}
        {successToast && (
          <div data-testid="fee-success-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {successToast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="fee-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="fee-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Fee Records</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchFees(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
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
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
                    onClick={handleExportCsv}
                  >
                    📥 Export Ledger
                  </button>
                  {!showForm && (
                    <button
                      className="btn btn-sm btn-primary shadow-sm"
                      data-testid="open-payment-btn"
                      onClick={() => setShowForm(true)}
                      style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
                    >
                      + Record Payment
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Payment form */}
            {showForm && (
              <form onSubmit={handleCreate} data-testid="record-fee-form" className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
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
                      <option>Hostel Fee S1</option>
                      <option>Lab Deposit</option>
                      <option>Examination Fee</option>
                      <option>Library Fine</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>PAYMENT METHOD</label>
                    <select className="form-select form-select-sm" value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                      <option value="Online">Online / UPI Gateway</option>
                      <option value="DD">Demand Draft (Bank)</option>
                      <option value="Cash">Cash Desk</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>AMOUNT (INR)</label>
                    <input required type="number" min="1" className="form-control form-control-sm" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submitting} data-testid="submit-payment-btn" className="btn btn-sm btn-primary">
                    {submitting ? 'Posting...' : 'Record Payment'}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Transactions Ledger Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['Receipt ID', 'Student Details', 'Term / Purpose', 'Amount', 'Date', 'Method', 'Action'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr data-testid="fee-empty">
                        <td colSpan="7" className="text-center py-5 text-muted">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                          <div className="fw-semibold">No fee transactions found</div>
                          <div className="small">Use the button above to post new collections.</div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{p.id}</td>
                          <td>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.student}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.roll}</div>
                          </td>
                          <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.term}</td>
                          <td style={{ fontSize: '0.9rem', fontWeight: 800, color: GREEN }}>
                            ₹{p.amount.toLocaleString('en-IN')}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.date}</td>
                          <td>
                            <span className="badge text-bg-light border">{p.method}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger px-2 py-0"
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => {
                                setVoidTarget(p)
                                setVoidModalOpen(true)
                              }}
                            >
                              Void
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Void Modal */}
            <ConfirmationModal
              isOpen={voidModalOpen}
              title="Void Fee Receipt"
              message={`Are you sure you want to void receipt ${voidTarget?.id} of ₹${voidTarget?.amount?.toLocaleString('en-IN')}? This action adjusts ledger totals.`}
              confirmLabel="Yes, Void Receipt"
              variant="danger"
              onConfirm={() => handleVoid(voidTarget?.id)}
              onCancel={() => { setVoidModalOpen(false); setVoidTarget(null); }}
            />
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
