import { useState, useEffect, useCallback } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { useAuth } from '../../hooks/useAuth'

const PACKAGES = [
  {
    name: 'NAAC Fast-Track Pilot Assessment',
    description: 'Criterion 1-7 Rapid Gap Analysis, Metric Verification & Readiness Scorecard',
    rate: 49000,
  },
  {
    name: 'Full SSR Automation & Compliance Suite',
    description: 'Comprehensive SSR Quantitative & Qualitative Metrics Compilation + Executive Brief',
    rate: 199000,
  },
  {
    name: 'Annual AI Administrative & Accreditation Retainer',
    description: 'Continuous IQAC Tracking, Timetable Optimization & Predictive Risk Surveillance (1 Year)',
    rate: 350000,
  },
]

export default function InvoiceGeneratorPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Invoice Form State
  const [institutionName, setInstitutionName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [address, setAddress] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [items, setItems] = useState([
    {
      description: 'NAAC Fast-Track Pilot Assessment - Criterion 1-7 Gap Analysis',
      quantity: 1,
      rate: 49000,
      amount: 49000,
    },
  ])
  const [notes, setNotes] = useState('Payment due within 15 days of invoice date.')

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchInvoices = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices || [])
      }
    } catch (err) {
      showToast(err.message, true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchInvoices()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [user, fetchInvoices])

  const handleApplyPackage = (pkg) => {
    setItems([
      {
        description: `${pkg.name} - ${pkg.description}`,
        quantity: 1,
        rate: pkg.rate,
        amount: pkg.rate,
      },
    ])
  }

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[index], [field]: value }
      if (field === 'quantity' || field === 'rate') {
        const q = field === 'quantity' ? Number(value) : item.quantity
        const r = field === 'rate' ? Number(value) : item.rate
        item.amount = (q || 0) * (r || 0)
      }
      updated[index] = item
      return updated
    })
  }

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { description: 'Additional Consultation & Data Verification', quantity: 1, rate: 25000, amount: 25000 },
    ])
  }

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const taxAmount = subtotal * 0.18
  const totalAmount = subtotal + taxAmount

  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    if (!institutionName.trim() || !contactEmail.trim() || items.length === 0) {
      showToast('Please fill all required fields', true)
      return
    }

    try {
      setCreating(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          institutionName,
          contactPerson,
          contactEmail,
          address,
          gstNumber,
          items,
          subtotal,
          taxPercent: 18.0,
          taxAmount,
          totalAmount,
          notes,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to generate invoice')
      }

      const data = await res.json()
      showToast(`Invoice ${data.invoice.invoice_number} created successfully!`)
      fetchInvoices()
    } catch (err) {
      showToast(err.message, true)
    } finally {
      setCreating(false)
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/invoices/${id}/mark-paid`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to update invoice status')
      showToast('Invoice marked as PAID')
      fetchInvoices()
    } catch (err) {
      showToast(err.message, true)
    }
  }

  return (
    <RolePageTemplate
      role="Admin"
      title="Institutional Invoice Generator"
      description="Create GST-compliant electronic invoices and bill colleges for NAAC report packages."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              padding: '0.85rem 1.25rem',
              borderRadius: '0.5rem',
              color: '#ffffff',
              background: toastMessage.isError ? '#EF4444' : '#10B981',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {toastMessage.text}
          </div>
        )}

        {/* Invoice Generator Card */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
              🧾 Generate New Tax Invoice
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--app-text-muted)', alignSelf: 'center' }}>
                Preset Packages:
              </span>
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.name}
                  type="button"
                  onClick={() => handleApplyPackage(pkg)}
                  className="btn btn-sm btn-outline-primary"
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  ₹{(pkg.rate / 1000).toFixed(0)}k: {pkg.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Institution Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Institution / College Name *
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. National Institute of Technology"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Recipient Billing Email *
                </label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="accounts@college.edu"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Contact Person / Principal
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Dr. R. Sharma"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  College GSTIN (Optional)
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="36AAAAA0000A1Z5"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                Billing Address
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Campus Road, Bangalore, Karnataka 560001"
              />
            </div>

            {/* Line Items Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>
                  Invoice Items & Deliverables
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleAddItem}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  + Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ flex: 3 }}
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: '70px' }}
                      value={item.quantity}
                      min="1"
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: '120px' }}
                      value={item.rate}
                      min="0"
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      required
                    />
                    <span style={{ width: '120px', fontWeight: 700, fontSize: '0.85rem', textAlign: 'right' }}>
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations & Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '300px', background: 'var(--surface-bg)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>Subtotal:</span>
                  <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>GST (18%):</span>
                  <strong>₹{taxAmount.toLocaleString('en-IN')}</strong>
                </div>
                <hr style={{ margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#2563EB' }}>
                  <span>Total Payable:</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                Invoice Notes & Terms
              </label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, PO number, or bank notes"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
                style={{ fontWeight: 700, padding: '0.6rem 2rem' }}
              >
                {creating ? 'Generating Invoice...' : '📄 Create & Save Tax Invoice'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Invoices Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Issued Invoices ({invoices.length})
            </h3>
            <button className="btn btn-sm btn-outline-secondary" onClick={fetchInvoices} disabled={loading} style={{ fontSize: '0.78rem' }}>
              🔄 Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No invoices generated yet.</div>
            ) : (
              <table className="table table-hover mb-0" style={{ verticalAlign: 'middle' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-bg)' }}>
                    {['Invoice #', 'Date', 'Institution', 'Amount (INR)', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '0.75rem 1rem' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4F46E5', padding: '0.75rem 1rem' }}>
                        {inv.invoice_number}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', padding: '0.75rem 1rem' }}>
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1rem' }}>
                        <div>{inv.institution_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>{inv.contact_email}</div>
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '0.9rem', padding: '0.75rem 1rem' }}>
                        ₹{Number(inv.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: inv.status === 'PAID' ? '#DCFCE7' : '#FEF3C7',
                            color: inv.status === 'PAID' ? '#166534' : '#92400E',
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a
                            href={`${getApiBaseURL()}/v1/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            📥 PDF
                          </a>
                          {inv.status !== 'PAID' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleMarkPaid(inv.id)}
                              style={{ fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              ✓ Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
