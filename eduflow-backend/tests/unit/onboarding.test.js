import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { OnboardingController } from '../../src/controllers/OnboardingController.js'

describe('Onboarding Unit Tests', () => {
  test('returns CSV template for faculty with valid headers', () => {
    let sentHeaders = {}
    let sentBody = ''
    const res = {
      setHeader: (k, v) => { sentHeaders[k] = v },
      status: (c) => ({
        send: (body) => { sentBody = body; return res }
      })
    }
    OnboardingController.getFacultyTemplate({}, res)
    assert.ok(sentHeaders['Content-Type'].includes('text/csv'))
    assert.ok(sentBody.includes('employee_id,full_name,email,phone,department_code'))
  })

  test('returns CSV template for students with valid headers', () => {
    let sentBody = ''
    const res = {
      setHeader: () => {},
      status: () => ({
        send: (body) => { sentBody = body; return res }
      })
    }
    OnboardingController.getStudentTemplate({}, res)
    assert.ok(sentBody.includes('roll_number,full_name,email,phone,department_code'))
  })

  test('step 1 saves institution profile and increments step', async () => {
    let resJson = null
    let resStatus = null
    const req = {
      user: { institutionId: 99 },
      body: { name: 'Vidyapeeth Tech', shortCode: 'VPT' }
    }
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => { resJson = data }
        }
      }
    }
    await OnboardingController.step1Profile(req, res)
    assert.equal(resStatus, 200)
    assert.equal(resJson.success, true)
    assert.equal(resJson.nextStep, 2)
  })

  test('step 2 saves departments and validates non-empty array', async () => {
    let resJson = null
    const req = {
      user: { institutionId: 99 },
      body: { departments: [{ name: 'CSE', code: 'CSE' }] }
    }
    const res = {
      status: () => ({ json: (data) => { resJson = data } })
    }
    await OnboardingController.step2Departments(req, res)
    assert.equal(resJson.success, true)
    assert.equal(resJson.nextStep, 3)
  })

  test('finish endpoint finalizes setup and marks completed', async () => {
    let resJson = null
    const req = { user: { institutionId: 99 }, body: {} }
    const res = {
      status: () => ({ json: (data) => { resJson = data } })
    }
    await OnboardingController.finish(req, res)
    assert.equal(resJson.success, true)
    assert.equal(resJson.redirectUrl, '/admin-dashboard')
  })
})
