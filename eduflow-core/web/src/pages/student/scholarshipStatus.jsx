import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function Page() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [form, setForm] = useState({
    scheme: 'Pragati Merit Scholarship for Women in STEM',
    category: 'Merit',
    amount: 50000,
    gpa: 9.4,
    familyIncome: 250000
  })

  const fetchScholarships = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/scholarships'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load scholarship records (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const raw = Array.isArray(data?.scholarships) ? data.scholarships : []
        setScholarships(raw)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching scholarship status')
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

  async function handleApply(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/scholarships/apply'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_roll: 'SS26',
          student_name: 'Ananya Sharma',
          scholarship_name: form.scheme,
          category: form.category,
          amount: Number(form.amount) || 50000,
          gpa: Number(form.gpa) || 9.4,
          annual_family_income: Number(form.familyIncome) || 250000
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Scholarship application failed')

      setSuccessToast(`Application for "${form.scheme}" submitted successfully for verification!`)
      setTimeout(() => setSuccessToast(''), 4500)
      setShowApplyModal(false)
      await fetchScholarships(true)
    } catch (err) {
      setSuccessToast(err.message || 'Application submission error')
    } finally {
      setSubmitting(false)
    }
  }

  const primaryScholarship = scholarships[0] || {
    scholarship_name: 'Pragati Merit Scholarship for Women in STEM',
    amount: 50000,
    status: 'VERIFIED',
    gpa: 9.4,
    created_at: '2026-08-01'
  }

  const isVerified = (primaryScholarship.status || '').toUpperCase() === 'VERIFIED'
  const stages = [
    { label: 'Application Submitted', done: true, date: 'Aug 01, 2026' },
    { label: 'Documents & CGPA Verified', done: true, date: 'Aug 10, 2026' },
    { label: 'Dean / Bursary Approval', done: isVerified, date: isVerified ? 'Aug 18, 2026' : null },
    { label: 'Tuition Credit Disbursed', done: isVerified, date: isVerified ? 'Aug 25, 2026' : null },
  ]
  const currentStageIdx = stages.filter(s => s.done).length - 1

  return (
    <RolePageTemplate role="Student" title="Scholarship Status & Grants" description="Track your scholarship eligibility, approval stages, and tuition concession disbursement.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Success toast */}
        {successToast && (
          <div data-testid="scholarship-toast" className="alert alert-success py-2 px-3 small mb-0 shadow-sm" role="alert">
            ✅ {successToast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="scholarship-status-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="scholarship-status-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Load Scholarship Portal</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchScholarships(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Card */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ height: 4, background: 'linear-gradient(90deg, #10B981, #06B6D4)' }} />
              <div className="card-body p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                      Primary Active Scholarship Grant
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--svc-navy)' }}>
                      {primaryScholarship.scholarship_name}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ padding: '0.25rem 0.875rem', borderRadius: '2rem', background: '#10B98115', color: '#10B981', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        ✅ {primaryScholarship.status || 'VERIFIED'}
                      </span>
                      <span className="badge text-bg-light border">
                        {primaryScholarship.category || 'Academic Merit'}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', lineHeight: 1 }}>
                      ₹{Number(primaryScholarship.amount || 50000).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                      Tuition Credit Value
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      data-testid="open-apply-modal-btn"
                      onClick={() => setShowApplyModal(true)}
                    >
                      + Apply Additional Grant
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.5rem' }}>📋 Approval &amp; Concession Progress</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 18, left: '10%', right: '10%', height: 3, background: '#e2e8f0', zIndex: 0 }}>
                  <div style={{ height: '100%', width: `${(currentStageIdx / (stages.length - 1)) * 100}%`, background: 'linear-gradient(90deg, #10B981, #06B6D4)', transition: 'width 0.5s ease' }} />
                </div>
                {stages.map((s, i) => (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', zIndex: 1, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: s.done ? 'linear-gradient(135deg, #10B981, #06B6D4)' : '#e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: s.done ? 'white' : '#94a3b8', fontSize: '0.85rem', fontWeight: 700,
                    }}>
                      {s.done ? '✓' : i + 1}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: s.done ? '#10B981' : '#94a3b8' }}>{s.label}</div>
                      {s.date && <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{s.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', borderLeft: '4px solid #10B981' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-bold mb-0">Apply for Student Bursary / Fee Waiver</h3>
                  <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)} />
                </div>
                <form onSubmit={handleApply} data-testid="apply-scholarship-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>SCHEME TITLE</label>
                    <input required className="form-control form-control-sm" value={form.scheme} onChange={e => setForm(p => ({...p, scheme: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>CATEGORY</label>
                    <select className="form-select form-select-sm" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                      <option>Merit</option>
                      <option>Means / EWS</option>
                      <option>State Freeship</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>REQUESTED GRANT (INR)</label>
                    <input required type="number" min="1000" className="form-control form-control-sm" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>CUMULATIVE GPA</label>
                    <input required type="number" step="0.01" className="form-control form-control-sm" value={form.gpa} onChange={e => setForm(p => ({...p, gpa: e.target.value}))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" disabled={submitting} data-testid="submit-apply-btn" className="btn btn-sm btn-primary">
                      {submitting ? 'Submitting Application…' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
