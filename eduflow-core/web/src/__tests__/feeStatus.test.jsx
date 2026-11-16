import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FeeStatusPage from '../pages/student/feeStatus'
import apiClient from '../services/apiClient'

jest.mock('../services/apiClient')

const mockFeeResponse = {
  success: true,
  totalFee: 120000,
  paidAmount: 80000,
  pendingAmount: 40000,
  nextDue: '2026-12-15',
  nextDueAmount: 40000,
  transactions: [
    { id: 'TXN8801', date: '2026-06-15', description: 'Term 1 Tuition Fee', amount: 50000, method: 'Online UPI', status: 'paid', receipt: 'RCP-2026-8801' },
    { id: 'TXN8802', date: '2026-08-10', description: 'Lab Fee', amount: 30000, method: 'Net Banking', status: 'paid', receipt: 'RCP-2026-8802' }
  ]
}

describe('FeeStatus Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state on mount', () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <FeeStatusPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('fee-loading')).toBeInTheDocument()
  })

  it('fetches and renders fee balances and transactions', async () => {
    apiClient.get.mockResolvedValueOnce({ data: mockFeeResponse })

    render(
      <BrowserRouter>
        <FeeStatusPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('fee-summary-cards')).toBeInTheDocument()
    })

    expect(screen.getByText('₹1,20,000')).toBeInTheDocument()
    expect(screen.getByText('₹80,000')).toBeInTheDocument()
    expect(screen.getByText('₹40,000')).toBeInTheDocument()
    expect(screen.getByText('Term 1 Tuition Fee')).toBeInTheDocument()
    expect(screen.getByText('Lab Fee')).toBeInTheDocument()
  })

  it('remits pending balance via POST API and updates status', async () => {
    apiClient.get.mockResolvedValueOnce({ data: mockFeeResponse })
    apiClient.post.mockResolvedValueOnce({
      status: 201,
      data: {
        success: true,
        message: 'Fee payment successfully recorded',
        transaction: {
          id: 'TXN8899',
          date: '2026-12-01',
          description: 'Term 2 Tuition Fee Remittance',
          amount: 40000,
          method: 'Online UPI',
          status: 'paid',
          receipt: 'RCP-2026-9999'
        },
        feeData: {
          totalFee: 120000,
          paidAmount: 120000,
          pendingAmount: 0,
          transactions: []
        }
      }
    })

    render(
      <BrowserRouter>
        <FeeStatusPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pay-now-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('pay-now-btn'))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/payments/remit-fee', expect.objectContaining({
        amount: 40000
      }))
    })

    expect(await screen.findByTestId('fee-payment-success')).toBeInTheDocument()
    expect(screen.getByText(/Payment of ₹40,000 remitted successfully/i)).toBeInTheDocument()
  })

  it('renders error state on API failure', async () => {
    const errorObj = new Error('Bursary ledger unreachable')
    errorObj.response = { status: 500, data: { error: 'Bursary ledger unreachable' } }
    apiClient.get.mockRejectedValueOnce(errorObj)

    render(
      <BrowserRouter>
        <FeeStatusPage />
      </BrowserRouter>
    )

    expect(await screen.findByTestId('fee-api-error')).toBeInTheDocument()
    expect(screen.getByText(/Bursary ledger unreachable/i)).toBeInTheDocument()
  })
})
