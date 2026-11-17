import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { jeeChapters } from '../../utils/studentMockData'
import { getFullApiUrl } from '../../utils/apiConfig'

const BLUE = '#2563EB'
const GREEN = '#10B981'
const AMBER = '#F59E0B'

const mockTests = [
  { id: 1, name: 'JEE Full Syllabus Mock 1', date: '2026-05-20', physics: 88, chemistry: 75, mathematics: 92, total: 255, max: 300, percentile: 99.2 },
  { id: 2, name: 'JEE Physics & Maths Sectional', date: '2026-05-10', physics: 76, chemistry: null, mathematics: 85, total: 161, max: 200, percentile: 98.4 },
  { id: 3, name: 'JEE Part Syllabus Test 3', date: '2026-04-28', physics: 82, chemistry: 70, mathematics: 68, total: 220, max: 300, percentile: 97.8 },
]

export default function Page() {
  const [activeSubject, setActiveSubject] = useState('Mathematics')
  const [chapters, setChapters] = useState(jeeChapters)
  const [practicedCounts, setPracticedCounts] = useState({
    'Sets & Functions': 120,
    'Limits & Continuity': 95,
    'Differentiation': 140,
    'Integration': 45,
    'Differential Equations': 12,
    'Vectors & 3D Geometry': 5,
    'Mechanics – Kinematics': 180,
    'Laws of Motion': 130,
    'Work, Energy & Power': 150,
    'Rotational Motion': 40,
    'Wave Optics': 15,
    'Electrostatics': 5,
    'Atomic Structure': 110,
    'Chemical Bonding': 100,
    'Equilibrium': 30,
    'Organic — Basic Concepts': 25,
    'Electrochemistry': 10,
  })

  const [liveTests, setLiveTests] = useState(mockTests)

  useEffect(() => {
    async function loadJeeTests() {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(getFullApiUrl('/v1/exams/online'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          const exams = data?.exams || []
          if (exams.length > 0) {
            const mapped = exams.map((e, idx) => ({
              id: e.id || idx + 1,
              name: e.title || `JEE Practice Test ${idx + 1}`,
              date: e.date || '2026-05-20',
              physics: 82,
              chemistry: 78,
              mathematics: 90,
              total: 250,
              max: 300,
              percentile: 98.9
            }))
            setLiveTests(mapped)
          }
        }
      } catch (err) {
        console.debug('Failed to load JEE tests:', err)
      }
    }
    loadJeeTests()
  }, [])

  function toggleChapterDone(subj, chapName) {
    setChapters(prev => ({
      ...prev,
      [subj]: prev[subj].map(ch => ch.chapter === chapName ? { ...ch, done: !ch.done } : ch)
    }))

    try {
      const token = localStorage.getItem('token') || ''
      fetch(getFullApiUrl('/v1/campus-operations/placement/mock-tests/1/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          answers: { chapter: chapName, subject: subj },
          student_roll: 'SS26-CSE-042',
          student_name: 'Ananya Sharma'
        })
      }).catch(() => null)
    } catch {}
  }

  function incrementPractice(chapName) {
    setPracticedCounts(prev => ({
      ...prev,
      [chapName]: (prev[chapName] || 0) + 10
    }))

    try {
      const token = localStorage.getItem('token') || ''
      fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          subject: `[JEE Prep MCQ Practice] ${chapName}`,
          description: `Completed additional 10 practice questions in ${chapName}.`,
          category: 'exam_prep',
          priority: 'low'
        })
      }).catch(() => null)
    } catch {}
  }

  const subjectList = ['Mathematics', 'Physics', 'Chemistry']
  const currentChapters = chapters[activeSubject] || []
  const completedCount = currentChapters.filter(c => c.done).length
  const totalCount = currentChapters.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Calculate overall metrics
  const totalCompletedAll = Object.values(chapters).flat().filter(c => c.done).length
  const totalChaptersAll = Object.values(chapters).flat().length
  const overallProgressPct = Math.round((totalCompletedAll / totalChaptersAll) * 100)

  return (
    <RolePageTemplate role="Student" title="JEE Mains Prep" description="Track your JEE competitive stream syllabus, MCQ practice counts, and mock exam metrics.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        
        {/* Banner with Overall JEE Readiness */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A, #2563EB)', color: 'white' }}>
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="badge text-bg-light text-primary mb-2" style={{ fontWeight: 700 }}>IIT-JEE TRACK</span>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Arjun's JEE Preparation Dashboard</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Keep practicing daily MCQs to improve speed and accuracy. Target 99+ Percentile!</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overallProgressPct}%</div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Syllabus Covered</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{Object.values(practicedCounts).reduce((a, b) => a + b, 0)}</div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>MCQs Practiced</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Tests Analysis */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>🏆 JEE National Level Mock Test Series</h2>
            <span className="badge text-bg-success">Active Subscription</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Test Name</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Date</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Phys (100)</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Chem (100)</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Math (100)</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Total (300)</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Percentile</th>
                </tr>
              </thead>
              <tbody>
                {liveTests.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t.name}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{t.date}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: t.physics >= 75 ? GREEN : BLUE }}>{t.physics || '—'}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: t.chemistry >= 70 ? GREEN : BLUE }}>{t.chemistry || '—'}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: t.mathematics >= 80 ? GREEN : BLUE }}>{t.mathematics || '—'}</td>
                    <td style={{ fontSize: '0.875rem', fontWeight: 800, color: BLUE }}>{t.total}/{t.max}</td>
                    <td>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', background: '#10B98115', color: GREEN, fontSize: '0.75rem', fontWeight: 700 }}>
                        🔥 {t.percentile}%ile
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject wise Chapter wise Trackers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }} className="jee-grid">
          {/* Subject Navigation */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Subjects</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {subjectList.map(subj => {
                const subChapters = chapters[subj] || []
                const subDone = subChapters.filter(c => c.done).length
                const subTotal = subChapters.length
                const subPct = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0
                const isSelected = activeSubject === subj

                return (
                  <button
                    key={subj}
                    onClick={() => setActiveSubject(subj)}
                    style={{
                      padding: '0.875rem 1rem', borderRadius: '0.875rem', border: `2px solid ${isSelected ? BLUE : 'var(--border-color)'}`,
                      background: isSelected ? `${BLUE}12` : 'var(--card-bg)',
                      color: isSelected ? BLUE : 'var(--app-text)',
                      fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{subj === 'Mathematics' ? '📐 Math' : subj === 'Physics' ? '⚛️ Physics' : '🧪 Chemistry'}</span>
                      <span style={{ fontSize: '0.75rem' }}>{subPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2 }}>
                      <div style={{ width: `${subPct}%`, height: '100%', background: isSelected ? BLUE : '#94a3b8', borderRadius: 2 }} />
                    </div>
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '1rem', background: '#F59E0B12', border: '1px solid #F59E0B25' }}>
              <div style={{ fontWeight: 700, color: AMBER, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                💡 Revision Focus Today
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                Your practice counts in <strong>Rotational Motion (Physics)</strong> and <strong>Integration (Maths)</strong> are low. Try solving at least 20 MCQs from each today!
              </p>
            </div>
          </div>

          {/* Chapters List and Practiced Tracker */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {activeSubject} Chapters & Study Coverage
              </h3>
              <span className="badge text-bg-primary">
                {completedCount}/{totalCount} Chapters Complete
              </span>
            </div>

            {/* progress bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>
                <span>Subject Syllabus Covered</span>
                <span>{progressPct}%</span>
              </div>
              <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg, ${BLUE}, #06B6D4)`, borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {currentChapters.map((ch) => {
                const count = practicedCounts[ch.chapter] || 0
                return (
                  <div key={ch.chapter} style={{ padding: '0.875rem 1.25rem', borderRadius: '1rem', background: 'var(--surface-bg)', border: `1px solid ${ch.done ? '#10B98125' : 'var(--border-color)'}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={ch.done}
                        onChange={() => toggleChapterDone(activeSubject, ch.chapter)}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', textDecoration: ch.done ? 'line-through' : 'none', color: ch.done ? '#94a3b8' : 'var(--app-text)' }}>
                          {ch.chapter}
                        </div>
                        {ch.score && (
                          <div style={{ fontSize: '0.7rem', color: GREEN, fontWeight: 600 }}>
                            ⭐ Chapter Test Score: {ch.score}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: count >= 100 ? GREEN : count >= 50 ? BLUE : AMBER }}>{count}</div>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>MCQs Solved</div>
                      </div>
                      <button
                        onClick={() => incrementPractice(ch.chapter)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: 'none', background: `${BLUE}15`, color: BLUE, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        +10 MCQs
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </RolePageTemplate>
  )
}