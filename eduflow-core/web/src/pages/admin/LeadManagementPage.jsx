import { useState, useEffect, useMemo, useCallback } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { useAuth } from '../../hooks/useAuth'
import './LeadManagementPage.css'

const STATUS_LIST = [
  'ALL',
  'NEW',
  'CONTACTED',
  'PILOT_OFFERED',
  'PILOT_DELIVERED',
  'WON',
  'LOST',
]

const AUTOMATION_TYPES = [
  { id: 'ALL', label: 'All Services' },
  { id: 'accreditation', label: 'Accreditation' },
  { id: 'student-success', label: 'Student Success' },
  { id: 'timetable', label: 'Timetable' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'finance', label: 'Finance' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'placement', label: 'Placement' },
  { id: 'fee-reconciliation', label: 'Fee Reconcile' },
]

export default function LeadManagementPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [automationTypeFilter, setAutomationTypeFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchLeads = useCallback(async () => {
    try {
      setError('')
      const token = localStorage.getItem('accessToken')
      const url = new URL(`${getApiBaseURL()}/v1/leads`)
      if (statusFilter !== 'ALL') {
        url.searchParams.append('status', statusFilter)
      }
      if (automationTypeFilter !== 'ALL') {
        url.searchParams.append('automationType', automationTypeFilter)
      }
      url.searchParams.append('limit', '200')

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to load leads (${res.status})`)
      }

      const data = await res.json()
      setLeads(data.leads || [])
    } catch (err) {
      setError(err.message || 'Error fetching leads')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, automationTypeFilter])

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchLeads()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [user, fetchLeads])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const created = new Date(lead.created_at).getTime()
      if (startDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0)
        if (created < start) return false
      }
      if (endDate) {
        const end = new Date(endDate).setHours(23, 59, 59, 999)
        if (created > end) return false
      }
      return true
    })
  }, [leads, startDate, endDate])

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = leads.length
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const newThisWeek = leads.filter(
      (l) => new Date(l.created_at) >= sevenDaysAgo
    ).length
    const contacted = leads.filter((l) =>
      ['CONTACTED', 'PILOT_OFFERED', 'PILOT_DELIVERED'].includes(l.status)
    ).length
    const won = leads.filter((l) => l.status === 'WON').length
    const convRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0'

    return { total, newThisWeek, contacted, won, convRate }
  }, [leads])

  const handleSelectLead = (lead) => {
    setSelectedLead(lead)
    setNotesDraft(lead.notes || '')
  }

  const handleStatusChange = async (newStatus) => {
    if (!selectedLead) return
    try {
      setActionLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Status update failed')
      const data = await res.json()
      setSelectedLead(data.lead)
      setLeads((prev) => prev.map((l) => (l.id === data.lead.id ? data.lead : l)))
      showToast(`Status updated to ${newStatus}`)
    } catch (err) {
      showToast(err.message, true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleNotesBlur = async () => {
    if (!selectedLead || notesDraft === (selectedLead.notes || '')) return
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notesDraft }),
      })

      if (!res.ok) throw new Error('Failed to autosave notes')
      const data = await res.json()
      setSelectedLead(data.lead)
      setLeads((prev) => prev.map((l) => (l.id === data.lead.id ? data.lead : l)))
      showToast('Notes saved')
    } catch (err) {
      showToast(err.message, true)
    }
  }

  const handleSendPilotOffer = async () => {
    if (!selectedLead) return
    try {
      setActionLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch(
        `${getApiBaseURL()}/v1/leads/${selectedLead.id}/send-pilot-offer`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error('Failed to send pilot offer email')
      const data = await res.json()
      setSelectedLead(data.lead)
      setNotesDraft(data.lead?.notes || '')
      setLeads((prev) => prev.map((l) => (l.id === data.lead.id ? data.lead : l)))
      showToast(`Pilot offer dispatched to ${selectedLead.email}`)
    } catch (err) {
      showToast(err.message, true)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <RolePageTemplate
      role="Admin"
      title="Institutional Lead Pipeline"
      description="Manage incoming NAAC automation inquiries, conduct outreach, and track pilot conversions."
    >
      <div className="lead-dashboard-container">
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              padding: '0.85rem 1.25rem',
              borderRadius: '0.5rem',
              color: '#ffffff',
              background: toastMessage.isError ? '#EF4444' : '#10B981',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {toastMessage.text}
          </div>
        )}

        {/* Summary Metrics */}
        <div className="lead-stat-grid">
          <div className="lead-stat-card">
            <span className="lead-stat-val" style={{ color: '#4F46E5' }}>
              {metrics.total}
            </span>
            <span className="lead-stat-lbl">Total Leads</span>
          </div>
          <div className="lead-stat-card">
            <span className="lead-stat-val" style={{ color: '#2563EB' }}>
              {metrics.newThisWeek}
            </span>
            <span className="lead-stat-lbl">New This Week</span>
          </div>
          <div className="lead-stat-card">
            <span className="lead-stat-val" style={{ color: '#F59E0B' }}>
              {metrics.contacted}
            </span>
            <span className="lead-stat-lbl">Contacted / In Pilot</span>
          </div>
          <div className="lead-stat-card">
            <span className="lead-stat-val" style={{ color: '#10B981' }}>
              {metrics.won}
            </span>
            <span className="lead-stat-lbl">Won Institutions</span>
          </div>
          <div className="lead-stat-card">
            <span className="lead-stat-val" style={{ color: '#059669' }}>
              {metrics.convRate}%
            </span>
            <span className="lead-stat-lbl">Conversion Rate</span>
          </div>
        </div>

        {/* Filters */}
        <div className="lead-filters-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--app-text-muted)' }}>
              Status:
            </span>
            {STATUS_LIST.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '2rem',
                  border: `1.5px solid ${statusFilter === s ? '#4F46E5' : 'var(--border-color)'}`,
                  background: statusFilter === s ? '#EEF2FF' : 'transparent',
                  color: statusFilter === s ? '#4F46E5' : 'var(--app-text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--app-text-muted)' }}>
              Service:
            </span>
            <select
              className="form-select form-select-sm"
              value={automationTypeFilter}
              onChange={(e) => setAutomationTypeFilter(e.target.value)}
              style={{ width: '170px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              {AUTOMATION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--app-text-muted)' }}>
              Date:
            </span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '135px', fontSize: '0.78rem' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--app-text-muted)' }}>to</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '135px', fontSize: '0.78rem' }}
            />
            {(startDate || endDate) && (
              <button
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                style={{ fontSize: '0.78rem', padding: 0 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Leads Table */}
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: '1rem', overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Incoming Pipeline ({filteredLeads.length})
            </h3>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={fetchLeads}
              disabled={loading}
              style={{ fontSize: '0.78rem' }}
            >
              🔄 Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                Loading pipeline leads...
              </div>
            ) : error ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
                {error}
              </div>
            ) : (
              <table className="table table-hover mb-0" style={{ verticalAlign: 'middle' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-bg)' }}>
                    {['Date', 'College', 'Service', 'Contact', 'Email', 'Phone', 'Status', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#64748b',
                            padding: '0.75rem 1rem',
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No leads found matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td style={{ fontSize: '0.8rem', color: '#64748b', padding: '0.75rem 1rem' }}>
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1rem' }}>
                          <div>{lead.college_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                            {lead.city_state}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.78rem', padding: '0.75rem 1rem' }}>
                          <span className="badge rounded-pill bg-light text-primary border" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                            {lead.automation_type || 'accreditation'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', padding: '0.75rem 1rem' }}>
                          <div>{lead.contact_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {lead.designation || 'Principal'}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', padding: '0.75rem 1rem' }}>
                          <a
                            href={`mailto:${lead.email}`}
                            style={{ color: '#2563EB', textDecoration: 'none' }}
                          >
                            {lead.email}
                          </a>
                        </td>
                        <td style={{ fontSize: '0.82rem', padding: '0.75rem 1rem' }}>
                          <a
                            href={`tel:${lead.phone}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {lead.phone}
                          </a>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`lead-status-pill status-${lead.status}`}>
                            {lead.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSelectLead(lead)}
                            style={{ fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Side Panel Drawer */}
        {selectedLead && (
          <>
            <div
              className="side-panel-backdrop"
              onClick={() => setSelectedLead(null)}
            />
            <div className="lead-side-panel">
              <div className="side-panel-header">
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    Lead Workspace
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    ID: #{selectedLead.id} &bull; Submitted {new Date(selectedLead.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => setSelectedLead(null)}
                  style={{ fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              <div className="side-panel-body">
                {/* College & Contact Profile */}
                <div
                  style={{
                    background: 'var(--surface-bg, #f8fafc)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                    {selectedLead.college_name}
                  </h5>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem' }}>
                    📍 {selectedLead.city_state} &bull; 👥 {selectedLead.student_count || 'N/A'} Students &bull; 🏛️ {selectedLead.naac_cycle}
                  </div>
                  <hr style={{ margin: '0.75rem 0', opacity: 0.15 }} />
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>{selectedLead.contact_name}</strong> ({selectedLead.designation || 'Principal'})
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    ✉️ <a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a>
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    📞 <a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a>
                  </div>
                  {selectedLead.message && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        fontSize: '0.8rem',
                        background: '#ffffff',
                        padding: '0.5rem',
                        borderRadius: '0.4rem',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                      }}
                    >
                      <em>&ldquo;{selectedLead.message}&rdquo;</em>
                    </div>
                  )}
                </div>

                {/* Status Selector */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                    Pipeline Stage
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={actionLoading}
                    style={{ fontWeight: 600 }}
                  >
                    {STATUS_LIST.filter((s) => s !== 'ALL').map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Outreach & Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleSendPilotOffer}
                    disabled={actionLoading}
                    style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <span>📨</span> Send Pilot Offer Email
                  </button>

                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleStatusChange('WON')}
                    disabled={actionLoading || selectedLead.status === 'WON'}
                    style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <span>🏆</span> Mark as Won
                  </button>
                </div>

                {/* Internal Notes */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                    Internal Outreach Notes (Autosaves on blur)
                  </label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Log call details, Dean objections, pricing discussions, or next meeting dates..."
                    style={{ fontSize: '0.82rem' }}
                  />
                  <small style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    Click outside the box to save changes automatically.
                  </small>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
