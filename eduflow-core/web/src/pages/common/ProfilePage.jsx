import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { useAuth } from '../../hooks/useAuth'

const INDIGO = '#6366f1'

export default function ProfilePage() {
  const { user } = useAuth()
  const userName = user?.name || user?.username || 'User'
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'
  const userInitial = userName.charAt(0).toUpperCase()

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
