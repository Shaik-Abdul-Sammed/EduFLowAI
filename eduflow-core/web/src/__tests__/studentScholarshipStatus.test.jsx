import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ScholarshipStatus from '../pages/student/scholarshipStatus'

describe('StudentScholarshipStatus Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays primary active scholarship and stages', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: [
              {
                id: 'sch-101',
                scholarship_name: 'Pragati Merit Scholarship for Women in STEM',
                category: 'Academic Merit',
                amount: 50000,
                status: 'VERIFIED',
                gpa: 9.4,
                created_at: '2026-08-01'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ScholarshipStatus />
      </BrowserRouter>
    )

    expect(screen.getByTestId('scholarship-status-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-status-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Scholarship Status & Grants')).toBeInTheDocument()
    expect(screen.getByText('Pragati Merit Scholarship for Women in STEM')).toBeInTheDocument()
    expect(screen.getByText(/Tuition Credit Value/)).toBeInTheDocument()
    expect(screen.getByText('₹50,000')).toBeInTheDocument()
    expect(screen.getByText('📋 Approval & Concession Progress')).toBeInTheDocument()
  })

  test('displays error state with retry button on network failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <ScholarshipStatus />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('scholarship-status-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Scholarship Portal')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-status-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText(/Primary Active Scholarship Grant/)).toBeInTheDocument()
  })

  test('opens apply modal and submits new scholarship application', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Scholarship application created'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: [
              {
                id: 'sch-101',
                scholarship_name: 'State Freeship Assistance',
                category: 'State Freeship',
                amount: 35000,
                status: 'VERIFIED'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <ScholarshipStatus />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-status-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('open-apply-modal-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('apply-scholarship-form')).toBeInTheDocument()
    expect(screen.getByText('Apply for Student Bursary / Fee Waiver')).toBeInTheDocument()

    const submitBtn = screen.getByTestId('submit-apply-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('scholarship-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/submitted successfully for verification!/)).toBeInTheDocument()
  })
})
