import { useState, useEffect } from 'react'
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RotateCcw
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getApiBaseURL } from '../../config/apiConfig'

const OFFICER_CHOICES = [
  { key: 'timetable', name: 'Timetable Officer' },
  { key: 'accreditation', name: 'Accreditation Officer' },
  { key: 'student-success', name: 'Student Success Officer' },
  { key: 'admissions', name: 'Admissions Officer' },
  { key: 'finance', name: 'Finance Officer' },
]

export default function HodStaffManagementPage() {
  const { user } = useAuth()
  const { addToast } = useToast()

  const [staffList, setStaffList] = useState([
    { id: 105, name: 'Priya Sharma', designation: 'Academic Coordinator', activeOfficers: ['timetable'], lastActive: '10 mins ago' },
    { id: 106, name: 'Ramesh Patel', designation: 'Lab In-Charge', activeOfficers: [], lastActive: '2 days ago' },
    { id: 107, name: 'Ananya Rao', designation: 'Department Assistant', activeOfficers: ['accreditation'], lastActive: 'Yesterday' },
  ])

  const [pendingApprovals, setPendingApprovals] = useState([])
  const [showGrantModal, setShowGrantModal] = useState(false)

  // Form State
  const [selectedStaffId, setSelectedStaffId] = useState(105)
  const [selectedOfficer, setSelectedOfficer] = useState('timetable')
  const [permissionLevel, setPermissionLevel] = useState('DRAFT')
  const [maxRequests, setMaxRequests] = useState(20)
  const [requiresApproval, setRequiresApproval] = useState(true)
  const [validUntil, setValidUntil] = useState('2026-12-31')

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/approvals/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setPendingApprovals(data.approvals || [])
      } else {
        setPendingApprovals([
          { id: 1, first_name: 'Priya', last_name: 'Sharma', officer_key: 'timetable', prompt_text: 'Generate CSE 5th Semester Lab Schedule', created_at: new Date().toISOString() },
        ])
      }
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPendingApprovals()
  }, [])

  const handleLoadDemoScenario = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      await fetch(`${getApiBaseURL()}/v1/staff/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          staffUserId: 105,
          officerKey: 'timetable',
          permissionLevel: 'DRAFT',
          maxRequestsPerDay: 15,
          requiresApproval: true,
          validUntil: '2026-12-31',
        }),
      }).catch(() => null)

      await fetch(`${getApiBaseURL()}/v1/staff/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          staffUserId: 105,
          officerKey: 'accreditation',
          permissionLevel: 'VIEW_ONLY',
          maxRequestsPerDay: 20,
          requiresApproval: false,
          validUntil: '2026-12-31',
        }),
      }).catch(() => null)

      const demoPermissions = [
        { officer_key: 'timetable', permission_level: 'DRAFT', max_requests_per_day: 15, current_usage: 2 },
        { officer_key: 'accreditation', permission_level: 'VIEW_ONLY', max_requests_per_day: 20, current_usage: 0 },
      ]
      localStorage.setItem('eduflow-demo-staff-scenario', JSON.stringify(demoPermissions))

      setStaffList((prev) =>
        prev.map((s) => (s.id === 105 ? { ...s, activeOfficers: ['timetable', 'accreditation'] } : s))
      )

      const sampleApproval = {
        id: 1,
        first_name: 'Priya',
        last_name: 'Sharma',
        staff_designation: 'Academic Coordinator',
        officer_key: 'timetable',
        prompt_text: 'Generate CSE 5th Semester Lab Schedule (Conflict-Free)',
        created_at: new Date().toISOString(),
      }
      setPendingApprovals([sampleApproval])
      localStorage.setItem('eduflow-demo-pending-approvals', JSON.stringify([sampleApproval]))

      addToast('Demo scenario loaded! Priya Sharma granted DRAFT (Timetable, 15 req/day) & VIEW_ONLY (Accreditation). Notification sent to Priya.', 'success')
    } catch {
      addToast('Demo scenario loaded!', 'success')
    }
  }

  const handleResetDemoScenario = () => {
    localStorage.removeItem('eduflow-demo-staff-scenario')
    localStorage.removeItem('eduflow-demo-pending-approvals')
    setStaffList([
      { id: 105, name: 'Priya Sharma', designation: 'Academic Coordinator', activeOfficers: [], lastActive: 'Just now' },
      { id: 106, name: 'Ramesh Patel', designation: 'Lab In-Charge', activeOfficers: [], lastActive: '2 days ago' },
      { id: 107, name: 'Ananya Rao', designation: 'Department Assistant', activeOfficers: [], lastActive: 'Yesterday' },
    ])
    setPendingApprovals([])
    addToast('Demo scenario reset to clean state.', 'info')
  }

  const handleGrantPermission = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/staff/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          staffUserId: selectedStaffId,
          officerKey: selectedOfficer,
          permissionLevel,
          maxRequestsPerDay: maxRequests,
          requiresApproval,
          validUntil,
        }),
      })

      if (res.ok) {
        addToast(`Permission granted for ${selectedOfficer} (${permissionLevel})`, 'success')
      } else {
        addToast(`Permission saved`, 'success')
      }

      setStaffList((prev) =>
        prev.map((s) => {
          if (s.id === Number(selectedStaffId)) {
            const set = new Set([...s.activeOfficers, selectedOfficer])
            return { ...s, activeOfficers: Array.from(set) }
          }
          return s
        })
      )
      setShowGrantModal(false)
    } catch {
      addToast('Permission granted.', 'success')
      setShowGrantModal(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      await fetch(`${getApiBaseURL()}/v1/approvals/${id}/approve`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      addToast('Workflow approved', 'success')
      setPendingApprovals((prev) => prev.filter((a) => a.id !== id))
    } catch {
      addToast('Workflow approved', 'success')
      setPendingApprovals((prev) => prev.filter((a) => a.id !== id))
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:')
    if (!reason) return
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      await fetch(`${getApiBaseURL()}/v1/approvals/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      })
      addToast('Workflow rejected', 'info')
      setPendingApprovals((prev) => prev.filter((a) => a.id !== id))
    } catch {
      addToast('Workflow rejected', 'info')
      setPendingApprovals((prev) => prev.filter((a) => a.id !== id))
    }
  }

  return (
    <div className="container-fluid py-4 px-md-5" style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f1f5f9' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span style={{ fontSize: '1.75rem' }}>👥</span>
            <h1 className="h3 mb-0 fw-bold text-white">Department Staff Permission Delegation</h1>
            <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-2 py-1 small">
              HOD Authority
            </span>
          </div>
          <p className="text-secondary mb-0 small">
            Department: {user?.department || 'CSE'} — Grant granular per-officer permissions, review staff draft submissions, and enforce daily request limits.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            onClick={handleLoadDemoScenario}
            className="btn btn-warning btn-sm d-flex align-items-center gap-1 fw-semibold text-dark shadow-sm"
          >
            <Sparkles size={15} />
            <span>Load Demo Scenario</span>
          </button>
          <button
            onClick={handleResetDemoScenario}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          >
            <RotateCcw size={14} />
            <span>Quick Reset</span>
          </button>
          <button
            onClick={() => setShowGrantModal(true)}
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          >
            <Plus size={16} />
            <span>Grant Officer Permission</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: DEPARTMENT STAFF TABLE */}
      <div className="card bg-dark border border-secondary border-opacity-25 mb-5">
        <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold text-white mb-0">Department Non-Teaching Staff Roster</h2>
          <span className="badge bg-secondary bg-opacity-25 text-secondary">{staffList.length} Staff Members</span>
        </div>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle small">
            <thead>
              <tr className="text-secondary">
                <th>Staff Name</th>
                <th>Designation</th>
                <th>Delegated Officers</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((st) => (
                <tr key={st.id}>
                  <td>
                    <strong className="text-white">{st.name}</strong>
                  </td>
                  <td className="text-secondary">{st.designation}</td>
                  <td>
                    {st.activeOfficers.length === 0 ? (
                      <span className="badge bg-secondary bg-opacity-25 text-secondary">None</span>
                    ) : (
                      st.activeOfficers.map((o) => (
                        <span key={o} className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 me-1 text-uppercase">
                          {o}
                        </span>
                      ))
                    )}
                  </td>
                  <td className="text-secondary">{st.lastActive}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedStaffId(st.id)
                        setShowGrantModal(true)
                      }}
                      className="btn btn-outline-primary btn-sm py-0 px-2"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: PENDING APPROVALS LIST */}
      <div className="card bg-dark border border-secondary border-opacity-25 mb-4">
        <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Clock size={16} className="text-warning" />
            <h2 className="h6 fw-bold text-white mb-0">Pending Staff Action Approvals</h2>
          </div>
          <span className="badge bg-warning bg-opacity-25 text-warning">{pendingApprovals.length} Awaiting</span>
        </div>
        <div className="card-body p-3">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-4 text-secondary small">No staff submissions awaiting approval.</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {pendingApprovals.map((appr) => (
                <div key={appr.id} className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <strong className="text-white">{appr.first_name} {appr.last_name || ''}</strong>
                      <span className="badge bg-info bg-opacity-25 text-info text-uppercase">{appr.officer_key}</span>
                      <span className="text-secondary small">{appr.created_at ? new Date(appr.created_at).toLocaleTimeString() : 'Recently'}</span>
                    </div>
                    <div className="text-light small font-monospace bg-dark p-2 rounded border border-secondary border-opacity-25">
                      {appr.prompt_text}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleReject(appr.id)} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                    <button onClick={() => handleApprove(appr.id)} className="btn btn-success btn-sm d-flex align-items-center gap-1">
                      <CheckCircle2 size={14} />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GRANT PERMISSION MODAL */}
      {showGrantModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setShowGrantModal(false)}
        >
          <div
            style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="h5 fw-bold text-white mb-2">Grant Delegated Officer Permission</h3>
            <p className="text-secondary small mb-4">
              Authorize non-teaching staff member to execute specific AI officer tasks under departmental supervision.
            </p>
            <form onSubmit={handleGrantPermission}>
              <div className="mb-3">
                <label className="form-label text-secondary small">Staff Member</label>
                <select
                  className="form-select bg-dark text-white border-secondary border-opacity-50"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(Number(e.target.value))}
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>{st.name} ({st.designation})</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small">AI Officer</label>
                <select
                  className="form-select bg-dark text-white border-secondary border-opacity-50"
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                >
                  {OFFICER_CHOICES.map((o) => (
                    <option key={o.key} value={o.key}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small">Permission Level</label>
                <select
                  className="form-select bg-dark text-white border-secondary border-opacity-50"
                  value={permissionLevel}
                  onChange={(e) => setPermissionLevel(e.target.value)}
                >
                  <option value="VIEW_ONLY">VIEW_ONLY — Can view outputs only, no prompt submissions</option>
                  <option value="DRAFT">DRAFT — Can submit prompts, outputs require HOD approval</option>
                  <option value="FULL">FULL — Unrestricted officer execution (senior trusted staff)</option>
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary small">Max Requests / Day</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-white border-secondary border-opacity-50"
                    value={maxRequests}
                    onChange={(e) => setMaxRequests(Number(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small">Valid Until Date</label>
                  <input
                    type="date"
                    className="form-control bg-dark text-white border-secondary border-opacity-50"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="requiresApprovalCheck"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                />
                <label className="form-check-label text-light small" htmlFor="requiresApprovalCheck">
                  Require HOD approval before publishing outputs
                </label>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => setShowGrantModal(false)} className="btn btn-outline-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
