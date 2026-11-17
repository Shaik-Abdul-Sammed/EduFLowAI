import { useState, useEffect } from 'react'
import {
  ShieldCheck, Printer, RotateCw, Wifi, QrCode, Lock,
  Unlock, CheckCircle2, AlertTriangle, Download, Smartphone
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import QRCodeSvg from '../../components/QRCodeSvg'

export default function DigitalIdCard() {
  const [student, setStudent] = useState({
    name: 'Shaik Abdul Sammed',
    rollNumber: '2024-CSE-042',
    department: 'Computer Science & Engineering',
    degree: 'Bachelor of Technology (B.Tech)',
    validTill: '2028-06-30',
    bloodGroup: 'B+ Positive',
    emergencyContact: '+91 90101 50809',
    institution: 'EduFlow Institute of Technology',
    busRoute: 'Bus Route 14 (Ameerpet)',
    hostelRoom: 'Block B - Room 302',
    libraryId: 'LIB-2024-8842',
    dob: '2005-08-14'
  })

  const [isFlipped, setIsFlipped] = useState(false)
  const [isFrozen, setIsFrozen] = useState(false)
  const [gateCheckIn, setGateCheckIn] = useState(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [rotatingToken, setRotatingToken] = useState('849-201')

  useEffect(() => {
    const timer = setInterval(() => {
      setRotatingToken(Math.floor(100 + Math.random() * 900) + '-' + Math.floor(100 + Math.random() * 900))
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  const qrPayload = `EDUID:${student.rollNumber}|TOKEN:${rotatingToken}|NAME:${student.name}|BG:${student.bloodGroup}|VALID:${student.validTill}|INST:EFIT`

  const handlePrint = () => {
    window.print()
  }

  const handleSimulateTap = () => {
    if (isFrozen) {
      setGateCheckIn({ success: false, text: 'Turnstile DENIED: Digital ID card is frozen by student.' })
      setTimeout(() => setGateCheckIn(null), 4000)
      return
    }
    setCheckingIn(true)
    setTimeout(() => {
      setCheckingIn(false)
      setGateCheckIn({ success: true, text: `Turnstile Gate #02 (Main Quad) — Access GRANTED at ${new Date().toLocaleTimeString()} (BLE Beacon Associated)` })
      setTimeout(() => setGateCheckIn(null), 4500)
    }, 600)
  }

  return (
    <RolePageTemplate role="student" title="Student Digital Identity Card & Smart Pass">
      <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>Official Student Smart Pass</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
            NFC contactless turnstile entry, automated library checkout, and transport verification
          </p>
        </div>

        {gateCheckIn && (
          <div
            className={`alert ${gateCheckIn.success ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-2 mb-3 py-2 px-3`}
            style={{ width: '100%', maxWidth: 480, borderRadius: 12 }}
          >
            {gateCheckIn.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span className="small fw-semibold">{gateCheckIn.text}</span>
          </div>
        )}

        {/* Card Container */}
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 18,
            overflow: 'hidden',
            background: isFrozen
              ? 'linear-gradient(145deg, #475569 0%, #1e293b 100%)'
              : 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            border: isFrozen ? '2px dashed #ef4444' : '1px solid rgba(255,255,255,0.15)',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Top Header Strip */}
          <div style={{ background: isFrozen ? '#ef4444' : '#2563EB', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{student.institution}</div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>Affiliated to VTU • AICTE & NAAC A++ Accredited</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wifi size={16} className="text-white" />
              <div style={{ width: 28, height: 28, borderRadius: 14, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFrozen ? '#ef4444' : '#2563EB' }}>
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>

          {!isFlipped ? (
            /* FRONT OF CARD */
            <div>
              <div style={{ padding: '22px 20px', display: 'flex', gap: 18, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 104,
                      height: 120,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: 28,
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                  >
                    SAS
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: isFrozen ? '#ef4444' : '#10B981', color: '#FFFFFF' }}>
                    {isFrozen ? 'FROZEN / LOCKED' : 'ACTIVE PASS'}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px 0', color: '#FFFFFF' }}>{student.name}</h3>
                  <div style={{ fontSize: 13, color: '#93C5FD', fontWeight: 600, marginBottom: 8 }}>Roll: {student.rollNumber}</div>

                  <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div><strong>Dept:</strong> {student.department}</div>
                    <div><strong>Program:</strong> {student.degree}</div>
                    <div>
                      <strong>Blood Group:</strong> <span style={{ color: '#F87171', fontWeight: 700 }}>{student.bloodGroup}</span>
                    </div>
                    <div><strong>Valid Until:</strong> {student.validTill}</div>
                  </div>
                </div>
              </div>

              {/* Bottom QR Code & Barcode Verification Strip */}
              <div style={{ background: '#0F172A', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.04em' }}>CAMPUS ENTRY QR PASS</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Rotating Code: <span className="font-monospace text-warning">{rotatingToken}</span> (Anti-Proxy)</div>
                  <div style={{ fontSize: 9, color: '#64748B', marginTop: 4 }}>Emergency: {student.emergencyContact}</div>
                </div>

                <div>
                  <QRCodeSvg value={qrPayload} size={74} bgColor="#FFFFFF" fgColor="#0F172A" />
                </div>
              </div>
            </div>
          ) : (
            /* BACK OF CARD */
            <div style={{ padding: '20px' }}>
              <h6 className="fw-bold text-primary mb-2 small text-uppercase">Cardholder Entitlements & Transit</h6>
              <div className="p-3 bg-dark rounded border border-secondary mb-3 small">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Assigned Bus Route:</span>
                  <strong>{student.busRoute}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Hostel Allocation:</span>
                  <strong>{student.hostelRoom}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Library Card ID:</span>
                  <strong className="font-monospace">{student.libraryId}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Date of Birth:</span>
                  <strong>{student.dob}</strong>
                </div>
              </div>

              {/* Simulated Barcode */}
              <div className="text-center p-2 bg-white rounded text-dark mb-3">
                <div className="font-monospace fw-bold" style={{ letterSpacing: '0.35rem', fontSize: '1.1rem' }}>
                  ||||| | |||| ||| |||| | ||||| || |||
                </div>
                <div className="small font-monospace text-muted">{student.rollNumber}</div>
              </div>

              <div className="text-muted small" style={{ fontSize: '0.7rem', lineHeight: 1.4 }}>
                This card is the property of EduFlow Institute of Technology. If found, please return to Security Main Gate or call +91 90101 50809.
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="d-flex gap-2 flex-wrap justify-content-center mt-4">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
          >
            <RotateCw size={15} /> {isFlipped ? 'Flip to Front Side' : 'Flip to Back Side'}
          </button>

          <button
            onClick={handleSimulateTap}
            disabled={checkingIn}
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          >
            <Smartphone size={15} /> {checkingIn ? 'Authenticating NFC...' : 'Simulate NFC Turnstile Tap'}
          </button>

          <button
            onClick={() => setIsFrozen(!isFrozen)}
            className={`btn btn-sm d-flex align-items-center gap-2 ${isFrozen ? 'btn-danger' : 'btn-outline-danger'}`}
          >
            {isFrozen ? <Unlock size={15} /> : <Lock size={15} />}
            {isFrozen ? 'Unfreeze Card' : 'Freeze Card (Lost / Stolen)'}
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          >
            <Printer size={15} /> Print PVC Card
          </button>
        </div>
      </div>
    </RolePageTemplate>
  )
}
