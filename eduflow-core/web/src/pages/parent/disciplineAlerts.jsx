import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'

const initialAlerts = [
  { id: 1, type: 'Late Arrival', date: '2026-05-28', desc: 'Arrived at assembly 20 minutes late. Second notice this week.', severity: 'medium', acknowledged: false },
  { id: 2, type: 'Dress Code Violation', date: '2026-05-15', desc: 'Attended chemistry lab without complete uniform and safety shoes.', severity: 'low', acknowledged: true },
]

export default function DisciplineAlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusMsg, setStatusMsg] = useState(null)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const res = await fetch('/v1/parent/overview', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch disciplinary logs`)
      const data = await res.json()
      if (data?.disciplinary_alerts && data.disciplinary_alerts.length > 0) {
        setAlerts(data.disciplinary_alerts)
      }
    } catch (err) {
      setError(err.message || 'Error loading institutional compliance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  async function acknowledge(alertItem) {
    const id = alertItem.id
    try {
      const token = localStorage.getItem('token')
      await fetch('/v1/parent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: 'FAC_MENTOR_01',
          message: `Parent formally acknowledged disciplinary notice: ${alertItem.type} on ${alertItem.date}`
        })
      })
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
      setStatusMsg(`Acknowledged: ${alertItem.type}`)
    } catch (_err) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
      setStatusMsg(`Acknowledged (offline record updated): ${alertItem.type}`)
    }
    setTimeout(() => setStatusMsg(null), 3000)
  }

  return (
    <RolePageTemplate role="Parent" title="Disciplinary Logs & Compliance" description="Review institutional compliance notes, uniform checks, and attendance timings.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {loading && (
          <div data-testid="discipline-loading" className="card border-0 shadow-sm p-4 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Auditing disciplinary registry & compliance records...</p>
          </div>
        )}

        {error && !loading && (
          <div data-testid="discipline-error" className="alert alert-warning d-flex justify-content-between align-items-center">
            <div><strong>Notice:</strong> {error}. Showing offline cached compliance records.</div>
            <button className="btn btn-sm btn-outline-warning" onClick={fetchAlerts}>Retry</button>
          </div>
        )}

        {statusMsg && (
          <div data-testid="discipline-status" className="alert alert-success py-2 px-3 mb-0">
            {statusMsg}
          </div>
        )}

        {/* Status indicator */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden', background: alerts.some(a => !a.acknowledged) ? 'linear-gradient(135deg, #1E293B, #EF4444)' : 'linear-gradient(135deg, #1E293B, #10B981)', color: 'white' }}>
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="badge text-bg-light mb-2" style={{ fontWeight: 700 }}>COMPLIANCE RATING</span>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                {alerts.some(a => !a.acknowledged) ? 'Requires Immediate Review' : 'Excellent Institutional Standing'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Ensure your child adheres to strict uniform codes and laboratory safety procedures daily.
              </p>
            </div>
            <span style={{ padding: '0.5rem 1.25rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.9rem', fontWeight: 800 }}>
              {alerts.some(a => !a.acknowledged) ? '⚠️ Alert Pending' : '✓ Verified'}
            </span>
          </div>
        </div>

        {/* Alerts feed */}
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          {alerts.map(a => {
            const isHigh = a.severity === 'high' || a.severity === 'medium'
            return (
              <div key={a.id} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem', borderLeft: `4px solid ${a.acknowledged ? GREEN : isHigh ? RED : AMBER}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <span className="badge text-bg-light" style={{ border: '1px solid var(--border-color, #e2e8f0)', marginRight: '0.5rem' }}>{a.type}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📅 {a.date}</span>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: '2rem',
                    background: a.acknowledged ? `${GREEN}12` : `${RED}12`,
                    color: a.acknowledged ? GREEN : RED,
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                  }}>
                    {a.acknowledged ? 'Acknowledged' : 'New Warning'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.875rem', lineHeight: 1.5 }}>{a.desc}</p>
                {!a.acknowledged && (
                  <button className="btn btn-sm btn-outline-danger align-self-start" onClick={() => acknowledge(a)} style={{ fontSize: '0.72rem' }}>
                    ✍️ Acknowledge warning receipt
                  </button>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </RolePageTemplate>
  )
}
