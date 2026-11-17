import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PayrollPreview from '../pages/admin/payrollPreview'

describe('PayrollPreview Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched employee payroll register', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            totalDisbursed: 215000,
            data: [
              {
                id: 'EMP-01',
                employeeName: 'Dr. K. Srinivas',
                role: 'Professor & HOD',
                base: 120000,
                bonus: 15000,
                deductions: 12000,
                status: 'approved'
              },
              {
                id: 'EMP-02',
                employeeName: 'Prof. Ananya Roy',
                role: 'Associate Professor',
                base: 95000,
                bonus: 8000,
                deductions: 9500,
                status: 'approved'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <PayrollPreview />
      </BrowserRouter>
    )

    expect(screen.getByTestId('payroll-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('payroll-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Payroll Execution & Disbursals')).toBeInTheDocument()
    expect(screen.getByText('Dr. K. Srinivas')).toBeInTheDocument()
    expect(screen.getByText('Prof. Ananya Roy')).toBeInTheDocument()
    expect(screen.getByText('Total Net Disbursal')).toBeInTheDocument()
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
        <PayrollPreview />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('payroll-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Payroll Register')).toBeInTheDocument()

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
      expect(screen.getByTestId('payroll-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No payroll records found')).toBeInTheDocument()
  })

  test('submits employee compensation record and releases payroll batch', async () => {
    let callCount = 0
    global.fetch = jest.fn((url, options) => {
      callCount++
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              payslip: {
                id: 'PAY003',
                employeeName: 'Dr. M. Venkat',
                role: 'Assistant Professor',
                base: 75000,
                bonus: 5000,
                deductions: 7500,
                net: 72500,
                status: 'Disbursed'
              }
            })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: callCount > 1
              ? [
                  {
                    id: 'PAY003',
                    employeeName: 'Dr. M. Venkat',
                    role: 'Assistant Professor',
                    base: 75000,
                    bonus: 5000,
                    deductions: 7500,
                    status: 'approved'
                  }
                ]
              : []
          })
      })
    })

    render(
      <BrowserRouter>
        <PayrollPreview />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('payroll-loading')).not.toBeInTheDocument()
    })

    // Open add form
    fireEvent.click(screen.getByTestId('open-add-payroll-btn'))
    expect(screen.getByTestId('add-payroll-form')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('e.g. Dr. Harish Kumar'), { target: { value: 'Dr. M. Venkat' } })
    fireEvent.click(screen.getByTestId('submit-payroll-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('payroll-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/posted successfully/)).toBeInTheDocument()

    // Release batch
    fireEvent.click(screen.getByTestId('release-payroll-btn'))
    expect(screen.getByTestId('batch-dispatched-badge')).toBeInTheDocument()
  })
})
