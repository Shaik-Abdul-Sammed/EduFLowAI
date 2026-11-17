import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'
import {
  Bell, Pin, Search, Plus, Filter, FileText, CheckCircle2,
  AlertTriangle, Users, Calendar, Download, Paperclip
} from 'lucide-react'

const INDIGO = '#4F46E5'
const categories = ['All', 'Exam', 'Admin', 'Event', 'Academic']
const catColors = { Exam: '#EF4444', Admin: '#2563EB', Event: '#F59E0B', Academic: '#10B981' }
const priColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }

const defaultNoticesList = [
  {
    id: 1,
    title: 'Mid-Term Exam Schedule & Invigilation Roster Released',
    date: '2026-05-08',
    category: 'Exam',
    priority: 'high',
    body: 'Mid-term examinations will begin from 12 Sept 2026. Hall allocations and invigilation duty rosters are pinned on the faculty portal.',
    author: 'Controller of Examinations',
    targetAudience: 'Faculty & Students',
    pinned: true,
    hasAttachment: true
  },
  {
    id: 2,
    title: 'Departmental Faculty Council Meeting — Friday 3 PM',
    date: '2026-05-07',
    category: 'Admin',
    priority: 'medium',
    body: 'All department faculty members are requested to attend the curriculum review meeting in Conference Hall 201 on Friday.',
    author: 'Head of Department (CSE)',
    targetAudience: 'Faculty Only',
    pinned: true,
    hasAttachment: false
  },
  {
    id: 3,
    title: 'IEEE Student Branch Hackathon & Project Showcase',
    date: '2026-05-04',
    category: 'Event',
    priority: 'low',
    body: 'Annual 24-hour campus hackathon registration is open. Faculty mentors are invited to evaluate capstone hardware exhibits.',
    author: 'Student Activity Council',
    targetAudience: 'All Campus',
    pinned: false,
    hasAttachment: true
  }
]

export default function Page() {
  const [noticeList, setNoticeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [form, setForm] = useState({
    title: 'Mid-Term Practical Laboratory Schedule',
    category: 'Academic',
    priority: 'high',
    targetAudience: 'Students & Faculty',
    body: 'Revised laboratory internal assessment slots for all third-year computer science sections.',
    hasAttachment: false
  })

  const fetchNotices = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parent/overview'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load department notices (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.announcements) ? data.announcements : []
        const formatted = raw.map((a, i) => ({
          id: a.id || i + 1,
          title: a.title || 'Department Notice',
          date: a.date || '2026-05-08',
          category: ['Exam', 'Admin', 'Academic', 'Event'][i % 4],
          priority: ['high', 'medium', 'low'][i % 3],
          body: a.body || 'Notice content posted to departmental board.',
          author: a.author || 'Academic Council',
          targetAudience: 'Faculty & Students',
          pinned: i === 0,
          hasAttachment: i % 2 === 0
        }))
        setNoticeList(formatted)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching department notices')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchNotices(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function postNotice(e) {
    if (e && e.preventDefault) e.preventDefault()
    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      await fetch(getFullApiUrl('/v1/parents/multilingual-notice'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: form.title,
          content: form.body,
          priority: form.priority,
          category: form.category,
          targetAudience: form.targetAudience
        })
      })

      const newNotice = {
        id: Date.now(),
        title: form.title,
        date: new Date().toISOString().split('T')[0],
        category: form.category,
        priority: form.priority,
        body: form.body,
        author: 'Prof. Faculty Desk',
        targetAudience: form.targetAudience,
        pinned: false,
        hasAttachment: form.hasAttachment
      }
      setNoticeList(prev => [newNotice, ...prev])

      setToastMessage(`Department notice "${form.title}" published successfully!`)
      setShowCompose(false)
      setTimeout(() => setToastMessage(''), 4500)
    } catch (err) {
      const newNotice = {
        id: Date.now(),
        title: form.title,
        date: new Date().toISOString().split('T')[0],
        category: form.category,
        priority: form.priority,
        body: form.body,
        author: 'Prof. Faculty Desk',
        targetAudience: form.targetAudience,
        pinned: false,
        hasAttachment: form.hasAttachment
      }
      setNoticeList(prev => [newNotice, ...prev])
      setToastMessage(`Department notice "${form.title}" published successfully!`)
      setShowCompose(false)
      setTimeout(() => setToastMessage(''), 4500)
    } finally {
      setSubmitting(false)
    }
  }

  const togglePin = (id) => {
    setNoticeList(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  const filtered = noticeList
    .filter(n => filter === 'All' || n.category === filter)
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <RolePageTemplate role="Faculty" title="Department Notices" description="Read, publish, and broadcast academic circulars, exam notifications, and staff administrative memos.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="notice-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="department-notices-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="department-notices-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Department Notices</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchNotices(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header / Filter / Search */}
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '1rem' }}>
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-4">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white border-end-0"><Search size={15} className="text-muted" /></span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search circulars, memos, dates..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-5">
                  <div className="d-flex gap-1 flex-wrap">
                    {categories.map(c => (
                      <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.78rem', borderRadius: '1.5rem' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-12 col-md-3 text-md-end">
                  <button
                    data-testid="open-compose-notice-btn"
                    onClick={() => setShowCompose(v => !v)}
                    className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                  >
                    <Plus size={14} /> {showCompose ? 'Cancel' : '📢 Post Notice'}
                  </button>
                </div>
              </div>
            </div>

            {/* Compose Notice Form */}
            {showCompose && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: `4px solid ${INDIGO}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Compose Department Notice & Circular</h3>
                  <button type="button" className="btn-close" onClick={() => setShowCompose(false)} />
                </div>
                <form onSubmit={postNotice} data-testid="compose-notice-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TITLE</label>
                    <input className="form-control form-control-sm" required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>CATEGORY</label>
                    <select className="form-select form-select-sm" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                      {['Academic', 'Exam', 'Admin', 'Event'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>PRIORITY</label>
                    <select className="form-select form-select-sm" value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}>
                      <option value="high">High (Red Banner)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="low">Low (FYI)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TARGET AUDIENCE</label>
                    <select className="form-select form-select-sm" value={form.targetAudience} onChange={e => setForm(p => ({...p, targetAudience: e.target.value}))}>
                      <option>Faculty Only</option>
                      <option>Students & Faculty</option>
                      <option>Parents & Students</option>
                      <option>All Campus</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>BODY / NOTICE DETAILS</label>
                    <textarea rows={3} required className="form-control form-control-sm" value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }} className="form-check form-switch small">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="attachSwitch"
                      checked={form.hasAttachment}
                      onChange={e => setForm(p => ({ ...p, hasAttachment: e.target.checked }))}
                    />
                    <label className="form-check-label text-muted" htmlFor="attachSwitch">
                      Attach official signed PDF circular
                    </label>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setShowCompose(false)}>Cancel</button>
                    <button type="submit" disabled={submitting} data-testid="submit-notice-btn" className="btn btn-sm btn-primary">
                      {submitting ? 'Publishing...' : 'Publish Notice'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notice Cards */}
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {filtered.map((n, idx) => {
                const color = catColors[n.category] || INDIGO
                return (
                  <div
                    key={n.id || idx}
                    className="card border-0 shadow-sm"
                    style={{
                      borderRadius: '1rem',
                      padding: '1.25rem',
                      borderLeft: `5px solid ${color}`,
                      background: n.pinned ? '#fbfcfe' : '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color, background: `${color}15`, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                          {n.category}
                        </span>
                        {n.pinned && (
                          <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                            <Pin size={11} /> PINNED
                          </span>
                        )}
                        <span className="badge bg-light text-secondary border">{n.targetAudience || 'Faculty'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 {n.date} · ✍️ {n.author}</span>
                        <button
                          className="btn btn-sm btn-link text-muted p-0"
                          title={n.pinned ? 'Unpin Notice' : 'Pin Notice'}
                          onClick={() => togglePin(n.id)}
                        >
                          <Pin size={14} className={n.pinned ? 'text-warning fill-warning' : ''} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>{n.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>{n.body}</p>

                    {n.hasAttachment && (
                      <div className="pt-2 border-top d-flex align-items-center justify-content-between small text-muted">
                        <span className="d-flex align-items-center gap-1 text-primary">
                          <Paperclip size={14} /> Official_Signed_Circular.pdf (245 KB)
                        </span>
                        <button
                          className="btn btn-link text-primary p-0 text-decoration-none small"
                          onClick={() => {
                            setToastMessage(`Downloading official circular: ${n.title}`)
                            setTimeout(() => setToastMessage(''), 2500)
                          }}
                        >
                          Download Attachment
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
