/**
 * Bursary Accounting, Financial Reconciliation & No-Dues Engine
 * Implements Needs 41–50 (Bank Reconciliation, Escalation Tiers, Scholarships, Digital No-Dues)
 */

export class BursaryReconciliationService {
  /**
   * Need 46: Bank Reconciliation Statement (BRS) UTR Auto-Matcher
   * Matches bank statement NEFT/RTGS transaction UTRs against outstanding student fees.
   */
  static autoMatchBankStatementUTR({
    bankEntries = [
      { utr: 'SBIN9281726351', amount: 45000, date: '2026-06-01', remark: '1ST21CS001 FEE' },
      { utr: 'HDFC1928374655', amount: 18000, date: '2026-06-02', remark: '1ST21EC014 HOSTEL' },
      { utr: 'ICIC9918273645', amount: 62000, date: '2026-06-03', remark: 'UNKNOWN REF 9918' }
    ],
    unpaidInvoices = [
      { invoiceId: 'INV-101', studentRoll: '1ST21CS001', studentName: 'Aarav Sharma', amount: 45000 },
      { invoiceId: 'INV-102', studentRoll: '1ST21EC014', studentName: 'Rohan Verma', amount: 18000 },
      { invoiceId: 'INV-103', studentRoll: '1ST21ME022', studentName: 'Karthik S', amount: 50000 }
    ]
  }) {
    const matched = []
    const unmatchedBank = []

    bankEntries.forEach(entry => {
      // Find matching invoice by studentRoll mentioned in remark or exact amount match
      const matchedInv = unpaidInvoices.find(inv => 
        entry.remark.includes(inv.studentRoll) || (inv.amount === entry.amount && !matched.some(m => m.invoiceId === inv.invoiceId))
      )

      if (matchedInv) {
        matched.push({
          utr: entry.utr,
          invoiceId: matchedInv.invoiceId,
          studentRoll: matchedInv.studentRoll,
          studentName: matchedInv.studentName,
          amount: entry.amount,
          reconciledAt: new Date().toISOString(),
          status: 'RECONCILED'
        })
      } else {
        unmatchedBank.push({
          ...entry,
          status: 'UNIDENTIFIED_CREDIT_REQUIRING_INVESTIGATION'
        })
      }
    })

    return {
      totalBankEntries: bankEntries.length,
      matchedCount: matched.length,
      unmatchedCount: unmatchedBank.length,
      totalReconciledAmountINR: matched.reduce((s, m) => s + m.amount, 0),
      reconciliationRatio: `${Math.round((matched.length / Math.max(1, bankEntries.length)) * 100)}%`,
      matched,
      unmatchedBank
    }
  }

  /**
   * Need 47: Multi-Tier Fee Reminder Escalation Pipeline
   */
  static generateEscalationReminderTiers({
    overdueDays,
    amount,
    studentRoll = '1ST21CS001',
    studentName = 'Aarav Sharma',
    guardianPhone = '9876500011'
  }) {
    let tier = 1
    let channel = 'SMS & WhatsApp'
    let tone = 'Friendly Reminder'
    let message = ''

    if (overdueDays <= 15) {
      tier = 1
      tone = 'Friendly Reminder'
      message = `Dear Guardian, term fee of ₹${amount.toLocaleString('en-IN')} for ${studentName} (${studentRoll}) was due recently. Please pay online via EduFlow Portal.`
    } else if (overdueDays <= 45) {
      tier = 2
      tone = 'Mentor Academic Alert'
      message = `Urgent: Term fee of ₹${amount.toLocaleString('en-IN')} for ${studentName} is ${overdueDays} days overdue. Department Mentor has been notified.`
    } else {
      tier = 3
      tone = 'Registrar Statutory Escalation'
      message = `Final Notice: Outstanding fee of ₹${amount.toLocaleString('en-IN')} is ${overdueDays} days overdue. Hall ticket withholding protocols have been initiated.`
    }

    return {
      studentRoll,
      studentName,
      guardianPhone,
      overdueDays,
      amount,
      escalationTier: `Tier ${tier}`,
      tone,
      channel,
      draftedNotification: message,
      hallTicketEligible: overdueDays <= 45
    }
  }

  /**
   * Need 45: Government Scholarship & Concession Split Billing
   */
  static calculateGovernmentScholarshipSplit({
    grossTuitionFee = 65000,
    grossHostelFee = 25000,
    category = 'SC', // General, OBC, SC, ST, EBC
    scheme = 'JVD_FULL_REIMBURSEMENT'
  }) {
    let scholarshipReimbursement = 0
    let studentPayableTuition = grossTuitionFee
    let studentPayableHostel = grossHostelFee

    if (category === 'SC' || category === 'ST') {
      scholarshipReimbursement = grossTuitionFee
      studentPayableTuition = 0
      studentPayableHostel = Math.round(grossHostelFee * 0.5) // 50% mess subsidy
    } else if (category === 'EBC') {
      scholarshipReimbursement = Math.round(grossTuitionFee * 0.75)
      studentPayableTuition = grossTuitionFee - scholarshipReimbursement
    }

    const netStudentPayable = studentPayableTuition + studentPayableHostel

    return {
      grossTotalINR: grossTuitionFee + grossHostelFee,
      category,
      scheme,
      governmentReimbursementClaimINR: scholarshipReimbursement,
      studentNetPayableINR: netStudentPayable,
      splitDetails: {
        tuitionGovernmentShare: scholarshipReimbursement,
        tuitionStudentShare: studentPayableTuition,
        hostelStudentShare: studentPayableHostel
      }
    }
  }

  /**
   * Need 49: Institutional Digital No-Dues Multi-Department Clearance
   */
  static generateDigitalNoDuesClearance({
    studentRoll,
    studentName = 'Student',
    departmentStatuses = {
      centralLibrary: { cleared: true, remarks: 'All books returned, ₹0 dues' },
      departmentLabs: { cleared: true, remarks: 'Lab equipment signed off' },
      hostelOffice: { cleared: true, remarks: 'Room vacated, caution deposit adjusted' },
      sportsComplex: { cleared: true, remarks: 'Sports kits returned' },
      accountsBursary: { cleared: true, remarks: 'Semester tuition fees 100% cleared' }
    }
  }) {
    const departments = Object.keys(departmentStatuses)
    const allCleared = departments.every(d => departmentStatuses[d].cleared === true)

    return {
      clearanceReference: `NODUES-${studentRoll}-${Date.now().toString().slice(-4)}`,
      studentRoll,
      studentName,
      issuedAt: new Date().toISOString(),
      allDepartmentsCleared: allCleared,
      status: allCleared ? 'PROVISIONAL_DEGREE_ELIGIBLE' : 'PENDING_CLEARANCE',
      departmentSignoffs: departmentStatuses,
      verificationQR: `VERIFY_NODUES_${studentRoll}_CLEARED`
    }
  }
}
