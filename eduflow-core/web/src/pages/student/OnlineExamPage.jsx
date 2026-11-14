import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle2, EyeOff } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function OnlineExamPage() {
  const [, setExams] = useState([])
  const [activeExam, setActiveExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [violationsCount, setViolationsCount] = useState(0)
  const [warningModal, setWarningModal] = useState(false)
  const [warningText, setWarningText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [examResult, setExamResult] = useState(null)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch(`${getApiBaseURL()}/v1/exams/online`)
        if (res.ok) {
          const data = await safeJson(res)
          if (data?.exams) {
            setExams(data.exams)
            setActiveExam(data.exams[0])
          }
        }
      } catch (err) {
        console.debug(err)
      }
    }
    fetchExams()
  }, [])

  // Automated Proctoring: Detect Tab Switching or Leaving Window
  useEffect(() => {
    if (!activeExam || examResult) return

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        logViolation('tab_switch_violation', 'Navigated away or switched browser tab during exam.')
      }
    }

    const handleWindowBlur = async () => {
      logViolation('window_blur', 'Window lost focus / application switch detected.')
    }

    const logViolation = async (violationType, details) => {
      setViolationsCount((prev) => prev + 1)
      setWarningText('PROCTORING WARNING: Tab switching or leaving the active exam window is strictly forbidden! Your action has been flagged and transmitted to the Dean.')
      setWarningModal(true)

      try {
        await fetch(`${getApiBaseURL()}/v1/exams/online/${activeExam.id}/violation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_roll: 'SS26',
            student_name: 'Ananya Sharma',
            violation_type: violationType,
            details
          })
        })
      } catch (err) {
        console.debug(err)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [activeExam, examResult])

  const handleSelectOption = (qId, optIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }))
  }

  const handleSubmitExam = async () => {
    if (!activeExam) return
    setSubmitting(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/exams/online/${activeExam.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          student_roll: 'SS26',
          student_name: 'Ananya Sharma'
        })
      })
      if (res.ok) {
        const data = await safeJson(res)
        setExamResult(data.submission)
      }
    } catch (err) {
      console.debug(err)
    }
    finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate role="student" title="Proctored Online Examination Environment">
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Warning Toast / Banner if any violations occurred */}
        {violationsCount > 0 && !examResult && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, color: '#991B1B' }}>
            <AlertTriangle size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Proctoring Alerts Logged: {violationsCount} Violation(s)</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Further tab switching may result in automated paper cancellation by the Controller of Examinations.</div>
            </div>
          </div>
        )}

        {/* Active Exam Container */}
        {activeExam && !examResult && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: 4 }}>
                  {activeExam.course_code}
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 2px 0', color: '#0F172A' }}>{activeExam.title}</h2>
                <div style={{ fontSize: 12, color: '#64748B' }}>Total Marks: {activeExam.total_marks} &bull; Duration: {activeExam.duration_mins} Mins &bull; AI Proctored</div>
              </div>
              <div style={{ background: '#FEF3C7', color: '#B45309', padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
                <Clock size={16} /> 24:12 Remaining
              </div>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {activeExam.questions.map((q, idx) => (
                <div key={q.id} style={{ background: '#F8FAFC', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
                    Question {idx + 1}: {q.text}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          style={{
                            textAlign: 'left',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: isSelected ? '2px solid #2563EB' : '1px solid #CBD5E1',
                            background: isSelected ? '#EFF6FF' : '#FFFFFF',
                            color: isSelected ? '#1E40AF' : '#334155',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: 13,
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: 6 }}>{String.fromCharCode(65 + optIdx)}.</span> {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                disabled={submitting}
                onClick={handleSubmitExam}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting Answers...' : 'Finalize & Submit Exam'}
              </button>
            </div>
          </div>
        )}

        {/* Evaluated Result Card */}
        {examResult && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 36, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>Online Examination Submitted!</h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: 14 }}>{examResult.title} &bull; Roll: {examResult.student_roll}</p>

            <div style={{ display: 'inline-block', background: '#F8FAFC', padding: '16px 36px', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#64748B' }}>Score Obtained</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#2563EB' }}>{examResult.score} / {examResult.max_score}</div>
            </div>

            <div style={{ fontSize: 12, color: '#64748B' }}>
              Proctoring Audit: {violationsCount === 0 ? 'Zero security infractions detected. Integrity verified.' : `${violationsCount} tab switch event(s) recorded in audit log.`}
            </div>
          </div>
        )}

        {/* Violation Warning Modal */}
        {warningModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 480, width: '100%', padding: 28, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: '#FEE2E2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <EyeOff size={30} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991B1B', margin: '0 0 8px 0' }}>Proctoring Violation Flagged!</h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>{warningText}</p>
              <button
                onClick={() => setWarningModal(false)}
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                I Understand & Acknowledge
              </button>
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
