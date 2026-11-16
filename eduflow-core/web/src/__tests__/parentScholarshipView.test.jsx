import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ScholarshipView from '../pages/parent/scholarshipView'

describe('ScholarshipView (Parent) Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders fetched scholarships and metrics', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: [
              {
                id: 1,
                student_roll: 'SS26',
                student_name: 'Ananya Sharma',
                scholarship_name: 'Pragati Merit Scholarship for Women in STEM',
                category: 'Merit',
                amount: 50000,
                gpa: 9.4,
                annual_family_income: 300000,
                status: 'VERIFIED',
                invoice_deduction_id: 'AUTO-DED-2026-001'
              },
              {
                id: 2,
                student_roll: 'SS26',
                student_name: 'Ananya Sharma',
                scholarship_name: 'Post-Matric State Financial Grant',
                category: 'Post-Matric State',
                amount: 25000,
                gpa: 8.8,
                annual_family_income: 180000,
                status: 'APPLIED',
                invoice_deduction_id: null
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ScholarshipView />
      </BrowserRouter>
    )

    expect(screen.getByTestId('scholarship-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Scholarship & Fee Bursary View')).toBeInTheDocument()
    expect(screen.getByText('Total Verified Aid')).toBeInTheDocument()
    expect(screen.getAllByText('₹50,000').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('1 Pending')).toBeInTheDocument()
    expect(screen.getByText('Pragati Merit Scholarship for Women in STEM')).toBeInTheDocument()
    expect(screen.getByText('Post-Matric State Financial Grant')).toBeInTheDocument()
    expect(screen.getByText('AUTO-DED-2026-001')).toBeInTheDocument()
  })

  test('renders error state with retry button when initial fetch fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <ScholarshipView />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('scholarship-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Scholarship Records')).toBeInTheDocument()

    // Mock successful retry
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

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    await waitFor(() => {
      expect(screen.getByTestId('scholarship-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No Scholarships Found')).toBeInTheDocument()
  })

  test('submits bursary scholarship application form and updates list on success', async () => {
    let callCount = 0
    global.fetch = jest.fn((url, options) => {
      callCount++
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              scholarship: {
                id: 3,
                student_roll: 'SS26',
                student_name: 'Ananya Sharma',
                scholarship_name: 'Merit-Cum-Means Tuition Fee Concession',
                category: 'Merit',
                amount: 30000,
                gpa: 9.0,
                annual_family_income: 250000,
                status: 'APPLIED'
              }
            })
        })
      }

      // Initial or refresh GET
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: callCount > 1
              ? [
                  {
                    id: 3,
                    student_roll: 'SS26',
                    student_name: 'Ananya Sharma',
                    scholarship_name: 'Merit-Cum-Means Tuition Fee Concession',
                    category: 'Merit',
                    amount: 30000,
                    gpa: 9.0,
                    annual_family_income: 250000,
                    status: 'APPLIED'
                  }
                ]
              : []
          })
      })
    })

    render(
      <BrowserRouter>
        <ScholarshipView />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-loading')).not.toBeInTheDocument()
    })

    // Open application modal
    const openBtn = screen.getByTestId('open-scholarship-modal-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('scholarship-form-card')).toBeInTheDocument()
    expect(screen.getByText('Apply for Student Scholarship / Hardship Bursary')).toBeInTheDocument()

    // Submit form
    const submitBtn = screen.getByTestId('submit-scholarship-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('scholarship-success-alert')).toBeInTheDocument()
    })

    expect(screen.getByText(/submitted successfully for bursary verification/)).toBeInTheDocument()
  })
})
