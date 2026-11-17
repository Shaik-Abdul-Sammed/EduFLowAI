import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const GREEN = '#10B981'
const RED = '#EF4444'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'

export default function Page() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [confirmToggleId, setConfirmToggleId] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [form, setForm] = useState({
    name: '',
    subject: 'Mathematics',
    stream: 'MPC',
    email: '',
    phone: '',
    workloadHours: 16
  })

  const fetchFaculty = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/faculty'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load faculty roster (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.faculty) ? data.faculty : [])
        // Map backend department -> subject if needed
        const mapped = list.map(f => ({
          ...f,
          subject: f.subject || f.department || 'General',
          stream: f.stream || 'MPC/BIPC'
        }))
        setFaculty(mapped)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching faculty directory')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchFaculty(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    const cleanPhone = form.phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number for faculty.')
      setSubmitting(false)
      return
    }

    if (faculty.some(f => f.email.trim().toLowerCase() === form.email.trim().toLowerCase())) {
      setFormError(`Email ${form.email} is already registered with another faculty member.`)
      setSubmitting(false)
      return
    }

    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/faculty'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: form.name.trim(),
          department: form.subject,
          designation: 'Assistant Professor',
          email: form.email.trim(),
          phone: cleanPhone,
          workloadHours: Number(form.workloadHours) || 16,
          stream: form.stream
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || `Failed to recruit faculty (HTTP ${res.status})`)
      }

      setSuccessToast(`Educator profile "${form.name}" appointed successfully.`)
      setTimeout(() => setSuccessToast(''), 4000)
      setShowForm(false)
      setForm({ name: '', subject: 'Mathematics', stream: 'MPC', email: '', phone: '', workloadHours: 16 })
      await fetchFaculty(true)
    } catch (err) {
      setFormError(err.message || 'Error creating faculty record')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(id) {
    const target = faculty.find(f => f.id === id)
    if (!target) return

    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/admin/faculty/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ active: !target.active })
      })

      if (res.ok) {
        setFaculty(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f))
      }
    } catch {
      // Optimistic fallback
      setFaculty(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f))
    } finally {
      setConfirmToggleId(null)
    }
  }

  function handleExportCsv() {
    const headers = ['FAC ID', 'Faculty Name', 'Specialization', 'Stream', 'Email', 'Phone', 'Workload (Hrs/Wk)', 'Status']
    const rows = filtered.map(f => [f.id, `"${f.name}"`, f.subject, f.stream, f.email, f.phone, f.workloadHours || 0, f.active ? 'Active' : 'Suspended'])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Faculty_Roster_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = faculty.filter(f => {
    const matchesSearch = (f.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (f.subject || '').toLowerCase().includes(search.toLowerCase()) ||
                          (f.email || '').toLowerCase().includes(search.toLowerCase())
    const matchesSubject = subjectFilter === 'ALL' || f.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  return (
    <RolePageTemplate role="Admin" title="Faculty Management" description="Appoint new educators, manage departmental workloads, verify certifications, and schedule shifts.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Success toast */}
        {successToast && (
          <div data-testid="faculty-success-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {successToast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="faculty-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="faculty-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Faculty Directory</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchFaculty(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Total Faculty', value: faculty.length, color: PURPLE, icon: '👩‍🏫' },
                { label: 'Active on Duty', value: faculty.filter(f => f.active).length, color: GREEN, icon: '🟢' },
                { label: 'Suspended / Hold', value: faculty.filter(f => !f.active).length, color: RED, icon: '⏸️' },
                { label: 'Avg Workload', value: `${Math.round(faculty.reduce((a, b) => a + (b.workloadHours || 0), 0) / (faculty.length || 1))}h/wk`, color: BLUE, icon: '⏱️' },
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
                      placeholder="Search faculty name, email, subject..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                        ✕
                      </button>
                    )}
                  </div>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto', minWidth: '140px' }}
                    value={subjectFilter}
                    onChange={e => setSubjectFilter(e.target.value)}
                  >
                    <option value="ALL">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="English">English</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
                    onClick={handleExportCsv}
                  >
                    📥 Export Roster
                  </button>
                  {!showForm && (
                    <button
                      className="btn btn-sm btn-primary shadow-sm"
                      data-testid="open-recruit-btn"
                      onClick={() => setShowForm(true)}
                      style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
                    >
                      + Recruit Faculty
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recruit form */}
            {showForm && (
              <form onSubmit={handleCreate} data-testid="recruit-faculty-form" className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>👩‍🏫 Appoint Educator Profile</h3>
                  <button type="button" className="btn-close" onClick={() => { setShowForm(false); setFormError(''); }} aria-label="Close" />
                </div>

                {formError && (
                  <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>FULL NAME</label>
                    <input required className="form-control form-control-sm" placeholder="e.g. Dr. Harish Kumar" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SPECIALIZATION / DEPT</label>
                    <select className="form-select form-select-sm" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                      {['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>STREAM TARGETS</label>
                    <input required className="form-control form-control-sm" placeholder="e.g. MPC/MBIPC" value={form.stream} onChange={e => setForm(p => ({ ...p, stream: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EMAIL ADDRESS</label>
                    <input required type="email" className="form-control form-control-sm" placeholder="e.g. harish@eduflow.ac.in" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>MOBILE PHONE (10 DIGITS)</label>
                    <input required type="tel" maxLength="10" className="form-control form-control-sm" placeholder="e.g. 9876543220" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>WEEKLY WORKLOAD (HOURS)</label>
                    <input type="number" min="1" max="40" className="form-control form-control-sm" value={form.workloadHours} onChange={e => setForm(p => ({ ...p, workloadHours: Number(e.target.value) }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submitting} data-testid="submit-recruit-btn" className="btn btn-sm btn-primary">
                    {submitting ? 'Recruiting...' : 'Recruit Faculty'}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Faculty List Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['FAC ID', 'Faculty Name', 'Specialization', 'Streams', 'Workload', 'Contact Info', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr data-testid="faculty-empty">
                        <td colSpan="8" className="text-center py-5 text-muted">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                          <div className="fw-semibold">No faculty members found</div>
                          <div className="small">Try adjusting your search query or subject filter.</div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(fac => (
                        <tr key={fac.id}>
                          <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{fac.id}</td>
                          <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{fac.name}</td>
                          <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{fac.subject}</td>
                          <td><span className="badge text-bg-secondary">{fac.stream}</span></td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {fac.workloadHours || 16}h / week
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            ✉️ {fac.email} <br /> 📞 {fac.phone}
                          </td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.6rem', borderRadius: '2rem',
                              background: fac.active ? `${GREEN}12` : `${RED}12`,
                              color: fac.active ? GREEN : RED,
                              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {fac.active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td>
                            {confirmToggleId === fac.id ? (
                              <div className="d-flex align-items-center gap-1">
                                <button
                                  className="btn btn-sm btn-warning px-2 py-0"
                                  onClick={() => toggleActive(fac.id)}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary px-2 py-0"
                                  onClick={() => setConfirmToggleId(null)}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className={`btn btn-sm ${fac.active ? 'btn-outline-danger' : 'btn-outline-success'} px-2 py-0`}
                                onClick={() => setConfirmToggleId(fac.id)}
                                style={{ fontSize: '0.7rem' }}
                              >
                                {fac.active ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
