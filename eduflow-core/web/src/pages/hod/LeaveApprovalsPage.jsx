import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function LeaveApprovalsPage() {
  const [requests, setRequests] = useState([])
  const [msg, setMsg] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/leave/requests`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.requests) setRequests(data.requests)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (id, status) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/leave/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          review_comment: status === 'APPROVED' ? 'Approved by Department Head. Attendance preserved.' : 'Rejected due to core lab evaluation conflict.'
        })
      })
      if (res.ok) {
        setMsg(`Leave #${id} marked as ${status}.`)
        fetchRequests()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (_err) {
      setMsg('Failed to update leave.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <RolePageTemplate role="hod" title="Departmental Student Leave Approvals">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>Leave Requests & Outing Authorizations</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>1-click approval for authorized medical, OD, and hostel absences</p>
          </div>
        </div>

        {msg && (
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 18 }}>
          {requests.map((r) => {
            const isApproved = r.status === 'APPROVED'
            const isPending = r.status === 'PENDING'
            return (
              <div
                key={r.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#EFF6FF', color: '#2563EB' }}>
                      {r.leave_type} Leave
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: isApproved ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2',
                        color: isApproved ? '#15803D' : isPending ? '#B45309' : '#B91C1C'
                      }}
                    >
                      {r.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>{r.student_name}</h3>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Roll No: {r.student_roll} &bull; {r.department}</div>

                  <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 8, fontSize: 12, color: '#334155', marginBottom: 12, border: '1px solid #EDF2F7' }}>
                    <div><strong>Duration:</strong> {r.from_date} to {r.to_date}</div>
                    <div style={{ marginTop: 4 }}><strong>Reason:</strong> {r.reason}</div>
                    <div style={{ marginTop: 4, color: r.parent_consent ? '#16A34A' : '#D97706', fontWeight: 600 }}>
                      &bull; {r.parent_consent ? 'Parent Consent Verified' : 'Parent Consent Pending'}
                    </div>
                  </div>

                  {r.review_comment && (
                    <div style={{ background: '#F0FDF4', border: '1px dashed #86EFAC', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#166534', marginBottom: 12 }}>
                      <strong>Decision Note:</strong> {r.review_comment}
                    </div>
                  )}
                </div>

                {isPending && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      disabled={updatingId === r.id}
                      onClick={() => handleAction(r.id, 'APPROVED')}
                      style={{
                        flex: 1,
                        background: '#10B981',
                        color: '#FFFFFF',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: 'none',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button
                      disabled={updatingId === r.id}
                      onClick={() => handleAction(r.id, 'REJECTED')}
                      style={{
                        flex: 1,
                        background: '#EF4444',
                        color: '#FFFFFF',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: 'none',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <XCircle size={15} /> Reject
                    </button>
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
