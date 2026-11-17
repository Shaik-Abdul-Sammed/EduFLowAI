import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const INDIGO = '#4F46E5'
const categories = ['All', 'Exam', 'Admin', 'Event', 'Academic']
const catColors = { Exam: '#EF4444', Admin: '#2563EB', Event: '#F59E0B', Academic: '#10B981' }
const priColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }

export default function Page() {
  const [noticeList, setNoticeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [showCompose, setShowCompose] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [form, setForm] = useState({
    title: 'Mid-Term Practical Laboratory Schedule',
    category: 'Academic',
    priority: 'high',
    body: 'Revised laboratory internal assessment slots for all third-year sections.'
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
        const formatted = raw.length > 0 ? raw.map((a, i) => ({
          id: a.id || i + 1,
          title: a.title || 'Department Notice',
          date: a.date || '2026-05-08',
          category: ['Exam', 'Admin', 'Academic', 'Event'][i % 4],
          priority: ['high', 'medium', 'low'][i % 3],
          body: a.body || 'Notice content posted to departmental board.',
          author: a.author || 'Academic Council'
        })) : [
          { id: 1, title: 'Mid-Term Exam Schedule Released', date: '2026-05-08', category: 'Exam', priority: 'high', body: 'Mid-term examinations will begin from 12 Sept 2026. Timetable is pinned on the faculty portal.', author: 'HOD Physics' },
          { id: 2, title: 'Staff Meeting — Friday 3 PM', date: '2026-05-07', category: 'Admin', priority: 'medium', body: 'All faculty members are requested to attend the staff meeting in Room 201 on Friday.', author: 'Principal' }
        ]
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
      const res = await fetch(getFullApiUrl('/v1/parents/multilingual-notice'), {
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
          targetAudience: 'faculty'
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to dispatch notice')

      setToastMessage(`Department notice "${form.title}" published successfully!`)
      setShowCompose(false)
      setTimeout(() => setToastMessage(''), 4500)
      await fetchNotices(true)
    } catch (err) {
      setToastMessage(err.message || 'Error posting notice')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filter === 'All' ? noticeList : noticeList.filter(n => n.category === filter)

  return (
    <RolePageTemplate role="Faculty" title="Department Notices" description="Read and post notices for your department and classes.">
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
            {/* Header / Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categories.map(c => (
                  <button key={c} onClick={() => setFilter(c)} style={{
                    padding: '0.4rem 0.9rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                    background: filter === c ? INDIGO : `${INDIGO}10`,
                    color: filter === c ? 'white' : INDIGO, transition: 'all 0.2s',
                  }}>{c}</button>
                ))}
              </div>
              <button
                data-testid="open-compose-notice-btn"
                onClick={() => setShowCompose(v => !v)}
                className="btn btn-sm btn-primary"
              >
                {showCompose ? '✕ Cancel' : '📢 Post Notice'}
              </button>
            </div>

            {/* Compose Notice Form */}
            {showCompose && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: `4px solid ${INDIGO}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Compose Department Notice</h3>
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
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>BODY / DETAILS</label>
                    <textarea rows={3} required className="form-control form-control-sm" value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} />
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
                  <div key={n.id || idx} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', borderLeft: `4px solid ${color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color, background: `${color}15`, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                        {n.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 {n.date} · ✍️ {n.author}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>{n.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>{n.body}</p>
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
