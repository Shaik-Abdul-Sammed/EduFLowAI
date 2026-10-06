import React, { useState, useEffect } from 'react'
import {
  LifeBuoy,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react'

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [responseMsg, setResponseMsg] = useState('')
  const [statusVal, setStatusVal] = useState('resolved')

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/support/tickets')
      const data = await res.json()
      if (data.tickets) setTickets(data.tickets)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedTicket) return
    try {
      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusVal, response: responseMsg })
      })
      if (res.ok) {
        setSelectedTicket(null)
        setResponseMsg('')
        fetchTickets()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold d-flex align-items-center">
            <LifeBuoy className="me-2 text-primary" /> Support Tickets Management
          </h2>
          <p className="text-muted mb-0">Review and resolve institutional support requests from staff and faculty.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={fetchTickets}>
          Refresh Tickets
        </button>
      </div>

      <div className="card shadow-sm border-0 p-3 bg-white">
        {loading ? (
          <div className="text-center py-4 text-muted">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <CheckCircle size={40} className="text-success mb-2" />
            <h5>No Open Support Tickets</h5>
            <p>All institutional inquiries and technical requests are currently resolved.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td><strong>#{t.id}</strong></td>
                    <td>{t.subject}</td>
                    <td><span className="badge bg-light text-dark border">{t.category}</span></td>
                    <td>
                      <span className={`badge ${
                        t.priority === 'high' ? 'bg-danger' : t.priority === 'medium' ? 'bg-warning text-dark' : 'bg-secondary'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        t.status === 'resolved' ? 'bg-success' : 'bg-primary'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td><small className="text-muted">{new Date(t.created_at).toLocaleDateString()}</small></td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          setSelectedTicket(t)
                          setStatusVal(t.status)
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
        )}
      </div>

      {selectedTicket && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                    <p className="p-2 bg-light rounded border">{selectedTicket.description}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Update Status</label>
                    <select
                      className="form-select"
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
                    <label className="form-label fw-semibold">Resolution Response</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter resolution notes or instructions for the user..."
                      value={responseMsg}
                      onChange={(e) => setResponseMsg(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Resolution
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
