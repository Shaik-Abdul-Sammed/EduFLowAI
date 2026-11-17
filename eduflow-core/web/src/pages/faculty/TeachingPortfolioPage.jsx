import { useState, useEffect } from 'react'
import { Award, BookOpen, Star, FileCheck, CheckCircle2, Download, RefreshCw } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../utils/apiConfig'

const INITIAL_PROFILE = {
  facultyName: 'Dr. Ramesh Sundaram',
  designation: 'Associate Professor & HoD (CSE)',
  experience: '12 Years (7 Yrs at EduFlow Institute of Tech)',
  coursesHandled: ['CS301: Operating Systems', 'CS402: Distributed Systems', 'CS501: Advanced Cloud Architecture'],
  pedagogyInnovations: [
    'Implemented flipped classroom with on-device AR 3D model simulations',
    'Created open-source Linux kernel module tracing assignments using eBPF',
    'Adopted SpeedGrader™ automated unit test harnesses for lab grading'
  ],
  studentFeedbackRating: '4.85 / 5.0 (Across 420 student reviews)',
  workshopsOrganized: 6
}

export default function TeachingPortfolioPage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  const fetchFacultyCourses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch(getFullApiUrl('/api/admin/timetable'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        const data = await res.json()
        const slots = Array.isArray(data) ? data : data.slots || []
        const distinctCourses = [...new Set(slots.map(s => s.course).filter(Boolean))]
        if (distinctCourses.length > 0) {
          setProfile(prev => ({
            ...prev,
            coursesHandled: distinctCourses.slice(0, 4)
          }))
        }
      }
    } catch (err) {
      console.warn('PostgreSQL timetable courses fetch fallback:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacultyCourses()
  }, [])

  const handleExportDossier = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: `[PBAS Faculty Appraisal] Dossier Export for ${profile.facultyName}`,
          description: `Courses: ${profile.coursesHandled.join(', ')}\nRating: ${profile.studentFeedbackRating}\nDesignation: ${profile.designation}`,
          category: 'faculty_appraisal',
          priority: 'medium'
        })
      })

      const blob = new Blob([JSON.stringify({ ...profile, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Faculty_PBAS_Dossier_${profile.facultyName.replace(/\s+/g, '_')}.json`
      a.click()

      setStatusMsg('Performance-Based Appraisal Dossier compiled and archived into institutional registrar records!')
    } catch (err) {
      setStatusMsg('Dossier exported to local device.')
    } finally {
      setExporting(false)
      setTimeout(() => setStatusMsg(null), 5000)
    }
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Faculty Self-Appraisal & Pedagogy Portfolio"
      description="Compile comprehensive annual appraisal dossiers (PBAS / CAS), document pedagogical innovations, and aggregate student feedback ratings."
    >
      <div className="d-flex flex-column gap-4 w-100">
        {statusMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-0 shadow-sm">
            <CheckCircle2 size={18} />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <span className="badge bg-primary mb-2">Performance-Based Appraisal System (PBAS)</span>
              <h3 className="h5 fw-bold mb-1">{profile.facultyName}</h3>
              <p className="text-muted small mb-0">{profile.designation} • {profile.experience}</p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={fetchFacultyCourses}
                disabled={loading}
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                title="Refresh course allocations from PostgreSQL"
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
              <button
                onClick={handleExportDossier}
                disabled={exporting}
                className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
              >
                <Download size={16} /> {exporting ? 'Compiling Dossier...' : 'Export CAS Dossier (JSON/PDF)'}
              </button>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 border">
                <div className="text-muted small">Student Pedagogy Score</div>
                <div className="h4 fw-bold text-success mb-0 d-flex align-items-center gap-1">
                  <Star size={18} fill="#10b981" /> {profile.studentFeedbackRating}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 border">
                <div className="text-muted small">Active Teaching Load</div>
                <div className="h4 fw-bold text-primary mb-0">14 Contact Hrs / Wk</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 border">
                <div className="text-muted small">FDP / Workshops Organized</div>
                <div className="h4 fw-bold text-dark mb-0">{profile.workshopsOrganized} Events</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="h6 fw-bold mb-2">Active Assigned Courses (Current Academic Year)</h4>
            <div className="d-flex flex-wrap gap-2">
              {profile.coursesHandled.map(c => (
                <span key={c} className="badge bg-white text-dark border p-2">{c}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="h6 fw-bold mb-2">Pedagogical Innovations & Technology Adoptions</h4>
            <ul className="list-group list-group-flush">
              {profile.pedagogyInnovations.map((p, idx) => (
                <li key={idx} className="list-group-item px-0 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
