import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const PURPLE = '#7C3AED'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const BLUE = '#2563EB'
const RED = '#EF4444'

const initialApplicants = [
  { id: 'APP-1021', name: 'Karthik Raja', stream: 'MPC', score: 94, stage: 'admitted', date: '2026-06-12' },
  { id: 'APP-1022', name: 'Manasa Reddy', stream: 'BIPC', score: 88, stage: 'interview', date: '2026-06-14' },
  { id: 'APP-1023', name: 'Suresh Babu', stream: 'MBIPC', score: 76, stage: 'document_verification', date: '2026-06-15' },
  { id: 'APP-1024', name: 'Divya Sree', stream: 'MPC', score: 65, stage: 'applied', date: '2026-06-18' },
  { id: 'APP-1025', name: 'Arjun Das', stream: 'BIPC', score: 92, stage: 'admitted', date: '2026-06-20' },
]

const stageSequence = ['applied', 'document_verification', 'interview', 'admitted']

const stageColor = {
  applied: BLUE,
  document_verification: PURPLE,
  interview: AMBER,
  admitted: GREEN,
  rejected: RED,
  on_hold: '#64748b',
}

export default function Page() {
  const [applicants, setApplicants] = useState(initialApplicants)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  function advanceStage(id) {
    setApplicants(prev => prev.map(a => {
      if (a.id !== id) return a
      const idx = stageSequence.indexOf(a.stage)
      if (idx !== -1 && idx < stageSequence.length - 1) {
        return { ...a, stage: stageSequence[idx + 1] }
      }
      return a
    }))
  }

  function rejectApplicant(id) {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, stage: 'rejected' } : a))
  }

  function holdApplicant(id) {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, stage: 'on_hold' } : a))
  }

  const filtered = applicants.filter(a => {
    const matchesFilter = filter === 'all' || a.stage === filter
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.id.toLowerCase().includes(search.toLowerCase()) ||
                          a.stream.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <RolePageTemplate role="Admin" title="Admissions Pipeline & Counselling" description="Track multi-stage candidate conversion, verify qualifying marks, and advance applicants through enrolment.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Dynamic counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Total Applications', value: applicants.length, color: PURPLE, icon: '📥' },
            { label: 'Document Review', value: applicants.filter(a => a.stage === 'document_verification').length, color: BLUE, icon: '📄' },
            { label: 'Counselling / Viva', value: applicants.filter(a => a.stage === 'interview').length, color: AMBER, icon: '🎙️' },
            { label: 'Enrolled & Paid', value: applicants.filter(a => a.stage === 'admitted').length, color: GREEN, icon: '🎓' },
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
            <div className="d-flex align-items-center gap-2 flex-grow-1 flex-wrap" style={{ maxWidth: '650px' }}>
              <div className="input-group input-group-sm flex-grow-1" style={{ minWidth: '220px' }}>
                <span className="input-group-text bg-transparent border-end-0">🔍</span>
                <input
                  className="form-control border-start-0"
                  placeholder="Search applicant name, ID, stream..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {['all', 'applied', 'document_verification', 'interview', 'admitted', 'rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '2rem',
                      border: `1.5px solid ${filter === f ? PURPLE : 'var(--border-color)'}`,
                      background: filter === f ? `${PURPLE}15` : 'var(--card-bg)',
                      color: filter === f ? PURPLE : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {f.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Candidate Evaluation Queue</h2>
            <span className="badge bg-light text-dark border">{filtered.length} candidates</span>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['App ID', 'Candidate Name', 'Stream', 'Merit Score', 'Counselling Stage', 'Date', 'Stage Actions'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No applicants match your criteria</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 700 }}>{app.id}</td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{app.name}</td>
                      <td><span className="badge text-bg-primary">{app.stream}</span></td>
                      <td style={{ fontWeight: 700 }}>{app.score}%</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '2rem',
                          background: `${stageColor[app.stage] || '#64748b'}15`,
                          color: stageColor[app.stage] || '#64748b',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {app.stage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{app.date}</td>
                      <td>
                        {app.stage === 'admitted' ? (
                          <span style={{ fontSize: '0.75rem', color: GREEN, fontWeight: 700 }}>✅ Enrolled &amp; Seat Allocated</span>
                        ) : app.stage === 'rejected' ? (
                          <span style={{ fontSize: '0.75rem', color: RED, fontWeight: 700 }}>⛔ Application Rejected</span>
                        ) : (
                          <div className="d-flex align-items-center gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary py-0 px-2"
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => advanceStage(app.id)}
                            >
                              Advance ➡️
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary py-0 px-1"
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => holdApplicant(app.id)}
                              title="Put application on hold"
                            >
                              Hold ⏸️
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger py-0 px-1"
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => rejectApplicant(app.id)}
                              title="Reject application"
                            >
                              Reject ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </RolePageTemplate>
  )
}
