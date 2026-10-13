import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../../src/app.js'
import { OnboardingAIController } from '../../src/controllers/OnboardingAIController.js'

describe('AI Onboarding Integration Flow', () => {
  const app = createApp()

  beforeEach(() => {
    OnboardingAIController.resetRateLimits()
  })

  test('POST /api/v1/onboarding/ai-extract extracts structured institutional profile', async () => {
    const { default: request } = await import('supertest').catch(() => ({ default: null }))
    if (!request) {
      // In-process fallback test
      let resData = null
      let statusCode = null
      await OnboardingAIController.extract({
        user: { id: 'test-dean-1' },
        body: { sample: true }
      }, {
        status: (code) => {
          statusCode = code
          return { json: (d) => { resData = d } }
        }
      })

      assert.equal(statusCode, 200)
      assert.equal(resData.success, true)
      assert.ok(resData.extracted.name)
      assert.ok(resData.confidence.name)
      assert.ok(resData.extracted.departments.length > 0)
    } else {
      const res = await request(app)
        .post('/api/v1/onboarding/ai-extract')
        .send({ sample: true })
      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.ok(res.body.extracted.name)
    }
  })

  test('POST /api/v1/onboarding/ai-apply applies extracted departments and courses', async () => {
    let resData = null
    let statusCode = null
    await OnboardingAIController.apply({
      user: { institutionId: 1 },
      body: {
        extractedData: {
          name: 'Apex Institute of Technology',
          shortCode: 'AIT',
          city: 'Bangalore',
          state: 'Karnataka',
          departments: [
            { name: 'Computer Science & Engineering', code: 'CSE' },
            { name: 'Information Science & Engineering', code: 'ISE' }
          ],
          courses: [
            { name: 'B.Tech in CSE', code: 'CSE', degree: 'B.Tech' }
          ],
          facilities: ['Central Library', 'Robotics Lab']
        }
      }
    }, {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resData = d } }
      }
    })

    assert.equal(statusCode, 200)
    assert.equal(resData.success, true)
    assert.equal(resData.counts.departmentsCount, 2)
    assert.equal(resData.counts.coursesCount, 1)
  })

  test('enforces rate limit of 5 extractions per hour per user', async () => {
    const userId = 'limited-user-123'
    for (let i = 0; i < 5; i++) {
      let code = null
      await OnboardingAIController.extract({
        user: { id: userId },
        body: { sample: true }
      }, {
        status: (c) => {
          code = c
          return { json: () => {} }
        }
      })
      assert.equal(code, 200, `Request ${i + 1} should succeed`)
    }

    // 6th request should fail with 429
    let code6 = null
    let errBody = null
    await OnboardingAIController.extract({
      user: { id: userId },
      body: { sample: true }
    }, {
      status: (c) => {
        code6 = c
        return { json: (d) => { errBody = d } }
      }
    })

    assert.equal(code6, 429)
    assert.ok(errBody.error.includes('Rate limit exceeded'))
  })
})
