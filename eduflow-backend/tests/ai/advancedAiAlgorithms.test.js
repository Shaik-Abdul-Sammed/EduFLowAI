import { test, describe } from 'node:test'
import assert from 'node:assert'
import { AdvancedRagService } from '../../src/services/ai/AdvancedRagService.js'
import { IntentClassifier } from '../../src/services/ai/IntentClassifier.js'
import { DataNormalizer } from '../../src/services/ai/DataNormalizer.js'

describe('Phase 1: Deep AI Algorithms & Data Handling', () => {
  describe('Advanced RAG & Vector Cosine Similarity', () => {
    test('cosineSimilarity calculates exact mathematical cosine score', () => {
      // Orthogonal vectors
      const v1 = [1, 0, 0]
      const v2 = [0, 1, 0]
      assert.strictEqual(AdvancedRagService.cosineSimilarity(v1, v2), 0)

      // Identical vectors
      const v3 = [0.6, 0.8]
      const v4 = [0.6, 0.8]
      const simIdentical = AdvancedRagService.cosineSimilarity(v3, v4)
      assert(Math.abs(simIdentical - 1.0) < 0.0001, `Expected ~1.0, got ${simIdentical}`)

      // Parallel opposite vectors
      const v5 = [1, 2, 3]
      const v6 = [2, 4, 6]
      const simScaled = AdvancedRagService.cosineSimilarity(v5, v6)
      assert(Math.abs(simScaled - 1.0) < 0.0001, `Expected 1.0 for parallel, got ${simScaled}`)
    })

    test('generateFastEmbedding returns unit-normalized 1536 vector', () => {
      const vec = AdvancedRagService.generateFastEmbedding('NAAC Accreditation Criterion 2 Report')
      assert.strictEqual(vec.length, 1536)

      let norm = 0
      for (const val of vec) norm += val * val
      assert(Math.abs(Math.sqrt(norm) - 1.0) < 0.001, 'Vector must be unit normalized')
    })

    test('rerankChunks prioritizes exact matches, token density and authority', () => {
      const query = 'NAAC Criterion 2 teaching learning evaluation'
      const candidates = [
        { id: 1, text: 'General cafeteria menu and sports schedules.', similarity: 0.70 },
        { id: 2, text: 'NAAC Criterion 2 covers Teaching-Learning and Evaluation metrics.', similarity: 0.75, metadata: { verified: true } },
        { id: 3, text: 'Criterion 1 curricular aspects overview.', similarity: 0.72 },
      ]

      const reranked = AdvancedRagService.rerankChunks(candidates, query, { topK: 2 })
      assert.strictEqual(reranked.length, 2)
      assert.strictEqual(reranked[0].id, 2, 'Candidate 2 should be ranked top due to phrase match & authority')
      assert(reranked[0].reRankScore > reranked[1].reRankScore)
    })
  })

  describe('Intent Classification & Sub-Agent Routing', () => {
    test('classifies report generation intent and routes to correct sub-agent', () => {
      const result = IntentClassifier.classify('Generate NAAC SSR Criterion 2 Report for SSIT')
      assert.strictEqual(result.intent, 'REPORT_GENERATION')
      assert.strictEqual(result.targetDomain, 'accreditation')
      assert.strictEqual(result.subAgent, 'AccreditationOfficerSubAgent')
      assert.strictEqual(result.extractedParams.criterion, 2)
      assert(result.confidence >= 0.90)
    })

    test('classifies data query intent and routes to student-success sub-agent', () => {
      const result = IntentClassifier.classify('Show me at-risk students with CGPA under 6.0 and low attendance')
      assert.strictEqual(result.intent, 'DATA_QUERY')
      assert.strictEqual(result.targetDomain, 'student-success')
      assert.strictEqual(result.subAgent, 'StudentSuccessOfficerSubAgent')
      assert(result.confidence >= 0.90)
    })

    test('classifies general question intent and routes to general officer', () => {
      const result = IntentClassifier.classify('What are the key guidelines for UGC NEP 2020 curriculum?')
      assert.strictEqual(result.intent, 'GENERAL_QUESTION')
      assert(result.confidence >= 0.85)
    })

    test('classifies staff and non-teaching queries to GENERAL_REPORT_GENERATION', () => {
      const result = IntentClassifier.classify('Generate a report on teaching and non-teaching staff for HR review')
      assert.strictEqual(result.intent, 'GENERAL_REPORT_GENERATION')
      assert(result.confidence >= 0.90)
    })
  })

  describe('Data Normalization & Hallucination Prevention', () => {
    test('normalizes academic metrics into strict verified JSON', () => {
      const raw = {
        totalStudents: '1250',
        totalFaculty: '85',
        averageCgpa: 7.8234,
        averageAttendance: 82.12,
        phdFaculty: 40,
      }
      const normalized = DataNormalizer.normalizeAcademicMetrics(raw)

      assert.strictEqual(typeof normalized.total_students, 'number')
      assert.strictEqual(normalized.total_students, 1250)
      assert.strictEqual(normalized.average_cgpa, 7.82)
      assert.strictEqual(normalized.average_attendance_percentage, 82.1)
      assert.strictEqual(normalized.student_faculty_ratio, 14.7)
      assert.strictEqual(normalized.institutional_data.teachingStaffCount, 85)
      assert.strictEqual(normalized.institutional_data.nonTeachingStaffCount, 45)
      assert.strictEqual(normalized.institutional_data.totalStaff, 130)
      assert.strictEqual(normalized.institutional_data.students, 1250)

      const block = DataNormalizer.formatStrictJsonPromptBlock('test_metrics', normalized)
      assert(block.includes('"total_students": 1250'))
      assert(block.includes('VERIFIED DATABASE METRICS (STRICT JSON)'))
    })

    test('normalizes financial defaulter records strictly', () => {
      const normalized = DataNormalizer.normalizeFinancialMetrics()
      assert.strictEqual(normalized.total_overdue_greater_60_days_inr, 180000)
      assert.strictEqual(normalized.total_defaulter_accounts, 14)
      assert(Array.isArray(normalized.top_defaulters))
      assert.strictEqual(normalized.top_defaulters.length, 5)
    })
  })
})
