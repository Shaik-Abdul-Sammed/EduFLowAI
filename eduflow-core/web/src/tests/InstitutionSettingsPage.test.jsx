import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import InstitutionSettingsPage from '../pages/admin/InstitutionSettingsPage'

describe('InstitutionSettingsPage Component Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          settings: {
            branding: { name: 'Sri Siddhartha Institute of Technology' },
            security: { sessionTimeoutMinutes: 30, ipWhitelist: [] },
            billing: { upiId: 'ssit@icici', gstNumber: '29AAAAA0000A1Z5' }
          }
        })
      })
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders institution settings sections including branding, security and UPI', () => {
    render(
      <BrowserRouter>
        <InstitutionSettingsPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Institution Configuration & Settings/i)).toBeInTheDocument()
    expect(screen.getByText(/1. Branding & Identity/i)).toBeInTheDocument()
    expect(screen.getByText(/4. Security & Access Safeguards/i)).toBeInTheDocument()
    expect(screen.getByText(/5. Billing & Zero-Gateway UPI Remittance/i)).toBeInTheDocument()
    expect(screen.getByText(/Download My Data \(ZIP\)/i)).toBeInTheDocument()
  })
})
