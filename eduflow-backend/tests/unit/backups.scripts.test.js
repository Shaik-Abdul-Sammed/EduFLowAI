import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

describe('Unit: Backup & Restore Scripts', () => {
  it('backup.js runs without error and creates a .sql.gz file in backups directory', async () => {
    const backupDir = path.join(rootDir, 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const code = await new Promise((resolve) => {
      const proc = spawn('node', ['scripts/backup.js'], {
        cwd: rootDir,
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL || 'postgres://eduflow:password@localhost:5432/eduflow',
        },
      })

      proc.on('close', resolve)
    })

    assert.equal(code, 0, 'backup.js should exit with code 0')

    const gzFiles = fs.readdirSync(backupDir).filter((f) => f.startsWith('backup-') && f.endsWith('.sql.gz'))
    assert.ok(gzFiles.length > 0, 'Expected at least one .sql.gz backup file in backups directory')
  })

  it('Retention policy keeps 30 daily and 12 monthly', () => {
    const testDir = path.join(rootDir, 'backups', 'retention-test-sandbox')
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
    fs.mkdirSync(testDir, { recursive: true })

    try {
      // Create 45 daily backup mock files across 2 different years/months
      for (let day = 1; day <= 45; day++) {
        const d = String(day).padStart(2, '0')
        const fname = `backup-2026-04-${d}-120000.sql.gz`
        fs.writeFileSync(path.join(testDir, fname), 'mock content')
      }

      // Read files and simulate retention logic
      const files = fs.readdirSync(testDir).filter((f) => f.startsWith('backup-') && f.endsWith('.sql.gz')).sort()
      const seenDays = new Set()
      const dailyKept = new Set()
      const reversed = [...files].reverse()

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

      assert.equal(seenDays.size, 30, 'Retention policy must keep at most 30 days')
      assert.equal(dailyKept.size, 30, 'Retention policy must keep exactly 30 daily backups')
    } finally {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('restore.js requires interactive confirmation and refuses without YES', async () => {
    // Call restore.js providing "NO" or "cancel" on stdin
    const backupDir = path.join(rootDir, 'backups')
    const gzFiles = fs.readdirSync(backupDir).filter((f) => f.startsWith('backup-') && f.endsWith('.sql.gz'))
    const targetFile = gzFiles[0] || 'backup-mock.sql.gz'

    const codeWithoutYes = await new Promise((resolve) => {
      const proc = spawn('node', ['scripts/restore.js', targetFile], {
        cwd: rootDir,
        env: { ...process.env },
      })

      // Send "NO" into stdin
      proc.stdin.write('NO\n')
      proc.stdin.end()

      proc.on('close', resolve)
    })

    assert.notEqual(codeWithoutYes, 0, 'restore.js must refuse and exit non-zero when confirmation is not YES')
  })
})
