import { useState } from 'react'
import { ShieldCheck, Printer } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import QRCodeSvg from '../../components/QRCodeSvg'

export default function DigitalIdCard() {
  const [student] = useState({
    name: 'Ananya Sharma',
    rollNumber: 'SS26',
    department: 'Computer Science & Engineering',
    degree: 'Bachelor of Technology (B.Tech)',
    validTill: '2028-06-30',
    bloodGroup: 'O+ Positive',
    emergencyContact: '+91 90101 50809',
    institution: 'Sri Siddhartha Institute of Technology',
    dob: '2005-08-14'
  })

  // Encoded payload string for optical scanners & turnstiles
  const qrPayload = `EDUID:${student.rollNumber}|NAME:${student.name}|BG:${student.bloodGroup}|VALID:${student.validTill}|INST:SSIT`

  const handlePrint = () => {
    window.print()
  }

  return (
    <RolePageTemplate role="student" title="Student Digital Identity Card">
      <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>Official Student Smart Pass</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Valid for smart turnstile entry, automated library checkout, and lab access</p>
        </div>

        {/* Physical ID Card Replica */}
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 18,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }}
        >
          {/* Top Header Strip */}
          <div style={{ background: '#2563EB', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{student.institution}</div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>Affiliated to VTU &bull; AICTE & NAAC A++ Accredited</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <ShieldCheck size={18} />
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '24px 22px', display: 'flex', gap: 20, alignItems: 'center' }}>
            {/* Student Avatar / Photo */}
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
                AS
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#10B981', color: '#FFFFFF' }}>
                ACTIVE
              </span>
            </div>

            {/* Student Meta Details */}
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
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Scan at security turnstile & library gate</div>
              <div style={{ fontSize: 9, color: '#64748B', marginTop: 4 }}>Emergency: {student.emergencyContact}</div>
            </div>

            <div>
              <QRCodeSvg value={qrPayload} size={74} bgColor="#FFFFFF" fgColor="#0F172A" />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 8,
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            <Printer size={16} /> Print Official PVC Card
          </button>
        </div>
      </div>
    </RolePageTemplate>
  )
}
