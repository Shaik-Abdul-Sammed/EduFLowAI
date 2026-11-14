import { useState, useEffect } from 'react'
import { CheckCircle, FileCheck } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function ScholarshipManagementPage() {
  const [scholarships, setScholarships] = useState([])
  const [verifyingId, setVerifyingId] = useState(null)
  const [msg, setMsg] = useState('')

  const fetchScholarships = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/scholarships`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.scholarships) setScholarships(data.scholarships)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [])

  const handleVerify = async (id) => {
    setVerifyingId(id)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/scholarships/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        const data = await safeJson(res)
        setMsg(data?.message || 'Scholarship verified & deducted from next invoice credit!')
        fetchScholarships()
        setTimeout(() => setMsg(''), 5000)
      }
    } catch (_err) {
      setMsg('Verification failed.')
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <RolePageTemplate role="admin" title="Scholarships & Tuition Waiver Bursary Desk">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>Scholarship Verification & Auto-Deductions</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Verified grants are automatically credited against upcoming term fee invoices</p>
        </div>

        {msg && (
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 13, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
          {scholarships.map((s) => {
            const isVerified = s.status === 'VERIFIED'
            return (
              <div
                key={s.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  padding: 22,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: 4 }}>
                      {s.category} Grant
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: isVerified ? '#DCFCE7' : '#FEF3C7',
                        color: isVerified ? '#15803D' : '#B45309'
                      }}
                    >
                      {s.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>{s.scholarship_name}</h3>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#16A34A', margin: '6px 0 12px 0' }}>
                    ₹{Number(s.amount).toLocaleString()}
                  </div>

                  <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #EDF2F7', fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                    <div><strong>Beneficiary:</strong> {s.student_name} (Roll: {s.student_roll})</div>
                    <div><strong>Academic GPA:</strong> {s.gpa} / 10.0</div>
                    <div><strong>Family Annual Income:</strong> ₹{Number(s.annual_family_income || 0).toLocaleString()}</div>
                    {s.invoice_deduction_id && (
                      <div style={{ color: '#2563EB', fontWeight: 600, marginTop: 4 }}>
                        &bull; Auto-Deduction Ref: {s.invoice_deduction_id}
                      </div>
                    )}
                  </div>
                </div>

                {!isVerified ? (
                  <button
                    disabled={verifyingId === s.id}
                    onClick={() => handleVerify(s.id)}
                    style={{
                      background: '#10B981',
                      color: '#FFFFFF',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: verifyingId === s.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <FileCheck size={16} /> Verify & Deduct from Next Fee
                  </button>
                ) : (
                  <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={16} /> Verified by {s.verified_by || 'Finance Officer'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </RolePageTemplate>
  )
}
