import dotenv from 'dotenv'
import pg from 'pg'
import { createMemoryPool } from './memoryPool.js'
import { logger } from '../utils/logger.js'

dotenv.config()

const { Pool } = pg

const databaseUrl = String(process.env.DATABASE_URL || '').trim()
const dbMode = String(process.env.DB_MODE || '').trim().toLowerCase()
const isProduction = String(process.env.NODE_ENV || '').trim().toLowerCase() === 'production'
const forcePostgres = dbMode === 'postgres' || isProduction

if (forcePostgres && !databaseUrl) {
  throw new Error('FATAL: DATABASE_URL environment variable is required when DB_MODE=postgres or NODE_ENV=production')
}

const useMemoryOnly = !databaseUrl || dbMode === 'memory'

if (useMemoryOnly) {
  console.warn('⚠️ RUNNING IN MEMORY MODE — DATA WILL NOT PERSIST')
}

const memoryPool = createMemoryPool()
let hasLoggedMemoryWarning = useMemoryOnly

const realPool = useMemoryOnly
  ? null
  : new Pool({
      connectionString: databaseUrl,
      max: 50,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxUses: 7500,
    })

function logMemoryFallbackWarningOnce() {
  if (!hasLoggedMemoryWarning) {
    console.warn('⚠️ RUNNING IN MEMORY MODE — DATA WILL NOT PERSIST')
    hasLoggedMemoryWarning = true
  }
}

function isConnectionFailure(error) {
  const message = String(error?.message || '')
  return [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ECONNRESET',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'connect ECONNREFUSED',
    'getaddrinfo ENOTFOUND',
  ].some((token) => message.includes(token) || error?.code === token)
}

export const pool = {
  getDbStatus() {
    if (forcePostgres) {
      return { mode: 'postgres', persistent: true }
    }
    if (useMemoryOnly || hasLoggedMemoryWarning) {
      return { mode: 'memory', persistent: false }
    }
    return { mode: 'postgres', persistent: true }
  },

  async getHealth() {
    if (forcePostgres) {
      if (!realPool) {
        throw new Error('No PostgreSQL connection pool available')
      }
      await realPool.query('SELECT 1')
      return { mode: 'postgres', persistent: true }
    }

    if (realPool) {
      try {
        await realPool.query('SELECT 1')
        return { mode: 'postgres', persistent: true }
      } catch (err) {
        logMemoryFallbackWarningOnce()
        return { mode: 'memory', persistent: false, warning: 'Fallback to memory active: ' + err.message }
      }
    }

    logMemoryFallbackWarningOnce()
    return { mode: 'memory', persistent: false }
  },

  async connect() {
    if (useMemoryOnly) {
      logMemoryFallbackWarningOnce()
      return {
        query: (text, params) => memoryPool.query(text, params),
        release: () => {},
      }
    }

    try {
      return await realPool.connect()
    } catch (error) {
      if (forcePostgres) {
        logger.error('FATAL: PostgreSQL connection failed and DB_MODE=postgres:', error)
        throw error
      }
      if (isConnectionFailure(error)) {
        logMemoryFallbackWarningOnce()
        return {
          query: (text, params) => memoryPool.query(text, params),
          release: () => {},
        }
      }
      throw error
    }
  },

  async query(text, params = []) {
    if (useMemoryOnly) {
      logMemoryFallbackWarningOnce()
      return memoryPool.query(text, params)
    }

    try {
      return await realPool.query(text, params)
    } catch (error) {
      if (forcePostgres) {
        logger.error('FATAL: PostgreSQL query failed and DB_MODE=postgres:', error)
        throw error
      }
      if (isConnectionFailure(error)) {
        logMemoryFallbackWarningOnce()
        return memoryPool.query(text, params)
      }
      throw error
    }
  },

  async end() {
    const tasks = [memoryPool.end()]
    if (realPool) {
      tasks.unshift(realPool.end().catch(() => {}))
    }
    return Promise.all(tasks)
  },
}
