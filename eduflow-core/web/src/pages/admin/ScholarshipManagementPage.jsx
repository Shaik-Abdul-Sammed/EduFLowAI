import { useState, useEffect } from 'react'
import { CheckCircle, FileCheck, Plus, RefreshCw, AlertCircle, Award, Filter } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function ScholarshipManagementPage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [verifyingId, setVerifyingId] = useState(null)
  const [filter, setFilter] = useState('ALL') // ALL, PENDING, VERIFIED
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // New scholarship application form state
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applying, setApplying] = useState(false)
  const [scholarshipName, setScholarshipName] = useState('')
  const [studentRoll, setStudentRoll] = useState('')
  const [studentName, setStudentName] = useState('')
  const [category, setCategory] = useState('Merit')
  const [amount, setAmount] = useState('')
  const [gpa, setGpa] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')

  const fetchScholarships = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/scholarships'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load scholarships (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setScholarships(data?.scholarships || [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading scholarships')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchScholarships(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleVerify = async (id) => {
    setVerifyingId(id)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/v1/scholarships/${id}/verify`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Verification failed')
      }

      const data = await res.json()
      setMsg(data?.message || 'Scholarship verified and fee credit applied!')
      fetchScholarships(true)
      setTimeout(() => setMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed.')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!scholarshipName || !studentRoll || !amount) return
    setApplying(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/scholarships/apply'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          scholarship_name: scholarshipName,
          student_roll: studentRoll,
          student_name: studentName || studentRoll,
          category,
          amount: Number(amount),
          gpa: Number(gpa || 8.5),
          annual_family_income: Number(annualIncome || 200000)
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to submit scholarship grant application')
      }

      setMsg(`Grant application for ${studentRoll} submitted successfully.`)
      setScholarshipName('')
      setStudentRoll('')
      setStudentName('')
      setAmount('')
      setGpa('')
      setAnnualIncome('')
      setShowApplyForm(false)
      fetchScholarships(true)
      setTimeout(() => setMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to apply.')
    } finally {
      setApplying(false)
    }
  }

  const filteredScholarships = scholarships.filter((s) => {
    if (filter === 'PENDING') return s.status !== 'VERIFIED'
    if (filter === 'VERIFIED') return s.status === 'VERIFIED'
    return true
  })

  return (
    <RolePageTemplate role="admin" title="Scholarships & Tuition Waiver Bursary Desk">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }}>
              Scholarship Verification & Auto-Deductions
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Verified grants are automatically credited against upcoming term fee invoices
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              onClick={() => fetchScholarships(true)}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => setShowApplyForm(!showApplyForm)}
            >
              <Plus size={14} /> {showApplyForm ? 'Close Form' : 'Add Grant Application'}
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="scholarship-success-alert">
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

        {/* New Grant Application Form */}
        {showApplyForm && (
          <div className="card border-0 shadow-sm p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Award size={18} className="text-primary" />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Register New Scholarship Application</h3>
            </div>
            <form onSubmit={handleApply} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label htmlFor="scholarship-title" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Scholarship Title *
                </label>
                <input
                  id="scholarship-title"
                  type="text"
                  required
                  className="form-control form-control-sm"
                  placeholder="e.g. Merit-cum-Means Endowment"
                  value={scholarshipName}
                  onChange={(e) => setScholarshipName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="scholarship-roll" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Student Roll *
                </label>
                <input
                  id="scholarship-roll"
                  type="text"
                  required
                  className="form-control form-control-sm"
                  placeholder="e.g. SS25CS10"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="scholarship-student-name" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Student Name
                </label>
                <input
                  id="scholarship-student-name"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Aditya Verma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="scholarship-category" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  id="scholarship-category"
                  className="form-select form-select-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Merit">Merit Academic</option>
                  <option value="Means">Economically Weaker Section (EWS)</option>
                  <option value="Sports">Sports & Athletics</option>
                  <option value="Tuition Waiver">Full / Partial Tuition Waiver</option>
                </select>
              </div>
              <div>
                <label htmlFor="scholarship-amount" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Grant Amount (₹) *
                </label>
                <input
                  id="scholarship-amount"
                  type="number"
                  required
                  min="1000"
                  className="form-control form-control-sm"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="scholarship-gpa" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Current GPA (out of 10)
                </label>
                <input
                  id="scholarship-gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-control form-control-sm"
                  placeholder="e.g. 9.20"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="scholarship-income" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Annual Family Income (₹)
                </label>
                <input
                  id="scholarship-income"
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="e.g. 240000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                />
              </div>
              <div className="d-flex align-items-end">
                <button
                  type="submit"
                  disabled={applying}
                  className="btn btn-primary btn-sm w-100"
                >
                  {applying ? 'Submitting...' : 'Submit Grant Application'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="scholarship-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading scholarship applications and bursary ledger...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load scholarship records</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchScholarships(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loaded Content */}
        {!loading && !loadError && (
          <>
            {/* Filter Tabs */}
            <div className="d-flex align-items-center gap-2">
              <Filter size={15} className="text-muted" />
              <span className="small text-muted me-1">Filter:</span>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('ALL')}
              >
                All ({scholarships.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'PENDING' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('PENDING')}
              >
                Pending ({scholarships.filter((s) => s.status !== 'VERIFIED').length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'VERIFIED' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('VERIFIED')}
              >
                Verified ({scholarships.filter((s) => s.status === 'VERIFIED').length})
              </button>
            </div>

            {filteredScholarships.length === 0 ? (
              <div className="card border-0 shadow-sm p-5 text-center text-muted">
                <Award size={36} className="mx-auto text-secondary mb-2 opacity-50" />
                <h4 style={{ fontSize: 16, fontWeight: 600 }}>No scholarship records found</h4>
                <p className="small mb-0">No bursaries currently match the selected criteria.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
                {filteredScholarships.map((s) => {
                  const isVerified = s.status === 'VERIFIED'
                  return (
                    <div
                      key={s.id}
                      className="card border-0 shadow-sm p-4 d-flex flex-column justify-content-between"
                    >
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: 4 }}>
                            {s.category} Grant
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 4,
                              background: isVerified ? '#DCFCE7' : '#FEF3C7',
                              color: isVerified ? '#15803D' : '#B45309'
                            }}
                          >
                            {s.status}
                          </span>
                        </div>

                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>{s.scholarship_name}</h3>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#16A34A', margin: '6px 0 12px 0' }}>
                          ₹{Number(s.amount).toLocaleString()}
                        </div>

                        <div style={{ background: 'var(--surface-bg, #F8FAFC)', padding: 12, borderRadius: 8, border: '1px solid #EDF2F7', fontSize: 12, color: 'var(--app-text, #334155)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                          <div><strong>Beneficiary:</strong> {s.student_name} (Roll: {s.student_roll})</div>
                          <div><strong>Academic GPA:</strong> {s.gpa} / 10.0</div>
                          <div><strong>Family Annual Income:</strong> ₹{Number(s.annual_family_income || 0).toLocaleString()}</div>
                          {s.invoice_deduction_id && (
                            <div style={{ color: '#2563EB', fontWeight: 600, marginTop: 4 }}>
                              &bull; Auto-Deduction Ref: {s.invoice_deduction_id}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isVerified ? (
                        <button
                          type="button"
                          disabled={verifyingId === s.id}
                          onClick={() => handleVerify(s.id)}
                          className="btn btn-success btn-sm d-flex align-items-center justify-content-center gap-2 mt-2"
                        >
                          <FileCheck size={16} /> {verifyingId === s.id ? 'Verifying & Applying Credit...' : 'Verify & Deduct from Next Fee'}
                        </button>
                      ) : (
                        <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <CheckCircle size={16} /> Verified by {s.verified_by || 'Finance Officer'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
