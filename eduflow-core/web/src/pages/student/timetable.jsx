import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const DAYS_MAP = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const todayIdx = new Date().getDay() - 1 // 0=Mon, 5=Sat; -1/6 for Sun

function getCurrentPeriod() {
  const now = new Date()
  const h = now.getHours(), m = now.getMinutes()
  const time = h * 60 + m
  const slots = [
    [510, 560], [560, 610], [610, 660], [675, 725], [725, 775], [820, 870], [870, 910], [910, 950]
  ]
  return slots.findIndex(([s, e]) => time >= s && time < e)
}

export default function Page() {
  const [timetableData, setTimetableData] = useState(null)
  const [section, setSection] = useState('MPC-A')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const currentPeriod = getCurrentPeriod()
  const isToday = (di) => di === todayIdx

  const fetchTimetable = async (sec = section, isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/v1/academics/timetable?section=${encodeURIComponent(sec)}`), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) {
        throw new Error(`Failed to load timetable (${res.status})`)
      }
      const data = await res.json()
      if (isMounted) {
        setTimetableData(data.timetable || null)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching timetable')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchTimetable(section, isMounted)
    return () => {
      isMounted = false
    }
  }, [section])

  const periods = timetableData?.periods || []
  const days = timetableData?.days || []
  const schedule = timetableData?.schedule || []
  const subjectColors = timetableData?.subjectColors || {}

  return (
    <RolePageTemplate role="Student" title="Class Timetable" description="Your weekly class schedule — Mon to Sat. Today's classes are highlighted.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Section Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Active Cohort: </span>
            <span style={{ fontWeight: 800, color: '#2563EB' }}>{section}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="section-select" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SECTION:</label>
            <select
              id="section-select"
              value={section}
              onChange={e => setSection(e.target.value)}
              className="form-select form-select-sm"
              style={{ width: 'auto', fontWeight: 600 }}
            >
              <option value="MPC-A">MPC-A</option>
              <option value="MPC-B">MPC-B</option>
              <option value="BIPC-A">BIPC-A</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="timetable-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading weekly academic timetable from institutional scheduler...</p>
          </div>
        )}

        {/* Error State */}
        {loadError && !loading && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <div>
              <strong>Error:</strong> {loadError}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchTimetable(section, true)}>
              Retry
            </button>
          </div>
        )}

        {/* Today's Classes Quick View */}
        {!loading && !loadError && timetableData && todayIdx >= 0 && todayIdx <= 5 && schedule[todayIdx] && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem', borderLeft: '4px solid #2563EB' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#2563EB' }}>📅 Today — {DAYS_MAP[todayIdx]}</h2>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {schedule[todayIdx].map((sub, pi) => sub && (
                <div key={pi} style={{
                  padding: '0.5rem 0.875rem', borderRadius: '0.75rem',
                  background: `${subjectColors[sub] || '#2563EB'}15`, border: `1px solid ${subjectColors[sub] || '#2563EB'}35`,
                  color: subjectColors[sub] || '#2563EB', fontWeight: 700, fontSize: '0.8rem',
                  boxShadow: currentPeriod === pi ? `0 0 0 2px ${subjectColors[sub] || '#2563EB'}` : 'none',
                }}>
                  {currentPeriod === pi && <span style={{ marginRight: '0.35rem' }}>▶</span>}
                  {sub}
                  <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 500 }}>{periods[pi]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Timetable Grid */}
        {!loading && !loadError && timetableData && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Weekly Schedule — {section}</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px', padding: '0.75rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.6rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', width: 100 }}>Period</th>
                    {days.map((d, di) => (
                      <th key={d} style={{
                        padding: '0.6rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', borderRadius: '0.5rem',
                        background: isToday(di) ? '#2563EB15' : 'transparent',
                        color: isToday(di) ? '#2563EB' : '#64748b', textTransform: 'uppercase',
                      }}>
                        {d.slice(0, 3)} {isToday(di) && '✦'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period, pi) => (
                    <tr key={pi}>
                      <td style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, color: currentPeriod === pi ? '#2563EB' : '#94a3b8' }}>P{pi + 1}</div>
                        <div style={{ fontSize: '0.62rem' }}>{period}</div>
                      </td>
                      {days.map((_, di) => {
                        const sub = schedule[di] ? schedule[di][pi] : null
                        const color = sub ? subjectColors[sub] || '#2563EB' : null
                        const isCurrent = isToday(di) && currentPeriod === pi
                        return (
                          <td key={di} style={{ padding: '0.3rem', textAlign: 'center', verticalAlign: 'middle' }}>
                            {sub ? (
                              <div style={{
                                padding: '0.5rem 0.25rem', borderRadius: '0.625rem',
                                background: isCurrent ? color : `${color}18`,
                                color: isCurrent ? 'white' : color,
                                fontWeight: 700, fontSize: '0.72rem', minWidth: 70,
                                boxShadow: isCurrent ? `0 4px 12px ${color}50` : 'none',
                                border: isToday(di) ? `1px solid ${color}30` : '1px solid transparent',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                              }}>
                                {isCurrent && <div style={{ fontSize: '0.55rem', marginBottom: '0.15rem', opacity: 0.85 }}>▶ NOW</div>}
                                {sub}
                              </div>
                            ) : (
                              <div style={{ padding: '0.5rem', borderRadius: '0.625rem', background: 'var(--surface-bg)', color: '#cbd5e1', fontSize: '0.65rem', minWidth: 70 }}>—</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subject Color Legend */}
        {!loading && !loadError && timetableData && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1rem 1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.875rem' }}>Subject Legend</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {Object.entries(subjectColors).map(([sub, color]) => (
                <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', borderRadius: '2rem', background: `${color}15`, border: `1px solid ${color}30` }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color }}>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
