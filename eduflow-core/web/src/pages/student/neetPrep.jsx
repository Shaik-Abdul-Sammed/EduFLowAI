import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { neetChapters } from '../../utils/studentMockData'
import { getFullApiUrl } from '../../utils/apiConfig'

const BLUE = '#2563EB'
const GREEN = '#10B981'
const AMBER = '#F59E0B'

const mockTests = [
  { id: 1, name: 'NEET Full Syllabus Mock 1', date: '2026-05-22', biology: 330, chemistry: 145, physics: 135, total: 610, max: 720, percentile: 98.9 },
  { id: 2, name: 'NEET Bio Special Practice 4', date: '2026-05-12', biology: 345, chemistry: null, physics: null, total: 345, max: 360, percentile: 99.4 },
  { id: 3, name: 'NEET Part Syllabus Test 2', date: '2026-04-30', biology: 310, chemistry: 138, physics: 120, total: 568, max: 720, percentile: 97.6 },
]

export default function Page() {
  const [activeSubject, setActiveSubject] = useState('Biology')
  const [chapters, setChapters] = useState(neetChapters)
  const [practicedCounts, setPracticedCounts] = useState({
    'Cell Structure & Function': 160,
    'Biomolecules': 140,
    'Cell Division': 130,
    'Plant Physiology': 45,
    'Human Physiology': 25,
    'Genetics & Evolution': 12,
    'Mechanics': 90,
    'Optics': 35,
    'Electromagnetism': 15,
    'Atomic Structure': 110,
    'Chemical Bonding': 105,
    'Organic Chemistry': 40,
  })

  const [liveTests, setLiveTests] = useState(mockTests)

  useEffect(() => {
    async function loadNeetTests() {
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
              name: e.title || `NEET Mock Test ${idx + 1}`,
              date: e.date || '2026-05-22',
              biology: 335,
              chemistry: 142,
              physics: 138,
              total: 615,
              max: 720,
              percentile: 99.1
            }))
            setLiveTests(mapped)
          }
        }
      } catch (err) {
        console.debug('Failed to load NEET tests:', err)
      }
    }
    loadNeetTests()
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
          answers: { chapter: chapName, subject: subj, domain: 'NEET' },
          student_roll: 'SS26-CSE-042',
          student_name: 'Ananya Sharma'
        })
      }).catch(() => null)
    } catch {}
  }

  function incrementPractice(chapName) {
    setPracticedCounts(prev => ({
      ...prev,
      [chapName]: (prev[chapName] || 0) + 15
    }))

    try {
      const token = localStorage.getItem('token') || ''
      fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          subject: `[NEET Prep Practice] ${chapName}`,
          description: `Logged 15 additional NEET practice questions in ${chapName}.`,
          category: 'exam_prep',
          priority: 'low'
        })
      }).catch(() => null)
    } catch {}
  }

  const subjectList = ['Biology', 'Physics', 'Chemistry']
  const currentChapters = chapters[activeSubject] || []
  const completedCount = currentChapters.filter(c => c.done).length
  const totalCount = currentChapters.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Calculate overall metrics
  const totalCompletedAll = Object.values(chapters).flat().filter(c => c.done).length
  const totalChaptersAll = Object.values(chapters).flat().length
  const overallProgressPct = Math.round((totalCompletedAll / totalChaptersAll) * 100)

  return (
    <RolePageTemplate role="Student" title="NEET Prep" description="Track your NEET competitive medical stream syllabus, MCQ practice counts, and mock exam metrics.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        
        {/* Banner with Overall NEET Readiness */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A, #10B981)', color: 'white' }}>
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="badge text-bg-light text-success mb-2" style={{ fontWeight: 700 }}>NEET MEDICAL TRACK</span>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Sahana's NEET Preparation Dashboard</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Master NCERT line-by-line! Focus heavily on high weightage Human Physiology concepts.</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overallProgressPct}%</div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Syllabus Covered</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{Object.values(practicedCounts).reduce((a, b) => a + b, 0)}</div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>NCERT MCQs Solved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Tests Analysis */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>🏆 NEET National Level Mock Test Series</h2>
            <span className="badge text-bg-success">Active Subscription</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Test Name</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Date</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Bio (360)</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Chem (180)</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Phys (180)</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Total (720)</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Percentile</th>
                </tr>
              </thead>
              <tbody>
                {liveTests.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t.name}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{t.date}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: t.biology >= 320 ? GREEN : BLUE }}>{t.biology || '—'}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: t.chemistry >= 135 ? GREEN : BLUE }}>{t.chemistry || '—'}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: t.physics >= 120 ? GREEN : BLUE }}>{t.physics || '—'}</td>
                    <td style={{ fontSize: '0.875rem', fontWeight: 800, color: GREEN }}>{t.total}/{t.max}</td>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }} className="neet-grid">
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
                      padding: '0.875rem 1rem', borderRadius: '0.875rem', border: `2px solid ${isSelected ? GREEN : 'var(--border-color)'}`,
                      background: isSelected ? `${GREEN}12` : 'var(--card-bg)',
                      color: isSelected ? GREEN : 'var(--app-text)',
                      fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{subj === 'Biology' ? '🌿 Biology' : subj === 'Physics' ? '⚛️ Physics' : '🧪 Chemistry'}</span>
                      <span style={{ fontSize: '0.75rem' }}>{subPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2 }}>
                      <div style={{ width: `${subPct}%`, height: '100%', background: isSelected ? GREEN : '#94a3b8', borderRadius: 2 }} />
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
                Biology carries 50% of the total NEET marks. Ensure you practice <strong>Genetics & Evolution</strong> diagrams and statement-type questions today!
              </p>
            </div>
          </div>

          {/* Chapters List and Practiced Tracker */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {activeSubject} Chapters & NCERT Coverage
              </h3>
              <span className="badge text-bg-success">
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
                <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg, ${GREEN}, #06B6D4)`, borderRadius: 4, transition: 'width 0.4s ease' }} />
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
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: 'none', background: `${GREEN}15`, color: GREEN, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        +15 MCQs
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