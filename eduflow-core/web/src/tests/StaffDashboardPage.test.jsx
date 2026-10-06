import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StaffDashboardPage from '../pages/staff/StaffDashboardPage'

const mockUser = {
  id: 105,
  firstName: 'Priya',
  lastName: 'Sharma',
  staffDesignation: 'Academic Coordinator',
  department: 'Computer Science & Engineering',
  role: 'staff',
}

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() }),
}))

describe('StaffDashboardPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('Renders welcome header with staff name, designation, and department', () => {
    render(
      <MemoryRouter>
        <StaffDashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/Academic Coordinator/i)).toBeInTheDocument()
    expect(screen.getByText(/CSE/i)).toBeInTheDocument()
  })

  test('Displays granted officers and daily request limits', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        permissions: [
          {
            officer_key: 'timetable',
            permission_level: 'DRAFT',
            max_requests_per_day: 15,
            requests_today: 3,
            is_active: true,
          },
        ],
      }),
    })

    render(
      <MemoryRouter>
        <StaffDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Timetable Officer/i)).toBeInTheDocument()
    })
  })

  test('Shows Request Access button for unassigned officers', () => {
    render(
      <MemoryRouter>
        <StaffDashboardPage />
      </MemoryRouter>
    )

    const requestButtons = screen.getAllByRole('button', { name: /Request Access/i })
    expect(requestButtons.length).toBeGreaterThan(0)
  })

  test('Opens request access modal when clicked', () => {
    render(
      <MemoryRouter>
        <StaffDashboardPage />
      </MemoryRouter>
    )

    const requestButtons = screen.getAllByRole('button', { name: /Request Access/i })
    fireEvent.click(requestButtons[0])

    expect(screen.getByText(/Request AI Officer Access/i)).toBeInTheDocument()
  })
})
