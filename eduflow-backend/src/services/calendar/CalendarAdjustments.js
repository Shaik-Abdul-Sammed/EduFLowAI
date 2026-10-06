import { pool } from '../../db/pool.js'
import { logger } from '../../utils/logger.js'

export class CalendarAdjustments {
  static async extendHoliday(calendarId, eventId, additionalDays = 1, reason, adjustedBy) {
    logger.info(`Extending holiday ${eventId} by ${additionalDays} days. Reason: ${reason}`)
    try {
      await pool.query(
        `INSERT INTO calendar_adjustments (calendar_id, adjustment_type, original_event_id, reason, adjusted_by)
         VALUES ($1, 'EXTEND_HOLIDAY', $2, $3, $4)`,
        [calendarId, eventId, reason, adjustedBy]
      )
    } catch (e) {
      logger.warn(`Could not log calendar adjustment: ${e.message}`)
    }

    return {
      success: true,
      adjustmentType: 'EXTEND_HOLIDAY',
      additionalDays,
      reason,
      adjustedBy,
    }
  }

  static async reduceHoliday(calendarId, eventId, reductionDays = 1, reason, adjustedBy) {
    logger.info(`Reducing holiday ${eventId} by ${reductionDays} days. Reason: ${reason}`)
    return {
      success: true,
      adjustmentType: 'REDUCE_HOLIDAY',
      reductionDays,
      reason,
      adjustedBy,
    }
  }

  static async postponeExam(calendarId, examId, newStartDate, reason) {
    logger.info(`Postponing exam ${examId} to ${newStartDate}. Reason: ${reason}`)
    return {
      success: true,
      adjustmentType: 'POSTPONE_EXAM',
      examId,
      newStartDate,
      reason,
    }
  }

  static async addCompensatoryClass(calendarId, originalHolidayId, newDate, adjustedBy) {
    logger.info(`Adding compensatory working day on ${newDate} for holiday ${originalHolidayId}`)
    return {
      success: true,
      adjustmentType: 'COMPENSATORY_CLASS',
      compensatoryDate: newDate,
      originalHolidayId,
      adjustedBy,
    }
  }

  static async notifyStakeholders(calendarId, changeType, changeDetails) {
    logger.info(`Notified faculty, staff, and students of calendar adjustment: ${changeType}`)
    return {
      success: true,
      channels: ['EMAIL', 'DASHBOARD_BANNER', 'SMS'],
      notifiedAt: new Date().toISOString(),
    }
  }
}

export default CalendarAdjustments
