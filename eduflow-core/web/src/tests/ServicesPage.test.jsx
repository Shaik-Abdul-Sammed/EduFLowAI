import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ServicesPage from '../pages/public/ServicesPage'

describe('ServicesPage Component', () => {
  const expectedServices = [
    { id: 'accreditation', title: 'NAAC/NBA Report Automation' },
    { id: 'student-success', title: 'Student Dropout Risk Report' },
    { id: 'timetable', title: 'Timetable Generator' },
    { id: 'admissions', title: 'Admission Yield Predictor' },
    { id: 'finance', title: 'Fee Reconciliation' },
    { id: 'hostel', title: 'Hostel Occupancy Optimizer' },
    { id: 'placement', title: 'Placement Readiness Report' },
  ]

  test('Renders 7 automation service cards', () => {
    render(
      <MemoryRouter>
        <ServicesPage />
      </MemoryRouter>
    )

    expectedServices.forEach((svc) => {
      expect(screen.getByText(svc.title)).toBeInTheDocument()
    })
  })

  test('Each card has correct title and link to /for-colleges?service={id}', () => {
    const { container } = render(
      <MemoryRouter>
        <ServicesPage />
      </MemoryRouter>
    )

    expectedServices.forEach((svc) => {
      expect(screen.getByText(svc.title)).toBeInTheDocument()
      const link = container.querySelector(`a[href="/for-colleges?service=${svc.id}"]`)
      expect(link).toBeInTheDocument()
      if (svc.id === 'hostel' || svc.id === 'placement') {
        expect(link.textContent).toMatch(/Join Waitlist/i)
      } else {
        expect(link.textContent).toMatch(/Request Pilot Package/i)
      }
    })
  })

  test('Clicking card navigates to lead form with correct service pre-selected', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/services']}>
        <Routes>
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/for-colleges" element={<div data-testid="target-route">Target Form</div>} />
        </Routes>
      </MemoryRouter>
    )

    const targetLink = container.querySelector('a[href="/for-colleges?service=timetable"]')
    expect(targetLink).toBeInTheDocument()
    fireEvent.click(targetLink)
    expect(screen.getByTestId('target-route')).toBeInTheDocument()
  })
})
