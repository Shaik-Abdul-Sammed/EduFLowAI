import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const { Pool } = pg
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/eduflow'

console.log('🌱 Starting Dean Account Seeder...')
console.log(`📡 Connecting to PostgreSQL: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`)

const isRemote = /render\.com|dpg-/.test(String(process.env.DATABASE_URL || ''));
const poolConfig = { connectionString: process.env.DATABASE_URL || databaseUrl };
if (isRemote) {
  poolConfig.ssl = { rejectUnauthorized: false };
}
const pool = new Pool(poolConfig);

export async function seedDeanAccount(clientOrPool = pool) {
  // 1. Query institution_id from admin@demo.edu or fallback to first institution
  let institutionId = 1
  try {
    const adminRes = await clientOrPool.query(
      `SELECT institution_id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      ['admin@demo.edu']
    )
    if (adminRes.rows.length > 0 && adminRes.rows[0].institution_id) {
      institutionId = adminRes.rows[0].institution_id
      console.log(`ℹ️ Found admin institution ID: ${institutionId}`)
    } else {
      const instRes = await clientOrPool.query(`SELECT id FROM institutions LIMIT 1`)
      if (instRes.rows.length > 0) {
        institutionId = instRes.rows[0].id
        console.log(`ℹ️ Using default institution ID: ${institutionId}`)
      }
    }
  } catch (err) {
    console.warn(`⚠️ Warning fetching admin institution: ${err.message}. Defaulting to ID: 1`)
    institutionId = 1
  }

  // 2. Generate bcrypt hash for Demo@2026 with 10 salt rounds
  const password = 'Demo@2026'
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // 3. Inspect columns in users table
  let existingColumns = new Set()
  try {
    const colRes = await clientOrPool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `)
    existingColumns = new Set(colRes.rows.map(r => r.column_name.toLowerCase()))
  } catch {
    // If schema inspection not supported, assume default schema
  }

  const columns = ['institution_id', 'role', 'email', 'password_hash']
  const values = [institutionId, 'admin', 's9010150809@gmail.com', passwordHash]

  if (existingColumns.has('username')) {
    columns.push('username')
    values.push('dean')
  }
  if (existingColumns.has('first_name')) {
    columns.push('first_name')
    values.push('Dean')
  }
  if (existingColumns.has('last_name')) {
    columns.push('last_name')
    values.push('Demo')
  }
  if (existingColumns.has('name')) {
    columns.push('name')
    values.push('Dean Demo')
  }
  if (existingColumns.has('phone')) {
    columns.push('phone')
    values.push('9010150809')
  }
  if (existingColumns.has('metadata')) {
    columns.push('metadata')
    values.push(JSON.stringify({ phone: '9010150809', designation: 'College Dean' }))
  }

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
  const insertQuery = `
    INSERT INTO users (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role
      ${existingColumns.has('first_name') ? ', first_name = EXCLUDED.first_name' : ''}
      ${existingColumns.has('last_name') ? ', last_name = EXCLUDED.last_name' : ''}
    RETURNING id, email, role;
  `

  const result = await clientOrPool.query(insertQuery, values)
  const user = result.rows[0]
  console.log(`✅ Dean user ready: ID=${user.id}, email=${user.email}, role=${user.role}`)
  return user
}

// Direct execution
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  (async () => {
    let client
    try {
      client = await pool.connect()
      const user = await seedDeanAccount(client)
      console.log(`🎉 Successfully seeded dean account! User ID: ${user.id}, Email: ${user.email}`)
      await client.release()
      await pool.end()
      process.exit(0)
    } catch (err) {
      console.error('❌ Failed to seed dean account:', err.message)
      if (client) client.release()
      await pool.end().catch(() => {})
      process.exit(1)
    }
  })()
}
