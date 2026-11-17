import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { references } from '../../utils/studentMockData'
import { getFullApiUrl } from '../../utils/apiConfig'

const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'English', 'JEE/NEET']
const typeColor = { Book: '#2563EB', Online: '#10B981' }
const typeBg = { Book: '#2563EB12', Online: '#10B98112' }
const typeIcon = { Book: '📗', Online: '🌐' }

export default function Page() {
  const [filter, setFilter] = useState('All')
  const [items, setItems] = useState(references)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLiveBooks() {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(getFullApiUrl('/v1/campus-operations/library/books'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          const books = data?.books || []
          if (books.length > 0) {
            const mapped = books.map((b, idx) => ({
              id: b.id || idx + 1,
              title: b.title || 'Technical Reference Manual',
              author: b.author || 'Institutional Academic Press',
              subject: b.category || 'Computer Science',
              type: 'Book',
              link: '#',
              desc: `Available copies in campus repository: ${b.available_copies || 1} / ${b.total_copies || 1}`
            }))
            setItems(prev => [...mapped, ...prev])
          }
        }
      } catch (err) {
        console.debug('Failed to load library books for references hub:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLiveBooks()
  }, [])

  const filtered = filter === 'All' ? items : items.filter(r => r.subject === filter)

  return (
    <RolePageTemplate role="Student" title="References Hub" description="Curated reference books and online resources for all subjects.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Total Resources', value: references.length, color: '#2563EB', icon: '📚' },
            { label: 'Books', value: references.filter(r => r.type === 'Book').length, color: '#F59E0B', icon: '📗' },
            { label: 'Online', value: references.filter(r => r.type === 'Online').length, color: '#10B981', icon: '🌐' },
            { label: 'Subjects', value: subjects.length - 1, color: '#8B5CF6', icon: '🎓' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '2rem', border: `2px solid ${filter === s ? '#2563EB' : 'var(--border-color)'}`, background: filter === s ? '#2563EB15' : 'var(--card-bg)', color: filter === s ? '#2563EB' : '#64748b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>

        {/* Reference Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
          {filtered.map((r, i) => {
            const color = typeColor[r.type]
            const bg = typeBg[r.type]
            return (
              <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem', borderTop: `3px solid ${color}`, transition: 'transform 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    {typeIcon[r.type]}
                  </div>
                  <div>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: bg, color, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>{r.type}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>📚 {r.subject}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem', lineHeight: 1.4 }}>{r.title}</div>
                <a href={r.link} style={{ display: 'block', padding: '0.5rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: 'white', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center', textDecoration: 'none' }}>
                  {r.type === 'Book' ? '📖 View Book Info' : '🔗 Open Resource'}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </RolePageTemplate>
  )
}