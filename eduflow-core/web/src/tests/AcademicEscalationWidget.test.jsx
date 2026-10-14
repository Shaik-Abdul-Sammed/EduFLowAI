import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import HodDashboardPage from '../pages/hod/HodDashboardPage'

const mockHod = {
  id: 201,
  firstName: 'Dr. Ramesh',
  lastName: 'Kumar',
  role: 'hod',
  department: 'Computer Science & Engineering',
  departmentCode: 'CSE',
}

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockHod }),
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() }),
}))

describe('HOD Academic Escalations Desk Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn((url) => {
      const urlStr = url.toString()
      if (urlStr.includes('/api/v1/escalations/pending')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            escalations: [
              {
                id: 1,
                student_name: 'Karthik V (Roll: 1ST22ME022)',
                student_roll: '1ST22ME022',
                department: 'CSE',
                invoice_number: 'EDU-2026-0043',
                amount: 48000,
                action_requested: 'HALL_TICKET_HOLD',
                reason: 'Fee overdue for 38 days past grace deadline (Tier 3 urgency)',
                status: 'PENDING'
              }
            ]
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    })
  })

  test('Renders Financial Escalations Requiring Academic Action desk', async () => {
    render(
      <MemoryRouter>
        <HodDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Financial Escalations Requiring Academic Action/i)).toBeInTheDocument()
      expect(screen.getByText(/IIT Bombay & Anna University Governance Model/i)).toBeInTheDocument()
    })
  })

  test('Displays escalated student and action options', async () => {
    render(
      <MemoryRouter>
        <HodDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Karthik V/i)).toBeInTheDocument()
      expect(screen.getByText(/Approve Hold/i)).toBeInTheDocument()
      expect(screen.getByText(/Defer \(Counsel\)/i)).toBeInTheDocument()
    })
  })
})
