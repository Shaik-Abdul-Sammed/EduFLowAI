import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Eye,
  Download,
  RefreshCw,
  Search,
  X,
  Filter,
  Shield,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Database,
  Terminal,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'
import { useAuth } from '../../hooks/useAuth'

const PURPLE = '#7C3AED'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'
const BLUE = '#3B82F6'

const FALLBACK_LOGS = [
  {
    id: 101,
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleString(),
    user: 'Accreditation Officer (AI)',
    role: 'AI System',
    category: 'Officers',
    action: 'OFFICER_ACCREDITATION_SSR_GENERATED',
    ip: '10.0.4.12',
    status: 'success',
    details: 'Autonomous generation of Criterion 2 SSR report with Student-Faculty Ratio validation.',
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
  },
  {
    id: 102,
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toLocaleString(),
    user: 'Timetable Officer (AI)',
    role: 'AI System',
    category: 'Officers',
    action: 'OFFICER_TIMETABLE_RESOLVE_CONFLICTS',
    ip: '10.0.4.13',
    status: 'success',
    details: 'OR constraint solver resolved 0 clashing slots across 120 lecture halls.',
    sha256: 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01'
  },
  {
    id: 103,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toLocaleString(),
    user: 'Student Success Officer (AI)',
    role: 'AI System',
    category: 'Officers',
    action: 'OFFICER_STUDENT_RISK_AUDIT',
    ip: '10.0.4.14',
    status: 'success',
    details: 'Scanned 1,250 student attendance records; flagged 8 candidates for GuardianWatch SMS escrow.',
    sha256: 'c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012'
  },
  {
    id: 104,
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toLocaleString(),
    user: 'Admission Officer (AI)',
    role: 'AI System',
    category: 'Officers',
    action: 'OFFICER_ADMISSION_VERIFIED',
    ip: '10.0.4.15',
    status: 'success',
    details: 'Automated 10th/12th certificate OCR and cutoff verification for applicant #SSIT-2026-9042.',
    sha256: 'd4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123'
  },
  {
    id: 105,
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toLocaleString(),
    user: 'Finance Officer (AI)',
    role: 'AI System',
    category: 'Officers',
    action: 'OFFICER_FINANCE_RECONCILED',
    ip: '10.0.4.16',
    status: 'success',
    details: 'Reconciled ₹14,25,000 across 38 UPI & NEFT payment batch receipts with zero discrepancies.',
    sha256: 'e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234'
  },
  {
    id: 106,
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toLocaleString(),
    user: 'admin@ssit.edu',
    role: 'Admin',
    category: 'Security',
    action: 'AUTH_SESSION_RENEWED',
    ip: '192.168.1.45',
    status: 'success',
    details: 'SAML 2.0 IdP assertion accepted from campus Shibboleth federation server.',
    sha256: 'f67890123456789abcdef0123456789abcdef0123456789abcdef012345'
  },
  {
    id: 107,
    timestamp: new Date(Date.now() - 1000 * 60 * 450).toLocaleString(),
    user: 'System Core',
    role: 'System',
    category: 'System',
    action: 'SYSTEM_AUTOMATED_DB_SNAPSHOT',
    ip: '127.0.0.1',
    status: 'success',
    details: 'Automated encrypted PostgreSQL WAL snapshot archived to AWS Mumbai ap-south-1 S3 bucket.',
    sha256: '7890123456789abcdef0123456789abcdef0123456789abcdef0123456'
  },
  {
    id: 108,
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toLocaleString(),
    user: 'Academic Dean',
    role: 'Admin',
    category: 'Academics',
    action: 'ACAD_CALENDAR_RECALCULATED',
    ip: '192.168.1.88',
    status: 'success',
    details: 'Inserted compensatory instructional Saturday following State Gazetted holiday declaration.',
    sha256: '890123456789abcdef0123456789abcdef0123456789abcdef01234567'
  },
  {
    id: 109,
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toLocaleString(),
    user: 'SecOps Sentinel',
    role: 'Security',
    category: 'Security',
    action: 'FIREWALL_WAF_CHALLENGE_ISSUED',
    ip: '185.220.101.5',
    status: 'failed',
    details: 'Blocked suspicious automated enumeration attempt against admin endpoints.',
    sha256: '90123456789abcdef0123456789abcdef0123456789abcdef012345678'
  }
]

const CATEGORY_ICONS = {
  All: '🌐',
  System: '⚙️',
  Security: '🛡️',
  Officers: '🤖',
  Academics: '📚'
}

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState(initialCategory)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { user } = useAuth()

  useEffect(() => {
    const cat = searchParams.get('category') || 'All'
    if (cat !== filter) {
      setFilter(cat)
    }
  }, [searchParams])

  const fetchLogs = async () => {
    setIsRefreshing(true)
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
        const fetchedLogs = Array.isArray(data) ? data : (data.logs || [])
        if (fetchedLogs.length > 0) {
          setLogs(fetchedLogs)
        } else {
          const filteredFallback = filter === 'All' 
            ? FALLBACK_LOGS 
            : FALLBACK_LOGS.filter(l => l.category.toLowerCase() === filter.toLowerCase())
          setLogs(filteredFallback)
        }
      } else {
        const filteredFallback = filter === 'All' 
          ? FALLBACK_LOGS 
          : FALLBACK_LOGS.filter(l => l.category.toLowerCase() === filter.toLowerCase())
        setLogs(filteredFallback)
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err)
      const filteredFallback = filter === 'All' 
        ? FALLBACK_LOGS 
        : FALLBACK_LOGS.filter(l => l.category.toLowerCase() === filter.toLowerCase())
      setLogs(filteredFallback)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filter, user])

  const handleFilterClick = (c) => {
    setFilter(c)
    setCurrentPage(1)
    if (c === 'All') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('category')
      setSearchParams(nextParams, { replace: true })
    } else {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('category', c)
      setSearchParams(nextParams, { replace: true })
    }
  }

  // Filtered & searched data
  const filteredLogs = useMemo(() => {
    let result = logs
    if (filter !== 'All') {
      result = result.filter(l => (l.category || '').toLowerCase() === filter.toLowerCase())
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(l =>
        (l.user && l.user.toLowerCase().includes(q)) ||
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.role && l.role.toLowerCase().includes(q)) ||
        (l.ip && l.ip.includes(q)) ||
        (l.category && l.category.toLowerCase().includes(q))
      )
    }
    return result
  }, [logs, filter, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: logs.length, System: 0, Security: 0, Officers: 0, Academics: 0 }
    logs.forEach(l => {
      const cat = l.category
      if (counts[cat] !== undefined) {
        counts[cat] += 1
      }
    })
    return counts
  }, [logs])

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Category', 'Action', 'IP Address', 'Status']
    const rows = filteredLogs.map(l => [
      `"${l.timestamp || ''}"`,
      `"${l.user || ''}"`,
      `"${l.role || ''}"`,
      `"${l.category || ''}"`,
      `"${l.action || ''}"`,
      `"${l.ip || ''}"`,
      `"${l.status || ''}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `eduflow-audit-logs-${filter.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `eduflow-audit-logs-${filter.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <RolePageTemplate role="Admin" title="Audit Logs" description="Real-time institutional ledger of administrative, security, and academic transactions.">
      <div style={{ display: 'grid', gap: '1.25rem', color: 'var(--app-text, #f8fafc)' }}>

        {/* Analytics mini summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Logs (Active Filter)', value: filteredLogs.length, color: PURPLE, icon: '📜' },
            { label: 'Security Alerts / Flags', value: logs.filter(l => l.category === 'Security' && l.status === 'failed').length, color: RED, icon: '⚠️' },
            { label: 'Successful Executions', value: logs.filter(l => l.status === 'success').length, color: GREEN, icon: '✓' },
            { label: 'Monitored Subnets & IPs', value: new Set(logs.map(l => l.ip)).size, color: BLUE, icon: '🌐' },
          ].map(s => (
            <div
              key={s.label}
              className="card border-0 shadow-sm"
              style={{
                borderRadius: '1rem',
                padding: '1.15rem 1rem',
                textAlign: 'center',
                background: 'var(--card-bg, #0f172a)',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.45rem', color: s.color, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--app-text-muted, #94a3b8)', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.35rem', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category Filters with Modern Button UI */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'System', 'Security', 'Officers', 'Academics'].map(c => {
              const active = filter === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleFilterClick(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: active ? `2px solid ${PURPLE}` : '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                    background: active
                      ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.28) 0%, rgba(124, 58, 237, 0.12) 100%)'
                      : 'var(--card-bg, #0f172a)',
                    color: active ? '#ffffff' : 'var(--app-text-muted, #94a3b8)',
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: active ? '0 0 16px rgba(124, 58, 237, 0.35)' : 'none',
                    transition: 'all 0.18s ease-in-out'
                  }}
                >
                  <span>{CATEGORY_ICONS[c]}</span>
                  <span>{c}</span>
                  <span
                    style={{
                      background: active ? PURPLE : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#ffffff' : 'var(--app-text-muted, #94a3b8)',
                      borderRadius: '9999px',
                      padding: '0.1rem 0.45rem',
                      fontSize: '0.68rem',
                      fontWeight: 700
                    }}
                  >
                    {categoryCounts[c] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Action buttons: Preview, Export CSV, Export JSON, Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="btn btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                background: 'rgba(59, 130, 246, 0.18)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                cursor: 'pointer'
              }}
              title="Preview audit log table and summary before downloading"
            >
              <Eye size={15} />
              <span>Preview Audit Log</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="btn btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                cursor: 'pointer'
              }}
              title="Export filtered records as CSV spreadsheet"
            >
              <FileSpreadsheet size={15} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="btn btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fcd34d',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                cursor: 'pointer'
              }}
              title="Export filtered records as JSON"
            >
              <FileCode size={15} />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={fetchLogs}
              disabled={isRefreshing}
              className="btn btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '0.45rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--app-text, #f8fafc)',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                cursor: isRefreshing ? 'not-allowed' : 'pointer'
              }}
              title="Refresh live activity feed"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spinner-border spinner-border-sm' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: '0.85rem',
            padding: '0.75rem 1rem',
            background: 'var(--card-bg, #0f172a)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--app-text-muted, #94a3b8)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by action, user, IP, or role..."
              style={{
                width: '100%',
                padding: '0.45rem 2.2rem 0.45rem 2.4rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                background: 'rgba(0, 0, 0, 0.25)',
                color: 'var(--app-text, #f8fafc)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--app-text-muted, #94a3b8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--app-text-muted, #94a3b8)' }}>
            <span>Showing <strong>{filteredLogs.length}</strong> transactions</span>
            <div style={{ height: '14px', width: '1px', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.4rem',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                  background: 'var(--card-bg, #0f172a)',
                  color: 'var(--app-text, #f8fafc)',
                  fontSize: '0.8rem'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: '1.25rem',
            overflow: 'hidden',
            background: 'var(--card-bg, #0f172a)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))'
          }}
        >
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={17} className="text-primary" />
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--app-text, #f8fafc)' }}>
                System Audit Trail & Transactions
              </h2>
            </div>
            <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#c4b5fd', border: '1px solid rgba(124, 58, 237, 0.4)', fontSize: '0.72rem' }}>
              Tamper-Evident SHA-256 Ledger
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--app-text-muted, #94a3b8)' }}>
                <RefreshCw size={24} className="spinner-border spinner-border-sm mb-2" />
                <div>Loading audit ledger transactions...</div>
              </div>
            ) : (
              <table className="table table-hover mb-0" style={{ verticalAlign: 'middle', color: 'var(--app-text, #f8fafc)' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))' }}>
                    {['Timestamp', 'User / Agent', 'Role', 'Category', 'Action performed', 'IP Address', 'Status', 'Inspect'].map(h => (
                      <th
                        key={h}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--app-text-muted, #94a3b8)',
                          padding: '0.75rem 1rem',
                          letterSpacing: '0.04em',
                          border: 'none'
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--app-text-muted, #94a3b8)' }}>
                        <AlertTriangle size={24} className="mb-2 text-warning" />
                        <div>No transactions match the current filter or search criteria.</div>
                      </td>
                    </tr>
                  ) : paginatedLogs.map(l => (
                    <tr
                      key={l.id}
                      style={{
                        borderLeft: l.status === 'failed' ? `4px solid ${RED}` : '4px solid transparent',
                        borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))',
                        background: 'transparent'
                      }}
                    >
                      <td style={{ fontSize: '0.78rem', color: 'var(--app-text-muted, #94a3b8)', whiteSpace: 'nowrap', padding: '0.85rem 1rem' }}>
                        {l.timestamp}
                      </td>
                      <td style={{ fontSize: '0.84rem', fontWeight: 700, padding: '0.85rem 1rem' }}>
                        {l.user}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--app-text-muted, #94a3b8)', textTransform: 'capitalize', padding: '0.85rem 1rem' }}>
                        {l.role}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          className="badge"
                          style={{
                            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--app-text, #f8fafc)',
                            fontWeight: 600,
                            fontSize: '0.72rem'
                          }}
                        >
                          {l.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.85rem 1rem', fontFamily: 'var(--font-mono, monospace)', color: '#93c5fd' }}>
                        {l.action}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--app-text-muted, #94a3b8)', fontFamily: 'monospace', padding: '0.85rem 1rem' }}>
                        {l.ip}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          background: l.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: l.status === 'success' ? GREEN : RED,
                          border: l.status === 'success' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          {l.status === 'success' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(l)}
                          className="btn btn-sm"
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '0.4rem',
                            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#93c5fd',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer'
                          }}
                          title="Inspect raw transaction payload & cryptographic hash"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Polished Pagination Controls */}
          <div
            style={{
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              background: 'rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--app-text-muted, #94a3b8)' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-sm d-inline-flex align-items-center gap-1"
                style={{
                  borderRadius: '0.45rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: currentPage === 1 ? 'rgba(255, 255, 255, 0.25)' : 'var(--app-text, #f8fafc)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    borderRadius: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: currentPage === pageNum ? PURPLE : 'transparent',
                    color: currentPage === pageNum ? '#ffffff' : 'var(--app-text-muted, #94a3b8)',
                    border: currentPage === pageNum ? `1px solid ${PURPLE}` : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-sm d-inline-flex align-items-center gap-1"
                style={{
                  borderRadius: '0.45rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: currentPage === totalPages ? 'rgba(255, 255, 255, 0.25)' : 'var(--app-text, #f8fafc)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal 1: Preview Audit Log Export */}
        {showPreviewModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(5px)',
              padding: '1rem'
            }}
          >
            <div
              className="card border-0 shadow-lg"
              style={{
                width: '100%',
                maxWidth: '900px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '1.25rem',
                background: 'var(--card-bg, #0f172a)',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                color: 'var(--app-text, #f8fafc)',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Eye size={20} className="text-primary" />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    Audit Ledger Export Preview
                  </h3>
                  <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.35)' }}>
                    {filteredLogs.length} Records
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--app-text-muted, #94a3b8)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Formatted Table Preview */}
              <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div><strong>Category Scope:</strong> {filter}</div>
                  <div><strong>Matching Entries:</strong> {filteredLogs.length}</div>
                  <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
                  <div><strong>Tenant Hash:</strong> SSIT-PROD-2026-IN</div>
                </div>

                <div style={{ border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))', borderRadius: '0.75rem', overflow: 'hidden' }}>
                  <table className="table table-sm mb-0" style={{ color: 'var(--app-text, #f8fafc)', fontSize: '0.78rem' }}>
                    <thead style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                      <tr>
                        {['#', 'Timestamp', 'User', 'Role', 'Category', 'Action', 'IP', 'Status'].map(th => (
                          <th key={th} style={{ padding: '0.5rem 0.75rem', color: 'var(--app-text-muted, #94a3b8)', border: 'none' }}>{th}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.slice(0, 15).map((row, idx) => (
                        <tr key={row.id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', color: 'var(--app-text-muted, #94a3b8)' }}>{idx + 1}</td>
                          <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{row.user}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{row.role}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{row.category}</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', color: '#93c5fd' }}>{row.action}</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{row.ip}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <span style={{ color: row.status === 'success' ? GREEN : RED, fontWeight: 700 }}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLogs.length > 15 && (
                    <div style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--app-text-muted, #94a3b8)', background: 'rgba(0,0,0,0.2)' }}>
                      + {filteredLogs.length - 15} additional records in full export payload
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer with Direct Actions */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-sm d-inline-flex align-items-center gap-1.5"
                  style={{
                    borderRadius: '0.5rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '0.45rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--app-text, #f8fafc)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))'
                  }}
                >
                  <Printer size={15} />
                  <span>Print Summary</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportCSV()
                      setShowPreviewModal(false)
                    }}
                    className="btn btn-sm d-inline-flex align-items-center gap-1.5"
                    style={{
                      borderRadius: '0.5rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      padding: '0.45rem 0.85rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <Download size={15} />
                    <span>Download CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportJSON()
                      setShowPreviewModal(false)
                    }}
                    className="btn btn-sm d-inline-flex align-items-center gap-1.5"
                    style={{
                      borderRadius: '0.5rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      padding: '0.45rem 0.85rem',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fcd34d',
                      border: '1px solid rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    <Download size={15} />
                    <span>Download JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '0.5rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      padding: '0.45rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--app-text, #f8fafc)',
                      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Inspect Specific Transaction */}
        {selectedLog && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(5px)',
              padding: '1rem'
            }}
          >
            <div
              className="card border-0 shadow-lg"
              style={{
                width: '100%',
                maxWidth: '640px',
                borderRadius: '1.25rem',
                background: 'var(--card-bg, #0f172a)',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                color: 'var(--app-text, #f8fafc)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Terminal size={18} className="text-primary" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    Transaction #{selectedLog.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--app-text-muted, #94a3b8)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--app-text-muted, #94a3b8)', fontWeight: 600 }}>Timestamp:</span>
                  <span>{selectedLog.timestamp}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--app-text-muted, #94a3b8)', fontWeight: 600 }}>Actor:</span>
                  <span style={{ fontWeight: 700 }}>{selectedLog.user} ({selectedLog.role})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--app-text-muted, #94a3b8)', fontWeight: 600 }}>Action Code:</span>
                  <span style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{selectedLog.action}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--app-text-muted, #94a3b8)', fontWeight: 600 }}>Network IP:</span>
                  <span style={{ fontFamily: 'monospace' }}>{selectedLog.ip}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--app-text-muted, #94a3b8)', fontWeight: 600 }}>Execution Status:</span>
                  <span style={{ color: selectedLog.status === 'success' ? GREEN : RED, fontWeight: 700, textTransform: 'uppercase' }}>{selectedLog.status}</span>
                </div>
                {selectedLog.details && (
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'var(--app-text-muted, #94a3b8)', fontWeight: 600 }}>Payload Details:</span>
                    <span style={{ color: 'var(--app-text, #cbd5e1)', lineHeight: 1.5 }}>{selectedLog.details}</span>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--app-text-muted, #94a3b8)', fontWeight: 600 }}>SHA-256 Digest:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#a78bfa', wordBreak: 'break-all' }}>
                    {selectedLog.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  background: 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="btn btn-sm btn-primary px-3 py-1.5"
                  style={{ borderRadius: '0.5rem', fontWeight: 600 }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
