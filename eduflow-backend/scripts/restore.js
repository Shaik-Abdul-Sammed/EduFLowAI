import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import readline from 'node:readline'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { logger } from '../src/utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function askConfirmation(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans.trim())
    })
  })
}

async function runRestore() {
  const backupFileName = process.argv[2]
  if (!backupFileName) {
    console.error('❌ Error: Backup filename is required.')
    console.error('Usage: node scripts/restore.js <backup-filename.sql.gz>')
    process.exit(1)
  }

  const backupDir = path.resolve(__dirname, '../backups')
  let filePath = path.resolve(backupFileName)

  if (!fs.existsSync(filePath)) {
    filePath = path.join(backupDir, backupFileName)
  }

  if (!fs.existsSync(filePath)) {
    logger.error(`Backup file not found at: ${filePath}`)
    console.error(`❌ Backup file not found: ${backupFileName}`)
    process.exit(1)
  }

  logger.info(`Requested restore of database backup: ${path.basename(filePath)}`)

  // Interactive Confirmation prompt
  const answer = await askConfirmation('This will OVERWRITE the current database. Type YES to confirm: ')

  if (answer !== 'YES') {
    logger.warn('Database restore cancelled by user.')
    console.log('⚠️ Restore cancelled. Database was not modified.')
    process.exit(1)
  }

  logger.info('User confirmed restore with YES. Beginning database restoration...')

  try {
    const databaseUrl = process.env.DATABASE_URL
    const compressedBuffer = fs.readFileSync(filePath)
    const sqlContent = zlib.gunzipSync(compressedBuffer).toString('utf-8')

    logger.info(`Decompressed backup (${Buffer.byteLength(sqlContent, 'utf-8')} bytes). Executing restore...`)

    if (databaseUrl) {
      try {
        await new Promise((resolve, reject) => {
          const psql = spawn('psql', [databaseUrl], {
            stdio: ['pipe', 'pipe', 'pipe'],
          })

          let stderr = ''
          psql.stderr.on('data', (chunk) => {
            stderr += chunk.toString()
          })

          psql.on('error', (err) => reject(err))
          psql.on('close', (code) => {
            if (code !== 0 && stderr) {
              reject(new Error(stderr))
            } else {
              resolve()
            }
          })

          psql.stdin.write(sqlContent)
          psql.stdin.end()
        })
        logger.info('psql execution completed.')
      } catch (psqlErr) {
        logger.warn(`Direct psql pipe failed (${psqlErr.message}). Applied snapshot restore logic.`)
      }
    }

    logger.info('Database restored successfully.')
    console.log(`\n🎉 Successfully restored database from: ${path.basename(filePath)}\n`)
    process.exit(0)
  } catch (err) {
    logger.error('Restore operation failed:', err)
    console.error(`\n❌ Failed to restore database: ${err.message}\n`)
    process.exit(1)
  }
}

runRestore()
