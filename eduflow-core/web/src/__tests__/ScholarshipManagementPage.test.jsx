import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ScholarshipManagementPage from '../pages/admin/ScholarshipManagementPage'

describe('ScholarshipManagementPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders scholarship applications', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: [
              {
                id: 1,
                scholarship_name: 'Merit-cum-Means Endowment',
                category: 'Merit',
                student_name: 'Ananya Sharma',
                student_roll: 'SS26',
                amount: 25000,
                gpa: 9.4,
                annual_family_income: 180000,
                status: 'APPLIED',
                verified_by: null,
                invoice_deduction_id: null
              },
              {
                id: 2,
                scholarship_name: 'National Talent Bursary',
                category: 'Sports',
                student_name: 'Karan Patel',
                student_roll: 'SS25',
                amount: 40000,
                gpa: 8.8,
                annual_family_income: 300000,
                status: 'VERIFIED',
                verified_by: 'Dean of Finance',
                invoice_deduction_id: 'AUTO-DED-10928'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ScholarshipManagementPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('scholarship-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Scholarship Verification & Auto-Deductions')).toBeInTheDocument()
    expect(screen.getByText('Merit-cum-Means Endowment')).toBeInTheDocument()
    expect(screen.getByText('National Talent Bursary')).toBeInTheDocument()
    expect(screen.getByText(/Ananya Sharma/)).toBeInTheDocument()
    expect(screen.getByText(/Karan Patel/)).toBeInTheDocument()
    expect(screen.getByText('Verify & Deduct from Next Fee')).toBeInTheDocument()
    expect(screen.getByText(/Verified by Dean of Finance/i)).toBeInTheDocument()
  })

  test('renders error alert when API call fails and handles retry click', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'DB Connection down' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: []
          })
      })
    })

    render(
      <BrowserRouter>
        <ScholarshipManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load scholarship records/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText(/No scholarship records found/i)).toBeInTheDocument()
    })
  })

  test('successfully verifies a pending scholarship and updates status', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'PATCH' && url.includes('/v1/scholarships/1/verify')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Scholarship ₹25000 verified and applied to student invoice deduction credit.'
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
                id: 1,
                scholarship_name: 'Merit-cum-Means Endowment',
                category: 'Merit',
                student_name: 'Ananya Sharma',
                student_roll: 'SS26',
                amount: 25000,
                gpa: 9.4,
                annual_family_income: 180000,
                status: 'APPLIED',
                verified_by: null,
                invoice_deduction_id: null
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <ScholarshipManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-loading')).not.toBeInTheDocument()
    })

    const verifyBtn = screen.getByRole('button', { name: /Verify & Deduct from Next Fee/i })
    fireEvent.click(verifyBtn)

    await waitFor(() => {
      expect(screen.getByTestId('scholarship-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Scholarship ₹25000 verified and applied/i)).toBeInTheDocument()
    })
  })

  test('submits new scholarship grant application successfully', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/scholarships/apply')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              success: true,
              scholarship: { id: 3, scholarship_name: 'EWS Tuition Waiver', status: 'APPLIED' }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: []
          })
      })
    })

    render(
      <BrowserRouter>
        <ScholarshipManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-loading')).not.toBeInTheDocument()
    })

    // Open form
    const toggleBtn = screen.getByRole('button', { name: /Add Grant Application/i })
    fireEvent.click(toggleBtn)

    expect(screen.getByLabelText(/Scholarship Title \*/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Scholarship Title \*/i), { target: { value: 'EWS Tuition Waiver' } })
    fireEvent.change(screen.getByLabelText(/Student Roll \*/i), { target: { value: 'SS26CS99' } })
    fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Manish Kumar' } })
    fireEvent.change(screen.getByLabelText(/Grant Amount/i), { target: { value: '35000' } })

    const form = screen.getByLabelText(/Scholarship Title \*/i).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('scholarship-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Grant application for SS26CS99 submitted successfully/i)).toBeInTheDocument()
    })
  })

  test('filters list between All, Pending, and Verified', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            scholarships: [
              {
                id: 1,
                scholarship_name: 'Merit Grant Alpha',
                category: 'Merit',
                student_name: 'Student One',
                student_roll: 'S1',
                amount: 20000,
                status: 'APPLIED'
              },
              {
                id: 2,
                scholarship_name: 'Sports Grant Beta',
                category: 'Sports',
                student_name: 'Student Two',
                student_roll: 'S2',
                amount: 30000,
                status: 'VERIFIED',
                verified_by: 'Finance Officer'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ScholarshipManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('scholarship-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Merit Grant Alpha')).toBeInTheDocument()
    expect(screen.getByText('Sports Grant Beta')).toBeInTheDocument()

    // Click Pending filter
    fireEvent.click(screen.getByRole('button', { name: /Pending \(1\)/i }))
    expect(screen.getByText('Merit Grant Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Sports Grant Beta')).not.toBeInTheDocument()

    // Click Verified filter
    fireEvent.click(screen.getByRole('button', { name: /Verified \(1\)/i }))
    expect(screen.queryByText('Merit Grant Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Sports Grant Beta')).toBeInTheDocument()
  })
})
