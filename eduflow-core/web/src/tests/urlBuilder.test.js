import { getFullApiUrl, resetApiBaseURL } from '../config/apiConfig.js'

describe('URL Builder and Default Institution Endpoint', () => {
  beforeEach(() => {
    resetApiBaseURL()
    delete process.env.VITE_API_BASE_URL
    if (typeof window !== 'undefined') {
      window.__hostname = ''
    }
  })

  afterEach(() => {
    resetApiBaseURL()
    delete process.env.VITE_API_BASE_URL
    if (typeof window !== 'undefined') {
      window.__hostname = ''
    }
  })

  test('getFullApiUrl builds correct production URL for default-institution', () => {
    resetApiBaseURL()
    window.__hostname = 'eduflow-web.onrender.com'
    const url = getFullApiUrl('/v1/auth/default-institution')
    expect(url).toBe('https://eduflow-backend-jvn8.onrender.com/api/v1/auth/default-institution')
  })

  test('default institution endpoint is never malformed or missing hostname segments', () => {
    resetApiBaseURL()
    window.__hostname = 'eduflow-web.onrender.com'
    const url = getFullApiUrl('/v1/auth/default-institution')
    expect(url).not.toMatch(/_fault-institution/)
    expect(url).toMatch(/^https:\/\/eduflow-backend-jvn8\.onrender\.com\/api\/v1\/auth\/default-institution$/)
    const parsed = new URL(url)
    expect(parsed.hostname).toBe('eduflow-backend-jvn8.onrender.com')
    expect(parsed.pathname).toBe('/api/v1/auth/default-institution')
  })

  test('getFullApiUrl builds correct login URL', () => {
    resetApiBaseURL()
    window.__hostname = 'eduflow-web.onrender.com'
    const url = getFullApiUrl('/v1/auth/login')
    expect(url).toBe('https://eduflow-backend-jvn8.onrender.com/api/v1/auth/login')
  })

  test('getFullApiUrl handles paths with or without leading slash', () => {
    resetApiBaseURL()
    window.__hostname = 'eduflow-web.onrender.com'
    const withSlash = getFullApiUrl('/v1/auth/default-institution')
    const withoutSlash = getFullApiUrl('v1/auth/default-institution')
    expect(withSlash).toBe(withoutSlash)
    expect(withSlash).toBe('https://eduflow-backend-jvn8.onrender.com/api/v1/auth/default-institution')
  })
})
