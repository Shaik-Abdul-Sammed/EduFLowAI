import React, { useState, useEffect } from 'react'
import {
  LifeBuoy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Filter,
  Clock,
  Send
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [responseMsg, setResponseMsg] = useState('')
  const [statusVal, setStatusVal] = useState('resolved')
  const [filter, setFilter] = useState('ALL')
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)

  // New ticket state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newCategory, setNewCategory] = useState('technical')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchTickets = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load support tickets (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setTickets(data?.tickets || [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading support tickets')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchTickets(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newSubject || !newDescription) return
    setCreating(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          priority: newPriority,
          description: newDescription
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to file support ticket')
      }

      setMsg(`Support ticket "${newSubject}" created successfully!`)
      setNewSubject('')
      setNewDescription('')
      setShowCreateForm(false)
      fetchTickets(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit ticket.')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedTicket) return
    setSaving(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/v1/support/tickets/${selectedTicket.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: statusVal, response: responseMsg })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update ticket')
      }

      setMsg(`Ticket #${selectedTicket.id} updated successfully!`)
      setSelectedTicket(null)
      setResponseMsg('')
      fetchTickets(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update ticket.')
    } finally {
      setSaving(false)
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'OPEN') return t.status === 'open'
    if (filter === 'IN_PROGRESS') return t.status === 'in_progress'
    if (filter === 'RESOLVED') return t.status === 'resolved' || t.status === 'closed'
    return true
  })

  return (
    <RolePageTemplate role="admin" title="Institutional Technical Support & Ticketing Desk">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }} className="d-flex align-items-center">
              <LifeBuoy className="me-2 text-primary" size={24} /> Support Tickets & Issue Resolution
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Review, triage, and resolve institutional support requests from students, staff, and faculty
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              onClick={() => fetchTickets(true)}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus size={14} /> {showCreateForm ? 'Close Form' : 'New Ticket'}
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="support-success-alert">
            <CheckCircle size={18} className="me-2 flex-shrink-0" />
            <div className="small fw-semibold">{msg}</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0">
            <AlertCircle size={18} className="me-2 flex-shrink-0" />
            <div className="small fw-semibold">{errorMsg}</div>
          </div>
        )}

        {/* New Ticket Form */}
        {showCreateForm && (
          <div className="card border-0 shadow-sm p-4">
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Raise Institutional Support Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div>
                <label htmlFor="ticket-subject" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Subject *
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  required
                  placeholder="e.g. WiFi connectivity issue in Block C"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="form-control form-control-sm"
                />
              </div>

              <div>
                <label htmlFor="ticket-category" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  id="ticket-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="technical">Technical / Network</option>
                  <option value="academic">Academic & Portal</option>
                  <option value="facilities">Campus Infrastructure</option>
                  <option value="hostel">Hostel & Mess</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="ticket-priority" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Priority
                </label>
                <select
                  id="ticket-priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High / Critical</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="ticket-description" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Description *
                </label>
                <textarea
                  id="ticket-description"
                  required
                  rows="3"
                  placeholder="Describe the issue in detail..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="form-control form-control-sm"
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                >
                  <Send size={14} /> {creating ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="support-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading institutional support tickets...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load support tickets</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchTickets(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loaded Content */}
        {!loading && !loadError && (
          <>
            {/* Filter Tabs */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Filter size={15} className="text-muted" />
              <span className="small text-muted me-1">Filter:</span>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('ALL')}
              >
                All ({tickets.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'OPEN' ? 'btn-danger' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('OPEN')}
              >
                Open ({tickets.filter((t) => t.status === 'open').length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'IN_PROGRESS' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('IN_PROGRESS')}
              >
                In Progress ({tickets.filter((t) => t.status === 'in_progress').length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'RESOLVED' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('RESOLVED')}
              >
                Resolved ({tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length})
              </button>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="card border-0 shadow-sm p-5 text-center text-muted">
                <CheckCircle size={40} className="text-success mx-auto mb-2" />
                <h4 style={{ fontSize: 16, fontWeight: 600 }}>No Support Tickets Found</h4>
                <p className="small mb-0">All institutional inquiries in this category are fully addressed.</p>
              </div>
            ) : (
              <div className="card border-0 shadow-sm p-0 overflow-hidden">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                    <thead style={{ background: 'var(--surface-bg, #F8FAFC)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px' }}>Ticket ID</th>
                        <th style={{ padding: '12px 16px' }}>Subject</th>
                        <th style={{ padding: '12px 16px' }}>Category</th>
                        <th style={{ padding: '12px 16px' }}>Priority</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Submitted</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((t) => (
                        <tr key={t.id}>
                          <td style={{ padding: '12px 16px' }}><strong>#{t.id}</strong></td>
                          <td style={{ padding: '12px 16px' }}>
                            <div className="fw-semibold">{t.subject}</div>
                            {t.description && (
                              <div className="text-muted small" style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {t.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge bg-light text-dark border">{t.category}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`badge ${
                              t.priority === 'high' ? 'bg-danger' : t.priority === 'medium' ? 'bg-warning text-dark' : 'bg-secondary'
                            }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`badge ${
                              t.status === 'resolved' || t.status === 'closed' ? 'bg-success' : t.status === 'in_progress' ? 'bg-warning text-dark' : 'bg-primary'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <small className="text-muted">{t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today'}</small>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setSelectedTicket(t)
                                setStatusVal(t.status === 'open' ? 'in_progress' : t.status)
                                setResponseMsg(t.response || '')
                              }}
                            >
                              Respond
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Respond / Resolve Modal */}
        {selectedTicket && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Ticket #{selectedTicket.id}: {selectedTicket.subject}</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedTicket(null)} />
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label text-muted small">User Description:</label>
                      <p className="p-2 bg-light rounded border small mb-0">{selectedTicket.description}</p>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="update-ticket-status" className="form-label fw-semibold">Update Status</label>
                      <select
                        id="update-ticket-status"
                        className="form-select form-select-sm"
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="update-ticket-response" className="form-label fw-semibold">Resolution Response</label>
                      <textarea
                        id="update-ticket-response"
                        className="form-control form-control-sm"
                        rows="3"
                        placeholder="Enter resolution notes or instructions for the user..."
                        value={responseMsg}
                        onChange={(e) => setResponseMsg(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedTicket(null)}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                      {saving ? 'Saving...' : 'Save Resolution'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
