import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { STUDENT } from '../../utils/studentMockData'

const PURPLE = '#7C3AED'
const BLUE = '#2563EB'
const GREEN = '#10B981'
const AMBER = '#F59E0B'
const RED = '#EF4444'

const MAX_ROOM_CAPACITY = 4

const initialAllocations = [
  { id: 'H01', block: 'Block A', room: '101', student: STUDENT.name, roommates: ['Kiran Kumar', 'Vikas Reddy'], floor: 1 },
  { id: 'H02', block: 'Block A', room: '102', student: 'Priya Singh', roommates: ['Sneha Patel', 'Anusha V.'], floor: 1 },
  { id: 'H03', block: 'Block B', room: '204', student: 'Kavya Naidu', roommates: ['Deepika M.'], floor: 2 },
  { id: 'H04', block: 'Block B', room: '205', student: 'Rahul Varma', roommates: ['Sanjay T.'], floor: 2 },
]

export default function Page() {
  const [allocations, setAllocations] = useState(initialAllocations)
  const [search, setSearch] = useState('')
  const [blockFilter, setBlockFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [confirmEvictId, setConfirmEvictId] = useState(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ student: '', block: 'Block A', room: '204', roommates: '', floor: 2 })

  function handleCreate(e) {
    e.preventDefault()
    setFormError('')

    const roommatesList = form.roommates.split(',').map(s => s.trim()).filter(Boolean)
    const totalProposed = 1 + roommatesList.length

    // Broken Rule Fix: Prevent exceeding room max occupancy
    if (totalProposed > MAX_ROOM_CAPACITY) {
      setFormError(`Room capacity exceeded! Maximum ${MAX_ROOM_CAPACITY} residents allowed per room (you specified ${totalProposed}).`)
      return
    }

    // Check if room is already allocated in that block
    const existing = allocations.find(a => a.block === form.block && a.room === form.room)
    if (existing) {
      setFormError(`Room ${form.room} in ${form.block} is already allocated to ${existing.student}. Vacate or reassign room.`)
      return
    }

    setAllocations(prev => [...prev, { ...form, roommates: roommatesList, id: `H0${prev.length + 1}` }])
    setShowForm(false)
    setForm({ student: '', block: 'Block A', room: '204', roommates: '', floor: 2 })
  }

  function handleEvict(id) {
    setAllocations(prev => prev.filter(a => a.id !== id))
    setConfirmEvictId(null)
  }

  const totalOccupants = allocations.reduce((acc, a) => acc + 1 + a.roommates.length, 0)
  const blockAOccupants = allocations.filter(a => a.block === 'Block A').reduce((acc, a) => acc + 1 + a.roommates.length, 0)
  const blockBOccupants = allocations.filter(a => a.block === 'Block B').reduce((acc, a) => acc + 1 + a.roommates.length, 0)

  const filtered = allocations.filter(a => {
    const matchesSearch = a.student.toLowerCase().includes(search.toLowerCase()) ||
                          a.room.includes(search) ||
                          a.roommates.some(r => r.toLowerCase().includes(search.toLowerCase()))
    const matchesBlock = blockFilter === 'ALL' || a.block === blockFilter
    return matchesSearch && matchesBlock
  })

  return (
    <RolePageTemplate role="Admin" title="Hostel Allocation & Residency" description="Assign dorm rooms, inspect gender-segregated wings, balance occupancy, and oversee warden logs.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Dynamic counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Total Allocated', value: totalOccupants, color: PURPLE, icon: '🛏️' },
            { label: 'Block A (Boys)', value: blockAOccupants, color: BLUE, icon: '🏢' },
            { label: 'Block B (Girls)', value: blockBOccupants, color: GREEN, icon: '🏫' },
            { label: 'Rooms Active', value: allocations.length, color: AMBER, icon: '🚪' },
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
                  placeholder="Search resident, room number..."
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
                value={blockFilter}
                onChange={e => setBlockFilter(e.target.value)}
              >
                <option value="ALL">All Blocks</option>
                <option value="Block A">Block A (Boys)</option>
                <option value="Block B">Block B (Girls)</option>
              </select>
            </div>
            {!showForm && (
              <button
                className="btn btn-sm btn-primary shadow-sm"
                onClick={() => setShowForm(true)}
                style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
              >
                + Allocate Room
              </button>
            )}
          </div>
        </div>

        {/* Allocate form */}
        {showForm && (
          <form onSubmit={handleCreate} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>🛏️ Assign Dormitory Accommodation</h3>
              <button type="button" className="btn-close" onClick={() => { setShowForm(false); setFormError(''); }} aria-label="Close" />
            </div>

            {formError && (
              <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>PRIMARY RESIDENT</label>
                <input required className="form-control form-control-sm" placeholder="e.g. Abhiram V." value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>HOSTEL BLOCK</label>
                <select className="form-select form-select-sm" value={form.block} onChange={e => setForm(p => ({ ...p, block: e.target.value }))}>
                  <option>Block A</option>
                  <option>Block B</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ROOM NUMBER</label>
                <input required className="form-control form-control-sm" placeholder="e.g. 204" value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>ROOMMATES (MAX 3, COMMA SEPARATED)</label>
                <input className="form-control form-control-sm" placeholder="e.g. Sai Charan, Amit Kumar" value={form.roommates} onChange={e => setForm(p => ({ ...p, roommates: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-sm btn-primary">Allocate Room</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Allocations table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ background: 'var(--surface-bg)' }}>
                  {['Block', 'Room No', 'Primary Resident', 'Roommates', 'Occupancy', 'Capacity Status', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div className="fw-semibold">No hostel allocations found</div>
                      <div className="small">Try adjusting your search query or block filter.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(a => {
                    const count = a.roommates.length + 1
                    const isFull = count >= MAX_ROOM_CAPACITY
                    return (
                      <tr key={a.id}>
                        <td><span className="badge text-bg-secondary">{a.block}</span></td>
                        <td style={{ fontWeight: 800, fontSize: '0.875rem' }}>Room {a.room}</td>
                        <td style={{ fontWeight: 700 }}>{a.student}</td>
                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{a.roommates.join(', ') || 'None (Single Occupancy)'}</td>
                        <td>
                          <span className="badge text-bg-light" style={{ border: '1px solid var(--border-color)' }}>
                            {count} / {MAX_ROOM_CAPACITY} Beds
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '2rem',
                            background: isFull ? `${RED}12` : `${GREEN}12`,
                            color: isFull ? RED : GREEN,
                            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                          }}>
                            {isFull ? '🔴 FULL' : `🟢 ${MAX_ROOM_CAPACITY - count} AVAILABLE`}
                          </span>
                        </td>
                        <td>
                          {confirmEvictId === a.id ? (
                            <div className="d-flex align-items-center gap-1">
                              <button className="btn btn-sm btn-danger px-2 py-0" onClick={() => handleEvict(a.id)} style={{ fontSize: '0.7rem' }}>
                                Confirm
                              </button>
                              <button className="btn btn-sm btn-secondary px-2 py-0" onClick={() => setConfirmEvictId(null)} style={{ fontSize: '0.7rem' }}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setConfirmEvictId(a.id)}
                              style={{ fontSize: '0.72rem' }}
                              title="Vacate room allocation"
                            >
                              Vacate 🗑️
                            </button>
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
