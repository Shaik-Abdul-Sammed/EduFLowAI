import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function CurriculumRevisionPage() {
  const [revisions] = useState([
    {
      code: 'CS410',
      course: 'Cloud Native Microservices Architecture',
      proposedChange: 'Replace legacy SOAP XML practicals with gRPC Protocol Buffers & OpenTelemetry tracing',
      bosStatus: 'Passed BoS Committee (Awaiting Academic Council)',
      proposer: 'Prof. Anupama Verma',
      votes: '14 / 16 Faculty Approved'
    },
    {
      code: 'CS302',
      course: 'Principles of Programming Languages',
      proposedChange: 'Introduce Rust memory safety and ownership model in place of Ada concurrency',
      bosStatus: 'Under Peer Review',
      proposer: 'Dr. Ramesh Sundaram',
      votes: '11 / 16 Faculty Approved'
    }
  ])

  return (
    <RolePageTemplate
      role="Faculty"
      title="Board of Studies (BoS) Curriculum Revision"
      description="Propose syllabus updates, industry 4.0 alignment amendments, and participate in departmental BoS voting."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Active BoS Syllabus Amendment Proposals
          </h3>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Proposed Curriculum Modernization</th>
                  <th>Proposing Faculty</th>
                  <th>BoS Approval Status</th>
                  <th>Department Votes</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map(r => (
                  <tr key={r.code}>
                    <td className="fw-bold">{r.code}</td>
                    <td>{r.course}</td>
                    <td className="small">{r.proposedChange}</td>
                    <td className="small text-muted">{r.proposer}</td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success">
                        {r.bosStatus}
                      </span>
                    </td>
                    <td><span className="badge bg-primary">{r.votes}</span></td>
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
