import { useState } from 'react'
import { AlertCircle, UserCheck, CheckCircle2, MessageSquare, Clock } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function StudentInterventionPage() {
  const [interventions, setInterventions] = useState([
    {
      id: 1,
      student: 'Manoj Kumar (CS22B1072)',
      reason: 'Failed Mid-Term 1 (18/50) in Algorithms & Discrete Maths',
      actionPlan: 'Enrolled in 2-week remedial problem-solving tutorial with peer tutor',
      status: 'In Progress',
      progress: 'Mid-Term 2 Improved to 34/50'
    },
    {
      id: 2,
      student: 'Kavita Das (CS22B1033)',
      reason: 'Consecutive lab assignment submission delays (> 10 days)',
      actionPlan: 'Special counseling session with mentor; verified family health emergency',
      status: 'Resolved',
      progress: 'All pending lab git commits cleared'
    }
  ])

  return (
    <RolePageTemplate
      role="Faculty"
      title="Early-Warning Academic Remedial Intervention"
      description="Identify students struggling in continuous assessments, assign remedial coaching, and track score improvements."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <AlertCircle size={18} className="text-warning" /> Active Student Remediation Casework
          </h3>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student & Roll Number</th>
                  <th>Triggering Academic Concern</th>
                  <th>Remedial Action Prescribed</th>
                  <th>Current State</th>
                  <th>Post-Intervention Progress</th>
                </tr>
              </thead>
              <tbody>
                {interventions.map(i => (
                  <tr key={i.id}>
                    <td className="fw-bold">{i.student}</td>
                    <td className="small text-danger">{i.reason}</td>
                    <td className="small">{i.actionPlan}</td>
                    <td>
                      <span className={`badge ${i.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'} bg-opacity-10`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="small fw-semibold text-success">{i.progress}</td>
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
