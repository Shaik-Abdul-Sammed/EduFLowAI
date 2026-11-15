import { useState } from 'react'
import { FolderGit2, CheckCircle2, Clock, Upload, Users } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function CapstoneProjectPage() {
  const [project] = useState({
    title: 'Fault-Tolerant Distributed Consensus in Edge Networks',
    guide: 'Dr. S. K. Narayanan (Professor & Dean R&D)',
    team: ['Ananya Sharma (CS22B1044)', 'Varun Desai (CS22B1058)', 'Nisha Reddy (CS22B1012)'],
    currentPhase: 'Phase 2: Architectural Simulation & Benchmarks',
    milestones: [
      { name: 'Problem Statement & Literature Survey', status: 'Approved', grade: 'A+' },
      { name: 'Software Architecture & Data Flow Design', status: 'Approved', grade: 'A' },
      { name: 'Implementation & Load Testing', status: 'In Review', grade: 'Pending' },
      { name: 'Final Thesis & Viva-Voce Defense', status: 'Scheduled', grade: 'Pending' }
    ]
  })

  return (
    <RolePageTemplate
      role="Student"
      title="Capstone & Final Year Project Review Hub"
      description="Track milestone deliverables, upload project code repositories, and schedule thesis defense sessions."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <span className="badge bg-primary mb-2">B.Tech Final Year Capstone</span>
              <h3 className="h5 fw-bold mb-1">{project.title}</h3>
              <p className="text-muted small mb-0">Supervisor: {project.guide}</p>
            </div>
            <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
              <Upload size={16} /> Upload Progress Report
            </button>
          </div>

          <div className="p-3 bg-light rounded-3 mb-4">
            <h4 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <Users size={16} className="text-primary" /> Project Team Members
            </h4>
            <div className="d-flex flex-wrap gap-2">
              {project.team.map(m => (
                <span key={m} className="badge bg-white text-dark border p-2">{m}</span>
              ))}
            </div>
          </div>

          <h4 className="h6 fw-bold mb-3">Milestone Progress & Committee Evaluation</h4>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Deliverable Milestone</th>
                  <th>Approval State</th>
                  <th>Committee Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {project.milestones.map(m => (
                  <tr key={m.name}>
                    <td className="fw-semibold">{m.name}</td>
                    <td>
                      <span className={`badge ${m.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'} bg-opacity-10`}>
                        {m.status}
                      </span>
                    </td>
                    <td>{m.grade}</td>
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
