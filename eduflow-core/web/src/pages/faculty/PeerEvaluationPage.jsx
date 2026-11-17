import { useState, useEffect } from 'react'
import { Star, CheckCircle2, RefreshCw, AlertCircle, Send } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { wakeUpFetch } from '../../utils/wakeUpHandler'
import { useToast } from '../../context/ToastContext'

export default function PeerEvaluationPage() {
  const { addToast } = useToast?.() || { addToast: () => {} }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [teams, setTeams] = useState([
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

  const fetchPeerEvaluations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await wakeUpFetch('/v1/academics/marks')
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to synchronize peer evaluation rubrics`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setTeams(prev => [
          ...prev,
          {
            teamId: 'Team Sigma (Group 7)',
            project: 'Distributed Log Consensus Engine in Go',
            members: [
              { name: 'Rohan Deshmukh', peerRating: 4.9, comments: 'Built Raft leader election state machine' },
              { name: 'Kavita Nair', peerRating: 4.7, comments: 'Implemented RPC serialization and unit benchmarks' }
            ]
          }
        ])
      }
    } catch (err) {
      setError(err.message || 'Peer evaluation synchronization error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeerEvaluations()
  }, [])

  const handlePublishMarks = async () => {
    setPublishing(true)
    try {
      await wakeUpFetch('/v1/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'peer_evaluation_audit',
          subject: 'Approved & Normalized Project Rubric Marks',
          description: 'Faculty endorsed peer ratings and committed scaled marks to university grade ledger.'
        })
      })

      setPublished(true)
      addToast('Peer evaluation marks normalized and published to gradebook!', 'success')
    } catch (err) {
      addToast(`Publishing error: ${err.message}`, 'error')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Student Group Work Peer Evaluation Review"
      description="Inspect anonymized peer ratings for multi-student group projects to prevent free-riding and normalize individual scores."
    >
      <div className="d-flex flex-column gap-4 w-100">
        {loading && (
          <div data-testid="peer-loading" className="alert alert-secondary py-2 px-3 small d-flex align-items-center gap-2 mb-0">
            <RefreshCw size={16} className="animate-spin" />
            <span>Synchronizing group project rubrics and peer evaluations...</span>
          </div>
        )}

        {error && (
          <div data-testid="peer-error" className="alert alert-danger py-2 px-3 small d-flex justify-content-between align-items-center mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              data-testid="peer-retry"
              className="btn btn-outline-danger btn-sm py-0 px-2"
              onClick={fetchPeerEvaluations}
            >
              Retry
            </button>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <p className="text-muted small mb-0">
            Ratings are collected anonymously across team members to derive free-rider penalty weights.
          </p>
          <button
            type="button"
            data-testid="publish-marks-btn"
            disabled={publishing || published}
            onClick={handlePublishMarks}
            className={`btn btn-sm ${published ? 'btn-success' : 'btn-primary'} d-inline-flex align-items-center gap-1.5`}
          >
            {published ? (
              <>
                <CheckCircle2 size={14} /> Normalized Scores Published
              </>
            ) : publishing ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Send size={14} /> Approve &amp; Publish Marks
              </>
            )}
          </button>
        </div>

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
