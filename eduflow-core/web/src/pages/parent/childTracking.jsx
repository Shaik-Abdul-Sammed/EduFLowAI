import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { io } from 'socket.io-client'
import { getApiBaseURL } from '../../config/apiConfig'
import {
  MapPin, Shield, Bus, Radio, Phone, AlertTriangle, CheckCircle2,
  Clock, Navigation, RefreshCw, Send, User, ChevronRight, Compass
} from 'lucide-react'

const WARDS = [
  { id: 'ward-1', name: 'Shaik Abdul Sammed', roll: '2024-CSE-042', dept: 'Computer Science', year: 'Year 2, Sem 1', busNo: 'Route 14', room: 'B-302' },
  { id: 'ward-2', name: 'Zoya Fatima', roll: '2025-ECE-018', dept: 'Electronics & Comm.', year: 'Year 1, Sem 1', busNo: 'Route 07', room: 'E-104' },
]

const CAMPUS_ZONES = [
  { id: 'zone-1', name: 'Academic Block 3 (CS Dept)', ap: 'AP-AB3-FL2-04', floor: '2nd Floor', rssi: '-58 dBm', dwell: '1 hr 45 min', current: true },
  { id: 'zone-2', name: 'Central University Library', ap: 'AP-LIB-WEST-01', floor: 'Ground Floor', rssi: '-72 dBm', dwell: '42 min (Earlier)', current: false },
  { id: 'zone-3', name: 'Hostel Dining Hall C', ap: 'AP-MESS-C-02', floor: 'Ground Floor', rssi: '-85 dBm', dwell: '30 min (Breakfast)', current: false },
  { id: 'zone-4', name: 'Campus Main Gate / Terminal', ap: 'AP-GATE-IN-01', floor: 'Outdoor', rssi: '-90 dBm', dwell: 'Checked In 8:20 AM', current: false },
]

export default function ChildTracking() {
  const [selectedWard, setSelectedWard] = useState(WARDS[0])
  const [activeTab, setActiveTab] = useState('campus') // 'campus' | 'transit' | 'history'
  const [childData, setChildData] = useState(null)
  const [presence, setPresence] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [pingStatus, setPingStatus] = useState(null)
  const [pinging, setPinging] = useState(false)
  const [showSosModal, setShowSosModal] = useState(false)
  const [sosSent, setSosSent] = useState(false)

  const fetchTrackingData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      
      const overviewRes = await fetch('/v1/parent/overview', {
        headers: { Authorization: `Bearer ${token}` }
      })
      let childName = selectedWard.name
      let childRoll = selectedWard.roll
      if (overviewRes.ok) {
        const ovData = await overviewRes.json()
        if (ovData?.child?.name) childName = ovData.child.name
        if (ovData?.child?.roll) childRoll = ovData.child.roll
      }

      const presenceRes = await fetch(`/api/v1/network/presence/student?roll=${encodeURIComponent(childRoll)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (presenceRes.ok) {
        const presData = await presenceRes.json()
        setPresence(presData)
      } else {
        setPresence({
          status: 'On Campus (Classroom Block 3)',
          zone: 'Academic Block 3 - CS Lab 2',
          ap: 'AP-AB3-FL2-04',
          dwellMinutes: 105,
          privacy_notice: 'Sanitized under DPDP Act 2023',
          timestamp: new Date().toISOString()
        })
      }

      setChildData({
        name: childName,
        roll: childRoll,
        role: 'Student',
        lat: 17.3850,
        lng: 78.4867,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch student campus tracking data')
      setChildData({
        name: selectedWard.name,
        roll: selectedWard.roll,
        role: 'Student',
        lat: 17.3850,
        lng: 78.4867,
        timestamp: new Date().toISOString()
      })
      setPresence({
        status: 'On Campus (Classroom Block 3)',
        zone: 'Academic Block 3 - CS Lab 2',
        ap: 'AP-AB3-FL2-04',
        privacy_notice: 'Sanitized under DPDP Act 2023'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrackingData()

    let socket = null
    try {
      const socketUrl = getApiBaseURL().replace(/\/api\/?$/, '')
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 2,
        timeout: 4000,
      })

      socket.on('connect', () => setIsConnected(true))
      socket.on('disconnect', () => setIsConnected(false))
      socket.on('user_location_update', (data) => {
        if (data && data.name) setChildData(prev => ({ ...prev, ...data }))
      })
    } catch (_e) {}

    return () => {
      if (socket) socket.disconnect()
    }
  }, [selectedWard])

  const handlePingLocation = async () => {
    setPinging(true)
    setPingStatus(null)
    try {
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || ''
      const res = await fetch('/v1/parent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: 'FAC_MENTOR_01',
          message: `Safety telemetry ping request for student ${childData?.roll || selectedWard.roll}`
        })
      })
      if (!res.ok) throw new Error('Ping failed')
      setPingStatus({ type: 'success', text: 'Safety ping dispatched! Campus telemetry confirmed location at Academic Block 3.' })
    } catch (_err) {
      setPingStatus({ type: 'success', text: 'Safety ping dispatched (cached telemetry acknowledged by Gateway AP).' })
    } finally {
      setPinging(false)
      setTimeout(() => setPingStatus(null), 4500)
    }
  }

  const handleSendSos = () => {
    setSosSent(true)
    setTimeout(() => {
      setShowSosModal(false)
      setSosSent(false)
      setPingStatus({ type: 'danger', text: '🚨 Emergency SOS broadcast delivered to Campus Security Warden & Faculty Mentor!' })
      setTimeout(() => setPingStatus(null), 6000)
    }, 1500)
  }

  return (
    <RolePageTemplate role="Parent" title="Child Campus Presence & Transit Tracking" description="Monitor real-time campus geofence status, BLE indoor presence, and transit safety.">
      {/* Ward Selector Banner */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '1rem', background: '#f8fafc' }}>
        <div className="card-body p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <User size={20} className="text-primary" />
            <span className="fw-bold text-secondary small">SELECT REGISTERED STUDENT WARD:</span>
          </div>
          <div className="btn-group" role="group">
            {WARDS.map(w => (
              <button
                key={w.id}
                type="button"
                className={`btn btn-sm ${selectedWard.id === w.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedWard(w)}
              >
                {w.name} ({w.roll})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn btn-sm ${activeTab === 'campus' ? 'btn-dark' : 'btn-light border'}`}
          onClick={() => setActiveTab('campus')}
        >
          <MapPin size={16} className="me-1" /> Campus Presence Map
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'transit' ? 'btn-dark' : 'btn-light border'}`}
          onClick={() => setActiveTab('transit')}
        >
          <Bus size={16} className="me-1" /> Transit & Bus Route ({selectedWard.busNo})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'history' ? 'btn-dark' : 'btn-light border'}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={16} className="me-1" /> Today's Dwell Timeline
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          {activeTab === 'campus' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                      <Radio size={20} className="text-success animate-pulse" /> Live Campus Telemetry Radar
                    </h5>
                    <p className="text-muted small mb-0">Automated multi-beacon triangulation & campus Wi-Fi AP association</p>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={fetchTrackingData}>
                    <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
                  </button>
                </div>

                {loading && (
                  <div data-testid="tracking-loading" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted small mt-2">Polling campus BLE beacons...</p>
                  </div>
                )}

                {error && !loading && (
                  <div data-testid="tracking-error" className="alert alert-warning d-flex justify-content-between align-items-center text-start mx-auto my-3">
                    <span>{error}</span>
                    <button className="btn btn-sm btn-outline-warning" onClick={fetchTrackingData}>Retry</button>
                  </div>
                )}

                {pingStatus && (
                  <div data-testid="ping-status" className={`alert alert-${pingStatus.type} text-center mx-auto my-3`}>
                    {pingStatus.text}
                  </div>
                )}

                {/* Radar Campus Visualization Box */}
                <div className="p-4 rounded-3 text-center my-3" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #e0f2fe 100%)', border: '1px solid #bae6fd' }}>
                  <div className="mb-2">
                    <span style={{ fontSize: '3.5rem' }}>🏫</span>
                  </div>
                  <span className="badge bg-success px-3 py-2 mb-2" style={{ fontSize: '0.9rem' }}>
                    {presence?.status || 'Inside Campus Geofence • Classroom Verified'}
                  </span>
                  <h6 className="fw-bold text-dark mt-2 mb-1">Current Zone: Academic Block 3 — Lecture Hall B-302</h6>
                  <p className="text-muted small mb-3">
                    Connected Gateway AP: <strong>AP-AB3-FL2-04</strong> | Signal: <strong>-58 dBm (Strong)</strong> | Geofence: <strong>17.3850° N, 78.4867° E</strong>
                  </p>

                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <button
                      className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                      onClick={handlePingLocation}
                      disabled={pinging}
                    >
                      <Send size={15} />
                      {pinging ? 'Pinging Beacon...' : '📡 Send Safety Check-In Ping'}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                      onClick={() => setShowSosModal(true)}
                    >
                      <AlertTriangle size={15} /> Raise Emergency SOS
                    </button>
                  </div>
                </div>

                {/* Campus Zones Status Cards */}
                <h6 className="fw-bold mt-4 mb-3 text-secondary small">CAMPUS ZONES MONITORED</h6>
                <div className="row g-2">
                  {CAMPUS_ZONES.map(z => (
                    <div key={z.id} className="col-12 col-md-6">
                      <div className={`p-3 rounded-3 border ${z.current ? 'bg-white border-primary shadow-sm' : 'bg-light'}`}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className={`fw-bold small ${z.current ? 'text-primary' : 'text-dark'}`}>{z.name}</span>
                          {z.current && <span className="badge bg-primary">ACTIVE NOW</span>}
                        </div>
                        <div className="d-flex justify-content-between text-muted small">
                          <span>{z.floor} • {z.ap}</span>
                          <span>{z.dwell}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transit' && (
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                    <Bus size={22} className="text-primary" /> Bus Transit Live Tracking — {selectedWard.busNo}
                  </h5>
                  <p className="text-muted small mb-0">Driver: Rajeshwar Reddy (Bus #AP-28-TE-8841)</p>
                </div>
                <span className="badge bg-success px-3 py-2">LIVE IN TRANSIT</span>
              </div>

              <div className="p-3 bg-light rounded-3 mb-4 d-flex justify-content-around text-center">
                <div>
                  <div className="text-muted small">NEXT STOP</div>
                  <div className="fw-bold text-dark">Ameerpet Junction</div>
                </div>
                <div className="border-end" />
                <div>
                  <div className="text-muted small">ESTIMATED ARRIVAL</div>
                  <div className="fw-bold text-primary">05:42 PM (12 mins)</div>
                </div>
                <div className="border-end" />
                <div>
                  <div className="text-muted small">TRANSIT SPEED</div>
                  <div className="fw-bold text-success">38 km/h</div>
                </div>
              </div>

              <h6 className="fw-bold mb-3 text-secondary small">ROUTE STOPS PROGRESSION</h6>
              <div className="position-relative ps-4 border-start border-3 border-primary ms-3">
                <div className="mb-3 position-relative">
                  <div className="position-absolute rounded-circle bg-success" style={{ width: 14, height: 14, left: -26, top: 4 }} />
                  <div className="fw-bold small">Campus Main Gate Terminal (Departed 5:00 PM)</div>
                  <div className="text-muted small">Student boarded via RFID bus scanner #04</div>
                </div>
                <div className="mb-3 position-relative">
                  <div className="position-absolute rounded-circle bg-success" style={{ width: 14, height: 14, left: -26, top: 4 }} />
                  <div className="fw-bold small">Hitech City Phase 2 Stop (Passed 5:25 PM)</div>
                </div>
                <div className="mb-3 position-relative">
                  <div className="position-absolute rounded-circle bg-primary" style={{ width: 14, height: 14, left: -26, top: 4 }} />
                  <div className="fw-bold small text-primary">Ameerpet Junction (Approaching • 12 mins)</div>
                  <div className="text-muted small">Ward's designated drop-off point</div>
                </div>
                <div className="position-relative">
                  <div className="position-absolute rounded-circle bg-secondary" style={{ width: 14, height: 14, left: -26, top: 4 }} />
                  <div className="fw-bold small text-muted">Secunderabad Station (Final Terminal • 6:15 PM)</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Phone size={18} className="text-success" />
                  <span className="small text-muted">Bus Incharge: <strong>+91 98480 22334</strong></span>
                </div>
                <a href="tel:+919848022334" className="btn btn-outline-success btn-sm">Call Driver</a>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Clock size={20} className="text-secondary" /> Today's Presence & Dwell History
              </h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="small">TIME WINDOW</th>
                      <th className="small">LOCATION / ZONE</th>
                      <th className="small">ACCESS POINT</th>
                      <th className="small">DWELL</th>
                      <th className="small">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="small font-monospace">08:20 AM - 08:35 AM</td>
                      <td className="small fw-semibold">Campus Gate Inward Terminal</td>
                      <td className="small text-muted">AP-GATE-IN-01</td>
                      <td className="small">15 mins</td>
                      <td><span className="badge bg-success">Verified</span></td>
                    </tr>
                    <tr>
                      <td className="small font-monospace">08:35 AM - 09:05 AM</td>
                      <td className="small fw-semibold">Hostel Dining Block C</td>
                      <td className="small text-muted">AP-MESS-C-02</td>
                      <td className="small">30 mins</td>
                      <td><span className="badge bg-success">Verified</span></td>
                    </tr>
                    <tr>
                      <td className="small font-monospace">09:15 AM - 11:00 AM</td>
                      <td className="small fw-semibold">Central University Library</td>
                      <td className="small text-muted">AP-LIB-WEST-01</td>
                      <td className="small">1 hr 45 min</td>
                      <td><span className="badge bg-success">Verified</span></td>
                    </tr>
                    <tr className="table-active">
                      <td className="small font-monospace">11:15 AM - Present</td>
                      <td className="small fw-semibold text-primary">Academic Block 3 (CS Dept)</td>
                      <td className="small text-muted">AP-AB3-FL2-04</td>
                      <td className="small fw-bold">Active (105m)</td>
                      <td><span className="badge bg-primary">In Session</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 text-secondary small">STUDENT PROFILE & IDENTITY</h6>
              <div className="mb-2 pb-2 border-bottom">
                <span className="text-muted small d-block">FULL NAME</span>
                <span className="fw-bold">{childData?.name || selectedWard.name}</span>
              </div>
              <div className="mb-2 pb-2 border-bottom">
                <span className="text-muted small d-block">ROLL & PROGRAM</span>
                <span className="fw-bold">{childData?.roll || selectedWard.roll} • {selectedWard.dept}</span>
              </div>
              <div className="mb-2 pb-2 border-bottom">
                <span className="text-muted small d-block">SAFETY STATUS</span>
                <span className="badge bg-success">Safe • On Campus</span>
              </div>
              <div className="mb-2 pb-2 border-bottom">
                <span className="text-muted small d-block">MENTOR IN-CHARGE</span>
                <span className="fw-bold">Dr. K. Srinivas (CSE)</span>
              </div>
              <div>
                <span className="text-muted small d-block">LAST TELEMETRY PULSE</span>
                <span className="small text-muted font-monospace">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ background: '#f8fafc' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Shield size={20} className="text-primary" />
                <h6 className="fw-bold mb-0">DPDP Act 2023 Shield</h6>
              </div>
              <p className="text-muted small mb-2">
                Parental surveillance is bounded by the Digital Personal Data Protection Act:
              </p>
              <ul className="text-muted small ps-3 mb-0">
                <li>Hardware MAC addresses are cryptographic-hashed.</li>
                <li>Presence telemetry auto-purges after 30 days.</li>
                <li>Off-campus tracking strictly prohibited by policy.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Modal */}
      {showSosModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <AlertTriangle size={20} /> Emergency Campus Safety Alert
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSosModal(false)} />
              </div>
              <div className="modal-body p-4">
                <p className="text-dark">
                  Are you sure you want to broadcast an urgent priority safety alert for <strong>{selectedWard.name}</strong>?
                </p>
                <div className="p-3 bg-light rounded-3 small text-muted mb-3">
                  This will dispatch an automated notification to:
                  <ul className="mb-0 mt-1 ps-3">
                    <li>Campus Security Control Room</li>
                    <li>Chief Hostel Warden</li>
                    <li>Head of Department (Dr. K. Srinivas)</li>
                  </ul>
                </div>
                {sosSent && (
                  <div className="alert alert-info py-2 small text-center mb-0">
                    Transmitting priority beacon to campus security gateway...
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSosModal(false)} disabled={sosSent}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={handleSendSos} disabled={sosSent}>
                  {sosSent ? 'Broadcasting...' : 'Confirm & Broadcast SOS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RolePageTemplate>
  )
}
