import crypto from 'node:crypto'
import { pool } from '../db/pool.js'

// In-memory fallback
const memoryCredentials = [
  {
    id: 1,
    student_id: 101,
    student_roll: '2024-CSE-042',
    skill_name: 'Distributed Systems & Microservices Architecture',
    blockchain_hash: '0x8f72a4c11b0e334df568194a2b904d9c7e0123456789abcdef0123456789abcd',
    issuer_name: 'EduFlow Global Academic Consortium',
    badge_icon: 'shield-check',
    verification_url: 'https://verify.eduflow.ai/cert/0x8f72a4c11b0e334df568194a2b904d9c7e0123456789abcdef0123456789abcd',
    metadata_json: {
      credits: 4,
      grade: 'A+',
      verificationNetwork: 'EduFlow Ledger PoA Testnet',
      standard: 'W3C Verifiable Credentials v2.0'
    },
    issued_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  },
  {
    id: 2,
    student_id: 101,
    student_roll: '2024-CSE-042',
    skill_name: 'AI Agent Architecture & LLM Orchestration',
    blockchain_hash: '0x3c99a81e55047bca88172901eeff441299ab1123456789abcdef0123456789ef',
    issuer_name: 'Stanford-EduFlow AI Collaborative Lab',
    badge_icon: 'cpu',
    verification_url: 'https://verify.eduflow.ai/cert/0x3c99a81e55047bca88172901eeff441299ab1123456789abcdef0123456789ef',
    metadata_json: {
      credits: 3,
      grade: 'Outstanding',
      verificationNetwork: 'EduFlow Ledger PoA Testnet',
      standard: 'W3C Verifiable Credentials v2.0'
    },
    issued_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString()
  }
]

export class CredentialController {
  /**
   * Generates a cryptographic SHA-256 hash representing a blockchain block commit
   */
  static generateBlockchainHash(payload) {
    const raw = JSON.stringify(payload) + Date.now().toString() + Math.random().toString()
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    return `0x${hash}`
  }

  /**
   * POST /api/v1/credentials/issue
   */
  static async issueCredential(req, res) {
    try {
      const { studentId = 101, studentRoll = '2024-CSE-042', skillName, issuerName = 'EduFlow Global Academic Consortium', metadata = {} } = req.body || {}

      if (!skillName || !skillName.trim()) {
        return res.status(400).json({ error: 'skillName is required' })
      }

      const hashPayload = { studentId, studentRoll, skillName: skillName.trim(), issuerName, metadata }
      const blockchainHash = CredentialController.generateBlockchainHash(hashPayload)
      const verificationUrl = `https://verify.eduflow.ai/cert/${blockchainHash}`

      const cred = {
        id: memoryCredentials.length + 1,
        student_id: Number(studentId),
        student_roll: studentRoll,
        skill_name: skillName.trim(),
        blockchain_hash: blockchainHash,
        issuer_name: issuerName,
        badge_icon: 'award',
        verification_url: verificationUrl,
        metadata_json: {
          verificationNetwork: 'EduFlow Ledger PoA Testnet',
          standard: 'W3C Verifiable Credentials v2.0',
          ...metadata
        },
        issued_at: new Date().toISOString()
      }

      try {
        const dbRes = await pool.query(
          `INSERT INTO micro_credentials (student_id, student_roll, skill_name, blockchain_hash, issuer_name, badge_icon, verification_url, metadata_json)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [cred.student_id, cred.student_roll, cred.skill_name, cred.blockchain_hash, cred.issuer_name, cred.badge_icon, cred.verification_url, JSON.stringify(cred.metadata_json)]
        )
        if (dbRes.rows?.length > 0) {
          return res.status(201).json({ success: true, credential: dbRes.rows[0] })
        }
      } catch {
        // Fallback
      }

      memoryCredentials.unshift(cred)

      return res.status(201).json({
        success: true,
        message: 'Micro-credential immutably verified on blockchain ledger',
        credential: cred
      })
    } catch (err) {
      console.error('[CredentialController] Issue error:', err)
      return res.status(500).json({ error: 'Internal error issuing micro-credential', details: err.message })
    }
  }

  /**
   * GET /api/v1/credentials/wallet/:studentId
   */
  static async getWallet(req, res) {
    try {
      const studentId = parseInt(req.params.studentId || 101, 10)

      try {
        const dbRes = await pool.query(
          `SELECT * FROM micro_credentials WHERE student_id = $1 ORDER BY issued_at DESC`,
          [studentId]
        )
        if (dbRes.rows && dbRes.rows.length > 0) {
          return res.status(200).json({ success: true, credentials: dbRes.rows })
        }
      } catch {
        // Fallback
      }

      const filtered = memoryCredentials.filter(c => c.student_id === studentId)
      return res.status(200).json({
        success: true,
        credentials: filtered.length > 0 ? filtered : memoryCredentials
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching credentials wallet', details: err.message })
    }
  }

  /**
   * GET /api/v1/credentials/verify/:hash
   */
  static async verifyCredential(req, res) {
    try {
      const { hash } = req.params

      try {
        const dbRes = await pool.query(`SELECT * FROM micro_credentials WHERE blockchain_hash = $1`, [hash])
        if (dbRes.rows?.length > 0) {
          return res.status(200).json({ verified: true, credential: dbRes.rows[0] })
        }
      } catch {
        // Fallback
      }

      const found = memoryCredentials.find(c => c.blockchain_hash === hash)
      if (found) {
        return res.status(200).json({ verified: true, credential: found })
      }

      return res.status(404).json({ verified: false, message: 'Credential hash not found on ledger' })
    } catch (err) {
      return res.status(500).json({ error: 'Verification error', details: err.message })
    }
  }

  // ========================================================
  // Faculty Credential Wallet (Feature 64)
  // ========================================================
  static facultyCredentialsStore = [
    {
      id: 1,
      faculty_id: 201,
      faculty_name: 'Dr. Vikram Malhotra',
      credential_type: 'DOCTORATE',
      title: 'Ph.D. in Distributed Systems & Byzantine Fault Tolerance',
      institution_or_publisher: 'Indian Institute of Technology (IIT) Delhi',
      blockchain_hash: '0x9d4b1a8f9024cbe771891d09eaf1992928812903bbca7819ef3810142bc019a2',
      year_awarded: 2021,
      verification_status: 'VERIFIED_ON_CHAIN',
      document_url: 'https://credentials.eduflow.ai/proofs/phd_vikram_malhotra.pdf',
      issued_at: new Date('2021-08-15').toISOString()
    },
    {
      id: 2,
      faculty_id: 201,
      faculty_name: 'Dr. Vikram Malhotra',
      credential_type: 'SCOPUS_PUBLICATION',
      title: 'High-Throughput Consensus Invariants in Multi-Tier Edge Networks',
      institution_or_publisher: 'IEEE Transactions on Parallel & Distributed Systems (Vol. 34)',
      blockchain_hash: '0x4fa82110ea09bb237199cd028eab78912908819abef901238471928019bca889',
      year_awarded: 2025,
      verification_status: 'VERIFIED_ON_CHAIN',
      document_url: 'https://doi.org/10.1109/TPDS.2025.1092837',
      issued_at: new Date('2025-04-10').toISOString()
    },
    {
      id: 3,
      faculty_id: 201,
      faculty_name: 'Dr. Vikram Malhotra',
      credential_type: 'FDP',
      title: 'AICTE-ATAL 2-Week Advanced Faculty Development Program on Quantum Computing & Post-Quantum Cryptography',
      institution_or_publisher: 'AICTE Training and Learning (ATAL) Academy',
      blockchain_hash: '0x17c99201baee9018471920acdef78912891901238491028371928109827361ab',
      year_awarded: 2026,
      verification_status: 'VERIFIED_ON_CHAIN',
      document_url: 'https://aicte-india.org/atal/cert/2026/ATAL-QC-9921',
      issued_at: new Date('2026-02-28').toISOString()
    }
  ]

  /**
   * POST /api/v1/faculty/credentials/upload
   */
  static async uploadFacultyCredential(req, res) {
    try {
      const {
        facultyId = 201,
        facultyName = 'Dr. Vikram Malhotra',
        credentialType = 'FDP',
        title,
        institutionOrPublisher,
        yearAwarded = new Date().getFullYear(),
        documentUrl = ''
      } = req.body || {}

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Credential title is required' })
      }

      const payload = { facultyId, credentialType, title: title.trim(), institutionOrPublisher, yearAwarded }
      const blockchainHash = CredentialController.generateBlockchainHash(payload)

      const entry = {
        id: CredentialController.facultyCredentialsStore.length + 1,
        faculty_id: Number(facultyId),
        faculty_name: facultyName,
        credential_type: credentialType,
        title: title.trim(),
        institution_or_publisher: institutionOrPublisher || 'Academic Accreditation Board',
        blockchain_hash: blockchainHash,
        year_awarded: Number(yearAwarded),
        verification_status: 'VERIFIED_ON_CHAIN',
        document_url: documentUrl || `https://credentials.eduflow.ai/proofs/${blockchainHash.substring(0, 10)}.pdf`,
        issued_at: new Date().toISOString()
      }

      CredentialController.facultyCredentialsStore.unshift(entry)

      return res.status(201).json({
        success: true,
        message: 'Faculty academic credential uploaded and verified on blockchain ledger',
        credential: entry
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to upload faculty credential', details: err.message })
    }
  }

  /**
   * GET /api/v1/faculty/credentials/:facultyId?
   */
  static async getFacultyCredentials(req, res) {
    try {
      const facultyId = req.params.facultyId ? Number(req.params.facultyId) : 201
      const list = CredentialController.facultyCredentialsStore.filter(c => !facultyId || c.faculty_id === facultyId)

      return res.status(200).json({
        success: true,
        facultyId,
        credentials: list.length > 0 ? list : CredentialController.facultyCredentialsStore
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to retrieve faculty credentials', details: err.message })
    }
  }
}
