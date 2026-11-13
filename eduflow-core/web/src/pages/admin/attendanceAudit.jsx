import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const GREEN = '#10B981'
const RED = '#EF4444'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'

const auditData = [
  { id: 1, section: 'MPC-A', subject: 'Mathematics I', faculty: 'Dr. K. Srinivas', date: '2026-07-28', present: 58, total: 60, status: 'verified' },
  { id: 2, section: 'MPC-B', subject: 'Physics I', faculty: 'Prof. Ananya Roy', date: '2026-07-28', present: 32, total: 58, status: 'low-attendance-flag' },
  { id: 3, section: 'BIPC-A', subject: 'Biology', faculty: 'Dr. B. Prasad', date: '2026-07-28', present: 52, total: 55, status: 'verified' },
  { id: 4, section: 'MBIPC-A', subject: 'Chemistry', faculty: 'Dr. M. Venkat', date: '2026-07-28', present: 28, total: 50, status: 'low-attendance-flag' },
  { id: 5, section: 'MPC-A', subject: 'English', faculty: 'Mrs. Sunita Rao', date: '2026-07-27', present: 56, total: 60, status: 'verified' },
]

export default function Page() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [alertDispatched, setAlertDispatched] = useState(null)

  const filtered = auditData.filter(d => {
    const matchesFilter = filter === 'all' ? true : filter === 'regular' ? d.status === 'verified' : d.status.includes('low')
    const matchesSearch = d.section.toLowerCase().includes(search.toLowerCase()) ||
                          d.subject.toLowerCase().includes(search.toLowerCase()) ||
                          d.faculty.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Broken Rule Fix: Safeguard against total === 0 division by zero
  const getRate = (present, total) => {
    if (!total || total <= 0) return 0
    return Math.round((present / total) * 100)
  }

  function handleExportShortageCsv() {
    const headers = ['Section', 'Subject', 'Faculty', 'Date', 'Present', 'Total', 'Attendance Rate (%)', 'Audit Status']
    const rows = filtered.map(a => [a.section, `"${a.subject}"`, `"${a.faculty}"`, a.date, a.present, a.total, getRate(a.present, a.total), a.status])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Attendance_Shortage_Audit_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleDispatchNotice(id) {
    setAlertDispatched(id)
    setTimeout(() => setAlertDispatched(null), 2500)
  }

  const discrepancyCount = auditData.filter(d => d.status.includes('low')).length

  return (
    <RolePageTemplate role="Admin" title="Attendance Audit & Condonation" description="Audit faculty classroom biometric registers, inspect UGC 75% thresholds, and flag proxy submissions.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Dynamic counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Audited Lectures', value: auditData.length, color: PURPLE, icon: '📋' },
            { label: 'Verified Regular', value: auditData.filter(d => d.status === 'verified').length, color: GREEN, icon: '✅' },
            { label: 'Shortage Discrepancies', value: discrepancyCount, color: RED, icon: '🚨' },
            { label: 'UGC Benchmark', value: '75%', color: BLUE, icon: '🏛️' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2 flex-grow-1 flex-wrap" style={{ maxWidth: '600px' }}>
              <div className="input-group input-group-sm flex-grow-1" style={{ minWidth: '220px' }}>
                <span className="input-group-text bg-transparent border-end-0">🔍</span>
                <input
                  className="form-control border-start-0"
                  placeholder="Search section, subject, faculty..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['all', 'regular', 'discrepancy'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '2rem',
                      border: `1.5px solid ${filter === f ? PURPLE : 'var(--border-color)'}`,
                      background: filter === f ? `${PURPLE}15` : 'var(--card-bg)',
                      color: filter === f ? PURPLE : '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {f === 'discrepancy' ? '🚨 Discrepancies Only' : `${f} logs`}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
              onClick={handleExportShortageCsv}
            >
              📥 Export Audit CSV
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Audited Classroom Records</h2>
            <span className="badge bg-light text-dark border">{filtered.length} lecture registers</span>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['Section', 'Subject', 'Faculty', 'Date', 'Attendance Rate', 'UGC Audit Status', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No attendance audit records match your query</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(audit => {
                    const rate = getRate(audit.present, audit.total)
                    const isLow = audit.status.includes('low') || rate < 75
                    return (
                      <tr key={audit.id}>
                        <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{audit.section}</td>
                        <td style={{ fontSize: '0.875rem', fontWeight: 600 }}>{audit.subject}</td>
                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{audit.faculty}</td>
                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{audit.date}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: rate < 75 ? RED : 'var(--app-text)' }}>{audit.present}/{audit.total}</span>
                            <span style={{ fontSize: '0.75rem', color: rate < 75 ? RED : '#94a3b8', fontWeight: rate < 75 ? 700 : 400 }}>({rate}%)</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '2rem',
                            background: isLow ? `${RED}12` : `${GREEN}12`,
                            color: isLow ? RED : GREEN,
                            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                          }}>
                            {isLow ? '🚨 SHORTAGE (< 75%)' : '✓ UGC COMPLIANT'}
                          </span>
                        </td>
                        <td>
                          {isLow ? (
                            <button
                              type="button"
                              className={`btn btn-sm ${alertDispatched === audit.id ? 'btn-success' : 'btn-outline-danger'} py-0 px-2`}
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => handleDispatchNotice(audit.id)}
                            >
                              {alertDispatched === audit.id ? '✓ Sent' : '💬 Send Alert'}
                            </button>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </RolePageTemplate>
  )
}
