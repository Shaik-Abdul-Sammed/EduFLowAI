import React, { useState, useEffect } from 'react'
import {
  Bell,
  Languages,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function ParentNoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [sendingNotice, setSendingNotice] = useState(false)
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [dispatchedSample, setDispatchedSample] = useState(null)

  const fetchNotices = async (isMounted = true) => {
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
        throw new Error(`Failed to load notices (${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setNotices(data?.notices || [
          {
            id: 1,
            title: 'Mid-Term Examination Schedule Announced',
            date: '2026-11-20',
            category: 'Academic',
            importance: 'High',
            description: 'Mid-term assessments for all B.Tech branches will commence from 24th November. Practical laboratory exams will precede theory sessions.'
          },
          {
            id: 2,
            title: 'Semester Fee Payment Deadline Extension',
            date: '2026-11-28',
            category: 'Finance',
            importance: 'Urgent',
            description: 'The final date for odd-semester tuition and hostel fee clearance has been extended to 30th November 2026 without late penalty.'
          },
          {
            id: 3,
            title: 'Upcoming Parent-Teacher Meeting (PTM) Cycle',
            date: '2026-12-05',
            category: 'Institutional',
            importance: 'General',
            description: 'Mentors will meet parents regarding attendance shortages and campus placement preparedness.'
          }
        ])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading parent notices')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchNotices(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleTestMultilingualDispatch = async (e) => {
    e.preventDefault()
    setSendingNotice(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/parents/multilingual-notice'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studentName: 'Aarav Sharma',
          studentRoll: 'SS26CS01',
          guardianPhone: '+91 98765 43210',
          attendancePct: 71.5,
          language: selectedLanguage
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to dispatch localized notice')
      }

      const data = await res.json()
      setDispatchedSample(data)
      setMsg(`Multilingual notice generated in ${selectedLanguage.toUpperCase()}!`)
      setTimeout(() => setMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message || 'Error generating localized notice.')
    } finally {
      setSendingNotice(false)
    }
  }

  return (
    <RolePageTemplate role="Parent" title="Parent Notices & Statutory Circulars">
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {/* Header Strip */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }} className="d-flex align-items-center">
              <Bell className="me-2 text-primary" size={24} /> Institutional Circulars & Multilingual Broadcasts
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
              Official university notices, statutory attendance warnings, and localized vernacular dispatches
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => fetchNotices(true)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Success Alert */}
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="notices-success-alert">
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
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="notices-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status" />
            <div className="text-muted small">Loading official university circulars and notices...</div>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div>
                <strong>Failed to load notices</strong>
                <div className="small text-muted">{loadError}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => fetchNotices(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !loadError && (
          <>
            {/* Multilingual Notice Generator Card */}
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Languages size={20} className="text-primary" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Statutory Multilingual SMS & WhatsApp Broadcast Engine
                </h3>
              </div>
              <p className="text-muted small mb-3">
                UGC 2026 mandate requires attendance shortage and exam warnings to be accessible in the parent's native regional language.
              </p>

              <form onSubmit={handleTestMultilingualDispatch} className="d-flex flex-wrap align-items-end gap-3 mb-3">
                <div style={{ minWidth: 200, flex: 1 }}>
                  <label htmlFor="select-language" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Select Preferred Language
                  </label>
                  <select
                    id="select-language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="form-select form-select-sm"
                  >
                    <option value="en">English (Official Default)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={sendingNotice}
                  className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                >
                  <Send size={14} /> {sendingNotice ? 'Translating & Sending...' : 'Dispatch Sample Localized Notice'}
                </button>
              </form>

              {dispatchedSample && (
                <div className="p-3 bg-light rounded border mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-primary text-uppercase font-monospace">{dispatchedSample.languageSelected} Localized</span>
                    <small className="text-muted">{dispatchedSample.channel} &bull; {dispatchedSample.statutoryCompliance}</small>
                  </div>
                  <div className="fw-semibold text-dark mt-2" style={{ lineHeight: 1.5 }}>
                    "{dispatchedSample.messageText}"
                  </div>
                </div>
              )}
            </div>

            {/* Official Notices List */}
            <div className="d-flex flex-column gap-3">
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Institutional Circulars</h3>
              {notices.map((n) => (
                <div key={n.id} className="card border-0 shadow-sm p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-primary-subtle text-primary border me-2">{n.category}</span>
                      <span className={`badge ${n.importance === 'Urgent' ? 'bg-danger' : n.importance === 'High' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {n.importance}
                      </span>
                      <h4 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 4px 0' }}>{n.title}</h4>
                    </div>
                    <div className="d-flex align-items-center text-muted small gap-1">
                      <Calendar size={14} /> {n.date}
                    </div>
                  </div>
                  <p className="text-muted small mb-0" style={{ lineHeight: 1.5 }}>
                    {n.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
