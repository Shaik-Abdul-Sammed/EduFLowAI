import { useState } from 'react'
import { Star } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function PeerEvaluationPage() {
  const [teams] = useState([
    {
      teamId: 'Team Delta (Group 4)',
      project: 'IoT Microcontroller Weather Station',
      members: [
        { name: 'Siddharth Roy', peerRating: 4.8, comments: 'Led hardware assembly & sensor drivers' },
        { name: 'Neha Gupta', peerRating: 4.6, comments: 'Engineered backend MQTT broker & cloud ingestion' },
        { name: 'Anil Rao', peerRating: 3.4, comments: 'Contributed to documentation and slides' }
      ]
    }
  ])

  return (
    <RolePageTemplate
      role="Faculty"
      title="Student Group Work Peer Evaluation Review"
      description="Inspect anonymized peer ratings for multi-student group projects to prevent free-riding and normalize individual scores."
    >
      <div className="d-flex flex-column gap-4 w-100">
        {teams.map(t => (
          <div key={t.teamId} className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="h6 fw-bold mb-1">{t.teamId}</h3>
                <p className="text-muted small mb-0">Project: {t.project}</p>
              </div>
              <span className="badge bg-success bg-opacity-10 text-success">Peer Review Closes Tomorrow</span>
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student Contributor</th>
                    <th>Average Peer Score</th>
                    <th>Normalized Contribution Ratio</th>
                    <th>Peer Qualitative Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {t.members.map(m => (
                    <tr key={m.name}>
                      <td className="fw-semibold">{m.name}</td>
                      <td>
                        <span className="d-flex align-items-center gap-1 fw-bold text-warning">
                          <Star size={14} fill="#f59e0b" /> {m.peerRating} / 5.0
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {((m.peerRating / 5.0) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="small text-muted">{m.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </RolePageTemplate>
  )
}
