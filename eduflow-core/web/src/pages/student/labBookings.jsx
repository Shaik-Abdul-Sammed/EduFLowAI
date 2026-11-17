import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { labSlots as defaultSlots } from '../../utils/studentMockData'
import { getFullApiUrl } from '../../utils/apiConfig'
import {
  Cpu, FlaskConical, Calendar, Clock, CheckCircle2, AlertTriangle,
  Search, Filter, Plus, User, Layers, Check
} from 'lucide-react'

const BLUE = '#2563EB'

const defaultEnhancedSlots = defaultSlots.map(s => ({
  ...s,
  dept: s.lab.includes('Physics') ? 'Physics' : s.lab.includes('Chemistry') ? 'Chemistry' : 'Computer Science',
  equipment: s.lab.includes('Physics') ? 'Spectrometers & Lasers' : s.lab.includes('Chemistry') ? 'Titration & Centrifuges' : 'High Performance Cluster',
  supervisor: 'Faculty Supervisor'
}))

export default function LabBookingsPage() {
  const [slots, setSlots] = useState(defaultEnhancedSlots)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [selectedDept, setSelectedDept] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingModalSlot, setBookingModalSlot] = useState(null)
  const [projectTitle, setProjectTitle] = useState('')

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch lab bookings`)
      const data = await res.json()
      const tickets = data.tickets || []
      const labTickets = tickets.filter(t => t.category === 'lab_booking')

      if (labTickets.length > 0) {
        setSlots(prev => prev.map(s => {
          const matched = labTickets.find(t => t.subject?.includes(s.lab))
          return matched ? { ...s, myBooking: true } : s
        }))
      }
    } catch (err) {
      setError(err.message || 'Error fetching lab schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  async function handleBook(id) {
    const targetSlot = slots.find(s => s.id === id)
    if (!targetSlot) return

    if (targetSlot.myBooking) {
      handleCancelBooking(id)
      return
    }

    try {
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `Lab Slot Reservation: ${targetSlot.lab}`,
          description: `Booking requested for slot on ${targetSlot.date} at ${targetSlot.time}`,
          category: 'lab_booking',
          priority: 'low'
        })
      })
    } catch (_err) {}

    setSlots(prev => prev.map(s => s.id === id ? { ...s, myBooking: true, booked: s.booked + 1 } : s))
    setToast(`✅ Slot booked successfully for ${targetSlot.lab}!`)
    setTimeout(() => setToast(null), 3000)
  }

  function handleCancelBooking(id) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, myBooking: false, booked: Math.max(0, s.booked - 1) } : s))
    setToast('❌ Booking cancelled.')
    setTimeout(() => setToast(null), 3000)
  }

  const myBookings = slots.filter(s => s.myBooking)
  const departments = ['all', ...new Set(slots.map(s => s.dept))]

  const filteredSlots = slots.filter(s => {
    const matchesDept = selectedDept === 'all' || s.dept === selectedDept
    const matchesSearch = searchQuery === '' ||
      s.lab.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supervisor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDept && matchesSearch
  })

  return (
    <RolePageTemplate role="Student" title="Laboratory & Workstation Bookings" description="Reserve dedicated laboratory benches, specialized compute nodes, and hardware prototyping equipment.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {loading && (
          <div data-testid="lab-loading" className="card border-0 shadow-sm p-4 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Checking lab availability & existing bookings...</p>
          </div>
        )}

        {error && !loading && (
          <div data-testid="lab-error" className="alert alert-warning d-flex justify-content-between align-items-center">
            <div>
              <strong>Notice:</strong> {error}. Showing offline lab schedules.
            </div>
            <button className="btn btn-sm btn-outline-warning" onClick={fetchBookings}>Retry</button>
          </div>
        )}

        {toast && (
          <div data-testid="lab-toast" style={{ padding: '0.875rem 1.25rem', background: toast.startsWith('✅') ? '#10B98112' : '#EF444412', border: `1px solid ${toast.startsWith('✅') ? '#10B98130' : '#EF444430'}`, borderRadius: '0.875rem', fontWeight: 600, fontSize: '0.875rem', color: toast.startsWith('✅') ? '#065f46' : '#7f1d1d' }}>
            {toast}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'My Active Slots', value: myBookings.length, color: BLUE, icon: '🔬' },
            { label: 'Available Slots', value: slots.filter(s => s.booked < s.capacity && !s.myBooking).length, color: '#10B981', icon: '✅' },
            { label: 'Full Capacity', value: slots.filter(s => s.booked >= s.capacity).length, color: '#EF4444', icon: '❌' },
            { label: 'Total Lab Centers', value: slots.length, color: '#8B5CF6', icon: '📅' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* My Bookings */}
        {myBookings.length > 0 && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem', borderLeft: '4px solid #2563EB' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.875rem', color: BLUE }} className="d-flex align-items-center gap-2">
              <CheckCircle2 size={18} /> Confirmed Lab Reservations ({myBookings.length})
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {myBookings.map(s => (
                <div key={s.id} style={{ padding: '0.75rem 1rem', borderRadius: '0.875rem', background: '#2563EB12', border: '1px solid #2563EB30', minWidth: 260 }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-primary">Slot #{s.id}</span>
                    <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" onClick={() => handleCancelBooking(s.id)}>Cancel</button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: BLUE, marginTop: 4 }}>{s.lab}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>{s.date} • {s.time}</div>
                  <div className="small text-muted mt-1">🔧 {s.equipment}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '1rem' }}>
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0"><Search size={15} className="text-muted" /></span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search lab facility, specialized equipment, or supervisor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-flex gap-1 flex-wrap justify-content-md-end">
                {departments.map(d => (
                  <button
                    key={d}
                    className={`btn btn-sm ${selectedDept === d ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem', borderRadius: '1.5rem' }}
                    onClick={() => setSelectedDept(d)}
                  >
                    {d === 'all' ? 'All Departments' : d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.875rem' }}>🗓️ Available Lab Schedules & Workbench Slots</h2>
          <div style={{ display: 'grid', gap: '0.875rem' }}>
            {filteredSlots.map(slot => {
              const available = slot.booked < slot.capacity
              const fillPct = Math.round((slot.booked / slot.capacity) * 100)
              const fillColor = fillPct >= 90 ? '#EF4444' : fillPct >= 60 ? '#F59E0B' : '#10B981'

              return (
                <div key={slot.id} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem 1.5rem', borderLeft: `5px solid ${slot.myBooking ? BLUE : fillColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-light text-dark border">{slot.dept}</span>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{slot.lab}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>📅 {slot.date}</span>
                        <span>⏰ {slot.time}</span>
                        <span>👥 {slot.booked}/{slot.capacity} workstations occupied</span>
                      </div>
                      <div className="small text-muted mt-1">
                        <strong>Hardware:</strong> {slot.equipment} • <strong>Faculty In-charge:</strong> {slot.supervisor}
                      </div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, maxWidth: 220 }}>
                          <div style={{ height: '100%', width: `${fillPct}%`, background: fillColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: fillColor }}>{fillPct}% Capacity</span>
                      </div>
                    </div>
                    <div>
                      {!available && !slot.myBooking ? (
                        <span style={{ padding: '0.4rem 0.875rem', borderRadius: '0.75rem', background: '#EF444412', color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>❌ Full Capacity</span>
                      ) : (
                        <button
                          onClick={() => handleBook(slot.id)}
                          style={{
                            padding: '0.5rem 1.1rem',
                            borderRadius: '0.75rem',
                            border: slot.myBooking ? '1px solid #EF4444' : 'none',
                            background: slot.myBooking ? 'transparent' : `linear-gradient(135deg, ${BLUE}, #06B6D4)`,
                            color: slot.myBooking ? '#EF4444' : 'white',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {slot.myBooking ? '✕ Cancel Booking' : '+ Book Slot'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Modal for Booking */}
        {bookingModalSlot && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <Cpu size={18} /> Confirm Laboratory Workbench Booking
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setBookingModalSlot(null)} />
                </div>
                <div className="modal-body p-4">
                  <h6 className="fw-bold text-dark mb-1">{bookingModalSlot.lab}</h6>
                  <p className="text-muted small mb-3">📅 {bookingModalSlot.date} • ⏰ {bookingModalSlot.time}</p>

                  <div className="p-3 bg-light rounded-3 small mb-3">
                    <div><strong>Department:</strong> {bookingModalSlot.dept}</div>
                    <div><strong>Specialized Hardware:</strong> {bookingModalSlot.equipment}</div>
                    <div><strong>Supervisor:</strong> {bookingModalSlot.supervisor}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Experiment / Research Project Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Distributed Deep Learning Training on PyTorch"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBookingModalSlot(null)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirmBooking}>
                    Confirm & Reserve Slot
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
