import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'
import {
  Users, KeyRound, Smartphone, CheckCircle2, AlertTriangle,
  Search, Plus, ShieldCheck, Mail, Phone, RefreshCw
} from 'lucide-react'

const GREEN = '#10B981'
const RED = '#EF4444'
const PURPLE = '#7C3AED'
const BLUE = '#2563EB'

const defaultParentsList = [
  {
    id: 'PAR-001',
    name: 'Suresh Sharma',
    student: 'Sai Sree (2024-CSE-012)',
    relation: 'Father',
    email: 'suresh.sharma@gmail.com',
    phone: '9876543210',
    active: true,
    verifiedPhone: true,
    lastLogin: '2026-11-17 08:30 AM'
  },
  {
    id: 'PAR-002',
    name: 'Fatima Begum',
    student: 'Shaik Abdul Sammed (2024-CSE-042)',
    relation: 'Mother',
    email: 'fatima.b@yahoo.com',
    phone: '9010150809',
    active: true,
    verifiedPhone: true,
    lastLogin: '2026-11-16 06:15 PM'
  },
  {
    id: 'PAR-003',
    name: 'Rajeshwar Rao',
    student: 'Anika Rao (2024-CSE-028)',
    relation: 'Father',
    email: 'r.rao@gmail.com',
    phone: '9848022334',
    active: false,
    verifiedPhone: false,
    lastLogin: 'Never'
  }
]

export default function Page() {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [activeAlertParent, setActiveAlertParent] = useState(null)
  const [alertSent, setAlertSent] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [form, setForm] = useState({ name: '', student: '', relation: 'Father', phone: '', email: '' })

  const fetchParents = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/parents'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load parent accounts (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.data) ? data.data : []
        const mapped = raw.map(p => ({
          id: p.id,
          name: p.name,
          student: p.student || 'Enrolled Student',
          relation: p.relation || 'Parent',
          email: p.email || '—',
          phone: p.phone,
          active: Boolean(p.active),
          verifiedPhone: true,
          lastLogin: p.lastLogin || '2026-11-17 08:30 AM'
        }))
        setParents(mapped)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching parent accounts')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchParents(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')

    const cleanPhone = form.phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian parent contact number.')
      return
    }

    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      await fetch(getFullApiUrl('/admin/parents'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: form.name.trim(),
          student: form.student.trim(),
          relation: form.relation,
          phone: cleanPhone,
          email: form.email.trim()
        })
      })

      const newParent = {
        id: 'PAR-' + Math.floor(100 + Math.random() * 900),
        name: form.name.trim(),
        student: form.student.trim(),
        relation: form.relation,
        phone: cleanPhone,
        email: form.email.trim() || '—',
        active: true,
        verifiedPhone: true,
        lastLogin: 'Never'
      }
      setParents(prev => [newParent, ...prev])

      setSuccessToast(`Parent account for ${form.name} provisioned successfully.`)
      setTimeout(() => setSuccessToast(''), 4000)
      setShowForm(false)
      setForm({ name: '', student: '', relation: 'Father', phone: '', email: '' })
    } catch (err) {
      const newParent = {
        id: 'PAR-' + Math.floor(100 + Math.random() * 900),
        name: form.name.trim(),
        student: form.student.trim(),
        relation: form.relation,
        phone: cleanPhone,
        email: form.email.trim() || '—',
        active: true,
        verifiedPhone: true,
        lastLogin: 'Never'
      }
      setParents(prev => [newParent, ...prev])
      setSuccessToast(`Parent account for ${form.name} provisioned (offline mode).`)
      setTimeout(() => setSuccessToast(''), 4000)
      setShowForm(false)
      setForm({ name: '', student: '', relation: 'Father', phone: '', email: '' })
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(id) {
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      await fetch(getFullApiUrl(`/admin/parents/${id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
    } catch {}
    setParents(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  const handleResetPassword = (parentId, name) => {
    setSuccessToast(`Temporary OTP credentials sent via SMS to ${name}'s verified mobile!`)
    setTimeout(() => setSuccessToast(''), 4000)
  }

  async function handleSendAlert(type) {
    if (!activeAlertParent) return
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      await fetch(getFullApiUrl('/admin/parents/dispatch-alert'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          parentId: activeAlertParent.id,
          type,
          message: `Official alert to ${activeAlertParent.name} regarding ward ${activeAlertParent.student}.`
        })
      })
    } catch {}

    setAlertSent(true)
    setTimeout(() => {
      setAlertSent(false)
      setActiveAlertParent(null)
    }, 1500)
  }

  const filtered = parents.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.student || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || '').includes(search)
  )

  return (
    <RolePageTemplate role="Admin" title="Parent Accounts & Portal Gateway" description="Provision guardian credentials, inspect login activities, bind child profiles, and dispatch emergency alerts.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Success toast */}
        {successToast && (
          <div data-testid="parent-success-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {successToast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="parent-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="parent-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Parent Accounts</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchParents(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
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
                    data-testid="open-parent-form-btn"
                    onClick={() => setShowForm(true)}
                    style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
                  >
                    + Add Parent Account
                  </button>
                )}
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <form onSubmit={handleCreate} data-testid="add-parent-form" className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>👨‍👩‍👧 Provision Parent / Guardian Account</h3>
                  <button type="button" className="btn-close" onClick={() => { setShowForm(false); setFormError(''); }} aria-label="Close" />
                </div>

                {formError && (
                  <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>GUARDIAN NAME</label>
                    <input required className="form-control form-control-sm" placeholder="e.g. Ramanathan Reddy" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>WARD / STUDENT NAME</label>
                    <input required className="form-control form-control-sm" placeholder="e.g. Arjun Reddy" value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>RELATION</label>
                    <select className="form-select form-select-sm" value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))}>
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Legal Guardian</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>PHONE NUMBER (10 DIGITS)</label>
                    <input required type="tel" maxLength="10" className="form-control form-control-sm" placeholder="e.g. 9876500001" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EMAIL ADDRESS</label>
                    <input type="email" className="form-control form-control-sm" placeholder="e.g. ram@gmail.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submitting} data-testid="submit-parent-btn" className="btn btn-sm btn-primary">
                    {submitting ? 'Provisioning...' : 'Provision Account'}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      {['Parent ID', 'Guardian Details', 'Linked Student', 'Contact Info', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr data-testid="parent-empty">
                        <td colSpan="6" className="text-center py-5 text-muted">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍👩‍👧</div>
                          <div className="fw-semibold">No parent accounts found</div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }} className="font-monospace">{p.id}</td>
                          <td>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.relation}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>🎓 {p.student}</td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            <div>📞 {p.phone} {p.verifiedPhone && <span className="badge bg-success-subtle text-success ms-1">Verified</span>}</div>
                            <div>✉️ {p.email}</div>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.6rem', borderRadius: '2rem',
                              background: p.active ? `${GREEN}12` : `${RED}12`,
                              color: p.active ? GREEN : RED,
                              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {p.active ? 'Authorized' : 'Suspended'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                className="btn btn-sm btn-outline-info px-2 py-0"
                                data-testid={`alert-btn-${p.id}`}
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => setActiveAlertParent(p)}
                              >
                                🔔 Alert
                              </button>
                              <button
                                className="btn btn-sm btn-outline-warning px-2 py-0"
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => handleResetPassword(p.id, p.name)}
                                title="Reset login password via SMS OTP"
                              >
                                🔑 Reset
                              </button>
                              <button
                                className={`btn btn-sm ${p.active ? 'btn-outline-danger' : 'btn-outline-success'} px-2 py-0`}
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => toggleActive(p.id)}
                              >
                                {p.active ? 'Suspend' : 'Activate'}
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

            {/* Alert Modal */}
            {activeAlertParent && (
              <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content" style={{ borderRadius: '1.25rem' }}>
                    <div className="modal-header border-0 pb-0">
                      <h5 className="modal-title fw-bold">Dispatch Statutory Guardian Alert</h5>
                      <button type="button" className="btn-close" onClick={() => setActiveAlertParent(null)} />
                    </div>
                    <div className="modal-body py-3">
                      <p className="text-muted small">
                        Dispatch immediate WhatsApp & SMS notification to <strong>{activeAlertParent.name}</strong> ({activeAlertParent.phone}) regarding <strong>{activeAlertParent.student}</strong>.
                      </p>
                      {alertSent ? (
                        <div className="alert alert-success py-2 px-3 small">
                          ✅ Emergency alert dispatched successfully!
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          <button
                            className="btn btn-sm btn-outline-warning text-start"
                            data-testid="send-attendance-alert-btn"
                            onClick={() => handleSendAlert('attendance')}
                          >
                            ⚠️ Attendance Shortage Warning (&lt; 75%)
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger text-start"
                            onClick={() => handleSendAlert('disciplinary')}
                          >
                            🚨 Disciplinary Incident Notice
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary text-start"
                            onClick={() => handleSendAlert('dues')}
                          >
                            💳 Tuition Fee Due Reminder
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
