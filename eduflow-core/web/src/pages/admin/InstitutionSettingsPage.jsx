import React, { useState, useEffect } from 'react'
import {
  Settings,
  Building,
  Phone,
  Calendar,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Download,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function InstitutionSettingsPage() {
  const [settings, setSettings] = useState({
    branding: {
      name: 'Sri Siddhartha Institute of Technology',
      logoUrl: '/logo.png',
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF',
      favicon: '/favicon.ico'
    },
    contact: {
      address: 'Maralur, Tumakuru, Karnataka 572105',
      phone: '+91 816 220 1073',
      email: 'info@ssit.edu.in',
      website: 'https://ssit.edu.in'
    },
    academic: {
      academicYear: '2026-2027',
      semesterType: 'ODD',
      workingDaysPerWeek: 6,
      holidaysState: 'KA'
    },
    localization: {
      primaryLanguage: 'English',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY'
    },
    notification: {
      email: true,
      whatsapp: false,
      inApp: true
    },
    security: {
      sessionTimeoutMinutes: 30,
      require2FA: false,
      ipWhitelist: ''
    },
    billing: {
      gstNumber: '29AAAAA0000A1Z5',
      billingAddress: 'Maralur, Tumakuru, Karnataka',
      billingEmail: 'accounts@ssit.edu.in',
      upiId: 'ssit@icici'
    }
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/institution/settings')
      const data = await res.json()
      if (data.settings) {
        setSettings({
          ...data.settings,
          security: {
            ...data.settings.security,
            ipWhitelist: Array.isArray(data.settings.security?.ipWhitelist)
              ? data.settings.security.ipWhitelist.join(', ')
              : data.settings.security?.ipWhitelist || ''
          }
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const payload = {
        ...settings,
        security: {
          ...settings.security,
          ipWhitelist: settings.security.ipWhitelist
            ? settings.security.ipWhitelist.split(',').map(s => s.trim()).filter(Boolean)
            : []
        }
      }

      const res = await fetch('/api/v1/institution/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to update settings')
      setSuccessMsg('Institution settings saved successfully!')
    } catch (err) {
      setErrorMsg(err.message || 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '960px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold d-flex align-items-center">
            <Settings className="me-2 text-primary" /> Institution Configuration & Settings
          </h2>
          <p className="text-muted mb-0">Manage institutional profile, academic calendars, notifications, and security policies.</p>
        </div>
        <a
          href="/api/v1/institution/export"
          className="btn btn-outline-success d-flex align-items-center"
          download="institution-data-export.zip"
        >
          <Download size={16} className="me-1" /> Download My Data (ZIP)
        </a>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center mb-3">
          <CheckCircle size={18} className="me-2" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center mb-3">
          <AlertCircle size={18} className="me-2" /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Section 1: Branding */}
        <div className="card shadow-sm border-0 p-4 bg-white mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <Building className="me-2 text-primary" /> 1. Branding & Identity
          </h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Institution Name</label>
              <input
                type="text"
                className="form-control"
                value={settings.branding.name}
                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, name: e.target.value } })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Primary Color</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={settings.branding.primaryColor}
                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Secondary Color</label>
              <input
                type="color"
                className="form-control form-control-color w-100"
                value={settings.branding.secondaryColor}
                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, secondaryColor: e.target.value } })}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact */}
        <div className="card shadow-sm border-0 p-4 bg-white mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <Phone className="me-2 text-primary" /> 2. Official Contact Information
          </h5>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label fw-semibold">Campus Address</label>
              <input
                type="text"
                className="form-control"
                value={settings.contact.address}
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, address: e.target.value } })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={settings.contact.phone}
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Administrative Email</label>
              <input
                type="email"
                className="form-control"
                value={settings.contact.email}
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Website URL</label>
              <input
                type="text"
                className="form-control"
                value={settings.contact.website}
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, website: e.target.value } })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Academic */}
        <div className="card shadow-sm border-0 p-4 bg-white mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <Calendar className="me-2 text-primary" /> 3. Academic Year & Calendar Sync
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Academic Year</label>
              <input
                type="text"
                className="form-control"
                value={settings.academic.academicYear}
                onChange={(e) => setSettings({ ...settings, academic: { ...settings.academic, academicYear: e.target.value } })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Current Semester</label>
              <select
                className="form-select"
                value={settings.academic.semesterType}
                onChange={(e) => setSettings({ ...settings, academic: { ...settings.academic, semesterType: e.target.value } })}
              >
                <option value="ODD">ODD Semester</option>
                <option value="EVEN">EVEN Semester</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Working Days / Week</label>
              <input
                type="number"
                min="5"
                max="6"
                className="form-control"
                value={settings.academic.workingDaysPerWeek}
                onChange={(e) => setSettings({ ...settings, academic: { ...settings.academic, workingDaysPerWeek: Number(e.target.value) } })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Holidays State</label>
              <select
                className="form-select"
                value={settings.academic.holidaysState}
                onChange={(e) => setSettings({ ...settings, academic: { ...settings.academic, holidaysState: e.target.value } })}
              >
                <option value="KA">Karnataka (KA)</option>
                <option value="TS">Telangana (TS)</option>
                <option value="AP">Andhra Pradesh (AP)</option>
                <option value="TN">Tamil Nadu (TN)</option>
                <option value="MH">Maharashtra (MH)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Security & Session Timeout */}
        <div className="card shadow-sm border-0 p-4 bg-white mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <Shield className="me-2 text-primary" /> 4. Security & Access Safeguards
          </h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Session Inactivity Timeout (Minutes)</label>
              <select
                className="form-select"
                value={settings.security.sessionTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, security: { ...settings.security, sessionTimeoutMinutes: Number(e.target.value) } })}
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes (Recommended)</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Campus IP Whitelist (Optional, comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 192.168.1.1, 10.0.0.0/24 (leave blank for open access)"
                value={settings.security.ipWhitelist}
                onChange={(e) => setSettings({ ...settings, security: { ...settings.security, ipWhitelist: e.target.value } })}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Billing & Direct UPI */}
        <div className="card shadow-sm border-0 p-4 bg-white mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <CreditCard className="me-2 text-primary" /> 5. Billing & Zero-Gateway UPI Remittance
          </h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Institutional GSTIN</label>
              <input
                type="text"
                className="form-control"
                value={settings.billing.gstNumber}
                onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, gstNumber: e.target.value } })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Official UPI ID (VPA)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. college@icici"
                value={settings.billing.upiId}
                onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, upiId: e.target.value } })}
              />
              <small className="text-muted">Generated invoices embed this UPI ID for direct payment.</small>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Accounts / Billing Email</label>
              <input
                type="email"
                className="form-control"
                value={settings.billing.billingEmail}
                onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, billingEmail: e.target.value } })}
              />
            </div>
          </div>
        </div>

        <div className="text-end">
          <button type="submit" className="btn btn-primary btn-lg d-inline-flex align-items-center" disabled={saving}>
            <Save size={18} className="me-1" /> {saving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
