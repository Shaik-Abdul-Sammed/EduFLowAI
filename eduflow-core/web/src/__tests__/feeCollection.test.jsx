import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FeeCollection from '../pages/admin/feeCollection'

describe('FeeCollection Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched fee transactions', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            totalCollected: 90000,
            data: [
              {
                id: 'FEE001',
                receiptNo: 'RCP-2026-8801',
                studentName: 'Vikramaditya Rao',
                studentRoll: '2024MPC044',
                amount: 45000,
                mode: 'Online',
                term: 'Term 1 Tuition',
                date: '2026-06-15'
              },
              {
                id: 'FEE002',
                receiptNo: 'RCP-2026-8802',
                studentName: 'Priya Singh',
                studentRoll: '2024BIPC012',
                amount: 45000,
                mode: 'DD',
                term: 'Hostel Fee S1',
                date: '2026-06-16'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FeeCollection />
      </BrowserRouter>
    )

    expect(screen.getByTestId('fee-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('fee-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Fee Collection & Accounts')).toBeInTheDocument()
    expect(screen.getByText('Vikramaditya Rao')).toBeInTheDocument()
    expect(screen.getByText('Priya Singh')).toBeInTheDocument()
    expect(screen.getByText('Total Reconciled')).toBeInTheDocument()
  })

  test('displays error state with retry on fetch failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <FeeCollection />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('fee-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Fee Records')).toBeInTheDocument()

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
      expect(screen.getByTestId('fee-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No fee transactions found')).toBeInTheDocument()
  })

  test('submits new payment record form and updates ledger', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              receipt: {
                id: 'FEE003',
                receiptNo: 'RCP-2026-9999',
                studentName: 'Sneha Patel',
                studentRoll: '2024BIPC005',
                amount: 30000,
                mode: 'Online',
                term: 'Term 1 Tuition'
              }
            })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: []
          })
      })
    })

    render(
      <BrowserRouter>
        <FeeCollection />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('fee-loading')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('open-payment-btn'))
    expect(screen.getByTestId('record-fee-form')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('e.g. Vikramaditya Rao'), { target: { value: 'Sneha Patel' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. 2024MPC044'), { target: { value: '2024BIPC005' } })

    fireEvent.click(screen.getByTestId('submit-payment-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('fee-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/posted successfully for Sneha Patel/)).toBeInTheDocument()
  })
})
