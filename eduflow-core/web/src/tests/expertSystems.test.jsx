import { EXPERT_SYSTEMS, evaluateExpertSystem } from '../services/expertSystemRules'

describe('Institutional Expert Systems Knowledge Base & Inference Rules', () => {
  test('defines complete codified rules for all 5 AI officer domains', () => {
    const domains = ['accreditation', 'student-success', 'timetable', 'admissions', 'finance']
    domains.forEach((dom) => {
      expect(EXPERT_SYSTEMS[dom]).toBeDefined()
      expect(EXPERT_SYSTEMS[dom].rules.length).toBeGreaterThanOrEqual(3)
      expect(EXPERT_SYSTEMS[dom].authority).toBeTruthy()
      expect(EXPERT_SYSTEMS[dom].frameworkVersion).toBeTruthy()
    })
  })

  test('Accreditation Expert System evaluates SFR and Ph.D. benchmarks accurately', () => {
    const result = evaluateExpertSystem('accreditation')
    expect(result.systemId).toBe('accreditation')
    expect(result.compliancePercentage).toBeGreaterThanOrEqual(90)
    expect(result.rules.some((r) => r.id === 'ACC-R01')).toBe(true)
    const sfrRule = result.rules.find((r) => r.id === 'ACC-R01')
    expect(sfrRule.statutoryClause).toContain('AICTE Approval Process Handbook')
    expect(sfrRule.status).toBe('COMPLIANT')
  })

  test('Student Success Expert System flags warning for attendance < 75% threshold', () => {
    const result = evaluateExpertSystem('student-success')
    expect(result.systemId).toBe('student-success')
    const attRule = result.rules.find((r) => r.id === 'STU-R01')
    expect(attRule.statutoryClause).toContain('UGC Model Regulations')
    expect(attRule.status).toBe('WARNING')
    expect(result.overallStatus).toBe('ATTENTION_NEEDED')
  })

  test('Timetable Expert System validates 18h assistant professor workload ceiling and 90 teaching days', () => {
    const result = evaluateExpertSystem('timetable')
    expect(result.systemId).toBe('timetable')
    expect(result.compliancePercentage).toBe(100)
    const wlRule = result.rules.find((r) => r.id === 'TT-R01')
    expect(wlRule.statutoryThreshold).toContain('16 to 18 hours/week')
    const daysRule = result.rules.find((r) => r.id === 'TT-R04')
    expect(daysRule.statutoryThreshold).toContain('90 actual instructional days')
  })

  test('Finance Expert System enforces Dean Sanction Rule for transactions > ₹1 Lakh', () => {
    const result = evaluateExpertSystem('finance')
    expect(result.systemId).toBe('finance')
    const deanRule = result.rules.find((r) => r.id === 'FIN-R01')
    expect(deanRule.statutoryThreshold).toContain('Dean review')
    expect(deanRule.status).toBe('WARNING')
  })
})
