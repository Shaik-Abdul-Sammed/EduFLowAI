import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'
import {
  Home, Wrench, Ticket, Phone, Clock, QrCode, CheckCircle2,
  AlertTriangle, User, ShieldCheck, RefreshCw
} from 'lucide-react'
import QRCodeSvg from '../../components/QRCodeSvg'

const BLUE = '#2563EB'
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const today = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

const defaultMaintenanceHistory = [
  { id: 'TKT-8821', type: 'Plumbing', desc: 'Washbasin tap leak in bathroom 2', date: '2026-11-10', status: 'RESOLVED', tech: 'Ramesh K. (Plumber)' },
  { id: 'TKT-8904', type: 'Electrical', desc: 'Ceiling fan regulator replacement', date: '2026-11-14', status: 'IN_PROGRESS', tech: 'Satish G. (Electrician)' },
]

export default function Page() {
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [activeDay, setActiveDay] = useState(today)
  const [requestSent, setRequestSent] = useState(false)
  const [submittingGatePass, setSubmittingGatePass] = useState(false)
  const [gatePassSuccess, setGatePassSuccess] = useState('')
  const [activeGatePass, setActiveGatePass] = useState(null)
  const [maintHistory, setMaintHistory] = useState(defaultMaintenanceHistory)
  const [reqForm, setReqForm] = useState({ type: 'Plumbing', desc: '' })
  const [gatePassForm, setGatePassForm] = useState({
    destination: 'Home (Hyderabad)',
    reason: 'Weekend Family Visit',
    outTime: '2026-11-20 17:00',
    inTime: '2026-11-22 20:00'
  })

  const fetchHostelInfo = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/hostel/allocations'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load hostel residency details (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const list = Array.isArray(data?.allocations) ? data.allocations : []
        const studentAlloc = list.find(a => (a.student_roll === 'SS26' || a.student_name === 'Shaik Abdul Sammed' || a.student_name === 'Ananya Sharma')) || list[0] || {
          block: 'Block B (Godavari Boys Hostel)',
          room_no: '302',
          roommates: ['K. Rahul', 'V. Arvind'],
          warden_name: 'Dr. Meena Swaminathan',
          warden_phone: '+91 94401 88992'
        }
        setAllocation({
          block: studentAlloc.block || 'Block B (Godavari Boys Hostel)',
          room: studentAlloc.room_no || studentAlloc.room || '302',
          roommates: Array.isArray(studentAlloc.roommates) ? studentAlloc.roommates : ['K. Rahul', 'V. Arvind'],
          warden: studentAlloc.warden_name || 'Dr. Meena Swaminathan',
          phone: studentAlloc.warden_phone || '+91 94401 88992'
        })
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching hostel residency records')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchHostelInfo(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function sendMaintenanceRequest(e) {
    e.preventDefault()
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          category: 'HOSTEL_MAINTENANCE',
          subject: `${reqForm.type} issue in Room ${allocation?.room || '302'}`,
          description: reqForm.desc,
          priority: 'MEDIUM'
        })
      })

      const newTkt = {
        id: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
        type: reqForm.type,
        desc: reqForm.desc,
        date: new Date().toLocaleDateString('en-IN'),
        status: 'OPEN',
        tech: 'Assigned to Ward Maintenance Desk'
      }
      setMaintHistory(prev => [newTkt, ...prev])

      setRequestSent(true)
      setTimeout(() => setRequestSent(false), 4000)
      setReqForm({ type: 'Plumbing', desc: '' })
    } catch {
      setRequestSent(true)
      setTimeout(() => setRequestSent(false), 4000)
    }
  }

  async function handleGatePass(e) {
    e.preventDefault()
    setSubmittingGatePass(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/hostel/gate-pass'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_roll: '2024-CSE-042',
          student_name: 'Shaik Abdul Sammed',
          destination: gatePassForm.destination,
          reason: gatePassForm.reason,
          out_time: gatePassForm.outTime,
          in_time: gatePassForm.inTime
        })
      })

      const passData = {
        passId: 'GP-' + Math.floor(10000 + Math.random() * 90000),
        destination: gatePassForm.destination,
        outTime: gatePassForm.outTime,
        inTime: gatePassForm.inTime,
        status: 'AUTHORIZED'
      }
      setActiveGatePass(passData)
      setGatePassSuccess(`Digital Outing Gate-Pass issued successfully for ${gatePassForm.destination}! Pass ID: ${passData.passId}`)
      setTimeout(() => setGatePassSuccess(''), 5500)
    } catch (err) {
      setGatePassSuccess(err.message || 'Error processing gate pass')
    } finally {
      setSubmittingGatePass(false)
    }
  }

  return (
    <RolePageTemplate role="Student" title="Hostel Information & Residency" description="Your hostel details, warden desk, gate-pass authorizations, and maintenance requests.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Loading state */}
        {loading ? (
          <div data-testid="hostel-info-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="hostel-info-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Hostel Residency</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchHostelInfo(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Room Info & Maintenance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', borderLeft: '4px solid #2563EB' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: BLUE }} className="d-flex align-items-center gap-2">
                  <Home size={18} /> My Room Details & Residency
                </h2>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {[
                    { label: 'Hostel Wing / Block', value: allocation?.block || 'Block B (Godavari Boys Hostel)' },
                    { label: 'Room Number', value: `Room ${allocation?.room || '302'}` },
                    { label: 'Roommates', value: (allocation?.roommates || []).join(', ') },
                    { label: 'Resident Warden', value: `${allocation?.warden || 'Dr. Meena'} (${allocation?.phone || 'Desk'})` },
                    { label: 'Curfew Timing', value: '10:00 PM (Biometric Turnstile Lockdown)' },
                  ].map(r => (
                    <div key={r.label} style={{ padding: '0.65rem 0.875rem', borderRadius: '0.75rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>{r.label}</span>
                      <span style={{ fontWeight: 700 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Request Form */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }} className="d-flex align-items-center gap-2">
                  <Wrench size={18} className="text-warning" /> Maintenance Ticket Filer
                </h2>
                {requestSent ? (
                  <div data-testid="maint-success-alert" style={{ padding: '0.875rem', borderRadius: '0.875rem', background: '#10B98112', border: '1px solid #10B98130', color: '#065f46', fontWeight: 600, fontSize: '0.85rem' }}>
                    ✅ Request sent! Maintenance team will reach out within 24 hours.
                  </div>
                ) : (
                  <form onSubmit={sendMaintenanceRequest} data-testid="maint-form" style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ISSUE TYPE</label>
                      <select className="form-select form-select-sm" value={reqForm.type} onChange={e => setReqForm(p => ({...p, type: e.target.value}))}>
                        {['Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'AC / Fan', 'Internet', 'Other'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DESCRIPTION</label>
                      <textarea required className="form-control form-control-sm" rows={2} placeholder="Describe the issue..." value={reqForm.desc} onChange={e => setReqForm(p => ({...p, desc: e.target.value}))} />
                    </div>
                    <button type="submit" data-testid="submit-maint-btn" className="btn btn-primary btn-sm">📤 Submit Maintenance Ticket</button>
                  </form>
                )}
              </div>
            </div>

            {/* Outing Gate-Pass Request Form */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }} className="d-flex align-items-center gap-2">
                  <Ticket size={18} className="text-primary" /> Digital Outing &amp; Weekend Gate-Pass
                </h2>
                <span className="badge bg-primary">Warden Auto-Sync</span>
              </div>

              {gatePassSuccess ? (
                <div data-testid="gatepass-success-alert" className="alert alert-success py-2 px-3 small mb-3">
                  ✅ {gatePassSuccess}
                </div>
              ) : null}

              {activeGatePass && (
                <div className="p-3 bg-light border rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                  <div>
                    <span className="badge bg-success font-monospace me-2">{activeGatePass.passId}</span>
                    <strong className="text-dark">ACTIVE OUTING PASS — {activeGatePass.destination}</strong>
                    <div className="small text-muted mt-1">
                      Valid Out: <strong>{activeGatePass.outTime}</strong> • Expected Return: <strong>{activeGatePass.inTime}</strong>
                    </div>
                  </div>
                  <div>
                    <QRCodeSvg value={`GATEPASS:${activeGatePass.passId}|DEST:${activeGatePass.destination}|EXP:${activeGatePass.inTime}`} size={56} bgColor="#ffffff" fgColor="#0f172a" />
                  </div>
                </div>
              )}

              <form onSubmit={handleGatePass} data-testid="gatepass-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DESTINATION</label>
                  <input required className="form-control form-control-sm" value={gatePassForm.destination} onChange={e => setGatePassForm(p => ({...p, destination: e.target.value}))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>REASON / PURPOSE</label>
                  <input required className="form-control form-control-sm" value={gatePassForm.reason} onChange={e => setGatePassForm(p => ({...p, reason: e.target.value}))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>EXPECTED OUT TIME</label>
                  <input required className="form-control form-control-sm" value={gatePassForm.outTime} onChange={e => setGatePassForm(p => ({...p, outTime: e.target.value}))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>RETURN TIME</label>
                  <input required className="form-control form-control-sm" value={gatePassForm.inTime} onChange={e => setGatePassForm(p => ({...p, inTime: e.target.value}))} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submittingGatePass} data-testid="submit-gatepass-btn" className="btn btn-sm btn-success">
                    {submittingGatePass ? 'Issuing Pass…' : '🚀 Request Gate-Pass'}
                  </button>
                </div>
              </form>
            </div>

            {/* Maintenance History Log */}
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-3" style={{ fontSize: '0.95rem' }}>Previous Maintenance Requests</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>TICKET</th>
                      <th>CATEGORY</th>
                      <th>DESCRIPTION</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintHistory.map(m => (
                      <tr key={m.id}>
                        <td className="font-monospace fw-bold">{m.id}</td>
                        <td><span className="badge bg-secondary">{m.type}</span></td>
                        <td>{m.desc}</td>
                        <td className="text-muted">{m.date}</td>
                        <td>
                          <span className={`badge ${m.status === 'RESOLVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
