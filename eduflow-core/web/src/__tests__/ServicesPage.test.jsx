import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ServicesPage from '../pages/public/ServicesPage'

describe('ServicesPage Component Tests', () => {
  test('renders AI Automation Services catalog header and service cards', () => {
    render(
      <BrowserRouter>
        <ServicesPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Specialized AI Automation Services for Colleges')).toBeInTheDocument()
    expect(screen.getByText('NAAC/NBA Report Automation')).toBeInTheDocument()
    expect(screen.getByText('Student Dropout Risk Report')).toBeInTheDocument()
    expect(screen.getByText('Timetable Generator')).toBeInTheDocument()
    expect(screen.getByText('Admission Yield Predictor')).toBeInTheDocument()
    expect(screen.getByText('Fee Reconciliation')).toBeInTheDocument()
  })

  test('filters services by active (Ready Now) and upcoming (Upcoming Pilots)', () => {
    render(
      <BrowserRouter>
        <ServicesPage />
      </BrowserRouter>
    )

    // Filter active services
    const activeBtn = screen.getByRole('button', { name: /Ready Now/i })
    fireEvent.click(activeBtn)
    expect(screen.getByText('NAAC/NBA Report Automation')).toBeInTheDocument()
    expect(screen.queryByText('Hostel Occupancy Optimizer')).not.toBeInTheDocument()

    // Filter upcoming services
    const upcomingBtn = screen.getByRole('button', { name: /Upcoming Pilots/i })
    fireEvent.click(upcomingBtn)
    expect(screen.getByText('Hostel Occupancy Optimizer')).toBeInTheDocument()
    expect(screen.getByText('Placement Readiness Report')).toBeInTheDocument()
    expect(screen.queryByText('NAAC/NBA Report Automation')).not.toBeInTheDocument()
  })

  test('renders service action links for pilot package and waitlist', () => {
    render(
      <BrowserRouter>
        <ServicesPage />
      </BrowserRouter>
    )

    const pilotLinks = screen.getAllByRole('link', { name: /Request Pilot Package/i })
    expect(pilotLinks.length).toBe(5)
    expect(pilotLinks[0]).toHaveAttribute('href', expect.stringContaining('/for-colleges?service='))

    const waitlistLinks = screen.getAllByRole('link', { name: /Join Waitlist/i })
    expect(waitlistLinks.length).toBe(2)
  })
})
