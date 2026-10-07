import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TermsOfServicePage from '../pages/public/TermsOfServicePage'
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage'
import DataProcessingAgreementPage from '../pages/public/DataProcessingAgreementPage'

describe('Legal & Compliance Pages Component Tests', () => {
  test('renders Terms of Service with Indian governing law', () => {
    render(
      <BrowserRouter>
        <TermsOfServicePage />
      </BrowserRouter>
    )
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument()
    expect(screen.getByText(/1. Acceptance of Terms/i)).toBeInTheDocument()
  })

  test('renders Privacy Policy with DPDP Act 2023 compliance notice', () => {
    render(
      <BrowserRouter>
        <PrivacyPolicyPage />
      </BrowserRouter>
    )
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument()
    expect(screen.getByText(/DPDP Act 2023/i)).toBeInTheDocument()
  })

  test('renders Data Processing Agreement', () => {
    render(
      <BrowserRouter>
        <DataProcessingAgreementPage />
      </BrowserRouter>
    )
    expect(screen.getAllByText(/Data Processing Agreement/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Data Processor/i).length).toBeGreaterThan(0)
  })
})
