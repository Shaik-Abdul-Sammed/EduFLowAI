import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { weeklyTests } from '../../utils/studentMockData'

const pctColor = (pct) => pct >= 85 ? '#10B981' : pct >= 70 ? '#2563EB' : pct >= 50 ? '#F59E0B' : '#EF4444'

export default function Page() {
  const [subFilter, setSubFilter] = useState('all')
  const subjects = ['all', ...new Set(weeklyTests.map(t => t.subject))]
  const weeks = [...new Set(weeklyTests.map(t => t.week))]

  const filtered = subFilter === 'all' ? weeklyTests : weeklyTests.filter(t => t.subject === subFilter)

  const avg = filtered.reduce((a, t) => a + (t.score / t.max) * 100, 0) / (filtered.length || 1)
  const best = filtered.length > 0 ? filtered.reduce((a, t) => ((t.score || 0) / Math.max(1, t.max || 1)) > ((a.score || 0) / Math.max(1, a.max || 1)) ? t : a, filtered[0]) : null
  const bestPct = best && best.max > 0 ? Math.round((best.score / best.max) * 100) : 0

  return (
    <RolePageTemplate role="Student" title="Weekly Exams" description="Track your weekly test scores, ranks, and performance trends.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Tests Taken', value: filtered.length, color: '#2563EB', icon: '📝' },
            { label: 'Avg Score', value: `${avg.toFixed(0)}%`, color: pctColor(avg), icon: '📊' },
            { label: 'Best Score', value: `${bestPct}%`, color: '#10B981', icon: '🏆' },
            { label: 'Rank #1 Count', value: filtered.filter(t => t.rank === 1).length, color: '#F59E0B', icon: '🥇' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Subject filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {subjects.map(s => (
            <button key={s} onClick={() => setSubFilter(s)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '2rem', border: `2px solid ${subFilter === s ? '#2563EB' : 'var(--border-color)'}`, background: subFilter === s ? '#2563EB15' : 'var(--card-bg)', color: subFilter === s ? '#2563EB' : '#64748b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
              {s === 'all' ? 'All Subjects' : s}
            </button>
          ))}
        </div>

        {/* Performance Bars */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Score Trend</h2>
          <div style={{ display: 'grid', gap: '0.875rem' }}>
            {filtered.map((t, i) => {
              const p = Math.round((t.score / t.max) * 100)
              const avgP = Math.round((t.classAvg / t.max) * 100)
              const c = pctColor(p)
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <div>
                      <span style={{ color: 'var(--svc-navy)' }}>{t.week}</span>
                      <span style={{ color: '#94a3b8', marginLeft: '0.5rem', fontSize: '0.72rem' }}>• {t.subject} • {t.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Avg: {avgP}%</span>
                      <span style={{ fontWeight: 800, color: c }}>{t.score}/{t.max}</span>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '2rem', background: t.rank === 1 ? '#F59E0B15' : '#2563EB10', color: t.rank === 1 ? '#B45309' : '#2563EB', fontSize: '0.68rem', fontWeight: 700 }}>
                        {t.rank === 1 ? '🥇 ' : ''}#{t.rank}
                      </span>
                    </div>
                  </div>
                  <div style={{ position: 'relative', height: 10, background: '#e2e8f0', borderRadius: 5 }}>
                    <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${avgP}%`, width: 2, background: '#94a3b8', borderRadius: 1, zIndex: 1 }} />
                    <div style={{ height: '100%', width: `${p}%`, background: `linear-gradient(90deg, ${c}, ${c}88)`, borderRadius: 5, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grouped by week table */}
        {weeks.map(week => {
          const weekTests = filtered.filter(t => t.week === week)
          if (!weekTests.length) return null
          const weekAvg = weekTests.length > 0 ? weekTests.reduce((a, t) => a + ((t.max > 0 ? (t.score / t.max) : 0) * 100), 0) / weekTests.length : 0
          return (
            <div key={week} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-bg)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{week} — {weekTests[0]?.date}</span>
                <span style={{ fontWeight: 700, color: pctColor(weekAvg), fontSize: '0.85rem' }}>Week Avg: {weekAvg.toFixed(0)}%</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      {['Subject', 'Score', 'Max', '%', 'Class Avg', 'Rank'].map(h => (
                        <th key={h} style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weekTests.map((t, i) => {
                      const p = t.max > 0 ? Math.round((t.score / t.max) * 100) : 0
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.subject}</td>
                          <td style={{ fontWeight: 800, color: pctColor(p) }}>{t.score}</td>
                          <td style={{ color: '#94a3b8' }}>{t.max}</td>
                          <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: `${pctColor(p)}15`, color: pctColor(p), fontWeight: 700, fontSize: '0.78rem' }}>{p}%</span></td>
                          <td style={{ color: '#64748b' }}>{t.max > 0 ? ((t.classAvg / t.max) * 100).toFixed(0) : '0'}%</td>
                          <td><span style={{ fontWeight: 700, color: t.rank === 1 ? '#F59E0B' : '#2563EB' }}>#{t.rank}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </RolePageTemplate>
  )
}