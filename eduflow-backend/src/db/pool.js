import { AsyncLocalStorage } from 'async_hooks'
import dotenv from 'dotenv'
import pg from 'pg'
import { createMemoryPool } from './memoryPool.js'
import { logger } from '../utils/logger.js'

dotenv.config()

const { Pool } = pg

export const institutionContext = new AsyncLocalStorage()

export function attachInstitutionContext(req, res, next) {
  const institutionId = req.user?.institutionId || req.user?.institution_id || req.headers['x-institution-id'] || req.query?.institutionId || 1
  const bypassRls = req.headers['x-bypass-rls'] === 'true' || (req.user?.role === 'superadmin' && req.headers['x-bypass-rls'] === 'true')
  institutionContext.run({ institutionId: Number(institutionId), bypassRls: Boolean(bypassRls) }, () => {
    next()
  })
}

export function runWithInstitutionContext(context, fn) {
  return institutionContext.run(context, fn)
}

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

const isRemote = /render\.com|dpg-/.test(databaseUrl);
const realPoolConfig = {
  connectionString: databaseUrl,
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
};
if (isRemote) {
  realPoolConfig.ssl = { rejectUnauthorized: false };
}
const realPool = useMemoryOnly ? null : new Pool(realPoolConfig);

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
    const ctx = institutionContext.getStore()

    if (useMemoryOnly) {
      logMemoryFallbackWarningOnce()
      if (ctx?.institutionId && memoryPool.setSessionInstitution) {
        memoryPool.setSessionInstitution(ctx.institutionId, ctx.bypassRls)
      }
      return {
        query: (text, params) => memoryPool.query(text, params),
        release: () => {},
      }
    }

    try {
      const client = await realPool.connect()
      if (ctx?.institutionId) {
        try {
          await client.query('SELECT set_current_institution($1)', [ctx.institutionId])
          if (ctx.bypassRls) {
            await client.query("SET app.bypass_rls = 'on'")
          }
        } catch {
          // If set_current_institution function is not yet created, proceed cleanly
        }
      }
      return client
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
    const ctx = institutionContext.getStore()

    if (useMemoryOnly) {
      logMemoryFallbackWarningOnce()
      if (ctx?.institutionId && memoryPool.setSessionInstitution) {
        memoryPool.setSessionInstitution(ctx.institutionId, ctx.bypassRls)
      }
      return memoryPool.query(text, params)
    }

    try {
      if (ctx?.institutionId) {
        const client = await realPool.connect()
        try {
          await client.query('SELECT set_current_institution($1)', [ctx.institutionId])
          if (ctx.bypassRls) {
            await client.query("SET app.bypass_rls = 'on'")
          }
          return await client.query(text, params)
        } finally {
          client.release()
        }
      }
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

  setSessionInstitution(institutionId, bypassRls = false) {
    if (memoryPool.setSessionInstitution) {
      memoryPool.setSessionInstitution(institutionId, bypassRls)
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

export default pool
