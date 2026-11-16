import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import SkeletonLoader from '../../components/SkeletonLoader'
import apiClient from '../../services/apiClient'

export default function LeaveApprovalsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [msg, setMsg] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchRequests = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const res = await apiClient.get('/leave/requests')
      const data = res.data || {}
      setRequests(data.requests || (Array.isArray(data) ? data : []))
    } catch (err) {
      console.error('[LeaveApprovalsPage] Fetch error:', err)
      setApiError(err.response?.data?.error || err.message || 'Failed to load leave requests from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (id, status) => {
    setUpdatingId(id)
    setApiError(null)
    try {
      const review_comment = status === 'APPROVED'
        ? 'Approved by Department Head. Attendance preserved.'
        : 'Rejected due to core lab evaluation conflict.'

      const res = await apiClient.patch(`/leave/${id}/status`, {
        status,
        review_comment
      })

      if (res.data?.success || res.status === 200) {
        setMsg(`Leave #${id} marked as ${status}.`)
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status, review_comment } : r))
        setTimeout(() => setMsg(''), 4000)
      } else {
        throw new Error(res.data?.error || 'Failed to update leave status')
      }
    } catch (err) {
      console.error('[LeaveApprovalsPage] Update error:', err)
      setApiError(err.response?.data?.error || err.message || 'Failed to update leave request.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <RolePageTemplate role="hod" title="Departmental Student Leave Approvals">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--app-heading, #0F172A)' }}>
              Leave Requests &amp; Outing Authorizations
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              1-click approval for authorized medical, OD, and hostel absences
            </p>
          </div>
        </div>

        {apiError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3" role="alert" data-testid="leave-api-error">
            <div>⚠️ {apiError}</div>
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchRequests}>Retry</button>
          </div>
        )}

        {msg && (
          <div className="alert alert-success p-3" role="alert" data-testid="leave-action-feedback" style={{ borderRadius: 8, fontWeight: 600 }}>
            ✓ {msg}
          </div>
        )}

        {loading ? (
          <div data-testid="leave-loading">
            <SkeletonLoader variant="card" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-5 text-muted card border-0 shadow-sm" data-testid="empty-leave-requests" style={{ borderRadius: 12 }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <div className="fw-semibold">No pending leave applications</div>
            <div className="small">All departmental student leaves and gate passes are currently up to date.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 18 }} data-testid="leave-requests-grid">
            {requests.map((r) => {
              const isApproved = r.status === 'APPROVED'
              const isPending = r.status === 'PENDING'
              return (
                <div
                  key={r.id}
                  data-testid={`leave-card-${r.id}`}
                  style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: 12,
                    border: '1px solid var(--border-color, #E2E8F0)',
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
                        data-testid={`status-badge-${r.id}`}
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

                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--app-text, #0F172A)' }}>
                      {r.student_name}
                    </h3>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                      Roll No: {r.student_roll} &bull; {r.department}
                    </div>

                    <div style={{ background: 'var(--surface-bg, #F8FAFC)', padding: 10, borderRadius: 8, fontSize: 12, color: 'var(--app-text-muted, #334155)', marginBottom: 12, border: '1px solid var(--border-color, #EDF2F7)' }}>
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
                        type="button"
                        data-testid={`approve-btn-${r.id}`}
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
                        <CheckCircle2 size={15} /> {updatingId === r.id ? 'Updating...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        data-testid={`reject-btn-${r.id}`}
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
                        <XCircle size={15} /> {updatingId === r.id ? 'Updating...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
