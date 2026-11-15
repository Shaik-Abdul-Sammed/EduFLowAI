import { useState } from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function PublicationRepositoryPage() {
  const [publications] = useState([
    {
      doi: '10.1109/TSE.2025.3210452',
      title: 'Automated Microservice Anti-Pattern Remediation Using Graph Transformer Embeddings',
      journal: 'IEEE Transactions on Software Engineering (Q1, Impact Factor 8.9)',
      year: '2025',
      citations: 24,
      indexed: 'Scopus & Web of Science'
    },
    {
      doi: '10.1145/3611643.3616298',
      title: 'Optimizing Byzantine Fault Tolerance in Geographically Sharded Blockchains',
      journal: 'ACM Symposium on Operating Systems Principles (SOSP)',
      year: '2024',
      citations: 42,
      indexed: 'CORE A* Conference'
    }
  ])

  return (
    <RolePageTemplate
      role="Faculty"
      title="Research Publications & Citation Metrics Repository"
      description="Track peer-reviewed Scopus and Web of Science indexed journal articles, conference papers, and institutional citation impact."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Total Publications (Last 5 Yrs)</div>
              <div className="h3 fw-bold text-primary mb-1">18 Articles</div>
              <div className="small text-muted">14 Q1 Journals • 4 A* Conferences</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">Total Citations (Google Scholar)</div>
              <div className="h3 fw-bold text-success mb-1">486</div>
              <div className="small text-success">+68 Citations This Year</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="text-muted small">h-index & i10-index</div>
              <div className="h3 fw-bold text-warning mb-1">h-12 • i10-15</div>
              <div className="small text-muted">Verified Scopus Author ID: 5720...</div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Peer-Reviewed Publications
          </h3>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Paper Title</th>
                  <th>Journal / Conference</th>
                  <th>Year</th>
                  <th>Citations</th>
                  <th>Indexing</th>
                  <th className="text-end">DOI Link</th>
                </tr>
              </thead>
              <tbody>
                {publications.map(p => (
                  <tr key={p.doi}>
                    <td className="fw-semibold">{p.title}</td>
                    <td className="small text-muted">{p.journal}</td>
                    <td>{p.year}</td>
                    <td><span className="badge bg-primary bg-opacity-10 text-primary fw-bold">{p.citations}</span></td>
                    <td><span className="badge bg-success bg-opacity-10 text-success">{p.indexed}</span></td>
                    <td className="text-end">
                      <a
                        href={`https://doi.org/${p.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                      >
                        <ExternalLink size={14} /> DOI
                      </a>
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
