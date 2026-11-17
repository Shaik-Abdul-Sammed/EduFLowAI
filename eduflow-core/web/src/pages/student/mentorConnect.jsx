import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { mentorMessages, STUDENT } from '../../utils/studentMockData'
import { getFullApiUrl } from '../../utils/apiConfig'

const BLUE = '#2563EB'

export default function Page() {
  const [messages, setMessages] = useState(mentorMessages)
  const [input, setInput] = useState('')
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(null)
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('14:00')
  const { mentor } = STUDENT
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMentorChat() {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(getFullApiUrl('/v1/parent/chat'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          const msgs = data?.messages || []
          if (msgs.length > 0) {
            const mapped = msgs.map(m => ({
              id: m.id,
              from: m.sender === 'student' ? 'student' : 'mentor',
              text: m.text,
              time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : '10:30 AM'
            }))
            setMessages(prev => [...mapped, ...prev])
          }
        }
      } catch (err) {
        console.debug('Failed to load mentor chat:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMentorChat()
  }, [])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return
    const now = new Date()
    const timeStr = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    const newMsg = { id: Date.now(), from: 'student', text: input.trim(), time: timeStr }
    setMessages(prev => [...prev, newMsg])
    const sentText = input.trim()
    setInput('')

    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/parent/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ text: sentText, sender: 'student' })
      })
    } catch {}

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'mentor', text: 'Thank you for your message! I will get back to you soon. Keep up the great work! 👍', time: timeStr }])
    }, 1200)
  }

  async function bookMeeting(e) {
    e.preventDefault()
    setBooked({ date: meetingDate, time: meetingTime })
    setBooking(false)

    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          subject: `[Mentor Session Booked] ${meetingDate} at ${meetingTime}`,
          description: `Student requested a 1-on-1 guidance appointment with faculty mentor ${mentor.name}.`,
          category: 'mentor_session',
          priority: 'medium'
        })
      })
    } catch {}
  }

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

  return (
    <RolePageTemplate role="Student" title="Mentor Connect" description="Chat with your assigned mentor and book guidance sessions.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* Mentor Profile Card */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div style={{ height: 4, background: `linear-gradient(90deg, ${BLUE}, #06B6D4)` }} />
            <div className="card-body p-4" style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, #06B6D4)`, margin: '0 auto 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                👩‍🏫
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>{mentor.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.875rem' }}>📚 {mentor.subject} Faculty</div>
              <div style={{ display: 'grid', gap: '0.5rem', textAlign: 'left', fontSize: '0.78rem' }}>
                <div style={{ padding: '0.6rem 0.875rem', borderRadius: '0.75rem', background: 'var(--surface-bg)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>📞</span><span>{mentor.phone}</span>
                </div>
                <div style={{ padding: '0.6rem 0.875rem', borderRadius: '0.75rem', background: 'var(--surface-bg)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>✉️</span><span style={{ wordBreak: 'break-all' }}>{mentor.email}</span>
                </div>
                <div style={{ padding: '0.6rem 0.875rem', borderRadius: '0.75rem', background: '#10B98110', border: '1px solid #10B98125', color: '#065f46', fontSize: '0.72rem', fontWeight: 600 }}>
                  🟢 Available: {mentor.available}
                </div>
              </div>
            </div>
          </div>

          {/* Book Session */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.875rem' }}>📅 Book a Session</h3>
            {booked ? (
              <div style={{ padding: '0.875rem', borderRadius: '0.875rem', background: '#10B98112', border: '1px solid #10B98130', color: '#065f46', fontSize: '0.82rem', fontWeight: 600 }}>
                ✅ Session booked for {booked.date} at {booked.time}
                <button onClick={() => setBooked(null)} style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.72rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Cancel booking</button>
              </div>
            ) : !booking ? (
              <button onClick={() => setBooking(true)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>+ Schedule Meeting</button>
            ) : (
              <form onSubmit={bookMeeting} style={{ display: 'grid', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DATE</label>
                  <input required type="date" className="form-control" style={{ fontSize: '0.82rem' }} value={meetingDate} onChange={e => setMeetingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TIME SLOT</label>
                  <select className="form-select" style={{ fontSize: '0.82rem' }} value={meetingTime} onChange={e => setMeetingTime(e.target.value)}>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Confirm</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setBooking(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '75vh' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-bg)' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, #06B6D4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👩‍🏫</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{mentor.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>🟢 Online</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(msg => {
              const isMentor = msg.from === 'mentor'
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMentor ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: '0.5rem' }}>
                  {isMentor && (
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${BLUE}20`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>👩‍🏫</div>
                  )}
                  <div style={{ maxWidth: '72%' }}>
                    <div style={{
                      padding: '0.75rem 1rem', borderRadius: isMentor ? '0.875rem 0.875rem 0.875rem 0.125rem' : '0.875rem 0.875rem 0.125rem 0.875rem',
                      background: isMentor ? 'var(--surface-bg)' : `linear-gradient(135deg, ${BLUE}, #06B6D4)`,
                      color: isMentor ? 'var(--app-text)' : 'white',
                      fontSize: '0.875rem', lineHeight: 1.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', textAlign: isMentor ? 'left' : 'right' }}>{msg.time}</div>
                  </div>
                  {!isMentor && (
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${BLUE}20`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>👨‍🎓</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Reply Box */}
          <form onSubmit={sendMessage} style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', background: 'var(--surface-bg)' }}>
            <input
              className="form-control" placeholder="Type a message to your mentor..."
              value={input} onChange={e => setInput(e.target.value)}
              style={{ borderRadius: '2rem', fontSize: '0.875rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '2rem', padding: '0.5rem 1.25rem', flexShrink: 0 }}>
              Send ✈️
            </button>
          </form>
        </div>
      </div>
    </RolePageTemplate>
  )
}
