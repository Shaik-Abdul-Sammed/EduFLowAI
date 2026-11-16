import { useState, useEffect } from 'react'
import { Award, Clock, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function StudentMockTestPage() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [activeTest, setActiveTest] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchTests = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/placement/mock-tests'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load placement mock assessments (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        const mockList = data?.mockTests || []
        setTests(mockList)
        if (mockList.length > 0) {
          setActiveTest(mockList[0])
        }
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading mock tests')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchTests(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }))
  }

  const handleSubmit = async () => {
    if (!activeTest) return
    setSubmitting(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl(`/v1/placement/mock-tests/${activeTest.id}/submit`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          answers: selectedAnswers,
          student_roll: 'SS26',
          student_name: 'Ananya Sharma'
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to submit assessment')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setErrorMsg(err.message || 'Error submitting mock test.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetake = () => {
    setSelectedAnswers({})
    setResult(null)
    setErrorMsg('')
  }

  return (
    <RolePageTemplate role="student" title="Placement Aptitude Readiness & Mock Assessment">
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }}>
              Corporate Aptitude Diagnostic Engine
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Practice real placement screening tests: Quantitative Aptitude, Logical Reasoning & Core CS
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => fetchTests(true)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0">
            <AlertCircle size={18} className="me-2 flex-shrink-0" />
            <div className="small fw-semibold">{errorMsg}</div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="mocktest-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading aptitude diagnostic assessment...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load assessment</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchTests(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !loadError && tests.length === 0 && (
          <div className="card border-0 shadow-sm p-5 text-center text-muted">
            <Clock size={36} className="mx-auto text-secondary mb-2 opacity-50" />
            <h4 style={{ fontSize: 16, fontWeight: 600 }}>No mock assessments available</h4>
            <p className="small mb-0">Check back later for newly announced campus preparation tests.</p>
          </div>
        )}

        {/* Active Test Questions Container */}
        {!loading && !loadError && activeTest && !result && (
          <div className="card border-0 shadow-sm p-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(37, 99, 235, 0.12)', color: '#3B82F6', padding: '3px 8px', borderRadius: 4 }}>
                  {activeTest.category}
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 2px 0' }}>{activeTest.title}</h2>
                <div style={{ fontSize: 12, color: '#64748B' }}>{activeTest.questions?.length || 5} Questions &bull; 20 Mins &bull; Automated Scoring & Placement Feedback</div>
              </div>
              <div style={{ background: 'var(--surface-bg, #F8FAFC)', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color, #E2E8F0)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                <Clock size={16} color="#2563EB" /> 18:45 Remaining
              </div>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {activeTest.questions.map((q, qIndex) => (
                <div key={q.id} style={{ background: 'var(--surface-bg, #F8FAFC)', padding: 18, borderRadius: 12, border: '1px solid var(--border-color, #EDF2F7)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
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
                            border: isSelected ? '2px solid #2563EB' : '1px solid var(--border-color, #CBD5E1)',
                            background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'var(--card-bg, #FFFFFF)',
                            color: isSelected ? '#3B82F6' : 'inherit',
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
                className="btn btn-primary btn-sm px-4 py-2"
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  opacity: Object.keys(selectedAnswers).length < activeTest.questions.length ? 0.6 : 1
                }}
              >
                {submitting ? 'Evaluating Assessment...' : 'Submit & Calculate Score'}
              </button>
            </div>
          </div>
        )}

        {/* Test Result Scorecard */}
        {result && (
          <div data-testid="mocktest-result" className="card border-0 shadow-sm p-5 text-center">
            <div style={{ width: 72, height: 72, borderRadius: 36, background: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Award size={40} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0' }}>Aptitude Assessment Evaluated!</h2>
            <p style={{ margin: '0 0 24px 0', color: '#64748B', fontSize: 14 }}>{result.feedback}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--surface-bg, #F8FAFC)', padding: '16px 28px', borderRadius: 12, border: '1px solid var(--border-color, #E2E8F0)' }}>
                <div style={{ fontSize: 12, color: '#64748B' }}>Score Scored</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#2563EB' }}>{result.submission.score} / {result.submission.max_score}</div>
              </div>
              <div style={{ background: 'var(--surface-bg, #F8FAFC)', padding: '16px 28px', borderRadius: 12, border: '1px solid var(--border-color, #E2E8F0)' }}>
                <div style={{ fontSize: 12, color: '#64748B' }}>Accuracy Percentage</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#16A34A' }}>{result.submission.percentage}%</div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleRetake}
                className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2"
              >
                <RotateCcw size={15} /> Retake Aptitude Diagnostic
              </button>
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
