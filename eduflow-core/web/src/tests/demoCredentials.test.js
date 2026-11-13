import { DEMO_ACCOUNTS } from '../config/demoCredentials.js'

describe('Demo Credentials Configuration', () => {
  test('DEMO_ACCOUNTS contains all 6 institutional evaluation personas', () => {
    expect(DEMO_ACCOUNTS.length).toBe(6)
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

  test('HOD, Faculty, Student, and Parent entries exist with credentials', () => {
    const hod = DEMO_ACCOUNTS.find(a => a.id === 'hod')
    const faculty = DEMO_ACCOUNTS.find(a => a.id === 'faculty')
    const student = DEMO_ACCOUNTS.find(a => a.id === 'student')
    const parent = DEMO_ACCOUNTS.find(a => a.id === 'parent')

    expect(hod).toBeDefined()
    expect(faculty).toBeDefined()
    expect(student).toBeDefined()
    expect(parent).toBeDefined()

    expect(hod.email).toBe('hod@eduflow.edu')
    expect(faculty.email).toBe('faculty@eduflow.edu')
    expect(student.email).toBe('student@eduflow.edu')
    expect(parent.email).toBe('parent@eduflow.edu')
  })

  test('All entries have an id, label, description, and targetRoute', () => {
    for (const account of DEMO_ACCOUNTS) {
      expect(typeof account.id).toBe('string')
      expect(typeof account.label).toBe('string')
      expect(typeof account.description).toBe('string')
      expect(typeof account.targetRoute).toBe('string')
    }
  })
})
