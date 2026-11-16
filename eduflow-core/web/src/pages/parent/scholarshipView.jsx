import React, { useState, useEffect } from 'react'
import {
  Award,
  DollarSign,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Plus,
  HelpCircle,
  Building,
  GraduationCap
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function ScholarshipView() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [applying, setApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')

  // Application form fields
  const [formScheme, setFormScheme] = useState('Merit-Cum-Means Tuition Fee Concession')
  const [formCategory, setFormCategory] = useState('Merit')
  const [formAmount, setFormAmount] = useState('25000')
  const [formIncome, setFormIncome] = useState('250000')
  const [formGpa, setFormGpa] = useState('9.0')
  const [formReason, setFormReason] = useState('')

  const fetchScholarships = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/scholarships'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load scholarship schemes (HTTP ${res.status})`)
      }

      const data = await res.json()
      if (isMounted) {
        setScholarships(Array.isArray(data?.scholarships) ? data.scholarships : [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Unable to fetch scholarship data')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchScholarships(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleApply = async (e) => {
    e.preventDefault()
    setApplying(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/scholarships/apply'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_roll: 'SS26',
          student_name: 'Ananya Sharma',
          scholarship_name: formScheme,
          category: formCategory,
          amount: Number(formAmount) || 25000,
          gpa: Number(formGpa) || 9.0,
          annual_family_income: Number(formIncome) || 250000,
          reason: formReason
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || `Submission failed with HTTP ${res.status}`)
      }

      setSuccessMsg(`Scholarship application for "${formScheme}" submitted successfully for bursary verification.`)
      setShowApplyModal(false)
      setFormReason('')
      await fetchScholarships(true)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit scholarship grant application.')
    } finally {
      setApplying(false)
    }
  }

  // Filter scholarships
  const filteredList = scholarships.filter((s) => {
    if (filterCategory === 'ALL') return true
    return (s.category || '').toUpperCase().includes(filterCategory.toUpperCase())
  })

  // Metrics
  const totalVerifiedAmount = scholarships
    .filter((s) => (s.status || '').toUpperCase() === 'VERIFIED')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  const activeApplicationsCount = scholarships.filter((s) =>
    ['APPLIED', 'PENDING', 'UNDER_REVIEW'].includes((s.status || '').toUpperCase())
  ).length

  return (
    <RolePageTemplate
      role="Parent"
      title="Scholarship & Fee Bursary View"
      description="Track approved scholarship grants, tuition fee waivers, and state financial assistance schemes."
    >
      <div className="space-y-6">
        {/* Alerts */}
        {successMsg && (
          <div
            data-testid="scholarship-success-alert"
            className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-sm text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg('')}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ×
            </button>
          </div>
        )}

        {errorMsg && (
          <div
            data-testid="scholarship-error-alert"
            className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl shadow-sm text-sm"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg('')}
              className="text-rose-700 hover:text-rose-900 font-bold ml-4"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div data-testid="scholarship-loading" className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
          </div>
        ) : loadError ? (
          /* Error State */
          <div
            data-testid="scholarship-error"
            className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-4"
          >
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Unable to Load Scholarship Records</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">{loadError}</p>
            <button
              onClick={() => fetchScholarships(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <>
            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Verified Aid
                  </span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-3">
                  ₹{totalVerifiedAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Credited directly toward annual tuition
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Active Applications
                  </span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-3">
                  {activeApplicationsCount} Pending
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Under Dean / Bursary office verification
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Institutional Aid Category
                  </span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-3">
                  Merit & Freeship
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  NAAC Criterion 5.1.1 compliant
                </p>
              </div>
            </div>

            {/* Header with Action & Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-700">Filter Category:</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Schemes</option>
                  <option value="MERIT">Merit Scholarships</option>
                  <option value="POST-MATRIC">Post-Matric / State Grants</option>
                  <option value="EWS">Means / EWS Assistance</option>
                </select>
              </div>

              <button
                onClick={() => setShowApplyModal(!showApplyModal)}
                data-testid="open-scholarship-modal-btn"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Apply for Fee Waiver / Bursary
              </button>
            </div>

            {/* Apply Bursary Form Modal / Collapsible */}
            {showApplyModal && (
              <div
                data-testid="scholarship-form-card"
                className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <GraduationCap className="w-5 h-5" />
                    <h3 className="font-bold text-slate-800 text-base">
                      Apply for Student Scholarship / Hardship Bursary
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Scheme / Scholarship Title
                    </label>
                    <select
                      value={formScheme}
                      onChange={(e) => setFormScheme(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    >
                      <option value="Merit-Cum-Means Tuition Fee Concession">
                        Merit-Cum-Means Tuition Fee Concession
                      </option>
                      <option value="Pragati Merit Scholarship for Women in STEM">
                        Pragati Merit Scholarship for Women in STEM
                      </option>
                      <option value="Post-Matric State Financial Grant">
                        Post-Matric State Financial Grant
                      </option>
                      <option value="Emergency Family Hardship Assistance Bursary">
                        Emergency Family Hardship Assistance Bursary
                      </option>
                      <option value="Alumni Endowment Scholarship">
                        Alumni Endowment Scholarship
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Scheme Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Merit">Academic Merit</option>
                      <option value="Means / EWS">Means / EWS Financial Need</option>
                      <option value="Post-Matric State">Post-Matric Welfare Grant</option>
                      <option value="Special Hardship">Special Hardship Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Concession Amount Requested (₹)
                    </label>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Annual Family Income (INR)
                    </label>
                    <input
                      type="number"
                      value={formIncome}
                      onChange={(e) => setFormIncome(e.target.value)}
                      placeholder="e.g. 250000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Current Cumulative GPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formGpa}
                      onChange={(e) => setFormGpa(e.target.value)}
                      placeholder="e.g. 9.0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Reason / Justification
                    </label>
                    <input
                      type="text"
                      value={formReason}
                      onChange={(e) => setFormReason(e.target.value)}
                      placeholder="Brief statement regarding financial need or academic honors"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      data-testid="submit-scholarship-btn"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                      {applying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Submitting Application...
                        </>
                      ) : (
                        'Submit Scholarship Application'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Scholarships List */}
            {filteredList.length === 0 ? (
              <div
                data-testid="scholarship-empty"
                className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3"
              >
                <Building className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No Scholarships Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No grants or scholarships found matching your filter. Use the button above to apply for institutional fee concessions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredList.map((item) => {
                  const isVerified = (item.status || '').toUpperCase() === 'VERIFIED'
                  return (
                    <div
                      key={item.id}
                      data-testid="scholarship-card"
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-300 transition space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 mb-1.5">
                            {item.category || 'Merit Aid'}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {item.scholarship_name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Applicant: {item.student_name || 'Ananya Sharma'} ({item.student_roll || 'SS26'})
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-slate-900">
                            ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 mt-1 text-[11px] font-bold rounded-full ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status || 'APPLIED'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block">Family Income:</span>
                          <span className="font-semibold">
                            ₹{Number(item.annual_family_income || 0).toLocaleString('en-IN')} / yr
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Beneficiary CGPA:</span>
                          <span className="font-semibold">{item.gpa || '9.0'} CGPA</span>
                        </div>
                        {item.invoice_deduction_id && (
                          <div className="col-span-2 bg-slate-50 p-2 rounded-lg text-[11px] text-slate-700 flex items-center justify-between">
                            <span>Deduction Ref: <strong>{item.invoice_deduction_id}</strong></span>
                            <span className="text-emerald-700 font-semibold">Credited to Tuition</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
