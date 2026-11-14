import { useState, useEffect } from 'react'
import { Calendar, Clock, Send } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function LeaveApplicationPage() {
  const [requests, setRequests] = useState([])
  const [leaveType, setLeaveType] = useState('Medical')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [parentConsent, setParentConsent] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fromDate || !toDate || !reason.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/leave/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_roll: 'SS26',
          student_name: 'Ananya Sharma',
          department: 'Computer Science',
          leave_type: leaveType,
          from_date: fromDate,
          to_date: toDate,
          reason,
          parent_consent: parentConsent
        })
      })
      if (res.ok) {
        setMsg('Leave application forwarded to HOD for approval.')
        setReason('')
        setFromDate('')
        setToDate('')
        fetchRequests()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (_err) {
      setMsg('Failed to apply for leave.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate role="student" title="Student Leave & Outing Applications">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Leave Application Form */}
        <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 10, borderRadius: 8 }}>
              <Calendar size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1E293B' }}>Apply for Leave</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Statutory attendance preservation for authorized absence</p>
            </div>
          </div>

          {msg && (
            <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Leave Classification</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC' }}
              >
                <option value="Medical">Medical Rest (Hospital / Campus Dispensary)</option>
                <option value="OnDuty">On Duty (Hackathons, Research Symposia, Sports)</option>
                <option value="Personal">Personal / Family Emergency</option>
                <option value="HostelOuting">Hostel Weekend Hometown Outing</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Reason & Event Details</label>
              <textarea
                rows={3}
                placeholder="State the reason clearly. For OnDuty leaves, cite event name..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <input
                type="checkbox"
                id="parentConsent"
                checked={parentConsent}
                onChange={(e) => setParentConsent(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="parentConsent" style={{ fontSize: 12, color: '#475569', cursor: 'pointer' }}>
                Parent has been informed and given consent via registered mobile number
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#2563EB',
                color: '#FFFFFF',
                padding: '12px 20px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={16} />
              {submitting ? 'Transmitting...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>

        {/* Status History */}
        <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#F1F5F9', color: '#475569', padding: 10, borderRadius: 8 }}>
              <Clock size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1E293B' }}>Application Log</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>HOD approval statuses & gate verification passes</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.map((r) => {
              const isApproved = r.status === 'APPROVED'
              const isPending = r.status === 'PENDING'
              return (
                <div key={r.id} style={{ padding: 14, borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{r.leave_type} Leave</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: isApproved ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2',
                        color: isApproved ? '#15803D' : isPending ? '#B45309' : '#B91C1C'
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600, marginBottom: 4 }}>
                    {r.from_date} to {r.to_date}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>{r.reason}</div>
                  {r.review_comment && (
                    <div style={{ background: '#F0FDF4', border: '1px dashed #86EFAC', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#166534', marginTop: 8 }}>
                      <strong>{r.reviewed_by || 'HOD'}:</strong> {r.review_comment}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
