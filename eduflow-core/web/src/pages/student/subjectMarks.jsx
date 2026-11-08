import RolePageTemplate from '../../components/RolePageTemplate'
import { marksData } from '../../utils/studentMockData'

const pctColor = (pct) => pct >= 85 ? '#10B981' : pct >= 70 ? '#2563EB' : pct >= 55 ? '#F59E0B' : '#EF4444'
const pct = (score, max) => Math.round((score / max) * 100)

export default function Page() {
  const totalScored = marksData.reduce((acc, s) => acc + s.internal + s.midterm + s.final, 0)
  const totalMax = marksData.reduce((acc, s) => acc + s.max.internal + s.max.midterm + s.max.final, 0)
  const overallPct = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0
  const bestSubject = marksData.length > 0 ? [...marksData].sort((a, b) => pct(a.internal + a.midterm + a.final, a.max.internal + a.max.midterm + a.max.final) - pct(b.internal + b.midterm + b.final, b.max.internal + b.max.midterm + b.max.final)).pop() : null
  const avgRank = marksData.length > 0 ? Math.round(marksData.reduce((a, s) => a + (Number(s.rank) || 0), 0) / marksData.length) : 0

  return (
    <RolePageTemplate role="Student" title="Subject Marks" description="Review your subject-wise internal, midterm, and final exam performance.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Overall Score', value: `${totalScored}/${totalMax}`, sub: `${overallPct}%`, color: pctColor(overallPct), icon: '🏆' },
            { label: 'Best Subject', value: bestSubject?.subject || 'N/A', sub: bestSubject ? `${pct(bestSubject.internal + bestSubject.midterm + bestSubject.final, bestSubject.max.internal + bestSubject.max.midterm + bestSubject.max.final)}%` : '0%', color: '#10B981', icon: '⭐' },
            { label: 'Avg Class Rank', value: avgRank > 0 ? `#${avgRank}` : 'N/A', sub: 'out of 32', color: '#8B5CF6', icon: '📊' },
            { label: 'Subjects', value: marksData.length, sub: 'tracked', color: '#2563EB', icon: '📚' },
          ].map(c => (
            <div key={c.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: c.color, lineHeight: 1.1 }}>{c.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>{c.sub}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.3rem' }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Marks Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Subject-wise Marks Breakdown</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['Subject', 'Internal (20)', 'Midterm (50)', 'Final (100)', 'Total (170)', '%', 'Class Rank'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap', paddingTop: '0.875rem', paddingBottom: '0.875rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marksData.map(s => {
                  const total = s.internal + s.midterm + s.final
                  const maxTotal = s.max.internal + s.max.midterm + s.max.final
                  const p = pct(total, maxTotal)
                  const c = pctColor(p)
                  const avgTotal = s.classAvg.internal + s.classAvg.midterm + s.classAvg.final
                  const diff = total - avgTotal
                  return (
                    <tr key={s.subject}>
                      <td style={{ fontWeight: 700, fontSize: '0.875rem' }}>{s.subject}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: pctColor(pct(s.internal, s.max.internal)) }}>{s.internal}</span>
                          <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, minWidth: 40 }}>
                            <div style={{ height: '100%', width: `${pct(s.internal, s.max.internal)}%`, background: pctColor(pct(s.internal, s.max.internal)), borderRadius: 2 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: pctColor(pct(s.midterm, s.max.midterm)) }}>{s.midterm}</td>
                      <td style={{ fontWeight: 600, color: pctColor(pct(s.final, s.max.final)) }}>{s.final}</td>
                      <td>
                        <span style={{ fontWeight: 800, color: c, fontSize: '0.95rem' }}>{total}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>/{maxTotal}</span>
                        <div style={{ fontSize: '0.68rem', color: diff >= 0 ? '#10B981' : '#EF4444', fontWeight: 600, marginTop: '0.1rem' }}>
                          {diff >= 0 ? `▲ +${diff.toFixed(1)}` : `▼ ${diff.toFixed(1)}`} vs avg
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: c, fontSize: '0.95rem' }}>{p}%</span>
                      </td>
                      <td>
                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: '2rem', background: s.rank <= 3 ? '#F59E0B15' : '#2563EB10', color: s.rank <= 3 ? '#B45309' : '#2563EB', fontWeight: 700, fontSize: '0.78rem' }}>
                          {s.rank <= 3 ? '🏅 ' : ''}#{s.rank}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Performance vs Class Average</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {marksData.map(s => {
              const total = (s.internal || 0) + (s.midterm || 0) + (s.final || 0)
              const maxTotal = (s.max?.internal || 0) + (s.max?.midterm || 0) + (s.max?.final || 0)
              const avgTotal = (s.classAvg?.internal || 0) + (s.classAvg?.midterm || 0) + (s.classAvg?.final || 0)
              const myPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0
              const avgPct = maxTotal > 0 ? (avgTotal / maxTotal) * 100 : 0
              return (
                <div key={s.subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>{s.subject}</span>
                    <span style={{ color: '#64748b' }}>You: <strong style={{ color: pctColor(myPct) }}>{myPct.toFixed(0)}%</strong> | Avg: {avgPct.toFixed(0)}%</span>
                  </div>
                  <div style={{ position: 'relative', height: 10, background: '#e2e8f0', borderRadius: 5 }}>
                    {/* Avg line */}
                    <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${Math.min(100, Math.max(0, avgPct))}%`, width: 2, background: '#94a3b8', borderRadius: 1 }} />
                    {/* My bar */}
                    <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, myPct))}%`, background: `linear-gradient(90deg, ${pctColor(myPct)}, ${pctColor(myPct)}88)`, borderRadius: 5 }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            <span>█ Your Score</span>
            <span>│ Class Average</span>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
