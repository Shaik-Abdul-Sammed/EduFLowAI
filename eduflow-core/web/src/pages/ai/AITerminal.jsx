import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send, Paperclip, Bot, Building, Cpu, Database, Package, Settings, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import { getFullApiUrl } from '../../config/apiConfig'

const DEMO_ONBOARDING_REPLIES = [
  "Welcome to EduFlow AI OS! 🎓 I'm your institution's autonomous software engineer. I'll help you build and maintain a professional Flutter app for your institution — no developers needed.\n\nLet's start! **What is the name of your institution?**",
  "Great! And what **type** of institution is it? (College / School / University / Polytechnic)",
  "Excellent! Which **city and state** is it located in?",
  "What **departments or streams** does your institution offer? For example: Computer Science, Mechanical Engineering, Commerce...",
  "Does your institution have any of these facilities? (Reply with all that apply)\n\n🏠 Hostel  🚌 Transport  📚 Library  🍽️ Canteen  🏋️ Sports  💼 Placement Cell",
  "Perfect! I've built your Digital Twin. 🧠\n\nHere's what I understand about your institution so far. You can now ask me to:\n\n• **'Build my app'** — I'll generate a complete Flutter application\n• **'Add hostel module'** — I'll add hostel management\n• **'Change primary color to green'** — I'll update your theme\n• **'Upload prospectus'** — I'll extract all details automatically\n\nWhat would you like to do first?",
]

const SUGGESTIONS = [
  { icon: '📄', title: 'Import documents', desc: 'Upload PDF, brochure or prospectus', msg: 'I want to upload my institution prospectus to extract details automatically.' },
  { icon: '📅', title: 'Academic Calendar', desc: 'Generate multi-format UGC calendar', msg: 'Generate an academic calendar conforming to UGC norms with working days and gazetted holidays for both Grid and Gazette formats.' },
  { icon: '💬', title: 'WhatsApp Attendance', desc: 'Detect anomalies & sync shortage alerts', msg: 'Run WhatsApp attendance audit: identify classes below 75% statutory attendance and draft guardian alerts.' },
  { icon: '⚠️', title: 'Double-Booking Audit', desc: 'Detect faculty & room clashes', msg: 'Audit current semester timetable for faculty and room double-booking clashes and suggest conflict-free slots.' },
  { icon: '🎨', title: 'Customize theme', desc: 'Change colors, fonts, branding', msg: 'Help me customize the theme and branding for my institution app.' },
  { icon: '🚀', title: 'Build & Release', desc: 'Compile APK and AAB for Play Store', msg: 'I want to build and release my institution Flutter app.' },
]

const NAV_ITEMS = [
  { icon: Cpu, label: 'AI Terminal', to: '/ai-terminal', active: true },
  { icon: Database, label: 'Digital Twin', to: '/digital-twin' },
  { icon: Package, label: 'Projects', to: '/build-manager' },
  { icon: BarChart3, label: 'Builds', to: '/build-manager' },
  { icon: Building, label: 'Marketplace', to: '/entry' },
  { icon: Settings, label: 'Settings', to: '/profile' },
]

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '1rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Bot size={16} color="#2563EB" />
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', animation: `typingDot 1.2s ease infinite`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '1.25rem', gap: '0.75rem', alignItems: 'flex-start' }}>
      {!isUser && (
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <Bot size={18} color="white" />
        </div>
      )}
      <div style={{
        maxWidth: '72%',
        padding: '0.85rem 1.2rem',
        borderRadius: isUser ? '1.2rem 1.2rem 0.3rem 1.2rem' : '0.3rem 1.2rem 1.2rem 1.2rem',
        background: isUser
          ? 'linear-gradient(135deg, #2563EB, #1d4ed8)'
          : 'rgba(255,255,255,0.06)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '0.93rem',
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
      }}>
        {/* Render **bold** text */}
        {msg.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
        )}
        {msg.file && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Paperclip size={13} /> {msg.file}
          </div>
        )}
      </div>
      {isUser && (
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <Building size={18} color="white" />
        </div>
      )}
    </div>
  )
}

export default function AITerminal() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [replyIndex, setReplyIndex] = useState(0)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text, fileName = null) => {
    if (!text.trim() && !fileName) return
    const userMsg = { role: 'user', content: text, file: fileName }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/ai/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ institutionId: 'demo', messages: [...messages, userMsg], digitalTwin: {} }),
      })
      if (res.ok) {
        const text = await res.text()
        let data = {}
        try { data = JSON.parse(text) } catch { data = {} }
        if (data.reply) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        } else {
          throw new Error('No reply in response')
        }
      } else throw new Error('API failed')
    } catch {
      // Fallback demo mode
      const reply = DEMO_ONBOARDING_REPLIES[replyIndex % DEMO_ONBOARDING_REPLIES.length]
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600))
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setReplyIndex(i => i + 1)
    }
    setIsTyping(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputText) }
  }

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      await sendMessage(`Please analyse this document and extract all institution details.`, file.name)
      e.target.value = ''
    } catch (err) {
      console.error('File change handling error:', err)
    }
  }

  const sidebarW = sidebarOpen ? 260 : 64

  return (
    <div style={{ display: 'flex', height: '100dvh', minHeight: '100dvh', background: '#0A0E27', color: 'white', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarW, minWidth: sidebarW, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 64 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563EB, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Cpu size={18} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', background: 'linear-gradient(135deg, #60a5fa, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduFlow</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>AI OS</div>
            </div>
          )}
        </div>

        {/* New Chat button */}
        {sidebarOpen && (
          <div style={{ padding: '0.75rem' }}>
            <button aria-label="Start new conversation" onClick={() => { setMessages([]); setReplyIndex(0) }} style={{ width: '100%', padding: '0.6rem 1rem', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>+</span> New Conversation
            </button>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ icon: Icon, label, to, active }) => (
            <Link key={to + label} to={to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', borderRadius: 10, textDecoration: 'none', color: active ? '#60a5fa' : 'rgba(255,255,255,0.55)', background: active ? 'rgba(37,99,235,0.15)' : 'transparent', transition: 'all 0.2s', fontWeight: active ? 600 : 400, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Toggle + footer */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} onClick={() => setSidebarOpen(v => !v)} style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>AI Terminal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Connected</span>
          </div>
        </div>

        {/* Messages or Welcome */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(37,99,235,0.4)' }}>
                <Bot size={36} color="white" />
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #60a5fa, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduFlow AI OS</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontSize: '1rem' }}>Your institution's autonomous software engineer</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', maxWidth: 520, width: '100%' }}>
                {SUGGESTIONS.map(s => (
                  <button key={s.title} onClick={() => sendMessage(s.msg)} style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', color: 'white' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.15)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{s.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem' }}>{s.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {isTyping && (
                <div style={{ marginBottom: '1.25rem' }}><TypingIndicator /></div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{ padding: '0.75rem 1.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Quick Suggestions Chips */}
            {messages.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.4rem', scrollbarWidth: 'none' }}>
                {[
                  'Generate AY 2026-27 UGC Academic Calendar',
                  'Run WhatsApp attendance audit for shortages',
                  'Audit timetable for double-booking clashes',
                  'Simulate borderline grace marks (+2.5%)'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '999px',
                      padding: '0.3rem 0.75rem',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.2)'; e.currentTarget.style.color = '#93c5fd' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '0.6rem 0.75rem' }}>
              <button aria-label="Attach document or image" onClick={() => fileRef.current?.click()} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '0.4rem', borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                <Paperclip size={18} />
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message EduFlow AI OS..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.93rem', resize: 'none', maxHeight: 160, lineHeight: 1.6, padding: '0.25rem 0', fontFamily: 'inherit' }}
              />
              <button
                aria-label="Send message"
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() && !isTyping}
                style={{ background: inputText.trim() ? 'linear-gradient(135deg, #2563EB, #1d4ed8)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, color: 'white', cursor: inputText.trim() ? 'pointer' : 'default', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                <Send size={16} />
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handleFileChange} />
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', marginTop: '0.5rem', marginBottom: 0 }}>EduFlow AI OS can make mistakes. Review important outputs before publishing.</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
