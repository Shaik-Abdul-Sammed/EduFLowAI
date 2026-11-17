import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FinanceOfficer from '../pages/ai/officers/FinanceOfficer'

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'finance_officer', name: 'Finance Controller' } })
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() })
}))

const mockStart = jest.fn()
const mockStop = jest.fn()

jest.mock('../hooks/useStreamingOfficer', () => ({
  useStreamingOfficer: () => ({
    tokens: '',
    status: 'idle',
    error: null,
    start: mockStart,
    stop: mockStop
  })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

describe('AI Finance Officer Page', () => {
  it('renders loading skeleton and displays hydrated ledger metrics', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'EXP1', title: 'Campus Server Upgrade', amount: 45000, category: 'Infrastructure' },
        { id: 'EXP2', title: 'Lab Chemical Supplies', amount: 12000, category: 'Academics' }
      ]
    })

    render(
      <MemoryRouter>
        <FinanceOfficer />
      </MemoryRouter>
    )

    expect(screen.getByTestId('finance-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('finance-stats')).toBeInTheDocument()
    })

    expect(screen.getByText('AI Finance Officer')).toBeInTheDocument()
    expect(screen.getByText('Total Collected')).toBeInTheDocument()
    expect(screen.getByText('₹2.8 Cr')).toBeInTheDocument()
  })

  it('handles API error and permits retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <FinanceOfficer />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('finance-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('finance-retry'))

    await waitFor(() => {
      expect(screen.getByTestId('finance-stats')).toBeInTheDocument()
    })
  })

  it('executes streaming reconciliation prompt when prompt clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(
      <MemoryRouter>
        <FinanceOfficer />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('AI Finance Officer')).toBeInTheDocument()
    })

    const promptBtn = screen.getByText('Reconcile fee collection against bank deposits for March 2026')
    fireEvent.click(promptBtn)

    expect(mockStart).toHaveBeenCalled()
  })
})
