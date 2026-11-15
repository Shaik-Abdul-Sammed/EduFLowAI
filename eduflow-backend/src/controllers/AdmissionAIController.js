/**
 * AdmissionAIController.js
 * AI-Driven Admission Application Categorization Engine
 * Automatically tags applicant profiles (Merit-Scholarship, High-Risk, Direct-Merit, Need-Based-Aid)
 * based on institutional criteria, academic scores, and socioeconomic thresholds.
 */

import { logger } from '../utils/logger.js'

let applicationsStore = [
  {
    id: 1,
    applicant_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    gpa: 9.3,
    entrance_score: 96.5,
    income: 380000,
    category: 'General',
    department: 'Computer Science & Engineering',
    aiCategory: 'Merit-Scholarship',
    confidence: 0.96,
    reasoning: "Applicant exhibits exceptional academic excellence (GPA 9.3 > 8.5) and household income under ₹5L, qualifying for full institutional Merit-Scholarship.",
    status: 'PENDING',
    submittedAt: '2026-11-10T10:30:00Z'
  },
  {
    id: 2,
    applicant_name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    gpa: 5.4,
    entrance_score: 38.0,
    income: 650000,
    category: 'General',
    department: 'Information Technology',
    aiCategory: 'High-Risk',
    confidence: 0.92,
    reasoning: "Academic record (GPA 5.4 < 6.0) and entrance percentile fall below standards. Tagged as High-Risk requiring foundation bridge course.",
    status: 'PENDING',
    submittedAt: '2026-11-11T12:15:00Z'
  },
  {
    id: 3,
    applicant_name: 'Vikram Choudhury',
    email: 'vikram.c@example.com',
    gpa: 8.8,
    entrance_score: 91.0,
    income: 780000,
    category: 'OBC',
    department: 'Electronics & Communication',
    aiCategory: 'Direct-Merit',
    confidence: 0.94,
    reasoning: "Consistently high entrance percentile (91.0) and strong undergraduate GPA (8.8) qualify candidate for direct merit allocation.",
    status: 'PENDING',
    submittedAt: '2026-11-12T09:45:00Z'
  },
  {
    id: 4,
    applicant_name: 'Priya Sundaram',
    email: 'priya.s@example.com',
    gpa: 7.9,
    entrance_score: 82.5,
    income: 180000,
    category: 'SC',
    department: 'Data Science',
    aiCategory: 'Need-Based-Aid',
    confidence: 0.90,
    reasoning: "Household annual income of ₹1.8L (< ₹2.5L) satisfies institutional criteria for 100% tuition waiver under Need-Based-Aid.",
    status: 'PENDING',
    submittedAt: '2026-11-13T14:20:00Z'
  }
]

export class AdmissionAIController {
  /**
   * Evaluates application metrics using institutional logic & AI rules.
   */
  static categorizeApplication({ gpa, entrance_score, income, category }) {
    const numGpa = parseFloat(gpa) || 0
    const numScore = parseFloat(entrance_score) || 0
    const numIncome = parseFloat(income) || 0

    // Rule 1: Merit-Scholarship (GPA > 8.5 and income < 5L)
    if (numGpa > 8.5 && numIncome > 0 && numIncome < 500000) {
      return {
        category: 'Merit-Scholarship',
        confidence: 0.95,
        reasoning: `Applicant exhibits superior academic merit with GPA of ${numGpa} (> 8.5) and annual family income of ₹${numIncome.toLocaleString('en-IN')} (< ₹5L), qualifying for institutional Merit-Scholarship.`
      }
    }

    // Rule 2: High-Risk (GPA < 6.0 or entrance_score < 40)
    if (numGpa < 6.0 || (numScore > 0 && numScore < 40)) {
      return {
        category: 'High-Risk',
        confidence: 0.91,
        reasoning: `Academic indicators (GPA ${numGpa} < 6.0 / entrance score ${numScore}) reflect significant probability of first-year academic attrition. Tagged as High-Risk; prerequisite bridge course advised.`
      }
    }

    // Rule 3: Need-Based-Aid (income < 2.5L)
    if (numIncome > 0 && numIncome < 250000) {
      return {
        category: 'Need-Based-Aid',
        confidence: 0.89,
        reasoning: `Family annual income of ₹${numIncome.toLocaleString('en-IN')} (< ₹2.5L) qualifies candidate for full institutional financial aid and government tuition subsidy.`
      }
    }

    // Rule 4: Direct-Merit (GPA >= 7.5 and entrance_score >= 85)
    if (numGpa >= 7.5 && numScore >= 85) {
      return {
        category: 'Direct-Merit',
        confidence: 0.93,
        reasoning: `Strong entrance rank (${numScore} percentile) paired with robust GPA (${numGpa}) warrants Direct-Merit seat confirmation without interview delays.`
      }
    }

    // Default: General-Admission
    return {
      category: 'General-Admission',
      confidence: 0.85,
      reasoning: `Candidate meets standard eligibility thresholds (GPA ${numGpa}, entrance ${numScore}). Application routed for standard verification.`
    }
  }

  /**
   * POST /api/v1/admissions/analyze-application
   */
  static async analyzeApplication(req, res) {
    try {
      const {
        applicant_name = 'Anonymous Applicant',
        email = '',
        gpa = 7.5,
        entrance_score = 75,
        income = 400000,
        category = 'General',
        department = 'Computer Science & Engineering'
      } = req.body || {}

      const analysis = AdmissionAIController.categorizeApplication({
        gpa,
        entrance_score,
        income,
        category
      })

      // Add to in-memory ledger
      const newApp = {
        id: applicationsStore.length + 1,
        applicant_name,
        email,
        gpa: parseFloat(gpa) || 7.0,
        entrance_score: parseFloat(entrance_score) || 75,
        income: parseFloat(income) || 400000,
        category,
        department,
        aiCategory: analysis.category,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        status: 'PENDING',
        submittedAt: new Date().toISOString()
      }
      applicationsStore.unshift(newApp)

      return res.status(200).json({
        success: true,
        applicant_name,
        category: analysis.category,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        applicationId: newApp.id
      })
    } catch (err) {
      logger.error(`Error in analyzeApplication: ${err.message}`)
      return res.status(500).json({ error: 'Failed to analyze admission application' })
    }
  }

  /**
   * GET /api/v1/admissions/applications
   */
  static async getApplications(_req, res) {
    return res.status(200).json({
      success: true,
      total: applicationsStore.length,
      applications: applicationsStore
    })
  }

  /**
   * POST /api/v1/admissions/approve-category
   */
  static async approveCategory(req, res) {
    try {
      const { applicationId, approvedCategory, notes = '' } = req.body || {}
      const app = applicationsStore.find(a => a.id === Number(applicationId))

      if (!app) {
        return res.status(404).json({ error: 'Application not found' })
      }

      app.status = 'APPROVED'
      app.finalCategory = approvedCategory || app.aiCategory
      app.approvalNotes = notes
      app.approvedAt = new Date().toISOString()

      return res.status(200).json({
        success: true,
        message: `Category '${app.finalCategory}' approved for applicant ${app.applicant_name}`,
        application: app
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to approve application category' })
    }
  }

  /**
   * Reset helper for test suites
   */
  static _resetMemory() {
    applicationsStore = [
      {
        id: 1,
        applicant_name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        gpa: 9.3,
        entrance_score: 96.5,
        income: 380000,
        category: 'General',
        department: 'Computer Science & Engineering',
        aiCategory: 'Merit-Scholarship',
        confidence: 0.96,
        reasoning: "Applicant exhibits exceptional academic excellence (GPA 9.3 > 8.5) and household income under ₹5L, qualifying for full institutional Merit-Scholarship.",
        status: 'PENDING',
        submittedAt: '2026-11-10T10:30:00Z'
      }
    ]
  }
}

export default AdmissionAIController
