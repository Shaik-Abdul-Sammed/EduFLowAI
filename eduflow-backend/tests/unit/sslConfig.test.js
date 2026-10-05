import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getPoolConfig } from '../../src/config/dbConfig.js'

describe('Unit: PostgreSQL SSL Configuration for Render', () => {
  it('1. SSL is enabled when DATABASE_URL contains render.com', () => {
    const url = 'postgres://eduflow_user:secret@oregon-postgres.render.com:5432/eduflow_db'
    const config = getPoolConfig(url)

    assert.equal(config.connectionString, url)
    assert.deepEqual(config.ssl, { rejectUnauthorized: false })
  })

  it('2. SSL is enabled when DATABASE_URL contains dpg-', () => {
    const url = 'postgres://eduflow_user:secret@dpg-c123456789-a.singapore-postgres.render.com/eduflow_db'
    const config = getPoolConfig(url)

    assert.equal(config.connectionString, url)
    assert.deepEqual(config.ssl, { rejectUnauthorized: false })
  })

  it('3. SSL is disabled when DATABASE_URL contains localhost', () => {
    const url = 'postgres://postgres:postgres@localhost:5432/eduflow'
    const config = getPoolConfig(url)

    assert.equal(config.connectionString, url)
    assert.equal(config.ssl, undefined)
  })

  it('4. SSL is disabled when DATABASE_URL is empty', () => {
    const configEmpty = getPoolConfig('')
    assert.equal(configEmpty.ssl, undefined)

    const configNull = getPoolConfig(null)
    assert.equal(configNull.ssl, undefined)

    const configUndefined = getPoolConfig(undefined)
    assert.equal(configUndefined.ssl, undefined)
  })
})
