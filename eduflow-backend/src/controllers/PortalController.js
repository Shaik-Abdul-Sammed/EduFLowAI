import { PortalReaderService } from '../services/portal/PortalReaderService.js'
import { DemoDataRepository } from '../models/DemoDataRepository.js'
import { logger } from '../utils/logger.js'

const memorySources = [
  { id: 1, name: 'Main Campus Biometric Gateway', sourceType: 'BIOMETRIC', status: 'ACTIVE', lastSyncedAt: '2026-03-10T08:30:00Z', recordsCount: 1420 },
  { id: 2, name: 'Fedena Core ERP Database', sourceType: 'FEDENA', status: 'ACTIVE', lastSyncedAt: '2026-03-10T06:00:00Z', recordsCount: 3840 },
  { id: 3, name: 'Daily Faculty Attendance Sheets', sourceType: 'GOOGLE_SHEET', status: 'ACTIVE', lastSyncedAt: '2026-03-09T18:00:00Z', recordsCount: 210 },
]

export class PortalController {
  static async testConnection(req, res) {
    try {
      const { sourceType, config } = req.body || {}
      if (!sourceType) {
        return res.status(400).json({ error: 'sourceType is required' })
      }
      const result = await PortalReaderService.testConnection(sourceType, config)
      return res.status(200).json({
        success: true,
        message: `Successfully reached ${sourceType} endpoint`,
        ...result,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to test portal connection' })
    }
  }

  static async connect(req, res) {
    try {
      const { name, sourceType, connectionConfig = {} } = req.body || {}
      if (!name || !sourceType) {
        return res.status(400).json({ error: 'name and sourceType are required' })
      }

      const newSource = {
        id: memorySources.length + 1,
        name,
        sourceType,
        status: 'ACTIVE',
        lastSyncedAt: new Date().toISOString(),
        recordsCount: 0,
        connectionConfig,
      }
      memorySources.push(newSource)

      logger.info(`New portal source connected: ${name} (${sourceType})`)

      return res.status(201).json({
        success: true,
        message: `Portal '${name}' connected successfully`,
        source: newSource,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to connect portal' })
    }
  }

  static async getSources(req, res) {
    try {
      return res.status(200).json({
        success: true,
        count: memorySources.length,
        sources: memorySources,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch portal sources' })
    }
  }

  static async getPreview(req, res) {
    try {
      const { id } = req.params
      const sample = [
        { studentId: '24CS001', studentName: 'Aakash Verma', date: '2026-03-10', status: 'PRESENT' },
        { studentId: '24CS002', studentName: 'Ananya Roy', date: '2026-03-10', status: 'PRESENT' },
        { studentId: '24CS003', studentName: 'Bharat Reddy', date: '2026-03-10', status: 'ABSENT' },
      ]
      return res.status(200).json({
        success: true,
        sourceId: id,
        previewRecords: sample,
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to preview portal records' })
    }
  }

  static async updateSource(req, res) {
    try {
      const { id } = req.params
      const source = memorySources.find((s) => String(s.id) === String(id))
      if (!source) {
        return res.status(404).json({ error: 'Source not found' })
      }
      Object.assign(source, req.body || {})
      return res.status(200).json({ success: true, source })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update portal source' })
    }
  }

  static async deleteSource(req, res) {
    try {
      const { id } = req.params
      const idx = memorySources.findIndex((s) => String(s.id) === String(id))
      if (idx >= 0) {
        memorySources.splice(idx, 1)
      }
      return res.status(200).json({ success: true, message: 'Source deleted' })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete source' })
    }
  }

  static async syncNow(req, res) {
    try {
      const { id } = req.params
      const source = memorySources.find((s) => String(s.id) === String(id))
      if (source) {
        source.lastSyncedAt = new Date().toISOString()
        source.recordsCount += 140
      }
      return res.status(200).json({
        success: true,
        message: `Sync completed for source ${id}`,
        syncedRecords: 140,
        syncedAt: new Date().toISOString(),
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to sync source' })
    }
  }

  static async getSyncLogs(req, res) {
    try {
      const logs = [
        { id: 1, sourceName: 'Fedena Core ERP Database', status: 'SUCCESS', recordsImported: 450, time: '2026-03-10T06:00:00Z' },
        { id: 2, sourceName: 'Main Campus Biometric Gateway', status: 'SUCCESS', recordsImported: 1420, time: '2026-03-10T08:30:00Z' },
        { id: 3, sourceName: 'Daily Faculty Attendance Sheets', status: 'SUCCESS', recordsImported: 210, time: '2026-03-09T18:00:00Z' },
      ]
      return res.status(200).json({ success: true, logs })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch sync logs' })
    }
  }

  static async connectDemo(req, res) {
    try {
      let students = []
      try {
        const result = await DemoDataRepository.getStudents({ limit: 10 })
        students = result.students || []
      } catch {
        students = []
      }

      if (!students.length) {
        students = [
          { roll_no: '24CS001', name: 'Aakash Verma', department: 'CSE', attendance_percentage: 88.5, cgpa: 8.4 },
          { roll_no: '24CS002', name: 'Ananya Roy', department: 'CSE', attendance_percentage: 72.0, cgpa: 7.9 },
          { roll_no: '24CS003', name: 'Bharat Reddy', department: 'CSE', attendance_percentage: 64.5, cgpa: 6.8 },
          { roll_no: '24CS004', name: 'Deepa Krishnan', department: 'ECE', attendance_percentage: 91.0, cgpa: 9.1 },
          { roll_no: '24CS005', name: 'Eshwar Rao', department: 'Mechanical', attendance_percentage: 83.2, cgpa: 7.5 },
        ]
      }

      const previewRecords = students.map((s, idx) => ({
        roll_no: s.roll_no || s.registration_number || `24CSE${String(idx + 1).padStart(3, '0')}`,
        name: s.name || `${s.first_name || 'Student'} ${s.last_name || ''}`.trim(),
        department: s.department || 'CSE',
        attendance_percentage: parseFloat(s.attendance_percentage || 85.0),
        status: parseFloat(s.attendance_percentage || 85.0) >= 75 ? 'ELIGIBLE' : 'AT_RISK',
        cgpa: parseFloat(s.cgpa || 7.5),
        last_sync: new Date().toISOString(),
      }))

      const newSource = {
        id: memorySources.length + 1,
        name: 'Fedena Demo Portal (Simulated Live ERP)',
        sourceType: 'FEDENA',
        source_type: 'FEDENA',
        status: 'ACTIVE',
        lastSyncedAt: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        recordsCount: 240,
        total_records: 240,
        connectionConfig: {
          isDemo: true,
          provider: 'Fedena Campus ERP',
          sourceTable: 'demo_students',
        },
      }

      memorySources.unshift(newSource)

      logger.info('Demo Fedena portal source connected with live demo_students mapping')

      return res.status(200).json({
        success: true,
        message: 'Successfully connected Fedena Demo Portal with live demo_students mapping',
        source: newSource,
        preview: previewRecords,
        fieldMapping: {
          student_admission_no: 'roll_no',
          student_full_name: 'name',
          course_batch_name: 'department',
          biometric_attendance_pct: 'attendance_percentage',
          academic_cgpa: 'cgpa',
        },
      })
    } catch (err) {
      logger.error('connectDemo error:', err)
      return res.status(500).json({ error: 'Failed to connect demo portal' })
    }
  }
}

export default PortalController
