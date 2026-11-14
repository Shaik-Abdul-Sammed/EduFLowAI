import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { LearningPathController } from '../../src/controllers/LearningPathController.js'
import { CredentialController } from '../../src/controllers/CredentialController.js'
import { AITutorController } from '../../src/controllers/AITutorController.js'
import { PlagiarismController } from '../../src/controllers/PlagiarismController.js'
import { GamificationController } from '../../src/controllers/GamificationController.js'
import { AdvancedTechController } from '../../src/controllers/AdvancedTechController.js'

function createMockRes() {
  const mock = {
    statusCode: 200,
    data: null,
    status(code) {
      mock.statusCode = code
      return mock
    },
    json(payload) {
      mock.data = payload
      return mock
    }
  }
  return mock
}

describe('International Missing Tech Roadmap (031) - Backend API Unit Tests', () => {

  // 1. Adaptive Learning Pathways
  describe('AI Adaptive Tutoring & Personalized Pathways', () => {
    test('generatePath generates structured recommendations based on student performance', async () => {
      const req = {
        body: {
          studentId: 101,
          pastGrades: [{ course: 'CS301', grade: 9.0 }, { course: 'CS304', grade: 8.5 }],
          targetDomain: 'Artificial Intelligence & Systems'
        }
      }
      const res = createMockRes()
      await LearningPathController.generatePath(req, res)

      assert.equal(res.statusCode, 201)
      assert.ok(res.data.success)
      assert.ok(res.data.path)
      assert.ok(Array.isArray(res.data.path.recommended_courses))
      assert.ok(res.data.path.recommended_courses.length >= 2)
      assert.equal(res.data.path.current_level, 'Advanced Scholar')
    })

    test('getPath retrieves active student curriculum pathway', async () => {
      const req = { params: { studentId: 101 }, query: {} }
      const res = createMockRes()
      await LearningPathController.getPath(req, res)

      assert.equal(res.statusCode, 200)
      assert.ok(res.data.success)
      assert.ok(res.data.path)
    })
  })

  // 2. Blockchain Micro-Credentials
  describe('Blockchain Micro-Credentials & Verifiable Badges', () => {
    let issuedHash = null

    test('issueCredential generates cryptographic SHA-256 ledger transaction', async () => {
      const req = {
        body: {
          studentId: 101,
          studentRoll: '2024-CSE-042',
          skillName: 'Quantum Cryptography & Post-Quantum Algorithms',
          issuerName: 'EduFlow Global Academic Consortium'
        }
      }
      const res = createMockRes()
      await CredentialController.issueCredential(req, res)

      assert.equal(res.statusCode, 201)
      assert.ok(res.data.success)
      assert.ok(res.data.credential.blockchain_hash.startsWith('0x'))
      assert.equal(res.data.credential.skill_name, 'Quantum Cryptography & Post-Quantum Algorithms')
      issuedHash = res.data.credential.blockchain_hash
    })

    test('getWallet returns list of verified micro-credentials for student', async () => {
      const req = { params: { studentId: 101 } }
      const res = createMockRes()
      await CredentialController.getWallet(req, res)

      assert.equal(res.statusCode, 200)
      assert.ok(Array.isArray(res.data.credentials))
      assert.ok(res.data.credentials.length >= 1)
    })

    test('verifyCredential verifies valid transaction hash on ledger', async () => {
      const req = { params: { hash: issuedHash } }
      const res = createMockRes()
      await CredentialController.verifyCredential(req, res)

      assert.equal(res.statusCode, 200)
      assert.equal(res.data.verified, true)
    })
  })

  // 3. AI Teaching Assistant
  describe('AI Teaching Assistant & Syllabus Grounding', () => {
    test('ask provides syllabus-grounded explanation for algorithmic questions', async () => {
      const req = {
        body: {
          question: 'How does Dijkstra algorithm find shortest paths?',
          courseCode: 'CS301',
          studentId: 101
        }
      }
      const res = createMockRes()
      await AITutorController.ask(req, res)

      assert.equal(res.statusCode, 200)
      assert.ok(res.data.answer.includes('Dijkstra'))
      assert.ok(Array.isArray(res.data.references))
      assert.ok(res.data.references.length > 0)
    })

    test('ask rejects empty question prompt with 400 Bad Request', async () => {
      const req = { body: { question: '   ' } }
      const res = createMockRes()
      await AITutorController.ask(req, res)

      assert.equal(res.statusCode, 400)
    })
  })

  // 4. Plagiarism & AI Attribution
  describe('AI Plagiarism Detection & Corpus Comparison', () => {
    test('checkPlagiarism compares text against corpus and calculates similarity & AI score', async () => {
      const sampleEssay = 'Distributed consensus and byzantine fault tolerance in cloud clusters require durable state machines. Furthermore, we delve into the tapestry of raft and paxos.'
      const req = {
        body: {
          text: sampleEssay,
          assignmentTitle: 'Cloud Systems Term Paper',
          studentId: 101
        }
      }
      const res = createMockRes()
      await PlagiarismController.checkPlagiarism(req, res)

      assert.equal(res.statusCode, 200)
      assert.ok(res.data.success)
      assert.ok(res.data.report)
      assert.ok(typeof res.data.report.similarity_percentage === 'number')
      assert.ok(typeof res.data.report.ai_score === 'number')
      assert.ok(['CLEAN', 'FLAGGED_REVIEW', 'CRITICAL_SUSPECT'].includes(res.data.report.status))
    })

    test('getReports returns recent plagiarism inspection logs', async () => {
      const req = { query: {} }
      const res = createMockRes()
      await PlagiarismController.getReports(req, res)

      assert.equal(res.statusCode, 200)
      assert.ok(Array.isArray(res.data.reports))
    })
  })

  // 5. Gamification Engine
  describe('Gamification Engine & Leaderboards', () => {
    test('awardXp awards points, updates level, and maintains rank', async () => {
      const req = {
        body: {
          studentId: 101,
          studentRoll: '2024-CSE-042',
          studentName: 'Aarav Sharma',
          activityType: 'ATTENDANCE_STREAK',
          points: 200
        }
      }
      const res = createMockRes()
      await GamificationController.awardXp(req, res)

      assert.equal(res.statusCode, 200)
      assert.ok(res.data.success)
      assert.ok(res.data.profile.xp_points >= 200)
      assert.ok(res.data.profile.level >= 1)
    })

    test('getLeaderboard returns cohort standings sorted by XP', async () => {
      const req = {}
      const res = createMockRes()
      await GamificationController.getLeaderboard(req, res)

      assert.equal(res.statusCode, 200)
      assert.ok(Array.isArray(res.data.leaderboard))
      assert.ok(res.data.leaderboard.length >= 2)
      assert.ok(res.data.leaderboard[0].xp_points >= res.data.leaderboard[1].xp_points)
    })
  })

  // 6. Whiteboard, Simulations, and Instant Translation
  describe('Digital Whiteboard, Virtual Labs & On-the-Fly Translation', () => {
    test('saveWhiteboard and getWhiteboard maintain canvas state per room', async () => {
      const saveReq = {
        body: {
          roomId: 'Turing-Lecture-Hall-1',
          boardData: { elements: [{ type: 'rect', x: 10, y: 10, width: 100, height: 50 }] },
          createdBy: 'Dr. Ramesh Kumar'
        }
      }
      const saveRes = createMockRes()
      await AdvancedTechController.saveWhiteboard(saveReq, saveRes)
      assert.equal(saveRes.statusCode, 200)

      const getReq = { params: { roomId: 'Turing-Lecture-Hall-1' } }
      const getRes = createMockRes()
      await AdvancedTechController.getWhiteboard(getReq, getRes)
      assert.equal(getRes.statusCode, 200)
      assert.equal(getRes.data.whiteboard.roomId, 'Turing-Lecture-Hall-1')
    })

    test('submitSimulation records virtual lab experiment scores', async () => {
      const req = {
        body: {
          studentId: 101,
          simulationType: 'Photoelectric Effect & Quantum Emission',
          score: 96.5,
          durationSeconds: 240,
          parameters: { wavelength: 380, workFunction: 2.2 }
        }
      }
      const res = createMockRes()
      await AdvancedTechController.submitSimulation(req, res)

      assert.equal(res.statusCode, 201)
      assert.ok(res.data.success)
      assert.equal(res.data.result.score, 96.5)
    })

    test('instantTranslate translates text on the fly across Indian and foreign languages', async () => {
      const req = {
        body: {
          text: 'welcome',
          targetLang: 'hi'
        }
      }
      const res = createMockRes()
      await AdvancedTechController.instantTranslate(req, res)

      assert.equal(res.statusCode, 200)
      assert.ok(res.data.success)
      assert.equal(res.data.targetLang, 'hi')
      assert.ok(res.data.translatedText.length > 0)
    })
  })

})
