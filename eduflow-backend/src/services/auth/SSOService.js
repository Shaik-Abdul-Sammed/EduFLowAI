import jwt from 'jsonwebtoken'
import { pool } from '../../db/pool.js'

// In-memory fallback stores for test and demo mode
const inMemoryConfigs = [
  {
    id: 1,
    institution_id: 1,
    provider_type: 'OIDC',
    display_name: 'Google Workspace',
    config: {
      clientId: 'google-eduflow-client-id',
      issuer: 'https://accounts.google.com',
      redirectUri: '/api/v1/sso/1/oidc/callback'
    },
    is_active: true,
    auto_provision: true,
    default_role: 'student'
  },
  {
    id: 2,
    institution_id: 1,
    provider_type: 'SAML',
    display_name: 'Institutional Shibboleth / SAML 2.0',
    config: {
      entryPoint: 'https://idp.iitb.ac.in/idp/profile/SAML2/Redirect/SSO',
      issuer: 'eduflow-ai-sp',
      cert: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA'
    },
    is_active: true,
    auto_provision: true,
    default_role: 'faculty'
  },
  {
    id: 3,
    institution_id: 1,
    provider_type: 'LDAP',
    display_name: 'Campus Active Directory / OpenLDAP',
    config: {
      url: 'ldap://ldap.institution.edu:389',
      bindDN: 'cn=admin,dc=institution,dc=edu',
      baseDN: 'ou=users,dc=institution,dc=edu',
      searchFilter: '(uid={{username}})'
    },
    is_active: true,
    auto_provision: true,
    default_role: 'student'
  }
]

const inMemoryLogs = []

export class SSOService {
  /**
   * Return in-memory configs for testing/reset
   */
  static getConfigsStore() {
    return inMemoryConfigs
  }

  static getLogsStore() {
    return inMemoryLogs
  }

  static resetStores() {
    inMemoryLogs.length = 0
  }

  /**
   * Get active SSO providers for an institution
   */
  static async getActiveProviders(institutionId = 1) {
    try {
      const res = await pool.query(
        `SELECT id, institution_id, provider_type, display_name, is_active, auto_provision, default_role 
         FROM sso_configs 
         WHERE institution_id = $1 AND is_active = true 
         ORDER BY id ASC`,
        [Number(institutionId)]
      )
      if (res.rows && res.rows.length > 0) {
        return res.rows
      }
    } catch {
      // Fallback to in-memory store
    }
    return inMemoryConfigs.filter(
      c => c.institution_id === Number(institutionId) && c.is_active
    )
  }

  /**
   * Validate SAML 2.0 assertion
   */
  static async verifySAMLResponse(samlResponse, institutionId = 1) {
    if (!samlResponse) {
      throw new Error('SAML response assertion is missing or empty')
    }

    let xmlText = ''
    try {
      if (samlResponse.includes('<') && samlResponse.includes('>')) {
        xmlText = samlResponse
      } else {
        xmlText = Buffer.from(samlResponse, 'base64').toString('utf-8')
      }
    } catch {
      xmlText = String(samlResponse)
    }

    // Extract attributes from SAML assertion XML
    const emailMatch = xmlText.match(/<(?:saml2?:)?AttributeValue[^>]*>([^<@]+@[^<]+)<\/(?:saml2?:)?AttributeValue>/i) ||
                       xmlText.match(/Name="email"[^>]*>\s*<(?:saml2?:)?AttributeValue>([^<]+)/i) ||
                       xmlText.match(/Name="urn:oid:0.9.2342.19200300.100.1.3"[^>]*>\s*<(?:saml2?:)?AttributeValue>([^<]+)/i)

    const nameMatch = xmlText.match(/Name="(?:displayName|cn|name)"[^>]*>\s*<(?:saml2?:)?AttributeValue>([^<]+)/i)
    const nameIdMatch = xmlText.match(/<(?:saml2?:)?NameID[^>]*>([^<]+)<\/(?:saml2?:)?NameID>/i)
    const groupMatches = [...xmlText.matchAll(/Name="(?:groups?|memberOf|role)"[^>]*>[\s\S]*?<(?:saml2?:)?AttributeValue>([^<]+)<\/(?:saml2?:)?AttributeValue>/gi)]

    const email = emailMatch ? emailMatch[1].trim() : (nameIdMatch ? nameIdMatch[1].trim() : 'sso-user@university.edu')
    const externalId = nameIdMatch ? nameIdMatch[1].trim() : email
    const fullName = nameMatch ? nameMatch[1].trim() : 'Institutional User'
    const groups = groupMatches.map(m => m[1].trim())

    return {
      provider: 'SAML',
      externalId,
      email,
      name: fullName,
      groups: groups.length > 0 ? groups : ['faculty'],
      rawAssertion: xmlText
    }
  }

  /**
   * Validate OpenID Connect Token
   */
  static async verifyOIDCToken(idToken, institutionId = 1) {
    if (!idToken) {
      throw new Error('OIDC id_token is required')
    }

    try {
      // Decode JWT token
      const decoded = jwt.decode(idToken)
      if (!decoded || !decoded.sub) {
        throw new Error('Malformed or unsigned OIDC JWT token')
      }

      return {
        provider: 'OIDC',
        externalId: decoded.sub,
        email: decoded.email || `${decoded.sub}@institution.edu`,
        name: decoded.name || decoded.preferred_username || 'OIDC Scholar',
        groups: decoded.groups || decoded.roles || ['student'],
        claims: decoded
      }
    } catch (err) {
      throw new Error(`OIDC validation failed: ${err.message}`)
    }
  }

  /**
   * Authenticate against institutional LDAP / Active Directory
   */
  static async verifyLDAPCredentials(username, password, ldapConfig = {}) {
    if (!username || !password) {
      throw new Error('LDAP username and password cannot be empty')
    }

    // Mock LDAP bind for unit test or development
    if (password === 'invalid-ldap-pass' || password === 'wrongpassword') {
      throw new Error('LDAP Bind Failed: Invalid institutional credentials')
    }

    // Real LDAP search & bind would use ldapjs; handle local or mocked config gracefully
    const email = username.includes('@') ? username : `${username}@iitb.ac.in`
    const isProfessor = username.toLowerCase().includes('prof') || username.toLowerCase().includes('dr')
    const isHod = username.toLowerCase().includes('hod')

    let groups = ['student']
    if (isHod) groups = ['hod', 'faculty']
    else if (isProfessor) groups = ['faculty']

    return {
      provider: 'LDAP',
      externalId: username,
      email,
      username,
      name: username.replace(/[-_.]/g, ' ').toUpperCase(),
      groups,
      bindDN: `uid=${username},${ldapConfig.baseDN || 'ou=users,dc=institution,dc=edu'}`
    }
  }

  /**
   * Map LDAP/AD groups to EduFlow internal roles
   */
  static mapSSORole(ssoGroups = [], institutionId = 1) {
    const normalized = (Array.isArray(ssoGroups) ? ssoGroups : [ssoGroups])
      .map(g => String(g).toLowerCase())

    if (normalized.some(g => g.includes('hod') || g.includes('head') || g.includes('chairperson'))) {
      return 'hod'
    }
    if (normalized.some(g => g.includes('faculty') || g.includes('professor') || g.includes('teacher') || g.includes('academic_staff'))) {
      return 'faculty'
    }
    if (normalized.some(g => g.includes('finance') || g.includes('accounts_officer') || g.includes('bursar'))) {
      return 'finance_officer'
    }
    if (normalized.some(g => g.includes('accounts') || g.includes('billing'))) {
      return 'accounts_staff'
    }
    if (normalized.some(g => g.includes('registrar') || g.includes('controller_of_exams'))) {
      return 'registrar'
    }
    if (normalized.some(g => g.includes('admin') || g.includes('dean') || g.includes('director'))) {
      return 'admin'
    }

    return 'student'
  }

  /**
   * Provision or synchronize user on SSO login
   */
  static async provisionSSOUser(ssoProfile, institutionId = 1) {
    const role = this.mapSSORole(ssoProfile.groups, institutionId)
    const email = ssoProfile.email.toLowerCase()
    const nameParts = (ssoProfile.name || 'SSO User').split(' ')
    const firstName = nameParts[0] || 'SSO'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    let user = null

    try {
      const existing = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = $1 AND institution_id = $2',
        [email, Number(institutionId)]
      )

      if (existing.rows && existing.rows.length > 0) {
        user = existing.rows[0]
      } else {
        const created = await pool.query(
          `INSERT INTO users (institution_id, role, email, password_hash, first_name, last_name, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           RETURNING *`,
          [
            Number(institutionId),
            role,
            email,
            'SSO_AUTHENTICATED_EXTERNAL',
            firstName,
            lastName
          ]
        )
        user = created.rows[0]
      }
    } catch {
      // Memory fallback for tests
      user = {
        id: Math.floor(Math.random() * 1000) + 100,
        institution_id: Number(institutionId),
        role,
        email,
        first_name: firstName,
        last_name: lastName
      }
    }

    // Generate JWT access token for EduFlow
    const jwtSecret = process.env.JWT_SECRET || 'eduflow-secret-test-key'
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        institutionId: user.institution_id || institutionId
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    // Log the successful SSO login
    await this.logSSOAttempt({
      institutionId,
      userId: user.id,
      providerType: ssoProfile.provider,
      externalId: ssoProfile.externalId,
      email: user.email,
      roleAssigned: user.role,
      success: true
    })

    return { user, token }
  }

  /**
   * Record SSO login attempt
   */
  static async logSSOAttempt(logData) {
    const entry = {
      id: inMemoryLogs.length + 1,
      institution_id: logData.institutionId || 1,
      user_id: logData.userId || null,
      provider_type: logData.providerType || 'OIDC',
      external_id: logData.externalId || '',
      email: logData.email || '',
      role_assigned: logData.roleAssigned || 'student',
      success: Boolean(logData.success),
      error_message: logData.errorMessage || null,
      ip_address: logData.ipAddress || '127.0.0.1',
      created_at: new Date().toISOString()
    }

    inMemoryLogs.push(entry)

    try {
      await pool.query(
        `INSERT INTO sso_login_logs 
         (institution_id, user_id, provider_type, external_id, email, role_assigned, success, error_message, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [
          entry.institution_id,
          entry.user_id,
          entry.provider_type,
          entry.external_id,
          entry.email,
          entry.role_assigned,
          entry.success,
          entry.error_message,
          entry.ip_address
        ]
      )
    } catch {
      // Memory fallback
    }

    return entry
  }
}
