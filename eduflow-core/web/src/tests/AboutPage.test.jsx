import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AboutPage from '../pages/public/AboutPage'

describe('AboutPage Component', () => {
  test('renders hero title and core statistics', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/The Autonomous AI Operating System for/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Autonomous AI Officers/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/UGC \/ AICTE Norm Compliant/i)).toBeInTheDocument()
  })

  test('renders all 5 autonomous AI officer cards by default', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/AI Accreditation Officer/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Timetable Officer/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Admission Officer/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Finance Officer/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Student Success Officer/i)).toBeInTheDocument()
  })

  test('switches tabs to Statutory Engines and GuardianWatch Portal', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )

    // Switch to Statutory Engines tab
    const statutoryTab = screen.getByRole('button', { name: /Statutory Engines/i })
    fireEvent.click(statutoryTab)

    expect(screen.getByText(/AICTE Workload Ceiling/i)).toBeInTheDocument()
    expect(screen.getByText(/UGC NEP-2020 Compliance/i)).toBeInTheDocument()
    expect(screen.getByText(/NAAC Binary Accreditation/i)).toBeInTheDocument()

    // Switch to GuardianWatch Portal tab
    const guardianTab = screen.getByRole('button', { name: /GuardianWatch Portal/i })
    fireEvent.click(guardianTab)

    expect(screen.getByText(/Automated Attendance Shortage Warnings/i)).toBeInTheDocument()
    expect(screen.getByText(/AI-Generated Monthly Progress Reports/i)).toBeInTheDocument()

    // Switch to Architecture tab
    const archTab = screen.getByRole('button', { name: /System Architecture/i })
    fireEvent.click(archTab)

    expect(screen.getByText(/Dual-Engine AI Inference Pipeline/i)).toBeInTheDocument()
    expect(screen.getByText(/DPDP Act 2023 & Indian Data Sovereignty/i)).toBeInTheDocument()
  })

  test('renders call to action buttons with deep links', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )

    const officerLink = screen.getAllByRole('link', { name: /AI Officers/i })[0]
    expect(officerLink).toBeInTheDocument()
    expect(officerLink).toHaveAttribute('href', '/officers-dashboard')
  })
})
