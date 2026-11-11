import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { STUDENT } from '../../utils/studentMockData'

const GREEN = '#10B981'
const RED = '#EF4444'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'

const initialParents = [
  { id: 'PAR001', name: 'Ramanathan Reddy', student: 'Arjun Reddy', relation: 'Father', email: 'ram@gmail.com', phone: '9876500001', active: true, lastLogin: '2026-06-01 08:30 AM' },
  { id: 'PAR002', name: 'Devendra Singh', student: 'Priya Singh', relation: 'Father', email: 'dev@gmail.com', phone: '9876500002', active: true, lastLogin: '2026-05-31 06:12 PM' },
  { id: 'PAR003', name: 'Meenakshi Iyer', student: 'Meera Iyer', relation: 'Mother', email: 'meena@gmail.com', phone: '9876500003', active: true, lastLogin: '2026-05-30 11:22 AM' },
  { id: 'PAR004', name: 'Satish Patel', student: 'Sneha Patel', relation: 'Father', email: 'satish@gmail.com', phone: '9876500004', active: false, lastLogin: '—' },
]

export default function Page() {
  const [parents, setParents] = useState(initialParents)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [activeAlertParent, setActiveAlertParent] = useState(null)
  const [alertSent, setAlertSent] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ name: '', student: '', relation: 'Father', phone: '', email: '' })

  function handleCreate(e) {
    e.preventDefault()
    setFormError('')

    // Broken Rule Fix: 10-digit phone
    const cleanPhone = form.phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian parent contact number.')
      return
    }

    setParents(prev => [...prev, { ...form, phone: cleanPhone, lastLogin: 'Just now', active: true, id: `PAR0${prev.length + 1}` }])
    setShowForm(false)
    setForm({ name: '', student: '', relation: 'Father', phone: '', email: '' })
  }

  function toggleActive(id) {
    setParents(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  function handleSendAlert(type) {
    setAlertSent(true)
    setTimeout(() => {
      setAlertSent(false)
      setActiveAlertParent(null)
    }, 1500)
  }

  const filtered = parents.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.student.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search))

  return (
    <RolePageTemplate role="Admin" title="Parent Accounts & Portal Gateway" description="Provision guardian credentials, inspect login activities, bind child profiles, and dispatch emergency alerts.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Dynamic counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Registered Parents', value: parents.length, color: PURPLE, icon: '👨‍👩‍👧' },
            { label: 'Authorized Active', value: parents.filter(p => p.active).length, color: GREEN, icon: '🟢' },
            { label: 'Access Suspended', value: parents.filter(p => !p.active).length, color: RED, icon: '⛔' },
            { label: 'Child Profiles Linked', value: parents.length, color: BLUE, icon: '🔗' },
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
            <div className="input-group input-group-sm" style={{ maxWidth: '400px' }}>
              <span className="input-group-text bg-transparent border-end-0">🔍</span>
              <input
                className="form-control border-start-0"
                placeholder="Search guardian, student, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                  ✕
                </button>
              )}
            </div>
            {!showForm && (
              <button
                className="btn btn-sm btn-primary shadow-sm"
                onClick={() => setShowForm(true)}
                style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
              >
                + Add Parent Account
              </button>
            )}
          </div>
        </div>

        {/* Link form */}
        {showForm && (
          <form onSubmit={handleCreate} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>👨‍👩‍👧 Link New Parent Profile</h3>
              <button type="button" className="btn-close" onClick={() => { setShowForm(false); setFormError(''); }} aria-label="Close" />
            </div>

            {formError && (
              <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>PARENT / GUARDIAN NAME</label>
                <input required className="form-control form-control-sm" placeholder="e.g. Satish Patel" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>CHILD NAME</label>
                <input required className="form-control form-control-sm" placeholder="e.g. Vikramaditya Rao" value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>RELATIONSHIP</label>
                <select className="form-select form-select-sm" value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))}>
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Legal Guardian</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EMAIL ADDRESS</label>
                <input required type="email" className="form-control form-control-sm" placeholder="e.g. satish@gmail.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>MOBILE PHONE (10 DIGITS)</label>
                <input required type="tel" maxLength="10" className="form-control form-control-sm" placeholder="e.g. 9876500004" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-sm btn-primary">Link Account</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Parent table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Authorized Guardian Roster</h2>
            <span className="badge bg-light text-dark border">{filtered.length} guardians</span>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['Parent ID', 'Guardian Name', 'Child Linked', 'Relation', 'Contact Details', 'Last Login', 'Portal Access', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No parent accounts match your query</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{p.id}</td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.name}</td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 600 }}>{p.student}</td>
                      <td><span className="badge text-bg-light" style={{ border: '1px solid var(--border-color)' }}>{p.relation}</span></td>
                      <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        ✉️ {p.email} <br /> 📞 {p.phone}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{p.lastLogin}</td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '2rem',
                          background: p.active ? `${GREEN}12` : `${RED}12`,
                          color: p.active ? GREEN : RED,
                          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {p.active ? 'Authorized' : 'Blocked'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            className={`btn btn-sm ${p.active ? 'btn-outline-danger' : 'btn-outline-success'} py-0 px-2`}
                            onClick={() => toggleActive(p.id)}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {p.active ? 'Revoke' : 'Authorize'}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary py-0 px-2"
                            onClick={() => setActiveAlertParent(p)}
                            style={{ fontSize: '0.72rem' }}
                            title="Dispatch WhatsApp / SMS alert to parent"
                          >
                            💬 Alert
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Direct Alert Dispatch Modal */}
      {activeAlertParent && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--app-text, #0f172a)',
              borderRadius: '1rem',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '2px solid var(--border-color, #e2e8f0)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ margin: 0, fontWeight: 800 }}>💬 Send Parent Notice</h5>
              <button type="button" className="btn-close" onClick={() => setActiveAlertParent(null)} aria-label="Close" />
            </div>

            <p className="small text-muted mb-3">
              Dispatch an automated statutory alert to <b>{activeAlertParent.name}</b> (Guardian of {activeAlertParent.student}) via verified SMS &amp; WhatsApp gateway:
            </p>

            {alertSent ? (
              <div className="alert alert-success py-2 px-3 small text-center fw-bold" role="alert">
                ✓ Notice dispatched successfully to +91 {activeAlertParent.phone}!
              </div>
            ) : (
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm text-start p-2"
                  onClick={() => handleSendAlert('attendance')}
                >
                  <div className="fw-bold">📅 Attendance Warning Alert</div>
                  <div className="small text-muted">Notify that {activeAlertParent.student}&apos;s cumulative attendance is below statutory 75%.</div>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-warning btn-sm text-start p-2"
                  onClick={() => handleSendAlert('fee')}
                >
                  <div className="fw-bold">💳 Term Fee Due Reminder</div>
                  <div className="small text-muted">Send automated UPI payment link &amp; bursary receipt details.</div>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm text-start p-2"
                  onClick={() => handleSendAlert('exam')}
                >
                  <div className="fw-bold">📝 Midterm Report Released</div>
                  <div className="small text-muted">Invite parent to review digital marksheet on the parent portal.</div>
                </button>
              </div>
            )}

            <div className="text-end mt-3">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setActiveAlertParent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </RolePageTemplate>
  )
}
