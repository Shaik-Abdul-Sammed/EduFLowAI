import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'
import { useAuth } from '../../hooks/useAuth'

const PURPLE = '#7C3AED'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'

export default function Page() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    let isMounted = true
    const fetchLogs = async () => {
      if (!user) return
      
      try {
        const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
        const url = new URL(getApiBaseURL() + '/v1/admin/audit-logs')
        if (filter !== 'All') {
          url.searchParams.append('category', filter)
        }
        
        const res = await fetch(url, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        
        if (res.ok) {
          const data = await safeJson(res)
          if (isMounted) setLogs(Array.isArray(data) ? data : (data.logs || []))
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLogs()
    return () => {
      isMounted = false
    }
  }, [filter, user])

  return (
    <RolePageTemplate role="Admin" title="Audit Logs" description="Real-time institutional system log of administrative, security, and academic activities.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Analytics mini summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Total Logs (Active Filter)', value: logs.length, color: PURPLE, icon: '📜' },
            { label: 'Security Alerts', value: logs.filter(l => l.category === 'Security' && l.status === 'failed').length, color: RED, icon: '⚠️' },
            { label: 'Successful Executions', value: logs.filter(l => l.status === 'success').length, color: GREEN, icon: '✓' },
            { label: 'Monitored IPs', value: new Set(logs.map(l => l.ip)).size, color: AMBER, icon: '🌐' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'System', 'Security', 'Officers', 'Academics'].map(c => (
            <button key={c} onClick={() => setFilter(c)}
              style={{
                padding: '0.4rem 0.875rem', borderRadius: '2rem',
                border: `2px solid ${filter === c ? PURPLE : 'var(--border-color)'}`,
                background: filter === c ? `${PURPLE}15` : 'var(--card-bg)',
                color: filter === c ? PURPLE : '#64748b', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
              }}>
              {c} Logs
            </button>
          ))}
        </div>

        {/* Audit Log Table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>System Transactions</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading logs...</div> : (
              <table className="table table-hover mb-0">
                <thead>
                  <tr style={{ background: 'var(--surface-bg)' }}>
                    {['Timestamp', 'User', 'Role', 'Category', 'Action performed', 'IP Address', 'Status'].map(h => (
                      <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No logs found.</td></tr>
                  ) : logs.map(l => (
                    <tr key={l.id} style={{ borderLeft: l.status === 'failed' ? '3px solid #EF4444' : '3px solid transparent' }}>
                      <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 700 }}>{l.user}</td>
                      <td style={{ fontSize: '0.82rem', color: '#475569', textTransform: 'capitalize' }}>{l.role}</td>
                      <td>
                        <span className="badge text-bg-light" style={{ border: '1px solid var(--border-color)' }}>{l.category}</span>
                      </td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 600 }}>{l.action}</td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{l.ip}</td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '2rem',
                          background: l.status === 'success' ? '#10B98115' : '#EF444415',
                          color: l.status === 'success' ? GREEN : RED,
                          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </RolePageTemplate>
  )
}
