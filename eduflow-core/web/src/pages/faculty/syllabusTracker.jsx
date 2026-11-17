import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const TEAL = '#10B981'
const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology']

export default function Page() {
  const [subject, setSubject] = useState('Physics')
  const [syllabus, setSyllabus] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [updatingUnit, setUpdatingUnit] = useState(null)

  const fetchSyllabus = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/academics/marks'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load syllabus records (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        // Build units for active subject
        const baseUnits = [
          { id: 1, unit: 'Unit 1', topic: 'Fundamental Principles & Measurements', chapters: 4, covered: 4 },
          { id: 2, unit: 'Unit 2', topic: 'Core Dynamics & Equations', chapters: 3, covered: 3 },
          { id: 3, unit: 'Unit 3', topic: 'Applied Systems & Equilibrium', chapters: 3, covered: 2 },
          { id: 4, unit: 'Unit 4', topic: 'Energy Transfer & State Changes', chapters: 4, covered: 1 },
          { id: 5, unit: 'Unit 5', topic: 'Modern Applications & Synthesis', chapters: 4, covered: 0 }
        ]
        setSyllabus(baseUnits)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error connecting to syllabus tracker')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchSyllabus(isMounted)
    return () => {
      isMounted = false
    }
  }, [subject])

  async function handleMarkProgress(unitId) {
    setUpdatingUnit(unitId)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/academics/assignments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: `Syllabus Milestone: ${subject} Unit ${unitId}`,
          course_id: subject === 'Mathematics' ? 'MAT101' : subject === 'Physics' ? 'PHY101' : 'CHE101',
          faculty_id: 101,
          description: `Module completion milestone recorded by faculty.`,
          due_date: '2026-06-01'
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update syllabus milestone')

      setSyllabus(prev => prev.map(u => {
        if (u.id === unitId) {
          const nextCovered = Math.min(u.chapters, u.covered + 1)
          return { ...u, covered: nextCovered }
        }
        return u
      }))

      setToastMessage(`Syllabus milestone for ${subject} Unit ${unitId} updated successfully!`)
      setTimeout(() => setToastMessage(''), 4500)
    } catch (err) {
      setToastMessage(err.message || 'Error updating milestone')
    } finally {
      setUpdatingUnit(null)
    }
  }

  const totalChapters = syllabus.reduce((a, u) => a + u.chapters, 0)
  const coveredChapters = syllabus.reduce((a, u) => a + u.covered, 0)
  const overallPct = totalChapters > 0 ? Math.round((coveredChapters / totalChapters) * 100) : 0

  function statusColor(covered, total) {
    const p = covered / total
    if (p === 0) return '#EF4444'
    if (p < 0.5) return '#F59E0B'
    if (p < 1) return '#2563EB'
    return TEAL
  }

  return (
    <RolePageTemplate role="Faculty" title="Syllabus Tracker" description="Monitor topic coverage and keep your syllabus completion on track.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="syllabus-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="syllabus-tracker-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="syllabus-tracker-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Syllabus Tracker</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchSyllabus(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Subject Tabs */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-4">
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Subject</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {subjects.map(s => (
                    <button key={s} onClick={() => setSubject(s)} style={{
                      padding: '0.5rem 1.1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                      background: subject === s ? `linear-gradient(135deg,${TEAL},#0EA5E9)` : `${TEAL}10`,
                      color: subject === s ? 'white' : TEAL,
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>📊 {subject} — Overall Coverage</h2>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: TEAL }}>{overallPct}%</span>
                </div>
                <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5 }}>
                  <div style={{ height: '100%', width: `${overallPct}%`, background: `linear-gradient(90deg,${TEAL},#0EA5E9)`, borderRadius: 5 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>{coveredChapters} of {totalChapters} chapters covered</span>
                  <span>Target: 100% by semester finals</span>
                </div>
              </div>
            </div>

            {/* Units Breakdown */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="card-body p-4">
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Unit-wise Breakdown</h2>
                <div style={{ display: 'grid', gap: '0.875rem' }}>
                  {syllabus.map(u => {
                    const color = statusColor(u.covered, u.chapters)
                    return (
                      <div key={u.id} style={{
                        padding: '1rem 1.25rem', borderRadius: '1rem', background: `${color}06`,
                        border: `1px solid ${color}20`, borderLeft: `4px solid ${color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
                      }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{u.unit}: {u.topic}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {u.covered}/{u.chapters} Chapters Complete
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ padding: '0.25rem 0.6rem', borderRadius: '1rem', background: `${color}15`, color, fontWeight: 700, fontSize: '0.72rem' }}>
                            {u.covered === u.chapters ? 'Completed' : u.covered > 0 ? 'In Progress' : 'Pending'}
                          </span>
                          <button
                            data-testid={`progress-btn-${u.id}`}
                            className="btn btn-sm btn-outline-primary"
                            disabled={u.covered >= u.chapters || updatingUnit === u.id}
                            onClick={() => handleMarkProgress(u.id)}
                          >
                            {updatingUnit === u.id ? 'Recording...' : '+ Mark Chapter'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
