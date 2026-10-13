import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
  Phone,
  RefreshCw,
  HelpCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react'

export default function WhatsAppAttendancePage() {
  const [status, setStatus] = useState({
    configured: false,
    service: 'Console Simulator Mode',
    senderNumber: '+91 99000 11222',
    webhookUrl: 'https://eduflow-backend-jvn8.onrender.com/api/v1/whatsapp/webhook'
  })

  // Simulator state
  const [simPhone, setSimPhone] = useState('+919876543210')
  const [simMessage, setSimMessage] = useState('CSE 3A present 45 absent 5')
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)

  // Staged queue & Logs & Faculty
  const [stagedList, setStagedList] = useState([])
  const [logsList, setLogsList] = useState([])
  const [facultyList, setFacultyList] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
      // Use defaults
    }
  }

  const fetchStaged = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/staged')
      if (res.ok) {
        const data = await res.json()
        setStagedList(data.staged || [])
      }
    } catch (err) {
      console.warn('Failed to fetch staged WhatsApp attendance:', err)
    }
  }

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/logs')
      if (res.ok) {
        const data = await res.json()
        setLogsList(data.logs || [])
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp logs:', err)
    }
  }

  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/v1/whatsapp/faculty')
      if (res.ok) {
        const data = await res.json()
        setFacultyList(data.faculty || [])
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp faculty:', err)
    }
  }

  const refreshAll = async () => {
    setLoading(true)
    await Promise.all([fetchStatus(), fetchStaged(), fetchLogs(), fetchFaculty()])
    setLoading(false)
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const handleSimulate = async (e) => {
    e.preventDefault()
    if (!simMessage) return
    setSimulating(true)
    setSimResult(null)
    setActionMsg('')

    try {
      const res = await fetch('/api/v1/whatsapp/simulate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: simPhone,
          body: simMessage
        })
      })
      const data = await res.json()
      setSimResult(data)
      await Promise.all([fetchStaged(), fetchLogs()])
    } catch (err) {
      setSimResult({ error: err.message })
    } finally {
      setSimulating(false)
    }
  }

  const handleConfirmStaged = async (id) => {
    try {
      const res = await fetch(`/api/v1/whatsapp/staged/${id}/confirm`, { method: 'POST' })
      if (res.ok) {
        setActionMsg(`Staged attendance #${id} confirmed and synced into official attendance records!`)
        await Promise.all([fetchStaged(), fetchLogs()])
      }
    } catch (err) {
      setActionMsg('Failed to confirm staged record: ' + err.message)
    }
  }

  const handleRejectStaged = async (id) => {
    try {
      const res = await fetch(`/api/v1/whatsapp/staged/${id}/reject`, { method: 'POST' })
      if (res.ok) {
        setActionMsg(`Staged attendance #${id} cancelled.`)
        await Promise.all([fetchStaged(), fetchLogs()])
      }
    } catch (err) {
      setActionMsg('Failed to reject staged record: ' + err.message)
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold d-flex align-items-center">
            <MessageSquare className="me-2 text-success" /> WhatsApp Faculty Attendance
          </h2>
          <p className="text-muted mb-0">
            Allow teaching faculty to mark class attendance via natural WhatsApp messages without installing another app.
          </p>
        </div>
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={refreshAll} disabled={loading}>
          <RefreshCw size={14} className={`me-1 ${loading ? 'spinner-border spinner-border-sm' : ''}`} /> Refresh
        </button>
      </div>

      {actionMsg && (
        <div className="alert alert-success d-flex align-items-center mb-3">
          <CheckCircle size={18} className="me-2" /> {actionMsg}
        </div>
      )}

      {/* Row 1: Connection Status & Simulator */}
      <div className="row g-4 mb-4">
        {/* Connection Status Card */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Gateway Status</h5>
              <span className={`badge ${status.configured ? 'bg-success' : 'bg-secondary'}`}>
                {status.configured ? 'LIVE CONNECTED' : 'SIMULATOR MODE'}
              </span>
            </div>
            <div className="mb-3">
              <label className="text-muted small d-block">WhatsApp Service</label>
              <strong>{status.service}</strong>
            </div>
            <div className="mb-3">
              <label className="text-muted small d-block">Virtual Sender Number</label>
              <code className="text-primary fs-6">{status.senderNumber}</code>
            </div>
            <div className="mb-3">
              <label className="text-muted small d-block">Webhook Endpoint</label>
              <input type="text" className="form-control form-control-sm bg-light" readOnly value={status.webhookUrl} />
            </div>
            <div className="p-3 bg-light rounded small text-muted">
              <ShieldCheck size={16} className="text-success me-1" />
              Automated 2-step verification: Faculty sends message &rarr; Bot stages attendance and asks for confirmation &rarr; Faculty replies YES to commit.
            </div>
          </div>
        </div>

        {/* Message Simulator */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0 h-100 p-4">
            <h5 className="fw-bold mb-2 d-flex align-items-center">
              <Send size={18} className="me-2 text-primary" /> Test Message Simulator
            </h5>
            <p className="text-muted small mb-3">
              Simulate an incoming WhatsApp message from a faculty member to verify parser extraction and confirmation staging.
            </p>

            <form onSubmit={handleSimulate}>
              <div className="mb-2">
                <label className="form-label small fw-semibold">Faculty Phone Number</label>
                <select className="form-select form-select-sm" value={simPhone} onChange={(e) => setSimPhone(e.target.value)}>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.phone}>
                      {f.name} ({f.department}) — {f.phone}
                    </option>
                  ))}
                  <option value="+919876543299">Custom Faculty (+91 98765 43299)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Message Body</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CSE 3A present 45 absent 5 or CS301 23/30 or YES"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                />
                <div className="d-flex gap-1 mt-1">
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-muted" onClick={() => setSimMessage('CSE 3A present 45 absent 5')}>
                    Format 1 (45p 5a)
                  </button>
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-muted" onClick={() => setSimMessage('CS301 23/30')}>
                    Format 2 (23/30)
                  </button>
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-muted" onClick={() => setSimMessage('attendance CSE-3A today 48 present')}>
                    Format 3 (today 48)
                  </button>
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-muted" onClick={() => setSimMessage('YES')}>
                    Confirm (YES)
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm d-flex align-items-center" disabled={simulating}>
                <Send size={14} className="me-1" /> {simulating ? 'Processing...' : 'Send Simulated Message'}
              </button>
            </form>

            {simResult && (
              <div className="mt-3 p-3 bg-light rounded border">
                <h6 className="fw-semibold small mb-1 text-success">Simulator Response:</h6>
                {simResult.reply && (
                  <div className="p-2 bg-white rounded border mb-2 small font-monospace">
                    {simResult.reply}
                  </div>
                )}
                {simResult.data && (
                  <div className="small text-muted">
                    Staged: <strong>{simResult.data.course_code} {simResult.data.section}</strong> | Present: {simResult.data.present_count} | Absent: {simResult.data.absent_count}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Staged Attendance Queue */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <Clock size={18} className="me-2 text-warning" /> Staged Attendance Queue
          </h5>
          <span className="badge bg-light text-dark border">
            {stagedList.filter(s => s.status === 'PENDING').length} Pending Confirmations
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>ID</th>
                <th>Course & Section</th>
                <th>Faculty Phone</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Status</th>
                <th>Original Message</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stagedList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No staged attendance records. Use the simulator above to submit attendance.
                  </td>
                </tr>
              ) : (
                stagedList.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td className="fw-semibold">{item.course_code} ({item.section})</td>
                    <td><span className="badge bg-light text-dark border">{item.faculty_phone}</span></td>
                    <td className="text-success fw-bold">{item.present_count}</td>
                    <td className="text-danger fw-bold">{item.absent_count}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'PROCESSED' ? 'bg-success' :
                        item.status === 'CONFIRMED' ? 'bg-info' :
                        item.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                      {item.raw_message}
                    </td>
                    <td className="text-end">
                      {item.status === 'PENDING' && (
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            title="Approve & Sync"
                            onClick={() => handleConfirmStaged(item.id)}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Reject"
                            onClick={() => handleRejectStaged(item.id)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Recent Messages Log & Faculty Registry */}
      <div className="row g-4 mb-4">
        {/* Messages Log */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <MessageSquare size={18} className="me-2 text-primary" /> Recent WhatsApp Messages
            </h5>
            <div className="table-responsive" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Dir</th>
                    <th>Number</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logsList.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-muted py-2">No messages logged yet.</td></tr>
                  ) : (
                    logsList.slice(0, 15).map(l => (
                      <tr key={l.id}>
                        <td>
                          {l.direction === 'INBOUND' ? (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                              <ArrowDownLeft size={12} className="me-1" /> IN
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                              <ArrowUpRight size={12} className="me-1" /> OUT
                            </span>
                          )}
                        </td>
                        <td className="small font-monospace">{l.direction === 'INBOUND' ? l.from_number : l.to_number}</td>
                        <td className="small text-truncate" style={{ maxWidth: '240px' }}>{l.body}</td>
                        <td><span className="badge bg-light text-dark border small">{l.status || 'SENT'}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Faculty Number Registry */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <Phone size={18} className="me-2 text-info" /> Faculty Phone Registry
            </h5>
            <p className="text-muted small mb-2">
              Verified phone numbers mapped to faculty IDs for authentication and role authorization.
            </p>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Faculty Name</th>
                    <th>Dept</th>
                    <th>Registered Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.map(f => (
                    <tr key={f.id}>
                      <td className="small fw-semibold">{f.name}</td>
                      <td><span className="badge bg-light text-dark border">{f.department}</span></td>
                      <td className="small font-monospace text-primary">{f.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="card shadow-sm border-0 p-4 bg-light">
        <h5 className="fw-bold mb-2 d-flex align-items-center">
          <HelpCircle size={18} className="me-2 text-primary" /> Production Setup Guide: WhatsApp Business Cloud API
        </h5>
        <div className="row g-3 small text-muted">
          <div className="col-md-4">
            <strong>1. Meta Business Manager</strong>
            <p className="mb-0">Create a WhatsApp Business App in Meta Developers portal and obtain Phone Number ID & Permanent Token.</p>
          </div>
          <div className="col-md-4">
            <strong>2. Webhook Callback</strong>
            <p className="mb-0">Configure Webhook URL <code>https://eduflow-backend-jvn8.onrender.com/api/v1/whatsapp/webhook</code> with verify token <code>eduflow_verify_token</code>.</p>
          </div>
          <div className="col-md-4">
            <strong>3. Environment Variables</strong>
            <p className="mb-0">Set <code>WHATSAPP_API_KEY</code> or <code>TWILIO_ACCOUNT_SID</code> + <code>TWILIO_AUTH_TOKEN</code> in your environment to switch from simulator to live network.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
