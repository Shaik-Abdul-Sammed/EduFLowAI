import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Award, GraduationCap, Calendar, TrendingUp, DollarSign, 
  ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react'
import { getFullApiUrl } from '../../config/apiConfig'
import { wakeUpFetch } from '../../utils/wakeUpHandler'

export default function InsightsDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    overallHealth: 82,
    domains: [
      { name: 'accreditation', displayName: 'Accreditation Officer', currentScore: 3.42, grade: 'A+', trend: 'up' },
      { name: 'student-success', displayName: 'Student Success Officer', currentScore: 82, riskLevel: 'medium', trend: 'stable' },
      { name: 'timetable', displayName: 'Timetable Officer', currentScore: 94, conflicts: 0, trend: 'up' },
      { name: 'admissions', displayName: 'Admissions Officer', currentScore: 72, yield: '72 percent', trend: 'up' },
      { name: 'finance', displayName: 'Finance Officer', currentScore: 88, defaulters: 14, trend: 'down' },
    ],
    topPriorities: [
      { domain: 'student-success', domainName: 'Student Success', issue: '48 students at high dropout risk due to attendance and backlogs', suggestedAction: 'Deploy remedial faculty mentors and tutor pods', urgency: 'HIGH' },
      { domain: 'accreditation', domainName: 'Accreditation', issue: 'Criterion 3 Research publications below benchmark A++ threshold', suggestedAction: 'Allocate seed money grants to active PhD faculty', urgency: 'HIGH' },
      { domain: 'finance', domainName: 'Finance', issue: 'GST mismatch detected in cafeteria facility lease receipts', suggestedAction: 'File GSTR-1 rectification return ahead of statutory filing', urgency: 'MEDIUM' },
    ],
  })
  const [activity, setActivity] = useState([])
  const [error, setError] = useState(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || ''
      const [dashRes, actRes] = await Promise.all([
        wakeUpFetch(getFullApiUrl('/v1/insights/dashboard'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        wakeUpFetch(getFullApiUrl('/v1/insights/activity?limit=20'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (dashRes.ok) {
        const dashJson = await dashRes.json()
        setData(dashJson)
      } else {
        throw new Error('Failed to fetch insights dashboard')
      }

      if (actRes.ok) {
        const actJson = await actRes.json()
        setActivity(actJson.activity || [])
      }
    } catch (err) {
      setError(err.message || 'Error loading insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || ''
        const [dashRes, actRes] = await Promise.all([
          wakeUpFetch(getFullApiUrl('/v1/insights/dashboard'), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          wakeUpFetch(getFullApiUrl('/v1/insights/activity?limit=20'), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (dashRes.ok && isMounted) {
          const dashJson = await dashRes.json()
          setData(dashJson)
        }
        if (actRes.ok && isMounted) {
          const actJson = await actRes.json()
          setActivity(actJson.activity || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error loading insights')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  const getDomainIcon = (name) => {
    switch (name) {
      case 'accreditation':
        return <Award className="w-5 h-5 text-amber-500" />
      case 'student-success':
        return <GraduationCap className="w-5 h-5 text-blue-500" />
      case 'timetable':
        return <Calendar className="w-5 h-5 text-indigo-500" />
      case 'admissions':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />
      case 'finance':
        return <DollarSign className="w-5 h-5 text-purple-500" />
      default:
        return <Award className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="h4 fw-bold mb-1 d-flex align-items-center gap-2">
            <span>🧠</span> Multi-Officer AI Insights
          </h2>
          <p className="text-muted small mb-0">
            Unified cognitive analysis layer monitoring NAAC, Retention, Timetables, Admissions, and Finance.
          </p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
          onClick={fetchInsights}
          disabled={loading}
          data-testid="refresh-btn"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'spin' : ''}`} />
          <span>Refresh Insights</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-warning py-2 mb-4 d-flex align-items-center gap-2" role="alert">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="small">{error} (Showing cached operational metrics)</span>
        </div>
      )}

      {/* Domain Health Grid */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3">Domain Health Grid</h5>
        <div className="row g-3" data-testid="domain-health-grid">
          {(data?.domains || []).map((domain) => (
            <div key={domain.name} className="col-12 col-sm-6 col-lg" data-testid={`domain-card-${domain.name}`}>
              <div className="card h-100 shadow-sm border-0 bg-body-tertiary">
                <div className="card-body d-flex flex-column justify-content-between p-3">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="p-2 rounded-circle bg-white shadow-sm">
                        {getDomainIcon(domain.name)}
                      </div>
                      <span className={`badge ${domain.trend === 'up' ? 'bg-success' : domain.trend === 'down' ? 'bg-danger' : 'bg-secondary'} d-flex align-items-center gap-1`}>
                        {domain.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : domain.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {domain.trend || 'stable'}
                      </span>
                    </div>
                    <h6 className="fw-bold mb-1 text-truncate">{domain.displayName || domain.name}</h6>
                    <div className="d-flex align-items-baseline gap-2 mb-2">
                      <span className="h4 fw-bold mb-0 text-primary">{domain.currentScore}</span>
                      {domain.grade && <span className="badge bg-primary-subtle text-primary fw-semibold">{domain.grade}</span>}
                      {domain.riskLevel && <span className="badge bg-warning-subtle text-warning fw-semibold">{domain.riskLevel} Risk</span>}
                      {domain.yield && <span className="small text-muted">{domain.yield}</span>}
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-1"
                    onClick={() => navigate(`/admin-dashboard/insights/${domain.name}`)}
                    data-testid={`open-domain-${domain.name}`}
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row: Overall Health Score & Top Priorities */}
      <div className="row g-4 mb-4">
        {/* Overall Health Score Gauge */}
        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm border-0 text-center p-3">
            <h5 className="fw-bold mb-3">Overall Health Score</h5>
            <div className="my-auto py-2">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle border border-5 border-primary shadow-sm"
                style={{ width: '130px', height: '130px' }}
                data-testid="health-gauge"
              >
                <div className="text-center">
                  <span className="display-5 fw-bold text-primary">{data?.overallHealth || 82}</span>
                  <div className="text-muted small fw-semibold">/ 100</div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-muted small fw-medium">
              <CheckCircle className="w-4 h-4 text-success d-inline me-1" />
              <span>3 priorities need attention</span>
            </div>
          </div>
        </div>

        {/* Top Priorities */}
        <div className="col-12 col-md-8">
          <div className="card h-100 shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3">Top Priorities</h5>
            <div className="row g-3" data-testid="top-priorities-list">
              {(data?.topPriorities || []).map((priority, index) => (
                <div key={index} className="col-12" data-testid={`priority-card-${index}`}>
                  <div className="p-3 rounded border border-warning-subtle bg-warning-subtle bg-opacity-25 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-warning text-dark text-capitalize">{priority.domainName || priority.domain}</span>
                        {priority.urgency && <span className="badge bg-danger">{priority.urgency}</span>}
                      </div>
                      <div className="fw-semibold small text-dark mb-1">{priority.issue}</div>
                      <div className="text-muted small"><strong>Action:</strong> {priority.suggestedAction}</div>
                    </div>
                    <button
                      className="btn btn-warning btn-sm text-nowrap fw-semibold mt-2 mt-sm-0 align-self-start align-self-sm-center"
                      onClick={() => navigate(`/admin-dashboard/insights/${priority.domain}`)}
                      data-testid={`fix-priority-${index}`}
                    >
                      Fix This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card shadow-sm border-0 p-3">
        <h5 className="fw-bold mb-3">Recent Activity</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" data-testid="activity-table">
            <thead className="table-light small">
              <tr>
                <th scope="col">Domain</th>
                <th scope="col">Insight Type</th>
                <th scope="col">Summary</th>
                <th scope="col">Timestamp</th>
              </tr>
            </thead>
            <tbody className="small">
              {activity.length > 0 ? (
                activity.slice(0, 20).map((act, idx) => (
                  <tr key={act.id || idx}>
                    <td className="fw-semibold text-capitalize">
                      <span className="badge bg-light text-dark border me-1">{act.officer_domain}</span>
                    </td>
                    <td><span className="badge bg-info-subtle text-info text-uppercase">{act.insight_type}</span></td>
                    <td className="text-truncate" style={{ maxWidth: '350px' }}>
                      {act.output_data?.summary || act.input_text || 'Insight generated'}
                    </td>
                    <td className="text-muted">
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">
                    No recent activity runs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
