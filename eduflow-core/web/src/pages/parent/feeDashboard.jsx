import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { feeData } from '../../utils/studentMockData'

const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'
const BLUE = '#2563EB'

export default function Page() {
  const [payments, setPayments] = useState(feeData.transactions)
  const [paidStatus, setPaidStatus] = useState(false)

  function simulatePay() {
    setPaidStatus(true)
    const newTxn = { id: `TXN${Date.now().toString().slice(-4)}`, date: new Date().toISOString().split('T')[0], description: 'Term 2 Tuition Fee Remittance', amount: feeData.pendingAmount, method: 'Online', status: 'paid', receipt: 'RCP8822' }
    setPayments(prev => [newTxn, ...prev])
  }

  const overallPaid = paidStatus ? feeData.totalFee : feeData.paidAmount
  const overallPending = paidStatus ? 0 : feeData.pendingAmount
    const pct = Math.round((overallPaid / feeData.totalFee) * 100)
    void pct

  return (
    <RolePageTemplate role="Parent" title="Fee Ledger & Invoice Dashboard" description="Access breakdown structures, track payment histories, and remit outstanding fees online.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Finance summaries */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
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
              <button className="btn btn-primary" onClick={simulatePay} style={{ background: `linear-gradient(135deg, ${AMBER}, ${RED})`, border: 'none' }}>
                💳 Pay Pending Balance
              </button>
            ) : (
              <span style={{ color: GREEN, fontWeight: 700, fontSize: '0.9rem' }}>✅ Account status: Paid / Balanced</span>
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
            <table className="table table-hover mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['Transaction ID', 'Posting Date', 'Description', 'Amount', 'Mode', 'Status', 'Receipt'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{p.id}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{p.date}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.description}</td>
                    <td style={{ fontWeight: 800, color: p.status === 'paid' ? GREEN : RED }}>
                      ₹{p.amount.toLocaleString('en-IN')}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </RolePageTemplate>
  )
}
