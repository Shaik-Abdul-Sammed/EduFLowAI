import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ParentFeeDashboardPage from '../pages/parent/feeDashboard'
import apiClient from '../services/apiClient'

jest.mock('../services/apiClient')

const mockParentFeeData = {
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

describe('ParentFeeDashboard Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state on mount', () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <ParentFeeDashboardPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('parent-fee-loading')).toBeInTheDocument()
  })

  it('fetches and renders parent fee ledger and transaction list', async () => {
    apiClient.get.mockResolvedValueOnce({ data: mockParentFeeData })

    render(
      <BrowserRouter>
        <ParentFeeDashboardPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('parent-fee-summaries')).toBeInTheDocument()
    })

    expect(screen.getByText('₹1,20,000')).toBeInTheDocument()
    expect(screen.getByText('₹80,000')).toBeInTheDocument()
    expect(screen.getByText('₹40,000')).toBeInTheDocument()
    expect(screen.getByText('Term 1 Tuition Fee')).toBeInTheDocument()
    expect(screen.getByTestId('parent-pay-btn')).toBeInTheDocument()
  })

  it('remits pending balance via POST API and marks account balanced', async () => {
    apiClient.get.mockResolvedValueOnce({ data: mockParentFeeData })
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
          method: 'Parent NetBanking / UPI',
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
        <ParentFeeDashboardPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('parent-pay-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('parent-pay-btn'))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/payments/remit-fee', expect.objectContaining({
        amount: 40000
      }))
    })

    expect(await screen.findByTestId('parent-fee-success')).toBeInTheDocument()
    expect(screen.getByTestId('account-balanced-badge')).toBeInTheDocument()
  })

  it('renders error state on API failure', async () => {
    const errorObj = new Error('Bursary service unavailable')
    errorObj.response = { status: 500, data: { error: 'Bursary service unavailable' } }
    apiClient.get.mockRejectedValueOnce(errorObj)

    render(
      <BrowserRouter>
        <ParentFeeDashboardPage />
      </BrowserRouter>
    )

    expect(await screen.findByTestId('parent-fee-api-error')).toBeInTheDocument()
    expect(screen.getByText(/Bursary service unavailable/i)).toBeInTheDocument()
  })
})
