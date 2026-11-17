import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { STUDENT } from '../../utils/studentMockData'
import { getFullApiUrl } from '../../utils/apiConfig'

const BLUE = '#2563EB'

export default function Page() {
  const { section_students, section } = STUDENT
  const [classmates, setClassmates] = useState(section_students)
  const [search, setSearch] = useState('')
  const [showGroup, setShowGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupCreated, setGroupCreated] = useState(null)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSectionClassmates() {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(getFullApiUrl('/api/v1/attendance/records'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          const records = data?.records || []
          if (records.length > 0) {
            const names = [...new Set(records.map(r => r.student_name).filter(Boolean))]
            if (names.length > 0) {
              setClassmates(prev => [...new Set([...names, ...prev])])
            }
          }
        }
      } catch (err) {
        console.debug('Failed to load live classmates:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSectionClassmates()
  }, [])

  const filtered = classmates.filter(s => s.toLowerCase().includes(search.toLowerCase()))

  async function createGroup(e) {
    e.preventDefault()
    const newGroup = { name: groupName, members: [STUDENT.name, ...selected] }
    setGroupCreated(newGroup)

    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          subject: `[Study Group Formed] ${groupName} (${section})`,
          description: `Formed study group with members: ${newGroup.members.join(', ')}`,
          category: 'study_group',
          priority: 'low'
        })
      })
    } catch {}

    setShowGroup(false)
    setGroupName('')
    setSelected([])
  }

  function toggleSelect(name) {
    if (name === STUDENT.name) return
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  return (
    <RolePageTemplate role="Student" title="Sections Planner" description={`View your section details, classmates, and form study groups.`}>
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Section Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Section', value: section, color: BLUE, icon: '🏫' },
            { label: 'Classmates', value: section_students.length, color: '#10B981', icon: '👥' },
            { label: 'Stream', value: 'MPC', color: '#F59E0B', icon: '📚' },
            { label: 'Academic Year', value: '2025–26', color: '#8B5CF6', icon: '📅' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Study Group */}
        {groupCreated && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '0.5rem' }}>✅ Study Group "{groupCreated.name}" Created!</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Members: {groupCreated.members.join(', ')}</div>
          </div>
        )}

        {/* Classmates + Study Group */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>👥 {section} Classmates ({filtered.length})</h2>
              <input className="form-control" placeholder="Search name..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180, fontSize: '0.82rem' }} />
            </div>
            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', maxHeight: 400, overflowY: 'auto' }}>
              {filtered.map((name, i) => {
                const isMe = name === STUDENT.name
                const isSelected = selected.includes(name)
                return (
                  <div key={i} onClick={() => showGroup && toggleSelect(name)}
                    style={{
                      padding: '0.6rem 0.875rem', borderRadius: '0.75rem',
                      background: isMe ? '#2563EB15' : isSelected ? '#10B98115' : 'var(--surface-bg)',
                      border: `1px solid ${isMe ? '#2563EB30' : isSelected ? '#10B98130' : 'var(--border-color)'}`,
                      cursor: showGroup && !isMe ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      transition: 'all 0.15s ease',
                    }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMe ? '#2563EB' : '#e2e8f0', color: isMe ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: isMe ? BLUE : 'var(--app-text)' }}>{name}</div>
                      {isMe && <div style={{ fontSize: '0.6rem', color: BLUE, fontWeight: 700 }}>YOU</div>}
                      {isSelected && !isMe && <div style={{ fontSize: '0.6rem', color: '#10B981', fontWeight: 700 }}>✓ Selected</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Study Group Panel */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.875rem' }}>📖 Study Group</h3>
            {!showGroup ? (
              <button onClick={() => setShowGroup(true)} className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: '0.75rem' }}>
                + Create Study Group
              </button>
            ) : (
              <form onSubmit={createGroup} style={{ display: 'grid', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>GROUP NAME</label>
                  <input required className="form-control" style={{ fontSize: '0.82rem' }} value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Physics Study Crew" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Select members from the list. ({selected.length} selected)
                </div>
                {selected.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {selected.map(n => (
                      <span key={n} style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: '#10B98115', color: '#065f46', fontSize: '0.7rem', fontWeight: 600 }}>{n}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={selected.length === 0}>✅ Create</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setShowGroup(false); setSelected([]) }}>✕</button>
                </div>
              </form>
            )}
            <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6, marginTop: '0.5rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>📌 Section Notices</div>
              <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: 'var(--surface-bg)', fontSize: '0.75rem' }}>
                Unit Test on June 14 — All students must carry ID cards.
              </div>
            </div>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}