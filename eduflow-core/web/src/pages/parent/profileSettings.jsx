import React, { useState, useEffect } from 'react'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Bell,
  Globe,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserCheck
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function ParentProfileSettings() {
  const [profile, setProfile] = useState(null)
  const [wardInfo, setWardInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [address, setAddress] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [whatsappAlerts, setWhatsappAlerts] = useState(true)
  const [emergencyDispatch, setEmergencyDispatch] = useState(true)

  const fetchProfile = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      // Fetch user profile and parent overview in parallel
      const [profileRes, overviewRes] = await Promise.allSettled([
        fetch(getFullApiUrl('/user/profile'), { headers }),
        fetch(getFullApiUrl('/v1/parent/overview'), { headers })
      ])

      if (profileRes.status === 'rejected') {
        throw new Error(profileRes.reason?.message || 'Failed to connect to profile server')
      }
      if (profileRes.status === 'fulfilled' && !profileRes.value.ok) {
        throw new Error(`Profile request failed with HTTP ${profileRes.value.status}`)
      }

      let userData = null
      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        const pJson = await profileRes.value.json()
        userData = pJson?.user
      }

      let overviewData = null
      if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
        overviewData = await overviewRes.value.json()
      }

      if (isMounted) {
        const u = userData || {
          first_name: 'Suresh',
          last_name: 'Sharma',
          email: 'suresh.sharma@parent.edu',
          phone: '+91 98765 43210',
          address: 'Plot 42, Jubilee Hills Road No. 10, Hyderabad, Telangana 500033',
          preferences: {
            preferredLanguage: 'en',
            emailNotifications: true,
            smsAlerts: true,
            whatsappAlerts: true,
            emergencyDispatch: true,
            emergencyPhone: '+91 94401 23456'
          }
        }

        setProfile(u)
        setFirstName(u.first_name || '')
        setLastName(u.last_name || '')
        setPhone(u.phone || '+91 98765 43210')
        setAddress(u.address || '')

        const prefs = u.preferences || {}
        setPreferredLanguage(prefs.preferredLanguage || 'en')
        setEmailNotifications(prefs.emailNotifications !== false)
        setSmsAlerts(prefs.smsAlerts !== false)
        setWhatsappAlerts(prefs.whatsappAlerts !== false)
        setEmergencyDispatch(prefs.emergencyDispatch !== false)
        setEmergencyPhone(prefs.emergencyPhone || '+91 94401 23456')

        if (overviewData?.child) {
          setWardInfo({
            name: overviewData.child.name,
            roll: overviewData.child.roll,
            branch: overviewData.child.branch,
            semester: overviewData.child.semester,
            mentor: overviewData.mentor
          })
        }
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Unable to load profile settings.')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchProfile(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/user/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address,
          preferences: {
            preferredLanguage,
            emailNotifications,
            smsAlerts,
            whatsappAlerts,
            emergencyDispatch,
            emergencyPhone
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || `Update failed with HTTP ${res.status}`)
      }

      setSuccessMsg('Guardian contact details & notification preferences updated successfully.')
      if (data?.user) {
        setProfile(data.user)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <RolePageTemplate
      role="Parent"
      title="Guardian Profile & Notification Settings"
      description="Manage statutory contact credentials, multilingual notice language preferences, and emergency dispatches."
    >
      <div className="space-y-6">
        {/* Status Alerts */}
        {successMsg && (
          <div
            data-testid="profile-success-alert"
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
            data-testid="profile-error-alert"
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
          <div data-testid="profile-loading" className="space-y-4 animate-pulse">
            <div className="h-28 bg-slate-200 rounded-2xl"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
          </div>
        ) : loadError ? (
          /* Error State */
          <div
            data-testid="profile-error"
            className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-4"
          >
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Unable to Load Guardian Profile</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">{loadError}</p>
            <button
              onClick={() => fetchProfile(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ward Verification Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-sm">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Linked Student Ward
                  </div>
                  <div className="text-base font-black text-slate-900">
                    {wardInfo?.name || 'Ananya Sharma'} ({wardInfo?.roll || 'SS26'})
                  </div>
                  <div className="text-xs text-slate-600">
                    {wardInfo?.branch || 'Computer Science (B.Tech)'} • {wardInfo?.semester || 'Semester 5'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-indigo-100 shadow-xs">
                <span className="font-semibold text-slate-700">Faculty Mentor:</span>{' '}
                {wardInfo?.mentor?.name || 'Dr. Ramesh Kumar'} ({wardInfo?.mentor?.phone || '+91 90101 50809'})
              </div>
            </div>

            {/* Guardian Contact Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base">Guardian Identity & Contact Credentials</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Primary Mobile (WhatsApp Enabled)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Secondary / Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Permanent Residential Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Language & Dispatch Preferences */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base">Language & Dispatch Channels</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Native Language for Academic Notices & WhatsApp Circulars
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="en">English (Official Campus Circulars)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  All automated WhatsApp updates and leave approvals will be translated automatically to this language.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      WhatsApp Daily Attendance & Gate In/Out Alerts
                    </span>
                    <p className="text-xs text-slate-500">
                      Receive automated instant notification when your ward checks into lecture or exits hostel gate.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      SMS Examination & Grade Card Broadcasts
                    </span>
                    <p className="text-xs text-slate-500">
                      Receive mid-term and semester final results via SMS gateway.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emergencyDispatch}
                    onChange={(e) => setEmergencyDispatch(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      Infirmary Emergency Medical Priority Callouts
                    </span>
                    <p className="text-xs text-slate-500">
                      Direct automated broadcast to parent phone in case of health clinic consultation.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                data-testid="save-profile-btn"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile Preferences
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </RolePageTemplate>
  )
}
