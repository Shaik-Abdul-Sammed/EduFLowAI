import { useState, useEffect } from 'react'
import { Sparkles, BookOpen, Compass, ArrowRight, Award, BrainCircuit, RefreshCw } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function AdaptiveLearningPage() {
  const [pathData, setPathData] = useState({
    current_level: 'Upper Intermediate Scholar',
    learning_style: 'Visual-Kinesthetic',
    mastery_score: 84.5,
    recommended_courses: [
      {
        courseCode: 'CS401',
        title: 'Distributed Systems & Cloud Computing',
        matchReason: 'Mastery in Operating Systems (88%) and Computer Networks (91%).',
        prerequisites: ['CS301', 'CS304'],
        difficulty: 'Advanced',
        estimatedWeeks: 12
      },
      {
        courseCode: 'AI302',
        title: 'Deep Learning & Neural Architectures',
        matchReason: 'Strong foundation in Linear Algebra and algorithmic logic.',
        prerequisites: ['MATH201', 'CS202'],
        difficulty: 'Advanced',
        estimatedWeeks: 14
      },
      {
        courseCode: 'SEC305',
        title: 'Applied Cryptography & Zero-Knowledge Proofs',
        matchReason: 'Recommended based on high scores in Discrete Mathematics.',
        prerequisites: ['CS205'],
        difficulty: 'Intermediate',
        estimatedWeeks: 10
      }
    ]
  })
  const [generating, setGenerating] = useState(false)
  const [targetSpecialization, setTargetSpecialization] = useState('Artificial Intelligence & Cloud Systems')

  const fetchPath = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/learning/path/101`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.path) setPathData(data.path)
      }
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    fetchPath()
  }, [])

  const handleRegenerate = async (e) => {
    if (e) e.preventDefault()
    setGenerating(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/learning/generate-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 101,
          targetDomain: targetSpecialization,
          pastGrades: [{ course: 'CS301', grade: 9.2 }, { course: 'CS304', grade: 8.8 }]
        })
      })
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.path) setPathData(data.path)
      }
    } catch {
      // Retain existing state
    } finally {
      setGenerating(false)
    }
  }

  return (
    <RolePageTemplate
      role="Student"
      title="Adaptive Learning & Personalized Curriculum"
      description="Autonomous AI pathway generator dynamically tailored to your mastery telemetry and cognitive pace."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Banner with Metrics */}
        <div className="card border-0 shadow-sm" style={{
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          color: '#ffffff',
          overflow: 'hidden'
        }}>
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <span className="badge bg-primary-subtle text-light border border-light-subtle px-3 py-1 mb-2" style={{ fontSize: '0.75rem' }}>
                  <BrainCircuit size={13} className="me-1 inline" /> AI TIER-1 CURRICULUM OPTIMIZER
                </span>
                <h2 className="h4 fw-bold mb-1 text-white" style={{ wordBreak: 'break-word' }}>
                  Personalized Roadmap: {pathData.current_level}
                </h2>
                <p className="text-white-50 small mb-0" style={{ wordBreak: 'break-word' }}>
                  Dominant Learning Modality: <strong>{pathData.learning_style}</strong> • Calculated Mastery Index: <strong>{pathData.mastery_score}%</strong>
                </p>
              </div>

              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="btn btn-light fw-bold d-flex align-items-center gap-2 shadow-sm"
                style={{ padding: '12px 24px', borderRadius: '0.85rem' }}
              >
                <RefreshCw size={16} className={generating ? 'spinner-border spinner-border-sm' : ''} />
                {generating ? 'Re-optimizing Pathway...' : 'Recalibrate AI Path'}
              </button>
            </div>
          </div>
        </div>

        {/* Specialization Goal Selector */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1rem', background: '#ffffff' }}>
          <form onSubmit={handleRegenerate} className="row g-3 align-items-end">
            <div className="col-12 col-md-8">
              <label htmlFor="specializationSelect" className="form-label small fw-bold text-muted">
                CAREER TARGET / SPECIALIZATION GOAL
              </label>
              <select
                id="specializationSelect"
                className="form-select"
                value={targetSpecialization}
                onChange={(e) => setTargetSpecialization(e.target.value)}
                style={{ borderRadius: '0.75rem', height: '48px' }}
              >
                <option value="Artificial Intelligence & Cloud Systems">Artificial Intelligence &amp; Cloud Systems</option>
                <option value="Full-Stack FinTech & Distributed Systems">Full-Stack FinTech &amp; Distributed Systems</option>
                <option value="Cybersecurity, Cryptography & Zero-Knowledge">Cybersecurity, Cryptography &amp; Zero-Knowledge</option>
                <option value="Bioinformatics & Healthcare Analytics">Bioinformatics &amp; Healthcare Analytics</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <button
                type="submit"
                disabled={generating}
                className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{ padding: '12px 24px', borderRadius: '0.75rem', height: '48px' }}
              >
                <Sparkles size={16} />
                Generate New Pathway
              </button>
            </div>
          </form>
        </div>

        {/* Visual Roadmap using CSS Grid with minmax(0, 1fr) to guarantee ZERO overflow */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          gap: '1.25rem',
          width: '100%'
        }}>
          {pathData.recommended_courses.map((course, idx) => (
            <div
              key={course.courseCode || `course-${idx}`}
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: '1.25rem',
                borderTop: `4px solid ${idx === 0 ? '#4f46e5' : idx === 1 ? '#06b6d4' : '#10b981'}`,
                overflow: 'hidden',
                background: '#ffffff'
              }}
            >
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-light text-primary border font-monospace fw-bold px-2 py-1" style={{ fontSize: '0.8rem' }}>
                      {course.courseCode}
                    </span>
                    <span className="badge bg-success-subtle text-success small px-2 py-1">
                      {course.difficulty} • {course.estimatedWeeks} WEEKS
                    </span>
                  </div>

                  <h3 className="h6 fw-bold text-dark mb-2" style={{ wordBreak: 'break-word' }}>
                    {course.title}
                  </h3>

                  <p className="text-muted small mb-3" style={{ wordBreak: 'break-word', lineHeight: 1.5 }}>
                    <strong>AI Rationale:</strong> {course.matchReason}
                  </p>

                  <div className="mb-3">
                    <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.7rem' }}>PREREQUISITES:</span>
                    <div className="d-flex flex-wrap gap-1">
                      {course.prerequisites?.map((req, rIdx) => (
                        <span key={rIdx} className="badge bg-light text-secondary border small" style={{ wordBreak: 'break-word' }}>
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-top mt-2 d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Milestone #{idx + 1}</span>
                  <button
                    className="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center gap-1"
                    style={{ padding: '8px 16px', borderRadius: '0.65rem' }}
                  >
                    Enroll Module <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </RolePageTemplate>
  )
}
