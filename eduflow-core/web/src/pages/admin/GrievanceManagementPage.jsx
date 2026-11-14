import { useState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function GrievanceManagementPage() {
  const [grievances, setGrievances] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [selectedGrievance, setSelectedGrievance] = useState(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolving, setResolving] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchGrievances = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/grievances`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.grievances) setGrievances(data.grievances)
      }
    } catch (_err) {
      // Fallback
    }
  }

  useEffect(() => {
    fetchGrievances()
  }, [])

  const handleResolve = async (id, status = 'RESOLVED') => {
    setResolving(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/grievances/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolution_notes: resolutionNotes || 'Resolved per departmental inspection.'
        })
      })
      if (res.ok) {
        setMsg(`Grievance #${id} marked as ${status}.`)
        setSelectedGrievance(null)
        setResolutionNotes('')
        fetchGrievances()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (_err) {
      setMsg('Failed to update grievance.')
    } finally {
      setResolving(false)
    }
  }

  const filtered = grievances.filter((g) => {
    if (filter === 'ALL') return true
    return g.status === filter
  })

  return (
    <RolePageTemplate role="admin" title="Institutional Grievance Redressal Council">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>Active Student Grievances</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Statutory UGC Ombudsperson Redressal & Resolution Desk</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'SUBMITTED', 'IN_REVIEW', 'RESOLVED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #CBD5E1',
                  background: filter === f ? '#1E293B' : '#FFFFFF',
                  color: filter === f ? '#FFFFFF' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {msg && (
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', marginBottom: 16, fontSize: 13 }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
          {filtered.map((g) => {
            const isResolved = g.status === 'RESOLVED'
            return (
              <div
                key={g.id}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: 6 }}>
                      {g.category}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isResolved ? '#DCFCE7' : '#FEF3C7',
                        color: isResolved ? '#15803D' : '#B45309'
                      }}
                    >
                      {g.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: '0 0 6px 0' }}>{g.subject}</h3>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.4, margin: '0 0 12px 0' }}>{g.description}</p>

                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 10, fontSize: 12, color: '#334155', marginBottom: 12 }}>
                    <div><strong>Student:</strong> {g.student_name} ({g.student_roll})</div>
                    <div><strong>Priority:</strong> {g.priority}</div>
                    <div><strong>Logged:</strong> {new Date(g.created_at).toLocaleString()}</div>
                  </div>

                  {g.resolution_notes && (
                    <div style={{ background: '#F0FDF4', border: '1px dashed #86EFAC', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#166534', marginBottom: 12 }}>
                      <strong>Resolution:</strong> {g.resolution_notes}
                    </div>
                  )}
                </div>

                {!isResolved && (
                  <button
                    onClick={() => setSelectedGrievance(g)}
                    style={{
                      width: '100%',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      padding: '9px 14px',
                      borderRadius: 8,
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <CheckCircle2 size={16} /> Resolve Grievance
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Modal for resolving */}
        {selectedGrievance && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 12, maxWidth: 520, width: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: '#0F172A' }}>Resolve Grievance #{selectedGrievance.id}</h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 14px 0' }}>{selectedGrievance.subject} — {selectedGrievance.student_name} ({selectedGrievance.student_roll})</p>

              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Resolution Notes for Student & Academic Council</label>
              <textarea
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Detail action taken (e.g., equipment repaired, room reassigned, fine waived)..."
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #CBD5E1', marginBottom: 16 }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setSelectedGrievance(null)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  disabled={resolving}
                  onClick={() => handleResolve(selectedGrievance.id, 'RESOLVED')}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#10B981', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
                >
                  {resolving ? 'Saving...' : 'Mark Resolved'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
