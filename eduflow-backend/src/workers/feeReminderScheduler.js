import { FeeReminderService } from '../services/finance/FeeReminderService.js'

let schedulerTimer = null

/**
 * Execute the automated fee reminder daily job
 */
export async function runFeeReminderDailyJob(institutionId = 1) {
  try {
    const result = await FeeReminderService.scheduleReminders(institutionId)
    console.log(`[Fee Reminder Scheduler]: Sent ${result.sentCount || 0} reminders across ${result.overdueTotal || 0} overdue accounts.`)
    return result
  } catch (err) {
    console.error('[Fee Reminder Scheduler Error]:', err.message)
    throw err
  }
}

/**
 * Start scheduler checking for 9:00 AM daily dispatch
 */
export function startFeeReminderScheduler() {
  if (schedulerTimer) return schedulerTimer

  // Hourly check to dispatch once at 9 AM
  schedulerTimer = setInterval(async () => {
    const hour = new Date().getHours()
    if (hour === 9) {
      try {
        await runFeeReminderDailyJob(1)
      } catch (err) {
        console.error('[Daily Fee Reminder Job Error]:', err.message)
      }
    }
  }, 60 * 60 * 1000)

  return schedulerTimer
}

export function stopFeeReminderScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer)
    schedulerTimer = null
  }
}
