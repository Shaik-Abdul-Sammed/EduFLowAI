import { pool } from '../../db/pool.js'

// In-memory fallback store for development & mock tests
let escalationsStore = [
  {
    id: 1,
    institution_id: 1,
    invoice_id: 103,
    student_id: 22,
    student_name: 'Karthik V (Roll: 1ST22ME022)',
    student_roll: '1ST22ME022',
    department: 'MECH',
    invoice_number: 'EDU-2026-0043',
    amount: 48000,
    raised_by: 2, // Finance Officer ID
    raised_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    action_requested: 'HALL_TICKET_HOLD',
    reason: 'Fee overdue for 38 days past grace deadline (Tier 3 urgency)',
    status: 'PENDING',
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    effective_from: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 2,
    institution_id: 1,
    invoice_id: 104,
    student_id: 14,
    student_name: 'Ananya Deshmukh (Roll: 1ST21CS014)',
    student_roll: '1ST21CS014',
    department: 'CSE',
    invoice_number: 'EDU-2026-0044',
    amount: 62000,
    raised_by: 2,
    raised_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    action_requested: 'EXAM_DEBARMENT',
    reason: 'Statutory non-settlement exceeding 72 days past deadline',
    status: 'PENDING',
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    effective_from: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
]

export class AcademicEscalationService {
  /**
   * Reset the in-memory store for isolated testing
   */
  static resetStore() {
    escalationsStore = []
  }

  /**
   * Escalate an overdue invoice to the HOD for academic intervention
   * Actions: 'HALL_TICKET_HOLD', 'EXAM_DEBARMENT', 'ACCOUNT_FREEZE'
   */
  static async escalateToHOD({
    institutionId = 1,
    invoiceId,
    studentId = null,
    studentName = 'Student',
    studentRoll = 'ROLL-01',
    department = 'CSE',
    invoiceNumber = 'EDU-INV',
    amount = 50000,
    raisedBy = 1,
    actionRequested = 'HALL_TICKET_HOLD',
    reason = 'Overdue fee beyond grace period'
  }) {
    if (!invoiceId) {
      throw new Error('invoiceId is required to raise an escalation')
    }

    const escalation = {
      id: escalationsStore.length + 1,
      institution_id: institutionId,
      invoice_id: Number(invoiceId),
      student_id: studentId,
      student_name: studentName,
      student_roll: studentRoll,
      department,
      invoice_number: invoiceNumber,
      amount: Number(amount),
      raised_by: Number(raisedBy),
      raised_at: new Date().toISOString(),
      action_requested: actionRequested,
      reason,
      status: 'PENDING',
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      effective_from: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }

    try {
      if (pool && !pool.isMemoryMode) {
        const query = `
          INSERT INTO academic_escalations 
            (institution_id, invoice_id, student_id, raised_by, action_requested, reason, status, effective_from)
          VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)
          RETURNING *;
        `
        const res = await pool.query(query, [
          institutionId,
          Number(invoiceId),
          studentId,
          Number(raisedBy),
          actionRequested,
          reason,
          escalation.effective_from
        ])
        if (res.rows?.[0]) {
          escalation.id = res.rows[0].id
        }
      }
    } catch {
      // Memory fallback
    }

    escalationsStore.push(escalation)
    return escalation
  }

  /**
   * Retrieve pending escalations for a specific department (or all for admin/finance)
   */
  static async getPendingForHOD(deptOrOpts = null, maybeInstId = 1) {
    let department = null
    let institutionId = 1
    if (typeof deptOrOpts === 'string' || deptOrOpts === null) {
      department = deptOrOpts
      institutionId = maybeInstId ?? 1
    } else if (typeof deptOrOpts === 'object') {
      department = deptOrOpts.department || null
      institutionId = deptOrOpts.institutionId ?? 1
    }

    try {
      if (pool && !pool.isMemoryMode) {
        let query = `SELECT * FROM academic_escalations WHERE status = 'PENDING' AND institution_id = $1`
        const params = [institutionId]
        if (department) {
          query += ` AND UPPER(department) = UPPER($2)`
          params.push(department)
        }
        const res = await pool.query(query, params)
        if (res.rows && res.rows.length > 0) {
          return res.rows
        }
      }
    } catch {
      // Memory fallback
    }

    return escalationsStore.filter(e => {
      const matchStatus = e.status === 'PENDING'
      const matchInst = !institutionId || e.institution_id === Number(institutionId)
      const matchDept = !department || (e.department && e.department.toUpperCase() === department.toUpperCase())
      return matchStatus && matchInst && matchDept
    })
  }

  /**
   * HOD Approves academic escalation
   */
  static async approveEscalation(id, approvedBy = 1, institutionId = 1) {
    const esc = escalationsStore.find(e => String(e.id) === String(id))
    if (!esc) {
      throw new Error(`Escalation #${id} not found`)
    }

    esc.status = 'APPROVED'
    esc.approved_by = Number(approvedBy)
    esc.approved_at = new Date().toISOString()

    try {
      if (pool && !pool.isMemoryMode) {
        await pool.query(
          `UPDATE academic_escalations 
           SET status = 'APPROVED', approved_by = $1, approved_at = NOW() 
           WHERE id = $2`,
          [Number(approvedBy), Number(id)]
        )
      }
    } catch {
      // Memory fallback
    }

    return esc
  }

  /**
   * HOD Rejects or Defers academic escalation
   */
  static async rejectEscalation(id, rejectionReason = 'Deferred on student appeal', approvedBy = 1) {
    const esc = escalationsStore.find(e => String(e.id) === String(id))
    if (!esc) {
      throw new Error(`Escalation #${id} not found`)
    }

    esc.status = 'REJECTED'
    esc.approved_by = Number(approvedBy)
    esc.approved_at = new Date().toISOString()
    esc.rejection_reason = rejectionReason

    try {
      if (pool && !pool.isMemoryMode) {
        await pool.query(
          `UPDATE academic_escalations 
           SET status = 'REJECTED', approved_by = $1, approved_at = NOW(), rejection_reason = $2 
           WHERE id = $3`,
          [Number(approvedBy), rejectionReason, Number(id)]
        )
      }
    } catch {
      // Memory fallback
    }

    return esc
  }

  /**
   * Retrieve all escalations summary for Dean / Administrative review
   */
  static async getAllSummary({ institutionId = 1 } = {}) {
    const all = escalationsStore.filter(e => !institutionId || e.institution_id === Number(institutionId))
    const pending = all.filter(e => e.status === 'PENDING').length
    const approved = all.filter(e => e.status === 'APPROVED').length
    const rejected = all.filter(e => e.status === 'REJECTED').length

    return {
      summary: { total: all.length, pending, approved, rejected },
      escalations: all
    }
  }
}
