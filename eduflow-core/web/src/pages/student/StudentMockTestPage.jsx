import { useState, useEffect } from 'react'
import { Award, Clock, RotateCcw } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function StudentMockTestPage() {
  const [, setTests] = useState([])
  const [activeTest, setActiveTest] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`${getApiBaseURL()}/v1/placement/mock-tests`)
        if (res.ok) {
          const data = await safeJson(res)
          if (data?.mockTests) {
            setTests(data.mockTests)
            setActiveTest(data.mockTests[0])
          }
        }
      } catch (err) {
        console.debug(err)
      }
    }
    fetchTests()
  }, [])

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }))
  }

  const handleSubmit = async () => {
    if (!activeTest) return
    setSubmitting(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/placement/mock-tests/${activeTest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: selectedAnswers,
          student_roll: 'SS26',
          student_name: 'Ananya Sharma'
        })
      })
      if (res.ok) {
        const data = await safeJson(res)
        setResult(data)
      }
    } catch (err) {
      console.debug(err)
    }
    finally {
      setSubmitting(false)
    }
  }

  const handleRetake = () => {
    setSelectedAnswers({})
    setResult(null)
  }

  return (
    <RolePageTemplate role="student" title="Placement Aptitude Readiness & Mock Assessment">
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {activeTest && !result && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: 4 }}>
                  {activeTest.category}
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 2px 0', color: '#0F172A' }}>{activeTest.title}</h2>
                <div style={{ fontSize: 12, color: '#64748B' }}>5 Questions &bull; 20 Mins &bull; Automated Scoring & Placement Feedback</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                <Clock size={16} color="#2563EB" /> 18:45 Remaining
              </div>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {activeTest.questions.map((q, qIndex) => (
                <div key={q.id} style={{ background: '#F8FAFC', padding: 18, borderRadius: 12, border: '1px solid #EDF2F7' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
                    Question {qIndex + 1}: {q.text}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx
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
                disabled={submitting || Object.keys(selectedAnswers).length < activeTest.questions.length}
                onClick={handleSubmit}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: Object.keys(selectedAnswers).length < activeTest.questions.length ? 'not-allowed' : 'pointer',
                  opacity: Object.keys(selectedAnswers).length < activeTest.questions.length ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {submitting ? 'Evaluating Assessment...' : 'Submit & Calculate Score'}
              </button>
            </div>
          </div>
        )}

        {/* Test Result Scorecard */}
        {result && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 36, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Award size={40} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: '#0F172A' }}>Aptitude Assessment Evaluated!</h2>
            <p style={{ margin: '0 0 24px 0', color: '#64748B', fontSize: 14 }}>{result.feedback}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{ background: '#F8FAFC', padding: '16px 28px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, color: '#64748B' }}>Score Scored</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#2563EB' }}>{result.submission.score} / {result.submission.max_score}</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px 28px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, color: '#64748B' }}>Accuracy Percentage</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#16A34A' }}>{result.submission.percentage}%</div>
              </div>
            </div>

            <button
              onClick={handleRetake}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#1E293B',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={15} /> Retake Aptitude Diagnostic
            </button>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
