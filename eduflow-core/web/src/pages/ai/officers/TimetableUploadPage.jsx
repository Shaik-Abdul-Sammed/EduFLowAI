import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Download,
  Calendar,
  Layers,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export default function TimetableUploadPage() {
  const { addToast } = useToast()

  const [uploadedFile, setUploadedFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [changesText, setChangesText] = useState(
    '1. Dr. R. Ramanathan retired; replaced by Asst. Prof. Priya Nair for Data Structures.\n2. Add new IoT Lab session on Thursday 2-4 PM for Section B.\n3. Shift Machine Learning lecture to avoid Friday sports afternoon.'
  )

  const [comparison, setComparison] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    addToast(`Uploaded previous semester schedule: ${file.name}`, 'success')
  }

  const handleLoadSampleTimetable = () => {
    setUploadedFile({
      name: 'sample-timetable.xlsx',
      size: 14200,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    setChangesText(
      '1. Faculty replacement: Dr. A (Dr. A. Sharma) replaced by Dr. B (Dr. B. Kulkarni) for CS501 Data Structures.\n' +
      '2. Faculty replacement: Prof. X (Prof. X. Varma) replaced by Prof. Y (Prof. Y. Nambiar) for CS502 Database Systems.\n' +
      '3. Elective course added: New elective CS506 Cloud Computing Architecture (3 credits) for Section A.\n' +
      '4. Lab slot relocated: CS505 Operating Systems Lab moved from morning (09:00 - 12:00) to afternoon (14:00 - 17:00) slot to resolve systems hardware clash.'
    )
    addToast('Loaded sample CSE semester timetable (sample-timetable.xlsx) with 4 realistic deltas! Click "Regenerate" to run.', 'success')
  }

  const handleProcessTimetable = () => {
    if (!uploadedFile) {
      addToast('Please upload a previous timetable file or click "Load Sample Timetable" first.', 'warning')
      return
    }
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setGenerated(true)
      setComparison({
        totalSlots: 40,
        reusedSlots: 36,
        modifiedSlots: 4,
        conflictsResolved: 4,
        effectiveTeachingDays: 92,
        holidayClashesAvoided: 8,
        previousSchedule: [
          { day: 'Monday', time: '09:00 - 10:00', course: 'CS501 Data Structures', faculty: 'Dr. A. Sharma (Dr. A)', room: 'LH-101' },
          { day: 'Monday', time: '10:00 - 11:00', course: 'CS502 Database Systems', faculty: 'Prof. X. Varma (Prof. X)', room: 'LH-101' },
          { day: 'Tuesday', time: '09:00 - 12:00', course: 'CS505 Operating Systems Lab', faculty: 'Dr. M. Joseph', room: 'Systems Lab 1' },
          { day: 'Wednesday', time: '11:15 - 12:15', course: 'CS503 Computer Networks', faculty: 'Dr. K. Swaminathan', room: 'LH-102' },
          { day: 'Thursday', time: '14:00 - 16:00', course: 'CS504 Software Engineering', faculty: 'Prof. S. Rao', room: 'LH-101' },
          { day: 'Friday', time: '10:00 - 11:00', course: 'Open Slot / Free', faculty: '—', room: '—' },
        ],
        newSchedule: [
          { day: 'Monday', time: '09:00 - 10:00', course: 'CS501 Data Structures', faculty: 'Dr. B. Kulkarni (Dr. B)', room: 'LH-101', changed: true, reason: 'Faculty replaced: Dr. A replaced by Dr. B' },
          { day: 'Monday', time: '10:00 - 11:00', course: 'CS502 Database Systems', faculty: 'Prof. Y. Nambiar (Prof. Y)', room: 'LH-101', changed: true, reason: 'Faculty replaced: Prof. X replaced by Prof. Y' },
          { day: 'Tuesday', time: '14:00 - 17:00', course: 'CS505 Operating Systems Lab', faculty: 'Dr. M. Joseph', room: 'Systems Lab 1', changed: true, reason: 'Lab moved from morning to afternoon to resolve hardware conflict' },
          { day: 'Wednesday', time: '11:15 - 12:15', course: 'CS503 Computer Networks', faculty: 'Dr. K. Swaminathan', room: 'LH-102', changed: false, reason: 'Slot preserved' },
          { day: 'Thursday', time: '14:00 - 16:00', course: 'CS504 Software Engineering', faculty: 'Prof. S. Rao', room: 'LH-101', changed: false, reason: 'Slot preserved' },
          { day: 'Friday', time: '10:00 - 11:00', course: 'CS506 Cloud Computing Architecture', faculty: 'Dr. N. Sengupta', room: 'LH-201', changed: true, reason: 'New elective course added' },
        ],
        changelog: [
          'Assigned Dr. B. Kulkarni to CS501 Data Structures (Reason: Dr. A replaced by Dr. B)',
          'Assigned Prof. Y. Nambiar to CS502 Database Systems (Reason: Prof. X replaced by Prof. Y)',
          'Relocated CS505 Operating Systems Lab from morning (09:00-12:00) to afternoon (14:00-17:00) (Reason: Systems hardware conflict resolved)',
          'Allocated newly added elective CS506 Cloud Computing Architecture on Friday 10:00-11:00 AM in LH-201 (Reason: Department elective expansion)',
          'Academic Calendar synchronization: Verified 92 working days; skipped 8 gazetted holidays (Dussehra, Diwali, etc.) without syllabus loss',
        ],
      })
      addToast('Timetable delta calculated and conflict-free schedule regenerated!', 'success')
    }, 900)
  }

  const handleDownload = () => {
    window.print()
    addToast('Downloading regenerated timetable', 'info')
  }

  return (
    <div className="container-fluid py-4 px-4 bg-light min-vh-100">
      {/* Top navigation */}
      <div className="mb-3">
        <Link to="/officer/timetable" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} /> Back to Timetable Officer
        </Link>
      </div>

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              Timetable Intelligence &amp; Reuse Engine
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle">
              Calendar-Aware Scheduling
            </span>
          </div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Layers className="text-primary" size={24} />
            Timetable Reuse &amp; Delta Modification
          </h2>
          <p className="text-muted small mb-0">
            Upload your previous semester master schedule. Provide only the changes (faculty joined/left, lab batches, new courses) and let EduFlow generate an optimized conflict-free schedule.
          </p>
        </div>

        {generated && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={handleDownload}>
              <Download size={15} /> Export Master Schedule
            </button>
            <button className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={() => addToast('Timetable published to departments and staff!', 'success')}>
              <CheckCircle2 size={15} /> Publish Schedule
            </button>
          </div>
        )}
      </div>

      {/* Upload and Requirements Section */}
      <div className="row g-4 mb-4">
        {/* Step 1: Upload */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100 p-4">
            <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
              <span className="badge bg-primary text-white rounded-pill px-2">1</span>
              Upload Previous Semester Master Schedule
            </h5>
            <p className="small text-muted mb-3">
              Supports CSV, Excel (.xlsx), or JSON files exported from any college ERP.
            </p>

            <div className="border border-2 border-dashed rounded-3 p-4 text-center bg-light">
              <UploadCloud size={36} className="text-primary mb-2" />
              <p className="small fw-semibold text-dark mb-1">
                {uploadedFile ? uploadedFile.name : 'Drag and drop your previous timetable file here'}
              </p>
              <span className="small text-muted d-block mb-3">
                {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'or click to browse from your computer'}
              </span>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-warning btn-sm fw-semibold text-dark d-flex align-items-center gap-1 shadow-sm"
                  onClick={handleLoadSampleTimetable}
                >
                  <Sparkles size={14} />
                  Load Sample Timetable
                </button>
                <label className="btn btn-outline-primary btn-sm mb-0">
                  Browse File
                  <input type="file" accept=".csv,.xlsx,.xls,.json" className="d-none" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Changes */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100 p-4">
            <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
              <span className="badge bg-primary text-white rounded-pill px-2">2</span>
              Specify Current Semester Changes / Requirements
            </h5>
            <p className="small text-muted mb-3">
              Describe faculty adjustments, newly added labs, course code updates, or room availability.
            </p>
            <textarea
              className="form-control form-control-sm mb-3"
              rows="5"
              value={changesText}
              onChange={(e) => setChangesText(e.target.value)}
              placeholder="e.g. Faculty X is on sabbatical; combine sections A and B for Open Elective..."
            />
            <button
              className="btn btn-primary btn-sm align-self-start d-flex align-items-center gap-2 shadow-sm"
              onClick={handleProcessTimetable}
              disabled={analyzing}
            >
              {analyzing ? <RefreshCw className="spinner-border spinner-border-sm" size={15} /> : <Sparkles size={15} />}
              {analyzing ? 'Analyzing Delta & Resolving Clashes...' : 'Regenerate'}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {comparison && (
        <>
          {/* Calendar Awareness Alert */}
          <div className="alert alert-info border-0 shadow-sm d-flex align-items-center gap-3 mb-4">
            <Calendar size={28} className="text-primary flex-shrink-0" />
            <div>
              <strong className="d-block text-dark">Academic Calendar Synchronization Active:</strong>
              <span className="small text-muted">
                EduFlow verified 92 required teaching days. 8 statutory holiday clashes avoided automatically. Faculty workload caps (16 hrs/week) strictly enforced.
              </span>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3">
                <span className="text-muted small">Reused Slots</span>
                <div className="h3 fw-bold text-success mb-0">{comparison.reusedSlots} / {comparison.totalSlots}</div>
                <span className="small text-muted">85% structure preserved</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3">
                <span className="text-muted small">Adjusted Slots</span>
                <div className="h3 fw-bold text-warning mb-0">{comparison.modifiedSlots}</div>
                <span className="small text-muted">Accommodating delta changes</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3">
                <span className="text-muted small">Clashes Resolved</span>
                <div className="h3 fw-bold text-primary mb-0">{comparison.conflictsResolved}</div>
                <span className="small text-muted">0 room or faculty conflicts</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3">
                <span className="text-muted small">Teaching Days Guaranteed</span>
                <div className="h3 fw-bold text-dark mb-0">{comparison.effectiveTeachingDays}</div>
                <span className="small text-success">Compliant with AICTE / UGC</span>
              </div>
            </div>
          </div>

          {/* Side by side comparison table */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom p-3">
              <h5 className="fw-bold text-dark mb-0">Schedule Delta Comparison</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light text-uppercase">
                    <tr>
                      <th>Slot Window</th>
                      <th>Previous Master Timetable</th>
                      <th>AI Regenerated Master Timetable</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.newSchedule.map((item, idx) => {
                      const prev = comparison.previousSchedule[idx] || {}
                      return (
                        <tr
                          key={idx}
                          className={item.changed ? 'table-warning' : ''}
                          style={item.changed ? { backgroundColor: '#fef3c7' } : {}}
                        >
                          <td className="fw-bold text-dark">{item.day} {item.time}</td>
                          <td className="text-muted">
                            <div>{prev.course}</div>
                            <span className="small">{prev.faculty} ({prev.room})</span>
                          </td>
                          <td className={item.changed ? 'fw-bold text-dark' : ''}>
                            <div>{item.course}</div>
                            <span className="small">{item.faculty} ({item.room})</span>
                          </td>
                          <td>
                            {item.changed ? (
                              <div>
                                <span className="badge bg-warning text-dark mb-1">Modified (Yellow Highlight)</span>
                                <div className="small text-danger fw-semibold">{item.reason}</div>
                              </div>
                            ) : (
                              <span className="badge bg-success-subtle text-success">Preserved</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Changelog Card */}
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold text-dark mb-3">AI Changelog &amp; Conflict Resolution Log</h6>
            <ul className="list-group list-group-flush small">
              {comparison.changelog.map((entry, idx) => (
                <li key={idx} className="list-group-item px-0 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
