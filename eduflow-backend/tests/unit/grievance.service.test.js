import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { AIService } from '../../src/services/AIService.js'

describe('Unit: Grievance Intelligence & AI Sentiment Classification', () => {
  it('correctly flags urgent harassment or anti-ragging complaints as CRITICAL', () => {
    const text = 'Senior hostel students are verbally harassing and threatening juniors in Block 4 room 201'
    const sentiment = AIService.analyzeGrievanceSentiment(text)

    assert.ok(sentiment, 'Must return sentiment analysis')
    assert.strictEqual(sentiment.priority, 'CRITICAL', 'Harassment incidents must triage directly to CRITICAL')
  })

  it('classifies general lab hardware complaints with moderate or medium priority', () => {
    const text = 'The mouse on computer 14 in Linux Lab 2 has an intermittent scroll wheel issue.'
    const sentiment = AIService.analyzeGrievanceSentiment(text)

    assert.ok(sentiment, 'Must return sentiment analysis')
    assert.notStrictEqual(sentiment.priority, 'CRITICAL', 'Hardware issues should not trip critical alarms')
  })

  it('computes numerical sentiment polarity score', () => {
    const positive = 'The new clean drinking water dispenser in the library works wonderfully.'
    const negative = 'Hostel cafeteria food quality was unacceptable today; vegetables were undercooked.'

    const posAnalysis = AIService.analyzeGrievanceSentiment(positive)
    const negAnalysis = AIService.analyzeGrievanceSentiment(negative)

    assert.ok(typeof posAnalysis.score === 'number', 'Sentiment score must be numeric')
    assert.ok(typeof negAnalysis.score === 'number', 'Sentiment score must be numeric')
  })
})
