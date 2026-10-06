import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  GraduationCap,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Download,
  AlertCircle
} from 'lucide-react'

export default function OnboardingWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Step 1: Profile
  const [profile, setProfile] = useState({
    name: 'Sri Siddhartha Institute of Technology',
    shortCode: 'SSIT',
    subdomain: 'ssit',
    address: 'Maralur, Tumakuru',
    city: 'Tumakuru',
    state: 'Karnataka',
    pincode: '572105',
    phone: '+91 816 220 1073',
    email: 'principal@ssit.edu.in',
    website: 'https://ssit.edu.in',
    establishedYear: '1979',
    affiliationBody: 'VTU Belagavi',
    accreditationStatus: 'NAAC A+ Accredited',
    logoUrl: '/logo.png'
  })

  // Step 2: Departments
  const [departments, setDepartments] = useState([
    { name: 'Computer Science & Engineering', code: 'CSE' },
    { name: 'Electronics & Communication Engineering', code: 'ECE' },
    { name: 'Mechanical Engineering', code: 'MECH' },
    { name: 'Electrical & Electronics Engineering', code: 'EEE' },
    { name: 'Civil Engineering', code: 'CIVIL' },
    { name: 'Information Science & Engineering', code: 'ISE' },
    { name: 'Artificial Intelligence & Data Science', code: 'AI-DS' },
    { name: 'Master of Business Administration', code: 'MBA' }
  ])
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptCode, setNewDeptCode] = useState('')

  // Step 3: Faculty
  const [facultyOption, setFacultyOption] = useState('demo')
  const [facultyCount, setFacultyCount] = useState(48)

  // Step 4: Students
  const [studentOption, setStudentOption] = useState('demo')
  const [studentCount, setStudentCount] = useState(1250)

  // Step 5: Academic
  const [academic, setAcademic] = useState({
    academicYear: '2026-2027',
    startMonth: 'July',
    stateCode: 'KA',
    semesterType: 'ODD',
    workingDaysPerWeek: 6
  })

  const addDepartment = () => {
    if (!newDeptName || !newDeptCode) return
    setDepartments([...departments, { name: newDeptName, code: newDeptCode.toUpperCase() }])
    setNewDeptName('')
    setNewDeptCode('')
  }

  const removeDepartment = (index) => {
    setDepartments(departments.filter((_, i) => i !== index))
  }

  const handleNext = async () => {
    setError('')
    setLoading(true)

    try {
      if (step === 1) {
        const res = await fetch('/api/v1/onboarding/step1-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        })
        if (!res.ok) throw new Error('Failed to save profile')
      } else if (step === 2) {
        const res = await fetch('/api/v1/onboarding/step2-departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ departments })
        })
        if (!res.ok) throw new Error('Failed to save departments')
      } else if (step === 3) {
        const res = await fetch('/api/v1/onboarding/step3-faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ faculty: [{ employee_id: 'EMP101', full_name: 'Dr. Ramesh Kumar', email: 'ramesh@ssit.edu.in', department_code: 'CSE' }] })
        })
        if (!res.ok) throw new Error('Failed to stage faculty')
      } else if (step === 4) {
        const res = await fetch('/api/v1/onboarding/step4-students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: [{ roll_number: 'STU202601', full_name: 'Aarav Patel', email: 'aarav@student.edu', department_code: 'CSE' }] })
        })
        if (!res.ok) throw new Error('Failed to stage students')
      } else if (step === 5) {
        const res = await fetch('/api/v1/onboarding/step5-academic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(academic)
        })
        if (!res.ok) throw new Error('Failed to save academic parameters')
      }

      setStep(prev => prev + 1)
    } catch (err) {
      setError(err.message || 'Error advancing step')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/onboarding/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId: 1 })
      })
      if (!res.ok) throw new Error('Failed to finalize onboarding')
      setSuccessMsg('Onboarding Completed Successfully! Redirecting to Dashboard...')
      setTimeout(() => {
        navigate('/admin-dashboard')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error completing onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">Institution Onboarding Wizard</h2>
        <p className="text-muted">Set up your college profile, rosters, and 2026 academic calendar in 6 simple steps.</p>
      </div>

      {/* Stepper Progress */}
      <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
        <div className="d-flex justify-content-between align-items-center">
          {[
            { num: 1, label: 'Profile' },
            { num: 2, label: 'Departments' },
            { num: 3, label: 'Faculty' },
            { num: 4, label: 'Students' },
            { num: 5, label: 'Academic Year' },
            { num: 6, label: 'Review' }
          ].map((s) => (
            <div key={s.num} className="d-flex flex-column align-items-center flex-fill position-relative">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mb-1 ${
                  step === s.num ? 'bg-primary' : step > s.num ? 'bg-success' : 'bg-secondary'
                }`}
                style={{ width: '36px', height: '36px' }}
              >
                {step > s.num ? <CheckCircle size={18} /> : s.num}
              </div>
              <small className={`fw-semibold ${step === s.num ? 'text-primary' : 'text-muted'}`}>{s.label}</small>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-3">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center mb-3">
          <CheckCircle size={18} className="me-2" />
          {successMsg}
        </div>
      )}

      {/* Main Form Content */}
      <div className="card shadow-sm border-0 p-4 bg-white mb-4">
        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <Building2 className="me-2 text-primary" /> Step 1 — Institution Profile
            </h4>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label fw-semibold">Institution Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Short Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.shortCode}
                  onChange={(e) => setProfile({ ...profile, shortCode: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Portal Subdomain</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={profile.subdomain}
                    onChange={(e) => setProfile({ ...profile, subdomain: e.target.value })}
                  />
                  <span className="input-group-text">.eduflow.ai</span>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Established Year</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.establishedYear}
                  onChange={(e) => setProfile({ ...profile, establishedYear: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Affiliation Body (e.g. VTU, JNTU, AICTE)</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.affiliationBody}
                  onChange={(e) => setProfile({ ...profile, affiliationBody: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Accreditation Status</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.accreditationStatus}
                  onChange={(e) => setProfile({ ...profile, accreditationStatus: e.target.value })}
                />
              </div>
              <div className="col-md-8">
                <label className="form-label fw-semibold">Official Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Pincode</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <Building2 className="me-2 text-primary" /> Step 2 — Academic Departments
            </h4>
            <p className="text-muted">Define academic departments offering undergraduate and postgraduate programs.</p>

            <div className="row g-2 mb-3">
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Department Name (e.g. Biotechnology)"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Code (e.g. BT)"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button type="button" className="btn btn-outline-primary w-100" onClick={addDepartment}>
                  + Add
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Department Name</th>
                    <th>Code</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{d.name}</td>
                      <td><span className="badge bg-secondary">{d.code}</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link text-danger p-0"
                          onClick={() => removeDepartment(idx)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <Users className="me-2 text-primary" /> Step 3 — Faculty Roster Import
            </h4>
            <div className="row g-3">
              <div className="col-md-6">
                <div
                  className={`card p-3 border-2 cursor-pointer ${facultyOption === 'demo' ? 'border-primary bg-light' : ''}`}
                  onClick={() => setFacultyOption('demo')}
                  style={{ cursor: 'pointer' }}
                >
                  <h6 className="fw-bold mb-1">Pre-populate from Demo Roster</h6>
                  <p className="text-muted small mb-0">Use pre-seeded 48 faculty members across all 8 departments.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div
                  className={`card p-3 border-2 ${facultyOption === 'csv' ? 'border-primary bg-light' : ''}`}
                  onClick={() => setFacultyOption('csv')}
                  style={{ cursor: 'pointer' }}
                >
                  <h6 className="fw-bold mb-1">Upload Institutional CSV</h6>
                  <p className="text-muted small mb-0">Upload a spreadsheet using our official CSV template.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-light rounded border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Faculty Import Template:</span>
                <a
                  href="/api/v1/onboarding/templates/faculty.csv"
                  download="faculty-template.csv"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                >
                  <Download size={14} className="me-1" /> Download CSV Template
                </a>
              </div>
              <small className="text-muted d-block">
                Columns: employee_id, full_name, email, phone, department_code, designation, qualification, specialization, joining_year
              </small>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <GraduationCap className="me-2 text-primary" /> Step 4 — Student Roster Import
            </h4>
            <div className="row g-3">
              <div className="col-md-6">
                <div
                  className={`card p-3 border-2 ${studentOption === 'demo' ? 'border-primary bg-light' : ''}`}
                  onClick={() => setStudentOption('demo')}
                  style={{ cursor: 'pointer' }}
                >
                  <h6 className="fw-bold mb-1">Pre-populate from Demo Students</h6>
                  <p className="text-muted small mb-0">Load 1,250 verified student records with realistic attendance logs.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div
                  className={`card p-3 border-2 ${studentOption === 'csv' ? 'border-primary bg-light' : ''}`}
                  onClick={() => setStudentOption('csv')}
                  style={{ cursor: 'pointer' }}
                >
                  <h6 className="fw-bold mb-1">Upload Student CSV Roster</h6>
                  <p className="text-muted small mb-0">Batch import roll numbers, emails, semesters, and CGPAs.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-light rounded border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Student Import Template:</span>
                <a
                  href="/api/v1/onboarding/templates/students.csv"
                  download="students-template.csv"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                >
                  <Download size={14} className="me-1" /> Download CSV Template
                </a>
              </div>
              <small className="text-muted d-block">
                Columns: roll_number, full_name, email, phone, department_code, program, batch_year, current_semester, cgpa, category, gender, is_first_generation
              </small>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <Calendar className="me-2 text-primary" /> Step 5 — Academic Year & Calendar
            </h4>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Academic Year</label>
                <select
                  className="form-select"
                  value={academic.academicYear}
                  onChange={(e) => setAcademic({ ...academic, academicYear: e.target.value })}
                >
                  <option value="2026-2027">2026-2027 (Active Term)</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Session Start Month</label>
                <select
                  className="form-select"
                  value={academic.startMonth}
                  onChange={(e) => setAcademic({ ...academic, startMonth: e.target.value })}
                >
                  <option value="July">July (Monsoon/ODD)</option>
                  <option value="August">August</option>
                  <option value="January">January (Winter/EVEN)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">State Code (For Gazetted Festival Sync)</label>
                <select
                  className="form-select"
                  value={academic.stateCode}
                  onChange={(e) => setAcademic({ ...academic, stateCode: e.target.value })}
                >
                  <option value="KA">Karnataka (KA)</option>
                  <option value="TS">Telangana (TS)</option>
                  <option value="AP">Andhra Pradesh (AP)</option>
                  <option value="TN">Tamil Nadu (TN)</option>
                  <option value="MH">Maharashtra (MH)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Term Semester Type</label>
                <select
                  className="form-select"
                  value={academic.semesterType}
                  onChange={(e) => setAcademic({ ...academic, semesterType: e.target.value })}
                >
                  <option value="ODD">ODD Semester (I, III, V, VII)</option>
                  <option value="EVEN">EVEN Semester (II, IV, VI, VIII)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <CheckCircle className="me-2 text-success" /> Step 6 — Review & Launch
            </h4>
            <div className="bg-light p-3 rounded mb-3">
              <div className="row g-2">
                <div className="col-md-6"><strong>Institution:</strong> {profile.name} ({profile.shortCode})</div>
                <div className="col-md-6"><strong>Affiliation:</strong> {profile.affiliationBody}</div>
                <div className="col-md-6"><strong>Departments:</strong> {departments.length} configured</div>
                <div className="col-md-6"><strong>Academic Year:</strong> {academic.academicYear} ({academic.semesterType})</div>
                <div className="col-md-6"><strong>Holiday State:</strong> {academic.stateCode}</div>
                <div className="col-md-6"><strong>Portal:</strong> {profile.subdomain}.eduflow.ai</div>
              </div>
            </div>
            <div className="alert alert-info">
              Clicking <strong>Finalize & Launch Platform</strong> will persist the institution setup, seed academic records, configure the 2026 academic calendar, and grant full administrative dashboard access.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center"
            disabled={step === 1 || loading}
            onClick={() => setStep(prev => prev - 1)}
          >
            <ArrowLeft size={16} className="me-1" /> Back
          </button>

          {step < 6 ? (
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              disabled={loading}
              onClick={handleNext}
            >
              Next Step <ArrowRight size={16} className="ms-1" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success d-flex align-items-center"
              disabled={loading}
              onClick={handleFinish}
            >
              {loading ? 'Finalizing Setup...' : 'Finalize & Launch Platform'} <CheckCircle size={16} className="ms-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
