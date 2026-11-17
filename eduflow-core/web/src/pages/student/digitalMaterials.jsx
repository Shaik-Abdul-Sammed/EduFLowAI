import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { digitalMaterials as defaultMaterials } from '../../utils/studentMockData'

const typeIcon = { PDF: '📄', PPT: '📊', Video: '🎬', DOC: '📝', Book: '📚' }
const typeColor = { PDF: '#EF4444', PPT: '#F59E0B', Video: '#8B5CF6', DOC: '#2563EB', Book: '#10B981' }

export default function DigitalMaterialsPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subFilter, setSubFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [downloaded, setDownloaded] = useState([])
  const [actionMsg, setActionMsg] = useState('')

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const res = await fetch('/v1/library/books', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch course materials`)
      const data = await res.json()
      const books = data.books || []
      if (books.length > 0) {
        const formatted = books.map((b, idx) => ({
          id: b.id || `mat-${idx}`,
          title: b.title,
          subject: b.category || 'General Computer Science',
          type: idx % 3 === 0 ? 'PDF' : idx % 3 === 1 ? 'PPT' : 'Book',
          faculty: b.author || 'Faculty Dept',
          size: '4.2 MB',
          uploadedOn: '2026-11-10',
          isNew: idx < 2,
          available: b.available_copies
        }))
        setMaterials(formatted)
      } else {
        setMaterials(defaultMaterials)
      }
    } catch (err) {
      setError(err.message || 'Error loading materials')
      setMaterials(defaultMaterials)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const subjects = ['all', ...new Set(materials.map(m => m.subject))]
  const types = ['all', ...new Set(materials.map(m => m.type))]

  const filtered = materials.filter(m => {
    const matchSub = subFilter === 'all' || m.subject === subFilter
    const matchType = typeFilter === 'all' || m.type === typeFilter
    return matchSub && matchType
  })

  async function handleDownload(material) {
    const id = material.id
    setDownloaded(prev => [...prev, id])
    setActionMsg(`Downloading ${material.title}...`)
    try {
      const token = localStorage.getItem('token')
      await fetch('/v1/library/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: id,
          student_roll: 'SS26',
          days: 7
        })
      })
      setActionMsg(`Access granted for ${material.title}`)
    } catch (_e) {
      // Offline fallback
    }
    setTimeout(() => {
      setDownloaded(prev => prev.filter(d => d !== id))
      setActionMsg('')
    }, 2500)
  }

  return (
    <RolePageTemplate role="Student" title="Digital Materials" description="Access notes, slides, and learning materials shared by your faculty.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {loading && (
          <div data-testid="materials-loading" className="card border-0 shadow-sm p-4 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Loading digital repository materials...</p>
          </div>
        )}

        {error && !loading && (
          <div data-testid="materials-error" className="alert alert-warning d-flex justify-content-between align-items-center">
            <div>
              <strong>Sync Notice:</strong> {error}. Showing offline cached materials.
            </div>
            <button className="btn btn-sm btn-outline-warning" onClick={fetchMaterials}>Retry</button>
          </div>
        )}

        {actionMsg && (
          <div className="alert alert-success py-2 px-3 mb-0" role="alert">
            {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Total', value: materials.length, color: '#2563EB', icon: '📁' },
            { label: 'New', value: materials.filter(m => m.isNew).length, color: '#10B981', icon: '🆕' },
            { label: 'PDFs', value: materials.filter(m => m.type === 'PDF').length, color: '#EF4444', icon: '📄' },
            { label: 'Books/Videos', value: materials.filter(m => m.type === 'Video' || m.type === 'Book').length, color: '#8B5CF6', icon: '🎬' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {subjects.map(s => (
              <button key={s} onClick={() => setSubFilter(s)}
                style={{ padding: '0.4rem 0.875rem', borderRadius: '2rem', border: `2px solid ${subFilter === s ? '#2563EB' : 'var(--border-color, #e2e8f0)'}`, background: subFilter === s ? '#2563EB15' : 'var(--card-bg, #fff)', color: subFilter === s ? '#2563EB' : '#64748b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                {s === 'all' ? 'All Subjects' : s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
            {types.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                style={{ padding: '0.35rem 0.75rem', borderRadius: '2rem', border: `1px solid ${typeFilter === t ? (typeColor[t] || '#2563EB') : 'var(--border-color, #e2e8f0)'}`, background: typeFilter === t ? `${typeColor[t] || '#2563EB'}15` : 'var(--card-bg, #fff)', color: typeFilter === t ? (typeColor[t] || '#2563EB') : '#94a3b8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                {t === 'all' ? 'All Types' : `${typeIcon[t] || ''} ${t}`}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
          {filtered.map(m => {
            const color = typeColor[m.type] || '#2563EB'
            const isDownloading = downloaded.includes(m.id)
            return (
              <div key={m.id} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
                <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '0.75rem', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                      {typeIcon[m.type] || '📁'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {m.isNew && (
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: '#10B98115', color: '#10B981', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>🆕 New</span>
                      )}
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: `${color}12`, color, fontSize: '0.65rem', fontWeight: 700 }}>{m.type}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', lineHeight: 1.4 }}>{m.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.875rem' }}>
                    <span>📚 {m.subject}</span>
                    <span>👨‍🏫 {m.faculty}</span>
                    <span>📅 {m.uploadedOn} • {m.size}</span>
                  </div>
                  <button onClick={() => handleDownload(m)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.75rem', border: 'none', background: isDownloading ? `${color}20` : `linear-gradient(135deg, ${color}, ${color}cc)`, color: isDownloading ? color : 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    {isDownloading ? '✅ Downloaded!' : `⬇️ Access / Download ${m.type}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </RolePageTemplate>
  )
}
