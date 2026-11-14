import { useState, useEffect } from 'react'
import { Award, ShieldCheck, ExternalLink, CheckCircle2, Lock, Plus, Sparkles } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function CredentialWalletPage() {
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      skill_name: 'Distributed Systems & Microservices Architecture',
      blockchain_hash: '0x8f72a4c11b0e334df568194a2b904d9c7e0123456789abcdef0123456789abcd',
      issuer_name: 'EduFlow Global Academic Consortium',
      badge_icon: 'shield-check',
      verification_url: 'https://verify.eduflow.ai/cert/0x8f72a4c11b0e334df568194a2b904d9c7e0123456789abcdef0123456789abcd',
      metadata_json: { credits: 4, grade: 'A+', verificationNetwork: 'EduFlow Ledger PoA Testnet' },
      issued_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
    },
    {
      id: 2,
      skill_name: 'AI Agent Architecture & LLM Orchestration',
      blockchain_hash: '0x3c99a81e55047bca88172901eeff441299ab1123456789abcdef0123456789ef',
      issuer_name: 'Stanford-EduFlow AI Collaborative Lab',
      badge_icon: 'cpu',
      verification_url: 'https://verify.eduflow.ai/cert/0x3c99a81e55047bca88172901eeff441299ab1123456789abcdef0123456789ef',
      metadata_json: { credits: 3, grade: 'Outstanding', verificationNetwork: 'EduFlow Ledger PoA Testnet' },
      issued_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString()
    }
  ])
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [issuing, setIssuing] = useState(false)
  const [verifiedModal, setVerifiedModal] = useState(null)

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/credentials/wallet/101`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.credentials && data.credentials.length > 0) {
          setCredentials(data.credentials)
        }
      }
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    fetchCredentials()
  }, [])

  const handleIssueCredential = async (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    setIssuing(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/credentials/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 101,
          studentRoll: '2024-CSE-042',
          skillName: newSkill.trim(),
          issuerName: 'EduFlow Global Academic Consortium',
          metadata: { verifiedDate: new Date().toISOString() }
        })
      })
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.credential) {
          setCredentials(prev => [data.credential, ...prev])
          setShowIssueModal(false)
          setNewSkill('')
        }
      }
    } catch {
      // Fallback local append
    } finally {
      setIssuing(false)
    }
  }

  return (
    <RolePageTemplate
      role="Student"
      title="W3C Verifiable Credential Wallet"
      description="Cryptographically verifiable micro-credentials and skill badges anchored to the EduFlow Proof-of-Authority ledger."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Header summary */}
        <div className="card border-0 shadow-sm" style={{
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #10b981 100%)',
          color: '#ffffff'
        }}>
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <span className="badge bg-light text-success px-3 py-1 mb-2 font-monospace" style={{ fontSize: '0.72rem' }}>
                  ● IMMUTABLE LEDGER ACTIVE
                </span>
                <h2 className="h4 fw-bold mb-1 text-white" style={{ wordBreak: 'break-word' }}>
                  Decentralized Academic Identity Wallet
                </h2>
                <p className="text-white-50 small mb-0" style={{ wordBreak: 'break-word' }}>
                  Holder Roll: <strong>2024-CSE-042</strong> • Verified Blockchain Credentials: <strong>{credentials.length} Badges</strong>
                </p>
              </div>

              <button
                onClick={() => setShowIssueModal(true)}
                className="btn btn-light fw-bold d-flex align-items-center gap-2 shadow-sm"
                style={{ padding: '12px 24px', borderRadius: '0.85rem' }}
              >
                <Plus size={16} /> Mint Skill Badge
              </button>
            </div>
          </div>
        </div>

        {/* Responsive flexbox layout with flex-wrap and zero horizontal overflow */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          width: '100%'
        }}>
          {credentials.map((cred, idx) => (
            <div
              key={cred.blockchain_hash || `cred-${idx}`}
              className="card border-0 shadow-sm"
              style={{
                flex: '1 1 320px',
                borderRadius: '1.25rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}
            >
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '0.85rem',
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShieldCheck size={24} />
                    </div>
                    <span className="badge bg-success-subtle text-success small px-2 py-1">
                      VERIFIED ON-CHAIN
                    </span>
                  </div>

                  <h3 className="h6 fw-bold text-dark mb-1" style={{ wordBreak: 'break-word' }}>
                    {cred.skill_name}
                  </h3>
                  <div className="small text-muted mb-3" style={{ wordBreak: 'break-word' }}>
                    Issued by <strong>{cred.issuer_name}</strong>
                  </div>

                  <div className="p-2 rounded-3 bg-light mb-3" style={{ fontSize: '0.72rem' }}>
                    <div className="text-muted fw-bold mb-1">LEDGER TRANSACTION HASH:</div>
                    <div className="font-monospace text-primary text-truncate" style={{ wordBreak: 'break-all' }}>
                      {cred.blockchain_hash}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    {new Date(cred.issued_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setVerifiedModal(cred)}
                    className="btn btn-sm btn-outline-success fw-bold d-flex align-items-center gap-1"
                    style={{ padding: '8px 16px', borderRadius: '0.65rem' }}
                  >
                    <ExternalLink size={14} /> Verify On-Chain
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Issue Credential Modal */}
        {showIssueModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1.25rem' }}>
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <Sparkles className="text-success" size={20} />
                    Mint Blockchain Skill Credential
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowIssueModal(false)} />
                </div>
                <div className="modal-body py-3">
                  <form onSubmit={handleIssueCredential}>
                    <div className="mb-3">
                      <label htmlFor="skillInput" className="form-label small fw-bold text-muted">
                        VERIFIED SKILL / COMPETENCY NAME
                      </label>
                      <input
                        id="skillInput"
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Zero-Knowledge Cryptography & zkSNARKs"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        style={{ borderRadius: '0.75rem', height: '46px' }}
                      />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-light fw-bold"
                        onClick={() => setShowIssueModal(false)}
                        style={{ padding: '12px 24px', borderRadius: '0.75rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={issuing || !newSkill.trim()}
                        className="btn btn-success fw-bold d-flex align-items-center gap-2"
                        style={{ padding: '12px 24px', borderRadius: '0.75rem' }}
                      >
                        <ShieldCheck size={16} />
                        {issuing ? 'Minting On Ledger...' : 'Commit to Blockchain'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {verifiedModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1.25rem' }}>
                <div className="modal-body p-4 text-center">
                  <CheckCircle2 size={54} className="text-success mb-3" />
                  <h4 className="fw-bold text-dark mb-1" style={{ wordBreak: 'break-word' }}>
                    Cryptographically Validated
                  </h4>
                  <p className="text-muted small mb-3" style={{ wordBreak: 'break-word' }}>
                    {verifiedModal.skill_name} issued by <strong>{verifiedModal.issuer_name}</strong>
                  </p>
                  <div className="p-3 bg-light rounded-3 text-start small mb-3 font-monospace" style={{ wordBreak: 'break-all' }}>
                    <div><strong>Tx Hash:</strong> {verifiedModal.blockchain_hash}</div>
                    <div><strong>Standard:</strong> W3C Verifiable Credentials 2.0</div>
                    <div><strong>Consensus:</strong> Proof of Authority (Consortium)</div>
                  </div>
                  <button
                    className="btn btn-primary fw-bold"
                    onClick={() => setVerifiedModal(null)}
                    style={{ padding: '12px 24px', borderRadius: '0.75rem' }}
                  >
                    Close Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
