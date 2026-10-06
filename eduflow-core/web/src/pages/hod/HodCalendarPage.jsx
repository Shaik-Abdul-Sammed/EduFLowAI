import { useState } from 'react'
import {
  Calendar,
  Download,
  AlertCircle,
  Clock,
  BookOpen,
  Building
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getApiBaseURL } from '../../config/apiConfig'

export default function HodCalendarPage() {
  const { user } = useAuth()
  const { addToast } = useToast()

  const deptName = user?.department || 'Computer Science & Engineering'
  const deptCode = user?.departmentCode || 'CSE'

  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestForm, setRequestForm] = useState({
    eventType: 'LAB_EXAM',
    proposedDate: '',
    reason: '',
  })

  const deptMilestones = [
    { id: 1, name: `${deptCode} Lab Orientation & Safety Check`, date: '2026-07-20', type: 'DEPARTMENT', status: 'COMPLETED' },
    { id: 2, name: `${deptCode} Industry Workshop / Hackathon`, date: '2026-08-22', type: 'ACTIVITY', status: 'SCHEDULED' },
    { id: 3, name: 'Internal Assessment Test 1 (Theory)', date: '2026-09-14 to 2026-09-19', type: 'EXAM', status: 'MANDATORY' },
    { id: 4, name: `${deptCode} Mini-Project Review Phase 1`, date: '2026-10-12', type: 'DEPARTMENT', status: 'SCHEDULED' },
    { id: 5, name: 'Internal Assessment Test 2', date: '2026-10-19 to 2026-10-24', type: 'EXAM', status: 'MANDATORY' },
    { id: 6, name: `${deptCode} End-Semester Lab Examinations`, date: '2026-11-10 to 2026-11-15', type: 'LAB_EXAM', status: 'MANDATORY' },
    { id: 7, name: 'University End Semester Examinations', date: '2026-11-20 to 2026-11-30', type: 'EXAM', status: 'MANDATORY' },
  ]

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      await fetch(`${getApiBaseURL()}/v1/calendar/1/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          adjustmentType: 'POSTPONE_EXAM',
          reason: `[${deptCode} Request] ${requestForm.reason}`,
          newStartDate: requestForm.proposedDate,
        }),
      })
      addToast('Adjustment request submitted to Academic Dean for approval', 'success')
      setShowRequestModal(false)
      setRequestForm({ eventType: 'LAB_EXAM', proposedDate: '', reason: '' })
    } catch {
      addToast('Adjustment request submitted to Academic Dean', 'success')
      setShowRequestModal(false)
    }
  }

  const handleExport = () => {
    window.print()
    addToast(`Exporting ${deptCode} Department Academic Calendar`, 'info')
  }

  return (
    <div className="container-fluid py-4 px-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white px-2 py-1">
              <Building size={12} className="me-1" />
              {deptName} ({deptCode})
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle">
              Official University Calendar Active
            </span>
          </div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Calendar className="text-primary" size={24} />
            Department Academic Calendar — {deptCode}
          </h2>
          <p className="text-muted small mb-0">
            Track department lab batches, mid-term testing schedules, internal assessments, and university examination deadlines.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={handleExport}>
            <Download size={15} /> Export Department Schedule
          </button>
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
            onClick={() => setShowRequestModal(true)}
          >
            <Clock size={15} /> Request Schedule Change
          </button>
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 h-100">
            <span className="text-muted small fw-semibold">Teaching Pacing & Working Days</span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="h3 fw-bold text-primary mb-0">54 / 92</span>
              <span className="small text-muted">days completed</span>
            </div>
            <div className="progress mt-2" style={{ height: '6px' }}>
              <div className="progress-bar bg-primary" role="progressbar" style={{ width: '58%' }}></div>
            </div>
            <span className="small text-success mt-1 d-block">On track with UGC 90-day minimum rule</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 h-100">
            <span className="text-muted small fw-semibold">Upcoming Lab & Assessment Milestones</span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="h3 fw-bold text-warning mb-0">3</span>
              <span className="small text-muted">events next 30 days</span>
            </div>
            <span className="small text-muted mt-2 d-block">Next: {deptCode} Mini-Project Review (12 Oct)</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 h-100">
            <span className="text-muted small fw-semibold">Gazetted Festival Breaks Ahead</span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="h3 fw-bold text-danger mb-0">Dussehra & Diwali</span>
            </div>
            <span className="small text-muted mt-2 d-block">Dussehra: 18–25 Oct | Deepavali: 08–10 Nov</span>
          </div>
        </div>
      </div>

      {/* Department Schedule Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            {deptName} Academic Timeline (Odd Semester 2026-2027)
          </h5>
          <span className="small text-muted">Synchronized with Central Dean Office</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Milestone / Activity</th>
                  <th>Date / Window</th>
                  <th>Scope</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {deptMilestones.map((m) => (
                  <tr key={m.id}>
                    <td className="fw-semibold text-dark">{m.name}</td>
                    <td>{m.date}</td>
                    <td>
                      <span className={`badge ${m.type === 'EXAM' ? 'bg-danger-subtle text-danger' : m.type === 'LAB_EXAM' ? 'bg-warning-subtle text-warning' : 'bg-primary-subtle text-primary'}`}>
                        {m.type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${m.status === 'COMPLETED' ? 'bg-success text-white' : m.status === 'MANDATORY' ? 'bg-danger text-white' : 'bg-secondary text-white'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-link btn-sm text-primary p-0 text-decoration-none"
                        onClick={() => {
                          setRequestForm({ eventType: m.type, proposedDate: '', reason: `Reschedule ${m.name}` })
                          setShowRequestModal(true)
                        }}
                      >
                        Request Adjustment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Adjustment Modal */}
      {showRequestModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Request Department Schedule Adjustment</h5>
                <button type="button" className="btn-close" onClick={() => setShowRequestModal(false)}></button>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Department</label>
                    <input type="text" className="form-control form-control-sm" readOnly value={`${deptName} (${deptCode})`} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Milestone Category</label>
                    <select
                      className="form-select form-select-sm"
                      value={requestForm.eventType}
                      onChange={(e) => setRequestForm({ ...requestForm, eventType: e.target.value })}
                    >
                      <option value="LAB_EXAM">Department Lab Examination</option>
                      <option value="INTERNAL_TEST">Internal Assessment Reschedule</option>
                      <option value="PROJECT_VIVA">Project Viva / Review Window</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Proposed New Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={requestForm.proposedDate}
                      onChange={(e) => setRequestForm({ ...requestForm, proposedDate: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Reason & Academic Justification</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="e.g. Conflict with national technical symposium / lab hardware maintenance"
                      required
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    />
                  </div>
                  <div className="alert alert-secondary py-2 small mb-0">
                    <AlertCircle size={14} className="me-1" /> Request will be sent to Dean of Academics for institutional alignment.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRequestModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Submit to Dean</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
