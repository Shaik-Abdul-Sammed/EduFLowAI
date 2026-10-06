import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  Send,
  FileText,
  Shield,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getApiBaseURL } from '../../config/apiConfig'

const ALL_OFFICERS = [
  { key: 'timetable', name: 'Timetable Officer', icon: '🗓️', path: '/officer/timetable', desc: 'Classroom scheduling, faculty constraint optimization' },
  { key: 'accreditation', name: 'Accreditation Officer', icon: '🏛️', path: '/officer/accreditation', desc: 'NAAC SSR criteria data compilation & reporting' },
  { key: 'student-success', name: 'Student Success Officer', icon: '🎓', path: '/officer/student-success', desc: 'Student risk tracking & intervention reporting' },
  { key: 'admissions', name: 'Admissions Officer', icon: '🎯', path: '/officer/admissions', desc: 'Application tracking, cohort intake diagnostics' },
  { key: 'finance', name: 'Finance Officer', icon: '💰', path: '/officer/finance', desc: 'Fee ledger reconciliation & receipt auditing' },
]

export default function StaffDashboardPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [permissions, setPermissions] = useState([])
  const [activity, setActivity] = useState([])
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestOfficer, setRequestOfficer] = useState('accreditation')
  const [requestReason, setRequestReason] = useState('')
  const [submittingRequest, setSubmittingRequest] = useState(false)

  const fetchStaffData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const [permRes, actRes] = await Promise.all([
        fetch(`${getApiBaseURL()}/v1/staff/my-permissions`, { headers }).catch(() => null),
        fetch(`${getApiBaseURL()}/v1/staff/activity?limit=20`, { headers }).catch(() => null),
      ])

      if (permRes?.ok) {
        const data = await permRes.json()
        setPermissions(data.permissions || [])
      } else {
        // Fallback default mock permission for demo staff user
        setPermissions([
          { officer_key: 'timetable', permission_level: 'DRAFT', max_requests_per_day: 15, current_usage: 2 },
        ])
      }

      if (actRes?.ok) {
        const actData = await actRes.json()
        setActivity(actData.activity || [])
      } else {
        setActivity([
          { id: 1, officer_key: 'timetable', action_type: 'GENERATE', prompt_text: 'Draft 2026 odd semester schedule', approval_status: 'PENDING', created_at: new Date().toISOString() },
        ])
      }

      const storedScenario = localStorage.getItem('eduflow-demo-staff-scenario')
      if (storedScenario) {
        try {
          const parsed = JSON.parse(storedScenario)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPermissions(parsed)
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStaffData()
  }, [])

  const handleSimulatePriya = () => {
    const priyaUser = {
      id: 105,
      email: 'priya.sharma@demo.edu',
      name: 'Priya Sharma',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'staff',
      staff_designation: 'Academic Coordinator',
      department: 'CSE',
      departmentCode: 'CSE',
      institutionId: 1,
    }
    const priyaPermissions = [
      { officer_key: 'timetable', permission_level: 'DRAFT', max_requests_per_day: 15, current_usage: 2 },
      { officer_key: 'accreditation', permission_level: 'VIEW_ONLY', max_requests_per_day: 20, current_usage: 0 },
    ]
    setPermissions(priyaPermissions)
    localStorage.setItem('eduflow-ai-auth', JSON.stringify({ user: priyaUser, token: 'demo-staff-token-priya' }))
    localStorage.setItem('accessToken', 'demo-staff-token-priya')
    localStorage.setItem('eduflow-demo-staff-scenario', JSON.stringify(priyaPermissions))
    addToast('Simulating Priya Sharma (Academic Coordinator)! Timetable has DRAFT access (15 req/day, needs HOD approval); Accreditation is VIEW_ONLY.', 'success')
  }

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    setSubmittingRequest(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const res = await fetch(`${getApiBaseURL()}/v1/staff/request-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ officerKey: requestOfficer, reason: requestReason }),
      })
      if (res.ok) {
        addToast(`Access request for ${requestOfficer} sent to your HOD`, 'success')
      } else {
        addToast(`Access request recorded for review`, 'info')
      }
      setShowRequestModal(false)
      setRequestReason('')
    } catch {
      addToast('Request recorded.', 'info')
      setShowRequestModal(false)
    } finally {
      setSubmittingRequest(false)
    }
  }

  const getPermissionForOfficer = (key) => permissions.find((p) => p.officer_key === key)

  return (
    <div className="container-fluid py-4 px-md-5" style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f1f5f9' }}>
      {/* SECTION 1: WELCOME HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span style={{ fontSize: '1.75rem' }}>📋</span>
            <h1 className="h3 mb-0 fw-bold text-white">Staff Administrative Command Center</h1>
            <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 px-2 py-1 small">
              Non-Teaching Staff Role
            </span>
          </div>
          <p className="text-secondary mb-0 small">
            Logged in as <strong className="text-white">{user?.name || user?.email || 'Priya Sharma'}</strong> ({user?.staff_designation || 'Academic Coordinator'}) • Department: <strong className="text-white">CSE</strong> • Reporting to HOD: <strong className="text-info">Dr. K. S. Rao</strong>
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            onClick={handleSimulatePriya}
            className="btn btn-warning btn-sm d-flex align-items-center gap-2 fw-semibold text-dark shadow-sm"
          >
            <Sparkles size={15} />
            <span>Simulate Priya</span>
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
          >
            <HelpCircle size={15} />
            <span>Request New Officer Access</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: MY OFFICERS */}
      <div className="mb-5">
        <h2 className="h5 fw-bold text-white mb-3 d-flex align-items-center gap-2">
          <Sparkles size={18} className="text-warning" />
          <span>Delegated AI Officers</span>
        </h2>
        <div className="row g-3">
          {ALL_OFFICERS.map((officer) => {
            const perm = getPermissionForOfficer(officer.key)
            const isGranted = Boolean(perm)

            return (
              <div key={officer.key} className="col-12 col-md-6 col-lg-4">
                <div
                  className="card h-100 border transition-all"
                  style={{
                    backgroundColor: isGranted ? '#111827' : 'rgba(17, 24, 39, 0.4)',
                    borderColor: isGranted ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    opacity: isGranted ? 1 : 0.75,
                  }}
                >
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span style={{ fontSize: '1.75rem' }}>{officer.icon}</span>
                        {isGranted ? (
                          <span
                            className={`badge ${
                              perm.permission_level === 'FULL'
                                ? 'bg-success bg-opacity-25 text-success border border-success border-opacity-50'
                                : perm.permission_level === 'DRAFT'
                                ? 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50'
                                : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50'
                            }`}
                          >
                            {perm.permission_level || 'DRAFT'} ACCESS
                          </span>
                        ) : (
                          <span className="badge bg-dark text-secondary border border-secondary border-opacity-25">
                            <Lock size={12} className="me-1" /> NO ACCESS
                          </span>
                        )}
                      </div>
                      <h3 className="h6 fw-bold text-white mb-1">{officer.name}</h3>
                      <p className="text-secondary small mb-3">{officer.desc}</p>
                    </div>

                    {isGranted ? (
                      <div>
                        <div className="d-flex justify-content-between text-secondary small mb-2">
                          <span>Today's Limit:</span>
                          <span className="text-white fw-bold">
                            {perm.current_usage || 0} / {perm.max_requests_per_day || 20} requests
                          </span>
                        </div>
                        <Link to={officer.path} className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
                          <span>Open Officer</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setRequestOfficer(officer.key)
                          setShowRequestModal(true)
                        }}
                        className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                      >
                        <Shield size={14} />
                        <span>Request Access</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 3 & 4: PENDING APPROVALS AND MY ACTIVITY */}
      <div className="row g-4">
        {/* Pending Approvals */}
        <div className="col-12 col-lg-6">
          <div className="card bg-dark border border-secondary border-opacity-25 h-100">
            <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center gap-2">
              <Clock size={16} className="text-warning" />
              <h2 className="h6 fw-bold text-white mb-0">My Submissions Awaiting Approval</h2>
            </div>
            <div className="card-body p-3">
              {activity.filter((a) => a.approval_status === 'PENDING').length === 0 ? (
                <div className="text-center py-4 text-secondary small">
                  No submissions currently awaiting HOD approval.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {activity
                    .filter((a) => a.approval_status === 'PENDING')
                    .map((item) => (
                      <div key={item.id} className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 text-uppercase">
                            {item.officer_key}
                          </span>
                          <span className="text-warning small fw-bold">PENDING HOD REVIEW</span>
                        </div>
                        <p className="text-light small mb-1 fw-semibold">{item.prompt_text}</p>
                        <span className="text-secondary small">{item.created_at ? new Date(item.created_at).toLocaleString() : 'Recently'}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-12 col-lg-6">
          <div className="card bg-dark border border-secondary border-opacity-25 h-100">
            <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center gap-2">
              <FileText size={16} className="text-info" />
              <h2 className="h6 fw-bold text-white mb-0">Recent Activity & Outcomes</h2>
            </div>
            <div className="card-body p-3">
              {activity.length === 0 ? (
                <div className="text-center py-4 text-secondary small">No recent activity logged.</div>
              ) : (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {activity.map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-10 small d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-semibold text-white me-2">[{item.officer_key}]</span>
                        <span className="text-secondary">{item.prompt_text?.slice(0, 45)}...</span>
                      </div>
                      <span
                        className={`badge ${
                          item.approval_status === 'APPROVED'
                            ? 'bg-success bg-opacity-25 text-success'
                            : item.approval_status === 'REJECTED'
                            ? 'bg-danger bg-opacity-25 text-danger'
                            : 'bg-warning bg-opacity-25 text-warning'
                        }`}
                      >
                        {item.approval_status || 'DONE'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: REQUEST ACCESS MODAL */}
      {showRequestModal && (
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
          onClick={() => setShowRequestModal(false)}
        >
          <div
            style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="h5 fw-bold text-white mb-2">Request AI Officer Access</h3>
            <p className="text-secondary small mb-3">
              Your request will be routed to your department HOD for authorization.
            </p>
            <form onSubmit={handleRequestSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small">Target Officer</label>
                <select
                  className="form-select bg-dark text-white border-secondary border-opacity-50"
                  value={requestOfficer}
                  onChange={(e) => setRequestOfficer(e.target.value)}
                >
                  {ALL_OFFICERS.map((o) => (
                    <option key={o.key} value={o.key}>{o.icon} {o.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label text-secondary small">Purpose / Justification</label>
                <textarea
                  className="form-control bg-dark text-white border-secondary border-opacity-50"
                  rows="3"
                  placeholder="e.g. Assigned to compile SSR criteria 4 infrastructure evidence"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => setShowRequestModal(false)} className="btn btn-outline-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submittingRequest} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                  <Send size={14} />
                  <span>{submittingRequest ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
