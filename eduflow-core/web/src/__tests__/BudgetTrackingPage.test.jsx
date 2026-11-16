import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import BudgetTrackingPage from '../pages/admin/BudgetTrackingPage'

describe('BudgetTrackingPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading spinner and then renders budget metrics and allocation table', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/v1/finance/budgets')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              budgets: [
                {
                  id: 1,
                  department: 'Computer Science',
                  category: 'Lab Equipment',
                  allocated_amount: 1000000,
                  spent_amount: 400000
                }
              ]
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, expenses: [] })
      })
    })

    render(
      <BrowserRouter>
        <BudgetTrackingPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('budget-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('budget-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Total Allocated FY 2026-27/i)).toBeInTheDocument()
    expect(screen.getAllByText(/10,00,000|1,000,000/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/4,00,000|400,000/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/40%/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Configure Department Budget')).toBeInTheDocument()
    expect(screen.getByText('Record Official Expense')).toBeInTheDocument()
  })

  test('configures departmental budget via API and displays success alert', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/finance/budgets')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              budget: {
                id: 2,
                department: 'Mechanical Engineering',
                category: 'Research',
                allocated_amount: 500000,
                spent_amount: 0
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            budgets: [],
            expenses: []
          })
      })
    })

    render(
      <BrowserRouter>
        <BudgetTrackingPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Configure Department Budget/i)).toBeInTheDocument()
    })

    const deptSelect = screen.getByLabelText('Department', { selector: '#budget-department' })
    fireEvent.change(deptSelect, { target: { value: 'Mechanical Engineering' } })

    const amountInput = screen.getByLabelText(/Allocated Amount/i)
    fireEvent.change(amountInput, { target: { value: '500000' } })

    const form = screen.getByRole('button', { name: /Set \/ Update Budget Head/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('budget-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Budget allocation updated for Mechanical Engineering/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/finance/budgets'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('500000')
      })
    )
  })

  test('records official expense via API and displays success alert', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/finance/expenses')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              expense: {
                id: 10,
                department: 'Computer Science',
                amount: 35000,
                vendor_name: 'Dell India'
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            budgets: [],
            expenses: []
          })
      })
    })

    render(
      <BrowserRouter>
        <BudgetTrackingPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Record Official Expense/i)).toBeInTheDocument()
    })

    const amountInput = screen.getByLabelText(/Amount \(₹\) \*/i)
    fireEvent.change(amountInput, { target: { value: '35000' } })

    const vendorInput = screen.getByLabelText(/Vendor Name & Invoice Reference \*/i)
    fireEvent.change(vendorInput, { target: { value: 'Dell India / INV-892' } })

    const form = screen.getByRole('button', { name: /Log Disbursed Expense/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('budget-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Expense ₹35,000 booked successfully/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/finance/expenses'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('35000')
      })
    )
  })

  test('displays error alert on initial fetch failure and retries successfully', async () => {
    let callCount = 0
    global.fetch = jest.fn((url) => {
      callCount++
      if (callCount <= 2) {
        return Promise.resolve({ ok: false, status: 500 })
      }
      if (url.includes('/v1/finance/budgets')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              budgets: [
                {
                  id: 3,
                  department: 'Civil Engineering',
                  category: 'Maintenance',
                  allocated_amount: 300000,
                  spent_amount: 50000
                }
              ]
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, expenses: [] })
      })
    })

    render(
      <BrowserRouter>
        <BudgetTrackingPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load budget data/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getAllByText('Civil Engineering').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/3,00,000|300,000/).length).toBeGreaterThanOrEqual(1)
    })
  })
})
