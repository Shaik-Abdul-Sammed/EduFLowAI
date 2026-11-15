import crypto from 'node:crypto'
import QRCode from 'qrcode'
import { certificateGenerationSchema } from '../middleware/validateRequest.js'

const certificatesStore = new Map()

// Seed a demo valid certificate for instant verification testing
const demoCertId = 'BONA-2026-DEMO01'
certificatesStore.set(demoCertId, {
  certId: demoCertId,
  studentName: 'Ananya Sharma',
  rollNumber: 'SS26-CSE-042',
  courseName: 'Bachelor of Technology (Computer Science & Engineering)',
  academicYear: '2025-2026',
  issuePurpose: 'Passport Application & Visa Clearance',
  cgpa: 9.24,
  institutionName: 'Sri Siddhartha Institute of Technology',
  status: 'VALID',
  issuedAt: new Date().toISOString()
})

export class CertificateController {
  /**
   * Generate Bonafide Certificate with QR Code Verification
   * POST /api/v1/certificates/generate
   */
  static async generateCertificate(req, res) {
    try {
      const validated = certificateGenerationSchema.safeParse(req.body)
      if (!validated.success) {
        return res.status(400).json({
          error: 'Validation error in certificate request',
          details: validated.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
        })
      }

      const { studentName, rollNumber, courseName, academicYear, issuePurpose, cgpa } = validated.data
      const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase()
      const certId = `BONA-${new Date().getFullYear()}-${randomSuffix}`

      // Verification URL pointing to public institutional verification endpoint
      const host = req.get('host') || 'localhost:3000'
      const protocol = req.protocol || 'http'
      const verifyUrl = `${protocol}://${host}/api/v1/certificates/verify/${certId}`

      // Generate Data URL QR code
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 256
      })

      const certificateRecord = {
        certId,
        studentName,
        rollNumber,
        courseName,
        academicYear,
        issuePurpose,
        cgpa: cgpa || 8.5,
        institutionName: 'Sri Siddhartha Institute of Technology',
        status: 'VALID',
        issuedAt: new Date().toISOString(),
        verifyUrl,
        qrCodeDataUrl
      }

      certificatesStore.set(certId, certificateRecord)

      return res.status(201).json({
        success: true,
        message: 'Bonafide certificate generated successfully',
        certificate: certificateRecord
      })
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to generate certificate' })
    }
  }

  /**
   * Verify Bonafide Certificate by ID
   * GET /api/v1/certificates/verify/:certId
   */
  static async verifyCertificate(req, res) {
    try {
      const { certId } = req.params
      if (!certId) {
        return res.status(400).json({ verified: false, error: 'Certificate ID is required' })
      }

      const cert = certificatesStore.get(certId.trim())
      if (!cert) {
        return res.status(404).json({
          verified: false,
          error: 'Certificate not found or revoked by registrar'
        })
      }

      return res.json({
        verified: true,
        message: 'Certificate authenticity verified by EduFlow Institutional Trust Gateway',
        certificate: {
          certId: cert.certId,
          studentName: cert.studentName,
          rollNumber: cert.rollNumber,
          courseName: cert.courseName,
          academicYear: cert.academicYear,
          status: cert.status,
          issuedAt: cert.issuedAt
        }
      })
    } catch (err) {
      return res.status(500).json({ verified: false, error: err.message || 'Failed to verify certificate' })
    }
  }
}
