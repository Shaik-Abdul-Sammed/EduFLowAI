import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage'
import apiClient from '../services/apiClient'

jest.mock('../services/apiClient')

describe('ForgotPasswordPage Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders password recovery form elements correctly', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Password Recovery/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Institutional Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Institution Code \/ Identifier/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send Password Reset Link/i })).toBeInTheDocument()
  })

  it('submits recovery request via API and renders success confirmation', async () => {
    apiClient.post.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,
        message: 'Password recovery instructions have been dispatched'
      }
    })

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/Institutional Email Address/i)
    fireEvent.change(emailInput, { target: { value: 'faculty@ssit.edu' } })

    const instInput = screen.getByLabelText(/Institution Code \/ Identifier/i)
    fireEvent.change(instInput, { target: { value: 'ssit' } })

    const form = screen.getByTestId('forgot-password-form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'faculty@ssit.edu',
        institutionId: 'ssit'
      })
    })

    expect(await screen.findByTestId('forgot-password-success')).toBeInTheDocument()
    expect(screen.getByText(/Recovery Link Dispatched/i)).toBeInTheDocument()
    expect(screen.getByText(/faculty@ssit.edu/i)).toBeInTheDocument()
  })

  it('renders error alert when API returns error', async () => {
    const errorObj = new Error('Valid institutional email address is required')
    errorObj.response = { status: 400, data: { error: 'Valid institutional email address is required' } }
    apiClient.post.mockRejectedValueOnce(errorObj)

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/Institutional Email Address/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const form = screen.getByTestId('forgot-password-form')
    fireEvent.submit(form)

    expect(await screen.findByTestId('forgot-password-error')).toBeInTheDocument()
    expect(screen.getByText(/Valid institutional email address is required/i)).toBeInTheDocument()
  })
})
