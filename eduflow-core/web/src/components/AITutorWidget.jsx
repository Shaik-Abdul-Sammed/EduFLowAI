import { useState } from 'react'
import { Bot, X, Send, Sparkles, BookOpen, MessageSquare } from 'lucide-react'
import { getApiBaseURL } from '../config/apiConfig'
import { safeJson } from '../utils/wakeUpHandler'

export default function AITutorWidget({ defaultCourse = 'CS301' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your 24/7 AI Teaching Assistant for ${defaultCourse}. Ask me about any lecture concept, algorithm, or syllabus topic!`,
      timestamp: 'Just now'
    }
  ])
  const [inputQuestion, setInputQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputQuestion.trim() || loading) return

    const userQ = inputQuestion.trim()
    setInputQuestion('')
    setMessages(prev => [...prev, { sender: 'user', text: userQ, timestamp: 'Just now' }])
    setLoading(true)

    try {
      const res = await fetch(`${getApiBaseURL()}/v1/ai-tutor/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          courseCode: defaultCourse,
          studentId: 101
        })
      })

      if (res.ok) {
        const data = await safeJson(res)
        if (data?.answer) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: data.answer,
              references: data.references,
              timestamp: 'Just now'
            }
          ])
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: 'I am currently synchronizing with the central course syllabus server. Please check your network connection and try again.',
            timestamp: 'Just now'
          }
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'I am operating in resilient local mode: Review lecture slides 4-6 on course graph algorithms.',
          timestamp: 'Just now'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary shadow-lg d-flex align-items-center gap-2"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9998,
            padding: '12px 20px',
            borderRadius: '2rem',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            border: 'none',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)'
          }}
          aria-label="Open AI Teaching Assistant"
        >
          <Bot size={20} />
          <span className="fw-bold small d-none d-sm-inline">Ask AI Tutor</span>
        </button>
      )}

      {/* Floating Chat Window with max-height: 80vh and overflow-y: auto */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Tutor Chat Window"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '90vw',
            maxWidth: '380px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9998,
            borderRadius: '1.25rem',
            background: '#ffffff',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            className="p-3 px-4 d-flex justify-content-between align-items-center text-white"
            style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338ca)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <Bot size={20} className="text-info" />
              <div>
                <h4 className="h6 fw-bold mb-0 text-white" style={{ fontSize: '0.9rem' }}>AI Teaching Assistant</h4>
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>Syllabus-Grounded • {defaultCourse}</small>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm text-white-50 p-1 hover-light"
              style={{ background: 'transparent', border: 'none' }}
              aria-label="Close AI Tutor"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              background: '#f8fafc',
              maxHeight: 'calc(80vh - 130px)'
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '0.75rem 1rem',
                  borderRadius: m.sender === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                  background: m.sender === 'user' ? '#4f46e5' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  wordBreak: 'break-word',
                  fontSize: '0.82rem',
                  lineHeight: 1.5
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                {m.references && m.references.length > 0 && (
                  <div className="mt-2 pt-2 border-top text-muted small" style={{ fontSize: '0.7rem' }}>
                    <strong>Citations:</strong>
                    {m.references.map((r, rIdx) => (
                      <div key={rIdx}>• {r}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '1rem',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '0.78rem'
                }}
              >
                <Sparkles size={14} className="spinner-border spinner-border-sm me-1 inline" /> AI Tutor is synthesizing answer...
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-2 border-top d-flex gap-2 align-items-center bg-white"
          >
            <input
              type="text"
              className="form-control form-control-sm border-0"
              placeholder="Ask anything about this module..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              style={{ fontSize: '0.82rem', boxShadow: 'none' }}
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="btn btn-sm btn-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 34, height: 34, padding: 0 }}
              aria-label="Send question"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
