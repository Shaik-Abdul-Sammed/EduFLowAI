import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { SSOService } from '../../src/services/auth/SSOService.js'

describe('Unit: SSOService (SAML, OIDC, LDAP)', () => {
  beforeEach(() => {
    SSOService.resetStores()
  })

  test('validates SAML 2.0 assertion XML and extracts attributes', async () => {
    const sampleSAMLXml = `
      <saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol">
        <saml2:Assertion xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
          <saml2:Subject>
            <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">prof.sharma@iitb.ac.in</saml2:NameID>
          </saml2:Subject>
          <saml2:AttributeStatement>
            <saml2:Attribute Name="email">
              <saml2:AttributeValue>prof.sharma@iitb.ac.in</saml2:AttributeValue>
            </saml2:Attribute>
            <saml2:Attribute Name="displayName">
              <saml2:AttributeValue>Prof. R. K. Sharma</saml2:AttributeValue>
            </saml2:Attribute>
            <saml2:Attribute Name="role">
              <saml2:AttributeValue>faculty</saml2:AttributeValue>
            </saml2:Attribute>
          </saml2:AttributeStatement>
        </saml2:Assertion>
      </saml2p:Response>
    `

    const parsed = await SSOService.verifySAMLResponse(sampleSAMLXml, 1)
    assert.equal(parsed.provider, 'SAML')
    assert.equal(parsed.email, 'prof.sharma@iitb.ac.in')
    assert.equal(parsed.name, 'Prof. R. K. Sharma')
    assert.ok(parsed.groups.includes('faculty'))
  })

  test('validates OIDC token with mock JWT and decodes claims', async () => {
    const payload = {
      sub: 'google-sub-987654321',
      email: 'student.aarav@university.edu',
      name: 'Aarav Patel',
      groups: ['student']
    }
    const token = jwt.sign(payload, 'test-secret', { noTimestamp: true })

    const result = await SSOService.verifyOIDCToken(token, 1)
    assert.equal(result.provider, 'OIDC')
    assert.equal(result.email, 'student.aarav@university.edu')
    assert.equal(result.name, 'Aarav Patel')
    assert.equal(result.externalId, 'google-sub-987654321')
  })

  test('validates LDAP credentials with bind handshake', async () => {
    const ldapUser = await SSOService.verifyLDAPCredentials('hod.cse', 'SecurePass@2026', {
      baseDN: 'ou=users,dc=iitb,dc=ac,dc=in'
    })

    assert.equal(ldapUser.provider, 'LDAP')
    assert.equal(ldapUser.username, 'hod.cse')
    assert.ok(ldapUser.groups.includes('hod'))

    // Rejection on bad password
    await assert.rejects(async () => {
      await SSOService.verifyLDAPCredentials('hod.cse', 'wrongpassword')
    }, /LDAP Bind Failed/)
  })

  test('maps institutional groups to EduFlow roles correctly', () => {
    assert.equal(SSOService.mapSSORole(['ou=dept_heads,ou=faculty']), 'hod')
    assert.equal(SSOService.mapSSORole(['cn=professors,ou=staff']), 'faculty')
    assert.equal(SSOService.mapSSORole(['cn=undergrads,ou=students']), 'student')
    assert.equal(SSOService.mapSSORole(['cn=finance_officers']), 'finance_officer')
    assert.equal(SSOService.mapSSORole(['cn=accounts_clerks']), 'accounts_staff')
    assert.equal(SSOService.mapSSORole(['cn=deans_office']), 'admin')
  })

  test('auto-provisions user record on first SSO login', async () => {
    const ssoProfile = {
      provider: 'SAML',
      externalId: 'shib-123',
      email: 'new.faculty@iitb.ac.in',
      name: 'Dr. Sunita Rao',
      groups: ['faculty']
    }

    const { user, token } = await SSOService.provisionSSOUser(ssoProfile, 1)
    assert.ok(user.id)
    assert.equal(user.email, 'new.faculty@iitb.ac.in')
    assert.equal(user.role, 'faculty')
    assert.ok(token)

    // Check login audit log
    const logs = SSOService.getLogsStore()
    assert.equal(logs.length, 1)
    assert.equal(logs[0].email, 'new.faculty@iitb.ac.in')
    assert.equal(logs[0].success, true)
  })
})
