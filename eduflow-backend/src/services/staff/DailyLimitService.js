import { logger } from '../../utils/logger.js'

// In-memory daily counter storage with date tracking
// Map key: `${staffUserId}:${officerKey}:${dateString}` -> count
const dailyCounters = new Map()

export class DailyLimitService {
  static getTodayKey(staffUserId, officerKey) {
    const today = new Date().toISOString().slice(0, 10)
    return `${staffUserId}:${officerKey}:${today}`
  }

  static getTodayUsage(staffUserId, officerKey) {
    const key = this.getTodayKey(staffUserId, officerKey)
    return dailyCounters.get(key) || 0
  }

  static checkAndIncrement(staffUserId, officerKey, maxRequestsPerDay = 20) {
    const key = this.getTodayKey(staffUserId, officerKey)
    const current = dailyCounters.get(key) || 0

    if (current >= maxRequestsPerDay) {
      logger.warn(`Daily limit exceeded for staff ${staffUserId} on ${officerKey}: ${current}/${maxRequestsPerDay}`)
      return {
        allowed: false,
        current,
        remaining: 0,
        max: maxRequestsPerDay,
      }
    }

    const next = current + 1
    dailyCounters.set(key, next)
    return {
      allowed: true,
      current: next,
      remaining: Math.max(0, maxRequestsPerDay - next),
      max: maxRequestsPerDay,
    }
  }

  static resetDailyCounters() {
    dailyCounters.clear()
    logger.info('Staff daily limit counters reset')
    return { success: true }
  }

  // Testing helper
  static setCounterForTesting(staffUserId, officerKey, count) {
    const key = this.getTodayKey(staffUserId, officerKey)
    dailyCounters.set(key, count)
  }
}

export default DailyLimitService
