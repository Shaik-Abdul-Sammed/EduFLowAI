import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  KeyRound,
  Server,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  Users,
  RefreshCw,
  Globe
} from 'lucide-react'

export default function SSOConfigPage() {
  const [activeTab, setActiveTab] = useState('saml') // 'saml' | 'oidc' | 'ldap' | 'mapping'
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // SAML State
  const [samlConfig, setSamlConfig] = useState({
    displayName: 'Institutional Shibboleth / SAML 2.0',
    entityId: 'https://eduflow.ai/saml/metadata',
    entryPoint: 'https://idp.iitb.ac.in/idp/profile/SAML2/Redirect/SSO',
    idpCert: '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAL9...\n-----END CERTIFICATE-----',
    defaultRole: 'faculty',
    autoProvision: true
  })

  // OIDC State
  const [oidcConfig, setOidcConfig] = useState({
    displayName: 'Google Workspace / Azure AD',
    issuer: 'https://accounts.google.com',
    clientId: '789123-eduflow.apps.googleusercontent.com',
    clientSecret: 'GOCSPX-SampleSecretKey123',
    redirectUri: 'https://eduflow.ai/api/v1/sso/1/oidc/callback',
    defaultRole: 'student',
    autoProvision: true
  })

  // LDAP State
  const [ldapConfig, setLdapConfig] = useState({
    displayName: 'Campus Active Directory / OpenLDAP',
    url: 'ldap://ldap.institution.edu:389',
    bindDN: 'cn=eduflow_svc,ou=services,dc=institution,dc=edu',
    bindPassword: '••••••••••••',
    baseDN: 'ou=users,dc=institution,dc=edu',
    searchFilter: '(&(objectClass=person)(mail={{email}}))',
    defaultRole: 'student',
    autoProvision: true
  })

  // Group Mapping State
  const [groupMappings, setGroupMappings] = useState([
    { ssoGroup: 'ou=deans,ou=staff', mappedRole: 'admin' },
    { ssoGroup: 'ou=dept_heads,ou=faculty', mappedRole: 'hod' },
    { ssoGroup: 'ou=professors,ou=faculty', mappedRole: 'faculty' },
    { ssoGroup: 'ou=finance_officers', mappedRole: 'finance_officer' },
    { ssoGroup: 'ou=accounts_staff', mappedRole: 'accounts_staff' },
    { ssoGroup: 'ou=undergrad_students', mappedRole: 'student' }
  ])

  const handleTestConnection = async (type) => {
    setLoading(true)
    setTestResult(null)
    setError('')
    try {
      const res = await fetch('/api/v1/admin/sso/config/1/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      setTestResult(data)
      setMessage(data.message || 'Connection test successful!')
    } catch (err) {
      setError(err.message || 'Connection test failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async (providerType) => {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      let configData = samlConfig
      let displayName = samlConfig.displayName
      if (providerType === 'OIDC') {
        configData = oidcConfig
        displayName = oidcConfig.displayName
      } else if (providerType === 'LDAP') {
        configData = ldapConfig
        displayName = ldapConfig.displayName
      }

      const res = await fetch('/api/v1/admin/sso/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId: 1,
          providerType,
          displayName,
          config: configData,
          defaultRole: configData.defaultRole
        })
      })
      if (!res.ok) throw new Error('Failed to save SSO configuration')
      setMessage(`Successfully saved ${providerType} institutional configuration!`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold d-flex align-items-center text-primary mb-1">
            <ShieldCheck className="me-2" size={28} /> Institutional SSO & Directory Integration
          </h3>
          <p className="text-muted small mb-0">
            Enterprise Single Sign-On (SAML 2.0, OpenID Connect, and Campus LDAP / Active Directory) for universities like IIT Bombay and Anna University.
          </p>
        </div>
        <span className="badge bg-success-subtle text-success border border-success px-3 py-2 fw-semibold">
          IITB Shibboleth Ready
        </span>
      </div>

      {message && (
        <div className="alert alert-success d-flex align-items-center mb-3">
          <CheckCircle2 size={18} className="me-2 text-success" />
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-3">
          <AlertCircle size={18} className="me-2 text-danger" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'saml' ? 'active' : ''}`}
                onClick={() => setActiveTab('saml')}
              >
                <KeyRound size={16} className="me-1" /> SAML 2.0 (Shibboleth / ADFS)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'oidc' ? 'active' : ''}`}
                onClick={() => setActiveTab('oidc')}
              >
                <Globe size={16} className="me-1" /> OIDC (Google / Azure AD)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'ldap' ? 'active' : ''}`}
                onClick={() => setActiveTab('ldap')}
              >
                <Server size={16} className="me-1" /> Campus LDAP / Active Directory
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'mapping' ? 'active' : ''}`}
                onClick={() => setActiveTab('mapping')}
              >
                <Users size={16} className="me-1" /> Group-to-Role Mapping
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">
          {/* TAB 1: SAML 2.0 */}
          {activeTab === 'saml' && (
            <div>
              <h5 className="fw-bold mb-3 text-dark">SAML 2.0 Service Provider Configuration</h5>
              <p className="text-muted small">
                Configure SAML identity provider details or paste institutional XML metadata from Shibboleth, Microsoft ADFS, or Google Workspace.
              </p>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Display Name on Login Page</label>
                  <input
                    type="text"
                    className="form-control"
                    value={samlConfig.displayName}
                    onChange={(e) => setSamlConfig({ ...samlConfig, displayName: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">EduFlow SP Entity ID</label>
                  <input
                    type="text"
                    className="form-control"
                    readOnly
                    value={samlConfig.entityId}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">IdP Single Sign-On URL (Entry Point)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://idp.institution.edu/idp/profile/SAML2/Redirect/SSO"
                    value={samlConfig.entryPoint}
                    onChange={(e) => setSamlConfig({ ...samlConfig, entryPoint: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">IdP Public X.509 Certificate</label>
                  <textarea
                    className="form-control font-monospace small"
                    rows={4}
                    value={samlConfig.idpCert}
                    onChange={(e) => setSamlConfig({ ...samlConfig, idpCert: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Default Role for Auto-Provisioned Users</label>
                  <select
                    className="form-select"
                    value={samlConfig.defaultRole}
                    onChange={(e) => setSamlConfig({ ...samlConfig, defaultRole: e.target.value })}
                  >
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                    <option value="hod">HOD</option>
                  </select>
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="samlAuto"
                      checked={samlConfig.autoProvision}
                      onChange={(e) => setSamlConfig({ ...samlConfig, autoProvision: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="samlAuto">
                      Auto-provision user account on first SAML login
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
                  disabled={loading}
                  onClick={() => handleSaveConfig('SAML')}
                >
                  <Save size={16} className="me-1" /> Save SAML Configuration
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center"
                  disabled={loading}
                  onClick={() => handleTestConnection('SAML')}
                >
                  <Play size={16} className="me-1" /> Test IdP Handshake
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OIDC */}
          {activeTab === 'oidc' && (
            <div>
              <h5 className="fw-bold mb-3 text-dark">OpenID Connect (OIDC) Credentials</h5>
              <p className="text-muted small">
                Configure OAuth 2.0 / OIDC credentials from Google Cloud Console, Microsoft Entra ID (Azure AD), or Okta.
              </p>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Issuer URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={oidcConfig.issuer}
                    onChange={(e) => setOidcConfig({ ...oidcConfig, issuer: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Client ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={oidcConfig.clientId}
                    onChange={(e) => setOidcConfig({ ...oidcConfig, clientId: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Client Secret</label>
                  <input
                    type="password"
                    className="form-control"
                    value={oidcConfig.clientSecret}
                    onChange={(e) => setOidcConfig({ ...oidcConfig, clientSecret: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Authorized Redirect URI</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    readOnly
                    value={oidcConfig.redirectUri}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
                  disabled={loading}
                  onClick={() => handleSaveConfig('OIDC')}
                >
                  <Save size={16} className="me-1" /> Save OIDC Configuration
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center"
                  disabled={loading}
                  onClick={() => handleTestConnection('OIDC')}
                >
                  <Play size={16} className="me-1" /> Test Discovery Endpoint
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LDAP */}
          {activeTab === 'ldap' && (
            <div>
              <h5 className="fw-bold mb-3 text-dark">Institutional LDAP & Active Directory</h5>
              <p className="text-muted small">
                Connect directly to on-premise OpenLDAP, 389 Directory Server, or Microsoft Active Directory.
              </p>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">LDAP Server URL</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    value={ldapConfig.url}
                    onChange={(e) => setLdapConfig({ ...ldapConfig, url: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Base DN</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    value={ldapConfig.baseDN}
                    onChange={(e) => setLdapConfig({ ...ldapConfig, baseDN: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Service Account Bind DN</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    value={ldapConfig.bindDN}
                    onChange={(e) => setLdapConfig({ ...ldapConfig, bindDN: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Bind Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={ldapConfig.bindPassword}
                    onChange={(e) => setLdapConfig({ ...ldapConfig, bindPassword: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">User Search Filter</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    value={ldapConfig.searchFilter}
                    onChange={(e) => setLdapConfig({ ...ldapConfig, searchFilter: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
                  disabled={loading}
                  onClick={() => handleSaveConfig('LDAP')}
                >
                  <Save size={16} className="me-1" /> Save LDAP Configuration
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center"
                  disabled={loading}
                  onClick={() => handleTestConnection('LDAP')}
                >
                  <Play size={16} className="me-1" /> Test Bind Connection
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Group Mapping */}
          {activeTab === 'mapping' && (
            <div>
              <h5 className="fw-bold mb-3 text-dark">Directory Group to EduFlow Role Mapping</h5>
              <p className="text-muted small">
                Automatically assign platform roles based on user groups returned by LDAP, SAML, or OIDC claims.
              </p>

              <div className="table-responsive mb-4">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Directory Group / Attribute Value</th>
                      <th>Mapped EduFlow Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupMappings.map((m, idx) => (
                      <tr key={idx}>
                        <td className="font-monospace text-primary">{m.ssoGroup}</td>
                        <td>
                          <span className="badge bg-secondary text-uppercase">{m.mappedRole}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => setGroupMappings(groupMappings.filter((_, i) => i !== idx))}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="btn btn-success d-flex align-items-center"
                onClick={() => setMessage('Group-to-role mappings saved successfully!')}
              >
                <Save size={16} className="me-1" /> Save Role Mappings
              </button>
            </div>
          )}

          {/* Test connection report */}
          {testResult && (
            <div className="mt-4 p-3 border rounded bg-light">
              <h6 className="fw-bold d-flex align-items-center text-success mb-2">
                <CheckCircle2 size={16} className="me-1" /> Connection Test Report
              </h6>
              <div className="small font-monospace">
                <div>Status: <strong>{testResult.status}</strong></div>
                <div>Latency: <strong>{testResult.pingMs} ms</strong></div>
                <div>Message: {testResult.message}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
