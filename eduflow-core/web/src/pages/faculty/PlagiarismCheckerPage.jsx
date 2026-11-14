import { useState } from 'react'
import { FileSearch, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function PlagiarismCheckerPage() {
  const [inputText, setInputText] = useState(
    'Distributed state machines require durable ordering of client operations across unreliable network topologies. Paxos achieves safety through quorum intersections across asynchronous phases.'
  )
  const [submissionTitle, setSubmissionTitle] = useState('Comparative Distributed Systems Essay')
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState({
    submission_id: 'SUB-2026-081',
    assignment_title: 'Comparative Distributed Systems Essay',
    ai_score: 9.4,
    similarity_percentage: 11.2,
    status: 'CLEAN',
    matched_sources: [
      {
        source: 'IEEE Transactions on Parallel & Distributed Systems (2024)',
        title: 'Byzantine Quorums and Cloud Fault Tolerance',
        matchedPercentage: 7.4,
        confidence: 'Medium'
      },
      {
        source: 'Stanford CS244b Course Notes',
        title: 'Consensus Protocols in Production',
        matchedPercentage: 3.8,
        confidence: 'Low'
      }
    ]
  })

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setAnalyzing(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/plagiarism/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          assignmentTitle: submissionTitle,
          studentId: 101
        })
      })

      if (res.ok) {
        const data = await safeJson(res)
        if (data?.report) setReport(data.report)
      }
    } catch {
      // Fallback
    } finally {
      setAnalyzing(false)
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'CLEAN') return <span className="badge bg-success px-3 py-1">CLEAN (AUTHENTIC)</span>
    if (status === 'FLAGGED_REVIEW') return <span className="badge bg-warning text-dark px-3 py-1">FLAGGED FOR MANUAL REVIEW</span>
    return <span className="badge bg-danger px-3 py-1">CRITICAL SUSPECT</span>
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Plagiarism & AI Attribution Engine"
      description="Dual-engine similarity scanning and generative AI linguistic attribution detection for student term submissions."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Banner */}
        <div className="card border-0 shadow-sm" style={{
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          color: '#ffffff'
        }}>
          <div className="card-body p-4">
            <span className="badge bg-info text-dark px-3 py-1 mb-2 font-monospace" style={{ fontSize: '0.72rem' }}>
              ● MULTI-CORPUS SCHOLARLY VAULT
            </span>
            <h2 className="h4 fw-bold mb-1 text-white" style={{ wordBreak: 'break-word' }}>
              Academic Integrity &amp; AI Writing Verification
            </h2>
            <p className="text-white-50 small mb-0" style={{ wordBreak: 'break-word' }}>
              Cross-checks against 4.5M peer-reviewed papers, past campus essays, and syntactic LLM watermark signatures.
            </p>
          </div>
        </div>

        {/* Split-Screen UI: Stacks vertically on mobile using flex-wrap / flex-direction */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%'
        }}>
          
          {/* Left Column: Text Input */}
          <div style={{ flex: '1 1 450px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <h3 className="h6 fw-bold text-dark mb-3">Submission Content</h3>
              <form onSubmit={handleCheck}>
                <div className="mb-3">
                  <label htmlFor="submissionTitleInput" className="form-label small fw-bold text-muted">
                    PAPER / ESSAY TITLE
                  </label>
                  <input
                    id="submissionTitleInput"
                    type="text"
                    className="form-control"
                    value={submissionTitle}
                    onChange={(e) => setSubmissionTitle(e.target.value)}
                    style={{ borderRadius: '0.75rem', height: '46px' }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="submissionTextInput" className="form-label small fw-bold text-muted">
                    ESSAY TEXT FOR VERIFICATION
                  </label>
                  <textarea
                    id="submissionTextInput"
                    className="form-control"
                    rows="10"
                    required
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{ borderRadius: '0.75rem', fontSize: '0.88rem', wordBreak: 'break-word' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={analyzing || !inputText.trim()}
                  className="btn btn-primary fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ padding: '12px 24px', borderRadius: '0.85rem' }}
                >
                  <FileSearch size={16} />
                  {analyzing ? 'Scanning Repositories & Detecting AI...' : 'Run Integrity Scan'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: AI Analysis & Similarity Breakdown */}
          <div style={{ flex: '1 1 450px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h6 fw-bold text-dark mb-0">Analysis &amp; Attribution</h3>
                {getStatusBadge(report.status)}
              </div>

              {/* Metric Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="small text-muted fw-bold">SIMILARITY SCORE</div>
                    <div className="h4 fw-bold text-dark mb-0 mt-1">{report.similarity_percentage}%</div>
                    <small className="text-muted">Matched Academic Corpus</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="small text-muted fw-bold">AI GENERATION PROBABILITY</div>
                    <div className="h4 fw-bold text-primary mb-0 mt-1">{report.ai_score}%</div>
                    <small className="text-muted">Perplexity &amp; Burstiness</small>
                  </div>
                </div>
              </div>

              {/* Matched Sources */}
              <h4 className="small fw-bold text-muted text-uppercase mb-2">Matched Scholarly Sources</h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {report.matched_sources && report.matched_sources.length > 0 ? (
                  report.matched_sources.map((src, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-3"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold small text-dark" style={{ wordBreak: 'break-word' }}>
                          {src.source}
                        </span>
                        <span className="badge bg-secondary-subtle text-secondary small">
                          {src.matchedPercentage}% Match
                        </span>
                      </div>
                      {src.title && (
                        <div className="text-muted small" style={{ wordBreak: 'break-word' }}>
                          Paper: <em>"{src.title}"</em>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-3 bg-light text-muted small text-center">
                    No statistically significant external source overlap detected.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-top small text-muted">
                🛡️ Verified against IEEE, ACM, arXiv, and EduFlow Internal Digital Library.
              </div>
            </div>
          </div>

        </div>

      </div>
    </RolePageTemplate>
  )
}
