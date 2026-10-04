import { getApiBaseURL, getFullApiUrl, resetApiBaseURL } from '../config/apiConfig'

describe('apiConfig helper', () => {
  beforeEach(() => {
    resetApiBaseURL()
    delete process.env.VITE_API_BASE_URL
    delete window.__hostname
  })

  afterAll(() => {
    resetApiBaseURL()
    delete process.env.VITE_API_BASE_URL
    delete window.__hostname
  })

  test('getApiBaseURL returns localhost when window.location.hostname is localhost', () => {
    resetApiBaseURL()
    expect(window.location.hostname).toBe('localhost')
    const url = getApiBaseURL()
    expect(url).toBe('http://localhost:3000/api')
  })

  test('getApiBaseURL returns the live backend in production build', () => {
    resetApiBaseURL()
    window.__hostname = 'eduflow-web.onrender.com'
    const url = getApiBaseURL()
    expect(url).toBe('https://eduflow-backend-jvn8.onrender.com/api')
  })

  test('getApiBaseURL respects VITE_API_BASE_URL when set', () => {
    resetApiBaseURL()
    process.env.VITE_API_BASE_URL = 'https://custom-backend.onrender.com/api/v1'
    const url = getApiBaseURL()
    expect(url).toBe('https://custom-backend.onrender.com/api')
  })

  test('getFullApiUrl combines base and path correctly', () => {
    resetApiBaseURL()
    window.__hostname = 'eduflow-web.onrender.com'
    const full1 = getFullApiUrl('/auth/login')
    expect(full1).toBe('https://eduflow-backend-jvn8.onrender.com/api/auth/login')

    const full2 = getFullApiUrl('auth/login')
    expect(full2).toBe('https://eduflow-backend-jvn8.onrender.com/api/auth/login')
  })
})
