import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { mpcCurriculum } from '../../utils/studentMockData'
import { getFullApiUrl } from '../../utils/apiConfig'

const subjectColor = { Mathematics: '#2563EB', Physics: '#10B981', Chemistry: '#F59E0B' }
const subjectIcon = { Mathematics: '📐', Physics: '⚛️', Chemistry: '🧪' }

export default function Page() {
  const [activeSubject, setActiveSubject] = useState('Mathematics')
  const [curriculum, setCurriculum] = useState(mpcCurriculum)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAcademicProgress() {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(getFullApiUrl('/v1/academics/assignments'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          const assignments = data?.assignments || []
          if (assignments.length > 0) {
            setCurriculum(prev => {
              const updated = { ...prev }
              Object.keys(updated).forEach(subj => {
                const count = assignments.filter(a => a.subject === subj).length
                if (count > 0) {
                  updated[subj].completed = Math.min(updated[subj].totalChapters, count + 3)
                }
              })
              return updated
            })
          }
        }
      } catch (err) {
        console.debug('Academic progress load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAcademicProgress()
  }, [])

  const curr = curriculum[activeSubject]
  const completionPct = Math.round((curr.completed / curr.totalChapters) * 100)
  const color = subjectColor[activeSubject]

  const handleToggleTopic = async (topicIndex) => {
    setCurriculum(prev => {
      const sub = prev[activeSubject]
      const newDone = topicIndex < sub.completed ? Math.max(0, sub.completed - 1) : Math.min(sub.totalChapters, sub.completed + 1)
      return {
        ...prev,
        [activeSubject]: { ...sub, completed: newDone }
      }
    })

    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          subject: `[MPC Syllabus Progress] ${activeSubject} - Topic ${topicIndex + 1}`,
          description: `Updated student topic status for ${activeSubject}.`,
          category: 'curriculum_progress',
          priority: 'low'
        })
      })
    } catch {}
  }

  return (
    <RolePageTemplate role="Student" title="MPC Courses" description="Mathematics, Physics & Chemistry curriculum tracker and syllabus progress.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Subject Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {Object.keys(mpcCurriculum).map(sub => (
            <button key={sub} onClick={() => setActiveSubject(sub)}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '0.875rem', border: `2px solid ${activeSubject === sub ? subjectColor[sub] : 'var(--border-color)'}`, background: activeSubject === sub ? `${subjectColor[sub]}15` : 'var(--card-bg)', color: activeSubject === sub ? subjectColor[sub] : '#64748b', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {subjectIcon[sub]} {sub}
            </button>
          ))}
        </div>

        {/* Overview Card */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', borderLeft: `4px solid ${color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Faculty</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{curr.faculty}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.6rem 1.25rem', borderRadius: '1rem', background: `${color}12` }}>
              <div style={{ fontWeight: 800, fontSize: '1.75rem', color, lineHeight: 1 }}>{completionPct}%</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Complete</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>
            <span>{curr.completed} chapters done</span>
            <span>{curr.totalChapters - curr.completed} remaining</span>
          </div>
          <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5 }}>
            <div style={{ height: '100%', width: `${completionPct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 5, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Chapter Checklist */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{subjectIcon[activeSubject]} {activeSubject} Syllabus</h2>
          </div>
          <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.6rem' }}>
            {curr.topics.map((topic, i) => {
              const done = i < curr.completed
              return (
                <div key={i} onClick={() => handleToggleTopic(i)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.875rem', borderRadius: '0.75rem', background: done ? `${color}08` : 'var(--surface-bg)', border: `1px solid ${done ? `${color}25` : 'var(--border-color)'}`, opacity: done ? 1 : 0.65, cursor: 'pointer' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? color : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: done ? 'white' : '#94a3b8', fontWeight: 700, flexShrink: 0 }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: done ? 600 : 500, color: done ? 'var(--app-text)' : '#64748b' }}>{topic}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* All subjects summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
          {Object.entries(mpcCurriculum).map(([sub, c]) => {
            const pct = Math.round((c.completed / c.totalChapters) * 100)
            const col = subjectColor[sub]
            return (
              <div key={sub} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>{subjectIcon[sub]}</div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{sub}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem' }}>{c.completed}/{c.totalChapters} chapters</div>
                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: col, marginTop: '0.3rem' }}>{pct}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </RolePageTemplate>
  )
}