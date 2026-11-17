import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentPaymentHistory from '../pages/student/paymentHistory'

describe('StudentPaymentHistory Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays student payment history and totals', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'TXN-9021',
                studentName: 'Ananya Sharma',
                course: 'Semester 1 Tuition & Lab Fee',
                amount: 45000,
                mode: 'UPI / Razorpay'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <StudentPaymentHistory />
      </BrowserRouter>
    )

    expect(screen.getByTestId('payment-history-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('payment-history-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Payment History')).toBeInTheDocument()
    expect(screen.getByText('TXN-9021')).toBeInTheDocument()
    expect(screen.getByText(/Semester 1 Tuition & Lab Fee/)).toBeInTheDocument()
    expect(screen.getAllByText('₹45,000').length).toBeGreaterThanOrEqual(1)
  })

  test('handles network failure with retry button', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <StudentPaymentHistory />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('payment-history-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Payment History')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('payment-history-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('All Transactions')).toBeInTheDocument()
  })

  test('downloads payment receipt and displays confirmation toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              ticket: { id: 'REC-1122' }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'TXN-9021',
                studentName: 'Ananya Sharma',
                course: 'Semester Tuition'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentPaymentHistory />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('payment-history-loading')).not.toBeInTheDocument()
    })

    const receiptBtn = screen.getByTestId('receipt-btn-TXN-9021')
    fireEvent.click(receiptBtn)

    await waitFor(() => {
      expect(screen.getByTestId('payment-history-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/Tax-deductible receipt for "TXN-9021" downloaded successfully! Ticket #REC-1122/)).toBeInTheDocument()
  })
})
