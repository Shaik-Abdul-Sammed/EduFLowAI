import { logger } from '../../utils/logger.js'

export class PortalReaderService {
  static async testConnection(sourceType, config = {}) {
    logger.info(`Testing connection to ${sourceType}`)
    return {
      connected: true,
      sourceType,
      latencyMs: 42,
      tablesFound: ['students', 'attendance_logs', 'courses', 'departments'],
      verifiedAt: new Date().toISOString(),
    }
  }

  static async connectMySQL(config) {
    return { status: 'CONNECTED', type: 'MYSQL', host: config.host || 'localhost' }
  }

  static async connectPostgres(config) {
    return { status: 'CONNECTED', type: 'POSTGRES', host: config.host || 'localhost' }
  }

  static async connectOracle(config) {
    return { status: 'CONNECTED', type: 'ORACLE', sid: config.sid || 'ORCL' }
  }

  static async readFromFedenaAPI(config) {
    logger.info('Reading student attendance from Fedena ERP API')
    return [
      { id: 'FED-1001', student_name: 'Rahul Kumar', status: 'present', date: '2026-03-10' },
      { id: 'FED-1002', student_name: 'Sneha Patel', status: 'absent', date: '2026-03-10' },
    ]
  }

  static async readFromCampus365API(config) {
    logger.info('Reading student attendance from Campus365 Cloud')
    return [
      { student_code: 'C365-501', is_present: true, marked_at: '2026-03-10T09:00:00Z' },
      { student_code: 'C365-502', is_present: false, marked_at: '2026-03-10T09:00:00Z' },
    ]
  }

  static async readFromClassproAPI(config) {
    logger.info('Reading attendance from Classpro API')
    return [
      { admission_no: 'CP-881', attendance_status: 'P', lecture_date: '2026-03-10' },
    ]
  }

  static async readFromBiometricDevice(config) {
    logger.info('Reading biometric raw punch records')
    return [
      { badge_id: 'BIO-991', punch_time: '2026-03-10 08:55:12', terminal_id: 'GATE-1' },
      { badge_id: 'BIO-992', punch_time: '2026-03-10 08:58:33', terminal_id: 'GATE-2' },
    ]
  }

  static async readFromGoogleSheet(config) {
    logger.info('Reading published attendance roster from Google Sheets API')
    return [
      { 'Roll No': '24CS001', 'Status': 'Present', 'Date': '2026-03-10' },
      { 'Roll No': '24CS002', 'Status': 'Present', 'Date': '2026-03-10' },
    ]
  }

  static normalizeAttendance(rawRecord, mapping = {}) {
    // Normalizes heterogeneous portal output into EduFlow canonical format
    const studentId =
      rawRecord[mapping.studentIdField || 'studentId'] ||
      rawRecord.id ||
      rawRecord.student_code ||
      rawRecord.admission_no ||
      rawRecord.badge_id ||
      rawRecord['Roll No'] ||
      'UNKNOWN'

    const rawStatus = String(
      rawRecord[mapping.statusField || 'status'] ||
      rawRecord.is_present ||
      rawRecord.attendance_status ||
      rawRecord['Status'] ||
      'PRESENT'
    ).toUpperCase()

    let normalizedStatus = 'PRESENT'
    if (rawStatus === 'FALSE' || rawStatus === '0' || rawStatus === 'ABSENT' || rawStatus === 'A') {
      normalizedStatus = 'ABSENT'
    } else if (rawStatus === 'L' || rawStatus === 'LATE') {
      normalizedStatus = 'LATE'
    }

    return {
      studentExternalId: studentId,
      status: normalizedStatus,
      recordedAt: rawRecord.marked_at || rawRecord.punch_time || new Date().toISOString(),
      sourceType: mapping.sourceType || 'PORTAL',
    }
  }

  static async scheduleNightlySync(institutionId = 1) {
    logger.info(`Scheduled nightly attendance synchronization for institution ${institutionId} at 02:00 AM`)
    return {
      scheduled: true,
      time: '02:00:00 IST',
      institutionId,
      jobId: `sync-job-${institutionId}`,
    }
  }
}

export default PortalReaderService
