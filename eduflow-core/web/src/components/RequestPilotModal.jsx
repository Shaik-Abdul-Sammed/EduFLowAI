import { useState, useEffect } from 'react'
import { X, MessageSquare, Mail, Copy, CheckCircle, Sparkles } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { getFullApiUrl } from '../config/apiConfig'

export default function RequestPilotModal({ service, isOpen, onClose }) {
  const { addToast } = useToast()

  const [institutionName, setInstitutionName] = useState('')
  const [contactName, setContactName] = useState('')
  const [designation, setDesignation] = useState('Principal')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cityState, setCityState] = useState('')
  const [studentCount, setStudentCount] = useState('')
  const [preferredTime, setPreferredTime] = useState('Morning')

  const [compiledMessage, setCompiledMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCompiledMessage('')
      setErrors({})
      setCopied(false)
    }
  }, [isOpen, service])

  if (!isOpen || !service) return null

  const serviceName = service.title || 'Pilot Automation'
  const servicePrice = service.price || 'Custom'
  const serviceDescription = service.tagline || ''

  const validate = () => {
    const errs = {}
    if (!institutionName.trim()) errs.institutionName = 'Institution name is required'
    if (!contactName.trim()) errs.contactName = 'Contact person is required'
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email is required'
    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = 'Please enter a valid 10-digit phone number'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleGenerateMessage = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const message = `Hello EduFlow AI team, I am interested in the free pilot for ${serviceName}. Institution: ${institutionName} Contact: ${contactName}, ${designation} City: ${cityState || 'N/A'} Students: ${studentCount || 'N/A'} Preferred contact time: ${preferredTime} Please contact me at ${email} or ${phone} to schedule. Thank you.`
    setCompiledMessage(message)

    // Capture lead in backend CRM
    setSubmitting(true)
    try {
      const payload = {
        serviceId: service.id,
        institutionName,
        contactName,
        designation,
        email,
        phone,
        cityState,
        studentCount: studentCount ? parseInt(studentCount, 10) : null,
        preferredTime,
        message,
      }
      const res = await fetch(getFullApiUrl('/v1/leads/from-service'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        // Fallback to /v1/leads if /from-service is unavailable
        await fetch(getFullApiUrl('/v1/leads'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collegeName: institutionName,
            contactName,
            designation,
            email,
            phone,
            cityState,
            studentCount: studentCount ? parseInt(studentCount, 10) : null,
            message,
            automationType: service.id,
          }),
        })
      }
      addToast?.('Lead captured! Choose your preferred messaging channel below.', 'success')
    } catch (err) {
      console.warn('CRM lead capture failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(compiledMessage)
    window.open(`https://wa.me/919010150809?text=${encoded}`, '_blank')
  }

  const handleSendEmail = () => {
    const encodedSubject = encodeURIComponent(`Free Pilot Request - ${serviceName}`)
    const encodedBody = encodeURIComponent(compiledMessage)
    window.location.href = `mailto:hello@eduflow.ai?subject=${encodedSubject}&body=${encodedBody}`
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(compiledMessage)
      setCopied(true)
      addToast?.('Message copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      addToast?.('Failed to copy to clipboard', 'error')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--card-bg, #ffffff)',
          color: 'var(--app-text, #1e293b)',
          border: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        {/* Modal Header */}
        <div
          className="d-flex align-items-center justify-content-between p-4 border-bottom"
          style={{ borderColor: 'var(--border-color, #e2e8f0)' }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge rounded-pill bg-primary-subtle text-primary fw-semibold px-3 py-1">
                <Sparkles size={12} className="me-1 d-inline" /> Turnkey Pilot
              </span>
              <span className="small text-muted">{servicePrice} package</span>
            </div>
            <h2 className="h4 fw-bold mb-0" style={{ color: 'var(--app-text, #0f172a)' }}>
              Request a Free Pilot
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {serviceDescription && (
            <div
              className="p-3 rounded-3 mb-4 small"
              style={{
                background: 'var(--surface-bg, #f8fafc)',
                border: '1px solid var(--border-color, #f1f5f9)',
                color: 'var(--app-text-muted, #64748b)',
              }}
            >
              <strong>Deliverable:</strong> {serviceDescription}
            </div>
          )}

          <form onSubmit={handleGenerateMessage}>
            <div className="form-group mb-3">
              <label className="form-label">Service (Auto-filled)</label>
              <input
                type="text"
                className="form-control"
                value={serviceName}
                disabled
                readOnly
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6 form-group">
                <label className="form-label">
                  Institution Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.institutionName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Sri Siddhartha Institute of Tech"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                />
                {errors.institutionName && (
                  <div className="invalid-feedback">{errors.institutionName}</div>
                )}
              </div>

              <div className="col-12 col-md-6 form-group">
                <label className="form-label">
                  Contact Person <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.contactName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Dr. K. Ramesh"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                {errors.contactName && (
                  <div className="invalid-feedback">{errors.contactName}</div>
                )}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6 form-group">
                <label className="form-label">Designation</label>
                <select
                  className="form-select"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                >
                  <option value="Principal">Principal</option>
                  <option value="Dean">Dean</option>
                  <option value="IQAC Head">IQAC Head</option>
                  <option value="Registrar">Registrar</option>
                  <option value="HOD">HOD</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-12 col-md-6 form-group">
                <label className="form-label">
                  Institutional Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="dean@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6 form-group">
                <label className="form-label">
                  Phone (10 digits) <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="col-12 col-md-6 form-group">
                <label className="form-label">City & State</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Hyderabad, Telangana"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6 form-group">
                <label className="form-label">Number of Students</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 2500"
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6 form-group">
                <label className="form-label">Preferred Contact Time</label>
                <select
                  className="form-select"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Anytime">Anytime</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-100 rounded-pill py-2 fw-semibold mb-4"
            >
              {submitting ? 'Generating Message...' : 'Generate Message'}
            </button>
          </form>

          {/* Compiled Message & Action Buttons */}
          {compiledMessage && (
            <div
              className="p-3 rounded-4 mt-2"
              style={{
                background: 'var(--surface-bg, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
              }}
            >
              <label className="form-label fw-bold mb-2">WhatsApp-Ready Formatted Text</label>
              <textarea
                aria-label="Formatted WhatsApp message"
                className="form-control mb-3"
                rows={5}
                value={compiledMessage}
                onChange={(e) => setCompiledMessage(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              />

              <div className="d-flex flex-column flex-sm-row gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="btn btn-success flex-grow-1 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#ffffff' }}
                >
                  <MessageSquare size={16} /> Send via WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="btn btn-outline-primary flex-grow-1 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  <Mail size={16} /> Send via Email
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1"
                >
                  {copied ? <CheckCircle size={16} className="text-success" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-muted small mb-0 text-center" style={{ fontSize: '0.8rem' }}>
                Your requirement will be sent as a pre-filled message. You can edit it before sending.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
