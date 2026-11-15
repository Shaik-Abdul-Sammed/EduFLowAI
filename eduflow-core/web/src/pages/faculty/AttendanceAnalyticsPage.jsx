import { useState } from 'react'
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function AttendanceAnalyticsPage() {
  const [atRiskStudents, setAtRiskStudents] = useState([
    { roll: 'CS22B1089', name: 'Rohan Mehta', attendance: '62.4%', classesMissed: 14, risk: 'Critical (< 65%)', notified: false },
    { roll: 'CS22B1041', name: 'Tanvi Joshi', attendance: '71.0%', classesMissed: 9, risk: 'Warning (< 75%)', notified: true },
    { roll: 'CS22B1095', name: 'Deepak Nair', attendance: '68.5%', classesMissed: 11, risk: 'Warning (< 75%)', notified: false }
  ])

  const notifyStudent = (roll) => {
    setAtRiskStudents(prev => prev.map(s => s.roll === roll ? { ...s, notified: true } : s))
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Attendance Analytics & Early Dropout Predictor"
      description="Inspect classroom attendance distributions, track students falling below statutory 75% thresholds, and dispatch instant SMS/email alerts."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Course Average Attendance</div>
              <div className="h3 fw-bold text-success mb-1">84.2%</div>
              <div className="small text-muted">Total Enrolled: 64 Students</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Students Below 75% Threshold</div>
              <div className="h3 fw-bold text-warning mb-1">3 Students</div>
              <div className="small text-warning">Requires Parent Notification</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Statutory Condonation Bar</div>
              <div className="h3 fw-bold text-danger mb-1">1 Student &lt; 65%</div>
              <div className="small text-danger">Exam Hall Ticket Withheld</div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <AlertTriangle size={18} className="text-warning" /> Students Requiring Immediate Attendance Remediation
          </h3>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Attendance %</th>
                  <th>Missed Lectures</th>
                  <th>Risk Category</th>
                  <th className="text-end">Escalation Action</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.map(s => (
                  <tr key={s.roll}>
                    <td className="fw-bold">{s.roll}</td>
                    <td>{s.name}</td>
                    <td>
                      <span className="badge bg-danger bg-opacity-10 text-danger fw-bold">
                        {s.attendance}
                      </span>
                    </td>
                    <td>{s.classesMissed} Lectures</td>
                    <td>
                      <span className={`badge ${s.risk.includes('Critical') ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {s.risk}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        onClick={() => notifyStudent(s.roll)}
                        disabled={s.notified}
                        className={`btn btn-sm ${s.notified ? 'btn-success' : 'btn-outline-danger'} d-inline-flex align-items-center gap-1.5`}
                      >
                        {s.notified ? (
                          <>
                            <CheckCircle2 size={14} /> Alert Sent
                          </>
                        ) : (
                          <>
                            <Send size={14} /> Send Parent SMS
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
