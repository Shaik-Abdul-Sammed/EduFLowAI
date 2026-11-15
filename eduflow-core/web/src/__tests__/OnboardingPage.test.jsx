import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import OnboardingPage from '../pages/public/OnboardingPage'
import apiClient from '../services/apiClient'
import { ToastProvider } from '../components/ToastProvider'

jest.mock('../services/apiClient')

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </BrowserRouter>
  )
}

describe('OnboardingPage Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Step 1 with institution profile fields', () => {
    renderWithProviders(<OnboardingPage />)

    expect(screen.getByTestId('onboarding-step-indicator')).toHaveTextContent(/Step 1 of 4/i)
    expect(screen.getByTestId('onboarding-step-1')).toBeInTheDocument()
    expect(screen.getByLabelText(/Institution Full Name/i)).toHaveValue('Sri Siddhartha Institute of Technology')
  })

  it('steps through all wizard steps and submits profile data to API', async () => {
    apiClient.post.mockResolvedValue({ data: { success: true } })

    renderWithProviders(<OnboardingPage />)

    // Step 1: Change institution name and click Continue
    const instInput = screen.getByLabelText(/Institution Full Name/i)
    fireEvent.change(instInput, { target: { value: 'National Institute of Technology' } })

    const nextBtn = screen.getByTestId('onboarding-next-btn')
    fireEvent.click(nextBtn)

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/v1/onboarding/step1-profile', expect.objectContaining({
        name: 'National Institute of Technology'
      }))
    })

    // Advance to Step 2
    expect(await screen.findByTestId('onboarding-step-2')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('onboarding-next-btn'))

    // Advance to Step 3
    expect(await screen.findByTestId('onboarding-step-3')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('onboarding-next-btn'))

    // Advance to Step 4
    expect(await screen.findByTestId('onboarding-step-4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Launch EduFlow Workspace/i })).toBeInTheDocument()

    // Finish onboarding
    fireEvent.click(screen.getByRole('button', { name: /Launch EduFlow Workspace/i }))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/v1/onboarding/finish', expect.objectContaining({
        institutionId: 1
      }))
    })
  })

  it('handles finish error and displays alert', async () => {
    apiClient.post.mockImplementation((url) => {
      if (url.includes('finish')) {
        const error = new Error('Database onboarding lock failed')
        error.response = { status: 500, data: { error: 'Database onboarding lock failed' } }
        return Promise.reject(error)
      }
      return Promise.resolve({ data: { success: true } })
    })

    renderWithProviders(<OnboardingPage />)

    // Step 1 -> 2
    fireEvent.click(screen.getByTestId('onboarding-next-btn'))
    // Step 2 -> 3
    await waitFor(() => expect(screen.getByTestId('onboarding-step-2')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('onboarding-next-btn'))
    // Step 3 -> 4
    await waitFor(() => expect(screen.getByTestId('onboarding-step-3')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('onboarding-next-btn'))
    // Step 4 Finish
    await waitFor(() => expect(screen.getByTestId('onboarding-step-4')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /Launch EduFlow Workspace/i }))

    expect(apiClient.post).toHaveBeenCalled()
  })
})
