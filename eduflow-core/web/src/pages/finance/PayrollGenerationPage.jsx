import { useState, useEffect } from 'react'
import { Printer, Calculator } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function PayrollGenerationPage() {
  const [payslips, setPayslips] = useState([])
  const [facultyName, setFacultyName] = useState('Dr. Ramesh Kumar')
  const [designation, setDesignation] = useState('Professor & HOD')
  const [basicPay, setBasicPay] = useState('115000')
  const [month, setMonth] = useState('November')
  const [year, setYear] = useState('2026')
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState('')
  const [, setSelectedSlip] = useState(null)

  const fetchPayslips = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/finance/payslips`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.payslips) setPayslips(data.payslips)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  useEffect(() => {
    fetchPayslips()
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/finance/payslips/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_name: facultyName,
          designation,
          basic_pay: basicPay,
          month,
          year
        })
      })
      if (res.ok) {
        const data = await safeJson(res)
        setMsg(`Payslip for ${facultyName} (${month} ${year}) generated with 100% statutory DA/PF compliance.`)
        setSelectedSlip(data.payslip)
        fetchPayslips()
        setTimeout(() => setMsg(''), 5000)
      }
    } catch (_err) {
      setMsg('Failed to generate payslip.')
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
    <RolePageTemplate role="finance" title="Institutional Payroll & Salary Slip Engine">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 13, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Generator Form */}
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                <Calculator size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Generate Monthly Payslip</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Statutory 7th Pay Commission allowances & PF deductions</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Employee / Faculty Name</label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Designation</label>
                <select value={designation} onChange={(e) => setDesignation(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}>
                  <option value="Professor & HOD">Professor & HOD</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Senior Lecturer">Senior Lecturer</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Pay Month</label>
                  <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}>
                    <option value="November">November</option>
                    <option value="December">December</option>
                    <option value="October">October</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Pay Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Basic Pay (₹ INR)</label>
                <input
                  type="number"
                  value={basicPay}
                  onChange={(e) => setBasicPay(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              {/* Computed Preview Card */}
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DA (50%) + HRA (24%):</span>
                  <span style={{ fontWeight: 600 }}>₹{(da + hra).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
                  <span>Deductions (PF 12% + TDS 10%):</span>
                  <span style={{ fontWeight: 600 }}>-₹{deductions.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: 6, fontWeight: 800, fontSize: 13, color: '#0F172A' }}>
                  <span>Estimated Net Take-Home:</span>
                  <span style={{ color: '#16A34A' }}>₹{net.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
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
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A' }}>Recent Generated Payslips</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {payslips.map((p) => (
                <div key={p.id} style={{ padding: 16, borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{p.faculty_name}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{p.designation} &bull; {p.month} {p.year}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '3px 8px', borderRadius: 4 }}>
                      {p.payment_status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '10px 0', fontSize: 11, textAlign: 'center' }}>
                    <div style={{ background: '#FFFFFF', padding: 6, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                      <div style={{ color: '#64748B' }}>Basic Pay</div>
                      <div style={{ fontWeight: 700, marginTop: 2 }}>₹{Number(p.basic_pay).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: 6, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                      <div style={{ color: '#64748B' }}>Deductions</div>
                      <div style={{ fontWeight: 700, color: '#DC2626', marginTop: 2 }}>₹{(Number(p.pf_deduction) + Number(p.tax_deduction)).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#EFF6FF', padding: 6, borderRadius: 6, border: '1px solid #BFDBFE' }}>
                      <div style={{ color: '#2563EB', fontWeight: 600 }}>Net Pay</div>
                      <div style={{ fontWeight: 800, color: '#1D4ED8', marginTop: 2 }}>₹{Number(p.net_salary).toLocaleString()}</div>
                    </div>
                  </div>

                  <button
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
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
