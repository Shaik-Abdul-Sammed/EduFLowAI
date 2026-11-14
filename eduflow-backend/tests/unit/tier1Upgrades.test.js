import test from 'node:test'
import assert from 'node:assert'
import jwt from 'jsonwebtoken'
import { AITutorController } from '../../src/controllers/AITutorController.js'
import { verifyZeroTrustContext, JWT_SECRET, authMiddleware } from '../../src/middleware/auth.js'
import { buildMetricsPayload } from '../../src/routes/monitoringRoutes.js'
import { uploadBackupToS3 } from '../../src/services/backupService.js'
import { AdvancedTechController } from '../../src/controllers/AdvancedTechController.js'
import { CredentialController } from '../../src/controllers/CredentialController.js'

test('Tier 1 Upgrades: Intelligent Tutoring System uses Socratic Method (Feature 20)', async () => {
  const req = {
    body: {
      question: 'How does Dijkstra algorithm work and why does it fail with negative edges?',
      courseCode: 'CS301'
    }
  }

  let responseData = null
  let statusCode = 0
  const res = {
    status(code) {
      statusCode = code
      return {
        json(data) {
          responseData = data
        }
      }
    }
  }

  await AITutorController.ask(req, res)

  assert.strictEqual(statusCode, 200)
  assert.strictEqual(responseData.success, true)
  assert.strictEqual(responseData.pedagogy, 'Socratic Method')
  assert.ok(Array.isArray(responseData.guidingQuestions))
  assert.ok(responseData.guidingQuestions.length >= 2)
  assert.ok(responseData.answer.includes('Socratic'))
  assert.ok(responseData.answer.includes('?'))
})

test('Tier 1 Upgrades: Zero-Trust Security Architecture blocks anomalous context (Feature 76)', async () => {
  const token = jwt.sign(
    { id: 42, username: 'prof_test', role: 'faculty', boundIp: '192.168.1.100', clientFingerprint: 'browser_hash_abc' },
    JWT_SECRET,
    { expiresIn: '1h' }
  )

  // 1. Same IP & fingerprint: passes
  const validReq = {
    headers: {
      authorization: `Bearer ${token}`,
      'x-client-fingerprint': 'browser_hash_abc'
    },
    ip: '192.168.1.100'
  }
  let calledNext = false
  authMiddleware(validReq, {}, () => { calledNext = true })
  assert.strictEqual(calledNext, true)

  // 2. Suspicious header: rejected with ZERO_TRUST_VIOLATION
  const suspiciousReq = {
    headers: {
      authorization: `Bearer ${token}`,
      'x-suspicious-client': 'true'
    },
    ip: '192.168.1.100'
  }
  let errRes = null
  let errStatus = 0
  const mockRes = {
    status(c) {
      errStatus = c
      return {
        json(d) {
          errRes = d
        }
      }
    }
  }
  authMiddleware(suspiciousReq, mockRes, () => {})
  assert.strictEqual(errStatus, 401)
  assert.strictEqual(errRes.code, 'ZERO_TRUST_VIOLATION')
})

test('Tier 1 Upgrades: Observability Platform Metrics endpoint (Feature 81)', () => {
  const metrics = buildMetricsPayload()

  assert.ok(typeof metrics.uptime === 'number')
  assert.ok(metrics.memoryUsage.heapUsed > 0)
  assert.ok(metrics.memoryUsage.heapTotal > 0)
  assert.ok(typeof metrics.requests.total === 'number')
  assert.ok(typeof metrics.requests.errorRate === 'number')
  assert.ok(metrics.process.nodeVersion.startsWith('v'))
})

test('Tier 1 Upgrades: Disaster Recovery DRaaS S3 Backup Upload (Feature 82)', async () => {
  const res = await uploadBackupToS3('backups/test-snapshot.sql.gz')

  assert.strictEqual(res.success, true)
  assert.ok(res.mode.includes('draas') || res.mode.includes('s3'))
  assert.ok(res.bucket.length > 0)
  assert.ok(res.key.includes('test-snapshot'))
})

test('Tier 1 Upgrades: Podcast Studio Media Upload (Feature 13)', async () => {
  const req = {
    body: {
      title: 'Micro-Lecture 1: Byzantine Fault Tolerance',
      duration: 180,
      courseCode: 'CS401'
    }
  }
  let statusCode = 0
  let resData = null
  const res = {
    status(c) {
      statusCode = c
      return {
        json(d) { resData = d }
      }
    }
  }

  await AdvancedTechController.uploadMedia(req, res)
  assert.strictEqual(statusCode, 201)
  assert.strictEqual(resData.success, true)
  assert.ok(resData.mediaUrl.endsWith('.webm'))
  assert.strictEqual(resData.duration, 180)
})

test('Tier 1 Upgrades: AI-Driven Curriculum Mapping (Feature 74)', async () => {
  const postReq = {
    body: {
      courseCode: 'CS402',
      mappings: {
        CO1: { PO1: 3, PO2: 2 },
        CO2: { PO1: 2, PO3: 3 }
      }
    }
  }
  let resData = null
  const res = {
    status() {
      return {
        json(d) { resData = d }
      }
    }
  }

  await AdvancedTechController.saveCurriculumMap(postReq, res)
  assert.strictEqual(resData.success, true)
  assert.strictEqual(resData.data.courseCode, 'CS402')

  // Retrieve it
  const getReq = { params: { courseCode: 'CS402' } }
  let getData = null
  const getRes = {
    status() {
      return { json(d) { getData = d } }
    }
  }
  await AdvancedTechController.getCurriculumMap(getReq, getRes)
  assert.strictEqual(getData.success, true)
  assert.strictEqual(getData.data.courseCode, 'CS402')
})

test('Tier 1 Upgrades: Virtual Research Environments (Feature 10)', async () => {
  const logReq = {
    body: {
      projectId: 'proj-ai-01',
      logMessage: 'Neural network weight quantization complete. 8-bit precision retained 99.4% accuracy.',
      author: 'Dr. Test'
    }
  }
  let logData = null
  const res = {
    status() { return { json(d) { logData = d } } }
  }
  await AdvancedTechController.addResearchLog(logReq, res)
  assert.strictEqual(logData.success, true)
  assert.ok(logData.log.id > 0)

  // Fetch logs
  const getReq = { query: { projectId: 'proj-ai-01' } }
  let getLogsData = null
  const getRes = {
    status() { return { json(d) { getLogsData = d } } }
  }
  await AdvancedTechController.getResearchLogs(getReq, getRes)
  assert.strictEqual(getLogsData.success, true)
  assert.ok(getLogsData.logs.length >= 1)
  assert.ok(getLogsData.datasets.length >= 1)
})

test('Tier 1 Upgrades: Faculty Credential Wallet (Feature 64)', async () => {
  const uploadReq = {
    body: {
      facultyId: 201,
      credentialType: 'SCOPUS_PUBLICATION',
      title: 'Formal Invariant Verification of Raft State Machine Replicas',
      institutionOrPublisher: 'ACM Transactions on Computer Systems (TOCS)',
      yearAwarded: 2026
    }
  }
  let uploadData = null
  const res = {
    status() { return { json(d) { uploadData = d } } }
  }

  await CredentialController.uploadFacultyCredential(uploadReq, res)
  assert.strictEqual(uploadData.success, true)
  assert.ok(uploadData.credential.blockchain_hash.startsWith('0x'))

  // Fetch faculty credentials
  const getReq = { params: { facultyId: '201' } }
  let listData = null
  const getRes = {
    status() { return { json(d) { listData = d } } }
  }
  await CredentialController.getFacultyCredentials(getReq, getRes)
  assert.strictEqual(listData.success, true)
  assert.ok(listData.credentials.length >= 3)
})
