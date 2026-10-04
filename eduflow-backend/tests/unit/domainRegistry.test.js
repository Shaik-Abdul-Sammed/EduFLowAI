import { test, describe } from 'node:test'
import assert from 'node:assert'
import { DOMAINS, getDomain, getAllDomains, isValidDomain } from '../../src/services/insights/domainRegistry.js'

describe('Domain Registry Unit Tests', () => {
  test('Registry contains exactly 6 domains including nirf', () => {
    const allDomains = getAllDomains()
    assert.strictEqual(allDomains.length, 6, 'Should contain exactly 6 domains')
    const keys = Object.keys(DOMAINS)
    assert.strictEqual(keys.length, 6)
    assert.ok(keys.includes('accreditation'))
    assert.ok(keys.includes('student-success'))
    assert.ok(keys.includes('timetable'))
    assert.ok(keys.includes('admissions'))
    assert.ok(keys.includes('finance'))
    assert.ok(keys.includes('nirf'))
  })

  test('Each domain has persona, templates, metrics, and targets', () => {
    const allDomains = getAllDomains()
    for (const d of allDomains) {
      assert.ok(d.key, 'Domain must have key')
      assert.ok(d.name, `Domain ${d.key} must have name`)
      assert.ok(typeof d.persona === 'string' && d.persona.length > 5, `${d.key} must have persona`)
      assert.ok(d.explainTemplate && d.explainTemplate.includes('{persona}'), `${d.key} must have explainTemplate`)
      assert.ok(d.askTemplate && d.askTemplate.includes('{persona}'), `${d.key} must have askTemplate`)
      assert.ok(d.predictTemplate && d.predictTemplate.includes('{persona}'), `${d.key} must have predictTemplate`)
      assert.ok(d.improveTemplate && d.improveTemplate.includes('{persona}'), `${d.key} must have improveTemplate`)
      assert.ok(Array.isArray(d.metrics) && d.metrics.length > 0, `${d.key} must have metrics list`)
      assert.ok(Array.isArray(d.targets) && d.targets.length > 0, `${d.key} must have targets list`)
    }
  })

  test('Unknown domain returns null', () => {
    assert.strictEqual(getDomain('invalid-domain'), null)
    assert.strictEqual(getDomain(''), null)
    assert.strictEqual(getDomain(null), null)
    assert.strictEqual(getDomain(undefined), null)
    assert.strictEqual(isValidDomain('unknown'), false)
  })

  test('Known domain returns valid config via getDomain', () => {
    const d = getDomain('student-success')
    assert.ok(d)
    assert.strictEqual(d.key, 'student-success')
    assert.ok(isValidDomain('student-success'))
    assert.ok(isValidDomain('ACCREDITATION')) // case insensitive
  })
})
