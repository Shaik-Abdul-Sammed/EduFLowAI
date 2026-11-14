import { useState, useEffect } from 'react'
import { ShoppingBag, TrendingDown, Mail, Copy, Check, Sparkles, Building, AlertCircle } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function ProcurementPage() {
  const [itemName, setItemName] = useState('Lab PCs')
  const [vendorName, setVendorName] = useState('TechPro Solutions Pvt Ltd')
  const [quantity, setQuantity] = useState('50')
  const [vendorQuote, setVendorQuote] = useState('700000')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${getApiBaseURL()}/v1/procurement/history`)
        if (res.ok) {
          const data = await safeJson(res)
          if (data?.history) {
            setHistoryList(data.history)
          }
        }
      } catch (err) {
        console.debug(err)
      }
    }
    fetchHistory()
  }, [])

  const handleAnalyzeQuote = async (e) => {
    e?.preventDefault()
    if (!itemName.trim() || !vendorQuote) {
      setErrorMsg('Please enter both the item name and the quoted price.')
      return
    }

    setErrorMsg('')
    setAnalyzing(true)

    try {
      const res = await fetch(`${getApiBaseURL()}/v1/procurement/analyze-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          vendorName: vendorName.trim(),
          quantity: Number(quantity) || 1,
          vendorQuote: Number(vendorQuote)
        })
      })

      if (res.ok) {
        const data = await safeJson(res)
        setAnalysisResult(data)
      } else {
        const errData = await safeJson(res)
        setErrorMsg(errData?.error || 'Failed to analyze quote.')
      }
    } catch (err) {
      setErrorMsg('Network error while analyzing quote with AI.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCopyEmail = () => {
    if (!analysisResult?.emailDraft) return
    navigator.clipboard?.writeText(analysisResult.emailDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <RolePageTemplate role="admin" title="AI Procurement & Vendor Negotiator Engine">
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        
        {/* Header Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 16,
          padding: 24,
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38BDF8', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <Sparkles size={16} /> Autonomous Procurement Intelligence
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>AI Vendor Price Negotiator</h1>
            <p style={{ margin: '6px 0 0 0', color: '#94A3B8', fontSize: 13 }}>
              Cross-references incoming vendor quotations against historical procurement records and synthesizes high-leverage counter-proposals.
            </p>
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38BDF8', padding: '10px 16px', borderRadius: 10, textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Audit Compliance</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#38BDF8' }}>Tier-1 University Standard</div>
          </div>
        </div>

        {errorMsg && (
          <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <AlertCircle size={18} />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Input Form & Analysis Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          {/* Quote Analysis Input Form */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={18} color="#2563EB" /> Enter Commercial Quotation
            </h2>

            <form onSubmit={handleAnalyzeQuote} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Item / Asset Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Lab PCs, Campus Wi-Fi APs"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Vendor / Supplier Name
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. TechPro Solutions"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Quoted Total (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={vendorQuote}
                    onChange={(e) => setVendorQuote(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={analyzing}
                style={{
                  marginTop: 8,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {analyzing ? (
                  <>Analyzing Price Delta...</>
                ) : (
                  <>
                    <Sparkles size={16} /> Analyze Quote with AI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Analysis & Leverage Card */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingDown size={18} color="#16A34A" /> Pricing Intelligence & Target
            </h2>

            {analysisResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Historical Price</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                      ₹{analysisResult.historicalRecord?.amount?.toLocaleString('en-IN') || '—'}
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8' }}>
                      ₹{analysisResult.historicalRecord?.unitPrice?.toLocaleString('en-IN') || '—'}/unit
                    </div>
                  </div>

                  <div style={{ background: '#FEF2F2', padding: 12, borderRadius: 10, border: '1px solid #FCA5A5' }}>
                    <div style={{ fontSize: 11, color: '#991B1B' }}>Markup Detected</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                      +{analysisResult.analysis?.percentageIncrease}%
                    </div>
                    <div style={{ fontSize: 10, color: '#991B1B' }}>
                      ₹{analysisResult.currentUnitCost?.toLocaleString('en-IN')}/unit
                    </div>
                  </div>

                  <div style={{ background: '#F0FDF4', padding: 12, borderRadius: 10, border: '1px solid #86EFAC' }}>
                    <div style={{ fontSize: 11, color: '#166534' }}>Recommended Target</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#16A34A', marginTop: 2 }}>
                      ₹{analysisResult.analysis?.suggestedTargetPrice?.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: 10, color: '#15803D' }}>
                      ₹{analysisResult.analysis?.suggestedUnitTarget?.toLocaleString('en-IN')}/unit
                    </div>
                  </div>
                </div>

                <div style={{ background: '#EFF6FF', padding: 12, borderRadius: 10, border: '1px solid #BFDBFE', fontSize: 12, color: '#1E40AF' }}>
                  <strong>Negotiation Strategy:</strong> {analysisResult.historicalComparison}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 32, color: '#94A3B8', textAlign: 'center' }}>
                <Building size={36} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div style={{ fontSize: 13 }}>Submit a vendor quote to view historical price benchmarks and targeted counter-offers.</div>
              </div>
            )}
          </div>
        </div>

        {/* AI Negotiation Email Draft Section */}
        {analysisResult?.emailDraft && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={18} color="#2563EB" /> AI-Generated Vendor Negotiation Draft
              </h2>
              <button
                type="button"
                onClick={handleCopyEmail}
                style={{
                  background: copied ? '#DCFCE7' : '#F1F5F9',
                  color: copied ? '#16A34A' : '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard' : 'Copy Email Draft'}
              </button>
            </div>

            <textarea
              readOnly
              rows={12}
              value={analysisResult.emailDraft}
              data-testid="negotiation-email-draft"
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                fontFamily: 'monospace',
                lineHeight: 1.6,
                background: '#F8FAFC',
                color: '#1E293B',
                resize: 'vertical'
              }}
            />
          </div>
        )}

        {/* Historical Procurement Ledger Table (Strict Zero Overflow Guarantee) */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A' }}>
            Historical Institutional Procurement Ledger
          </h2>

          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#475569' }}>Item Name</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#475569' }}>Vendor</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#475569' }}>Qty</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#475569' }}>Past Amount (₹)</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#475569' }}>Unit Cost (₹)</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#475569' }}>Cycle</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{row.itemName}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#64748B' }}>{row.vendorName}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#475569' }}>{row.quantity}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                      ₹{row.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#64748B' }}>
                      ₹{row.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#94A3B8' }}>{row.year}</td>
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
