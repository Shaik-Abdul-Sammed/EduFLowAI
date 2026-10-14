import { ComplianceService } from '../services/compliance/ComplianceService.js'
import { runRetentionPurge } from '../workers/retentionEnforcer.js'

export class ComplianceController {
  static async getAccessReview(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.query.institutionId || 1
      const data = await ComplianceService.generateAccessReview(institutionId)
      return res.status(200).json(data)
    } catch (err) {
      console.error('[ComplianceController] Access review error:', err)
      return res.status(500).json({ error: 'Failed to generate access review' })
    }
  }

  static async getChangeLog(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.query.institutionId || 1
      const { startDate, endDate } = req.query
      const data = await ComplianceService.generateChangeLog(startDate, endDate, institutionId)
      return res.status(200).json(data)
    } catch (err) {
      console.error('[ComplianceController] Change log error:', err)
      return res.status(500).json({ error: 'Failed to generate change log' })
    }
  }

  static async getIncidents(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.query.institutionId || 1
      const data = await ComplianceService.generateIncidentReport(institutionId)
      return res.status(200).json(data)
    } catch (err) {
      console.error('[ComplianceController] Incidents error:', err)
      return res.status(500).json({ error: 'Failed to generate incidents report' })
    }
  }

  static async getDataInventory(req, res) {
    try {
      const data = ComplianceService.generateDataInventory()
      return res.status(200).json(data)
    } catch (err) {
      console.error('[ComplianceController] Data inventory error:', err)
      return res.status(500).json({ error: 'Failed to fetch data inventory' })
    }
  }

  static async getDPIA(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.query.institutionId || 1
      const data = ComplianceService.generateDPIAReport(institutionId)
      return res.status(200).json(data)
    } catch (err) {
      console.error('[ComplianceController] DPIA error:', err)
      return res.status(500).json({ error: 'Failed to generate DPIA report' })
    }
  }

  static async exportAuditPackage(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.query.institutionId || 1
      const zipBuffer = await ComplianceService.exportAuditPackage(institutionId)

      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', `attachment; filename="EduFlow_SOC2_DPDP_AuditPackage_Inst${institutionId}.zip"`)
      return res.status(200).send(zipBuffer)
    } catch (err) {
      console.error('[ComplianceController] Export audit package error:', err)
      return res.status(500).json({ error: 'Failed to export audit package' })
    }
  }

  static async triggerPurge(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.body?.institutionId || null
      const result = await runRetentionPurge(institutionId)
      return res.status(200).json(result)
    } catch (err) {
      console.error('[ComplianceController] Purge trigger error:', err)
      return res.status(500).json({ error: 'Failed to execute retention purge' })
    }
  }
}
