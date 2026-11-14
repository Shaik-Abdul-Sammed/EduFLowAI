import { useState, useEffect } from 'react'
import { Home, ShieldCheck } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function HostelWardenPage() {
  const [allocations, setAllocations] = useState([])
  const [gateLogs, setGateLogs] = useState([])
  const [hostelName, setHostelName] = useState('Aryabhata Boys Hostel')
  const [roomNumber, setRoomNumber] = useState('')
  const [studentRoll, setStudentRoll] = useState('')
  const [studentName, setStudentName] = useState('')
  const [gateRoll, setGateRoll] = useState('')
  const [gateName, setGateName] = useState('')
  const [direction, setDirection] = useState('OUT')
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState('')

  const fetchData = async () => {
    try {
      const aRes = await fetch(`${getApiBaseURL()}/v1/hostel/allocations`)
      if (aRes.ok) {
        const aData = await safeJson(aRes)
        if (aData?.allocations) setAllocations(aData.allocations)
      }
      const gRes = await fetch(`${getApiBaseURL()}/v1/hostel/gate-logs`)
      if (gRes.ok) {
        const gData = await safeJson(gRes)
        if (gData?.logs) setGateLogs(gData.logs)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAllocate = async (e) => {
    e.preventDefault()
    if (!roomNumber || !studentRoll) return
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/hostel/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostel_name: hostelName,
          room_number: roomNumber,
          student_roll: studentRoll,
          student_name: studentName || 'Student',
          bed_number: 'Bed-1'
        })
      })
      if (res.ok) {
        setMsg(`Room ${roomNumber} allotted to ${studentRoll} successfully.`)
        setRoomNumber('')
        setStudentRoll('')
        setStudentName('')
        fetchData()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  const handleGatePass = async (e) => {
    e.preventDefault()
    if (!gateRoll) return
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/hostel/gate-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_roll: gateRoll,
          student_name: gateName || 'Student',
          direction,
          reason
        })
      })
      if (res.ok) {
        setMsg(`Gate movement logged: ${gateRoll} (${direction}).`)
        setGateRoll('')
        setGateName('')
        setReason('')
        fetchData()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  return (
    <RolePageTemplate role="admin" title="Hostel Administration & Warden Gate Desk">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 13, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        {/* 2-Column Section: Allotment & Gate Movement */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Room Allotment Form */}
          <div style={{ background: '#FFFFFF', padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                <Home size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Room Allotment Desk</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Assign campus block, room number, and bed</p>
              </div>
            </div>

            <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Hostel Block</label>
                <select
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                >
                  <option value="Aryabhata Boys Hostel">Aryabhata Boys Hostel (Block A)</option>
                  <option value="Bhaskara Boys Hostel">Bhaskara Boys Hostel (Block B)</option>
                  <option value="Gargi Girls Hostel">Gargi Girls Hostel (Block G)</option>
                  <option value="Maitreyi Girls Hostel">Maitreyi Girls Hostel (Block M)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. B-204 or G-102"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Student Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1ST22CS089"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginTop: 6
                }}
              >
                Allot Room
              </button>
            </form>
          </div>

          {/* Gate-Pass Movement Logger */}
          <div style={{ background: '#FFFFFF', padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#F0FDF4', color: '#16A34A', padding: 8, borderRadius: 8 }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Warden Gate Log (Turnstile Pass)</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Real-time entry/exit recording for curfew & safety</p>
              </div>
            </div>

            <form onSubmit={handleGatePass} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Roll No</label>
                  <input
                    type="text"
                    placeholder="e.g. SS26"
                    value={gateRoll}
                    onChange={(e) => setGateRoll(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div style={{ width: 110 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Movement</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    style={{ width: '100%', padding: '8px 8px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="OUT">EXIT (Out)</option>
                    <option value="IN">ENTRY (In)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Reason / Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Library extended study / Medical emergency"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: direction === 'OUT' ? '#D97706' : '#16A34A',
                  color: '#FFFFFF',
                  padding: '9px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Log {direction === 'OUT' ? 'Student Exit' : 'Student Return'}
              </button>
            </form>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Recent Turnstile Crossings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
              {gateLogs.map((g) => (
                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#F8FAFC', borderRadius: 6, fontSize: 11 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: g.direction === 'IN' ? '#16A34A' : '#D97706', marginRight: 6 }}>[{g.direction}]</span>
                    <strong>{g.student_name}</strong> ({g.student_roll}) &bull; {g.reason}
                  </div>
                  <div style={{ color: '#94A3B8' }}>{new Date(g.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Allocations Table */}
        <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A' }}>Active Resident Allocations</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>Resident</th>
                <th style={{ padding: '10px 12px' }}>Hostel Block</th>
                <th style={{ padding: '10px 12px' }}>Room & Bed</th>
                <th style={{ padding: '10px 12px' }}>Allotted Date</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{a.student_name}</div>
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
    </RolePageTemplate>
  )
}
