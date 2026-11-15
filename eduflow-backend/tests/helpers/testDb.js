import pg from 'pg'
import { createMemoryPool } from '../../src/db/memoryPool.js'

const { Pool } = pg

/**
 * Test Database Helper
 * Strictly isolates test runs from production/remote databases.
 */
export function getTestDb() {
  const isTest = process.env.NODE_ENV === 'test' || process.env.DB_MODE === 'memory'
  const databaseUrl = String(process.env.DATABASE_URL || '')
  const dbHost = String(process.env.DB_HOST || '')

  const isRemoteHost = /render\.com|amazonaws|azure|gcp/i.test(databaseUrl) ||
                       /render\.com|amazonaws|azure|gcp/i.test(dbHost)

  if (isTest || isRemoteHost) {
    if (isTest && isRemoteHost) {
      console.warn('[test-mode] Intercepted remote database URL in test mode — substituting in-memory pool')
    }
    return createMemoryPool()
  }

  return new Pool({
    connectionString: databaseUrl || 'postgresql://postgres:postgres@localhost:5432/eduflow_test',
    connectionTimeoutMillis: 2000
  })
}

export default getTestDb
