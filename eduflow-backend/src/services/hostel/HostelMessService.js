/**
 * Campus Housing, Hostel Allocation & Mess Governance Engine
 * Implements Needs 71–80 (Mess Rebates, Maintenance SLA, Roommate Compatibility, Night Curfew)
 */

export class HostelMessService {
  /**
   * Need 74: Mess Rebate & Leave Credit Calculator
   * Automatic rebate for approved hostel leaves >= 5 continuous days.
   */
  static calculateMessRebate({
    studentRoll = '1ST21CS001',
    studentName = 'Aarav Sharma',
    leaveStartDate = '2026-06-05',
    leaveEndDate = '2026-06-14',
    dailyMessRateINR = 140,
    minQualifyingDays = 5
  }) {
    const start = new Date(leaveStartDate)
    const end = new Date(leaveEndDate)
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1

    const isEligibleForRebate = diffDays >= minQualifyingDays
    const totalRebateAmountINR = isEligibleForRebate ? diffDays * dailyMessRateINR : 0

    return {
      rebateId: `REBATE_${Date.now().toString().slice(-6)}`,
      studentRoll,
      studentName,
      leavePeriod: `${leaveStartDate} to ${leaveEndDate}`,
      totalDaysAbsent: diffDays,
      minQualifyingDays,
      isEligibleForRebate,
      dailyMessRateINR,
      totalRebateAmountINR,
      status: isEligibleForRebate ? 'CREDITED_TO_NEXT_BILL' : 'BELOW_MINIMUM_QUALIFYING_DAYS',
      remarks: isEligibleForRebate
        ? `₹${totalRebateAmountINR} mess rebate credited for ${diffDays} days approved leave.`
        : `Rebate denied: Leave duration (${diffDays} days) less than mandatory ${minQualifyingDays} days cutoff.`
    }
  }

  /**
   * Need 76: Maintenance & Room Complaint Ticketing with SLA Timers
   */
  static createMaintenanceTicket({
    block = 'Block A',
    roomNo = '101',
    studentRoll = '1ST21CS001',
    category = 'Electrical', // Electrical, Plumbing, Carpentry, Wi-Fi
    description = 'Ceiling fan regulator not working and sparking.'
  }) {
    const slaHours = category === 'Electrical' ? 4 : category === 'Plumbing' ? 6 : 24
    const ticketId = `TKT-${block.slice(-1)}-${roomNo}-${Date.now().toString().slice(-4)}`

    return {
      ticketId,
      location: `${block}, Room ${roomNo}`,
      studentRoll,
      category,
      description,
      priority: category === 'Electrical' || category === 'Plumbing' ? 'HIGH' : 'NORMAL',
      slaResolutionWindowHours: slaHours,
      assignedTechnician: category === 'Electrical' ? 'K. Narayana (Campus Electrician)' : 'S. Babu (Plumber)',
      status: 'OPEN_ASSIGNED',
      reportedAt: new Date().toISOString()
    }
  }

  /**
   * Need 72: Roommate Preference & Study Habit Compatibility Matcher
   */
  static matchRoommatePreferences({
    studentA = { name: 'Aarav', branch: 'CSE', sleepSchedule: 'NightOwl', cleanliness: 'High', studyQuietness: 'High' },
    studentB = { name: 'Rohan', branch: 'ECE', sleepSchedule: 'NightOwl', cleanliness: 'High', studyQuietness: 'Moderate' }
  }) {
    let score = 0
    if (studentA.sleepSchedule === studentB.sleepSchedule) score += 40
    if (studentA.cleanliness === studentB.cleanliness) score += 30
    if (studentA.studyQuietness === studentB.studyQuietness) score += 30
    else score += 15

    const compatibility = Math.min(100, score)
    const isRecommended = compatibility >= 70

    return {
      pairing: `${studentA.name} & ${studentB.name}`,
      compatibilityScore: `${compatibility}%`,
      isRecommended,
      matchedFactors: [
        studentA.sleepSchedule === studentB.sleepSchedule ? 'Matching sleep rhythm' : null,
        studentA.cleanliness === studentB.cleanliness ? 'Compatible cleanliness standards' : null
      ].filter(Boolean)
    }
  }

  /**
   * Need 75: Biometric Night Curfew Gate Check-in & Late Entry Violations
   */
  static logNightCurfewGateEntry({
    studentRoll = '1ST21CS014',
    studentName = 'Siddharth Rao',
    checkInTimeString = '21:35', // 9:35 PM
    curfewCutoff = '21:00' // 9:00 PM
  }) {
    const isLate = checkInTimeString > curfewCutoff
    const minutesLate = isLate
      ? (parseInt(checkInTimeString.split(':')[0]) * 60 + parseInt(checkInTimeString.split(':')[1])) -
        (parseInt(curfewCutoff.split(':')[0]) * 60 + parseInt(curfewCutoff.split(':')[1]))
      : 0

    return {
      entryLogId: `CURFEW_${Date.now()}`,
      studentRoll,
      studentName,
      checkInTime: checkInTimeString,
      curfewCutoff,
      isViolation: isLate,
      minutesOverdue: minutesLate,
      wardenAlertTriggered: isLate,
      action: isLate ? 'PARENT_SMS_ALERT_QUEUED' : 'ENTRY_CLEARED'
    }
  }
}
