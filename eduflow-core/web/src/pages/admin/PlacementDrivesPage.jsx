import { useState, useEffect } from 'react'
import { Briefcase } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function PlacementDrivesPage() {
  const [drives, setDrives] = useState([])
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [ctcLpa, setCtcLpa] = useState('')
  const [eligibilityCgpa, setEligibilityCgpa] = useState('7.0')
  const [branches, setBranches] = useState('CSE, ECE, IT')
  const [driveDate, setDriveDate] = useState('2026-12-10')
  const [deadline, setDeadline] = useState('2026-12-01')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchDrives = async () => {
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/placement/drives`)
      if (res.ok) {
        const data = await safeJson(res)
        if (data?.drives) setDrives(data.drives)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  useEffect(() => {
    fetchDrives()
  }, [])

  const handleCreateDrive = async (e) => {
    e.preventDefault()
    if (!companyName || !roleTitle || !ctcLpa) return
    setLoading(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/placement/drives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          role_title: roleTitle,
          ctc_lpa: ctcLpa,
          eligibility_cgpa: eligibilityCgpa,
          eligible_branches: branches.split(',').map((b) => b.trim()),
          drive_date: driveDate,
          registration_deadline: deadline,
          job_description: description
        })
      })
      if (res.ok) {
        setMsg(`Campus drive for ${companyName} posted successfully!`)
        setCompanyName('')
        setRoleTitle('')
        setCtcLpa('')
        setDescription('')
        fetchDrives()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (_err) {
      setMsg('Failed to post drive.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RolePageTemplate role="admin" title="Training & Placement Cell (T&P) Dashboard">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 13, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        {/* 2-Column Section: Create Opening & Active Drives */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Post New Opening Form */}
          <div style={{ background: '#FFFFFF', padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                <Briefcase size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Announce Campus Recruitment Drive</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Eligible students receive instant portal & WhatsApp notifications</p>
              </div>
            </div>

            <form onSubmit={handleCreateDrive} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Recruiting Company</label>
                <input
                  type="text"
                  placeholder="e.g. Microsoft India or Cisco"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Designation / Job Role</label>
                <input
                  type="text"
                  placeholder="e.g. Member Technical Staff (Software)"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>CTC (LPA ₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 18.5"
                    value={ctcLpa}
                    onChange={(e) => setCtcLpa(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    value={eligibilityCgpa}
                    onChange={(e) => setEligibilityCgpa(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Eligible Branches (comma separated)</label>
                <input
                  type="text"
                  value={branches}
                  onChange={(e) => setBranches(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Drive Date</label>
                  <input
                    type="date"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Registration Last Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 4
                }}
              >
                {loading ? 'Posting...' : 'Publish Drive Opening'}
              </button>
            </form>
          </div>

          {/* Active Placement Drives Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Active Campus Drives 2026</h3>
            {drives.map((d) => (
              <div
                key={d.id}
                style={{
                  background: '#FFFFFF',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <h4 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 2px 0', color: '#0F172A' }}>{d.company_name}</h4>
                    <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 600 }}>{d.role_title}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A' }}>₹{d.ctc_lpa} LPA</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                      {d.status}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#64748B', margin: '8px 0 12px 0', lineHeight: 1.4 }}>
                  {d.job_description}
                </div>

                <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 8, fontSize: 11, color: '#475569', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div><strong>Cutoff:</strong> &ge; {d.eligibility_cgpa} CGPA</div>
                  <div><strong>Drive Date:</strong> {d.drive_date}</div>
                  <div><strong>Registered:</strong> {d.applicants_count} Candidates</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
