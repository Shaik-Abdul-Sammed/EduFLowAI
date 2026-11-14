import { useState, useEffect } from 'react'
import { UserCheck, CreditCard, Send } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function ParentDashboardPage() {
  const [data, setData] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch(`${getApiBaseURL()}/v1/parent/overview`)
        if (res.ok) {
          const json = await safeJson(res)
          setData(json)
        }
      } catch (err) {
        console.debug(err)
      }
    }

    const fetchChat = async () => {
      try {
        const res = await fetch(`${getApiBaseURL()}/v1/parent/chat`)
        if (res.ok) {
          const json = await safeJson(res)
          if (json?.messages) setMessages(json.messages)
        }
      } catch (err) {
        console.debug(err)
      }
    }

    fetchOverview()
    fetchChat()
  }, [])

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!newMsg.trim()) return
    setSending(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/parent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMsg, sender: 'parent' })
      })
      if (res.ok) {
        const json = await safeJson(res)
        if (json?.message) setMessages((prev) => [...prev, json.message])
        setNewMsg('')
      }
    } catch (err) {
      console.debug(err)
    }
    finally {
      setSending(false)
    }
  }

  const child = data?.child || {
    name: 'Ananya Sharma',
    roll: 'SS26',
    branch: 'Computer Science (B.Tech)',
    semester: 'Semester 5',
    overallAttendance: 88.5,
    attendanceStatus: 'EXEMPLARY (Eligible for all examinations)',
    subjectAttendance: [
      { code: 'CS301', name: 'Design & Analysis of Algorithms', attended: 42, total: 46, percent: 91.3 },
      { code: 'CS302', name: 'Database Management Systems', attended: 38, total: 44, percent: 86.4 },
      { code: 'CS303', name: 'Computer Networks', attended: 40, total: 45, percent: 88.9 },
      { code: 'CS304', name: 'Machine Learning Foundations', attended: 39, total: 44, percent: 88.6 }
    ]
  }

  const fees = data?.fees || {
    totalBilled: 125000,
    paid: 125000,
    pending: 0,
    status: 'CLEAR',
    recentInvoices: [
      { invoiceNo: 'EDU-2026-F501', title: 'Semester 5 Tuition & Lab Fee', amount: 95000, status: 'PAID', date: '2026-07-20' },
      { invoiceNo: 'EDU-2026-H501', title: 'Hostel & Mess Autumn Term', amount: 30000, status: 'PAID', date: '2026-07-22' }
    ]
  }

  const mentor = data?.mentor || {
    name: 'Dr. Ramesh Kumar',
    designation: 'Associate Professor & Mentor',
    email: 'ramesh.cs@demo.edu',
    phone: '+91 90101 50809',
    cabin: 'CS Department, Faculty Block F-12'
  }

  return (
    <RolePageTemplate role="parent" title="Parent Academic Portal">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Child Overview Hero Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', borderRadius: 16, padding: '24px 28px', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20 }}>
                Ward Profile
              </span>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px 0' }}>{child.name} ({child.roll})</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>{child.branch} &bull; {child.semester} &bull; Academic Year 2026-2027</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(6px)' }}>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Cumulative Attendance</div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>{child.overallAttendance}%</div>
              <div style={{ fontSize: 11, color: '#86EFAC', fontWeight: 600 }}>&ge; 75% UGC Compliant</div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Attendance & Fee Status | Mentor Direct Chat */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Left Column: Attendance & Fee Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Subject Attendance Breakdown */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Subject-wise Attendance</h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Verified daily via Biometric & WhatsApp turnstile logs</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {child.subjectAttendance.map((sub) => (
                  <div key={sub.code} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #EDF2F7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                      <span>{sub.code}: {sub.name}</span>
                      <span style={{ color: sub.percent >= 85 ? '#16A34A' : '#D97706' }}>{sub.percent}%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${sub.percent}%`, height: '100%', background: sub.percent >= 85 ? '#10B981' : '#F59E0B', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                      Attended {sub.attended} of {sub.total} classes
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee & Bursary Status */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#F0FDF4', color: '#16A34A', padding: 8, borderRadius: 8 }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Bursary & Fee Clearance</h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Accounts office digital clearance certificate</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: 12, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Total Paid</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>₹{fees.paid.toLocaleString()}</div>
                </div>
                <div style={{ flex: 1, padding: 12, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Pending Dues</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: fees.pending === 0 ? '#16A34A' : '#DC2626' }}>
                    {fees.pending === 0 ? 'Nil (Clear)' : `₹${fees.pending.toLocaleString()}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fees.recentInvoices.map((inv) => (
                  <div key={inv.invoiceNo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, fontSize: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{inv.title}</div>
                      <div style={{ color: '#64748B', fontSize: 11 }}>{inv.invoiceNo} &bull; {inv.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>₹{inv.amount.toLocaleString()}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Direct Mentor Communication */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                RK
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>{mentor.name}</h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{mentor.designation}</p>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{mentor.cabin} &bull; {mentor.phone}</div>
              </div>
            </div>

            {/* Chat Thread */}
            <div style={{ flex: 1, minHeight: 320, maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4, marginBottom: 16 }}>
              {messages.map((m) => {
                const isParent = m.sender === 'parent'
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isParent ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: isParent ? '#2563EB' : '#F1F5F9',
                      color: isParent ? '#FFFFFF' : '#1E293B',
                      fontSize: 13,
                      lineHeight: 1.4,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div>{m.text}</div>
                    <div style={{ fontSize: 10, opacity: 0.75, textAlign: 'right', marginTop: 4 }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <input
                type="text"
                placeholder="Ask faculty mentor about attendance, grades, or leave..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
              />
              <button
                type="submit"
                disabled={sending}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Send size={15} />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
