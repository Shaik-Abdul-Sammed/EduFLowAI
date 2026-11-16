import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import SkeletonLoader from '../../components/SkeletonLoader'
import apiClient from '../../services/apiClient'

const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'
const BLUE = '#2563EB'

export default function Page() {
  const [feeData, setFeeData] = useState({
    totalFee: 120000,
    paidAmount: 0,
    pendingAmount: 0,
    nextDue: '2026-12-15',
    nextDueAmount: 0,
    transactions: []
  })
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [remitting, setRemitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(null)

  const fetchFeeData = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const res = await apiClient.get('/payments/student-fees')
      if (res.data) {
        const data = {
          totalFee: Number(res.data.totalFee) || 0,
          paidAmount: Number(res.data.paidAmount) || 0,
          pendingAmount: Number(res.data.pendingAmount) || 0,
          nextDue: res.data.nextDue || '2026-12-15',
          nextDueAmount: Number(res.data.nextDueAmount) || 0,
          transactions: res.data.transactions || []
        }
        setFeeData(data)
        setPayments(data.transactions)
      }
    } catch (err) {
      console.error('[ParentFeeDashboard] Fetch error:', err)
      setApiError(err.response?.data?.error || err.message || 'Failed to load student fee ledger from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeData()
  }, [])

  const handleRemitPayment = async () => {
    setRemitting(true)
    setApiError(null)
    setPaymentSuccess(null)
    try {
      const amountToPay = feeData.pendingAmount || 40000
      const res = await apiClient.post('/payments/remit-fee', {
        amount: amountToPay,
        description: 'Term 2 Tuition Fee Remittance',
        method: 'Parent NetBanking / UPI'
      })

      if (res.data?.success || res.status === 200 || res.status === 201) {
        const updated = res.data.feeData || {}
        const newTxn = res.data.transaction
        setFeeData(prev => ({
          ...prev,
          paidAmount: updated.paidAmount !== undefined ? updated.paidAmount : prev.paidAmount + amountToPay,
          pendingAmount: updated.pendingAmount !== undefined ? updated.pendingAmount : Math.max(0, prev.pendingAmount - amountToPay)
        }))
        if (newTxn) {
          setPayments(prev => [newTxn, ...prev])
        }
        setPaymentSuccess(`Payment of ₹${amountToPay.toLocaleString('en-IN')} remitted successfully! Receipt: ${newTxn?.receipt || 'GENERATED'}`)
        setTimeout(() => setPaymentSuccess(null), 6000)
      } else {
        throw new Error(res.data?.error || 'Failed to remit student fee')
      }
    } catch (err) {
      console.error('[ParentFeeDashboard] Payment error:', err)
      setApiError(err.response?.data?.error || err.message || 'Error processing fee remittance.')
    } finally {
      setRemitting(false)
    }
  }

  const overallPaid = feeData.paidAmount
  const overallPending = feeData.pendingAmount
  const paidStatus = overallPending === 0

  return (
    <RolePageTemplate role="Parent" title="Fee Ledger & Invoice Dashboard" description="Access breakdown structures, track payment histories, and remit outstanding fees online.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {apiError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3" role="alert" data-testid="parent-fee-api-error">
            <div>⚠️ {apiError}</div>
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchFeeData}>Retry</button>
          </div>
        )}

        {paymentSuccess && (
          <div className="alert alert-success p-3" role="alert" data-testid="parent-fee-success">
            ✅ {paymentSuccess}
          </div>
        )}

        {loading ? (
          <div data-testid="parent-fee-loading">
            <SkeletonLoader variant="card" />
          </div>
        ) : (
          <>
            {/* Finance summaries */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }} data-testid="parent-fee-summaries">
              {[
                { label: 'Total Targeted Fee', value: `₹${feeData.totalFee.toLocaleString('en-IN')}`, color: BLUE, icon: '🏦' },
                { label: 'Term Fees Deposited', value: `₹${overallPaid.toLocaleString('en-IN')}`, color: GREEN, icon: '💰' },
                { label: 'Pending Balance', value: `₹${overallPending.toLocaleString('en-IN')}`, color: RED, icon: '⏳' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.3rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Payment action card */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ height: 4, background: `linear-gradient(90deg, ${GREEN}, ${BLUE})` }} />
              <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Online Remittance Portal</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Remit term dues directly via credit/debit card, net banking, or UPI allocations.</p>
                </div>
                {!paidStatus ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleRemitPayment}
                    disabled={remitting}
                    style={{ background: `linear-gradient(135deg, ${AMBER}, ${RED})`, border: 'none', fontWeight: 700 }}
                    data-testid="parent-pay-btn"
                  >
                    {remitting ? 'Processing...' : '💳 Pay Pending Balance'}
                  </button>
                ) : (
                  <span style={{ color: GREEN, fontWeight: 700, fontSize: '0.9rem' }} data-testid="account-balanced-badge">
                    ✅ Account status: Paid / Balanced
                  </span>
                )}
              </div>
            </div>

            {/* Ledger table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Transaction History Listings</h2>
                <span className="badge text-bg-light">{payments.length} postings</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0" data-testid="parent-transactions-table">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['Transaction ID', 'Posting Date', 'Description', 'Amount', 'Mode', 'Status', 'Receipt'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">No transactions recorded.</td>
                      </tr>
                    ) : (
                      payments.map(p => (
                        <tr key={p.id} data-testid={`parent-txn-${p.id}`}>
                          <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{p.id}</td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{p.date}</td>
                          <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.description}</td>
                          <td style={{ fontWeight: 800, color: p.status === 'paid' ? GREEN : RED }}>
                            ₹{Number(p.amount).toLocaleString('en-IN')}
                          </td>
                          <td><span className="badge text-bg-light" style={{ border: '1px solid var(--border-color)' }}>{p.method}</span></td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.6rem', borderRadius: '2rem',
                              background: p.status === 'paid' ? `${GREEN}12` : `${RED}12`,
                              color: p.status === 'paid' ? GREEN : RED,
                              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            {p.receipt ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                style={{ fontSize: '0.72rem' }}
                                onClick={() => {
                                  window.open(`/api/v1/invoices/${p.receipt}/pdf`, '_blank')
                                }}
                              >
                                View Receipt 📥
                              </button>
                            ) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
