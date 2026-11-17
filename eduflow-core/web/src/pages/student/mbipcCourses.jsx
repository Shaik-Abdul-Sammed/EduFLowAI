import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../utils/apiConfig'

const mbipcCurriculum = {
  Mathematics: { faculty: 'Dr. Kavitha Sharma', totalChapters: 12, completed: 5, topics: ['Sets & Functions','Algebra','Trigonometry','Coordinate Geometry','Calculus','Mathematical Reasoning','Statistics','Probability','Vectors','3D Geometry','Linear Programming','Relations'] },
  Biology:     { faculty: 'Dr. Padma Rao',      totalChapters: 10, completed: 4, topics: ['Cell Biology','Biomolecules','Human Physiology','Genetics','Evolution','Ecology','Reproduction','Plant Physiology','Biotechnology','Microbes'] },
  Physics:     { faculty: 'Dr. Ravi Kumar',     totalChapters: 10, completed: 3, topics: ['Mechanics','Thermodynamics','Optics','Electrostatics','Current Electricity','Magnetism','Electromagnetic Waves','Modern Physics','Waves','Semiconductor'] },
  Chemistry:   { faculty: 'Dr. Sujata Rao',     totalChapters: 12, completed: 4, topics: ['Atomic Structure','Bonding','States of Matter','Thermodynamics','Equilibrium','Redox','Organic — Basics','Hydrocarbons','Polymers','Biomolecules','Electrochemistry','Surface Chemistry'] },
}

const subjectColor = { Mathematics: '#2563EB', Biology: '#10B981', Physics: '#8B5CF6', Chemistry: '#F59E0B' }
const subjectIcon  = { Mathematics: '📐', Biology: '🌿', Physics: '⚛️', Chemistry: '🧪' }

export default function Page() {
  const [activeSubject, setActiveSubject] = useState('Mathematics')
  const [curriculum, setCurriculum] = useState(mbipcCurriculum)
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
                  updated[subj].completed = Math.min(updated[subj].totalChapters, count + 2)
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
          subject: `[MBIPC Syllabus Progress] ${activeSubject} - Topic ${topicIndex + 1}`,
          description: `Updated student topic status for ${activeSubject}.`,
          category: 'curriculum_progress',
          priority: 'low'
        })
      })
    } catch {}
  }

  return (
    <RolePageTemplate role="Student" title="MBIPC Courses" description="Combined Maths, Biology, Physics & Chemistry curriculum tracker.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {/* Overall summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {Object.entries(mbipcCurriculum).map(([sub, c]) => {
            const pct = Math.round((c.completed / c.totalChapters) * 100)
            const col = subjectColor[sub]
            return (
              <button key={sub} onClick={() => setActiveSubject(sub)}
                style={{ padding: '0.875rem', borderRadius: '1rem', border: `2px solid ${activeSubject === sub ? col : 'var(--border-color)'}`, background: activeSubject === sub ? `${col}15` : 'var(--card-bg)', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{subjectIcon[sub]}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: col }}>{pct}%</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{sub}</div>
              </button>
            )
          })}
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', borderLeft: `4px solid ${color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Faculty — {activeSubject}</div>
              <div style={{ fontWeight: 700 }}>{curr.faculty}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.6rem 1.25rem', borderRadius: '1rem', background: `${color}12` }}>
              <div style={{ fontWeight: 800, fontSize: '1.75rem', color, lineHeight: 1 }}>{completionPct}%</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Complete</div>
            </div>
          </div>
          <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5 }}>
            <div style={{ height: '100%', width: `${completionPct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 5, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{subjectIcon[activeSubject]} {activeSubject} Topics</h2>
          </div>
          <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
            {curr.topics.map((topic, i) => {
              const done = i < curr.completed
              return (
                <div key={i} onClick={() => handleToggleTopic(i)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.875rem', borderRadius: '0.75rem', background: done ? `${color}08` : 'var(--surface-bg)', border: `1px solid ${done ? `${color}25` : 'var(--border-color)'}`, opacity: done ? 1 : 0.65, cursor: 'pointer' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? color : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: done ? 'white' : '#94a3b8', fontWeight: 700, flexShrink: 0 }}>{done ? '✓' : i + 1}</div>
                  <span style={{ fontSize: '0.82rem', fontWeight: done ? 600 : 500, color: done ? 'var(--app-text)' : '#64748b' }}>{topic}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}