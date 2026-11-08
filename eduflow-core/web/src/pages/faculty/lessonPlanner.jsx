import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const CYAN = '#06B6D4'

const weeks = ['Week 1 (May 5–10)', 'Week 2 (May 12–17)', 'Week 3 (May 19–24)']
const subjects = ['Mathematics', 'Physics', 'Chemistry']

const plans = {
  'Week 1 (May 5–10)': {
    Mathematics: [
      { day: 'Mon', topic: 'Introduction to Derivatives', resources: 'Textbook Ch.5', status: 'done' },
      { day: 'Tue', topic: 'Rules of Differentiation', resources: 'Textbook Ch.5, Worksheet A', status: 'done' },
      { day: 'Wed', topic: 'Chain Rule and Applications', resources: 'Textbook Ch.6', status: 'done' },
      { day: 'Thu', topic: 'Implicit Differentiation', resources: 'Textbook Ch.6, Quiz 1', status: 'in-progress' },
      { day: 'Fri', topic: 'Problem Practice Session', resources: 'Problem Sheet 3', status: 'pending' },
    ],
    Physics: [
      { day: 'Mon', topic: 'Newton\'s 2nd Law Problems', resources: 'HC Verma Ch.5', status: 'done' },
      { day: 'Wed', topic: 'Friction and Inclined Plane', resources: 'HC Verma Ch.6', status: 'done' },
      { day: 'Fri', topic: 'Circular Motion Concepts', resources: 'HC Verma Ch.7', status: 'pending' },
    ],
    Chemistry: [
      { day: 'Tue', topic: 'Periodic Table Trends', resources: 'NCERT Ch.3', status: 'done' },
      { day: 'Thu', topic: 'Ionization Energy Discussion', resources: 'NCERT Ch.3, Lab Report', status: 'in-progress' },
    ],
  },
}

const statusColor = { done: '#10B981', 'in-progress': '#F59E0B', pending: '#94a3b8' }
const statusIcon  = { done: '✅', 'in-progress': '🔄', pending: '⏳' }

export default function Page() {
  const [week, setWeek]       = useState(weeks[0])
  const [subject, setSubject] = useState('Mathematics')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ day: 'Mon', topic: '', resources: '', status: 'pending' })

  const weekData = plans[week] || {}
  const todayPlan = weekData[subject] || []
  const doneCount = todayPlan.filter(p => p.status === 'done').length

  return (
    <RolePageTemplate role="Faculty" title="Lesson Planner" description="Plan, schedule, and track lesson progress by subject and week.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Controls */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-4">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Week</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {weeks.map(w => (
                    <button key={w} onClick={() => setWeek(w)} style={{
                      padding: '0.4rem 0.8rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                      background: week === w ? CYAN : `${CYAN}12`,
                      color: week === w ? 'white' : CYAN, transition: 'all 0.2s',
                    }}>{w.split(' ')[0]} {w.split(' ')[1]}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Subject</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {subjects.map(s => (
                    <button key={s} onClick={() => setSubject(s)} style={{
                      padding: '0.4rem 0.8rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                      background: subject === s ? `linear-gradient(135deg,${CYAN},#2563EB)` : `${CYAN}12`,
                      color: subject === s ? 'white' : CYAN, transition: 'all 0.2s',
                    }}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowForm(v => !v)} className="btn" style={{
                background: `linear-gradient(135deg,${CYAN},#2563EB)`, color: 'white', border: 'none',
                fontWeight: 700, borderRadius: '0.875rem', alignSelf: 'flex-end', boxShadow: `0 4px 12px ${CYAN}40`,
              }}>
                {showForm ? '✕' : '+ Add Lesson'}
              </button>
            </div>
          </div>
        </div>

        {/* Add Lesson Form */}
        {showForm && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', border: `1px solid ${CYAN}25` }}>
            <div className="card-body p-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: CYAN }}>📘 Add Lesson Plan Entry</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>DAY</label>
                  <select className="form-select" value={form.day} onChange={e => setForm(p => ({...p, day: e.target.value}))}>
                    {['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '2/-1' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>TOPIC</label>
                  <input className="form-control" placeholder="Lesson topic..." value={form.topic} onChange={e => setForm(p => ({...p, topic: e.target.value}))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>RESOURCES</label>
                  <input className="form-control" placeholder="Reference books, worksheets..." value={form.resources} onChange={e => setForm(p => ({...p, resources: e.target.value}))} />
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowForm(false)} className="btn" style={{ background: `linear-gradient(135deg,${CYAN},#2563EB)`, color: 'white', border: 'none', fontWeight: 700, borderRadius: '0.875rem' }}>
                  ✚ Add Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Banner */}
        {todayPlan.length > 0 && (
          <div style={{
            padding: '1rem 1.5rem', borderRadius: '1rem',
            background: `linear-gradient(135deg,${CYAN}18,#2563EB10)`,
            border: `1px solid ${CYAN}25`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{subject} — {week}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{doneCount} of {todayPlan.length} lessons completed</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: 300 }}>
              <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${todayPlan.length > 0 ? Math.round(doneCount / todayPlan.length * 100) : 0}%`, background: `linear-gradient(90deg,${CYAN},#10B981)`, borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontWeight: 800, color: CYAN, fontSize: '0.85rem', minWidth: 36 }}>{todayPlan.length > 0 ? Math.round(doneCount / todayPlan.length * 100) : 0}%</span>
            </div>
          </div>
        )}

        {/* Lesson Plan Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-4">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📋 {subject} Plan</h2>
            {todayPlan.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No lesson plan for this selection. Add one above.</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {todayPlan.map((lesson, i) => {
                  const color = statusColor[lesson.status]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '0.875rem', background: `${color}07`, border: `1px solid ${color}20` }}>
                      <div style={{ width: 36, height: 36, borderRadius: '0.625rem', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                        {statusIcon[lesson.status]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '0.375rem' }}>{lesson.day}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lesson.topic}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>📎 {lesson.resources}</div>
                      </div>
                      <span style={{ padding: '0.25rem 0.65rem', borderRadius: '2rem', background: `${color}15`, color, fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${color}25`, flexShrink: 0 }}>
                        {lesson.status.replace('-', ' ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
