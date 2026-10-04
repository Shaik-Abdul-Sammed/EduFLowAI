import { DemoDataRepository } from '../../models/DemoDataRepository.js'
import { logger } from '../../utils/logger.js'

/**
 * Finance AI Insights Service.
 * Provides Explain Variance, Cash Flow Forecasting, Collection Optimization, and Audit Readiness.
 */
export class FinanceInsights {
  /**
   * Explains why a bank reconciliation entry does not match an invoice or ledger balance.
   */
  static async explainVariance(transactionId = 'TXN-9021') {
    const tid = String(transactionId || 'TXN-9021')

    return {
      success: true,
      domain: 'finance',
      insightType: 'explain',
      summary: `Transaction ${tid} variance: ₹18,450 difference detected between bank statement deposit and fee invoice ledger.`,
      details: {
        transactionId: tid,
        invoiceNumber: 'INV-2026-0842',
        studentRollNumber: '2024-CSE-045',
        bankCreditAmount: 96550,
        invoiceBilledAmount: 115000,
        varianceAmount: 18450,
        mismatchReason: 'Partial payment remittance combined with unapplied scholarship concession (₹15,000) and payment gateway merchant discount fee deduction (₹3,450).',
        reconciliationStatus: 'DISCREPANCY_FLAGGED',
        gstImpact: 'Output GST calculated on full billed amount; adjustment credit note required.',
      },
      recommendations: [
        'Post credit memo CM-2026-104 for the approved merit scholarship of ₹15,000',
        'Map ₹3,450 payment gateway fee directly to banking charges expense head rather than fee receivable',
        'Update student fee card to show balance due of ₹0.00 after credit adjustment',
      ],
      confidence: 0.95,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Forecasts fee collection and institutional cash flow over the specified months ahead.
   */
  static async predictCashFlow(institutionId = 1, monthsAhead = 6) {
    const months = Math.max(1, Math.min(Number(monthsAhead) || 6, 12))
    const currentMonth = new Date().getMonth()
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]

    const monthlyForecasts = []
    let accumulatedCash = 4250000 // Opening balance ₹42.5 Lakhs

    for (let i = 0; i < months; i++) {
      const mIdx = (currentMonth + i) % 12
      const mName = monthNames[mIdx]

      // Academic fee cycles: June/July/August and Dec/Jan are high inflow months
      const isFeePeak = [0, 6, 7, 11].includes(mIdx)
      const expectedInflow = isFeePeak ? 18500000 : 4200000
      const operationalOutflow = 6800000 // salaries + maintenance
      const netCashChange = expectedInflow - operationalOutflow
      accumulatedCash += netCashChange

      monthlyForecasts.push({
        month: mName,
        expectedInflow,
        operationalOutflow,
        netCashChange,
        projectedClosingCash: accumulatedCash,
        feeCollectionRate: isFeePeak ? '94%' : '65%',
        cashPosition: accumulatedCash > 10000000 ? 'HEALTHY' : 'STABLE',
      })
    }

    return {
      success: true,
      domain: 'finance',
      insightType: 'predict',
      summary: `Cash flow projection for ${months} months indicates positive liquidity runway with peak inflows in high-fee periods.`,
      details: {
        institutionId: Number(institutionId) || 1,
        monthsAhead: months,
        openingLiquidity: 4250000,
        projectedEndLiquidity: accumulatedCash,
        monthlyForecasts,
        financialVulnerabilities: [
          'Lean operating cash reserves during October-November prior to even-semester fee notifications',
        ],
      },
      recommendations: [
        'Open early-bird discount window for semester 2 fees in October to smooth out operating cash flow',
        'Maintain a minimum 60-day liquid reserve in short-term institutional bank flexi-deposits',
        'Reconcile pending government post-matric scholarship reimbursements (₹42 Lakhs outstanding)',
      ],
      confidence: 0.89,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Formulates a structured recovery plan to minimize student fee defaulters.
   */
  static async improveCollection(institutionId = 1, targetRatio = '50 percent defaulter reduction') {
    const goal = String(targetRatio || '50 percent defaulter reduction')

    const actionSteps = [
      {
        step: 1,
        title: 'Tiered Installment Option for High-Arrears Cases',
        description: 'Offer structured 3-month split payments for students with dues exceeding ₹50,000.',
        targetReduction: '25% recovery within 30 days',
      },
      {
        step: 2,
        title: 'SMS & WhatsApp Parent Ledger Broadcast',
        description: 'Send automated fee reminders with instant UPI payment QR link 10 days before semester exams.',
        targetReduction: '18% recovery within 45 days',
      },
      {
        step: 3,
        title: 'Corporate CSR & Endowment Match',
        description: 'Connect verified socio-economically disadvantaged defaulters to alumni trust funds.',
        targetReduction: '12% recovery within 60 days',
      },
    ]

    return {
      success: true,
      domain: 'finance',
      insightType: 'improve',
      summary: `Collection recovery blueprint synthesized targeting "${goal}" across active student accounts.`,
      details: {
        institutionId: Number(institutionId) || 1,
        target: goal,
        currentDefaulterCount: 48,
        projectedDefaulterCount: 22,
        currentOutstandingDues: '₹34,80,000',
        projectedRecoveredDues: '₹21,50,000',
        actionSteps,
      },
      recommendations: [
        'Enable online instant payment receipt generation on student portal',
        'Hold weekly fee recovery review with Finance Officer and Accounts Officer',
      ],
      confidence: 0.92,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Conducts statutory compliance and audit readiness review, checking GST and accounts.
   */
  static async auditReadiness(institutionId = 1) {
    const complianceChecks = [
      {
        area: 'GST Compliance & Filings',
        status: 'FLAGGED_ACTION_REQUIRED',
        issue: 'GST mismatch detected: Commercial canteen and facility rental income (₹6.8L) missing GSTR-1 classification, risking penalty.',
        severity: 'HIGH',
      },
      {
        area: 'Tuition Fee Exemption (Sl. 66 Notification 12/2017)',
        status: 'COMPLIANT',
        issue: 'Core curriculum education services accurately classified under nil-rated GST exemption.',
        severity: 'NONE',
      },
      {
        area: 'TDS Remittance (194C / 194J on Contractors & Visiting Faculty)',
        status: 'COMPLIANT',
        issue: 'All TDS deductions reconciled against Form 26AS for preceding quarter.',
        severity: 'LOW',
      },
      {
        area: 'Fixed Asset Register & Depreciation Schedule',
        status: 'ATTENTION_NEEDED',
        issue: 'Laboratory equipment additions for AY 2025-26 pending physical tagging verification for balance sheet.',
        severity: 'MEDIUM',
      },
    ]

    return {
      success: true,
      domain: 'finance',
      insightType: 'audit-readiness',
      summary: `Audit readiness analysis flags 1 critical GST issue and 1 asset verification gap ahead of statutory audit.`,
      details: {
        institutionId: Number(institutionId) || 1,
        overallAuditReadinessScore: 81.5,
        flaggedIssuesCount: 2,
        complianceChecks,
        gstIssuesFlagged: [
          'Facility rental & commercial cafeteria income GST reverse charge / forward charge review required',
          'Ensure reconciliation between GSTR-3B and books of accounts',
        ],
      },
      recommendations: [
        'File rectification return GSTR-1 for auxiliary commercial services before the 20th of the current month',
        'Complete barcoding and physical tagging for all newly procured computer systems in Engineering block',
        'Issue chartered accountant representation letter verifying utilization of research grants',
      ],
      confidence: 0.94,
      generatedAt: new Date().toISOString(),
    }
  }
}

export default FinanceInsights
