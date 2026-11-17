import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const VIOLET = '#7C3AED'
const sessionTypes = ['Academic Concern', 'Career Guidance', 'Personal Wellbeing', 'Attendance Issue', 'General Check-in']
const typeColor = { 'Academic Concern': '#EF4444', 'Career Guidance': '#2563EB', 'Personal Wellbeing': '#10B981', 'Attendance Issue': '#F59E0B', 'General Check-in': VIOLET }

export default function Page() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    student: 'Sai Sree',
    type: 'Academic Concern',
    duration: '30 min',
    notes: 'Discussed improvement strategies for mathematics midterm.',
    action: 'Weekly problem set review',
    followUp: '2026-05-25'
  })

  const fetchMentoringLogs = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parent/chat'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load mentoring logs (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.messages) ? data.messages : []
        const formatted = raw.length > 0 ? raw.map((m, idx) => ({
          id: m.id || idx,
          student: idx % 2 === 0 ? 'Sai Sree' : 'Anika Rao',
          date: m.timestamp ? m.timestamp.split('T')[0] : '2026-05-10',
          type: idx % 2 === 0 ? 'Academic Concern' : 'Career Guidance',
          duration: '30 min',
          notes: m.text || 'Discussed academic roadmap and attendance.',
          action: 'Follow-up planned with parents',
          followUp: '2026-05-25'
        })) : [
          { id: 1, student: 'Sai Sree', date: '2026-05-07', type: 'Academic Concern', duration: '25 min', notes: 'Discussed weak performance in calculus. Suggested extra tutorials.', action: 'Weekly check-in scheduled', followUp: '2026-05-14' },
          { id: 2, student: 'Anika Rao', date: '2026-05-05', type: 'Career Guidance', duration: '40 min', notes: 'Explored GATE & campus placement strategy.', action: 'Enrolled in mock test sessions', followUp: '2026-05-20' }
        ]
        setLogs(formatted)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching mentoring logs')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchMentoringLogs(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleAddSession(e) {
    if (e && e.preventDefault) e.preventDefault()
    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parent/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sender: 'mentor',
          text: `[Mentoring Log - ${form.student}]: ${form.notes} (Action: ${form.action})`
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to record mentoring log')

      setToastMessage(`Mentoring session for ${form.student} recorded successfully!`)
      setShowForm(false)
      setTimeout(() => setToastMessage(''), 4500)
      await fetchMentoringLogs(true)
    } catch (err) {
      setToastMessage(err.message || 'Error recording session')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate role="Faculty" title="Mentoring Log" description="Record and review mentoring sessions with your assigned students.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="mentor-log-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="mentor-log-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="mentor-log-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Mentoring Logs</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchMentoringLogs(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Total Sessions', value: logs.length, color: VIOLET },
                { label: 'This Month', value: logs.length, color: '#2563EB' },
                { label: 'Students Mentored', value: [...new Set(logs.map(s => s.student))].length || 1, color: '#10B981' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Add Session Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                data-testid="open-log-form-btn"
                onClick={() => setShowForm(v => !v)}
                className="btn btn-sm btn-primary"
              >
                {showForm ? '✕ Cancel' : '+ Log Session'}
              </button>
            </div>

            {/* Log Form */}
            {showForm && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: `4px solid ${VIOLET}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Record Mentoring Session</h3>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                </div>
                <form onSubmit={handleAddSession} data-testid="mentoring-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>STUDENT NAME</label>
                    <input className="form-control form-control-sm" required value={form.student} onChange={e => setForm(p => ({...p, student: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SESSION TYPE</label>
                    <select className="form-select form-select-sm" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                      {sessionTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DURATION</label>
                    <input className="form-control form-control-sm" value={form.duration} onChange={e => setForm(p => ({...p, duration: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ACTION PLAN</label>
                    <input className="form-control form-control-sm" value={form.action} onChange={e => setForm(p => ({...p, action: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SESSION NOTES</label>
                    <textarea rows={2} required className="form-control form-control-sm" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" disabled={submitting} data-testid="submit-mentoring-btn" className="btn btn-sm btn-primary">
                      {submitting ? 'Saving...' : 'Save Mentoring Log'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sessions List */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📋 Mentoring History</h2>
              <div style={{ display: 'grid', gap: '0.875rem' }}>
                {logs.map((s, idx) => {
                  const color = typeColor[s.type] || VIOLET
                  return (
                    <div key={s.id || idx} style={{
                      padding: '1rem 1.25rem', borderRadius: '1rem', background: `${color}06`,
                      border: `1px solid ${color}20`, borderLeft: `4px solid ${color}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.student}</span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 {s.date} · ⏱ {s.duration}</span>
                      </div>
                      <p style={{ margin: '0.35rem 0', fontSize: '0.82rem', color: '#334155' }}>{s.notes}</p>
                      <div style={{ fontSize: '0.75rem', color: color, fontWeight: 700 }}>
                        🎯 Action: {s.action}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
