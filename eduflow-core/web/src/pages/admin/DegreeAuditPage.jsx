import { useState, useEffect } from 'react'
import { GraduationCap, Search, CheckCircle2, AlertCircle, Clock, BookOpen, Award } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function DegreeAuditPage() {
  const [rollInput, setRollInput] = useState('2024-CSE-042')
  const [auditedRoll, setAuditedRoll] = useState('2024-CSE-042')
  const [loading, setLoading] = useState(false)
  const [auditSummary, setAuditSummary] = useState({
    genEd: { required: 40, completed: 36 },
    major: { required: 60, completed: 60 },
    totalCredits: { required: 120, completed: 96 },
    status: 'ON_TRACK',
    studentName: 'Aditya Sharma',
    program: 'B.Tech in Computer Science & Engineering'
  })

  useEffect(() => {
    fetchAudit(auditedRoll)
  }, [auditedRoll])

  async function fetchAudit(roll) {
    if (!roll) return
    setLoading(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/students/${roll}/degree-audit`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data && data.genEd) {
          setAuditSummary(data)
        }
      }
    } catch (_e) {
      // Retain mock fallback
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (!rollInput.trim()) return
    const cleaned = rollInput.trim().toUpperCase()
    setAuditedRoll(cleaned)
  }

  const genEdPct = Math.min(100, Math.round((auditSummary.genEd.completed / auditSummary.genEd.required) * 100))
  const majorPct = Math.min(100, Math.round((auditSummary.major.completed / auditSummary.major.required) * 100))
  const totalPct = Math.min(100, Math.round((auditSummary.totalCredits.completed / auditSummary.totalCredits.required) * 100))

  return (
    <RolePageTemplate role="Admin" title="Degree Audit & Academic Progress" icon={<GraduationCap size={22} />}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 8px' }}>
        {/* Search Bar */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={rollInput}
                onChange={e => setRollInput(e.target.value)}
                placeholder="Enter Student Roll Number (e.g. 2024-CSE-042)"
                aria-label="Student Roll Number for Degree Audit"
                style={{
                  width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
                  border: '1px solid #cbd5e1', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8,
                padding: '9px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              {loading ? 'Evaluating...' : 'Run Degree Audit'}
            </button>
          </form>
        </div>

        {/* Student Profile Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 12, padding: 22, color: '#fff', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{auditSummary.studentName || 'Aditya Sharma'}</h2>
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>
                  {auditedRoll}
                </span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 14, opacity: 0.85 }}>{auditSummary.program || 'B.Tech in Computer Science & Engineering'}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, opacity: 0.8, flexWrap: 'wrap' }}>
                <span>Status: <strong style={{ color: '#86efac' }}>{auditSummary.status === 'ON_TRACK' ? 'On Track for Graduation' : auditSummary.status}</strong></span>
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: 160 }}>
              <span style={{ fontSize: 12, opacity: 0.8 }}>Overall Completion</span>
              <div style={{ fontSize: 28, fontWeight: 800, margin: '2px 0' }}>{totalPct}%</div>
              <span style={{ fontSize: 12, opacity: 0.85 }}>{auditSummary.totalCredits.completed} / {auditSummary.totalCredits.required} Total Credits</span>
            </div>
          </div>
        </div>

        {/* 3 Dedicated Progress Bars for GenEd, Major, and Total Credits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* GenEd Card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>GenEd Progress</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>{auditSummary.genEd.completed} / {auditSummary.genEd.required} cr</span>
            </div>
            <div style={{ background: '#f1f5f9', height: 10, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${genEdPct}%`, height: '100%', background: '#4f46e5', borderRadius: 999, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#64748b', marginTop: 6, display: 'block' }}>{genEdPct}% completed</span>
          </div>

          {/* Major Card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Major Progress</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{auditSummary.major.completed} / {auditSummary.major.required} cr</span>
            </div>
            <div style={{ background: '#f1f5f9', height: 10, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${majorPct}%`, height: '100%', background: '#059669', borderRadius: 999, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#64748b', marginTop: 6, display: 'block' }}>{majorPct}% completed</span>
          </div>

          {/* Total Credits Card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Total Degree Credits</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#d97706' }}>{auditSummary.totalCredits.completed} / {auditSummary.totalCredits.required} cr</span>
            </div>
            <div style={{ background: '#f1f5f9', height: 10, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${totalPct}%`, height: '100%', background: '#d97706', borderRadius: 999, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#64748b', marginTop: 6, display: 'block' }}>{totalPct}% completed</span>
          </div>
        </div>

        {/* Requirements Details Checklist */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} color="#4f46e5" />
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#1e293b' }}>Curriculum Requirement Audit Breakdown</h3>
            </div>
            <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
              {auditSummary.status === 'ON_TRACK' ? 'On Track' : auditSummary.status}
            </span>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Classification</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Required Credits</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Earned Credits</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Remaining</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>General Education Core (GenEd)</td>
                  <td style={{ padding: '10px 14px' }}>{auditSummary.genEd.required}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4f46e5' }}>{auditSummary.genEd.completed}</td>
                  <td style={{ padding: '10px 14px' }}>{Math.max(0, auditSummary.genEd.required - auditSummary.genEd.completed)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: auditSummary.genEd.completed >= auditSummary.genEd.required ? '#16a34a' : '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {auditSummary.genEd.completed >= auditSummary.genEd.required ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {auditSummary.genEd.completed >= auditSummary.genEd.required ? 'Satisfied' : 'Pending 4 Credits'}
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>Departmental Major Core</td>
                  <td style={{ padding: '10px 14px' }}>{auditSummary.major.required}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#059669' }}>{auditSummary.major.completed}</td>
                  <td style={{ padding: '10px 14px' }}>{Math.max(0, auditSummary.major.required - auditSummary.major.completed)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={14} /> Satisfied (100%)
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>Total Degree Threshold</td>
                  <td style={{ padding: '10px 14px' }}>{auditSummary.totalCredits.required}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#d97706' }}>{auditSummary.totalCredits.completed}</td>
                  <td style={{ padding: '10px 14px' }}>{Math.max(0, auditSummary.totalCredits.required - auditSummary.totalCredits.completed)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} /> Final Year In-Progress
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
