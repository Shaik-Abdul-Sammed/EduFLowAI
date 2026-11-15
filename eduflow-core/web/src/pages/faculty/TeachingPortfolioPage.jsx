import { useState } from 'react'
import { Award, BookOpen, Star, FileCheck, CheckCircle2, Download } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function TeachingPortfolioPage() {
  const [profile] = useState({
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
  })

  return (
    <RolePageTemplate
      role="Faculty"
      title="Faculty Self-Appraisal & Pedagogy Portfolio"
      description="Compile comprehensive annual appraisal dossiers (PBAS / CAS), document pedagogical innovations, and aggregate student feedback ratings."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <span className="badge bg-primary mb-2">Performance-Based Appraisal System (PBAS)</span>
              <h3 className="h5 fw-bold mb-1">{profile.facultyName}</h3>
              <p className="text-muted small mb-0">{profile.designation} • {profile.experience}</p>
            </div>
            <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
              <Download size={16} /> Export CAS Dossier (PDF)
            </button>
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
            <h4 className="h6 fw-bold mb-2">Pedagogical Innovations & Technology Injections</h4>
            <ul className="list-unstyled mb-0">
              {profile.pedagogyInnovations.map(p => (
                <li key={p} className="d-flex align-items-center gap-2 text-dark small mb-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
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
