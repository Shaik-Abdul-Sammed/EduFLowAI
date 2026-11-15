import { useState } from 'react'
import { FileText, Download, CheckCircle } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function ResumeBuilderPage() {
  const [profile] = useState({
    name: 'Ananya Sharma',
    rollNumber: 'CS22B1044',
    department: 'Computer Science & Engineering',
    cgpa: '9.42 / 10.0',
    skills: ['C++', 'Python', 'React.js', 'PostgreSQL', 'Docker', 'Distributed Systems'],
    verifiedCertificates: [
      'Advanced Cloud Computing (IIT Madras / NPTEL Elite+Gold)',
      'Algorithms on Graphs (University of California San Diego)'
    ],
    projects: [
      { title: 'EduFlow AI Microservices Engine', tech: 'Node.js, PostgreSQL, Redis', desc: 'Engineered high-throughput proctoring and event gateway.' }
    ]
  })

  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Resume_${profile.rollNumber}.json`
      a.click()
    }, 1000)
  }

  return (
    <RolePageTemplate
      role="Student"
      title="Automated ATS Resume Generator"
      description="Instant resume builder that auto-syncs verified college grades, course credentials, and GitHub repositories."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h3 className="h5 fw-bold mb-1 d-flex align-items-center gap-2">
                <FileText className="text-primary" size={22} /> Verified Academic Dossier
              </h3>
              <p className="text-muted small mb-0">Grade records cryptographically verified by college registrar.</p>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              <Download size={16} /> {downloading ? 'Compiling PDF...' : 'Download ATS-Ready CV'}
            </button>
          </div>

          <div className="p-4 border rounded-3 bg-light">
            <div className="border-bottom pb-3 mb-3">
              <h4 className="h4 fw-bold mb-0">{profile.name}</h4>
              <div className="text-muted small">{profile.department} • Roll No: {profile.rollNumber}</div>
              <div className="badge bg-success bg-opacity-10 text-success mt-2">Verified Cumulative GPA: {profile.cgpa}</div>
            </div>

            <div className="mb-3">
              <h5 className="h6 fw-bold text-uppercase text-muted">Core Competencies</h5>
              <div className="d-flex flex-wrap gap-2">
                {profile.skills.map(s => (
                  <span key={s} className="badge bg-white text-dark border px-2.5 py-1.5">{s}</span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <h5 className="h6 fw-bold text-uppercase text-muted">Verified Certifications</h5>
              <ul className="list-unstyled mb-0">
                {profile.verifiedCertificates.map(c => (
                  <li key={c} className="d-flex align-items-center gap-2 text-dark small mb-1">
                    <CheckCircle size={14} className="text-success" /> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="h6 fw-bold text-uppercase text-muted">Key Projects</h5>
              {profile.projects.map(p => (
                <div key={p.title} className="p-3 bg-white rounded border mb-2">
                  <div className="fw-bold">{p.title}</div>
                  <div className="text-muted small mb-1">Stack: {p.tech}</div>
                  <div className="small">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
