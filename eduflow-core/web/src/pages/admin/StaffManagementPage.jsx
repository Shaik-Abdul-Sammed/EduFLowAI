import { useState } from 'react'
import {
  Download,
  Filter,
  Trash2
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const DEPARTMENTS = ['ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI', 'MBA']

export default function AdminStaffManagementPage() {
  const { addToast } = useToast()
  const [selectedDept, setSelectedDept] = useState('ALL')

  const [staffData, setStaffData] = useState([
    { id: 105, name: 'Priya Sharma', department: 'CSE', designation: 'Academic Coordinator', officer: 'timetable', level: 'DRAFT', dailyLimit: 15, validUntil: '2026-12-31' },
    { id: 106, name: 'Ramesh Patel', department: 'ECE', designation: 'Lab In-Charge', officer: 'accreditation', level: 'VIEW_ONLY', dailyLimit: 10, validUntil: '2026-12-31' },
    { id: 107, name: 'Ananya Rao', department: 'CSE', designation: 'Department Assistant', officer: 'student-success', level: 'FULL', dailyLimit: 25, validUntil: '2026-12-31' },
    { id: 108, name: 'Sanjay Kumar', department: 'MECH', designation: 'Exam Coordinator', officer: 'timetable', level: 'DRAFT', dailyLimit: 20, validUntil: '2026-12-31' },
    { id: 109, name: 'Geeta Nair', department: 'MBA', designation: 'Admissions Assistant', officer: 'admissions', level: 'FULL', dailyLimit: 30, validUntil: '2026-12-31' },
  ])

  const filteredStaff = selectedDept === 'ALL'
    ? staffData
    : staffData.filter((s) => s.department === selectedDept)

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
        <button onClick={handleExportCsv} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 text-light">
          <Download size={15} />
          <span>Export Permission Matrix (CSV)</span>
        </button>
      </div>

      {/* Filters and Stats */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <Filter size={16} className="text-secondary" />
          <span className="small text-secondary fw-semibold">Filter by Department:</span>
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
        <span className="text-secondary small">
          Showing <strong>{filteredStaff.length}</strong> delegated permissions across campus
        </span>
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
              {filteredStaff.map((s) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
