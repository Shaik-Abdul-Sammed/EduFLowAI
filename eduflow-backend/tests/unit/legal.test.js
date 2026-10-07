import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { LegalController } from '../../src/controllers/LegalController.js'

describe('Legal & Compliance Unit Tests', () => {
  test('returns Terms of Service containing Indian governing law', () => {
    let resJson = null
    const res = {
      status: (code) => ({
        json: (data) => { resJson = data }
      })
    }
    LegalController.getTerms({}, res)
    assert.ok(resJson.title.includes('Terms of Service'))
    assert.equal(resJson.governingLaw, 'Republic of India')
    assert.ok(resJson.sections.length >= 8)
  })

  test('returns Privacy Policy complying with DPDP Act 2023', () => {
    let resJson = null
    const res = {
      status: () => ({
        json: (data) => { resJson = data }
      })
    }
    LegalController.getPrivacy({}, res)
    assert.ok(String(resJson.compliance).includes('DPDP'))
    assert.ok(resJson.sections.some(s => s.title.includes('DPDP Act')))
  })

  test('returns Data Processing Agreement (DPA)', () => {
    let resJson = null
    const res = {
      status: () => ({
        json: (data) => { resJson = data }
      })
    }
    LegalController.getDpa({}, res)
    assert.ok(resJson.title.includes('Data Processing Agreement'))
    assert.ok(resJson.sections.some(s => s.title.includes('Security Measures')))
  })

  test('records user legal acceptance with timestamp and IP', async () => {
    let resJson = null
    const req = {
      ip: '103.21.244.2',
      headers: { 'user-agent': 'Chrome/128' },
      body: { documentType: 'TERMS_AND_PRIVACY', version: '1.0', userId: 12 }
    }
    const res = {
      status: () => ({
        json: (data) => { resJson = data }
      })
    }
    await LegalController.acceptTerms(req, res)
    assert.equal(resJson.success, true)
    assert.equal(resJson.record.documentType, 'TERMS_AND_PRIVACY')
    assert.ok(resJson.record.timestamp)
  })
})
