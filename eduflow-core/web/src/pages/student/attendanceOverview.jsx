import React from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { attendanceData } from '../../utils/studentMockData'

const BLUE = '#2563EB'
const GREEN = '#10B981'
const RED = '#EF4444'
const AMBER = '#F59E0B'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']

export default function Page() {
  const { overall, subjects, heatmap } = attendanceData
  const pctColor = (p) => p >= 85 ? GREEN : p >= 75 ? BLUE : p >= 65 ? AMBER : RED

  // Donut chart — CSS conic-gradient
  const donutGradient = `conic-gradient(${overall >= 75 ? GREEN : RED} 0% ${overall}%, #e2e8f0 ${overall}% 100%)`

  return (
    <RolePageTemplate role="Student" title="Attendance Overview" description="Track your daily, subject-wise, and weekly attendance at a glance.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Top Row: Donut + Warning */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start' }} className="attendance-top-grid">
          {/* Donut */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.75rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Overall Attendance</h2>
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 1rem' }}>
              <div style={{ width: 140, height: 140, borderRadius: '50%', background: donutGradient }} />
              <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.6rem', color: pctColor(overall), lineHeight: 1 }}>{overall}%</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.2rem' }}>Present</span>
              </div>
            </div>
            {overall < 75 && (
              <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: '#EF444412', border: '1px solid #EF444425', color: '#B91C1C', fontSize: '0.78rem', fontWeight: 600 }}>
                ⚠️ Below 75% — Attend more classes!
              </div>
            )}
            {overall >= 75 && (
              <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: '#10B98112', border: '1px solid #10B98125', color: '#065f46', fontSize: '0.78rem', fontWeight: 600 }}>
                ✅ Good attendance! Keep it up.
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {[
              { label: 'Classes Attended', value: subjects.reduce((a, s) => a + s.attended, 0), color: GREEN, icon: '✅' },
              { label: 'Total Classes', value: subjects.reduce((a, s) => a + s.classes, 0), color: BLUE, icon: '📅' },
              { label: 'Classes Missed', value: subjects.reduce((a, s) => a + (s.classes - s.attended), 0), color: RED, icon: '❌' },
              { label: 'Subjects Tracked', value: subjects.length, color: '#8B5CF6', icon: '📚' },
            ].map(s => (
              <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject-wise Attendance */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Subject-wise Attendance</h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Min. required: 75%</span>
          </div>
          <div style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
            {subjects.map(s => {
              const color = pctColor(s.pct)
              return (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '0.5rem' }}>{s.faculty}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.attended}/{s.classes}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color, minWidth: 40, textAlign: 'right' }}>{s.pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                  {s.pct < 75 && (
                    <div style={{ fontSize: '0.7rem', color: RED, fontWeight: 600, marginTop: '0.25rem' }}>
                      ⚠️ Need {Math.ceil((0.75 * s.classes - s.attended) / 0.25)} more classes to reach 75%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Weekly Heatmap */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Monthly Attendance Heatmap</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(6, 1fr)', gap: '0.4rem', alignItems: 'center' }}>
            <div />
            {days.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{d}</div>
            ))}
            {heatmap.map((week, wi) => (
              <React.Fragment key={wi}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, paddingRight: '0.5rem' }}>{weeks[wi]}</div>
                {week.map((val, di) => (
                  <div key={di} style={{
                    height: 36, borderRadius: '0.5rem',
                    background: val === null ? '#f1f5f9' : val === 1 ? '#10B981' : '#FEE2E2',
                    border: val === null ? '1px dashed #cbd5e1' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: val === null ? '#94a3b8' : val === 1 ? 'white' : '#EF4444',
                    fontWeight: 600,
                    transition: 'transform 0.2s ease',
                    cursor: 'default',
                  }} title={val === null ? 'Holiday' : val === 1 ? 'Present' : 'Absent'}>
                    {val === null ? '—' : val === 1 ? '✓' : '✗'}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, background: GREEN, borderRadius: 3, display: 'inline-block' }} /> Present</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, background: '#FEE2E2', borderRadius: 3, display: 'inline-block', border: '1px solid #FCA5A5' }} /> Absent</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, background: '#f1f5f9', borderRadius: 3, display: 'inline-block', border: '1px dashed #cbd5e1' }} /> Holiday</span>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}


