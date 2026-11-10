import { AsyncLocalStorage } from 'async_hooks'
import dotenv from 'dotenv'
import pg from 'pg'
import { createMemoryPool } from './memoryPool.js'
import { logger } from '../utils/logger.js'

dotenv.config()

const { Pool } = pg

export const institutionContext = new AsyncLocalStorage()

export function attachInstitutionContext(req, res, next) {
  // PHASE 1: Fix RLS Security Bypass
  // An attacker sending x-bypass-rls header without a valid superadmin JWT where institutionId === 'ALL' must be rejected with 403 Forbidden
  if (req.headers && req.headers['x-bypass-rls']) {
    const isSuperadminAll = req.user?.role === 'superadmin' &&
      (String(req.user?.institutionId || req.user?.institution_id).toUpperCase() === 'ALL')
    if (!isSuperadminAll) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Unauthorized RLS bypass attempt. Superadmin credentials required.'
      })
    }
  }

  // RLS bypass must ONLY be allowed if the JWT token explicitly contains role === 'superadmin' AND institutionId === 'ALL'
  const isSuperadminAll = req.user?.role === 'superadmin' &&
    (String(req.user?.institutionId || req.user?.institution_id).toUpperCase() === 'ALL')
  const bypassRls = Boolean(isSuperadminAll)

  const rawInstId = req.user?.institutionId || req.user?.institution_id || req.headers?.['x-institution-id'] || req.query?.institutionId || 1
  const institutionId = bypassRls ? 'ALL' : Number(rawInstId) || 1

  institutionContext.run({ institutionId, bypassRls }, () => {
    next()
  })
}

export function runWithInstitutionContext(context, fn) {
  return institutionContext.run(context, fn)
}

const databaseUrl = String(process.env.DATABASE_URL || '').trim()
const dbMode = String(process.env.DB_MODE || '').trim().toLowerCase()
const isTest = String(process.env.NODE_ENV || '').trim().toLowerCase() === 'test' ||
  process.argv.some(a => String(a).includes('test') || String(a).includes('tests/')) ||
  process.execArgv.some(a => String(a).includes('test'))
const isProduction = String(process.env.NODE_ENV || '').trim().toLowerCase() === 'production'
const forcePostgres = dbMode === 'postgres'
const allowMemoryFallback = isTest || dbMode === 'memory' || process.env.ALLOW_MEMORY_FALLBACK !== 'false'

if (isProduction && !databaseUrl && !allowMemoryFallback) {
  logger.error('FATAL: DATABASE_URL environment variable is required in production (NODE_ENV=production)')
  process.exit(1)
} else if (forcePostgres && !databaseUrl) {
  logger.error('FATAL: DATABASE_URL environment variable is required when DB_MODE=postgres')
}

const useMemoryOnly = (!databaseUrl || dbMode === 'memory' || isTest) && !forcePostgres

if (useMemoryOnly) {
  console.warn('⚠️ RUNNING IN MEMORY MODE — DATA WILL NOT PERSIST')
}

const memoryPool = createMemoryPool()
let hasLoggedMemoryWarning = useMemoryOnly

let activeFallbackToMemory = false

let normalizedDatabaseUrl = databaseUrl
if (!process.env.RENDER && /@dpg-[a-z0-9]+-[a-z0-9]+(?=[:/])/.test(normalizedDatabaseUrl) && !normalizedDatabaseUrl.includes('.render.com')) {
  normalizedDatabaseUrl = normalizedDatabaseUrl.replace(/(@dpg-[a-z0-9]+-[a-z0-9]+)(?=[:/])/, '$1.singapore-postgres.render.com')
}

const isRemote = /render\.com|dpg-/.test(normalizedDatabaseUrl);
const realPoolConfig = {
  connectionString: normalizedDatabaseUrl,
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
};
if (isRemote) {
  realPoolConfig.ssl = { rejectUnauthorized: false };
}
const realPool = useMemoryOnly ? null : new Pool(realPoolConfig);

if (realPool) {
  realPool.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL client pool (reconnecting automatically):', err?.message || err)
  })
}

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
    'getaddrinfo EAI_AGAIN',
    'timeout',
    'Connection terminated',
    'ETIMEDOUT',
    'password authentication failed',
    'no pg_hba.conf entry',
  ].some((token) => message.includes(token) || error?.code === token)
}

export const pool = {
  get isMemoryMode() {
    return useMemoryOnly || hasLoggedMemoryWarning || (pool.getDbStatus && pool.getDbStatus().mode === 'memory')
  },

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
    if (activeFallbackToMemory || useMemoryOnly) {
      return { mode: 'memory', persistent: false, warning: 'Fallback to memory active' }
    }

    if (realPool) {
      try {
        await realPool.query('SELECT 1')
        return { mode: 'postgres', persistent: true }
      } catch (err) {
        if (allowMemoryFallback) {
          logMemoryFallbackWarningOnce()
          activeFallbackToMemory = true
          return { mode: 'memory', persistent: false, warning: 'Fallback to memory active: ' + err.message }
        }
        return { mode: 'postgres', persistent: false, error: err.message }
      }
    }

    if (allowMemoryFallback) {
      logMemoryFallbackWarningOnce()
      return { mode: 'memory', persistent: false }
    }

    return { mode: 'memory', persistent: false }
  },

  async connect() {
    const ctx = institutionContext.getStore()

    if (useMemoryOnly || activeFallbackToMemory) {
      logMemoryFallbackWarningOnce()
      if (memoryPool.setSessionInstitution) {
        memoryPool.setSessionInstitution(ctx?.institutionId || null, ctx?.bypassRls || false)
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
      if (isConnectionFailure(error) && allowMemoryFallback) {
        logMemoryFallbackWarningOnce()
        activeFallbackToMemory = true
        return {
          query: (text, params) => memoryPool.query(text, params),
          release: () => {},
        }
      }
      if (forcePostgres || isProduction) {
        logger.error('PostgreSQL connection failed:', error?.message || error)
        throw error
      }
      throw error
    }
  },

  async query(text, params = []) {
    const ctx = institutionContext.getStore()

    if (useMemoryOnly || activeFallbackToMemory) {
      logMemoryFallbackWarningOnce()
      if (memoryPool.setSessionInstitution) {
        memoryPool.setSessionInstitution(ctx?.institutionId || null, ctx?.bypassRls || false)
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
          } else {
            await client.query("SET app.bypass_rls = 'off'")
          }
          return await client.query(text, params)
        } finally {
          try {
            await client.query("SET app.bypass_rls = 'off'")
          } catch (error) {
            console.error('Reset bypass_rls error:', error)
          }
          client.release()
        }
      }
      return await realPool.query(text, params)
    } catch (error) {
      if (isConnectionFailure(error) && allowMemoryFallback) {
        logMemoryFallbackWarningOnce()
        activeFallbackToMemory = true
        return memoryPool.query(text, params)
      }
      if (forcePostgres || isProduction) {
        logger.error('PostgreSQL query failed:', error?.message || error)
        throw error
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
