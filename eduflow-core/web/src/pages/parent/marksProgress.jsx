import React, { useState, useEffect } from 'react'
import {
  Award,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Calendar
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function ParentMarksProgressPage() {
  const [marksData, setMarksData] = useState([])
  const [studentSummary, setStudentSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState('Sem 5')

  const fetchMarks = async (isMounted = true) => {
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
        throw new Error(`Failed to load marks and academic progress (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setStudentSummary(data?.studentSummary || {
          studentName: 'Aarav Sharma',
          studentRoll: 'SS26CS01',
          branch: 'Computer Science & Engineering',
          cgpa: 8.72,
          currentSemester: 'Sem 5',
          completedCredits: 112
        })
        setMarksData(data?.subjectMarks || [
          {
            id: 1,
            subjectCode: 'CS501',
            subjectName: 'Design & Analysis of Algorithms',
            internalMarks: 27,
            internalMax: 30,
            midTermMarks: 36,
            midTermMax: 40,
            practicalMarks: 28,
            practicalMax: 30,
            totalMarks: 91,
            grade: 'A+',
            semester: 'Sem 5'
          },
          {
            id: 2,
            subjectCode: 'CS502',
            subjectName: 'Database Management Systems',
            internalMarks: 26,
            internalMax: 30,
            midTermMarks: 34,
            midTermMax: 40,
            practicalMarks: 27,
            practicalMax: 30,
            totalMarks: 87,
            grade: 'A',
            semester: 'Sem 5'
          },
          {
            id: 3,
            subjectCode: 'CS503',
            subjectName: 'Computer Networks & Security',
            internalMarks: 25,
            internalMax: 30,
            midTermMarks: 32,
            midTermMax: 40,
            practicalMarks: 26,
            practicalMax: 30,
            totalMarks: 83,
            grade: 'A',
            semester: 'Sem 5'
          },
          {
            id: 4,
            subjectCode: 'CS504',
            subjectName: 'Theory of Computation',
            internalMarks: 24,
            internalMax: 30,
            midTermMarks: 31,
            midTermMax: 40,
            practicalMarks: 25,
            practicalMax: 30,
            totalMarks: 80,
            grade: 'A',
            semester: 'Sem 5'
          }
        ])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading marks and academic progress')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchMarks(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const filteredMarks = marksData.filter((m) => !m.semester || m.semester === selectedSemester)

  return (
    <RolePageTemplate role="Parent" title="Student Marks & Academic Trajectory">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }} className="d-flex align-items-center">
              <BarChart3 className="me-2 text-primary" size={24} /> Subject-Wise Grades & Examination Progress
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Review internal assessments, laboratory evaluations, and semester CGPA progression
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => fetchMarks(true)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="marks-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading semester marks and grade reports...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load academic marks</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchMarks(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !loadError && (
          <>
            {/* Student Summary KPI Cards */}
            {studentSummary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="card border-0 shadow-sm p-3">
                  <span className="text-muted small">Cumulative GPA (CGPA)</span>
                  <div className="fs-3 fw-bold text-primary mt-1">{studentSummary.cgpa} / 10.0</div>
                  <span className="badge bg-success-subtle text-success border mt-2 align-self-start">First Class with Distinction</span>
                </div>

                <div className="card border-0 shadow-sm p-3">
                  <span className="text-muted small">Registered Student</span>
                  <div className="fs-5 fw-bold text-dark mt-1">{studentSummary.studentName}</div>
                  <span className="text-muted small">Roll: {studentSummary.studentRoll}</span>
                </div>

                <div className="card border-0 shadow-sm p-3">
                  <span className="text-muted small">Branch & Department</span>
                  <div className="fs-6 fw-bold text-dark mt-1">{studentSummary.branch}</div>
                  <span className="text-muted small">Completed: {studentSummary.completedCredits} Credits</span>
                </div>

                <div className="card border-0 shadow-sm p-3">
                  <span className="text-muted small">Active Term</span>
                  <div className="fs-5 fw-bold text-dark mt-1">{studentSummary.currentSemester} (2026)</div>
                  <span className="text-muted small">Regular Enrollment</span>
                </div>
              </div>
            )}

            {/* Semester Filter */}
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted me-1">Semester:</span>
              {['Sem 3', 'Sem 4', 'Sem 5'].map((sem) => (
                <button
                  key={sem}
                  type="button"
                  className={`btn btn-sm ${selectedSemester === sem ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedSemester(sem)}
                >
                  {sem}
                </button>
              ))}
            </div>

            {/* Marks Table */}
            <div className="card border-0 shadow-sm p-0 overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ background: 'var(--surface-bg, #F8FAFC)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Course Code & Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Internal (30)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Mid-Term (40)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Practicals (30)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total (100)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarks.map((m) => (
                      <tr key={m.id}>
                        <td style={{ padding: '12px 16px' }}>
                          <div className="fw-semibold text-primary">{m.subjectCode}</div>
                          <div className="text-dark small">{m.subjectName}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className="fw-semibold">{m.internalMarks}</span> / {m.internalMax}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className="fw-semibold">{m.midTermMarks}</span> / {m.midTermMax}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className="fw-semibold">{m.practicalMarks}</span> / {m.practicalMax}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className="fw-bold text-success fs-6">{m.totalMarks}</span> / 100
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className="badge bg-success px-3 py-1 font-monospace">{m.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
