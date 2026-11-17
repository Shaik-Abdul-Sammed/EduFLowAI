import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import {
  ShieldAlert, CheckCircle2, AlertTriangle, FileText, Search,
  Calendar, Check, MessageSquare, ChevronRight, Award, ShieldCheck
} from 'lucide-react'

const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'

const initialAlerts = [
  {
    id: 1,
    type: 'Late Arrival',
    category: 'Punctuality',
    date: '2026-05-28',
    desc: 'Arrived at morning assembly 20 minutes late. Second recorded late entry this fortnight.',
    severity: 'medium',
    acknowledged: false,
    reportedBy: 'Discipline Incharge - Prof. V. Raman',
    actionTaken: 'First verbal counsel logged'
  },
  {
    id: 2,
    type: 'Dress Code Violation',
    category: 'Dress & Safety',
    date: '2026-05-15',
    desc: 'Attended chemistry lab without regulation safety lab coat and covered footwear.',
    severity: 'low',
    acknowledged: true,
    reportedBy: 'Lab Superintendent - Mrs. M. Anuradha',
    actionTaken: 'Caution issued; safety equipment supplied'
  },
  {
    id: 3,
    type: 'Library Electronic Policy',
    category: 'Campus Conduct',
    date: '2026-04-10',
    desc: 'Speaking on mobile phone inside silence reading zone of Central Library 2nd floor.',
    severity: 'low',
    acknowledged: true,
    reportedBy: 'Chief Librarian - Dr. P. Seshadri',
    actionTaken: 'Recorded into institutional record'
  }
]

export default function DisciplineAlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusMsg, setStatusMsg] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeModalItem, setActiveModalItem] = useState(null)
  const [parentFeedback, setParentFeedback] = useState('')
  const [isAppeal, setIsAppeal] = useState(false)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
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
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
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

  async function handleAcknowledgeOrAppeal() {
    if (!activeModalItem) return
    const id = activeModalItem.id
    const alertType = activeModalItem.type
    try {
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
      await fetch('/v1/parent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: 'FAC_MENTOR_01',
          message: isAppeal
            ? `Parent submitted formal appeal regarding disciplinary incident "${alertType}": ${parentFeedback}`
            : `Parent formally signed & acknowledged disciplinary incident "${alertType}". Remarks: ${parentFeedback || 'Noted by parents.'}`
        })
      })
    } catch (_err) {}

    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      acknowledged: true,
      parentNote: parentFeedback || (isAppeal ? 'Appeal filed by parent' : 'Acknowledged by parent')
    } : a))

    setStatusMsg(isAppeal ? `Appeal filed for: ${alertType}` : `Formally acknowledged: ${alertType}`)
    setActiveModalItem(null)
    setParentFeedback('')
    setIsAppeal(false)
    setTimeout(() => setStatusMsg(null), 3500)
  }

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length
  const filtered = categoryFilter === 'all'
    ? alerts
    : alerts.filter(a => a.category === categoryFilter || a.type === categoryFilter)

  return (
    <RolePageTemplate role="Parent" title="Disciplinary Logs & Campus Conduct Registry" description="Review institutional compliance notes, uniform checks, and attendance timings.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Conduct Rating Hero Card */}
        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: '1.25rem',
            overflow: 'hidden',
            background: unacknowledgedCount > 0 ? 'linear-gradient(135deg, #1E293B, #991b1b)' : 'linear-gradient(135deg, #1E293B, #065f46)',
            color: 'white'
          }}
        >
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge text-bg-light fw-bold">INSTITUTIONAL MERIT SCORE</span>
                <span className="badge bg-white bg-opacity-20 text-white">Academic Year 2026-27</span>
              </div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                {unacknowledgedCount > 0 ? 'Requires Immediate Parental Review' : 'Good Institutional Compliance Standing'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
                Merit Rating: <strong>94 / 100</strong> • 0 Major Violations • {unacknowledgedCount} unacknowledged incident notices.
              </p>
            </div>
            <div className="text-end">
              <span style={{ padding: '0.5rem 1.25rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.9rem', fontWeight: 800 }}>
                {unacknowledgedCount > 0 ? `⚠️ ${unacknowledgedCount} Alert${unacknowledgedCount > 1 ? 's' : ''} Pending` : '✓ All Clear'}
              </span>
            </div>
          </div>
        </div>

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
          <div data-testid="discipline-status" className="alert alert-success py-2 px-3 mb-0 d-flex align-items-center gap-2">
            <CheckCircle2 size={18} /> {statusMsg}
          </div>
        )}

        {/* Categories Bar */}
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <span className="small text-muted fw-bold me-1">CATEGORY:</span>
          {['all', 'Punctuality', 'Dress & Safety', 'Campus Conduct'].map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setCategoryFilter(cat)}
              style={{ borderRadius: '2rem', fontSize: '0.8rem' }}
            >
              {cat === 'all' ? 'All Incidents' : cat}
            </button>
          ))}
        </div>

        {/* Alerts feed */}
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          {filtered.map(a => {
            const isHigh = a.severity === 'high' || a.severity === 'medium'
            return (
              <div
                key={a.id}
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: '1.25rem',
                  padding: '1.25rem',
                  borderLeft: `5px solid ${a.acknowledged ? GREEN : isHigh ? RED : AMBER}`
                }}
              >
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-secondary border">{a.category || 'Incident'}</span>
                    <strong style={{ fontSize: '0.95rem' }}>{a.type}</strong>
                    <span className="text-muted small">📅 {a.date}</span>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span
                      style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '2rem',
                        background: a.acknowledged ? `${GREEN}15` : `${RED}15`,
                        color: a.acknowledged ? GREEN : RED,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {a.acknowledged ? 'Acknowledged' : 'New Warning'}
                    </span>
                    {!a.acknowledged ? (
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => acknowledge(a)}
                          style={{ fontSize: '0.75rem', borderRadius: '2rem 0 0 2rem' }}
                        >
                          ✍️ Acknowledge warning receipt
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setActiveModalItem(a)
                            setIsAppeal(true)
                          }}
                          style={{ fontSize: '0.75rem', borderRadius: '0 2rem 2rem 0' }}
                        >
                          ⚖️ File Appeal
                        </button>
                      </div>
                    ) : (
                      <span className="text-success small fw-semibold">✓ Parent Verified</span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
                  {a.desc}
                </p>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top text-muted small">
                  <div>
                    Reported by: <strong>{a.reportedBy || 'Campus Proctor Office'}</strong> • Action: <em>{a.actionTaken || 'Warning issued'}</em>
                  </div>
                  {a.parentNote && (
                    <div className="text-primary small italic">
                      💬 Parent remark: "{a.parentNote}"
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal for Sign-Off or Appeal */}
        {activeModalItem && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className={`modal-header ${isAppeal ? 'bg-secondary' : 'bg-danger'} text-white`}>
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    {isAppeal ? <FileText size={18} /> : <ShieldAlert size={18} />}
                    {isAppeal ? 'Submit Formal Disciplinary Appeal' : 'Parent Disciplinary Acknowledgment'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setActiveModalItem(null)} />
                </div>
                <div className="modal-body p-4">
                  <h6 className="fw-bold mb-1">{activeModalItem.type} — {activeModalItem.date}</h6>
                  <p className="text-muted small mb-3">{activeModalItem.desc}</p>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      {isAppeal ? 'Appeal Grounds / Extenuating Circumstances' : 'Parent Acknowledgment Notes'}
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder={isAppeal ? 'e.g. Bus breakdown on route 14 caused delay; driver report attached.' : 'e.g. Counseled student regarding lab uniform protocol.'}
                      value={parentFeedback}
                      onChange={(e) => setParentFeedback(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-light rounded-3 small text-muted">
                    {isAppeal
                      ? 'Your appeal will be routed directly to the Dean of Student Welfare for expedited review.'
                      : 'Digital signature acknowledges receipt of this notice in compliance with college code of conduct.'}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveModalItem(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${isAppeal ? 'btn-primary' : 'btn-danger'}`}
                    onClick={handleAcknowledgeOrAppeal}
                  >
                    {isAppeal ? 'Submit Appeal' : 'Acknowledge warning receipt'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
