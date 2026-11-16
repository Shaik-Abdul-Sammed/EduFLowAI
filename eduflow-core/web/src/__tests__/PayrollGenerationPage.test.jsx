import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PayrollGenerationPage from '../pages/finance/PayrollGenerationPage'
import apiClient from '../services/apiClient'

jest.mock('../services/apiClient')

const mockPayslips = [
  {
    id: 1,
    faculty_name: 'Dr. Ramesh Kumar',
    designation: 'Professor & HOD',
    month: 'October',
    year: 2026,
    basic_pay: 115000,
    pf_deduction: 13800,
    tax_deduction: 11500,
    net_salary: 172900,
    payment_status: 'PROCESSED'
  }
]

describe('PayrollGenerationPage Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state on mount', () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <PayrollGenerationPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('payroll-loading')).toBeInTheDocument()
  })

  it('fetches and renders existing payslips', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { success: true, payslips: mockPayslips }
    })

    render(
      <BrowserRouter>
        <PayrollGenerationPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('payslips-list')).toBeInTheDocument()
    })

    expect(screen.getByText('Dr. Ramesh Kumar')).toBeInTheDocument()
    expect(screen.getByText(/October 2026/i)).toBeInTheDocument()
    expect(screen.getByText('PROCESSED')).toBeInTheDocument()
  })

  it('generates a new salary slip via POST API and updates preview', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { success: true, payslips: mockPayslips }
    })

    apiClient.post.mockResolvedValueOnce({
      status: 201,
      data: {
        success: true,
        payslip: {
          id: 2,
          faculty_name: 'Dr. Sunita Sharma',
          designation: 'Associate Professor',
          month: 'November',
          year: 2026,
          basic_pay: 95000,
          pf_deduction: 11400,
          tax_deduction: 9500,
          net_salary: 142800,
          payment_status: 'PROCESSED'
        }
      }
    })

    render(
      <BrowserRouter>
        <PayrollGenerationPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('payroll-form')).toBeInTheDocument()
    })

    // Change faculty name and basic pay
    fireEvent.change(screen.getByLabelText(/Employee \/ Faculty Name/i), { target: { value: 'Dr. Sunita Sharma' } })
    fireEvent.change(screen.getByLabelText(/Basic Pay/i), { target: { value: '95000' } })

    const generateBtn = screen.getByTestId('generate-payslip-btn')
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/finance/payslips/generate', expect.objectContaining({
        faculty_name: 'Dr. Sunita Sharma',
        basic_pay: 95000
      }))
    })

    expect(await screen.findByTestId('payroll-success-alert')).toHaveTextContent(/generated with 100% statutory DA\/PF compliance/i)
    expect(screen.getByText('Dr. Sunita Sharma')).toBeInTheDocument()
  })

  it('renders error state on API failure', async () => {
    const errorObj = new Error('Treasury gateway failure')
    errorObj.response = { status: 500, data: { error: 'Treasury gateway failure' } }
    apiClient.get.mockRejectedValueOnce(errorObj)

    render(
      <BrowserRouter>
        <PayrollGenerationPage />
      </BrowserRouter>
    )

    expect(await screen.findByTestId('payroll-api-error')).toBeInTheDocument()
    expect(screen.getByText(/Treasury gateway failure/i)).toBeInTheDocument()
  })
})
