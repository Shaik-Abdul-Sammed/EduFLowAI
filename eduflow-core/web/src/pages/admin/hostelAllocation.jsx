import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const PURPLE = '#7C3AED'
const BLUE = '#2563EB'
const GREEN = '#10B981'
const AMBER = '#F59E0B'
const RED = '#EF4444'

export default function Page() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [blockFilter, setBlockFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [confirmEvictTarget, setConfirmEvictTarget] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [form, setForm] = useState({ student: '', roomId: '', block: 'Block A' })

  const fetchRooms = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/hostel'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load hostel directory (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.data) ? data.data : []
        const mapped = raw.map(r => ({
          id: r.id || r.roomNo,
          roomNo: r.roomNo || r.id,
          block: r.block || 'Block A',
          capacity: r.capacity || 4,
          occupants: Array.isArray(r.occupants) ? r.occupants : []
        }))
        setRooms(mapped)
        if (mapped.length > 0 && !form.roomId) {
          setForm(prev => ({ ...prev, roomId: mapped[0].id }))
        }
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching hostel allocations')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchRooms(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleAllocate(e) {
    e.preventDefault()
    setFormError('')

    if (!form.student.trim()) {
      setFormError('Resident student name is required.')
      return
    }

    const selectedRoom = rooms.find(r => r.id === form.roomId || r.roomNo === form.roomId)
    if (!selectedRoom) {
      setFormError('Please select a valid hostel room.')
      return
    }

    if (selectedRoom.occupants.length >= selectedRoom.capacity) {
      setFormError(`Room ${selectedRoom.roomNo} in ${selectedRoom.block} has reached maximum capacity (${selectedRoom.capacity} beds).`)
      return
    }

    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/hostel/allocate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          studentName: form.student.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || `Failed to allocate bed (HTTP ${res.status})`)
      }

      setSuccessToast(`Student ${form.student} successfully allocated to Room ${selectedRoom.roomNo} (${selectedRoom.block}).`)
      setTimeout(() => setSuccessToast(''), 4000)
      setShowForm(false)
      setForm(prev => ({ ...prev, student: '' }))
      await fetchRooms(true)
    } catch (err) {
      setFormError(err.message || 'Error allocating hostel bed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEvict(roomId, studentName) {
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/admin/hostel/evict'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ roomId, studentName })
      })

      if (res.ok) {
        setSuccessToast(`Resident ${studentName} vacated from room.`)
        setTimeout(() => setSuccessToast(''), 4000)
        await fetchRooms(true)
      }
    } catch {
      // Optimistic update
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, occupants: r.occupants.filter(s => s !== studentName) } : r))
    } finally {
      setConfirmEvictTarget(null)
    }
  }

  const totalOccupants = rooms.reduce((acc, r) => acc + r.occupants.length, 0)
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0)
  const blockAOccupants = rooms.filter(r => r.block === 'Block A').reduce((acc, r) => acc + r.occupants.length, 0)
  const blockBOccupants = rooms.filter(r => r.block === 'Block B').reduce((acc, r) => acc + r.occupants.length, 0)

  const filtered = rooms.filter(r => {
    const matchesSearch = r.roomNo.toLowerCase().includes(search.toLowerCase()) ||
                          r.block.toLowerCase().includes(search.toLowerCase()) ||
                          r.occupants.some(o => o.toLowerCase().includes(search.toLowerCase()))
    const matchesBlock = blockFilter === 'ALL' || r.block === blockFilter
    return matchesSearch && matchesBlock
  })

  return (
    <RolePageTemplate role="Admin" title="Hostel Allocation & Residency" description="Assign dorm rooms, inspect gender-segregated wings, balance occupancy, and oversee warden logs.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Success toast */}
        {successToast && (
          <div data-testid="hostel-success-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {successToast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="hostel-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="hostel-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Hostel Allocations</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchRooms(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Total Occupancy', value: `${totalOccupants} / ${totalBeds}`, color: PURPLE, icon: '🛏️' },
                { label: 'Block A (Boys)', value: blockAOccupants, color: BLUE, icon: '🏢' },
                { label: 'Block B (Girls)', value: blockBOccupants, color: GREEN, icon: '🏫' },
                { label: 'Active Dorms', value: rooms.length, color: AMBER, icon: '🚪' },
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
                    <option value="Block A">Block A (Boys Wing)</option>
                    <option value="Block B">Block B (Girls Wing)</option>
                  </select>
                </div>
                {!showForm && (
                  <button
                    className="btn btn-sm btn-primary shadow-sm"
                    data-testid="open-allocate-btn"
                    onClick={() => setShowForm(true)}
                    style={{ background: `linear-gradient(135deg, ${PURPLE}, #EF4444)`, border: 'none' }}
                  >
                    + Allocate Dorm Bed
                  </button>
                )}
              </div>
            </div>

            {/* Allocate form */}
            {showForm && (
              <form onSubmit={handleAllocate} data-testid="allocate-hostel-form" className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>🛏️ Assign Dormitory Residency</h3>
                  <button type="button" className="btn-close" onClick={() => { setShowForm(false); setFormError(''); }} aria-label="Close" />
                </div>

                {formError && (
                  <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>STUDENT FULL NAME</label>
                    <input required className="form-control form-control-sm" placeholder="e.g. Kiran Kumar" value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>TARGET ROOM</label>
                    <select className="form-select form-select-sm" value={form.roomId} onChange={e => setForm(p => ({ ...p, roomId: e.target.value }))}>
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.block} - Room {r.roomNo} ({r.occupants.length}/{r.capacity} beds filled)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={submitting} data-testid="submit-allocate-btn" className="btn btn-sm btn-primary">
                    {submitting ? 'Allocating...' : 'Allocate Bed'}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Room Allocations Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      {['Block', 'Room No', 'Capacity', 'Occupancy', 'Current Residents', 'Action'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr data-testid="hostel-empty">
                        <td colSpan="6" className="text-center py-5 text-muted">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚪</div>
                          <div className="fw-semibold">No hostel rooms found</div>
                          <div className="small">Adjust filter or allocate residents above.</div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(room => {
                        const isFull = room.occupants.length >= room.capacity
                        return (
                          <tr key={room.id}>
                            <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>{room.block}</td>
                            <td style={{ fontSize: '0.9rem', fontWeight: 800 }}>Room {room.roomNo}</td>
                            <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{room.capacity} Beds</td>
                            <td>
                              <span style={{
                                padding: '0.2rem 0.6rem', borderRadius: '2rem',
                                background: isFull ? `${RED}12` : `${GREEN}12`,
                                color: isFull ? RED : GREEN,
                                fontSize: '0.72rem', fontWeight: 700
                              }}>
                                {room.occupants.length} / {room.capacity} Filled
                              </span>
                            </td>
                            <td>
                              {room.occupants.length === 0 ? (
                                <span className="text-muted small italic">Vacant (0 residents)</span>
                              ) : (
                                <div className="d-flex flex-wrap gap-1">
                                  {room.occupants.map(name => (
                                    <span key={name} className="badge bg-light text-dark border d-flex align-items-center gap-1">
                                      👤 {name}
                                      <button
                                        type="button"
                                        className="btn-close ms-1"
                                        style={{ fontSize: '0.55rem' }}
                                        onClick={() => handleEvict(room.id, name)}
                                        aria-label={`Vacate ${name}`}
                                      />
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary px-2 py-0"
                                style={{ fontSize: '0.7rem' }}
                                disabled={isFull}
                                onClick={() => {
                                  setForm(p => ({ ...p, roomId: room.id }))
                                  setShowForm(true)
                                }}
                              >
                                {isFull ? 'Full' : '+ Add Resident'}
                              </button>
                            </td>
                          </tr>
                        )
                      })
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
