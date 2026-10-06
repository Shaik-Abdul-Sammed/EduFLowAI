import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AcademicCalendarPage from '../pages/admin/AcademicCalendarPage'

const mockAdmin = {
  id: 1,
  firstName: 'Academic',
  lastName: 'Dean',
  role: 'admin',
}

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockAdmin }),
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() }),
}))

describe('AcademicCalendarPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('Renders academic calendar intelligence header and working days', () => {
    render(
      <MemoryRouter>
        <AcademicCalendarPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Academic Calendar Intelligence/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Working Days/i)).toBeInTheDocument()
    expect(screen.getByText(/Odd Semester \(July – Nov 2026\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Even Semester \(Dec 2026 – May 2027\)/i)).toBeInTheDocument()
  })

  test('Renders statutory UGC/AICTE compliance badge (≥ 90 Working Days / Sem)', () => {
    render(
      <MemoryRouter>
        <AcademicCalendarPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/✓ Compliant \(≥ 90 Working Days \/ Sem\)/i)).toBeInTheDocument()
  })

  test('Switches between tabs (Milestones, Holidays, Adjustments)', async () => {
    render(
      <MemoryRouter>
        <AcademicCalendarPage />
      </MemoryRouter>
    )

    const holidaysTab = screen.getByRole('button', { name: /Government & Festival Holidays/i })
    fireEvent.click(holidaysTab)

    await waitFor(() => {
      expect(screen.getByText(/Republic Day/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Independence Day/i)).toBeInTheDocument()
  })

  test('Opens schedule adjustment modal on button click', () => {
    render(
      <MemoryRouter>
        <AcademicCalendarPage />
      </MemoryRouter>
    )

    const adjustBtn = screen.getByRole('button', { name: /Adjust Schedule/i })
    fireEvent.click(adjustBtn)

    expect(screen.getByText(/Adjust Academic Schedule/i)).toBeInTheDocument()
    expect(screen.getByText(/Adjustment Type/i)).toBeInTheDocument()
  })
})
