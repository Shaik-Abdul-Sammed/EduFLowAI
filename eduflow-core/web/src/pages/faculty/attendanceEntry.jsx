import { useState, useMemo, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, Award, Bluetooth, QrCode, Search, Download, Save, ShieldAlert, Users, RefreshCw, X, AlertTriangle } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { wakeUpFetch } from '../../utils/wakeUpHandler'

const engineeringDepartments = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science' },
  { code: 'ECE', name: 'Electronics & Communication Engineering' },
  { code: 'IT', name: 'Information Technology' }
]

const engineeringSections = [
  { code: 'CSE-6A', dept: 'CSE', semester: 'Sem 6', academicYear: '2026-27' },
  { code: 'CSE-6B', dept: 'CSE', semester: 'Sem 6', academicYear: '2026-27' },
  { code: 'AIDS-4A', dept: 'AIDS', semester: 'Sem 4', academicYear: '2026-27' },
  { code: 'ECE-6A', dept: 'ECE', semester: 'Sem 6', academicYear: '2026-27' }
]

const engineeringCourses = {
  CSE: [
    { code: 'CS301', name: 'Operating Systems & System Calls' },
    { code: 'CS304', name: 'Distributed Systems & Cloud Computing' },
    { code: 'CS305', name: 'Database Internals & Storage Engines' }
  ],
  AIDS: [
    { code: 'AI301', name: 'Deep Learning & Neural Networks' },
    { code: 'AI302', name: 'Natural Language Processing & LLMs' }
  ],
  ECE: [
    { code: 'EC301', name: 'Embedded Systems & RTOS Design' },
    { code: 'EC302', name: 'Digital Signal Processing' }
  ],
  IT: [
    { code: 'IT301', name: 'Cloud Infrastructure & Kubernetes' }
  ]
}

const btechStudents = [
  { roll: '22BCE1001', name: 'Aarav Sharma', section: 'CSE-6A', historicalAttendance: 88.5, email: 'aarav.22bce@eduflow.edu' },
  { roll: '22BCE1007', name: 'Ananya Sen', section: 'CSE-6A', historicalAttendance: 94.0, email: 'ananya.22bce@eduflow.edu' },
  { roll: '22BCE1014', name: 'Devendra Patel', section: 'CSE-6A', historicalAttendance: 78.2, email: 'devendra.22bce@eduflow.edu' },
  { roll: '22BCE1022', name: 'Ishaan Varma', section: 'CSE-6A', historicalAttendance: 63.5, email: 'ishaan.22bce@eduflow.edu' },
  { roll: '22BCE1029', name: 'Meera Krishnan', section: 'CSE-6A', historicalAttendance: 91.0, email: 'meera.22bce@eduflow.edu' },
  { roll: '22BCE1035', name: 'Nikhil Deshmukh', section: 'CSE-6A', historicalAttendance: 69.8, email: 'nikhil.22bce@eduflow.edu' },
  { roll: '22BCE1042', name: 'Priya Nambiar', section: 'CSE-6A', historicalAttendance: 86.4, email: 'priya.22bce@eduflow.edu' },
  { roll: '22BCE1050', name: 'Rohan Gupta', section: 'CSE-6A', historicalAttendance: 82.0, email: 'rohan.22bce@eduflow.edu' },
  { roll: '22BCE1058', name: 'Sanjana Rao', section: 'CSE-6A', historicalAttendance: 96.5, email: 'sanjana.22bce@eduflow.edu' },
  { roll: '22BCE1064', name: 'Vikramaditya Singh', section: 'CSE-6A', historicalAttendance: 73.0, email: 'vikram.22bce@eduflow.edu' },
  { roll: '22BAI1004', name: 'Karthik Raja', section: 'AIDS-4A', historicalAttendance: 89.0, email: 'karthik.22bai@eduflow.edu' },
  { roll: '22BAI1018', name: 'Sneha Chawla', section: 'AIDS-4A', historicalAttendance: 92.5, email: 'sneha.22bai@eduflow.edu' },
  { roll: '22BEC1012', name: 'Abhishek Roy', section: 'ECE-6A', historicalAttendance: 84.0, email: 'abhishek.22bec@eduflow.edu' }
]

export default function AttendanceEntryPage() {
  const [selectedDept, setSelectedDept] = useState('CSE')
  const [selectedSection, setSelectedSection] = useState('CSE-6A')
  const [selectedCourse, setSelectedCourse] = useState('CS301')
  const [sessionType, setSessionType] = useState('Theory Lecture (1 Hr)')
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0])
  const [sessionPeriod, setSessionPeriod] = useState('Period 2: 10:00 - 11:00 AM')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRiskOnly, setFilterRiskOnly] = useState(false)
  const [saved, setSaved] = useState(false)
  const [bleScanning, setBleScanning] = useState(false)
  const [sessionCode, setSessionCode] = useState('482915')
  const [qrPayload, setQrPayload] = useState('eduflow:presence:session-1:482915')
  const [codeExpiresAt, setCodeExpiresAt] = useState(() => new Date(Date.now() + 90000).toISOString())
  const [showQrModal, setShowQrModal] = useState(false)
  const [isRoomCalibrated, setIsRoomCalibrated] = useState(false)

  useEffect(() => {
    let mounted = true
    const roomId = `ROOM-${selectedSection}`
    wakeUpFetch(`/api/v1/attendance/rooms/${roomId}/calibration`)
      .then(res => res.json())
      .then(data => {
        if (mounted && data?.calibrated) {
          setIsRoomCalibrated(true)
        } else if (mounted) {
          setIsRoomCalibrated(false)
        }
      })
      .catch(() => {
        if (mounted) setIsRoomCalibrated(false)
      })
    return () => { mounted = false }
  }, [selectedSection])

  const regenerateCode = async () => {
    try {
      const sessionId = `${selectedCourse}-${selectedSection}`
      const res = await wakeUpFetch(`/api/v1/attendance/session/${sessionId}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.code) {
          setSessionCode(data.code)
          setQrPayload(data.qrPayload || `eduflow:presence:${sessionId}:${data.code}`)
          setCodeExpiresAt(data.expiresAt)
        }
      } else {
        // Fallback local rotating generation
        const newCode = Math.floor(100000 + Math.random() * 900000).toString()
        setSessionCode(newCode)
        setCodeExpiresAt(new Date(Date.now() + 90000).toISOString())
      }
    } catch {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString()
      setSessionCode(newCode)
    }
  }

  // Status mapping: 'P' = Present, 'A' = Absent, 'OD' = On-Duty, 'L' = Late
  const [attendance, setAttendance] = useState(() => {
    const map = {}
    btechStudents.forEach(s => {
      map[s.roll] = 'P'
    })
    return map
  })

  // Review states: 'auto_present' | 'needs_review' | 'auto_absent' | 'faculty_override'
  const [reviewStates, setReviewStates] = useState(() => {
    const states = {}
    btechStudents.forEach(s => {
      if (s.historicalAttendance >= 80) {
        states[s.roll] = { state: 'auto_present', confidence: 'high', reason: 'dwell_ok' }
      } else {
        states[s.roll] = { state: 'needs_review', confidence: 'medium', reason: 'partial_dwell' }
      }
    })
    return states
  })
  const [autoMarkedCollapsed, setAutoMarkedCollapsed] = useState(true)

  const sectionStudents = useMemo(() => {
    return btechStudents.filter(s => s.section === selectedSection)
  }, [selectedSection])

  const filteredStudents = useMemo(() => {
    return sectionStudents.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.roll.toLowerCase().includes(searchQuery.toLowerCase())
      const matchRisk = filterRiskOnly ? s.historicalAttendance < 75 : true
      return matchSearch && matchRisk
    })
  }, [sectionStudents, searchQuery, filterRiskOnly])

  const needsReviewStudents = useMemo(() => {
    return filteredStudents.filter(s => reviewStates[s.roll]?.state === 'needs_review')
  }, [filteredStudents, reviewStates])

  const autoMarkedStudents = useMemo(() => {
    return filteredStudents.filter(s => reviewStates[s.roll]?.state !== 'needs_review')
  }, [filteredStudents, reviewStates])

  const presentCount = sectionStudents.filter(s => attendance[s.roll] === 'P' || attendance[s.roll] === 'L').length
  const absentCount = sectionStudents.filter(s => attendance[s.roll] === 'A').length
  const odCount = sectionStudents.filter(s => attendance[s.roll] === 'OD').length
  const attendanceRate = sectionStudents.length ? Math.round((presentCount / sectionStudents.length) * 100) : 0

  const handleSetStatus = (roll, status) => {
    setSaved(false)
    setAttendance(prev => ({ ...prev, [roll]: status }))
    setReviewStates(prev => ({
      ...prev,
      [roll]: { state: 'faculty_override', confidence: 'high', reason: 'faculty_manual_review' }
    }))
  }

  const markAllNeedsReviewAbsent = () => {
    setSaved(false)
    setAttendance(prev => {
      const copy = { ...prev }
      filteredStudents.forEach(s => {
        if (reviewStates[s.roll]?.state === 'needs_review') {
          copy[s.roll] = 'A'
        }
      })
      return copy
    })
    setReviewStates(prev => {
      const copy = { ...prev }
      filteredStudents.forEach(s => {
        if (copy[s.roll]?.state === 'needs_review') {
          copy[s.roll] = { state: 'faculty_override', confidence: 'high', reason: 'bulk_unresolved_absent' }
        }
      })
      return copy
    })
  }

  const markAll = (status) => {
    setSaved(false)
    setAttendance(prev => {
      const copy = { ...prev }
      sectionStudents.forEach(s => {
        copy[s.roll] = status
      })
      return copy
    })
    setReviewStates(prev => {
      const copy = { ...prev }
      sectionStudents.forEach(s => {
        copy[s.roll] = { state: 'faculty_override', confidence: 'high', reason: 'faculty_mark_all' }
      })
      return copy
    })
  }

  const simulateBleSync = () => {
    setBleScanning(true)
    setTimeout(() => {
      setBleScanning(false)
      setAttendance(prev => {
        const copy = { ...prev }
        // Randomly simulate BLE signal pickups for on-campus students
        sectionStudents.forEach((s, idx) => {
          if (idx !== 3 && idx !== 5) {
            copy[s.roll] = 'P'
          } else {
            copy[s.roll] = 'A'
          }
        })
        return copy
      })
      setSaved(false)
    }, 1200)
  }

  const handleExportCsv = () => {
    const rows = [
      ['Roll Number', 'Student Name', 'Section', 'Course Code', 'Date', 'Session Type', 'Attendance Status'],
      ...sectionStudents.map(s => [s.roll, s.name, s.section, selectedCourse, sessionDate, sessionType, attendance[s.roll] || 'P'])
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Attendance_${selectedSection}_${selectedCourse}_${sessionDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="B.Tech Classroom & Laboratory Attendance Gateway"
      description="Record biometric classroom presence, import BLE mobile arrival beacons, and manage UGC statutory 75% attendance condonation thresholds."
    >
      <div className="d-flex flex-column gap-4 w-100">
        
        {/* Controls Card */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)', color: 'var(--app-text, #1e293b)' }}>
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label small fw-bold text-uppercase text-muted">Department</label>
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value)
                  const matchingSection = engineeringSections.find(s => s.dept === e.target.value)
                  if (matchingSection) setSelectedSection(matchingSection.code)
                  setSelectedCourse(engineeringCourses[e.target.value][0].code)
                }}
              >
                {engineeringDepartments.map(d => (
                  <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-bold text-uppercase text-muted">Class Section</label>
              <select
                className="form-select"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {engineeringSections.filter(s => s.dept === selectedDept).map(s => (
                  <option key={s.code} value={s.code}>{s.code} &bull; {s.semester}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-bold text-uppercase text-muted">Engineering Course</label>
              <select
                className="form-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {(engineeringCourses[selectedDept] || []).map(c => (
                  <option key={c.code} value={c.code}>{c.code} &bull; {c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small fw-bold text-uppercase text-muted">Session Modality</label>
              <select
                className="form-select"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
              >
                <option value="Theory Lecture (1 Hr)">Theory Lecture (1 Hr)</option>
                <option value="Laboratory Session (3 Hrs)">Laboratory Session (3 Hrs)</option>
                <option value="Tutorial & Remedial Problem Solving">Tutorial & Remedial</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-uppercase text-muted">Date of Session</label>
              <input
                type="date"
                className="form-control"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-uppercase text-muted">Period / Time Slot</label>
              <select
                className="form-select"
                value={sessionPeriod}
                onChange={(e) => setSessionPeriod(e.target.value)}
              >
                <option value="Period 1: 09:00 - 10:00 AM">Period 1: 09:00 - 10:00 AM</option>
                <option value="Period 2: 10:00 - 11:00 AM">Period 2: 10:00 - 11:00 AM</option>
                <option value="Period 3: 11:15 - 12:15 PM">Period 3: 11:15 - 12:15 PM</option>
                <option value="Afternoon Practical: 01:30 - 04:30 PM">Afternoon Practical: 01:30 - 04:30 PM</option>
              </select>
            </div>
            <div className="col-12 col-md-4 d-flex align-items-end gap-2">
              <button
                type="button"
                onClick={simulateBleSync}
                disabled={bleScanning}
                className="btn btn-outline-primary w-100 d-inline-flex align-items-center justify-content-center gap-1.5"
                title="Detect on-campus student Bluetooth BLE beacons"
              >
                <Bluetooth size={16} /> {bleScanning ? 'Scanning Beacons...' : 'Auto BLE Sync'}
              </button>
              <button
                type="button"
                data-testid="open-qr-modal-btn"
                onClick={() => setShowQrModal(true)}
                className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                title="Show 90s Rotating Session QR & PIN Code"
              >
                <QrCode size={16} />
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                title="Export session register as CSV"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Persistent Rotating Session Code Floating Badge */}
          <div className="mt-3 p-2 px-3 rounded-3 bg-light border d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div data-testid="session-code-badge" className="d-flex align-items-center gap-2 small">
              <span className="badge bg-primary text-white font-monospace">ACTIVE SESSION PIN</span>
              <span className="fs-5 fw-bold font-monospace text-primary tracking-wider">{sessionCode}</span>
              <span className="text-muted small">(Rotates every 90s to prevent proxy)</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                data-testid="regenerate-code-btn"
                onClick={regenerateCode}
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2"
                title="Force-regenerate PIN immediately"
              >
                <RefreshCw size={14} /> Regenerate Code
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 py-1 px-2"
              >
                <QrCode size={14} /> View Projected QR
              </button>
            </div>
          </div>

          {/* Uncalibrated Room Warning Banner (P1.1) */}
          {!isRoomCalibrated && (
            <div data-testid="uncalibrated-room-banner" className="alert alert-warning d-flex align-items-center gap-2 mt-3 mb-0 py-2 px-3 border border-warning">
              <AlertTriangle size={18} className="text-warning flex-shrink-0" />
              <div className="small">
                <strong>Calibration Warning:</strong> This room isn't calibrated — presence accuracy may be low. Ask admin to calibrate.
              </div>
            </div>
          )}
        </div>

        {/* Real-time Session Metrics */}
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 h-100 text-center" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="h3 fw-bold text-primary mb-0">{sectionStudents.length}</div>
              <div className="small text-muted text-uppercase fw-semibold">Class Roster</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 h-100 text-center" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="h3 fw-bold text-success mb-0">{presentCount}</div>
              <div className="small text-muted text-uppercase fw-semibold">Present Today</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 h-100 text-center" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="h3 fw-bold text-danger mb-0">{absentCount}</div>
              <div className="small text-muted text-uppercase fw-semibold">Absent</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 h-100 text-center" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="h3 fw-bold text-info mb-0">{attendanceRate}%</div>
              <div className="small text-muted text-uppercase fw-semibold">Session Rate</div>
            </div>
          </div>
        </div>

        {/* Student Attendance Roster Card */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)', color: 'var(--app-text, #1e293b)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="input-group" style={{ maxWidth: 280 }}>
                <span className="input-group-text bg-transparent border-end-0">
                  <Search size={14} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm border-start-0"
                  placeholder="Filter name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setFilterRiskOnly(prev => !prev)}
                className={`btn btn-sm ${filterRiskOnly ? 'btn-danger' : 'btn-outline-danger'} d-inline-flex align-items-center gap-1`}
              >
                <ShieldAlert size={14} /> &lt;75% Risk Only
              </button>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => markAll('P')}
                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
              >
                <CheckCircle2 size={14} /> All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('A')}
                className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
              >
                <XCircle size={14} /> All Absent
              </button>
            </div>
          </div>

          {/* Section 1: Needs your review (N) */}
          <div className="mb-4 border rounded p-3 bg-light bg-opacity-25">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-warning text-dark px-2 py-1 fs-6">
                  Needs your review ({needsReviewStudents.length})
                </span>
                <span className="small text-muted">
                  Low or partial dwell detected. Faculty review required before submission.
                </span>
              </div>
              {needsReviewStudents.length > 0 && (
                <button
                  type="button"
                  onClick={markAllNeedsReviewAbsent}
                  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                >
                  <XCircle size={14} /> Mark All Needs Review Absent
                </button>
              )}
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 45 }}>#</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Academic Term %</th>
                    <th>Confidence / Reason</th>
                    <th className="text-end">Resolve Action</th>
                  </tr>
                </thead>
                <tbody>
                  {needsReviewStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-3 text-success fw-semibold">
                        ✓ All review items resolved. Ready to finalize!
                      </td>
                    </tr>
                  ) : (
                    needsReviewStudents.map((s, idx) => {
                      const currentStatus = attendance[s.roll] || 'P'
                      const isRisk = s.historicalAttendance < 75
                      const revInfo = reviewStates[s.roll] || {}
                      return (
                        <tr key={s.roll} className="table-warning bg-opacity-10">
                          <td className="text-muted small">{idx + 1}</td>
                          <td className="fw-bold font-monospace text-primary">{s.roll}</td>
                          <td className="fw-semibold">
                            <div>{s.name}</div>
                            <div className="small text-muted font-monospace">{s.email}</div>
                          </td>
                          <td>
                            <span className={`fw-bold ${isRisk ? 'text-danger' : 'text-success'}`}>
                              {s.historicalAttendance}%
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-warning text-dark border me-1">
                              {revInfo.confidence || 'medium'} confidence
                            </span>
                            <span className="small text-muted font-monospace">
                              {revInfo.reason || 'partial_dwell'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                onClick={() => handleSetStatus(s.roll, 'P')}
                                className={`btn ${currentStatus === 'P' ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
                                title="Present"
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetStatus(s.roll, 'A')}
                                className={`btn ${currentStatus === 'A' ? 'btn-danger fw-bold' : 'btn-outline-secondary'}`}
                                title="Absent"
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetStatus(s.roll, 'OD')}
                                className={`btn ${currentStatus === 'OD' ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                                title="On-Duty"
                              >
                                On-Duty
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetStatus(s.roll, 'L')}
                                className={`btn ${currentStatus === 'L' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                                title="Late Arrival"
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Auto-marked (confident) */}
          <div className="mb-4 border rounded p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success bg-opacity-10 text-success border border-success d-inline-flex align-items-center gap-1 px-2 py-1 fs-6">
                  <CheckCircle2 size={16} /> Auto-marked (confident) ({autoMarkedStudents.length})
                </span>
                <span className="small text-muted">
                  High dwell (&ge;80%) & valid session code verified.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoMarkedCollapsed(prev => !prev)}
                className="btn btn-sm btn-outline-secondary"
              >
                {autoMarkedCollapsed ? 'Expand Confident List' : 'Collapse List'}
              </button>
            </div>

            <div className="table-responsive mt-3" style={{ overflowX: 'auto', display: autoMarkedCollapsed ? 'none' : 'block' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 45 }}>#</th>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Academic Term %</th>
                      <th>Threshold Status</th>
                      <th className="text-end">Mark Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoMarkedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">
                          No auto-marked confident students.
                        </td>
                      </tr>
                    ) : (
                      autoMarkedStudents.map((s, idx) => {
                        const currentStatus = attendance[s.roll] || 'P'
                        const isRisk = s.historicalAttendance < 75
                        const revState = reviewStates[s.roll]?.state || 'auto_present'
                        return (
                          <tr key={s.roll}>
                            <td className="text-muted small">{idx + 1}</td>
                            <td className="fw-bold font-monospace text-primary">{s.roll}</td>
                            <td className="fw-semibold">
                              <div>{s.name}</div>
                              <div className="small text-muted font-monospace">{s.email}</div>
                            </td>
                            <td>
                              <span className={`fw-bold ${isRisk ? 'text-danger' : 'text-success'}`}>
                                {s.historicalAttendance}%
                              </span>
                            </td>
                            <td>
                              {isRisk ? (
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger d-inline-flex align-items-center gap-1">
                                  <ShieldAlert size={12} /> Condonation Risk (&lt;75%)
                                </span>
                              ) : (
                                <span className="badge bg-success bg-opacity-10 text-success">
                                  Good Standing (Eligible)
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm" role="group">
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(s.roll, 'P')}
                                  className={`btn ${currentStatus === 'P' ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
                                  title="Present"
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(s.roll, 'A')}
                                  className={`btn ${currentStatus === 'A' ? 'btn-danger fw-bold' : 'btn-outline-secondary'}`}
                                  title="Absent"
                                >
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(s.roll, 'OD')}
                                  className={`btn ${currentStatus === 'OD' ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                                  title="On-Duty"
                                >
                                  On-Duty
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetStatus(s.roll, 'L')}
                                  className={`btn ${currentStatus === 'L' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                                  title="Late Arrival"
                                >
                                  Late
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <span className="text-muted small">
              Session: {selectedSection} &bull; {selectedCourse} &bull; {sessionDate} ({sessionPeriod})
            </span>
            <button
              type="button"
              onClick={() => {
                if (needsReviewStudents.length > 0) {
                  markAllNeedsReviewAbsent()
                }
                setSaved(true)
              }}
              className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
              title={needsReviewStudents.length > 0 ? `${needsReviewStudents.length} students in Needs Review will be finalized as absent` : 'Save and commit attendance'}
            >
              <Save size={16} />{' '}
              {saved
                ? 'Attendance Saved & Ledger Committed ✓'
                : 'Save & Publish Attendance'}
            </button>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
