import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import OnboardingWizardPage from '../pages/admin/OnboardingWizardPage'

describe('OnboardingWizardPage Component Tests', () => {
  test('renders 6-step onboarding wizard with initial profile fields', () => {
    render(
      <BrowserRouter>
        <OnboardingWizardPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Institution Onboarding Wizard/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 1 — Institution Profile/i)).toBeInTheDocument()
    expect(screen.getByText(/Institution Name/i)).toBeInTheDocument()
    expect(screen.getByText(/Next Step/i)).toBeInTheDocument()
  })
})
