import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { STUDENT } from '../../utils/studentMockData'

const PURPLE = '#7C3AED'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const BLUE = '#2563EB'

const initialStudents = [
  { id: 'S001', name: STUDENT.name, roll: STUDENT.roll, section: STUDENT.section, stream: 'MPC', year: STUDENT.year, contact: STUDENT.bus.phone },
  { id: 'S002', name: 'Priya Singh', roll: '2024BIPC012', section: 'BIPC-A', stream: 'BIPC', year: 2, contact: '9876543233' },
  { id: 'S003', name: 'Sneha Patel', roll: '2024BIPC005', section: 'BIPC-B', stream: 'BIPC', year: 2, contact: '9876543234' },
  { id: 'S004', name: 'Kavya Naidu', roll: '2024MBIPC03', section: 'MBIPC-A', stream: 'MBIPC', year: 1, contact: '9876543235' },
  { id: 'S005', name: 'Rahul Varma', roll: '2024MPC009', section: 'MPC-A', stream: 'MPC', year: 2, contact: '9876543236' },
]

export default function Page() {
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState('')
  const [streamFilter, setStreamFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ name: '', roll: '', section: 'MPC-A', stream: 'MPC', year: 1, contact: '' })

  function handleCreate(e) {
    e.preventDefault()
    setFormError('')

    // Broken Rule Fix 1: Validate 10-digit Indian phone number
    const cleanPhone = form.contact.replace(/\D/g, '')
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian parent contact number starting with 6, 7, 8, or 9.')
      return
    }

    // Broken Rule Fix 2: Check duplicate roll number
    if (students.some(s => s.roll.trim().toUpperCase() === form.roll.trim().toUpperCase())) {
      setFormError(`Roll number ${form.roll.toUpperCase()} is already assigned to an enrolled student.`)
      return
    }

    setStudents(prev => [...prev, { ...form, contact: cleanPhone, id: `S00${prev.length + 1}` }])
    setShowForm(false)
    setForm({ name: '', roll: '', section: 'MPC-A', stream: 'MPC', year: 1, contact: '' })
  }

  function handleDelete(id) {
    setStudents(prev => prev.filter(s => s.id !== id))
    setConfirmDeleteId(null)
  }

  function handleExportCsv() {
    const headers = ['Student ID', 'Full Name', 'Roll Number', 'Section', 'Stream', 'Year', 'Parent Contact']
    const rows = filtered.map(s => [s.id, `"${s.name}"`, s.roll, s.section, s.stream, s.year, s.contact])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Students_Directory_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.roll.toLowerCase().includes(search.toLowerCase()) ||
                          s.contact.includes(search)
    const matchesStream = streamFilter === 'ALL' || s.stream === streamFilter
    return matchesSearch && matchesStream
  })

  return (
    <RolePageTemplate role="Admin" title="Student Management" description="Register new students, assign streams, group classrooms, and maintain directories.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Dynamic counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Total Enrollment', value: students.length, color: PURPLE, icon: '👨‍🎓' },
            { label: 'MPC Stream', value: students.filter(s => s.stream === 'MPC').length, color: BLUE, icon: '📐' },
            { label: 'BIPC Stream', value: students.filter(s => s.stream === 'BIPC').length, color: GREEN, icon: '🌿' },
            { label: 'MBIPC Stream', value: students.filter(s => s.stream === 'MBIPC').length, color: AMBER, icon: '🔬' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Directory Controls */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2 flex-grow-1 flex-wrap" style={{ maxWidth: '600px' }}>
              <div className="input-group input-group-sm flex-grow-1" style={{ minWidth: '220px' }}>
                <span className="input-group-text bg-transparent border-end-0">🔍</span>
                <input
                  className="form-control border-start-0"
                  placeholder="Search name, roll, phone..."
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
                style={{ width: 'auto', minWidth: '130px' }}
                value={streamFilter}
                onChange={e => setStreamFilter(e.target.value)}
              >
                <option value="ALL">All Streams</option>
                <option value="MPC">MPC Stream</option>
                <option value="BIPC">BIPC Stream</option>
                <option value="MBIPC">MBIPC Stream</option>
              </select>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
                onClick={handleExportCsv}
              >
                📥 Export CSV
              </button>
              {!showForm && (
                <button
                  className="btn btn-sm btn-primary shadow-sm"
                  onClick={() => setShowForm(true)}
                  style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
                >
                  + Enroll Student
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enroll form */}
        {showForm && (
          <form onSubmit={handleCreate} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>👨‍🎓 Enroll New Student Profile</h3>
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
                <input required className="form-control form-control-sm" placeholder="e.g. Harsha Vardhan" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ROLL NUMBER</label>
                <input required className="form-control form-control-sm" placeholder="e.g. 2024MPC030" value={form.roll} onChange={e => setForm(p => ({ ...p, roll: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SECTION CODE</label>
                <input required className="form-control form-control-sm" placeholder="e.g. MPC-B" value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ACADEMIC STREAM</label>
                <select className="form-select form-select-sm" value={form.stream} onChange={e => setForm(p => ({ ...p, stream: e.target.value }))}>
                  <option>MPC</option>
                  <option>BIPC</option>
                  <option>MBIPC</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ACADEMIC YEAR</label>
                <input type="number" min="1" max="4" className="form-control form-control-sm" value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>PARENT CONTACT PHONE (10 DIGITS)</label>
                <input required type="tel" maxLength="10" className="form-control form-control-sm" placeholder="e.g. 9876543236" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-sm btn-primary">Enroll Student</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Directory table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['Student ID', 'Full Name', 'Roll Number', 'Section', 'Stream', 'Year', 'Parent Contact', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No students found</div>
                      <div className="small">Try adjusting your search query or stream filter.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{s.id}</td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{s.name}</td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 600, color: BLUE }}>{s.roll}</td>
                      <td><span className="badge text-bg-light" style={{ border: '1px solid var(--border-color)' }}>{s.section}</span></td>
                      <td><span className="badge text-bg-secondary">{s.stream}</span></td>
                      <td style={{ fontWeight: 700 }}>Year {s.year}</td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>📞 {s.contact}</td>
                      <td>
                        {confirmDeleteId === s.id ? (
                          <div className="d-flex align-items-center gap-1">
                            <button className="btn btn-sm btn-danger px-2 py-0" onClick={() => handleDelete(s.id)} style={{ fontSize: '0.7rem' }}>
                              Confirm
                            </button>
                            <button className="btn btn-sm btn-secondary px-2 py-0" onClick={() => setConfirmDeleteId(null)} style={{ fontSize: '0.7rem' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setConfirmDeleteId(s.id)}
                            style={{ fontSize: '0.72rem' }}
                            title="Dismiss student profile"
                          >
                            Dismiss 🗑️
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

      </div>
    </RolePageTemplate>
  )
}
