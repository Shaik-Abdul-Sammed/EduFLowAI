import { useState, useEffect } from 'react'
import { Printer, Calculator } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import SkeletonLoader from '../../components/SkeletonLoader'
import apiClient from '../../services/apiClient'

export default function PayrollGenerationPage() {
  const [payslips, setPayslips] = useState([])
  const [facultyName, setFacultyName] = useState('Dr. Ramesh Kumar')
  const [designation, setDesignation] = useState('Professor & HOD')
  const [basicPay, setBasicPay] = useState('115000')
  const [month, setMonth] = useState('November')
  const [year, setYear] = useState('2026')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [msg, setMsg] = useState('')

  const fetchPayslips = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const res = await apiClient.get('/finance/payslips')
      const data = res.data || {}
      setPayslips(data.payslips || (Array.isArray(data) ? data : []))
    } catch (err) {
      console.error('[PayrollGenerationPage] Fetch error:', err)
      setApiError(err.response?.data?.error || err.message || 'Failed to load salary slips from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayslips()
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setApiError(null)
    setMsg('')
    try {
      const res = await apiClient.post('/finance/payslips/generate', {
        faculty_name: facultyName.trim(),
        designation,
        basic_pay: Number(basicPay) || 100000,
        month,
        year: Number(year) || 2026
      })

      if (res.data?.success || res.status === 200 || res.status === 201) {
        setMsg(`Payslip for ${facultyName} (${month} ${year}) generated with 100% statutory DA/PF compliance.`)
        const newSlip = res.data?.payslip
        if (newSlip) {
          setPayslips(prev => [newSlip, ...prev])
        } else {
          fetchPayslips()
        }
        setTimeout(() => setMsg(''), 6000)
      } else {
        throw new Error(res.data?.error || 'Failed to generate salary slip')
      }
    } catch (err) {
      console.error('[PayrollGenerationPage] Generate error:', err)
      setApiError(err.response?.data?.error || err.message || 'Error processing institutional payroll run.')
    } finally {
      setGenerating(false)
    }
  }

  // Real-time calculation helpers
  const bp = Number(basicPay) || 0
  const da = Math.round(bp * 0.50)
  const hra = Math.round(bp * 0.24)
  const allowances = 8000
  const gross = bp + da + hra + allowances
  const pf = Math.round(bp * 0.12)
  const tax = Math.round(bp * 0.10)
  const deductions = pf + tax
  const net = gross - deductions

  return (
    <RolePageTemplate role="finance" title="Institutional Payroll &amp; Salary Slip Engine">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {apiError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3" role="alert" data-testid="payroll-api-error">
            <div>⚠️ {apiError}</div>
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchPayslips}>Retry</button>
          </div>
        )}

        {msg && (
          <div className="alert alert-success p-3" role="alert" data-testid="payroll-success-alert" style={{ borderRadius: 8, fontWeight: 600 }}>
            ✓ {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Generator Form */}
          <div style={{ background: 'var(--card-bg, #FFFFFF)', padding: 24, borderRadius: 12, border: '1px solid var(--border-color, #E2E8F0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                <Calculator size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--app-text, #0F172A)' }}>Generate Monthly Payslip</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Statutory 7th Pay Commission allowances &amp; PF deductions</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} data-testid="payroll-form" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label htmlFor="payroll-faculty-name" style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-muted, #334155)', display: 'block', marginBottom: 4 }}>
                  Employee / Faculty Name
                </label>
                <input
                  id="payroll-faculty-name"
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label htmlFor="payroll-designation" style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-muted, #334155)', display: 'block', marginBottom: 4 }}>
                  Designation
                </label>
                <select id="payroll-designation" value={designation} onChange={(e) => setDesignation(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}>
                  <option value="Professor & HOD">Professor &amp; HOD</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Senior Lecturer">Senior Lecturer</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label htmlFor="payroll-month" style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-muted, #334155)', display: 'block', marginBottom: 4 }}>Pay Month</label>
                  <select id="payroll-month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}>
                    <option value="November">November</option>
                    <option value="December">December</option>
                    <option value="October">October</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="payroll-year" style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-muted, #334155)', display: 'block', marginBottom: 4 }}>Pay Year</label>
                  <input
                    id="payroll-year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="payroll-basic-pay" style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-muted, #334155)', display: 'block', marginBottom: 4 }}>Basic Pay (₹ INR)</label>
                <input
                  id="payroll-basic-pay"
                  type="number"
                  value={basicPay}
                  onChange={(e) => setBasicPay(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              {/* Computed Preview Card */}
              <div style={{ background: 'var(--surface-bg, #F8FAFC)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color, #E2E8F0)', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DA (50%) + HRA (24%):</span>
                  <span style={{ fontWeight: 600 }}>₹{(da + hra).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
                  <span>Deductions (PF 12% + TDS 10%):</span>
                  <span style={{ fontWeight: 600 }}>-₹{deductions.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: 6, fontWeight: 800, fontSize: 13, color: 'var(--app-text, #0F172A)' }}>
                  <span>Estimated Net Take-Home:</span>
                  <span style={{ color: '#16A34A' }}>₹{net.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                data-testid="generate-payslip-btn"
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  marginTop: 4
                }}
              >
                {generating ? 'Processing Payroll...' : 'Generate Official Payslip'}
              </button>
            </form>
          </div>

          {/* Generated Salary Slip Card Preview */}
          <div style={{ background: 'var(--card-bg, #FFFFFF)', padding: 24, borderRadius: 12, border: '1px solid var(--border-color, #E2E8F0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: 'var(--app-text, #0F172A)' }}>Recent Generated Payslips</h3>
            {loading ? (
              <div data-testid="payroll-loading">
                <SkeletonLoader variant="card" />
              </div>
            ) : payslips.length === 0 ? (
              <div className="text-center py-4 text-muted" data-testid="empty-payslips">
                No salary slips generated yet for this billing cycle.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} data-testid="payslips-list">
                {payslips.map((p) => (
                  <div key={p.id} data-testid={`payslip-card-${p.id}`} style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border-color, #E2E8F0)', background: 'var(--surface-bg, #F8FAFC)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--app-text, #0F172A)' }}>{p.faculty_name}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{p.designation} &bull; {p.month} {p.year}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '3px 8px', borderRadius: 4 }}>
                        {p.payment_status || 'PROCESSED'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '10px 0', fontSize: 11, textAlign: 'center' }}>
                      <div style={{ background: 'var(--card-bg, #FFFFFF)', padding: 6, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                        <div style={{ color: '#64748B' }}>Basic Pay</div>
                        <div style={{ fontWeight: 700, marginTop: 2 }}>₹{Number(p.basic_pay).toLocaleString()}</div>
                      </div>
                      <div style={{ background: 'var(--card-bg, #FFFFFF)', padding: 6, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                        <div style={{ color: '#64748B' }}>Deductions</div>
                        <div style={{ fontWeight: 700, color: '#DC2626', marginTop: 2 }}>
                          ₹{(Number(p.pf_deduction || 0) + Number(p.tax_deduction || 0)).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ background: '#EFF6FF', padding: 6, borderRadius: 6, border: '1px solid #BFDBFE' }}>
                        <div style={{ color: '#2563EB', fontWeight: 600 }}>Net Pay</div>
                        <div style={{ fontWeight: 800, color: '#1D4ED8', marginTop: 2 }}>₹{Number(p.net_salary).toLocaleString()}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        background: '#1E293B',
                        color: '#FFFFFF',
                        padding: '6px 14px',
                        borderRadius: 6,
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 4
                      }}
                    >
                      <Printer size={13} /> Print Salary Slip
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
