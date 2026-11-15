import { useState } from 'react'
import { DollarSign, Award, Clock, FileCheck, Plus } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function ResearchGrantTrackerPage() {
  const [grants] = useState([
    {
      id: 'DST-SERB-2025-089',
      title: 'Scalable Graph Neural Networks for Genomic Structural Variant Detection',
      agency: 'Science and Engineering Research Board (SERB), Govt. of India',
      sanctioned: '₹ 45,50,000',
      utilized: '₹ 28,40,000',
      balance: '₹ 17,10,000',
      status: 'Active (Year 2 of 3)'
    },
    {
      id: 'AICTE-RPS-2024-112',
      title: 'Edge AI Sensors for Precision Agricultural Irrigation in Semi-Arid Zones',
      agency: 'All India Council for Technical Education (AICTE)',
      sanctioned: '₹ 18,00,000',
      utilized: '₹ 17,20,000',
      balance: '₹ 80,000',
      status: 'Audit Utilization Certificate Submitted'
    }
  ])

  return (
    <RolePageTemplate
      role="Faculty"
      title="Sponsored Research & Consultancy Grant Tracker"
      description="Manage governmental and industrial sponsored research grants, track recurring budget disbursements, and audit utilization certificates (UC)."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Total Sanctioned Research Funding</div>
              <div className="h3 fw-bold text-primary mb-1">₹ 63.50 Lakhs</div>
              <div className="small text-muted">2 Active Funded Projects</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Fund Utilization Index</div>
              <div className="h3 fw-bold text-success mb-1">71.8%</div>
              <div className="small text-success">Equipment & JRF Stipends Disbursed</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Upcoming UC Audit Deadline</div>
              <div className="h3 fw-bold text-warning mb-1">March 31, 2027</div>
              <div className="small text-muted">Auditor Sign-off In Progress</div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Award size={18} className="text-primary" /> Active Sponsored Projects
          </h3>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Sanction Ref</th>
                  <th>Project Title</th>
                  <th>Funding Agency</th>
                  <th>Sanctioned</th>
                  <th>Disbursed</th>
                  <th>Project State</th>
                </tr>
              </thead>
              <tbody>
                {grants.map(g => (
                  <tr key={g.id}>
                    <td className="fw-bold">{g.id}</td>
                    <td className="fw-semibold">{g.title}</td>
                    <td className="small text-muted">{g.agency}</td>
                    <td className="fw-bold text-primary">{g.sanctioned}</td>
                    <td className="small">{g.utilized}</td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success">
                        {g.status}
                      </span>
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
