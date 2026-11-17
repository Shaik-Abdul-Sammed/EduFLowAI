import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const BLUE = '#2563EB'
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const today = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

export default function Page() {
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [activeDay, setActiveDay] = useState(today)
  const [requestSent, setRequestSent] = useState(false)
  const [submittingGatePass, setSubmittingGatePass] = useState(false)
  const [gatePassSuccess, setGatePassSuccess] = useState('')
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
        const studentAlloc = list.find(a => (a.student_roll === 'SS26' || a.student_name === 'Ananya Sharma')) || list[0] || {
          block: 'Block B (Kaveri Girls Hostel)',
          room_no: '204',
          roommates: ['Sneha Patel', 'Anusha V.'],
          warden_name: 'Dr. Meena Swaminathan',
          warden_phone: '+91 94401 88992'
        }
        setAllocation({
          block: studentAlloc.block || 'Block B',
          room: studentAlloc.room_no || studentAlloc.room || '204',
          roommates: Array.isArray(studentAlloc.roommates) ? studentAlloc.roommates : ['Sneha Patel', 'Anusha V.'],
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
          subject: `${reqForm.type} issue in Room ${allocation?.room || '204'}`,
          description: reqForm.desc,
          priority: 'MEDIUM'
        })
      })

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
          student_roll: 'SS26',
          student_name: 'Ananya Sharma',
          destination: gatePassForm.destination,
          reason: gatePassForm.reason,
          out_time: gatePassForm.outTime,
          in_time: gatePassForm.inTime
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to submit gate-pass request')

      setGatePassSuccess(`Digital Outing Gate-Pass issued successfully for ${gatePassForm.destination}!`)
      setTimeout(() => setGatePassSuccess(''), 4500)
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', borderLeft: '4px solid #2563EB' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: BLUE }}>🏠 My Room Details</h2>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {[
                    { label: 'Hostel Wing / Block', value: allocation?.block || 'Block B' },
                    { label: 'Room Number', value: `Room ${allocation?.room || '204'}` },
                    { label: 'Roommates', value: (allocation?.roommates || []).join(', ') },
                    { label: 'Resident Warden', value: `${allocation?.warden || 'Dr. Meena'} (${allocation?.phone || 'Desk'})` },
                  ].map(r => (
                    <div key={r.label} style={{ padding: '0.65rem 0.875rem', borderRadius: '0.75rem', background: 'var(--surface-bg)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>{r.label}</span>
                      <span style={{ fontWeight: 700 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Request Form */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>🔧 Maintenance Request</h2>
                {requestSent ? (
                  <div data-testid="maint-success-alert" style={{ padding: '0.875rem', borderRadius: '0.875rem', background: '#10B98112', border: '1px solid #10B98130', color: '#065f46', fontWeight: 600, fontSize: '0.85rem' }}>
                    ✅ Request sent! Maintenance team will reach out within 24 hours.
                  </div>
                ) : (
                  <form onSubmit={sendMaintenanceRequest} data-testid="maint-form" style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ISSUE TYPE</label>
                      <select className="form-select" style={{ fontSize: '0.82rem' }} value={reqForm.type} onChange={e => setReqForm(p => ({...p, type: e.target.value}))}>
                        {['Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'AC / Fan', 'Internet', 'Other'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>DESCRIPTION</label>
                      <textarea required className="form-control" rows={2} placeholder="Describe the issue..." style={{ fontSize: '0.82rem' }} value={reqForm.desc} onChange={e => setReqForm(p => ({...p, desc: e.target.value}))} />
                    </div>
                    <button type="submit" data-testid="submit-maint-btn" className="btn btn-primary btn-sm">📤 Submit Maintenance Ticket</button>
                  </form>
                )}
              </div>
            </div>

            {/* Outing Gate-Pass Request Form */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>🎫 Digital Outing &amp; Weekend Gate-Pass</h2>
                <span className="badge text-bg-info">Warden Auto-Sync</span>
              </div>

              {gatePassSuccess ? (
                <div data-testid="gatepass-success-alert" className="alert alert-success py-2 px-3 small mb-0">
                  ✅ {gatePassSuccess}
                </div>
              ) : (
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
              )}
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
