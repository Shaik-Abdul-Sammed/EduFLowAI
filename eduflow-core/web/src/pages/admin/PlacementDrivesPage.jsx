import { useState, useEffect } from 'react'
import { Briefcase, CheckCircle, AlertCircle, RefreshCw, Calendar, Users, Award } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function PlacementDrivesPage() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [applyingId, setApplyingId] = useState(null)

  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [ctcLpa, setCtcLpa] = useState('')
  const [eligibilityCgpa, setEligibilityCgpa] = useState('7.0')
  const [branches, setBranches] = useState('CSE, ECE, IT')
  const [driveDate, setDriveDate] = useState('2026-12-10')
  const [deadline, setDeadline] = useState('2026-12-01')
  const [description, setDescription] = useState('')

  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchDrives = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/placement/drives'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load placement drives (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setDrives(data?.drives || [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading placement drives')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchDrives(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleCreateDrive = async (e) => {
    e.preventDefault()
    if (!companyName || !roleTitle || !ctcLpa) return
    setSubmitting(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/placement/drives'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          company_name: companyName,
          role_title: roleTitle,
          ctc_lpa: Number(ctcLpa),
          eligibility_cgpa: Number(eligibilityCgpa),
          eligible_branches: branches.split(',').map((b) => b.trim()),
          drive_date: driveDate,
          registration_deadline: deadline,
          job_description: description
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to post placement drive')
      }

      setMsg(`Campus drive for ${companyName} posted successfully!`)
      setCompanyName('')
      setRoleTitle('')
      setCtcLpa('')
      setDescription('')
      fetchDrives(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post drive.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApplyDrive = async (id, company) => {
    setApplyingId(id)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/v1/placement/drives/${id}/apply`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ student_roll: 'SS26' })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to apply for drive')
      }

      const data = await res.json()
      setMsg(data?.message || `Application submitted for ${company}!`)
      fetchDrives(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register.')
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <RolePageTemplate role="admin" title="Training & Placement Cell (T&P) Dashboard">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }}>
              Corporate Recruitment & Internship Drives
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Publish recruitment openings, manage eligibility cutoffs, and monitor student candidate pipeline
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => fetchDrives(true)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Success Alert */}
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="placement-success-alert">
            <CheckCircle size={18} className="me-2 flex-shrink-0" />
            <div className="small fw-semibold">{msg}</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0">
            <AlertCircle size={18} className="me-2 flex-shrink-0" />
            <div className="small fw-semibold">{errorMsg}</div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="placement-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading corporate placement drives and campus schedules...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load placement drives</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchDrives(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loaded 2-Column Content */}
        {!loading && !loadError && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            {/* Post New Opening Form */}
            <div className="card border-0 shadow-sm p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Announce Campus Recruitment Drive</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Eligible students receive instant portal & WhatsApp notifications</p>
                </div>
              </div>

              <form onSubmit={handleCreateDrive} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label htmlFor="company-name" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Recruiting Company *
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    placeholder="e.g. Microsoft India or Cisco"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="form-control form-control-sm"
                  />
                </div>

                <div>
                  <label htmlFor="role-title" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Designation / Job Role *
                  </label>
                  <input
                    id="role-title"
                    type="text"
                    placeholder="e.g. Member Technical Staff (Software)"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    required
                    className="form-control form-control-sm"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label htmlFor="ctc-lpa" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      CTC (LPA ₹) *
                    </label>
                    <input
                      id="ctc-lpa"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 18.5"
                      value={ctcLpa}
                      onChange={(e) => setCtcLpa(e.target.value)}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="cgpa-cutoff" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      CGPA Cutoff
                    </label>
                    <input
                      id="cgpa-cutoff"
                      type="number"
                      step="0.1"
                      value={eligibilityCgpa}
                      onChange={(e) => setEligibilityCgpa(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="eligible-branches" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Eligible Branches (comma separated)
                  </label>
                  <input
                    id="eligible-branches"
                    type="text"
                    value={branches}
                    onChange={(e) => setBranches(e.target.value)}
                    className="form-control form-control-sm"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label htmlFor="drive-date" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Drive Date
                    </label>
                    <input
                      id="drive-date"
                      type="date"
                      value={driveDate}
                      onChange={(e) => setDriveDate(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="deadline-date" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Registration Last Date
                    </label>
                    <input
                      id="deadline-date"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="job-description" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Job Description & Criteria
                  </label>
                  <textarea
                    id="job-description"
                    rows="3"
                    className="form-control form-control-sm"
                    placeholder="e.g. Roles in cloud distributed systems, Linux internals, algorithmic problem solving."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm mt-2"
                >
                  {submitting ? 'Publishing...' : 'Publish Drive Opening'}
                </button>
              </form>
            </div>

            {/* Active Placement Drives Overview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="d-flex justify-content-between align-items-center">
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Campus Drives 2026</h3>
                <span className="badge bg-primary">{drives.length} Drives Open</span>
              </div>

              {drives.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center text-muted">
                  <Briefcase size={36} className="mx-auto text-secondary mb-2 opacity-50" />
                  <h4 style={{ fontSize: 16, fontWeight: 600 }}>No campus drives scheduled</h4>
                  <p className="small mb-0">Announce a new drive to start accepting student applications.</p>
                </div>
              ) : (
                drives.map((d) => (
                  <div
                    key={d.id}
                    className="card border-0 shadow-sm p-4"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <h4 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 2px 0' }}>{d.company_name}</h4>
                        <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 600 }}>{d.role_title}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A' }}>₹{d.ctc_lpa} LPA</div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                          {d.status || 'ACTIVE'}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: '#64748B', margin: '8px 0 12px 0', lineHeight: 1.4 }}>
                      {d.job_description || 'Standard on-campus recruitment drive.'}
                    </div>

                    <div style={{ background: 'var(--surface-bg, #F8FAFC)', padding: 10, borderRadius: 8, fontSize: 11, color: '#475569', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      <div><strong>Cutoff:</strong> &ge; {d.eligibility_cgpa} CGPA</div>
                      <div><strong>Drive Date:</strong> {d.drive_date}</div>
                      <div><strong>Registered:</strong> {d.applicants_count || 0} Candidates</div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        disabled={applyingId === d.id}
                        onClick={() => handleApplyDrive(d.id, d.company_name)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        {applyingId === d.id ? 'Registering...' : 'Register Test Candidate'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
