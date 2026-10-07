import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import UPICollectionPage from '../pages/admin/UPICollectionPage'

describe('UPICollectionPage Component Tests', () => {
  test('renders UPI QR preview and manual verification form', () => {
    render(
      <BrowserRouter>
        <UPICollectionPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Direct UPI Payment Collection/i)).toBeInTheDocument()
    expect(screen.getByText(/Scan & Pay via Any UPI App/i)).toBeInTheDocument()
    expect(screen.getByText(/Manual Receipt Verification/i)).toBeInTheDocument()
    expect(screen.getByText(/Send via WhatsApp/i)).toBeInTheDocument()
  })
})
