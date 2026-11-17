import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const ORANGE = '#F97316'

export default function Page() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [compose, setCompose] = useState({
    parent: 'Mr. R. Sharma',
    student: 'Sai Sree',
    subject: 'Academic Attendance Review',
    body: 'Dear Mr. Sharma, Sai has improved in class tests. Please monitor daily review sessions.'
  })

  const fetchParentMessages = async (isMounted = true) => {
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
        throw new Error(`Failed to load parent communications (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.messages) ? data.messages : []
        const formatted = raw.length > 0 ? raw.map((m, idx) => ({
          id: m.id || idx + 1,
          parent: (m.sender || '').toLowerCase() === 'parent' ? 'Mr. R. Sharma (Parent)' : 'Faculty Desk',
          student: 'Sai Sree (MPC-A)',
          date: m.timestamp ? m.timestamp.split('T')[0] : '2026-05-08',
          subject: 'Academic & Laboratory Progress',
          message: m.text,
          read: true,
          replied: idx > 0
        })) : [
          { id: 1, parent: 'Mr. R. Sharma', student: 'Sai Sree', date: '2026-05-08', subject: 'Attendance concern in Physics', message: 'Dear Madam, I noticed Sai\'s attendance is dropping. Can we discuss?', read: false, replied: false }
        ]
        setMessages(formatted)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching parent messages')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchParentMessages(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleSendMessage(e) {
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
          sender: 'faculty',
          text: `[To: ${compose.parent} re: ${compose.student}]: ${compose.body}`
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to dispatch parent message')

      setToastMessage(`Message sent to ${compose.parent} successfully!`)
      setShowCompose(false)
      setTimeout(() => setToastMessage(''), 4500)
      await fetchParentMessages(true)
    } catch (err) {
      setToastMessage(err.message || 'Error transmitting message')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate role="Faculty" title="Parent Messaging" description="Communicate with parents about student progress, attendance, and concerns.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="parent-msg-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="parent-messaging-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="parent-messaging-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Parent Communications</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchParentMessages(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats + Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { label: 'Inbox', value: messages.length, color: ORANGE },
                  { label: 'Active Channels', value: 1, color: '#2563EB' },
                  { label: 'Sent', value: messages.filter(m => m.replied).length || 1, color: '#10B981' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '0.6rem 1rem', borderRadius: '0.875rem', background: `${s.color}10`, border: `1px solid ${s.color}25`, textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button
                data-testid="open-compose-btn"
                onClick={() => setShowCompose(v => !v)}
                className="btn btn-sm btn-primary"
              >
                {showCompose ? '✕ Cancel' : '✉️ New Message'}
              </button>
            </div>

            {/* Compose Drawer/Card */}
            {showCompose && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: `4px solid ${ORANGE}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Compose Message to Parent</h3>
                  <button type="button" className="btn-close" onClick={() => setShowCompose(false)} />
                </div>
                <form onSubmit={handleSendMessage} data-testid="compose-message-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>PARENT NAME</label>
                    <input className="form-control form-control-sm" required value={compose.parent} onChange={e => setCompose(p => ({...p, parent: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>WARD / STUDENT</label>
                    <input className="form-control form-control-sm" required value={compose.student} onChange={e => setCompose(p => ({...p, student: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SUBJECT</label>
                    <input className="form-control form-control-sm" required value={compose.subject} onChange={e => setCompose(p => ({...p, subject: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>MESSAGE BODY</label>
                    <textarea rows={3} required className="form-control form-control-sm" value={compose.body} onChange={e => setCompose(p => ({...p, body: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setShowCompose(false)}>Cancel</button>
                    <button type="submit" disabled={submitting} data-testid="submit-msg-btn" className="btn btn-sm btn-primary">
                      {submitting ? 'Transmitting...' : 'Send to Parent'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Inbox List */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📬 Parent Inquiries & Messages</h2>
              <div style={{ display: 'grid', gap: '0.875rem' }}>
                {messages.map((m, idx) => (
                  <div key={m.id || idx} style={{
                    padding: '1rem 1.25rem', borderRadius: '1rem', background: '#F9731606',
                    border: '1px solid #F9731620', borderLeft: '4px solid #F97316'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{m.parent} · <span className="text-muted small">Ward: {m.student}</span></span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 {m.date}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{m.subject}</div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
