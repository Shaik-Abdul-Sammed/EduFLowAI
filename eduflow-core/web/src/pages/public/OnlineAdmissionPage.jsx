import { useState } from 'react'
import { GraduationCap, CheckCircle, ArrowRight, Upload, CreditCard } from 'lucide-react'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function OnlineAdmissionPage() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('2008-05-10')
  const [gender, setGender] = useState('Male')
  const [desiredProgram, setDesiredProgram] = useState('B.Tech Computer Science & Engineering')
  const [qualification, setQualification] = useState('12th Standard / Pre-University (MPC)')
  const [marks, setMarks] = useState('')
  const [utrNumber, setUtrNumber] = useState('UPI/882910398/SUCCESS')
  const [submittedApp, setSubmittedApp] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/admissions/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          date_of_birth: dob,
          gender,
          desired_program: desiredProgram,
          qualification,
          percentage_or_cgpa: marks,
          payment_utr: utrNumber
        })
      })
      if (res.ok) {
        const data = await safeJson(res)
        setSubmittedApp(data.application)
        setStep(4)
      } else {
        setError('Submission failed. Please check required fields.')
      }
    } catch (_err) {
      setError('Network communication failed. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', color: '#2563EB', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            <GraduationCap size={18} /> Official Admissions Portal 2026-27
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Sri Siddhartha Institute of Technology</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Online Undergraduate & Postgraduate Admission Application Form</p>
        </div>

        {/* Multi-step progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28 }}>
          {[
            { n: 1, label: 'Candidate Details' },
            { n: 2, label: 'Academic Qualification' },
            { n: 3, label: 'UPI Fee Payment' },
            { n: 4, label: 'Confirmation' }
          ].map((s) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: step >= s.n ? '#2563EB' : '#E2E8F0',
                  color: step >= s.n ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700
                }}
              >
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: step >= s.n ? '#0F172A' : '#94A3B8' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {error && (
            <div style={{ padding: 12, borderRadius: 8, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0F172A' }}>Step 1: Personal & Contact Information</h3>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Candidate Full Name (As in SSC / 10th)</label>
                <input
                  type="text"
                  placeholder="e.g. Vivek Vardhan Reddy"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="vivek.reddy@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98480 22334"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!fullName.trim() || !email.trim()) {
                    setError('Please fill in candidate name and email.')
                    return
                  }
                  setError('')
                  setStep(2)
                }}
                style={{
                  alignSelf: 'flex-end',
                  marginTop: 10,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                Proceed to Academics <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0F172A' }}>Step 2: Program & Prior Qualifications</h3>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Desired Degree Program</label>
                <select
                  value={desiredProgram}
                  onChange={(e) => setDesiredProgram(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                >
                  <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                  <option value="B.Tech Artificial Intelligence & Data Science">B.Tech Artificial Intelligence & Data Science</option>
                  <option value="B.Tech Electronics & Communication">B.Tech Electronics & Communication Engineering</option>
                  <option value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</option>
                  <option value="M.Tech Software Engineering">M.Tech Software Engineering</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Qualifying Examination</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                >
                  <option value="12th Standard / Pre-University (MPC)">12th Standard / Pre-University (MPC / Science)</option>
                  <option value="CBSE / ISC Class XII">CBSE / ISC Class XII</option>
                  <option value="Polytechnic Diploma (Lateral Entry)">Polytechnic Diploma (Lateral Entry to 2nd Year)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Qualifying Exam Percentage / Aggregate %</label>
                <input
                  type="number"
                  placeholder="e.g. 94.5"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px dashed #CBD5E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  <Upload size={16} /> Upload Marksheet & ID Proof (Optional for provisional submission)
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>PDF, PNG, JPG up to 5MB</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!marks) {
                      setError('Please enter your aggregate percentage.')
                      return
                    }
                    setError('')
                    setStep(3)
                  }}
                  style={{ background: '#2563EB', color: '#FFFFFF', padding: '10px 22px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  Proceed to Payment <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0F172A' }}>Step 3: Application Processing Fee Payment</h3>
              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 10, border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E3A8A' }}>Application Processing & Prospectus Fee</div>
                    <div style={{ fontSize: 12, color: '#3B82F6' }}>One-time institutional processing fee</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#1E40AF' }}>₹1,000.00</div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#FFFFFF', padding: 10, borderRadius: 8, border: '1px solid #CBD5E1' }}>
                  <CreditCard size={32} color="#2563EB" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Direct UPI Pay: ssit.admissions@icici</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Google Pay, PhonePe, Paytm, BHIM UPI accepted</div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>UPI Transaction Reference (UTR / Txn ID)</label>
                <input
                  type="text"
                  placeholder="UPI/329012398401/SUCCESS"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
                >
                  Back
                </button>
                <button
                  disabled={loading}
                  onClick={handleFinalSubmit}
                  style={{ background: '#10B981', color: '#FFFFFF', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Submitting Application...' : 'Confirm & Submit Application'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && submittedApp && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <CheckCircle size={36} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>Application Received Successfully!</h2>
              <p style={{ margin: '0 0 20px 0', fontSize: 14, color: '#64748B' }}>Your online admission dossier has been generated and queued for registrar verification.</p>

              <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', maxWidth: 460, margin: '0 auto 24px auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Application Number:</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#2563EB' }}>{submittedApp.application_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Candidate Name:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{submittedApp.full_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Program Applied:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{submittedApp.desired_program}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Application Fee Status:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 4 }}>
                    PAID (₹1,000)
                  </span>
                </div>
              </div>

              <a
                href="/login"
                style={{
                  display: 'inline-block',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 24px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                Go to Student Portal Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
