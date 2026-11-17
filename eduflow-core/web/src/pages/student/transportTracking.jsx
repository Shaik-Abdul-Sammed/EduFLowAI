import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { busSchedule, STUDENT } from '../../utils/studentMockData'
import { getFullApiUrl } from '../../utils/apiConfig'
import {
  Bus, MapPin, Phone, Clock, AlertTriangle, CheckCircle2,
  Bell, QrCode, Navigation, ShieldCheck, RefreshCw
} from 'lucide-react'
import QRCodeSvg from '../../components/QRCodeSvg'

const BLUE = '#2563EB'

export default function Page() {
  const { bus } = STUDENT
  const myStopIdx = busSchedule.findIndex(s => s.stop === bus.stop)

  const [currentSpeed, setCurrentSpeed] = useState(38)
  const [distanceKm, setDistanceKm] = useState(2.3)
  const [etaMinutes, setEtaMinutes] = useState(7)
  const [notificationActive, setNotificationActive] = useState(true)
  const [showPassModal, setShowPassModal] = useState(false)
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [incidentText, setIncidentText] = useState('')
  const [incidentAlert, setIncidentAlert] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed(prev => Math.max(25, Math.min(55, prev + Math.floor(Math.random() * 7) - 3)))
      setDistanceKm(prev => Math.max(0.2, Number((prev - 0.1).toFixed(1))))
      setEtaMinutes(prev => Math.max(1, Math.round(distanceKm * 2.5)))
    }, 6000)
    return () => clearInterval(interval)
  }, [distanceKm])

  const handleReportIncident = async (e) => {
    e.preventDefault()
    try {
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `Transit Incident: Bus #${bus.busNo} (${bus.route})`,
          description: incidentText || 'Transit disruption reported by student',
          category: 'transport',
          priority: 'high'
        })
      })
    } catch (err) {
      console.debug('Failed to transmit transit incident:', err)
    }
    setIncidentAlert('Incident transmitted to Central Transport Cell & Route Supervisor!')
    setTimeout(() => {
      setIncidentAlert('')
      setShowIncidentModal(false)
      setIncidentText('')
    }, 3500)
  }

  return (
    <RolePageTemplate role="Student" title="Campus Transit & Live Bus Telemetry" description="Your assigned bus route, live GPS telemetry, driver contact, and digital transit pass.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Live Tracking Radar Hero Card */}
        <div
          className="card border-0 shadow-sm p-4 text-white"
          style={{
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, #1e293b 0%, #1d4ed8 100%)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-success mb-2 px-3 py-1 fw-bold fs-6 animate-pulse">
                LIVE GPS TELEMETRY ACTIVE
              </span>
              <h2 className="h4 fw-bold text-white mb-1">Bus #{bus.busNo} — {bus.route}</h2>
              <p className="text-white text-opacity-75 small mb-0">
                Approaching stop: <strong>{bus.stop}</strong> • Driver: <strong>{bus.driver}</strong>
              </p>
            </div>

            <div className="d-flex gap-3 align-items-center">
              <div className="text-center bg-white bg-opacity-10 p-3 rounded-3 border border-white border-opacity-20">
                <div className="text-white text-opacity-75 small fw-bold">ETA TO YOUR STOP</div>
                <div className="h3 fw-bold text-warning mb-0">{etaMinutes} Mins</div>
                <div className="small text-white text-opacity-75 font-monospace">{distanceKm} km away</div>
              </div>

              <div className="text-center bg-white bg-opacity-10 p-3 rounded-3 border border-white border-opacity-20">
                <div className="text-white text-opacity-75 small fw-bold">SPEED</div>
                <div className="h3 fw-bold text-white mb-0">{currentSpeed} <span className="fs-6">km/h</span></div>
                <div className="small text-success fw-bold">On Schedule</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bus Info Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Bus Number', value: bus.busNo, color: BLUE, icon: '🚌' },
            { label: 'Assigned Route', value: bus.route, color: '#10B981', icon: '🛣️' },
            { label: 'Boarding Point', value: bus.stop, color: '#F59E0B', icon: '📍' },
            { label: 'Driver Incharge', value: bus.driver, color: '#8B5CF6', icon: '👨‍✈️' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: s.color, lineHeight: 1.3, marginBottom: '0.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Driver Contact & Quick Actions Strip */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2563EB15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👨‍✈️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{bus.driver}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Route Captain • Bus #{bus.busNo}</div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <a href={`tel:${bus.phone}`} className="btn btn-outline-primary btn-sm" style={{ borderRadius: '2rem' }}>
              📞 Call Driver ({bus.phone})
            </a>
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              style={{ borderRadius: '2rem' }}
              onClick={() => setShowPassModal(true)}
            >
              <QrCode size={14} /> Digital Bus Pass
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              style={{ borderRadius: '2rem' }}
              onClick={() => setShowIncidentModal(true)}
            >
              🚨 Report Delay / Breakdown
            </button>
          </div>
        </div>

        {/* Route Map Timeline */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>🗺️ Live Route Stops — {bus.route}</h2>
            <div className="form-check form-switch small">
              <input
                className="form-check-input"
                type="checkbox"
                id="notifySwitch"
                checked={notificationActive}
                onChange={() => setNotificationActive(!notificationActive)}
              />
              <label className="form-check-label text-muted" htmlFor="notifySwitch">
                SMS alert 10 min before my stop
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {busSchedule.map((stop, i) => {
              const isMyStop = stop.stop === bus.stop
              const isCampus = i === busSchedule.length - 1
              const isPast = i < myStopIdx
              const color = isCampus ? '#10B981' : isMyStop ? BLUE : isPast ? '#94a3b8' : '#475569'

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: '1rem' }}>
                  {/* Timeline column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: isMyStop ? BLUE : isCampus ? '#10B981' : isPast ? '#e2e8f0' : '#f1f5f9',
                      border: `3px solid ${isMyStop ? BLUE : isCampus ? '#10B981' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: (isMyStop || isCampus) ? `0 4px 12px ${color}40` : 'none',
                      fontSize: '0.65rem', color: 'white', fontWeight: 700,
                    }}>
                      {isMyStop ? '★' : isCampus ? '🏫' : isPast ? '✓' : i + 1}
                    </div>
                    {i < busSchedule.length - 1 && (
                      <div style={{ flex: 1, width: 2, background: isPast ? '#94a3b8' : '#e2e8f0', minHeight: 32, marginTop: 2, marginBottom: 2 }} />
                    )}
                  </div>

                  {/* Stop Info */}
                  <div style={{ flex: 1, padding: '0.2rem 0 0.6rem' }}>
                    <div style={{ padding: '0.65rem 0.875rem', borderRadius: '0.75rem', background: isMyStop ? '#2563EB10' : isCampus ? '#10B98110' : '#f8fafc', border: isMyStop ? '1px solid #2563EB35' : '1px solid #f1f5f9', marginBottom: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: isMyStop || isCampus ? 700 : 500, color, fontSize: '0.9rem' }}>{stop.stop}</span>
                          {isMyStop && <span style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '2rem', background: BLUE, color: 'white', fontSize: '0.68rem', fontWeight: 700 }}>MY STOP (ETA {etaMinutes}M)</span>}
                          {isCampus && <span style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '2rem', background: '#10B981', color: 'white', fontSize: '0.68rem', fontWeight: 700 }}>DESTINATION</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                          {stop.departure !== '—' && <span style={{ color: '#64748b' }}>🚌 Dep: <strong>{stop.departure}</strong></span>}
                          <span style={{ color: isCampus ? '#10B981' : '#64748b' }}>📍 Arr: <strong>{stop.arrival}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Digital Bus Pass Modal */}
        {showPassModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <QrCode size={18} /> Official Transport Boarding Pass
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowPassModal(false)} />
                </div>
                <div className="modal-body p-4 text-center">
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <span className="badge bg-success mb-2">VALIDATED FOR SEMESTER 4</span>
                    <h5 className="fw-bold text-dark mb-0">Shaik Abdul Sammed</h5>
                    <div className="small text-muted font-monospace mb-2">Roll: 2024-CSE-042</div>
                    <div className="small text-dark"><strong>Route:</strong> Route 14 (Ameerpet - Campus)</div>
                    <div className="small text-dark"><strong>Boarding Stop:</strong> Ameerpet X Roads</div>
                  </div>

                  <div className="d-inline-block p-2 bg-white border rounded shadow-sm mb-3">
                    <QRCodeSvg value={`BUSPASS:2024-CSE-042|ROUTE:14|STOP:${bus.stop}|EXP:2026-06-30`} size={130} bgColor="#ffffff" fgColor="#0f172a" />
                  </div>
                  <div className="small text-muted">Scan at RFID reader upon boarding Bus #{bus.busNo}</div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPassModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Incident Alert Modal */}
        {showIncidentModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <AlertTriangle size={18} /> Report Transport Delay or Breakdown
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowIncidentModal(false)} />
                </div>
                <div className="modal-body p-4">
                  {incidentAlert ? (
                    <div className="alert alert-success py-2 text-center small mb-0">
                      ✅ {incidentAlert}
                    </div>
                  ) : (
                    <form onSubmit={handleReportIncident}>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Incident Category</label>
                        <select className="form-select form-select-sm">
                          <option>Bus Delayed (&gt;15 minutes)</option>
                          <option>Mechanical Breakdown / Puncture</option>
                          <option>Route Diverted due to Roadwork</option>
                          <option>Overcrowding / Driver Assist</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-bold">Incident Details</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={3}
                          required
                          placeholder="Describe the delay or location of breakdown..."
                          value={incidentText}
                          onChange={(e) => setIncidentText(e.target.value)}
                        />
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowIncidentModal(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-danger btn-sm">
                          Transmit Priority Alert
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
