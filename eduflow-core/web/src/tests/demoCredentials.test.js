import { DEMO_ACCOUNTS } from '../config/demoCredentials.js'

describe('Demo Credentials Configuration', () => {
  test('DEMO_ACCOUNTS contains exactly 2 entries', () => {
    expect(DEMO_ACCOUNTS.length).toBe(2)
  })

  test('Admin entry has correct email and password', () => {
    const admin = DEMO_ACCOUNTS.find(a => a.id === 'admin')
    expect(admin).toBeDefined()
    expect(admin.email).toBe('admin@demo.edu')
    expect(admin.password).toBe('Demo@2026')
  })

  test('Dean entry has correct email and password', () => {
    const dean = DEMO_ACCOUNTS.find(a => a.id === 'dean')
    expect(dean).toBeDefined()
    expect(dean.email).toBe('s9010150809@gmail.com')
    expect(dean.password).toBe('Demo@2026')
    expect(dean.phone).toBe('9010150809')
  })

  test('Both entries have an id, label, description', () => {
    for (const account of DEMO_ACCOUNTS) {
      expect(typeof account.id).toBe('string')
      expect(typeof account.label).toBe('string')
      expect(typeof account.description).toBe('string')
    }
  })
})
