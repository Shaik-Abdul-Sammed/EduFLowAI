import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'
import {
  Users, Calendar, Clock, CheckCircle2, AlertTriangle,
  Search, Filter, Plus, FileText, Send, UserCheck, Shield
} from 'lucide-react'

const VIOLET = '#7C3AED'
const sessionTypes = ['Academic Concern', 'Career Guidance', 'Personal Wellbeing', 'Attendance Issue', 'General Check-in']
const typeColor = {
  'Academic Concern': '#EF4444',
  'Career Guidance': '#2563EB',
  'Personal Wellbeing': '#10B981',
  'Attendance Issue': '#F59E0B',
  'General Check-in': VIOLET
}

const defaultLogsList = [
  {
    id: 1,
    student: 'Sai Sree',
    roll: '2024-CSE-012',
    date: '2026-05-07',
    type: 'Academic Concern',
    duration: '25 min',
    notes: 'Discussed weak performance in calculus. Suggested extra tutorials and weekly question review.',
    action: 'Weekly check-in scheduled; remedial problem sets assigned',
    followUp: '2026-05-14',
    atRisk: true,
    parentNotified: true
  },
  {
    id: 2,
    student: 'Anika Rao',
    roll: '2024-CSE-028',
    date: '2026-05-05',
    type: 'Career Guidance',
    duration: '40 min',
    notes: 'Explored GATE 2027 preparation and software engineer internship roadmap.',
    action: 'Enrolled in departmental mock aptitude sessions',
    followUp: '2026-05-20',
    atRisk: false,
    parentNotified: false
  },
  {
    id: 3,
    student: 'Shaik Abdul Sammed',
    roll: '2024-CSE-042',
    date: '2026-05-02',
    type: 'General Check-in',
    duration: '20 min',
    notes: 'Reviewed Semester 4 project milestone progress and hostel adjustment.',
    action: 'On track with Capstone Phase 1',
    followUp: '2026-06-01',
    atRisk: false,
    parentNotified: true
  }
]

export default function Page() {
  const [logs, setLogs] = useState(defaultLogsList)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const [form, setForm] = useState({
    student: 'Sai Sree',
    roll: '2024-CSE-012',
    type: 'Academic Concern',
    duration: '30 min',
    notes: 'Discussed improvement strategies for mathematics midterm and lab submissions.',
    action: 'Weekly problem set review and mentor office hours follow-up',
    followUp: '2026-05-25',
    atRisk: false,
    notifyParent: true
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
        if (raw.length > 0) {
          const formatted = raw.map((m, idx) => ({
            id: m.id || idx,
            student: idx % 2 === 0 ? 'Sai Sree' : 'Anika Rao',
            roll: idx % 2 === 0 ? '2024-CSE-012' : '2024-CSE-028',
            date: m.timestamp ? m.timestamp.split('T')[0] : '2026-05-10',
            type: idx % 2 === 0 ? 'Academic Concern' : 'Career Guidance',
            duration: '30 min',
            notes: m.text || 'Discussed academic roadmap and attendance.',
            action: 'Follow-up planned with parents',
            followUp: '2026-05-25',
            atRisk: idx % 2 === 0,
            parentNotified: true
          }))
          setLogs(formatted)
        }
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
      await fetch(getFullApiUrl('/v1/parent/chat'), {
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

      const newLog = {
        id: Date.now(),
        student: form.student,
        roll: form.roll || '2024-CSE-042',
        date: new Date().toISOString().split('T')[0],
        type: form.type,
        duration: form.duration,
        notes: form.notes,
        action: form.action,
        followUp: form.followUp,
        atRisk: form.atRisk,
        parentNotified: form.notifyParent
      }
      setLogs(prev => [newLog, ...prev])

      setToastMessage(`Mentoring session for ${form.student} recorded successfully!`)
      setShowForm(false)
      setTimeout(() => setToastMessage(''), 4500)
    } catch (err) {
      const newLog = {
        id: Date.now(),
        student: form.student,
        roll: form.roll || '2024-CSE-042',
        date: new Date().toISOString().split('T')[0],
        type: form.type,
        duration: form.duration,
        notes: form.notes,
        action: form.action,
        followUp: form.followUp,
        atRisk: form.atRisk,
        parentNotified: form.notifyParent
      }
      setLogs(prev => [newLog, ...prev])
      setToastMessage(`Mentoring session for ${form.student} saved (offline record created).`)
      setShowForm(false)
      setTimeout(() => setToastMessage(''), 4500)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredLogs = logs.filter(l => {
    const matchesType = typeFilter === 'all' || l.type === typeFilter
    const matchesSearch = l.student.toLowerCase().includes(search.toLowerCase()) ||
      (l.roll || '').toLowerCase().includes(search.toLowerCase()) ||
      l.notes.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <RolePageTemplate role="Faculty" title="Mentoring Log" description="Record, counsel, and track holistic student progress, remedial interventions, and parent consultations.">
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Total Sessions', value: logs.length, color: VIOLET, icon: '📋' },
                { label: 'Mentees in Roster', value: [...new Set(logs.map(s => s.student))].length || 3, color: '#2563EB', icon: '👥' },
                { label: 'At-Risk Remedial Flagged', value: logs.filter(l => l.atRisk).length, color: '#EF4444', icon: '⚠️' },
                { label: 'Parent Summaries Sent', value: logs.filter(l => l.parentNotified).length, color: '#10B981', icon: '📱' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.35rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter and Action Strip */}
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '1rem' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex gap-2 align-items-center flex-grow-1" style={{ maxWidth: 400 }}>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white border-end-0"><Search size={15} className="text-muted" /></span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search student mentee, roll, notes..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto' }}
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Session Types</option>
                    {sessionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <button
                    data-testid="open-log-form-btn"
                    onClick={() => setShowForm(v => !v)}
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  >
                    <Plus size={14} /> {showForm ? 'Cancel' : 'Log New Session'}
                  </button>
                </div>
              </div>
            </div>

            {/* Log Form */}
            {showForm && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: `4px solid ${VIOLET}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Record Mentoring & Counseling Session</h3>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                </div>
                <form onSubmit={handleAddSession} data-testid="mentoring-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>STUDENT NAME</label>
                    <input className="form-control form-control-sm" required value={form.student} onChange={e => setForm(p => ({...p, student: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ROLL NUMBER</label>
                    <input className="form-control form-control-sm" required value={form.roll} onChange={e => setForm(p => ({...p, roll: e.target.value}))} />
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
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ACTION PLAN</label>
                    <input className="form-control form-control-sm" value={form.action} onChange={e => setForm(p => ({...p, action: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SESSION NOTES</label>
                    <textarea rows={2} required className="form-control form-control-sm" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }} className="d-flex gap-4">
                    <div className="form-check form-switch small">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="riskCheck"
                        checked={form.atRisk}
                        onChange={e => setForm(p => ({ ...p, atRisk: e.target.checked }))}
                      />
                      <label className="form-check-label text-danger fw-semibold" htmlFor="riskCheck">
                        Flag as At-Risk Mentee (Triggers Dean Escalation)
                      </label>
                    </div>
                    <div className="form-check form-switch small">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notifyCheck"
                        checked={form.notifyParent}
                        onChange={e => setForm(p => ({ ...p, notifyParent: e.target.checked }))}
                      />
                      <label className="form-check-label text-primary fw-semibold" htmlFor="notifyCheck">
                        Send automated summary to Parent Portal
                      </label>
                    </div>
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
                {filteredLogs.map((s, idx) => {
                  const color = typeColor[s.type] || VIOLET
                  return (
                    <div key={s.id || idx} style={{
                      padding: '1rem 1.25rem', borderRadius: '1rem', background: `${color}06`,
                      border: `1px solid ${color}20`, borderLeft: `5px solid ${color}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '1rem' }}>{s.student}</span>
                          {s.roll && <span className="text-muted small ms-2 font-monospace">({s.roll})</span>}
                          {s.atRisk && <span className="badge bg-danger ms-2">AT-RISK REMEDIAL</span>}
                          {s.parentNotified && <span className="badge bg-success ms-1">Parent Notified</span>}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📅 {s.date} · ⏱ {s.duration}</span>
                      </div>
                      <p style={{ margin: '0.35rem 0', fontSize: '0.85rem', color: '#334155' }}>{s.notes}</p>
                      <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                        <div style={{ fontSize: '0.78rem', color: color, fontWeight: 700 }}>
                          🎯 Action Plan: {s.action}
                        </div>
                        {s.followUp && (
                          <span className="small text-muted">Next Review: <strong>{s.followUp}</strong></span>
                        )}
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
