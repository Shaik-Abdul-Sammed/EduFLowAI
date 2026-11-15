import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { AIService } from '../../src/services/AIService.js'
import { CampusOperationsController } from '../../src/controllers/CampusOperationsController.js'

function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.data = data
      return this
    }
  }
  return res
}

describe('Unit: Grievance Edge Cases & Sentiment Engine', () => {
  it('handles empty string, null, and undefined safely in sentiment analyzer', () => {
    const emptyRes = AIService.analyzeGrievanceSentiment('')
    assert.ok(emptyRes)
    assert.strictEqual(emptyRes.score, 0.2)
    assert.strictEqual(emptyRes.priority, 'LOW')

    const nullRes = AIService.analyzeGrievanceSentiment(null)
    assert.ok(nullRes)
    assert.strictEqual(nullRes.score, 0.2)

    const undefRes = AIService.analyzeGrievanceSentiment(undefined)
    assert.ok(undefRes)
    assert.strictEqual(undefRes.score, 0.2)
  })

  it('escalates priority to CRITICAL when complaints contain fire, suicide, or ragging', () => {
    const ragging = AIService.analyzeGrievanceSentiment('Incidents of ragging reported in east wing dorms')
    assert.strictEqual(ragging.priority, 'CRITICAL')

    const fire = AIService.analyzeGrievanceSentiment('Fire hazard detected in chemistry storage lab')
    assert.strictEqual(fire.priority, 'CRITICAL')

    const threat = AIService.analyzeGrievanceSentiment('Threatening behavior and physical intimidation by outsiders')
    assert.strictEqual(threat.priority, 'CRITICAL')
  })

  it('returns 400 when attempting to resolve a grievance without resolution notes', async () => {
    const req = {
      params: { id: 'grv_99' },
      body: {
        status: 'RESOLVED',
        resolution_notes: ''
      }
    }
    const res = createMockRes()
    await CampusOperationsController.resolveGrievance(req, res)
    assert.strictEqual(res.statusCode, 400)
    assert.ok(res.data.error.includes('Resolution note is required'))
  })

  it('rejects illegal status transition from OPEN directly to RESOLVED without IN_PROGRESS', async () => {
    const req = {
      params: { id: 'grv_open_1' },
      body: {
        status: 'RESOLVED',
        from_status: 'OPEN',
        resolution_notes: 'Done'
      }
    }
    const res = createMockRes()
    await CampusOperationsController.updateGrievanceStatus(req, res)
    assert.strictEqual(res.statusCode, 400)
    assert.ok(res.data.error.includes('Illegal status transition'))
  })

  it('enforces that students can only view their own grievance details (403 for other students)', async () => {
    // 1. Submit a grievance as student 22BCE1044
    const submitReq = {
      body: {
        student_roll: '22BCE1044',
        student_name: 'Ananya Sharma',
        category: 'Hostel',
        subject: 'Hot water geyser tripping',
        description: 'Geyser trips main breaker within 2 minutes.'
      },
      user: { id: 80, role: 'student', rollNumber: '22BCE1044' }
    }
    const submitRes = createMockRes()
    await CampusOperationsController.submitGrievance(submitReq, submitRes)
    const grvId = submitRes.data.grievance.id

    // 2. Query as the owner student -> 200 OK
    const ownerReq = {
      params: { id: grvId },
      user: { id: 80, role: 'student', rollNumber: '22BCE1044' }
    }
    const ownerRes = createMockRes()
    await CampusOperationsController.getGrievanceById(ownerReq, ownerRes)
    assert.strictEqual(ownerRes.statusCode, 200)
    assert.strictEqual(ownerRes.data.grievance.student_roll, '22BCE1044')

    // 3. Query as another student -> 403 Forbidden
    const otherReq = {
      params: { id: grvId },
      user: { id: 99, role: 'student', rollNumber: '22BCE9999' }
    }
    const otherRes = createMockRes()
    await CampusOperationsController.getGrievanceById(otherReq, otherRes)
    assert.strictEqual(otherRes.statusCode, 403)
    assert.ok(otherRes.data.error.includes('Forbidden'))

    // 4. Query as Admin -> 200 OK
    const adminReq = {
      params: { id: grvId },
      user: { id: 1, role: 'admin' }
    }
    const adminRes = createMockRes()
    await CampusOperationsController.getGrievanceById(adminReq, adminRes)
    assert.strictEqual(adminRes.statusCode, 200)
  })
})
