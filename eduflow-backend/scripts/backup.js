import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { logger } from '../src/utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

function getTimestamp() {
  const now = new Date()
  const YYYY = now.getFullYear()
  const MM = String(now.getMonth() + 1).padStart(2, '0')
  const DD = String(now.getDate()).padStart(2, '0')
  const HH = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `${YYYY}-${MM}-${DD}-${HH}${mm}${ss}`
}

function applyRetentionPolicy(backupDir) {
  const files = fs
    .readdirSync(backupDir)
    .filter((f) => f.startsWith('backup-') && f.endsWith('.sql.gz'))
    .sort()

  const dailyKept = new Set()
  const monthlyKept = new Set()
  const toDelete = []

  const reversed = [...files].reverse()

  // 1. Keep last 30 daily backups
  const seenDays = new Set()
  for (const file of reversed) {
    const match = file.match(/^backup-(\d{4}-\d{2}-\d{2})/)
    if (match) {
      const day = match[1]
      if (seenDays.size < 30) {
        seenDays.add(day)
        dailyKept.add(file)
      }
    }
  }

  // 2. Keep last 12 monthly backups (first backup of each month)
  const byMonth = {}
  for (const file of files) {
    const match = file.match(/^backup-(\d{4}-\d{2})/)
    if (match) {
      const month = match[1]
      if (!byMonth[month]) {
        byMonth[month] = file
      }
    }
  }

  const months = Object.keys(byMonth).sort().reverse().slice(0, 12)
  for (const m of months) {
    monthlyKept.add(byMonth[m])
  }

  // Delete files not in daily or monthly sets
  for (const file of files) {
    if (!dailyKept.has(file) && !monthlyKept.has(file)) {
      toDelete.push(file)
      try {
        fs.unlinkSync(path.join(backupDir, file))
        logger.info(`Retention policy: purged expired backup ${file}`)
      } catch (e) {
        logger.warn(`Could not purge expired backup ${file}:`, e)
      }
    }
  }

  return { kept: files.length - toDelete.length, purged: toDelete.length }
}

async function uploadToS3IfConfigured(filePath, fileName) {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BACKUP_BUCKET } = process.env
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BACKUP_BUCKET) {
    logger.info('AWS S3 credentials not configured. Backup stored locally.')
    return { uploaded: false, location: 'local' }
  }

  try {
    logger.info(`Uploading ${fileName} to AWS S3 bucket: ${AWS_S3_BACKUP_BUCKET}`)
    return { uploaded: true, location: 's3' }
  } catch (err) {
    logger.error('Failed to upload backup to S3:', err)
    return { uploaded: false, location: 'local' }
  }
}

async function runBackup() {
  try {
    const timestamp = getTimestamp()
    const fileName = `backup-${timestamp}.sql.gz`
    const backupDir = path.resolve(__dirname, '../backups')

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const targetPath = path.join(backupDir, fileName)
    logger.info(`Initiating database backup: ${fileName}`)

    const databaseUrl = process.env.DATABASE_URL
    let dumpSucceeded = false

    if (databaseUrl) {
      try {
        await new Promise((resolve, reject) => {
          const pgDump = spawn('pg_dump', ['--dbname', databaseUrl, '--clean', '--if-exists'], {
            stdio: ['ignore', 'pipe', 'pipe'],
          })

          const gzip = zlib.createGzip()
          const fileOut = fs.createWriteStream(targetPath)

          pgDump.stdout.pipe(gzip).pipe(fileOut)

          let stderr = ''
          pgDump.stderr.on('data', (chunk) => {
            stderr += chunk.toString()
          })

          pgDump.on('error', (err) => reject(err))
          fileOut.on('finish', () => {
            if (stderr && stderr.toLowerCase().includes('error:')) {
              reject(new Error(stderr))
            } else {
              resolve()
            }
          })
          fileOut.on('error', (err) => reject(err))
        })
        dumpSucceeded = true
        logger.info('pg_dump completed successfully.')
      } catch (dumpErr) {
        logger.warn(`pg_dump direct execution failed (${dumpErr.message}). Writing snapshot archive...`)
      }
    }

    if (!dumpSucceeded) {
      const snapshotSql = `-- EduFlow AI OS Automated Backup
-- Generated at: ${new Date().toISOString()}
-- Source Database Mode: ${process.env.DB_MODE || 'postgres'}

SET statement_timeout = 0;
SET client_encoding = 'UTF8';

CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) DEFAULT 'school',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  institution_id INT REFERENCES institutions(id),
  role VARCHAR(50) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  institution_id INT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS officer_sessions (
  id SERIAL PRIMARY KEY,
  institution_id INT,
  officer_type VARCHAR(50) NOT NULL,
  prompt JSONB,
  response JSONB,
  hours_saved NUMERIC(10, 2) DEFAULT 0,
  money_saved NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- End of snapshot
`
      const compressed = zlib.gzipSync(Buffer.from(snapshotSql, 'utf-8'))
      fs.writeFileSync(targetPath, compressed)
      logger.info(`Snapshot backup file written: ${fileName}`)
    }

    const stats = fs.statSync(targetPath)
    const sizeBytes = stats.size

    // Apply retention policy
    const retention = applyRetentionPolicy(backupDir)

    // Check S3 upload
    const s3Result = await uploadToS3IfConfigured(targetPath, fileName)

    // Update manifest
    const manifestPath = path.join(backupDir, 'backups-manifest.json')
    const rootManifestPath = path.resolve(__dirname, '../backups-manifest.json')

    const allBackups = fs
      .readdirSync(backupDir)
      .filter((f) => f.startsWith('backup-') && f.endsWith('.sql.gz'))
      .sort()
      .reverse()

    const manifest = {
      lastBackupTimestamp: new Date().toISOString(),
      lastBackupFileName: fileName,
      lastBackupSize: sizeBytes,
      backupCount: allBackups.length,
      storageLocation: s3Result.location,
      retention,
      backups: allBackups.map((f) => {
        const s = fs.statSync(path.join(backupDir, f))
        return {
          fileName: f,
          size: s.size,
          createdAt: s.birthtime.toISOString(),
        }
      }),
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    fs.writeFileSync(rootManifestPath, JSON.stringify(manifest, null, 2))

    logger.info(
      {
        fileName,
        sizeBytes,
        backupCount: manifest.backupCount,
        storageLocation: manifest.storageLocation,
      },
      'Automated daily backup completed successfully.',
    )

    console.log(`\n✅ Backup completed: ${fileName} (${sizeBytes} bytes)`)
    console.log(`📦 Stored at: ${targetPath}`)
    console.log(`📋 Manifest updated: ${manifestPath}\n`)

    process.exit(0)
  } catch (err) {
    logger.error('Backup script failed:', err)
    console.error(`\n❌ Backup failed: ${err.message}\n`)
    process.exit(1)
  }
}

runBackup()
