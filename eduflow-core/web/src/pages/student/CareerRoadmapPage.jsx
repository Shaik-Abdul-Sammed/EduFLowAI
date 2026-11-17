import { useState, useEffect } from 'react'
import { Compass, Briefcase, Award, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../utils/apiConfig'

export default function CareerRoadmapPage() {
  const [selectedTrack, setSelectedTrack] = useState('Full Stack AI Systems')
  const [readinessScore, setReadinessScore] = useState(86)
  const [loading, setLoading] = useState(false)

  const [tracks, setTracks] = useState({
    'Full Stack AI Systems': [
      { step: 1, title: 'Data Structures & Algorithmic Complexity', status: 'Completed', score: '94%' },
      { step: 2, title: 'Distributed Systems & Microservices Architecture', status: 'In Progress', score: '78%' },
      { step: 3, title: 'LLM Fine-Tuning & Vector Databases (RAG)', status: 'Pending', score: '—' },
      { step: 4, title: 'Production Docker & Kubernetes CI/CD Pipeline', status: 'Pending', score: '—' },
    ],
    'Cloud Security & DevSecOps': [
      { step: 1, title: 'Computer Networks & Cryptography Basics', status: 'Completed', score: '88%' },
      { step: 2, title: 'IAM, Zero Trust & OIDC/OAuth2 Standards', status: 'In Progress', score: '82%' },
      { step: 3, title: 'Cloud Infrastructure Penetration Testing', status: 'Pending', score: '—' },
    ]
  })

  useEffect(() => {
    async function loadLiveRoadmap() {
      setLoading(true)
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(getFullApiUrl('/api/v1/learning/path/101'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          const courses = data?.path?.recommended_courses || []
          if (courses.length > 0) {
            setTracks(prev => ({
              ...prev,
              'Adaptive AI Career Pathway': courses.map((c, i) => ({
                step: i + 1,
                title: `${c.courseCode}: ${c.title}`,
                status: i === 0 ? 'In Progress' : 'Pending',
                score: `${c.difficulty} • ${c.estimatedWeeks}w`
              }))
            }))
            if (data?.path?.mastery_score) {
              setReadinessScore(Math.round(data.path.mastery_score))
            }
          }
        }
      } catch (err) {
        console.debug('Failed to load career roadmap path:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLiveRoadmap()
  }, [])

  return (
    <RolePageTemplate
      role="Student"
      title="Career Roadmap & Skill Gap Analyzer"
      description="Industry-aligned career pathway visualization, prerequisite skill trees, and recruitment readiness scores."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h3 className="h5 fw-bold mb-1 d-flex align-items-center gap-2">
                <Compass className="text-primary" size={22} /> Career Track Specialization
              </h3>
              <p className="text-muted small mb-0">Select your intended engineering domain to evaluate syllabus milestones.</p>
            </div>
            <div className="btn-group" role="group">
              {Object.keys(tracks).map(track => (
                <button
                  key={track}
                  type="button"
                  onClick={() => setSelectedTrack(track)}
                  className={`btn btn-sm ${selectedTrack === track ? 'btn-primary' : 'btn-outline-secondary'}`}
                >
                  {track}
                </button>
              ))}
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small">Campus Placement Readiness</div>
                <div className="h3 fw-bold text-success mb-0">{readinessScore} / 100</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small">Industry Projects Completed</div>
                <div className="h3 fw-bold text-primary mb-0">4 Repos</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small">Target Hiring Partners</div>
                <div className="h3 fw-bold text-dark mb-0">18 Companies</div>
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 80 }}>Stage</th>
                  <th>Skill Milestone</th>
                  <th>Status</th>
                  <th>Competency Score</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {tracks[selectedTrack].map(item => (
                  <tr key={item.step}>
                    <td>
                      <span className="badge bg-primary rounded-circle" style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.step}
                      </span>
                    </td>
                    <td className="fw-semibold">{item.title}</td>
                    <td>
                      <span className={`badge ${item.status === 'Completed' ? 'bg-success' : item.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-secondary'} bg-opacity-10`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.score}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                        View Resources <ChevronRight size={14} />
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
