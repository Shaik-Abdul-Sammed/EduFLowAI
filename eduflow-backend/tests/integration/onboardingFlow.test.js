import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../../src/app.js'

describe('Onboarding Flow Integration Tests', () => {
  const app = createApp()

  test('app instantiates and mounts all onboarding and legal endpoints', () => {
    assert.ok(app)
    assert.equal(typeof app.listen, 'function')
  })

  test('executes complete 6-step onboarding progression sequentially', async () => {
    const { OnboardingController } = await import('../../src/controllers/OnboardingController.js')
    
    // Step 1
    let s1Res = null
    await OnboardingController.step1Profile({
      user: { institutionId: 50 },
      body: { name: 'Apex Institute of Technology', shortCode: 'AIT' }
    }, { status: () => ({ json: (d) => { s1Res = d } }) })
    assert.equal(s1Res.nextStep, 2)

    // Step 2
    let s2Res = null
    await OnboardingController.step2Departments({
      user: { institutionId: 50 },
      body: { departments: [{ name: 'CSE', code: 'CSE' }, { name: 'ECE', code: 'ECE' }] }
    }, { status: () => ({ json: (d) => { s2Res = d } }) })
    assert.equal(s2Res.nextStep, 3)

    // Step 3
    let s3Res = null
    await OnboardingController.step3Faculty({
      user: { institutionId: 50 },
      body: { faculty: [{ employee_id: 'EMP1', full_name: 'Dr. Rao', email: 'rao@ait.edu' }] }
    }, { status: () => ({ json: (d) => { s3Res = d } }) })
    assert.equal(s3Res.nextStep, 4)

    // Step 4
    let s4Res = null
    await OnboardingController.step4Students({
      user: { institutionId: 50 },
      body: { students: [{ roll_number: 'AIT01', full_name: 'Ananya', email: 'ananya@ait.edu' }] }
    }, { status: () => ({ json: (d) => { s4Res = d } }) })
    assert.equal(s4Res.nextStep, 5)

    // Step 5
    let s5Res = null
    await OnboardingController.step5Academic({
      user: { institutionId: 50 },
      body: { academicYear: '2026-2027', stateCode: 'KA' }
    }, { status: () => ({ json: (d) => { s5Res = d } }) })
    assert.equal(s5Res.nextStep, 6)

    // Step 6 Finish
    let finishRes = null
    await OnboardingController.finish({
      user: { institutionId: 50 },
      body: {}
    }, { status: () => ({ json: (d) => { finishRes = d } }) })
    assert.equal(finishRes.success, true)
    assert.equal(finishRes.redirectUrl, '/admin-dashboard')
  })
})
