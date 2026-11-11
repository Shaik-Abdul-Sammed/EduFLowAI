import React, { useState, useEffect, useRef } from 'react'
import { getFullApiUrl } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'
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
  X,
  Sparkles,
  Eye,
  EyeOff,
  Smartphone,
  CheckCheck
} from 'lucide-react'

export default function WhatsAppAttendancePage() {
  const [demoMode, setDemoMode] = useState(false)
  const [status, setStatus] = useState({
    configured: false,
    service: 'Console Simulator Mode',
    senderNumber: '+91 99000 11222',
    webhookUrl: 'https://eduflow-backend-jvn8.onrender.com/api/v1/whatsapp/webhook'
  })

  // Simulator state
  const [simPhone, setSimPhone] = useState('+919876543210')
  const [simMessage, setSimMessage] = useState('CSE 3A present 48 absent 2')
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)
  const [selectedRawRecord, setSelectedRawRecord] = useState(null)
  const [showAllStaged, setShowAllStaged] = useState(false)

  // Interactive Live WhatsApp Chat Preview (matching Figure 9 from Whitepaper)
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'msg-1',
      sender: 'faculty',
      text: 'CSE 3A present 48 absent 2',
      time: '09:04 AM',
      status: 'read'
    },
    {
      id: 'msg-2',
      sender: 'bot',
      text: '📋 Attendance Record Staged:\n• Class: CSE 3rd Year (Section A)\n• Enrolled: 50 | Present: 48 | Absent: 2\n• Flagged Absentees: CS-015, CS-042\n• Time: 09:05 AM (Slot 1)\nReply "YES" to confirm and post to ERP.',
      time: '09:04 AM'
    },
    {
      id: 'msg-3',
      sender: 'faculty',
      text: 'YES',
      time: '09:05 AM',
      status: 'read'
    },
    {
      id: 'msg-4',
      sender: 'bot',
      text: '✅ Attendance Confirmed & Synced!\n• Transaction ID: `ATT-2026-0941`\n• 48 Student Ledgers Marked Present\n• Automated SMS alerts queued to guardians\n• Synced to Biometric Attendance Cloud',
      time: '09:05 AM'
    }
  ])
  const chatScrollRef = useRef(null)

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatHistory])

  // Staged queue & Logs & Faculty
  const [stagedList, setStagedList] = useState([])
  const [logsList, setLogsList] = useState([])
  const [visibleLogsCount, setVisibleLogsCount] = useState(8)
  const [logDirectionFilter, setLogDirectionFilter] = useState('ALL')
  const [logSearchQuery, setLogSearchQuery] = useState('')
  const [showAbsentAlertModal, setShowAbsentAlertModal] = useState(false)
  const [absentAlertForm, setAbsentAlertForm] = useState({
    courseSection: 'CSE 3A',
    studentRolls: '2023CSE012, 2023CSE045',
    parentPhone: '+91 98765 43210',
    reason: 'Unexcused Absence in Morning Lecture & Lab Session',
  })
  const [facultyList, setFacultyList] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  const getAuthHeaders = () => {
    const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  const fetchStatus = async (isMounted = true) => {
    try {
      const res = await fetch(getFullApiUrl('/v1/whatsapp/status'), { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await safeJson(res)
        if (isMounted) setStatus(data)
      }
    } catch {
      // Use defaults
    }
  }

  const fetchStaged = async (isMounted = true) => {
    try {
      const res = await fetch(getFullApiUrl('/v1/whatsapp/staged'), { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await safeJson(res)
        if (isMounted) setStagedList(data.staged || [])
      }
    } catch (err) {
      console.warn('Failed to fetch staged WhatsApp attendance:', err)
    }
  }

  const fetchLogs = async (isMounted = true) => {
    try {
      const res = await fetch(getFullApiUrl('/v1/whatsapp/logs'), { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await safeJson(res)
        if (isMounted) setLogsList(data.logs || [])
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp logs:', err)
    }
  }

  const fetchFaculty = async (isMounted = true) => {
    try {
      const res = await fetch(getFullApiUrl('/v1/whatsapp/faculty'), { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await safeJson(res)
        if (isMounted) setFacultyList(data.faculty || [])
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp faculty:', err)
    }
  }

  const refreshAll = async (isMounted = true) => {
    if (isMounted) setLoading(true)
    await Promise.all([fetchStatus(isMounted), fetchStaged(isMounted), fetchLogs(isMounted), fetchFaculty(isMounted)])
    if (isMounted) setLoading(false)
  }

  const handleLoadDemoReports = () => {
    const demoLogs = [
      {
        id: 101,
        direction: 'OUTBOUND',
        to_number: '+91 98765 43210',
        from_number: '+91 80012 34567',
        body: 'Attendance Alert: Student Rahul Verma (2023CSE045) attendance has dropped to 62.5%, below UGC 75% statutory norm.',
        status: 'DELIVERED',
        created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: 102,
        direction: 'OUTBOUND',
        to_number: '+91 98765 43211',
        from_number: '+91 80012 34567',
        body: 'Fee Reminder: Term 2 tuition fee balance of ₹45,000 for Ananya Deshmukh is due by Nov 15, 2026.',
        status: 'DELIVERED',
        created_at: new Date(Date.now() - 45 * 60000).toISOString(),
      },
      {
        id: 103,
        direction: 'INBOUND',
        from_number: '+91 98765 43212',
        to_number: '+91 80012 34567',
        body: 'Leave Application: Request medical leave sanction for Siddharth Nair from Oct 28 to Oct 30.',
        status: 'RECEIVED',
        created_at: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        id: 104,
        direction: 'OUTBOUND',
        to_number: '+91 98765 43212',
        from_number: '+91 80012 34567',
        body: 'Leave Approval: Medical leave request for Siddharth Nair (2023ME033) has been sanctioned by HOD.',
        status: 'DELIVERED',
        created_at: new Date(Date.now() - 75 * 60000).toISOString(),
      },
      {
        id: 105,
        direction: 'OUTBOUND',
        to_number: '+91 98765 43214',
        from_number: '+91 80012 34567',
        body: 'Defaulter Warning: Aditya Kulkarni (59.1% attendance) must meet Academic Dean before exam hall ticket issuance.',
        status: 'DELIVERED',
        created_at: new Date(Date.now() - 120 * 60000).toISOString(),
      },
    ]
    setLogsList(demoLogs)
    setActionMsg('Loaded demo reports: Attendance alerts, Fee reminders, and Leave approvals.')
    setTimeout(() => setActionMsg(''), 4000)
  }

  const handleSendAbsentAlert = async (e) => {
    e?.preventDefault?.()
    const alertMsg = `EduFlow Alert: Student(s) [${absentAlertForm.studentRolls}] marked ABSENT today in ${absentAlertForm.courseSection} (${absentAlertForm.reason}). Current attendance approaching UGC 75% threshold. Please ensure regular attendance.`
    const newLog = {
      id: Date.now(),
      direction: 'OUTBOUND',
      from_number: status.senderNumber || '+91 99000 11222',
      to_number: absentAlertForm.parentPhone,
      body: alertMsg,
      status: 'DELIVERED',
      created_at: new Date().toISOString(),
    }
    setLogsList((prev) => [newLog, ...prev])
    setShowAbsentAlertModal(false)
    setActionMsg(`✓ Sent Absentee WhatsApp Alert for ${absentAlertForm.courseSection} to ${absentAlertForm.parentPhone}`)
    setTimeout(() => setActionMsg(''), 6000)

    try {
      await fetch(getFullApiUrl('/v1/whatsapp/simulate-message'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fromNumber: status.senderNumber || '+91 99000 11222',
          toNumber: absentAlertForm.parentPhone,
          message: alertMsg,
          direction: 'OUTBOUND'
        })
      })
    } catch (_e) {
      // ignore network errors in outbound alert staging
    }
  }

  useEffect(() => {
    let isMounted = true
    refreshAll(isMounted)
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSimulate = async (e, customMsg = null) => {
    if (e && e.preventDefault) e.preventDefault()
    const msgToSend = (customMsg !== null && customMsg !== undefined) ? customMsg : simMessage
    if (!msgToSend || !msgToSend.trim()) return
    setSimulating(true)
    setSimResult(null)
    setActionMsg('')

    const sentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const userMsgObj = {
      id: `msg-${Date.now()}`,
      sender: 'faculty',
      text: msgToSend,
      time: sentTime,
      status: 'read'
    }
    setChatHistory(prev => [...prev, userMsgObj])

    try {
      const res = await fetch(getFullApiUrl('/v1/whatsapp/simulate-message'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          from: simPhone,
          body: msgToSend
        })
      })
      const data = await safeJson(res)
      setSimResult(data)
      setSimMessage('')

      if (data && data.reply) {
        const botMsgObj = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: data.reply,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
        setChatHistory(prev => [...prev, botMsgObj])
      }

      await Promise.all([fetchStaged(), fetchLogs()])
    } catch (err) {
      setSimResult({ error: err.message })
    } finally {
      setSimulating(false)
    }
  }

  const handleConfirmStaged = async (id) => {
    try {
      const res = await fetch(getFullApiUrl(`/v1/whatsapp/staged/${id}/confirm`), {
        method: 'POST',
        headers: getAuthHeaders()
      })
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
      const res = await fetch(getFullApiUrl(`/v1/whatsapp/staged/${id}/reject`), {
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (res.ok) {
        setActionMsg(`Staged attendance #${id} cancelled.`)
        await Promise.all([fetchStaged(), fetchLogs()])
      }
    } catch (err) {
      setActionMsg('Failed to reject staged record: ' + err.message)
    }
  }

  const handleConfirmAllPending = async () => {
    try {
      const res = await fetch(getFullApiUrl('/v1/whatsapp/staged/confirm-all'), {
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (res.ok) {
        setActionMsg('All pending staged attendance records have been approved and synced into attendance ledger!')
        await Promise.all([fetchStaged(), fetchLogs()])
      }
    } catch (err) {
      setActionMsg('Failed to approve all records: ' + err.message)
    }
  }

  const handleExportAttendanceCsv = () => {
    const headers = ['ID', 'Course', 'Section', 'Faculty Phone', 'Present', 'Absent', 'Status', 'Raw Message']
    const rows = stagedList.map(item => [
      item.id,
      item.course_code,
      item.section,
      `"${item.faculty_phone || ''}"`,
      item.present_count,
      item.absent_count,
      item.status,
      `"${(item.raw_message || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `WhatsApp_Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container py-4" style={{ maxWidth: '1280px' }}>
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
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm ${demoMode ? 'btn-danger' : 'btn-outline-primary'} d-flex align-items-center gap-1 shadow-sm`}
            onClick={() => setDemoMode(!demoMode)}
            title={demoMode ? 'Exit full-screen demo presentation mode' : 'Hide navbar for distraction-free demo'}
          >
            {demoMode ? <><EyeOff size={14} /> Exit Demo Mode</> : <><Eye size={14} /> Demo Mode (Hide Navbar)</>}
          </button>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center shadow-sm" onClick={refreshAll} disabled={loading}>
            <RefreshCw size={14} className={`me-1 ${loading ? 'spinner-border spinner-border-sm' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {demoMode && (
        <style>{`
          nav, header, .navbar, .main-navbar, .sidebar, .main-content-wrapper > nav {
            display: none !important;
          }
          .main-content-wrapper {
            margin-left: 0 !important;
          }
        `}</style>
      )}

      {actionMsg && (
        <div className="alert alert-success d-flex align-items-center mb-3">
          <CheckCircle size={18} className="me-2" /> {actionMsg}
        </div>
      )}

      {/* Enterprise Highlights Banner (from Institutional Whitepaper Fig 9) */}
      <div className="card shadow-sm border-0 p-3 mb-4" style={{ background: '#0b132b', borderLeft: '4px solid #25d366', borderRadius: '12px' }}>
        <div className="d-flex justify-content-between align-items-center mb-2 px-1">
          <h6 className="fw-bold mb-0 text-white d-flex align-items-center">
            <ShieldCheck size={18} className="me-2 text-success" />
            Zero-Hardware Attendance Ingestion Highlights
          </h6>
          <span className="badge" style={{ backgroundColor: '#25d366', color: '#0b132b', fontWeight: 700 }}>
            FIGURE 9 ARCHITECTURE
          </span>
        </div>
        <div className="row g-2 text-white small">
          <div className="col-md-4 col-sm-6">
            <div className="p-2 rounded" style={{ background: '#1c2541', border: '1px solid #334155' }}>
              <strong style={{ color: '#38bdf8' }}>• Zero App Installation</strong>
              <div className="text-light" style={{ fontSize: '0.78rem' }}>Everyday WhatsApp. Zero biometric queue delays or extra downloads.</div>
            </div>
          </div>
          <div className="col-md-4 col-sm-6">
            <div className="p-2 rounded" style={{ background: '#1c2541', border: '1px solid #334155' }}>
              <strong style={{ color: '#38bdf8' }}>• Multi-Pattern NLP</strong>
              <div className="text-light" style={{ fontSize: '0.78rem' }}>Parses counts, ratios (23/30), or &apos;today 48&apos; into ERP ledgers.</div>
            </div>
          </div>
          <div className="col-md-4 col-sm-6">
            <div className="p-2 rounded" style={{ background: '#1c2541', border: '1px solid #334155' }}>
              <strong style={{ color: '#38bdf8' }}>• Dual-Factor Staging</strong>
              <div className="text-light" style={{ fontSize: '0.78rem' }}>2-step prompt validation before committing records to official database.</div>
            </div>
          </div>
          <div className="col-md-6 col-sm-6">
            <div className="p-2 rounded" style={{ background: '#1c2541', border: '1px solid #334155' }}>
              <strong style={{ color: '#34d399' }}>• Real-Time Guardian Alerts</strong>
              <div className="text-light" style={{ fontSize: '0.78rem' }}>Absentees automatically trigger parental WhatsApp notifications within 3 mins.</div>
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <div className="p-2 rounded" style={{ background: '#1c2541', border: '1px solid #334155' }}>
              <strong style={{ color: '#34d399' }}>• Audit-Proof Cryptographic Trail</strong>
              <div className="text-light" style={{ fontSize: '0.78rem' }}>Messages and transaction IDs (ATT-2026-0941) synced to cloud logs for NAAC/UGC.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Connection Status, Simulator & Interactive Phone Preview */}
      <div className="row g-4 mb-4">
        {/* Left Column: Connection Status & Simulator Form */}
        <div className="col-lg-6">
          {/* Connection Status Card */}
          <div className="card shadow-sm border-0 mb-4 p-4">
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

          {/* Message Simulator Form Card */}
          <div className="card shadow-sm border-0 p-4">
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
                  placeholder="Type attendance command (e.g. 'CSE 3A present 48 absent 2' or 'YES')..."
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                />
                <div className="d-flex gap-1 mt-2 flex-wrap">
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-muted" onClick={() => setSimMessage('CSE 3A present 48 absent 2')}>
                    Format 1 (48p 2a - Fig 9)
                  </button>
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-muted" onClick={() => setSimMessage('CSE 3A present 45 absent 5')}>
                    Format 1 (45p 5a)
                  </button>
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-muted" onClick={() => setSimMessage('CS301 23/30')}>
                    Format 2 (23/30)
                  </button>
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-muted" onClick={() => setSimMessage('attendance CSE-3A today 48 present')}>
                    Format 3 (today 48)
                  </button>
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-success fw-bold" onClick={() => setSimMessage('YES')}>
                    Confirm (YES)
                  </button>
                  <button type="button" className="btn btn-sm btn-light border py-0 px-2 small text-danger" onClick={() => setSimMessage('NO')}>
                    Cancel (NO)
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm d-flex align-items-center" disabled={simulating || !simMessage.trim()}>
                <Send size={14} className="me-1" /> {simulating ? 'Processing...' : 'Send Simulated Message'}
              </button>
            </form>

            {simResult && (
              <div className="mt-3 p-3 bg-light rounded border">
                <h6 className="fw-semibold small mb-1 text-success">Simulator Response:</h6>
                {simResult.reply && (
                  <div className="p-2 bg-white rounded border mb-2 small font-monospace" style={{ whiteSpace: 'pre-wrap' }}>
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

        {/* Right Column: Live Interactive WhatsApp Mobile Device Preview (matching Figure 9) */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-3 h-100" style={{ background: '#0b132b', borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 px-1 text-white">
              <span className="small fw-bold d-flex align-items-center gap-1 text-light">
                <Smartphone size={16} className="text-success" /> Live Interactive WhatsApp View (Figure 9)
              </span>
              <span className="badge" style={{ backgroundColor: '#25d366', color: '#111b21', fontSize: '0.72rem', fontWeight: 700 }}>
                ONLINE &bull; E2E ENCRYPTED
              </span>
            </div>

            <div
              style={{
                borderRadius: '20px',
                background: '#111b21',
                border: '2px solid #25d366',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                height: '560px'
              }}
            >
              {/* WhatsApp App Bar */}
              <div
                style={{
                  background: '#202c33',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: '1px solid #2a3942'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#25d366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px'
                  }}
                >
                  EF
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#e9edef', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
                    EduFlow AI Attendance Bot
                  </div>
                  <div style={{ color: '#8696a0', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    Official Verified Institutional Gateway <span style={{ color: '#25d366' }}>✅</span>
                  </div>
                </div>
                <span className="badge bg-dark text-success border border-success-subtle font-monospace" style={{ fontSize: '0.68rem' }}>
                  +91 99000 11222
                </span>
              </div>

              {/* Chat Message Scroll */}
              <div
                ref={chatScrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  backgroundImage: 'radial-gradient(#1f2c34 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              >
                {chatHistory.map((msg) => {
                  const isFaculty = msg.sender === 'faculty'
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isFaculty ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        backgroundColor: isFaculty ? '#005c4b' : '#202c33',
                        color: '#e9edef',
                        borderRadius: '8px',
                        borderTopRightRadius: isFaculty ? '2px' : '8px',
                        borderTopLeftRadius: isFaculty ? '8px' : '2px',
                        padding: '8px 12px',
                        fontSize: '0.79rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{msg.text}</div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '3px',
                          marginTop: '4px',
                          fontSize: '0.66rem',
                          color: '#8696a0'
                        }}
                      >
                        <span>{msg.time}</span>
                        {isFaculty && <CheckCheck size={12} color="#53bdeb" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Chat Quick Response Action Bar */}
              <div
                style={{
                  background: '#202c33',
                  padding: '8px 12px',
                  borderTop: '1px solid #2a3942',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center'
                }}
              >
                <div className="d-flex gap-1 overflow-auto me-1" style={{ maxWidth: '170px' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success py-0 px-2"
                    style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}
                    onClick={(e) => handleSimulate(e, 'YES')}
                    disabled={simulating}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger py-0 px-2"
                    style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}
                    onClick={(e) => handleSimulate(e, 'NO')}
                    disabled={simulating}
                  >
                    NO
                  </button>
                </div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{
                    background: '#2a3942',
                    border: 'none',
                    color: '#e9edef',
                    fontSize: '0.78rem',
                    borderRadius: '16px'
                  }}
                  placeholder="Type message..."
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSimulate(e)
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: '#25d366', color: '#111b21', borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={simulating || !simMessage.trim()}
                  onClick={(e) => handleSimulate(e)}
                  title="Send via bot"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Staged Attendance Queue */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <Clock size={18} className="me-2 text-warning" /> Staged Attendance Queue
          </h5>
          <div className="d-flex align-items-center gap-2">
            {stagedList.filter(s => s.status === 'PENDING').length > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 shadow-sm"
                onClick={handleConfirmAllPending}
              >
                <Check size={14} /> Approve All Pending ({stagedList.filter(s => s.status === 'PENDING').length})
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
              onClick={handleExportAttendanceCsv}
            >
              📥 Export CSV
            </button>
            <span className="badge bg-light text-dark border">
              {stagedList.filter(s => s.status === 'PENDING').length} Pending Confirmations
            </span>
          </div>
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
                (showAllStaged ? stagedList : stagedList.slice(0, 15)).map((item) => (
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
                    <td style={{ maxWidth: '240px' }}>
                      <span
                        className="text-muted small text-truncate d-inline-block"
                        style={{ maxWidth: '200px', cursor: 'pointer', verticalAlign: 'middle' }}
                        title="Click to inspect raw message"
                        onClick={() => setSelectedRawRecord(item)}
                      >
                        🔍 {item.raw_message}
                      </span>
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

        {stagedList.length > 15 && (
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none"
              onClick={() => setShowAllStaged(!showAllStaged)}
            >
              {showAllStaged ? '▲ Show Recent 15 Only' : `▼ View All ${stagedList.length} Staged Records`}
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Recent Messages Log & Faculty Registry */}
      <div className="row g-4 mb-4">
        {/* Messages Log */}
        <div className="col-md-7">
          <div
            className="card shadow-sm border-0 p-4"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: '520px',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                <MessageSquare size={18} className="me-2 text-primary" /> Recent WhatsApp Messages
              </h5>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-danger btn-sm d-flex align-items-center gap-1 shadow-sm"
                  onClick={() => setShowAbsentAlertModal(true)}
                  title="Notify parents of absent students immediately via WhatsApp"
                >
                  <Send size={13} /> Send Absent Alert
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
                  onClick={handleLoadDemoReports}
                >
                  <Sparkles size={14} /> Load Demo Reports
                </button>
              </div>
            </div>

            {/* Filter Pills and Search */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn btn-sm ${logDirectionFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setLogDirectionFilter('ALL')}
                >
                  All ({logsList.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${logDirectionFilter === 'INBOUND' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setLogDirectionFilter('INBOUND')}
                >
                  📥 Inbound ({logsList.filter((l) => l.direction === 'INBOUND').length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${logDirectionFilter === 'OUTBOUND' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setLogDirectionFilter('OUTBOUND')}
                >
                  📤 Outbound ({logsList.filter((l) => l.direction === 'OUTBOUND').length})
                </button>
              </div>

              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search phone or text..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                style={{ width: '180px' }}
              />
            </div>

            <div
              style={{
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'auto',
                width: '100%',
              }}
            >
              {(() => {
                const filtered = logsList.filter((l) => {
                  const matchesDir = logDirectionFilter === 'ALL' || l.direction === logDirectionFilter
                  const q = logSearchQuery.toLowerCase().trim()
                  const phone = (l.direction === 'INBOUND' ? l.from_number : l.to_number) || ''
                  const body = l.body || ''
                  const matchesSearch = !q || phone.toLowerCase().includes(q) || body.toLowerCase().includes(q)
                  return matchesDir && matchesSearch
                })

                return (
                  <table className="table table-sm align-middle mb-0" style={{ minWidth: '720px', tableLayout: 'fixed' }}>
                    <thead className="table-light small text-uppercase">
                      <tr>
                        <th style={{ width: '85px' }}>Dir</th>
                        <th style={{ width: '145px' }}>Number</th>
                        <th style={{ width: '380px' }}>Message</th>
                        <th style={{ width: '110px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-3">
                            {logsList.length === 0
                              ? 'No messages logged yet. Click "Load Demo Reports" to view sample interactions.'
                              : `No messages match filter "${logDirectionFilter}" and query "${logSearchQuery}".`}
                          </td>
                        </tr>
                      ) : (
                        filtered.slice(0, visibleLogsCount).map((l) => (
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
                            <td className="small text-truncate" style={{ maxWidth: '380px' }} title={l.body}>{l.body}</td>
                            <td><span className="badge bg-light text-dark border small">{l.status || 'SENT'}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )
              })()}
            </div>
            <div className="d-flex justify-content-between align-items-center pt-3 mt-auto border-top">
              <span className="small text-muted">
                Showing {Math.min(visibleLogsCount, logsList.length)} of {logsList.length} messages
              </span>
              {logsList.length > visibleLogsCount ? (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setVisibleLogsCount((prev) => prev + 8)}
                >
                  Load More Messages
                </button>
              ) : visibleLogsCount > 8 ? (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none p-0"
                  onClick={() => setVisibleLogsCount(8)}
                >
                  Show Less
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Modal: Instant Absentee Alert */}
        {showAbsentAlertModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1050,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              className="card border-0 shadow-lg"
              style={{
                width: '100%',
                maxWidth: '520px',
                borderRadius: '16px',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--app-text, #1e293b)',
              }}
            >
              <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>📢</span>
                  <h6 className="fw-bold mb-0">Dispatch Absentee WhatsApp Alert to Parents</h6>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAbsentAlertModal(false)}
                />
              </div>

              <form onSubmit={handleSendAbsentAlert} className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Class &amp; Section</label>
                  <select
                    className="form-select form-select-sm"
                    value={absentAlertForm.courseSection}
                    onChange={(e) => setAbsentAlertForm({ ...absentAlertForm, courseSection: e.target.value })}
                  >
                    <option value="CSE 3A">CSE 3rd Year - Section A</option>
                    <option value="CSE 3B">CSE 3rd Year - Section B</option>
                    <option value="ECE 2A">ECE 2nd Year - Section A</option>
                    <option value="ECE 2B">ECE 2nd Year - Section B</option>
                    <option value="IT 4A">IT 4th Year - Final Sem</option>
                    <option value="AI 1A">AI &amp; Data Science 1st Year</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Absent Student Roll Numbers</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={absentAlertForm.studentRolls}
                    onChange={(e) => setAbsentAlertForm({ ...absentAlertForm, studentRolls: e.target.value })}
                    placeholder="e.g. 2023CSE012, 2023CSE045"
                    required
                  />
                  <div className="form-text small" style={{ fontSize: '0.74rem' }}>
                    Comma-separated roll numbers of students missing from today's roll call.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Parent / Guardian WhatsApp Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    value={absentAlertForm.parentPhone}
                    onChange={(e) => setAbsentAlertForm({ ...absentAlertForm, parentPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Reason / Class Context</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={absentAlertForm.reason}
                    onChange={(e) => setAbsentAlertForm({ ...absentAlertForm, reason: e.target.value })}
                    required
                  />
                </div>

                <div className="p-3 bg-light rounded border mb-3 small">
                  <strong className="text-secondary d-block mb-1">Generated WhatsApp Notification Template:</strong>
                  <p className="mb-0 text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                    "EduFlow Alert: Student(s) [{absentAlertForm.studentRolls}] marked ABSENT today in {absentAlertForm.courseSection} ({absentAlertForm.reason}). Current attendance approaching UGC 75% threshold. Please ensure regular attendance."
                  </p>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowAbsentAlertModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-danger d-flex align-items-center gap-1">
                    <Send size={13} />
                    <span>Transmit WhatsApp Alert</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

      {/* Raw Message Payload Inspector Modal */}
      {selectedRawRecord && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--app-text, #0f172a)',
              borderRadius: '1rem',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '2px solid var(--border-color, #e2e8f0)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ margin: 0, fontWeight: 800 }}>📱 WhatsApp Raw Payload Inspector</h5>
              <button type="button" className="btn-close" onClick={() => setSelectedRawRecord(null)} aria-label="Close" />
            </div>

            <div className="mb-2 small">
              <strong>Staged Record:</strong> #{selectedRawRecord.id} &bull; {selectedRawRecord.course_code} ({selectedRawRecord.section})
            </div>
            <div className="mb-2 small">
              <strong>Sender Mobile:</strong> {selectedRawRecord.faculty_phone}
            </div>
            <div className="mb-2 small">
              <strong>Computed Headcount:</strong> <span className="text-success fw-bold">{selectedRawRecord.present_count} Present</span>, <span className="text-danger fw-bold">{selectedRawRecord.absent_count} Absent</span>
            </div>

            <div className="mt-3">
              <label className="form-label text-muted small fw-bold">RAW SENDER TEXT (UNTRUNCATED):</label>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '0.85rem',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {selectedRawRecord.raw_message}
              </div>
            </div>

            <div className="text-end mt-3">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setSelectedRawRecord(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
