import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import FinanceDashboardPage from '../pages/finance/FinanceDashboardPage'

// Mock useAuth hook as finance_officer
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 2, email: 'fo@ssit.edu.in', role: 'finance_officer', financeScope: 'INSTITUTION' },
    isAuthenticated: true
  })
}))

describe('FinanceDashboardPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn((url) => {
      const urlStr = url.toString()
      if (urlStr.includes('/api/v1/fee-reminders/pending')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            summary: { totalOverdueAccounts: 4, totalOverdueAmount: 220000 },
            tiers: { tier1: [], tier2: [], tier3: [], tier4: [] }
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    })
  })

  test('renders Financial Health Snapshot metrics', async () => {
    render(
      <MemoryRouter>
        <FinanceDashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Financial Governance & Accounts Command/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Collected This Month/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Overdue/i)).toBeInTheDocument()
    expect(screen.getByText(/Collection Efficiency/i)).toBeInTheDocument()
  })

  test('renders Overdue Breakdown and Department aggregate table', async () => {
    render(
      <MemoryRouter>
        <FinanceDashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Department-wise Overdue & Collection Breakdown/i)).toBeInTheDocument()
    expect(screen.getByText('Computer Science & Engineering')).toBeInTheDocument()
    expect(screen.getByText('Electronics & Communication')).toBeInTheDocument()
  })

  test('renders Scholarship & Fee Waiver Policy Desk with Dean routing rule', async () => {
    render(
      <MemoryRouter>
        <FinanceDashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Scholarship & Fee Waiver Governance/i)).toBeInTheDocument()
    expect(screen.getByText(/Waivers > ₹1,00,000 auto-route to Dean/i)).toBeInTheDocument()
  })
})
