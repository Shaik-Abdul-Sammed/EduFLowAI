import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import HodDashboardPage from '../pages/hod/HodDashboardPage'

const mockHod = {
  id: 201,
  firstName: 'Dr. Suresh',
  lastName: 'Reddy',
  role: 'hod',
  department: 'Computer Science & Engineering',
  departmentCode: 'CSE',
}

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockHod }),
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() }),
}))

describe('HodDashboardPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('Renders HOD department dashboard with department scope badge', () => {
    render(
      <MemoryRouter>
        <HodDashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Computer Science & Engineering — HOD Command Center/i)).toBeInTheDocument()
    expect(screen.getByText(/Department Scoped/i)).toBeInTheDocument()
  })

  test('Renders key departmental metric cards', () => {
    render(
      <MemoryRouter>
        <HodDashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Enrolled Students/i)).toBeInTheDocument()
    expect(screen.getByText(/At-Risk Students/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Staff Submissions/i)[0]).toBeInTheDocument()
  })

  test('Displays pending approval queue with Approve button', async () => {
    render(
      <MemoryRouter>
        <HodDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Pending Staff Delegated Workflows/i)).toBeInTheDocument()
    })
  })

  test('Has AI department assistant query input', () => {
    render(
      <MemoryRouter>
        <HodDashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText(/Check faculty workload compliance/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Department Advisor/i)).toBeInTheDocument()
  })
})
