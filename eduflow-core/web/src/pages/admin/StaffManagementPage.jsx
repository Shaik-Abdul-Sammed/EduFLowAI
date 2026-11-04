import { useState } from 'react'
import {
  Download,
  Filter,
  Trash2,
  UserPlus,
  Search,
  ShieldCheck,
  CheckCircle,
  Clock,
  Zap,
  X
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const DEPARTMENTS = ['ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI', 'MBA']

export default function AdminStaffManagementPage() {
  const { addToast } = useToast()
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    department: 'CSE',
    designation: 'Academic Coordinator',
    officer: 'timetable',
    level: 'DRAFT',
    dailyLimit: 20,
    validUntil: '2026-12-31',
  })

  const [staffData, setStaffData] = useState([
    { id: 105, name: 'Priya Sharma', department: 'CSE', designation: 'Academic Coordinator', officer: 'timetable', level: 'DRAFT', dailyLimit: 15, validUntil: '2026-12-31' },
    { id: 106, name: 'Ramesh Patel', department: 'ECE', designation: 'Lab In-Charge', officer: 'accreditation', level: 'VIEW_ONLY', dailyLimit: 10, validUntil: '2026-12-31' },
    { id: 107, name: 'Ananya Rao', department: 'CSE', designation: 'Department Assistant', officer: 'student-success', level: 'FULL', dailyLimit: 25, validUntil: '2026-12-31' },
    { id: 108, name: 'Sanjay Kumar', department: 'MECH', designation: 'Exam Coordinator', officer: 'timetable', level: 'DRAFT', dailyLimit: 20, validUntil: '2026-12-31' },
    { id: 109, name: 'Geeta Nair', department: 'MBA', designation: 'Admissions Assistant', officer: 'admissions', level: 'FULL', dailyLimit: 30, validUntil: '2026-12-31' },
  ])

  const filteredStaff = staffData.filter((s) => {
    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.officer.toLowerCase().includes(q)
    return matchesDept && matchesSearch
  })

  const handleExportCsv = () => {
    const headers = ['Staff ID,Name,Department,Designation,Officer,Permission Level,Daily Limit,Valid Until']
    const rows = filteredStaff.map((s) =>
      `"${s.id}","${s.name}","${s.department}","${s.designation}","${s.officer}","${s.level}","${s.dailyLimit}","${s.validUntil}"`
    )
    const csvContent = [headers, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eduflow-staff-permissions-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addToast('Staff permissions exported to CSV', 'success')
  }

  const handleRevokeAll = (staffId, name) => {
    if (window.confirm(`Revoke all officer permissions for ${name}?`)) {
      setStaffData((prev) => prev.filter((s) => s.id !== staffId))
      addToast(`All permissions revoked for ${name}`, 'info')
    }
  }

  const handleAddStaffSubmit = (e) => {
    e.preventDefault()
    if (!newStaffForm.name.trim()) return
    const newEntry = {
      id: Date.now(),
      name: newStaffForm.name.trim(),
      department: newStaffForm.department,
      designation: newStaffForm.designation.trim() || 'Staff Assistant',
      officer: newStaffForm.officer,
      level: newStaffForm.level,
      dailyLimit: Number(newStaffForm.dailyLimit) || 20,
      validUntil: newStaffForm.validUntil || '2026-12-31',
    }
    setStaffData((prev) => [newEntry, ...prev])
    setShowAddModal(false)
    setNewStaffForm({
      name: '',
      department: 'CSE',
      designation: 'Academic Coordinator',
      officer: 'timetable',
      level: 'DRAFT',
      dailyLimit: 20,
      validUntil: '2026-12-31',
    })
    addToast(`Delegated ${newEntry.level} permission on ${newEntry.officer} officer to ${newEntry.name}`, 'success')
  }

  return (
    <div className="container-fluid py-4 px-md-5" style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f1f5f9' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span style={{ fontSize: '1.75rem' }}>🏛️</span>
            <h1 className="h3 mb-0 fw-bold text-white">Institution Staff Delegation Directory</h1>
            <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-1 small">
              Dean / Principal Authority
            </span>
          </div>
          <p className="text-secondary mb-0 small">
            Centralized institution-wide governance of non-teaching staff access, role delegations, and audit logs.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
          >
            <UserPlus size={15} />
            <span>Delegate New Staff</span>
          </button>
          <button onClick={handleExportCsv} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 text-light">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card bg-dark border border-secondary border-opacity-25 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small text-uppercase fw-bold">Delegated Staff</span>
                <h4 className="fw-bold text-white mb-0 mt-1">{staffData.length} Active</h4>
              </div>
              <ShieldCheck size={26} className="text-primary" />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card bg-dark border border-secondary border-opacity-25 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small text-uppercase fw-bold">Active Depts</span>
                <h4 className="fw-bold text-white mb-0 mt-1">{new Set(staffData.map(s => s.department)).size} Depts</h4>
              </div>
              <CheckCircle size={26} className="text-success" />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card bg-dark border border-secondary border-opacity-25 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small text-uppercase fw-bold">Full Role Grants</span>
                <h4 className="fw-bold text-white mb-0 mt-1">{staffData.filter(s => s.level === 'FULL').length} Staff</h4>
              </div>
              <Zap size={26} className="text-warning" />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card bg-dark border border-secondary border-opacity-25 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small text-uppercase fw-bold">Daily AI Quota</span>
                <h4 className="fw-bold text-white mb-0 mt-1">{staffData.reduce((acc, s) => acc + (s.dailyLimit || 0), 0)} reqs/day</h4>
              </div>
              <Clock size={26} className="text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Filter size={16} className="text-secondary" />
          <span className="small text-secondary fw-semibold">Department:</span>
          <div className="btn-group btn-group-sm">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`btn btn-sm ${selectedDept === dept ? 'btn-primary' : 'btn-outline-secondary text-secondary'}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm" style={{ width: '220px' }}>
            <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
              <Search size={14} />
            </span>
            <input
              type="text"
              className="form-control form-control-sm bg-dark border-secondary border-opacity-25 text-light"
              placeholder="Search staff, role, officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-secondary small">
            Showing <strong>{filteredStaff.length}</strong> of {staffData.length}
          </span>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card bg-dark border border-secondary border-opacity-25">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle small">
            <thead>
              <tr className="text-secondary">
                <th>Staff Member</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Officer</th>
                <th>Permission Level</th>
                <th>Daily Limit</th>
                <th>Valid Until</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-secondary py-4">
                    No staff members match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={`${s.id}-${s.officer}`}>
                    <td>
                      <strong className="text-white">{s.name}</strong>
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-25 text-secondary">{s.department}</span>
                    </td>
                    <td className="text-secondary">{s.designation}</td>
                    <td>
                      <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 text-uppercase">
                        {s.officer}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.level === 'FULL'
                            ? 'bg-success bg-opacity-25 text-success'
                            : s.level === 'DRAFT'
                            ? 'bg-warning bg-opacity-25 text-warning'
                            : 'bg-secondary bg-opacity-25 text-secondary'
                        }`}
                      >
                        {s.level}
                      </span>
                    </td>
                    <td className="text-white">{s.dailyLimit} req / day</td>
                    <td className="text-secondary">{s.validUntil}</td>
                    <td>
                      <button
                        onClick={() => handleRevokeAll(s.id, s.name)}
                        className="btn btn-outline-danger btn-sm py-0 px-2 d-flex align-items-center gap-1"
                        title="Revoke all permissions"
                      >
                        <Trash2 size={13} />
                        <span>Revoke</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Delegate New Staff */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card bg-dark border border-secondary border-opacity-50 text-light shadow-lg"
            style={{ width: '100%', maxWidth: '500px', borderRadius: '16px' }}
          >
            <div className="card-header border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-3 px-4">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <UserPlus size={18} className="text-primary" />
                Delegate AI Officer Access
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-link text-secondary p-0"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="card-body p-4">
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Staff Member Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-black border-secondary border-opacity-50 text-light"
                  placeholder="e.g. Dr. K. Venkat / Smt. Lakshmi"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">Department</label>
                  <select
                    className="form-select form-select-sm bg-black border-secondary border-opacity-50 text-light"
                    value={newStaffForm.department}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
                  >
                    {DEPARTMENTS.filter(d => d !== 'ALL').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">Designation</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-black border-secondary border-opacity-50 text-light"
                    placeholder="e.g. Lab In-Charge"
                    value={newStaffForm.designation}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, designation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">AI Officer</label>
                  <select
                    className="form-select form-select-sm bg-black border-secondary border-opacity-50 text-light"
                    value={newStaffForm.officer}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, officer: e.target.value })}
                  >
                    <option value="timetable">Timetable Officer</option>
                    <option value="accreditation">Accreditation Officer</option>
                    <option value="student-success">Student Success Officer</option>
                    <option value="admissions">Admissions Officer</option>
                    <option value="finance">Finance Officer</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">Permission Level</label>
                  <select
                    className="form-select form-select-sm bg-black border-secondary border-opacity-50 text-light"
                    value={newStaffForm.level}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, level: e.target.value })}
                  >
                    <option value="DRAFT">DRAFT (Review & Submit)</option>
                    <option value="VIEW_ONLY">VIEW_ONLY (Reports Only)</option>
                    <option value="FULL">FULL (Autonomous Execution)</option>
                  </select>
                </div>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">Daily Request Limit</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    className="form-control form-control-sm bg-black border-secondary border-opacity-50 text-light"
                    value={newStaffForm.dailyLimit}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, dailyLimit: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">Valid Until</label>
                  <input
                    type="date"
                    className="form-control form-control-sm bg-black border-secondary border-opacity-50 text-light"
                    value={newStaffForm.validUntil}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-primary d-flex align-items-center gap-1">
                  <ShieldCheck size={14} />
                  <span>Grant Delegation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
