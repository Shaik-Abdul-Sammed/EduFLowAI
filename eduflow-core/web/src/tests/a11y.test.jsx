import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../pages/public/LoginPage'
import SeatingChart from '../components/SeatingChart'
import DegreeAuditPage from '../pages/admin/DegreeAuditPage'

expect.extend(toHaveNoViolations)

describe('Enterprise Accessibility (a11y) Audits - WCAG 2.2 AA', () => {
  test('LoginPage has zero accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('Visual SeatingChart classroom grid has zero accessibility violations', async () => {
    const mockStudents = [
      { id: '1', rollNo: '2024-CSE-001', name: 'Aarav Sharma', status: 'PRESENT' },
      { id: '2', rollNo: '2024-CSE-002', name: 'Bhavna Rao', status: 'ABSENT' },
      { id: '3', rollNo: '2024-CSE-003', name: 'Chirag Patel', status: 'DISPUTED' },
      { id: '4', rollNo: '2024-CSE-004', name: 'Deepa Verma', status: 'PRESENT' },
    ]

    const { container } = render(
      <MemoryRouter>
        <SeatingChart
          rows={4}
          columns={4}
          students={mockStudents}
          onSeatClick={() => {}}
        />
      </MemoryRouter>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('DegreeAuditPage academic progress has zero accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <DegreeAuditPage />
      </MemoryRouter>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
