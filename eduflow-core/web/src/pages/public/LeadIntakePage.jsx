import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getApiBaseURL } from '../../config/apiConfig'
import './LeadIntakePage.css'

const SERVICE_OPTIONS = [
  { id: 'accreditation', label: 'NAAC/NBA Accreditation Report Automation' },
  { id: 'student-success', label: 'Student Dropout Risk Report' },
  { id: 'timetable', label: 'Timetable Generator' },
  { id: 'admissions', label: 'Admission Yield Predictor' },
  { id: 'finance', label: 'Fee Reconciliation' },
  { id: 'hostel', label: 'Hostel Occupancy Optimizer (Coming Soon)' },
  { id: 'placement', label: 'Placement Readiness Report (Coming Soon)' },
]

export default function LeadIntakePage() {
  const [searchParams] = useSearchParams()
  const serviceParam = searchParams.get('service')

  const [formData, setFormData] = useState({
    collegeName: '',
    contactName: '',
    designation: 'Principal',
    email: '',
    phone: '',
    cityState: '',
    studentCount: '',
    naacCycle: 'Cycle 1',
    automationType: serviceParam || 'accreditation',
    message: '',
    website: '', // honeypot
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const errs = {}
    if (!formData.collegeName.trim()) {
      errs.collegeName = 'College Name is required'
    }
    if (!formData.contactName.trim()) {
      errs.contactName = 'Contact Person Name is required'
    }
    if (!formData.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address'
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '')
    if (!cleanPhone) {
      errs.phone = 'Phone number is required'
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number'
    }

    if (!formData.cityState.trim()) {
      errs.cityState = 'City & State is required'
    }

    if (!formData.studentCount) {
      errs.studentCount = 'Number of students is required'
    } else if (Number(formData.studentCount) <= 0) {
      errs.studentCount = 'Must be a positive number'
    }

    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    // Anti-spam honeypot
    if (formData.website) {
      setIsSubmitted(true)
      return
    }

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const baseUrl = getApiBaseURL()
      const url = baseUrl.endsWith('/v1') ? `${baseUrl}/leads` : `${baseUrl}/v1/leads`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeName: formData.collegeName.trim(),
          contactName: formData.contactName.trim(),
          designation: formData.designation,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          cityState: formData.cityState.trim(),
          studentCount: Number(formData.studentCount),
          naacCycle: formData.naacCycle,
          automationType: formData.automationType || 'accreditation',
          message: formData.message.trim(),
          website: formData.website,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed. Please try again.')
      }

      setIsSubmitted(true)
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="lead-intake-shell">
      <div className="lead-intake-container">
        <header className="lead-intake-hero">
          <div className="lead-badge">
            🏛️ Institutional Intelligence Platform
          </div>
          <h1 className="lead-headline">
            Get your NAAC Report in 3 Days, Not 4 Months
          </h1>
          <p className="lead-subheadline">
            AI-powered NAAC Criteria 1–7 report generation. Used by Sri Sudha Institute of Technology.
          </p>
        </header>

        <div className="lead-card">
          {isSubmitted ? (
            <div className="lead-success-card">
              <div className="lead-success-icon">✓</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#166534', marginBottom: '0.75rem' }}>
                Thank you. Our team will contact you within 24 hours.
              </h2>
              <p style={{ color: '#4b5563', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                We have received your institutional inquiry for <strong>{formData.collegeName}</strong>. Our accreditation specialists are reviewing your parameters to prepare your sample pilot analysis.
              </p>
              <button
                type="button"
                className="lead-submit-btn"
                style={{ maxWidth: '240px', margin: '0 auto' }}
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({
                    collegeName: '',
                    contactName: '',
                    designation: 'Principal',
                    email: '',
                    phone: '',
                    cityState: '',
                    studentCount: '',
                    naacCycle: 'Cycle 1',
                    message: '',
                    website: '',
                  })
                }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {serverError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#991b1b',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                }}>
                  {serverError}
                </div>
              )}

              {/* Honeypot field (hidden from real users) */}
              <div style={{ display: 'none' }} aria-hidden="true" className="lead-honeypot hidden">
                <label htmlFor="website">Leave this field blank</label>
                <input
                  id="website"
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex="-1"
                  aria-hidden="true"
                  autoComplete="off"
                />
              </div>

              <div className="lead-form-grid">
                <div className="lead-field-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="lead-label" htmlFor="automationType">
                    Target Automation Service <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    id="automationType"
                    className="lead-input"
                    name="automationType"
                    value={formData.automationType}
                    onChange={handleChange}
                    style={{ fontWeight: 600, color: '#1e40af' }}
                  >
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="small text-muted mt-1">
                    Looking for a different package? <Link to="/services">View all 7 services & pricing</Link>
                  </span>
                </div>

                <div className="lead-field-group">
                  <label className="lead-label" htmlFor="collegeName">
                    College Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="collegeName"
                    className={`lead-input ${errors.collegeName ? 'is-invalid' : ''}`}
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="e.g. Sri Siddhartha Institute of Technology"
                  />
                  {errors.collegeName && <span className="lead-error-text">{errors.collegeName}</span>}
                </div>

                <div className="lead-field-group">
                  <label className="lead-label" htmlFor="contactName">
                    Contact Person Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="contactName"
                    className={`lead-input ${errors.contactName ? 'is-invalid' : ''}`}
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Rajesh Sharma"
                  />
                  {errors.contactName && <span className="lead-error-text">{errors.contactName}</span>}
                </div>

                <div className="lead-field-group">
                  <label className="lead-label" htmlFor="designation">
                    Designation <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    id="designation"
                    className="lead-select"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  >
                    <option value="Principal">Principal</option>
                    <option value="Dean">Dean</option>
                    <option value="IQAC Head">IQAC Head</option>
                    <option value="Registrar">Registrar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="lead-field-group">
                  <label className="lead-label" htmlFor="email">
                    Institutional Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="email"
                    className={`lead-input ${errors.email ? 'is-invalid' : ''}`}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="principal@college.edu.in"
                  />
                  {errors.email && <span className="lead-error-text">{errors.email}</span>}
                </div>

                <div className="lead-field-group">
                  <label className="lead-label" htmlFor="phone">
                    Phone Number (10 digits) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="phone"
                    className={`lead-input ${errors.phone ? 'is-invalid' : ''}`}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phone && <span className="lead-error-text">{errors.phone}</span>}
                </div>

                <div className="lead-field-group">
                  <label className="lead-label" htmlFor="cityState">
                    City & State <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="cityState"
                    className={`lead-input ${errors.cityState ? 'is-invalid' : ''}`}
                    type="text"
                    name="cityState"
                    value={formData.cityState}
                    onChange={handleChange}
                    placeholder="e.g. Hyderabad, Telangana"
                  />
                  {errors.cityState && <span className="lead-error-text">{errors.cityState}</span>}
                </div>

                <div className="lead-field-group">
                  <label className="lead-label" htmlFor="studentCount">
                    Number of Students <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="studentCount"
                    className={`lead-input ${errors.studentCount ? 'is-invalid' : ''}`}
                    type="number"
                    name="studentCount"
                    value={formData.studentCount}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    min="1"
                  />
                  {errors.studentCount && <span className="lead-error-text">{errors.studentCount}</span>}
                </div>

                <div className="lead-field-group">
                  <label className="lead-label" htmlFor="naacCycle">
                    NAAC Cycle <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    id="naacCycle"
                    className="lead-select"
                    name="naacCycle"
                    value={formData.naacCycle}
                    onChange={handleChange}
                  >
                    <option value="Cycle 1">Cycle 1</option>
                    <option value="Cycle 2">Cycle 2</option>
                    <option value="Cycle 3">Cycle 3</option>
                    <option value="Cycle 4">Cycle 4</option>
                    <option value="NBA only">NBA only</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="lead-field-group full-width">
                  <label className="lead-label" htmlFor="message">
                    Message / Special Requirements <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea
                    id="message"
                    className="lead-textarea"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tell us about your upcoming assessment timeline, SSR status, or criteria priorities..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="lead-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Request...' : 'Request Free Pilot Report'}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="lead-footer">
        EduFlow AI OS · Hyderabad, India · privacy@eduflow.app
      </footer>
    </div>
  )
}
