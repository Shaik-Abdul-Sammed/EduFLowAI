import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function FacultyAppraisalPage() {
  const [appraisals, setAppraisals] = useState([])
  const [facultyName, setFacultyName] = useState('Dr. Ramesh Kumar')
  const [department, setDepartment] = useState('Computer Science')
  const [teachingScore, setTeachingScore] = useState(90)
  const [researchScore, setResearchScore] = useState(85)
  const [adminScore, setAdminScore] = useState(80)
  const [remarks, setRemarks] = useState('')
  const [msg, setMsg] = useState('')

  const fetchAppraisals = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/faculty/appraisals`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.appraisals) setAppraisals(data.appraisals)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  useEffect(() => {
    fetchAppraisals()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/faculty/appraisals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_name: facultyName,
          department,
          academic_year: '2026-2027',
          teaching_score: teachingScore,
          research_score: researchScore,
          admin_score: adminScore,
          remarks
        })
      })
      if (res.ok) {
        setMsg(`Annual performance appraisal for ${facultyName} recorded.`)
        setRemarks('')
        fetchAppraisals()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (_err) {
      setMsg('Failed to record appraisal.')
    }
  }

  // Live computed composite score: 40% Teaching + 40% Research + 20% Admin
  const liveComposite = Math.round((Number(teachingScore) * 0.4 + Number(researchScore) * 0.4 + Number(adminScore) * 0.2) * 100) / 100

  return (
    <RolePageTemplate role="hod" title="Faculty Performance Appraisal & CAS Score Desk">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 13, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Appraisal Rating Form */}
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                <Star size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Conduct Annual Performance Review</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>UGC Career Advancement Scheme (CAS) 360-degree index</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Faculty Member</label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Academic Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}>
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Physics">Physics & Applied Sciences</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              {/* Sliders for Teaching, Research, Admin */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  <span>Teaching & Pedagogy (Weight: 40%)</span>
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>{teachingScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={teachingScore}
                  onChange={(e) => setTeachingScore(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  <span>Research & Publications (Weight: 40%)</span>
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>{researchScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={researchScore}
                  onChange={(e) => setResearchScore(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  <span>Institutional Administration & Service (Weight: 20%)</span>
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>{adminScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adminScore}
                  onChange={(e) => setAdminScore(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Computed Composite Badge */}
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Composite Score</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{liveComposite} / 100</div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: liveComposite >= 90 ? '#DCFCE7' : liveComposite >= 80 ? '#EFF6FF' : '#FEF3C7',
                    color: liveComposite >= 90 ? '#15803D' : liveComposite >= 80 ? '#1D4ED8' : '#B45309'
                  }}
                >
                  {liveComposite >= 90 ? 'Outstanding' : liveComposite >= 80 ? 'Exceeds Expectations' : 'Meets Expectations'}
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Confidential Appraisal Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Guided 2 funded AI research grants and organized national workshop..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginTop: 4
                }}
              >
                Submit Performance Rating
              </button>
            </form>
          </div>

          {/* Appraisal Records History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Evaluated Faculty Records (AY 2026-27)</h3>
            {appraisals.map((a) => (
              <div key={a.id} style={{ background: '#FFFFFF', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px 0', color: '#0F172A' }}>{a.faculty_name}</h4>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{a.department} &bull; {a.academic_year}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '3px 8px', borderRadius: 6 }}>
                    {a.performance_band}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
                  <div style={{ flex: 1, padding: 8, background: '#F8FAFC', borderRadius: 6, textAlign: 'center', fontSize: 11 }}>
                    <div style={{ color: '#64748B' }}>Teaching</div>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{a.teaching_score}</div>
                  </div>
                  <div style={{ flex: 1, padding: 8, background: '#F8FAFC', borderRadius: 6, textAlign: 'center', fontSize: 11 }}>
                    <div style={{ color: '#64748B' }}>Research</div>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{a.research_score}</div>
                  </div>
                  <div style={{ flex: 1, padding: 8, background: '#F8FAFC', borderRadius: 6, textAlign: 'center', fontSize: 11 }}>
                    <div style={{ color: '#64748B' }}>Admin</div>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{a.admin_score}</div>
                  </div>
                  <div style={{ flex: 1, padding: 8, background: '#EFF6FF', borderRadius: 6, textAlign: 'center', fontSize: 11 }}>
                    <div style={{ color: '#2563EB', fontWeight: 600 }}>Total</div>
                    <div style={{ fontWeight: 800, color: '#1D4ED8', marginTop: 2 }}>{a.total_score}</div>
                  </div>
                </div>

                {a.remarks && <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>"{a.remarks}"</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
