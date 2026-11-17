import { useState, useEffect } from 'react'
import { Pin, Send, Plus, RefreshCw, AlertCircle, MessageSquare } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { wakeUpFetch } from '../../utils/wakeUpHandler'
import { useToast } from '../../context/ToastContext'

export default function ClassDiscussionBoardPage() {
  const { addToast } = useToast?.() || { addToast: () => {} }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [posting, setPosting] = useState(false)
  const [threads, setThreads] = useState([
    {
      id: 1,
      pinned: true,
      title: 'Lab 4 Setup: Configuring Local Minikube and Ingress Controller',
      author: 'Prof. Ramesh Sundaram (Instructor)',
      replies: 18,
      lastActive: '10 mins ago',
      resolved: true
    },
    {
      id: 2,
      pinned: false,
      title: 'Clarification on End-Term Project Submission Deadlines for Phase 2',
      author: 'Varun Desai (Student)',
      replies: 6,
      lastActive: '1 hour ago',
      resolved: false
    }
  ])

  const fetchDiscussionThreads = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await wakeUpFetch('/v1/support/tickets')
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to synchronize class discussion forum`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setThreads(prev => [
          ...prev,
          {
            id: 3,
            pinned: false,
            title: 'Q&A: Virtual Memory Page Replacement Algorithm Edge Cases',
            author: 'Ananya Sharma (Student)',
            replies: 4,
            lastActive: 'Just now',
            resolved: false
          }
        ])
      }
    } catch (err) {
      setError(err.message || 'Discussion sync error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscussionThreads()
  }, [])

  const handlePostThread = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setPosting(true)
    try {
      await wakeUpFetch('/v1/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'class_discussion_announcement',
          subject: newTitle.trim(),
          description: 'Official course discussion broadcast.'
        })
      })

      const newThread = {
        id: Date.now(),
        pinned: true,
        title: newTitle.trim(),
        author: 'Prof. Ramesh Sundaram (Instructor)',
        replies: 0,
        lastActive: 'Just now',
        resolved: false
      }

      setThreads(prev => [newThread, ...prev])
      setNewTitle('')
      addToast('Official course announcement posted!', 'success')
    } catch (err) {
      addToast(`Failed to post: ${err.message}`, 'error')
    } finally {
      setPosting(false)
    }
  }

  const togglePin = (id) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t))
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Course Q&A & Discussion Moderation Board"
      description="Moderate student course discussions, pin critical exam guidelines, endorse verified solutions, and answer inquiries."
    >
      <div className="d-flex flex-column gap-4 w-100">
        {loading && (
          <div data-testid="discussion-loading" className="alert alert-secondary py-2 px-3 small d-flex align-items-center gap-2 mb-0">
            <RefreshCw size={16} className="animate-spin" />
            <span>Synchronizing classroom discussion streams...</span>
          </div>
        )}

        {error && (
          <div data-testid="discussion-error" className="alert alert-danger py-2 px-3 small d-flex justify-content-between align-items-center mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              data-testid="discussion-retry"
              className="btn btn-outline-danger btn-sm py-0 px-2"
              onClick={fetchDiscussionThreads}
            >
              Retry
            </button>
          </div>
        )}

        {/* Post Announcement Form */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h4 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <MessageSquare size={16} className="text-primary" /> Post New Announcement or Discussion Prompt
          </h4>
          <form onSubmit={handlePostThread} className="d-flex gap-2">
            <input
              type="text"
              data-testid="discussion-input"
              className="form-control"
              placeholder="e.g. Midterm exam format: 20 MCQs and 2 design invariants..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button
              type="submit"
              data-testid="post-thread-btn"
              disabled={posting || !newTitle.trim()}
              className="btn btn-primary d-inline-flex align-items-center gap-1.5 flex-shrink-0"
            >
              {posting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              <span>Post</span>
            </button>
          </form>
        </div>

        {/* Discussions List */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h6 fw-bold mb-0">Class Discussion Stream</h3>
            <span className="badge bg-primary">Operating Systems (CS301)</span>
          </div>

          <div className="d-flex flex-column gap-3">
            {threads.map(t => (
              <div key={t.id} className="p-3 rounded-3 bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    {t.pinned && (
                      <span className="badge bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center gap-1">
                        <Pin size={12} /> Pinned Instructor Post
                      </span>
                    )}
                    <span className="badge bg-secondary bg-opacity-10 text-secondary">{t.replies} Replies</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted">{t.lastActive}</span>
                    <button
                      type="button"
                      data-testid={`pin-btn-${t.id}`}
                      onClick={() => togglePin(t.id)}
                      className="btn btn-sm btn-link p-0 text-secondary"
                      title={t.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin size={14} className={t.pinned ? 'text-danger' : ''} />
                    </button>
                  </div>
                </div>
                <h4 className="h6 fw-bold mb-1">{t.title}</h4>
                <div className="small text-muted">Author: {t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
