import { useState, useEffect } from 'react'
import { Clock, Send, ShieldAlert } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function GrievancePage() {
  const [grievances, setGrievances] = useState([])
  const [category, setCategory] = useState('Academic')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const fetchGrievances = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/grievances`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.grievances) setGrievances(data.grievances)
      }
    } catch (_err) {
      // Graceful fallback
    }
  }

  useEffect(() => {
    fetchGrievances()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/grievances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject,
          description,
          priority,
          student_roll: 'SS26',
          student_name: 'Ananya Sharma'
        })
      })
      if (res.ok) {
        setStatusMsg('Grievance logged successfully! HOD & Dean notified.')
        setSubject('')
        setDescription('')
        fetchGrievances()
        setTimeout(() => setStatusMsg(''), 4000)
      }
    } catch (_err) {
      setStatusMsg('Failed to submit grievance. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate role="student" title="Student Grievance Redressal Portal">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Submission Form */}
        <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 10, borderRadius: 8 }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1E293B' }}>Submit a Grievance</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Directly escalated to HOD & Institutional Ombudsman</p>
            </div>
          </div>

          {statusMsg && (
            <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', marginBottom: 16, fontSize: 13 }}>
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC' }}
              >
                <option value="Academic">Academic (Curriculum, Evaluations, Scheduling)</option>
                <option value="Hostel">Hostel & Accommodation</option>
                <option value="Mess">Mess & Canteen Sanitation</option>
                <option value="Infrastructure">Infrastructure (Labs, Wi-Fi, Classrooms)</option>
                <option value="Fee">Fee & Bursary Reconciliation</option>
                <option value="Harassment">Anti-Ragging / Student Welfare (High Priority)</option>
                <option value="Other">Other Operational Concern</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC' }}
              >
                <option value="LOW">Low — General inquiry or suggestion</option>
                <option value="MEDIUM">Medium — Standard resolution required within 3 days</option>
                <option value="HIGH">High — Impedes ongoing coursework or living conditions</option>
                <option value="URGENT">Urgent — Immediate Dean intervention required</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Subject / Headline</label>
              <input
                type="text"
                placeholder="e.g. Projector failure in Lab 3 or Mess water cooler leak"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Detailed Description</label>
              <textarea
                rows={4}
                placeholder="Please describe the incident, location, timing, and impact..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1' }}
              />
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
              {submitting ? 'Submitting...' : 'Lodge Formal Grievance'}
            </button>
          </form>
        </div>

        {/* Existing Grievances History */}
        <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#F1F5F9', color: '#475569', padding: 10, borderRadius: 8 }}>
              <Clock size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1E293B' }}>Grievance Status & History</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Real-time resolution updates from Academic Council</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {grievances.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', padding: 30 }}>No grievances logged. Your campus experience is currently clear.</p>
            ) : (
              grievances.map((g) => {
                const isResolved = g.status === 'RESOLVED'
                return (
                  <div
                    key={g.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      padding: 16,
                      background: isResolved ? '#F8FAFC' : '#FFFFFF',
                      borderLeft: isResolved ? '4px solid #10B981' : '4px solid #F59E0B'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>{g.category}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: isResolved ? '#DCFCE7' : '#FEF3C7',
                          color: isResolved ? '#15803D' : '#B45309'
                        }}
                      >
                        {g.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 6px 0' }}>{g.subject}</h3>
                    <p style={{ fontSize: 13, color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>{g.description}</p>
                    {g.resolution_notes && (
                      <div style={{ background: '#F0FDF4', border: '1px dashed #86EFAC', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#166534', marginTop: 8 }}>
                        <strong>Resolution ({g.resolved_by || 'Authority'}):</strong> {g.resolution_notes}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} /> Logged {new Date(g.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
