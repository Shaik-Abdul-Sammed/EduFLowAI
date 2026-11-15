import { Link, useLocation } from 'react-router-dom'

export default function Breadcrumbs() {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)
  const compact = () => {
    if (parts.length <= 3) return parts
    return [parts[0], '…', ...parts.slice(-2)]
  }

  const trail = compact()

  return (
    <nav aria-label="breadcrumb" className="breadcrumb-nav d-inline-block">
      <ol className="breadcrumb mb-0 py-1" style={{ background: 'transparent' }}>
        <li className="breadcrumb-item"><Link to="/directory">Directory</Link></li>
        {trail.map((p, idx) => {
          const originalIndex = idx === 1 && trail[1] === '…' ? null : (idx === 0 ? 0 : parts.length - (trail.length - idx))
          const to = originalIndex === null ? '#' : '/' + parts.slice(0, originalIndex + 1).join('/')
          const label = p === '…' ? '…' : p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          const isLast = idx === trail.length - 1
          return (
            <li key={`${to}-${idx}`} className={`breadcrumb-item ${isLast ? 'active' : ''}`} aria-current={isLast ? 'page' : undefined}>
              {p === '…' ? <span className="text-muted">…</span> : (isLast ? label : <Link to={to}>{label}</Link>)}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
