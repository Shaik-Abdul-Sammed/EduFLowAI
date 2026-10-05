import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getApiBaseURL, getFullApiUrl, resetApiBaseURL } from '../config/apiConfig.js'

describe('URL Builder and Default Institution Endpoint', () => {
  beforeEach(() => {
    resetApiBaseURL()
    delete process.env.VITE_API_BASE_URL
    if (typeof globalThis.window !== 'undefined') {
      delete globalThis.window.__hostname
    }
  })

  afterEach(() => {
    resetApiBaseURL()
    delete process.env.VITE_API_BASE_URL
    if (typeof globalThis.window !== 'undefined') {
      delete globalThis.window.__hostname
    }
  })

  test('getFullApiUrl builds correct production URL for default-institution', () => {
    resetApiBaseURL()
    globalThis.window = { __hostname: 'eduflow-web.onrender.com' }
    const url = getFullApiUrl('/v1/auth/default-institution')
    assert.strictEqual(
      url,
      'https://eduflow-backend-jvn8.onrender.com/api/v1/auth/default-institution'
    )
  })

  test('default institution endpoint is never malformed or missing hostname segments', () => {
    resetApiBaseURL()
    globalThis.window = { __hostname: 'eduflow-web.onrender.com' }
    const url = getFullApiUrl('/v1/auth/default-institution')
    assert.doesNotMatch(url, /_fault-institution/)
    assert.match(url, /^https:\/\/eduflow-backend-jvn8\.onrender\.com\/api\/v1\/auth\/default-institution$/)
    const parsed = new URL(url)
    assert.strictEqual(parsed.hostname, 'eduflow-backend-jvn8.onrender.com')
    assert.strictEqual(parsed.pathname, '/api/v1/auth/default-institution')
  })

  test('getFullApiUrl builds correct login URL', () => {
    resetApiBaseURL()
    globalThis.window = { __hostname: 'eduflow-web.onrender.com' }
    const url = getFullApiUrl('/v1/auth/login')
    assert.strictEqual(
      url,
      'https://eduflow-backend-jvn8.onrender.com/api/v1/auth/login'
    )
  })

  test('getFullApiUrl handles paths with or without leading slash', () => {
    resetApiBaseURL()
    globalThis.window = { __hostname: 'eduflow-web.onrender.com' }
    const withSlash = getFullApiUrl('/v1/auth/default-institution')
    const withoutSlash = getFullApiUrl('v1/auth/default-institution')
    assert.strictEqual(withSlash, withoutSlash)
    assert.strictEqual(withSlash, 'https://eduflow-backend-jvn8.onrender.com/api/v1/auth/default-institution')
  })
})
