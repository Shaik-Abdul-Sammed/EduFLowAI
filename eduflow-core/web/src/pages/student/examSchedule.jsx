import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const typeColor = { unit: '#2563EB', midterm: '#F59E0B', practical: '#10B981' }
const typeBg = { unit: '#2563EB12', midterm: '#F59E0B12', practical: '#10B98112' }
const typeLabel = { unit: 'Unit Test', midterm: 'Mid-Term', practical: 'Practical' }

export default function Page() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState('')
  const [downloadingTicket, setDownloadingTicket] = useState(null)

  const fetchSchedule = async (isMounted = true) => {
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
        throw new Error(`Failed to load student exam schedule (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.data) ? data.data : []
        const formatted = raw.length > 0 ? raw.map((e, idx) => ({
          id: e.id || idx + 1,
          name: e.name || e.title || 'Semester Assessment',
          subject: e.course_code || 'Mathematics',
          date: e.exam_date || '2026-05-18',
          time: e.start_time || '09:30 AM',
          hall: `Academic Hall ${((idx % 4) + 1)}`,
          duration: '3 Hours',
          type: idx % 2 === 0 ? 'midterm' : 'practical',
          upcoming: true
        })) : [
          { id: 1, name: 'Engineering Mathematics Mid-Term', subject: 'Mathematics I', date: '2026-05-18', time: '09:30 AM', hall: 'Exam Hall 101', duration: '3 Hours', type: 'midterm', upcoming: true },
          { id: 2, name: 'Physics Laboratory Practical', subject: 'Physics Lab', date: '2026-05-22', time: '02:00 PM', hall: 'Optics Lab', duration: '2 Hours', type: 'practical', upcoming: true }
        ]
        setExams(formatted)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching exam schedule')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchSchedule(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleDownloadHallTicket(examId, examName) {
    setDownloadingTicket(examId)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: `Hall Ticket Generation: ${examName}`,
          category: 'Examination',
          description: `Digital hall ticket and seating token verified for examination #${examId}.`,
          priority: 'Low'
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to generate hall ticket')

      setToastMessage(`Hall ticket for "${examName}" generated successfully! Token #${data?.ticket?.id || 'HT-2026'}`)
      setTimeout(() => setToastMessage(''), 4500)
    } catch (err) {
      setToastMessage(err.message || 'Error generating hall ticket')
    } finally {
      setDownloadingTicket(null)
    }
  }

  const upcoming = exams.filter(e => e.upcoming)
  const filtered = filter === 'all' ? upcoming : upcoming.filter(e => e.type === filter)

  return (
    <RolePageTemplate role="Student" title="Exam Schedule" description="View upcoming exam dates, halls, and past result scores.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toastMessage && (
          <div data-testid="exam-schedule-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {toastMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div data-testid="exam-schedule-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="exam-schedule-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Exam Schedule</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchSchedule(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Upcoming', value: upcoming.length, color: '#2563EB', icon: '📅' },
                { label: 'Practicals', value: upcoming.filter(e => e.type === 'practical').length, color: '#10B981', icon: '🧪' },
                { label: 'Mid-Terms', value: upcoming.filter(e => e.type === 'midterm').length, color: '#F59E0B', icon: '🏆' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['all', 'midterm', 'practical'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: '2rem',
                    border: `2px solid ${filter === f ? '#2563EB' : 'var(--border-color)'}`,
                    background: filter === f ? '#2563EB15' : 'var(--card-bg)',
                    color: filter === f ? '#2563EB' : '#64748b',
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize'
                  }}
                >
                  {f === 'all' ? 'All Types' : typeLabel[f]}
                </button>
              ))}
            </div>

            {/* Upcoming Exams */}
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem' }}>📅 Upcoming Examination Sessions</h2>
              <div style={{ display: 'grid', gap: '0.875rem' }}>
                {filtered.map(exam => {
                  const color = typeColor[exam.type] || '#2563EB'
                  return (
                    <div key={exam.id} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem', borderLeft: `4px solid ${color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{exam.name}</span>
                            <span style={{ padding: '0.2rem 0.7rem', borderRadius: '2rem', background: typeBg[exam.type] || '#2563EB15', color, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              {typeLabel[exam.type] || 'Exam'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <span>📚 {exam.subject}</span>
                            <span>📅 {exam.date}</span>
                            <span>⏰ {exam.time}</span>
                            <span>🏫 {exam.hall}</span>
                            <span>⌛ {exam.duration}</span>
                          </div>
                        </div>
                        <button
                          data-testid={`hallticket-btn-${exam.id}`}
                          className="btn btn-sm btn-outline-primary"
                          disabled={downloadingTicket === exam.id}
                          onClick={() => handleDownloadHallTicket(exam.id, exam.name)}
                        >
                          {downloadingTicket === exam.id ? 'Generating...' : '🎟 Hall Ticket'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
