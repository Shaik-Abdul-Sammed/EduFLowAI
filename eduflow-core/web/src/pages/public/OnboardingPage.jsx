import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  ShieldCheck,
  Database,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    institutionName: 'Sri Siddhartha Institute of Technology',
    stateCode: 'KA',
    institutionType: 'Autonomous Engineering College',
    departments: ['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering'],
    staffName: 'Priya Sharma',
    staffRole: 'Academic Coordinator',
    officerGranted: 'timetable',
    permissionLevel: 'DRAFT',
    portalSource: 'BIOMETRIC',
  })

  const nextStep = () => {
    if (step < 4) {
      setStep((s) => s + 1)
    } else {
      addToast('Institution setup complete! Welcome to EduFlow AI OS.', 'success')
      navigate('/login')
    }
  }

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  return (
    <div className="min-vh-100 bg-light d-flex flex-column justify-content-between">
      {/* Top Header */}
      <header className="border-bottom bg-white py-3 px-4 shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <span className="fs-4 fw-bold text-primary">EduFlow<span className="text-dark">AI</span></span>
            <span className="badge bg-primary-subtle text-primary">Institution Setup</span>
          </Link>
          <span className="small text-muted">Step {step} of 4</span>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="container py-5 my-auto" style={{ maxWidth: '780px' }}>
        {/* Step Progress Bar */}
        <div className="mb-5">
          <div className="d-flex justify-content-between mb-2 small fw-bold text-muted">
            <span className={step >= 1 ? 'text-primary' : ''}>1. College Profile</span>
            <span className={step >= 2 ? 'text-primary' : ''}>2. Departments &amp; HODs</span>
            <span className={step >= 3 ? 'text-primary' : ''}>3. Staff Delegation</span>
            <span className={step >= 4 ? 'text-primary' : ''}>4. Data Ingestion</span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4 p-md-5">
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 rounded-circle bg-primary-subtle text-primary">
                  <Building2 size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1">Institutional Profile &amp; Location</h4>
                  <p className="text-muted small mb-0">Configures statutory state gazetted holiday rules and academic regulation standards.</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Institution Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">State (for Holiday Synchronization)</label>
                  <select
                    className="form-select"
                    value={formData.stateCode}
                    onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                  >
                    <option value="KA">Karnataka (Bengaluru/Mysuru)</option>
                    <option value="MH">Maharashtra (Mumbai/Pune)</option>
                    <option value="TN">Tamil Nadu (Chennai)</option>
                    <option value="TS">Telangana (Hyderabad)</option>
                    <option value="AP">Andhra Pradesh</option>
                    <option value="DL">Delhi NCR</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Affiliation / Accreditation Model</label>
                  <select
                    className="form-select"
                    value={formData.institutionType}
                    onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                  >
                    <option value="Autonomous Engineering College">Autonomous Engineering College (NAAC/NBA)</option>
                    <option value="Affiliated Engineering College">Affiliated Engineering College (AICTE/State Univ)</option>
                    <option value="State / Central University">State / Central University</option>
                    <option value="Deemed University">Deemed University</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 rounded-circle bg-success-subtle text-success">
                  <Users size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1">Department Structure &amp; HODs</h4>
                  <p className="text-muted small mb-0">HODs receive department-scoped AI insights, at-risk student queues, and staff approval authority.</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Active Academic Departments</label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {formData.departments.map((dept, i) => (
                    <span key={i} className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2">
                      <CheckCircle2 size={14} className="text-success" />
                      {dept}
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Add another department (e.g. Artificial Intelligence & Data Science)..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault()
                      setFormData({ ...formData, departments: [...formData.departments, e.target.value.trim()] })
                      e.target.value = ''
                    }
                  }}
                />
              </div>

              <div className="alert alert-secondary small py-2 mb-0">
                Department HOD accounts will be automatically invited to review timetable drafts and monitor academic pacing.
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 rounded-circle bg-warning-subtle text-warning">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1">Non-Teaching Staff Delegated Access</h4>
                  <p className="text-muted small mb-0">Delegate specific AI officers to staff coordinators without giving them unlimited authority.</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Staff Member Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.staffName}
                    onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Designation</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.staffRole}
                    onChange={(e) => setFormData({ ...formData, staffRole: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Granted Officer</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.officerGranted}
                    onChange={(e) => setFormData({ ...formData, officerGranted: e.target.value })}
                  >
                    <option value="timetable">Timetable Officer (Schedule Preparation)</option>
                    <option value="accreditation">Accreditation Officer (NAAC Criteria Data Entry)</option>
                    <option value="attendance">Attendance Officer (Daily Register Ingestion)</option>
                    <option value="admissions">Admissions Officer (Applicant Verification)</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Delegation Permission Level</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.permissionLevel}
                    onChange={(e) => setFormData({ ...formData, permissionLevel: e.target.value })}
                  >
                    <option value="DRAFT">DRAFT (Can run queries, requires HOD approval)</option>
                    <option value="VIEW_ONLY">VIEW_ONLY (Can only view published results)</option>
                    <option value="FULL">FULL (Full execution authority)</option>
                  </select>
                </div>
              </div>

              <div className="alert alert-warning py-2 small mt-3 mb-0">
                <Lock size={14} className="me-1" /> All actions are audited. Unapproved staff drafts will not affect official college timetables.
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 rounded-circle bg-info-subtle text-info">
                  <Database size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1">Data Ingestion &amp; Campus ERP Connectors</h4>
                  <p className="text-muted small mb-0">Connect existing campus systems to auto-feed student attendance, faculty workloads, and grades.</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Primary Attendance Source</label>
                <div className="row g-2">
                  {[
                    { id: 'BIOMETRIC', label: 'Biometric Devices (ZKTeco / eSSL)' },
                    { id: 'CSV', label: 'Daily CSV / Excel Spreadsheet Upload' },
                    { id: 'ERP', label: 'Direct Database / ERP API (MySQL / Postgres / Fedena)' },
                    { id: 'GOOGLE_SHEETS', label: 'Live Google Sheets' },
                  ].map((src) => (
                    <div key={src.id} className="col-12 col-sm-6">
                      <div
                        className={`p-3 rounded border cursor-pointer ${formData.portalSource === src.id ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'bg-light text-dark'}`}
                        onClick={() => setFormData({ ...formData, portalSource: src.id })}
                      >
                        <CheckCircle2 size={16} className={`me-2 ${formData.portalSource === src.id ? 'text-primary' : 'text-muted'}`} />
                        {src.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="alert alert-success py-2 small mb-0">
                <Sparkles size={14} className="me-1" /> Zero data migration needed. EduFlow normalizes incoming data into canonical schemas automatically.
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
            {step > 1 ? (
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={prevStep}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm px-4" onClick={nextStep}>
              {step === 4 ? 'Launch EduFlow Workspace' : 'Continue'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center py-3 text-muted small border-top bg-white">
        EduFlow AI OS &bull; Institutional Autonomy &bull; Statutory Compliance Assured
      </footer>
    </div>
  )
}
