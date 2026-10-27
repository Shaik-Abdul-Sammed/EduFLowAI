import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { OFFICER_PROMPTS, extractCriterionNumber } from '../../src/ai/officers/officerPrompts.js'
import { enrichPromptWithDatabaseData, OfficerController } from '../../src/controllers/OfficerController.js'
import { AIService } from '../../src/services/AIService.js'

describe('Critical AI Officer Prompts & Hallucination Prevention', () => {

  test('(1) Accreditation Officer: Prompt "Generate Table 2.1 for Criterion 2" contains Criterion 2 and excludes Criterion 1', async () => {
    const prompt = 'Generate Table 2.1 for Criterion 2'
    const cNum = extractCriterionNumber(prompt)
    assert.equal(cNum, '2', 'Should extract Criterion 2 from the user prompt')

    const systemPrompt = OFFICER_PROMPTS.accreditation({}, prompt)
    assert.ok(systemPrompt.includes('Criterion 2'), 'Prompt must contain Criterion 2')
    assert.ok(
      systemPrompt.includes('STRICTLY for Criterion 2'),
      'Hard constraint for Criterion 2 must be injected'
    )
    assert.ok(
      !systemPrompt.includes('Criterion 1'),
      'Prompt for Criterion 2 must NOT contain Criterion 1'
    )

    const response = await AIService.processPrompt('accreditation', prompt, {})
    assert.ok(response.includes('Criterion 2'), 'Response must focus on Criterion 2')
    assert.ok(!response.includes('Criterion 1'), 'Response must NOT hallucinate Criterion 1')
  })

  test('(2) Student Success Officer: Prompt "List top 5 at-risk students" includes database query results', async () => {
    const prompt = 'List top 5 at-risk students'
    const enriched = await enrichPromptWithDatabaseData(prompt, 1)

    assert.ok(
      enriched.includes('[DATABASE QUERY RESULTS - TOP AT-RISK STUDENTS]'),
      'Enriched prompt must include at-risk students DB query results'
    )
    assert.ok(
      enriched.includes('Rahul Sharma') || enriched.includes('attendance_percentage') || enriched.includes('CGPA'),
      'Enriched prompt must include student record data'
    )

    const response = await AIService.processPrompt('student-success', enriched, {})
    assert.ok(
      response.includes('Rahul Sharma') || response.includes('At-Risk') || response.includes('Dropout Risk'),
      'AI response must incorporate student risk context'
    )
  })

  test('(3) Timetable Officer: Prompt "Check for room clashes in CSE 3A" includes room constraint data', async () => {
    const prompt = 'Check for room clashes in CSE 3A'
    const enriched = await enrichPromptWithDatabaseData(prompt, 1)

    assert.ok(
      enriched.includes('[DATABASE ROOM CONSTRAINT DATA]'),
      'Enriched prompt must include database room constraint data'
    )
    assert.ok(
      enriched.includes('Hall 201') || enriched.includes('Classrooms Available') || enriched.includes('Constraint'),
      'Enriched prompt must detail specific room capacities and constraints'
    )

    const response = await AIService.processPrompt('timetable', enriched, {})
    assert.ok(
      response.includes('Hall 201') || response.includes('Conflict-Free') || response.includes('Schedule'),
      'AI response must reflect room constraint calculations'
    )
  })

  test('(4) Admissions Officer: Prompt "Predict B.Tech yield" includes funnel data', async () => {
    const prompt = 'Predict B.Tech yield'
    const enriched = await enrichPromptWithDatabaseData(prompt, 1)

    assert.ok(
      enriched.includes('[DATABASE ADMISSIONS FUNNEL DATA]'),
      'Enriched prompt must include verified admissions funnel data'
    )
    assert.ok(
      enriched.includes('450') || enriched.includes('Yield') || enriched.includes('Seats Allotted'),
      'Enriched prompt must contain candidate funnel numbers'
    )

    const response = await AIService.processPrompt('admissions', enriched, {})
    assert.ok(
      response.includes('Yield') || response.includes('Admissions') || response.includes('Funnel'),
      'AI response must reflect admissions funnel metrics'
    )
  })

  test('(5) Finance Officer: Prompt "List top 10 defaulters over 60 days" includes invoice aging data', async () => {
    const prompt = 'List top 10 defaulters over 60 days'
    const enriched = await enrichPromptWithDatabaseData(prompt, 1)

    assert.ok(
      enriched.includes('[DATABASE INVOICE AGING & DEFAULTER DATA]'),
      'Enriched prompt must include invoice aging and defaulter data'
    )
    assert.ok(
      enriched.includes('>60 Days') || enriched.includes('Aging Buckets') || enriched.includes('Outstanding Overdue'),
      'Enriched prompt must contain aging buckets and defaulter amounts'
    )

    const response = await AIService.processPrompt('finance', enriched, {})
    assert.ok(
      response.includes('Reconciliation') || response.includes('Defaulter') || response.includes('Fee'),
      'AI response must analyze fee arrears and aging buckets'
    )
  })

  test('(6) Accreditation Officer generates distinct, domain-specific reports for each criterion (1 to 7)', async () => {
    for (let c = 1; c <= 7; c++) {
      const response = await AIService.processPrompt('accreditation', `Generate SSR Report for Criterion ${c}`, {})
      assert.ok(
        response.includes(`Criterion ${c}`) || response.includes(`Metric ${c}`),
        `Response for Criterion ${c} must contain Criterion ${c} header or metrics`
      )
    }

    const allResponse = await AIService.processPrompt('accreditation', 'Generate Full SSR for All Criteria', {})
    assert.ok(
      allResponse.includes('7-Criteria') || allResponse.includes('Comprehensive NAAC'),
      'Response for All Criteria must contain comprehensive 7-criteria summary'
    )
  })

  test('(7) Accreditation Officer generates requested criterion when passed via twin/context', async () => {
    for (let c = 1; c <= 7; c++) {
      const response = await AIService.processPrompt('accreditation', 'Generate SSR Analysis', { criterion: `Criterion ${c}` })
      assert.ok(
        response.includes(`Criterion ${c}`) || response.includes(`Metric ${c}`),
        `Context criterion ${c} must generate report for Criterion ${c}`
      )
    }

    const allResponse = await AIService.processPrompt('accreditation', 'Generate SSR Analysis', { criterion: 'All Criteria' })
    assert.ok(
      allResponse.includes('7-Criteria') || allResponse.includes('Comprehensive NAAC'),
      'Context All Criteria must generate full 7-criteria summary'
    )
  })

  test('(8) Admissions, Finance, Student Success, and Timetable Officers generate distinct domain reports for all actions', async () => {
    // 1. Admissions Officer prompts
    const admissionsPrompts = [
      'Analyze application yield and predict final enrollment',
      'Generate automated personalized follow-up queue',
      'Lead Scoring & Prioritization',
    ]
    for (const prompt of admissionsPrompts) {
      const res = await AIService.processPrompt('admissions', prompt, {})
      assert.ok(!res.includes('Executive Institutional Intelligence Report'), `Admissions prompt "${prompt}" must not fall back to executive report`)
      assert.ok(res.includes('Admissions') || res.includes('Candidate') || res.includes('Yield'), `Admissions prompt "${prompt}" must contain admissions domain content`)
    }

    // 2. Finance Officer prompts
    const financePrompts = [
      'Reconcile fee collection against bank deposits for March 2026',
      'Flag unmatched UPI/NEFT transactions with bank statement',
      'Audit fee defaulters and schedule automated payment reminders',
      'Defaulter Follow-up Queue',
    ]
    for (const prompt of financePrompts) {
      const res = await AIService.processPrompt('finance', prompt, {})
      assert.ok(!res.includes('Executive Institutional Intelligence Report'), `Finance prompt "${prompt}" must not fall back to executive report`)
      assert.ok(!res.includes('Optimized Academic Timetable Schedule'), `Finance prompt "${prompt}" must not be misrouted to timetable`)
      assert.ok(res.includes('Fee') || res.includes('Reconciliation') || res.includes('Defaulter') || res.includes('Payment'), `Finance prompt "${prompt}" must contain finance domain content`)
    }

    // 3. Student Success Officer prompts
    const studentSuccessPrompts = [
      'Run institutional dropout risk analysis for semester 4',
      'Generate automated intervention plan for high-risk students',
      'Audit attendance patterns and backlog correlation',
      'Generate Mentor Remediation List',
    ]
    for (const prompt of studentSuccessPrompts) {
      const res = await AIService.processPrompt('student-success', prompt, {})
      assert.ok(!res.includes('Executive Institutional Intelligence Report'), `Student Success prompt "${prompt}" must not fall back to executive report`)
      assert.ok(res.includes('Dropout Risk') || res.includes('Mentor Remediation') || res.includes('Attendance Patterns') || res.includes('At-Risk'), `Student Success prompt "${prompt}" must contain student success content`)
    }

    // 4. Timetable Officer prompts
    const timetablePrompts = [
      'Generate conflict-free timetable for CSE Department',
      'Optimize faculty workload balancing across sections',
      'Resolve computer laboratory allocation conflicts',
      'Balance Faculty Workload',
    ]
    for (const prompt of timetablePrompts) {
      const res = await AIService.processPrompt('timetable', prompt, {})
      assert.ok(!res.includes('Executive Institutional Intelligence Report'), `Timetable prompt "${prompt}" must not fall back to executive report`)
      assert.ok(res.includes('Timetable') || res.includes('Workload') || res.includes('Conflict') || res.includes('Schedule'), `Timetable prompt "${prompt}" must contain timetable domain content`)
    }
  })

})
