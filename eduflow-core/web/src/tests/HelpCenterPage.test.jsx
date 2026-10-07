import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HelpCenterPage from '../pages/public/HelpCenterPage'

describe('HelpCenterPage Component Tests', () => {
  test('renders help center walkthrough, video tutorials and ticket form', () => {
    render(
      <BrowserRouter>
        <HelpCenterPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/EduFlow Help & Support Center/i)).toBeInTheDocument()
    expect(screen.getByText(/Getting Started: 5-Step Quickstart/i)).toBeInTheDocument()
    expect(screen.getByText(/Video Masterclasses/i)).toBeInTheDocument()
    expect(screen.getByText(/Contact Institutional Support/i)).toBeInTheDocument()
  })
})
