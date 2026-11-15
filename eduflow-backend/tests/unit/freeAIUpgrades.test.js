import { test, describe } from 'node:test'
import assert from 'node:assert'
import { z } from 'zod'
import { AIService } from '../../src/services/AIService.js'

describe('Phase 4: Free AI Intelligence Upgrades', () => {
  describe('Multi-Turn Conversation Memory (Feature 1)', () => {
    test('buildConversationContext formats conversation messages into prompt memory', () => {
      const context = {
        messages: [
          { role: 'User', content: 'What is my current GPA?' },
          { role: 'Assistant', content: 'Your current cumulative GPA is 3.82.' }
        ]
      }

      const memory = AIService.buildConversationContext(context)

      assert.ok(memory.includes('RECENT CONVERSATION MEMORY'))
      assert.ok(memory.includes('User: What is my current GPA?'))
      assert.ok(memory.includes('Assistant: Your current cumulative GPA is 3.82.'))
    })

    test('buildConversationContext retains only the last 3 turns from a longer history', () => {
      const context = {
        history: [
          { role: 'User', content: 'Turn 1' },
          { role: 'Assistant', content: 'Reply 1' },
          { role: 'User', content: 'Turn 2' },
          { role: 'Assistant', content: 'Reply 2' },
          { role: 'User', content: 'Turn 3' },
          { role: 'Assistant', content: 'Reply 3' }
        ]
      }

      const memory = AIService.buildConversationContext(context)

      // Only the last 3 items should be included (Reply 2, Turn 3, Reply 3)
      assert.strictEqual(memory.includes('Turn 1'), false)
      assert.strictEqual(memory.includes('Reply 1'), false)
      assert.ok(memory.includes('Reply 2'))
      assert.ok(memory.includes('Turn 3'))
      assert.ok(memory.includes('Reply 3'))
    })
  })

  describe('Zero-Cost JSON Extraction & Schema Validation (Feature 2)', () => {
    const studentReportSchema = z.object({
      rollNumber: z.string(),
      creditsEarned: z.number(),
      status: z.enum(['ON_TRACK', 'DEFICIENT'])
    })

    test('extractAndValidateJson parses raw JSON and validates against schema', () => {
      const rawJson = '{"rollNumber": "2024-CSE-001", "creditsEarned": 96, "status": "ON_TRACK"}'
      const result = AIService.extractAndValidateJson(rawJson, studentReportSchema)

      assert.strictEqual(result.success, true)
      assert.strictEqual(result.data.rollNumber, '2024-CSE-001')
      assert.strictEqual(result.data.creditsEarned, 96)
      assert.strictEqual(result.data.status, 'ON_TRACK')
    })

    test('extractAndValidateJson strips markdown fences before parsing', () => {
      const fencedJson = '```json\n{\n  "rollNumber": "2024-CSE-002",\n  "creditsEarned": 45,\n  "status": "DEFICIENT"\n}\n```'
      const result = AIService.extractAndValidateJson(fencedJson, studentReportSchema)

      assert.strictEqual(result.success, true)
      assert.strictEqual(result.data.rollNumber, '2024-CSE-002')
      assert.strictEqual(result.data.status, 'DEFICIENT')
    })

    test('extractAndValidateJson returns validation error on schema mismatch', () => {
      const invalidData = '{"rollNumber": "2024-CSE-003", "creditsEarned": "ninety", "status": "UNKNOWN"}'
      const result = AIService.extractAndValidateJson(invalidData, studentReportSchema)

      assert.strictEqual(result.success, false)
      assert.ok(result.error)
    })
  })

  describe('Free Sentiment Analysis & Grievance Priority Escalation (Feature 11)', () => {
    test('analyzeGrievanceSentiment flags critical keywords and sets CRITICAL priority', () => {
      const criticalText = 'I faced severe harassment in the hostel and feel there is a safety emergency.'
      const analysis = AIService.analyzeGrievanceSentiment(criticalText)

      assert.strictEqual(analysis.priority, 'CRITICAL')
      assert.strictEqual(analysis.score, 0.95)
      assert.ok(analysis.flags.includes('harassment'))
      assert.ok(analysis.flags.includes('emergency'))
    })

    test('analyzeGrievanceSentiment flags urgent issues as HIGH priority', () => {
      const urgentText = 'The electricity switchboard in classroom 12 is sparking. This is urgent and unsafe.'
      const analysis = AIService.analyzeGrievanceSentiment(urgentText)

      assert.strictEqual(analysis.priority, 'HIGH')
      assert.strictEqual(analysis.score, 0.8)
      assert.ok(analysis.flags.includes('urgent'))
      assert.ok(analysis.flags.includes('unsafe'))
    })

    test('analyzeGrievanceSentiment handles low-priority routine requests', () => {
      const routineText = 'Please provide duplicate receipt for payment.'
      const analysis = AIService.analyzeGrievanceSentiment(routineText)

      assert.strictEqual(analysis.priority, 'LOW')
      assert.strictEqual(analysis.score, 0.2)
      assert.strictEqual(analysis.flags.length, 0)
    })
  })
})
