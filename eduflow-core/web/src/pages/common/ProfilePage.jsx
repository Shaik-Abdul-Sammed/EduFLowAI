import { useState } from 'react'
import { Link } from 'react-router-dom'
import RolePageTemplate from '../../components/RolePageTemplate'
import QRCodeSvg from '../../components/QRCodeSvg'
import StudentPresenceWidget from '../../components/StudentPresenceWidget'
import { useAuth } from '../../hooks/useAuth'

const INDIGO = '#6366f1'

export default function ProfilePage() {
  const { user } = useAuth()
  const userName = user?.name || user?.username || 'User'
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  const studentRoll = user?.rollNumber || user?.studentId || '2024-CSE-042'
  const studentBloodGroup = user?.bloodGroup || 'O+'
  const studentDept = user?.department || 'Computer Science & Engineering'
  const qrPayload = JSON.stringify({
    rollNumber: studentRoll,
    name: userName,
    bloodGroup: studentBloodGroup,
    role: user?.role,
    campusPass: 'VERIFIED_ACTIVE',
    issuedAt: new Date().toISOString().split('T')[0]
  })

  const [formData, setFormData] = useState({
    name: userName,
    email: user?.email || `${userName.toLowerCase().replace(/\s+/g, '.')}@eduflow.edu`,
    phone: user?.phone || '+91 98765 43210',
    address: user?.address || '123, Academic Block, EduFlow Campus',
  })
  const [saved, setSaved] = useState(false)

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Please log in to view your profile.</div>
  }

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <RolePageTemplate role={userRole} title="My Profile" description="Manage your personal details and account settings.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {saved && (
          <div style={{ padding: '0.875rem', background: '#10B98110', border: '1px solid #10B98130', borderRadius: '0.875rem', color: '#065f46', fontWeight: 600, fontSize: '0.875rem' }}>
            ✅ Profile updated successfully.
          </div>
        )}

        {/* Student Dynamic Digital ID & QR Gate Pass */}
        {user.role === 'student' && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)', color: 'white' }}>
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-success text-white px-2 py-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>● ACTIVE CAMPUS PASS</span>
                    <span className="text-white-50 small">Academic Year 2026-27</span>
                  </div>
                  <h3 className="h4 fw-bold mb-1 text-white">{userName}</h3>
                  <p className="text-white-50 mb-3 small">{studentDept}</p>

                  <div className="row g-2 mb-3" style={{ maxWidth: 440 }}>
                    <div className="col-6">
                      <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 700 }}>ROLL NUMBER</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace' }}>{studentRoll}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 700 }}>BLOOD GROUP</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f87171' }}>{studentBloodGroup}</div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Link to="/student-dashboard/digital-id" className="btn btn-sm btn-light fw-bold" style={{ borderRadius: '0.75rem' }}>
                      🪪 Open Full Smart ID Badge
                    </Link>
                    <span className="text-white-50 small">Scan QR at library & campus turnstile gates</span>
                  </div>
                </div>

                <div className="text-center p-3 rounded-4 shadow-sm" style={{ background: '#ffffff', minWidth: 160 }}>
                  <QRCodeSvg value={qrPayload} size={140} fgColor="#1e1b4b" bgColor="#ffffff" />
                  <div className="mt-2 fw-bold text-dark" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    {studentRoll}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                    Blood Group: <strong className="text-danger">{studentBloodGroup}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ambient Hardware-Free Presence Tracker */}
        {user.role === 'student' && (
          <StudentPresenceWidget studentRoll={studentRoll} studentName={userName} />
        )}

        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-4" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            {/* Avatar Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: 200 }}>
              <div style={{ 
                width: 120, height: 120, borderRadius: '50%', 
                background: `linear-gradient(135deg, ${INDIGO}, #a855f7)`, 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3.5rem', fontWeight: 800, boxShadow: `0 8px 24px ${INDIGO}40`
              }}>
                {userInitial}
              </div>
              <button className="btn btn-sm" style={{ background: `${INDIGO}15`, color: INDIGO, fontWeight: 700, borderRadius: '2rem', border: `1px solid ${INDIGO}30` }}>
                Change Avatar
              </button>
            </div>

            {/* Form Section */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Personal Information</h2>
              <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>FULL NAME</label>
                    <input className="form-control" autoComplete="name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>ROLE / DESIGNATION</label>
                    <input className="form-control" value={user.role.toUpperCase()} disabled style={{ background: 'var(--surface-bg, #f8fafc)', color: 'var(--app-text-muted, #94a3b8)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>EMAIL ADDRESS</label>
                    <input type="email" autoComplete="email" className="form-control" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>PHONE NUMBER</label>
                    <input type="tel" autoComplete="tel" className="form-control" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>ADDRESS</label>
                    <textarea className="form-control" autoComplete="street-address" rows={2} value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn" style={{ background: `linear-gradient(135deg,${INDIGO},#a855f7)`, color: 'white', border: 'none', fontWeight: 700, borderRadius: '0.875rem', boxShadow: `0 4px 14px ${INDIGO}40` }}>
                    💾 Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Security / Activity */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-4">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Security & Activity</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-bg, #f8fafc)', borderRadius: '0.875rem', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Add an extra layer of security to your account.</div>
              </div>
              <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '2rem', fontWeight: 600 }}>Enable</button>
            </div>
            
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recent Login Activity</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--app-text-muted, #475569)', display: 'grid', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                  <span>Chrome on Windows (192.168.1.5)</span>
                  <span style={{ color: '#94a3b8' }}>Today, 09:41 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                  <span>Safari on iPhone (Mobile App)</span>
                  <span style={{ color: '#94a3b8' }}>Yesterday, 06:22 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </RolePageTemplate>
  )
}
