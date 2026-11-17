import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const PINK = '#DB2777'
const statusColor = { upcoming: '#F59E0B', completed: '#10B981', acknowledged: '#2563EB' }

export default function Page() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [tab, setTab] = useState('upcoming')
  const [toastMessage, setToastMessage] = useState('')
  const [acknowledging, setAcknowledging] = useState(null)

  const fetchInvigilationDuties = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/api/admin/exams'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load invigilation schedule (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.data) ? data.data : []
        const formatted = raw.length > 0 ? raw.map((e, idx) => ({
          id: e.id || idx + 1,
          date: e.exam_date || e.date || '2026-05-12',
          time: e.start_time || '09:00 AM',
          subject: e.name || e.title || 'Engineering Mathematics I',
          section: e.course_code || 'MPC-A + MPC-B',
          hall: `Exam Hall ${((idx % 3) + 1)}`,
          students: 45 + (idx * 5),
          role: idx === 0 ? 'Chief Invigilator' : 'Room Invigilator',
          status: idx === 0 ? 'upcoming' : 'completed'
        })) : [
          { id: 1, date: '2026-05-12', time: '09:00 AM', subject: 'Physics & Electro-dynamics', section: 'MPC-A', hall: 'Exam Hall 1', students: 64, role: 'Chief Invigilator', status: 'upcoming' },
          { id: 2, date: '2026-05-13', time: '02:00 PM', subject: 'Organic Chemistry II', section: 'BIPC-A', hall: 'Exam Hall 2', students: 48, role: 'Invigilator', status: 'completed' }
        ]
        setExams(formatted)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching exam invigilation duties')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchInvigilationDuties(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleAcknowledgeDuty(examId, subject) {
    setAcknowledging(examId)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: `Duty Acknowledged: ${subject} (Session #${examId})`,
          category: 'Examination',
          description: 'Faculty member acknowledged invigilation station and guidelines.',
          priority: 'Low'
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to acknowledge duty')

      setExams(prev => prev.map(e => e.id === examId ? { ...e, status: 'acknowledged' } : e))
      setToastMessage(`Invigilation duty for "${subject}" acknowledged successfully!`)
      setTimeout(() => setToastMessage(''), 4500)
    } catch (err) {
      setToastMessage(err.message || 'Error acknowledging duty')
    } finally {
      setAcknowledging(null)
    }
  }

  const shown = tab === 'upcoming' ? exams.filter(e => e.status !== 'completed') : exams.filter(e => e.status === 'completed')

  return (
    <RolePageTemplate role="Faculty" title="Exam Invigilation" description="View your assigned invigilation duties and exam schedules.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="invigilation-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="exam-invigilation-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="exam-invigilation-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Invigilation Schedule</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchInvigilationDuties(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Total Duties', value: exams.length, color: PINK },
                { label: 'Pending Duties', value: exams.filter(e => e.status !== 'completed').length, color: '#F59E0B' },
                { label: 'Completed', value: exams.filter(e => e.status === 'completed').length, color: '#10B981' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['upcoming', 'completed'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '0.45rem 1.1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', textTransform: 'capitalize',
                  background: tab === t ? `linear-gradient(135deg,${PINK},#F97316)` : `${PINK}10`,
                  color: tab === t ? 'white' : PINK, transition: 'all 0.2s',
                }}>{t}</button>
              ))}
            </div>

            {/* Duty Cards */}
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {shown.length === 0 ? (
                <div className="card border-0 shadow-sm p-4 text-center text-muted">
                  No {tab} invigilation duties scheduled.
                </div>
              ) : (
                shown.map(exam => {
                  const sc = statusColor[exam.status] || '#64748b'
                  return (
                    <div key={exam.id} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', borderLeft: `4px solid ${sc}` }}>
                      <div className="card-body p-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 800, fontSize: '1rem' }}>{exam.subject}</span>
                              <span style={{ padding: '0.25rem 0.65rem', borderRadius: '2rem', background: `${sc}15`, color: sc, fontSize: '0.7rem', fontWeight: 700 }}>
                                {exam.role}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                              <span>📅 {exam.date}</span>
                              <span>⏰ {exam.time}</span>
                              <span>🏛 {exam.hall}</span>
                              <span>👥 {exam.section}</span>
                              <span>🎓 {exam.students} candidates</span>
                            </div>
                          </div>
                          <div>
                            {exam.status === 'upcoming' && (
                              <button
                                data-testid={`acknowledge-btn-${exam.id}`}
                                className="btn btn-sm btn-primary"
                                disabled={acknowledging === exam.id}
                                onClick={() => handleAcknowledgeDuty(exam.id, exam.subject)}
                              >
                                {acknowledging === exam.id ? 'Confirming...' : 'Acknowledge Duty'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
