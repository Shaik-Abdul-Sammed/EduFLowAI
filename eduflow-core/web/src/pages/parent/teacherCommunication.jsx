import { useState, useEffect, useRef } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function TeacherCommunication() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const fetchMessages = async (isMounted = true) => {
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
        throw new Error(`Failed to load chat history (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.messages) ? data.messages : []
        setMessages(raw)
        scrollToBottom()
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error connecting to mentor chat')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchMessages(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!inputValue.trim()) return

    setSending(true)
    try {
      const text = inputValue.trim()
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parent/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sender: 'parent',
          text
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to send message')

      if (data?.message) {
        setMessages(prev => [...prev, data.message])
      }
      setInputValue('')
      scrollToBottom()
    } catch (err) {
      alert(err.message || 'Error sending message')
    } finally {
      setSending(false)
    }
  }

  return (
    <RolePageTemplate role="Parent" title="Teacher Communication" description="Direct communication channel with your ward's faculty mentor.">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="bg-light p-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              👤
            </div>
            <div>
              <h6 className="mb-0 fw-bold">Academic Mentor - Prof. Ramesh (Computer Science)</h6>
              <small className="text-success">● Active Academic Channel</small>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchMessages(true)}>
            🔄 Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div data-testid="chat-loading" className="flex-grow-1 p-4 d-flex flex-column justify-content-center align-items-center">
            <div className="spinner-border text-primary mb-3" role="status" />
            <div className="text-muted small">Loading mentor conversation...</div>
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="chat-error" className="flex-grow-1 p-4 d-flex flex-column justify-content-center align-items-center text-center">
            <div className="text-danger mb-2 fw-bold">Unable to Load Messages</div>
            <p className="text-muted small mb-3">{loadError}</p>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchMessages(true)}>
              🔄 Retry Connection
            </button>
          </div>
        ) : (
          /* Messages Area */
          <div className="flex-grow-1 p-4" data-testid="messages-container" style={{ overflowY: 'auto', background: '#f8f9fa' }}>
            {messages.length === 0 ? (
              <div className="text-center text-muted mt-5">
                <p>No messages yet.</p>
                <small>Send a message to start communicating with the mentor.</small>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = (msg.sender || '').toLowerCase() === 'parent'
                return (
                  <div key={msg.id || idx} className={`d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div style={{ maxWidth: '75%' }}>
                      {!isMine && (
                        <div className="small text-muted mb-1 ms-1 fw-semibold">
                          Prof. Ramesh (Mentor)
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-4 shadow-sm ${isMine ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                        style={{
                          borderBottomRightRadius: isMine ? '4px' : '16px',
                          borderBottomLeftRadius: !isMine ? '4px' : '16px'
                        }}
                      >
                        {msg.text}
                      </div>
                      <div className={`small text-muted mt-1 ${isMine ? 'text-end me-1' : 'ms-1'}`}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Footer Input */}
        <div className="p-3 bg-white border-top">
          <form onSubmit={handleSend} data-testid="chat-form" className="d-flex gap-2">
            <input
              type="text"
              data-testid="chat-input"
              className="form-control"
              placeholder="Type your message or inquiry for the faculty mentor..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading || !!loadError || sending}
            />
            <button
              type="submit"
              data-testid="chat-send-btn"
              className="btn btn-primary px-4 d-flex align-items-center gap-2"
              disabled={loading || !!loadError || !inputValue.trim() || sending}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </RolePageTemplate>
  )
}
