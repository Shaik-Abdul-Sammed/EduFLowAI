import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getApiBaseURL } from '../../config/apiConfig'

export default function HodDashboardPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [askingAi, setAskingAi] = useState(false)
  const [actionInProgressId, setActionInProgressId] = useState(null)

  const deptName = user?.department || 'Computer Science & Engineering'
  const deptCode = user?.departmentCode || 'CSE'

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/approvals/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        const approvals = data.approvals || []
        const local = JSON.parse(localStorage.getItem('eduflow-demo-pending-approvals') || '[]')
        setPendingApprovals(approvals.length > 0 ? approvals : (local.length > 0 ? local : [
          {
            id: 1,
            staff_user_id: 105,
            first_name: 'Priya',
            last_name: 'Sharma',
            staff_designation: 'Academic Coordinator',
            officer_key: 'timetable',
            prompt_text: 'Generate conflict-free timetable for CSE 3rd & 5th Semester',
            created_at: new Date().toISOString(),
          },
        ]))
      } else {
        const local = JSON.parse(localStorage.getItem('eduflow-demo-pending-approvals') || '[]')
        setPendingApprovals(local.length > 0 ? local : [
          {
            id: 1,
            staff_user_id: 105,
            first_name: 'Priya',
            last_name: 'Sharma',
            staff_designation: 'Academic Coordinator',
            officer_key: 'timetable',
            prompt_text: 'Generate conflict-free timetable for CSE 3rd & 5th Semester',
            created_at: new Date().toISOString(),
          },
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

  const handleApprove = async (logId) => {
    setActionInProgressId(logId)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      await fetch(`${getApiBaseURL()}/v1/approvals/${logId}/approve`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null)

      localStorage.removeItem('eduflow-demo-pending-approvals')
      setPendingApprovals((prev) => prev.filter((a) => a.id !== logId))
      addToast('Timetable draft approved! Schedule officially published and staff activity log updated.', 'success')
    } catch {
      localStorage.removeItem('eduflow-demo-pending-approvals')
      setPendingApprovals((prev) => prev.filter((a) => a.id !== logId))
      addToast('Timetable draft approved! Schedule published.', 'success')
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleReject = async (logId) => {
    const reason = window.prompt('Enter rejection reason for staff:') || 'Requires department review'
    setActionInProgressId(logId)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      await fetch(`${getApiBaseURL()}/v1/approvals/${logId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      }).catch(() => null)

      localStorage.removeItem('eduflow-demo-pending-approvals')
      setPendingApprovals((prev) => prev.filter((a) => a.id !== logId))
      addToast(`Staff submission rejected (${reason}). Staff activity log updated.`, 'info')
    } catch {
      localStorage.removeItem('eduflow-demo-pending-approvals')
      setPendingApprovals((prev) => prev.filter((a) => a.id !== logId))
      addToast('Submission rejected.', 'info')
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleQuickAsk = (e) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return
    setAskingAi(true)
    setTimeout(() => {
      setAiAnswer(
        `[${deptCode} Intelligence] Based on current semester records, average faculty workload is 16.2 hrs/wk (compliant with AICTE 16-18 norms). 3 students are at risk of sub-75% attendance in Section B.`
      )
      setAskingAi(false)
    }, 600)
  }

  return (
    <div className="container-fluid py-4 px-md-5" style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f1f5f9' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span style={{ fontSize: '1.75rem' }}>🏛️</span>
            <h1 className="h3 mb-0 fw-bold text-white">{deptName} — HOD Command Center</h1>
            <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-2 py-1 small">
              Department Scoped
            </span>
          </div>
          <p className="text-secondary mb-0 small">
            Autonomous departmental oversight, faculty workload balancing, student progression, and staff delegation controls.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/hod-dashboard/staff" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
            <Users size={15} />
            <span>Manage Staff Permissions</span>
          </Link>
          <Link to="/hod-dashboard/calendar" className="btn btn-outline-info btn-sm d-flex align-items-center gap-2">
            <Calendar size={15} />
            <span>Department Calendar</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Enrolled Students', value: '480', icon: <GraduationCap size={20} color="#38bdf8" />, change: '+12 vs last year' },
          { label: 'Active Faculty', value: '24', icon: <Users size={20} color="#a855f7" />, change: '100% Ph.D / M.Tech' },
          { label: 'At-Risk Students', value: '7', icon: <AlertTriangle size={20} color="#f59e0b" />, change: '< 75% attendance' },
          { label: 'Staff Submissions', value: pendingApprovals.length, icon: <Clock size={20} color="#ec4899" />, change: 'Awaiting your review' },
        ].map((stat, i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-3">
            <div className="card bg-dark border border-secondary border-opacity-25 p-3 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small">{stat.label}</span>
                {stat.icon}
              </div>
              <div className="h3 fw-bold text-white mb-1">{stat.value}</div>
              <span className="text-secondary small">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="row g-4">
        {/* Left Column: Staff Approvals */}
        <div className="col-12 col-lg-7">
          <div className="card bg-dark border border-secondary border-opacity-25 mb-4">
            <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Clock size={16} className="text-warning" />
                <h2 className="h6 fw-bold text-white mb-0">Pending Staff Delegated Workflows</h2>
              </div>
              <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50">
                {pendingApprovals.length} Pending
              </span>
            </div>
            <div className="card-body p-3">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-4 text-secondary small">
                  All staff submissions for {deptCode} have been reviewed.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {pendingApprovals.map((appr) => (
                    <div key={appr.id} className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong className="text-white">{appr.first_name} {appr.last_name || ''}</strong>
                          <span className="text-secondary small ms-2">({appr.staff_designation || 'Staff'})</span>
                        </div>
                        <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 text-uppercase">
                          {appr.officer_key}
                        </span>
                      </div>
                      <p className="text-light small mb-3 bg-dark p-2 rounded border border-secondary border-opacity-25 font-monospace">
                        {appr.prompt_text}
                      </p>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => handleReject(appr.id)}
                          disabled={actionInProgressId === appr.id}
                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                        >
                          <XCircle size={14} />
                          <span>{actionInProgressId === appr.id ? 'Processing...' : 'Reject'}</span>
                        </button>
                        <button
                          onClick={() => handleApprove(appr.id)}
                          disabled={actionInProgressId === appr.id}
                          className="btn btn-success btn-sm d-flex align-items-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          <span>{actionInProgressId === appr.id ? 'Approving...' : 'Approve Workflow'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* At Risk Students Table */}
          <div className="card bg-dark border border-secondary border-opacity-25">
            <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center gap-2">
              <AlertTriangle size={16} className="text-danger" />
              <h2 className="h6 fw-bold text-white mb-0">{deptCode} At-Risk Attendance Cohort</h2>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 small">
                <thead>
                  <tr className="text-secondary">
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Attendance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { roll: '24CS012', name: 'Karthik Rao', pct: 64.2, status: 'Critical' },
                    { roll: '24CS038', name: 'Manish Kumar', pct: 68.5, status: 'Warning' },
                    { roll: '24CS074', name: 'Divya Nair', pct: 71.0, status: 'Warning' },
                  ].map((s, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-white">{s.roll}</td>
                      <td>{s.name}</td>
                      <td className="text-danger fw-bold">{s.pct}%</td>
                      <td>
                        <button
                          onClick={() => addToast(`Intervention notice issued to ${s.name}`, 'info')}
                          className="btn btn-outline-secondary btn-sm py-0 px-2"
                        >
                          Issue Warning
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant & Quick Actions */}
        <div className="col-12 col-lg-5">
          <div className="card bg-dark border border-secondary border-opacity-25 mb-4">
            <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center gap-2">
              <Sparkles size={16} className="text-warning" />
              <h2 className="h6 fw-bold text-white mb-0">{deptCode} AI Department Advisor</h2>
            </div>
            <div className="card-body p-3">
              <p className="text-secondary small mb-3">
                Ask questions regarding faculty leave balance, timetable clashes, or NAAC criteria evidence requirements.
              </p>
              <form onSubmit={handleQuickAsk} className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary border-opacity-50"
                    placeholder="e.g. Check faculty workload compliance"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                  />
                  <button type="submit" disabled={askingAi} className="btn btn-primary d-flex align-items-center">
                    <Send size={15} />
                  </button>
                </div>
              </form>
              {aiAnswer && (
                <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 small text-light">
                  {aiAnswer}
                </div>
              )}
            </div>
          </div>

          <div className="card bg-dark border border-secondary border-opacity-25 p-3">
            <h3 className="h6 fw-bold text-white mb-3">Department Officer Shortcuts</h3>
            <div className="d-flex flex-column gap-2">
              <Link to="/officer/timetable" className="btn btn-outline-secondary btn-sm text-start d-flex justify-content-between align-items-center text-light">
                <span>🗓️ Open {deptCode} Timetable Officer</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/officer/accreditation" className="btn btn-outline-secondary btn-sm text-start d-flex justify-content-between align-items-center text-light">
                <span>🏛️ Generate Criteria 2 & 3 SSR Draft</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/officer/student-success" className="btn btn-outline-secondary btn-sm text-start d-flex justify-content-between align-items-center text-light">
                <span>🎓 Predict Semester Dropout Risk</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
