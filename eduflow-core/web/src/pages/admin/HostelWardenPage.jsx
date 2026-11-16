import { useState, useEffect } from 'react'
import { Home, ShieldCheck } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function HostelWardenPage() {
  const [allocations, setAllocations] = useState([])
  const [gateLogs, setGateLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [allotting, setAllotting] = useState(false)
  const [loggingGate, setLoggingGate] = useState(false)

  const [hostelName, setHostelName] = useState('Aryabhata Boys Hostel')
  const [roomNumber, setRoomNumber] = useState('')
  const [studentRoll, setStudentRoll] = useState('')
  const [studentName, setStudentName] = useState('')

  const [gateRoll, setGateRoll] = useState('')
  const [gateName, setGateName] = useState('')
  const [direction, setDirection] = useState('OUT')
  const [reason, setReason] = useState('')

  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchData = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      const [aRes, gRes] = await Promise.all([
        fetch(getFullApiUrl('/v1/hostel/allocations'), { headers }),
        fetch(getFullApiUrl('/v1/hostel/gate-logs'), { headers })
      ])

      if (!aRes.ok) {
        throw new Error(`Failed to load hostel data (${aRes.status})`)
      }

      const aData = await aRes.json()
      const gData = gRes.ok ? await gRes.json() : { logs: [] }

      if (isMounted) {
        setAllocations(aData?.allocations || [])
        setGateLogs(gData?.logs || [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading hostel allocations')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchData(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleAllocate = async (e) => {
    e.preventDefault()
    if (!roomNumber || !studentRoll) return
    setAllotting(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/hostel/allocate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          hostel_name: hostelName,
          room_number: roomNumber,
          student_roll: studentRoll,
          student_name: studentName || 'Student',
          bed_number: 'Bed-1'
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to allocate hostel room')
      }

      setMsg(`Room ${roomNumber} allotted to ${studentRoll} successfully.`)
      setRoomNumber('')
      setStudentRoll('')
      setStudentName('')
      fetchData(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Error allocating room.')
    } finally {
      setAllotting(false)
    }
  }

  const handleGatePass = async (e) => {
    e.preventDefault()
    if (!gateRoll) return
    setLoggingGate(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/hostel/gate-pass'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_roll: gateRoll,
          student_name: gateName || 'Student',
          direction,
          reason
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to log gate pass')
      }

      setMsg(`Gate movement logged: ${gateRoll} (${direction}).`)
      setGateRoll('')
      setGateName('')
      setReason('')
      fetchData(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Error logging gate pass.')
    } finally {
      setLoggingGate(false)
    }
  }

  return (
    <RolePageTemplate role="admin" title="Hostel Administration & Warden Gate Desk">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="hostel-success-alert">
            ✓ {msg}
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0" role="alert">
            ❌ {errorMsg}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="hostel-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading hostel residency allocations and turnstile gate logs...</p>
          </div>
        )}

        {/* Load Error State */}
        {loadError && !loading && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0" role="alert">
            <div>
              <strong>Error:</strong> {loadError}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchData(true)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* 2-Column Section: Allotment & Gate Movement */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Room Allotment Form */}
              <div className="card border-0 shadow-sm p-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                    <Home size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Room Allotment Desk</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Assign campus block, room number, and bed</p>
                  </div>
                </div>

                <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label htmlFor="hostel-block-select" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Hostel Block</label>
                    <select
                      id="hostel-block-select"
                      className="form-select form-select-sm"
                      value={hostelName}
                      onChange={(e) => setHostelName(e.target.value)}
                    >
                      <option value="Aryabhata Boys Hostel">Aryabhata Boys Hostel (Block A)</option>
                      <option value="Bhaskara Boys Hostel">Bhaskara Boys Hostel (Block B)</option>
                      <option value="Gargi Girls Hostel">Gargi Girls Hostel (Block G)</option>
                      <option value="Maitreyi Girls Hostel">Maitreyi Girls Hostel (Block M)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hostel-room-num" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Room Number *</label>
                    <input
                      id="hostel-room-num"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. B-204 or G-102"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="hostel-student-roll" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Student Roll Number *</label>
                    <input
                      id="hostel-student-roll"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. 1ST22CS089"
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="hostel-student-name" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Student Name</label>
                    <input
                      id="hostel-student-name"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Rahul Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={allotting}
                    className="btn btn-primary btn-sm mt-2"
                  >
                    {allotting ? 'Allotting...' : 'Allot Room'}
                  </button>
                </form>
              </div>

              {/* Gate-Pass Movement Logger */}
              <div className="card border-0 shadow-sm p-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#F0FDF4', color: '#16A34A', padding: 8, borderRadius: 8 }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Warden Gate Log (Turnstile Pass)</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Real-time entry/exit recording for curfew & safety</p>
                  </div>
                </div>

                <form onSubmit={handleGatePass} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label htmlFor="gate-roll-input" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Roll No *</label>
                      <input
                        id="gate-roll-input"
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. SS26"
                        value={gateRoll}
                        onChange={(e) => setGateRoll(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ width: 120 }}>
                      <label htmlFor="gate-direction-select" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Movement</label>
                      <select
                        id="gate-direction-select"
                        className="form-select form-select-sm"
                        value={direction}
                        onChange={(e) => setDirection(e.target.value)}
                      >
                        <option value="OUT">EXIT (Out)</option>
                        <option value="IN">ENTRY (In)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gate-reason-input" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Reason / Destination</label>
                    <input
                      id="gate-reason-input"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Library extended study / Medical emergency"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loggingGate}
                    className={`btn btn-sm mt-2 ${direction === 'OUT' ? 'btn-warning text-dark' : 'btn-success'}`}
                  >
                    {loggingGate ? 'Recording...' : `Log ${direction === 'OUT' ? 'Student Exit' : 'Student Return'}`}
                  </button>
                </form>

                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Recent Turnstile Crossings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
                  {gateLogs.length === 0 ? (
                    <div className="text-center py-3 text-muted small">No turnstile passes recorded today.</div>
                  ) : (
                    gateLogs.map((g) => (
                      <div key={g.id} className="p-2 rounded border d-flex justify-content-between align-items-center" style={{ background: 'var(--surface-bg)', fontSize: 11 }}>
                        <div>
                          <span style={{ fontWeight: 700, color: g.direction === 'IN' ? '#16A34A' : '#D97706', marginRight: 6 }}>[{g.direction}]</span>
                          <strong>{g.student_name}</strong> ({g.student_roll}) &bull; {g.reason}
                        </div>
                        <div style={{ color: '#94A3B8' }}>{new Date(g.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Current Allocations Table */}
            <div className="card border-0 shadow-sm p-4">
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Active Resident Allocations</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      <th style={{ padding: '10px 12px' }}>Resident</th>
                      <th style={{ padding: '10px 12px' }}>Hostel Block</th>
                      <th style={{ padding: '10px 12px' }}>Room & Bed</th>
                      <th style={{ padding: '10px 12px' }}>Allotted Date</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((a) => (
                      <tr key={a.id}>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontWeight: 600 }}>{a.student_name}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>Roll: {a.student_roll}</div>
                        </td>
                        <td style={{ padding: '12px 12px', color: '#334155' }}>{a.hostel_name}</td>
                        <td style={{ padding: '12px 12px', fontWeight: 600 }}>{a.room_number} ({a.bed_number})</td>
                        <td style={{ padding: '12px 12px', color: '#64748B' }}>{a.allocation_date}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4 }}>
                            {a.status}
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
