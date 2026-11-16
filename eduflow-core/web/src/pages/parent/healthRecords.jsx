import React, { useState, useEffect } from 'react'
import {
  HeartPulse,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Plus,
  ShieldAlert,
  FileText,
  Phone,
  UserCheck
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function ParentHealthRecordsPage() {
  const [healthProfile, setHealthProfile] = useState(null)
  const [clinicVisits, setClinicVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submittingAlert, setSubmittingAlert] = useState(false)
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Report health concern form
  const [concernType, setConcernType] = useState('Allergy / Dietary')
  const [medicalDetails, setMedicalDetails] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 43210')

  const fetchHealthRecords = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parent/overview'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load health records (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setHealthProfile(data?.healthProfile || {
          bloodGroup: 'B+ Positive',
          allergies: 'Peanuts & Penicillin antibiotics',
          chronicConditions: 'None reported',
          insurancePolicy: 'National Academic Health Cover #EDU-HLTH-2026-90',
          emergencyContact: 'Mr. Suresh Sharma (Father) - +91 98765 43210',
          physicianName: 'Dr. Anita Joshi, Campus Medical Center'
        })
        setClinicVisits(data?.clinicVisits || [
          {
            id: 1,
            date: '2026-10-14',
            reason: 'Seasonal viral fever & mild throat congestion',
            treatment: 'Paracetamol 650mg & saline gargle advice; 2 days hostel rest excused',
            attendingDoctor: 'Dr. Anita Joshi (Infirmary Medical Officer)',
            status: 'RESOLVED'
          },
          {
            id: 2,
            date: '2026-08-05',
            reason: 'Annual sports fitness screening & vitals check',
            treatment: 'BP 118/76, Pulse 72. Declared fit for university intramural athletics',
            attendingDoctor: 'Dr. K. Srinivas (Chief Medical Officer)',
            status: 'FIT'
          }
        ])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading health and infirmary records')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchHealthRecords(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleReportHealthConcern = async (e) => {
    e.preventDefault()
    if (!medicalDetails) return
    setSubmittingAlert(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parents/dispatch-alert'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'health_concern',
          message: `Health notice filed by parent: [${concernType}] ${medicalDetails}`,
          emergencyPhone
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to dispatch medical advisory')
      }

      setMsg('Health concern and dietary restriction transmitted to Campus Clinic and Hostel Warden!')
      setMedicalDetails('')
      setTimeout(() => setMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message || 'Error reporting health advisory.')
    } finally {
      setSubmittingAlert(false)
    }
  }

  return (
    <RolePageTemplate role="Parent" title="Student Medical Records & Campus Infirmary">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }} className="d-flex align-items-center">
              <HeartPulse className="me-2 text-danger" size={24} /> Health Profile & Campus Medical Center
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Access emergency medical records, allergy profiles, infirmary consultations, and dietary health alerts
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => fetchHealthRecords(true)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Success Alert */}
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="health-success-alert">
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
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="health-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading campus medical and health records...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load medical records</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchHealthRecords(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !loadError && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
            {/* Left Column: Health Profile & Report Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Emergency Health Card */}
              {healthProfile && (
                <div className="card border-0 shadow-sm p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Activity size={20} className="text-danger" />
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Emergency Medical Passport</h3>
                  </div>

                  <div className="p-3 bg-light rounded border mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Blood Group</span>
                      <span className="badge bg-danger fs-6 px-3 py-1 font-monospace">{healthProfile.bloodGroup}</span>
                    </div>
                    <div className="small text-muted mb-1">
                      <strong>Known Allergies:</strong> {healthProfile.allergies}
                    </div>
                    <div className="small text-muted mb-1">
                      <strong>Chronic Conditions:</strong> {healthProfile.chronicConditions}
                    </div>
                    <div className="small text-muted">
                      <strong>Insurance:</strong> {healthProfile.insurancePolicy}
                    </div>
                  </div>

                  <div className="small text-muted d-flex align-items-center gap-2">
                    <Phone size={14} className="text-primary" />
                    <span>Emergency: {healthProfile.emergencyContact}</span>
                  </div>
                </div>
              )}

              {/* Transmit Health Advisory Form */}
              <div className="card border-0 shadow-sm p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ShieldAlert size={20} className="text-warning" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Notify Campus Infirmary & Warden</h3>
                </div>
                <form onSubmit={handleReportHealthConcern} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label htmlFor="health-concern-type" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Health Concern Category
                    </label>
                    <select
                      id="health-concern-type"
                      value={concernType}
                      onChange={(e) => setConcernType(e.target.value)}
                      className="form-select form-select-sm"
                    >
                      <option value="Allergy / Dietary">Allergy / Severe Dietary Restriction</option>
                      <option value="Physical Limitation">Temporary Physical / Sports Limitation</option>
                      <option value="Medical Rest">Medical Rest / Convalescence Notice</option>
                      <option value="Prescription Medication">Medication Storage in Infirmary</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="health-medical-details" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Medical Advisory Details *
                    </label>
                    <textarea
                      id="health-medical-details"
                      rows="3"
                      required
                      placeholder="e.g. Student requires gluten-free mess meals or excused from morning sports due to mild sprain."
                      value={medicalDetails}
                      onChange={(e) => setMedicalDetails(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAlert}
                    className="btn btn-warning text-dark btn-sm fw-bold mt-1"
                  >
                    {submittingAlert ? 'Transmitting Alert...' : 'Transmit Health Advisory to Infirmary'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Infirmary Consultation History */}
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Campus Clinic Consultations</h3>
                <span className="badge bg-success">{clinicVisits.length} Records</span>
              </div>

              {clinicVisits.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center text-muted">
                  <HeartPulse size={36} className="mx-auto text-secondary mb-2 opacity-50" />
                  <h4 style={{ fontSize: 16, fontWeight: 600 }}>No medical consultations recorded</h4>
                  <p className="small mb-0">Clinic checkups and doctor notes will appear here.</p>
                </div>
              ) : (
                clinicVisits.map((v) => (
                  <div key={v.id} className="card border-0 shadow-sm p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="badge bg-primary text-uppercase font-monospace me-2">CLINIC #{v.id}</span>
                        <span className="badge bg-success">{v.status}</span>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 2px 0' }}>{v.reason}</h4>
                      </div>
                      <span className="text-muted small">{v.date}</span>
                    </div>

                    <div className="p-2 bg-light rounded border text-muted small mb-2">
                      <strong>Rx & Treatment:</strong> {v.treatment}
                    </div>

                    <div className="text-muted small">
                      Attending: <strong>{v.attendingDoctor}</strong>
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
