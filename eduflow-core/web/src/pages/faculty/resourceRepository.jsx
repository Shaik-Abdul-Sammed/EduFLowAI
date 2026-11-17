import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const TEAL = '#0891b2'

const resources = [
  { id: 1, name: 'HC Verma Vol.1 — Chapter 5 Notes', subject: 'Physics', type: 'PDF', size: '2.4 MB', uploaded: '2026-05-01', downloads: 34, shared: true },
  { id: 2, name: 'Organic Chemistry Lab Manual', subject: 'Chemistry', type: 'PDF', size: '1.8 MB', uploaded: '2026-04-28', downloads: 28, shared: true },
  { id: 3, name: 'Integration Techniques Worksheet', subject: 'Mathematics', type: 'DOCX', size: '560 KB', uploaded: '2026-04-25', downloads: 41, shared: true },
  { id: 4, name: 'Wave Optics Presentation', subject: 'Physics', type: 'PPTX', size: '4.1 MB', uploaded: '2026-04-20', downloads: 19, shared: false },
  { id: 5, name: 'Trigonometry Formula Sheet', subject: 'Mathematics', type: 'PDF', size: '320 KB', uploaded: '2026-04-18', downloads: 58, shared: true },
]

const fileTypeColor = { PDF: '#EF4444', DOCX: '#2563EB', PPTX: '#F97316', XLSX: '#10B981', MP4: '#7C3AED' }
const fileTypeIcon  = { PDF: '📄', DOCX: '📝', PPTX: '📊', XLSX: '📈', MP4: '🎬' }

const subjects = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology']

export default function Page() {
  const [resList, setResList] = useState(resources)
  const [filter, setFilter] = useState('All')
  const [showUpload, setShowUpload] = useState(false)
  const [form, setForm] = useState({ name: '', subject: 'Physics', type: 'PDF', shared: true })
  const [uploaded, setUploaded] = useState(false)

  useEffect(() => {
    async function loadLiveResources() {
      try {
        const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken') || '') : ''
        const res = await fetch(getFullApiUrl('/v1/support/tickets'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          const tickets = data?.tickets || (Array.isArray(data) ? data : [])
          const resourceTickets = tickets.filter(t => t.category === 'academic_resource')
          if (resourceTickets.length > 0) {
            const mapped = resourceTickets.map(t => ({
              id: t.id,
              name: t.subject?.replace('Faculty Resource Upload: ', '') || 'Faculty Teaching Material',
              subject: t.description?.match(/Subject:\s*([^|]+)/)?.[1]?.trim() || 'Physics',
              type: t.description?.match(/Format:\s*([^|]+)/)?.[1]?.trim() || 'PDF',
              size: '1.5 MB',
              uploaded: t.created_at ? t.created_at.split('T')[0] : '2026-05-10',
              downloads: Math.floor(10 + Math.random() * 40),
              shared: true
            }))
            setResList(prev => {
              const ids = new Set(prev.map(p => p.id))
              const fresh = mapped.filter(m => !ids.has(m.id))
              return [...fresh, ...prev]
            })
          }
        }
      } catch (err) {
        console.debug('Failed to fetch live resources:', err)
      }
    }
    loadLiveResources()
  }, [])

  const filtered = filter === 'All' ? resList : resList.filter(r => r.subject === filter)

  async function submitUpload(e) {
    e.preventDefault()
    const newRes = {
      id: Date.now(), ...form,
      size: `${Math.round(Math.random() * 3 + 0.5 * 10) / 10} MB`,
      uploaded: new Date().toISOString().split('T')[0],
      downloads: 0,
    }
    setResList(prev => [newRes, ...prev])

    try {
      const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken') || '') : ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: `Faculty Resource Upload: ${form.name}`,
          description: `Subject: ${form.subject} | Format: ${form.type} | Shared: ${form.shared}`,
          category: 'academic_resource',
          priority: 'low'
        })
      })
    } catch (err) {
      console.debug('Failed to sync uploaded resource:', err)
    }

    setForm({ name: '', subject: 'Physics', type: 'PDF', shared: true })
    setShowUpload(false)
    setUploaded(true)
    setTimeout(() => setUploaded(false), 3000)
  }

  return (
    <RolePageTemplate role="Faculty" title="Resource Repository" description="Upload and share teaching materials, notes, and references with students.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {uploaded && (
          <div style={{ padding: '0.875rem', background: '#10B98110', border: '1px solid #10B98130', borderRadius: '0.875rem', color: '#065f46', fontWeight: 600, fontSize: '0.875rem' }}>
            ✅ Resource uploaded and shared with students.
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {subjects.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '0.4rem 0.875rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                background: filter === s ? TEAL : `${TEAL}12`,
                color: filter === s ? 'white' : TEAL, transition: 'all 0.2s',
              }}>{s}</button>
            ))}
          </div>
          <button onClick={() => setShowUpload(v => !v)} className="btn" style={{
            background: `linear-gradient(135deg,${TEAL},#2563EB)`, color: 'white', border: 'none',
            fontWeight: 700, borderRadius: '0.875rem', boxShadow: `0 4px 14px ${TEAL}40`,
          }}>
            {showUpload ? '✕ Cancel' : '⬆️ Upload Resource'}
          </button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', border: `1px solid ${TEAL}25` }}>
            <div className="card-body p-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: TEAL }}>⬆️ Upload New Resource</h2>
              <form onSubmit={submitUpload}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>RESOURCE NAME *</label>
                    <input required className="form-control" placeholder="e.g. Chapter 5 Notes" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>SUBJECT</label>
                    <select className="form-select" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}>
                      {['Physics','Chemistry','Mathematics','Biology','English'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>FILE TYPE</label>
                    <select className="form-select" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                      {['PDF','DOCX','PPTX','XLSX','MP4'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                      <input type="checkbox" checked={form.shared} onChange={e => setForm(p => ({...p, shared: e.target.checked}))} />
                      Share with students
                    </label>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>FILE</label>
                    <div style={{ border: '2px dashed rgba(8,145,178,0.3)', borderRadius: '0.875rem', padding: '1.5rem', textAlign: 'center', background: `${TEAL}05`, cursor: 'pointer' }}>
                      <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📁</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Click or drag file here (simulated)</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn" style={{ background: `linear-gradient(135deg,${TEAL},#2563EB)`, color: 'white', border: 'none', fontWeight: 700, borderRadius: '0.875rem' }}>
                    ⬆️ Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Total Files', value: resList.length, color: TEAL },
            { label: 'Shared', value: resList.filter(r => r.shared).length, color: '#10B981' },
            { label: 'Total Downloads', value: resList.reduce((a, r) => a + r.downloads, 0), color: '#7C3AED' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* File List */}
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {filtered.map(res => {
            const ftColor = fileTypeColor[res.type] || '#64748b'
            const ftIcon  = fileTypeIcon[res.type] || '📎'
            return (
              <div key={res.id} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '0.875rem', background: `${ftColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                    {ftIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{res.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>📚 {res.subject}</span>
                      <span>💾 {res.size}</span>
                      <span>📅 {res.uploaded}</span>
                      <span>⬇️ {res.downloads} downloads</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.375rem', background: `${ftColor}15`, color: ftColor, fontSize: '0.7rem', fontWeight: 700 }}>{res.type}</span>
                    {res.shared && <span style={{ padding: '0.2rem 0.55rem', borderRadius: '0.375rem', background: '#10B98112', color: '#10B981', fontSize: '0.7rem', fontWeight: 700 }}>Shared</span>}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No resources in this category.</div>
          )}
        </div>
      </div>
    </RolePageTemplate>
  )
}
