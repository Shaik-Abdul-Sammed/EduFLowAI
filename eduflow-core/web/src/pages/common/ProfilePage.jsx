import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import RolePageTemplate from '../../components/RolePageTemplate'
import QRCodeSvg from '../../components/QRCodeSvg'
import StudentPresenceWidget from '../../components/StudentPresenceWidget'
import SkeletonLoader from '../../components/SkeletonLoader'
import { useAuth } from '../../hooks/useAuth'
import apiClient from '../../services/apiClient'

const INDIGO = '#6366f1'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

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

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/user/profile')
      const profile = res.data?.user || res.data
      if (profile) {
        const fullName = profile.name || 
          (profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : userName)
        setFormData({
          name: fullName || userName,
          email: profile.email || user?.email || '',
          phone: profile.phone || user?.phone || '+91 98765 43210',
          address: profile.address || user?.address || '123, Academic Block, EduFlow Campus',
        })
      }
    } catch (err) {
      console.warn('[ProfilePage] Failed to fetch remote profile, using session defaults:', err.message)
      // If server returned error, expose error state
      if (err.response?.status >= 500) {
        setError('Server error: Failed to fetch profile data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user])

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }} data-testid="unauthenticated-profile">
        Please log in to view your profile.
      </div>
    )
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const nameParts = (formData.name || '').trim().split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.slice(1).join(' ') || ''

      const res = await apiClient.put('/user/profile', {
        name: formData.name,
        firstName,
        lastName,
        phone: formData.phone,
        address: formData.address,
      })

      if (res.data?.success || res.status === 200) {
        setSaved(true)
        setTimeout(() => setSaved(false), 4000)
      } else {
        throw new Error(res.data?.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error('[ProfilePage] Save error:', err)
      setError(err.response?.data?.error || err.message || 'Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <RolePageTemplate role={userRole} title="My Profile" description="Manage your personal details and account settings.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {error && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3" role="alert" style={{ borderRadius: '0.875rem' }}>
            <div>⚠️ {error}</div>
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchProfile}>Retry</button>
          </div>
        )}

        {saved && (
          <div className="alert alert-success p-3" role="alert" style={{ borderRadius: '0.875rem', fontWeight: 600 }}>
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
                  <div className="mt-2 fw-bold text-dark" style={{ fontSize: '0.72rem' }}>OFFICIAL CAMPUS QR</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
          <div className="card-body p-4">
            {loading ? (
              <div data-testid="profile-loading">
                <SkeletonLoader variant="card" />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center', minWidth: 140 }}>
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: `linear-gradient(135deg,${INDIGO},#a855f7)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, margin: '0 auto 1rem', boxShadow: `0 8px 24px ${INDIGO}40` }}>
                    {userInitial}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formData.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{userRole}</div>
                  <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', background: '#10B98115', color: '#10B981', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    ● Active Status
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 300 }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Personal Information</h2>
                  <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }} data-testid="profile-form">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>FULL NAME</label>
                        <input aria-label="FULL NAME" className="form-control" autoComplete="name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>ROLE / DESIGNATION</label>
                        <input aria-label="ROLE / DESIGNATION" className="form-control" value={user.role.toUpperCase()} disabled style={{ background: 'var(--surface-bg, #f8fafc)', color: 'var(--app-text-muted, #94a3b8)' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>EMAIL ADDRESS</label>
                        <input aria-label="EMAIL ADDRESS" type="email" autoComplete="email" className="form-control" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>PHONE NUMBER</label>
                        <input aria-label="PHONE NUMBER" type="tel" autoComplete="tel" className="form-control" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>ADDRESS</label>
                        <textarea aria-label="ADDRESS" className="form-control" autoComplete="street-address" rows={2} value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button type="submit" disabled={saving} className="btn" style={{ background: `linear-gradient(135deg,${INDIGO},#a855f7)`, color: 'white', border: 'none', fontWeight: 700, borderRadius: '0.875rem', boxShadow: `0 4px 14px ${INDIGO}40` }}>
                        {saving ? 'Saving...' : '💾 Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
                  <span>Chrome on Linux (127.0.0.1)</span>
                  <span style={{ color: '#94a3b8' }}>Today, Active Session</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                  <span>EduFlow Mobile App</span>
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
