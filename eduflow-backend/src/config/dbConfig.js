/**
 * Generates pg.Pool configuration with dynamic SSL enablement
 * for remote Render PostgreSQL instances.
 *
 * @param {string} [databaseUrl]
 * @returns {{ connectionString: string | undefined, ssl?: { rejectUnauthorized: boolean } }}
 */
export function getPoolConfig(databaseUrl) {
  const isRemote = /render\.com|dpg-/.test(String(databaseUrl || ''))
  const poolConfig = { connectionString: databaseUrl }
  if (isRemote) {
    poolConfig.ssl = { rejectUnauthorized: false }
  }
  return poolConfig
}
