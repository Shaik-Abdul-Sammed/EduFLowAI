const roleBadgeStyle = {
  Student: { background: 'linear-gradient(135deg,#2563EB,#06B6D4)', color: 'white' },
  Faculty: { background: 'linear-gradient(135deg,#10B981,#0EA5E9)', color: 'white' },
  Parent:  { background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white' },
  Admin:   { background: 'linear-gradient(135deg,#7C3AED,#EF4444)', color: 'white' },
}

const roleAccent = {
  Student: '#2563EB',
  Faculty: '#10B981',
  Parent:  '#F59E0B',
  Admin:   '#7C3AED',
}

export default function RolePageTemplate({ role, title, description, children }) {
  const accent = roleAccent[role] ?? '#2563EB'
  const badgeStyle = roleBadgeStyle[role] ?? { background: '#2563EB', color: 'white' }

  return (
    <div className="role-page" style={{ animation: 'fadeInUp 0.45s ease', width: '100%' }}>
      {/* Page Header Card */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
        {/* Accent strip */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
        <div className="card-body p-4">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{
                ...badgeStyle,
                display: 'inline-block',
                padding: '0.3rem 0.85rem',
                borderRadius: '2rem', fontSize: '0.72rem',
                fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}>
                {role} Portal
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--app-heading, var(--app-text, #0f172a))' }}>
                {title}
              </h1>
              <p style={{ color: 'var(--app-text-muted)', fontSize: '0.875rem', margin: 0 }}>{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Children slot */}
      {children ? <div>{children}</div> : null}
    </div>
  )
}

