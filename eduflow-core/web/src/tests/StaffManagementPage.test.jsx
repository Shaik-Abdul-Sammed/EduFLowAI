import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HodStaffManagementPage from '../pages/hod/StaffManagementPage'

const mockHodUser = {
  id: 201,
  firstName: 'Dr. Suresh',
  lastName: 'Reddy',
  role: 'hod',
  department: 'Computer Science & Engineering',
  departmentCode: 'CSE',
}

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockHodUser }),
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() }),
}))

describe('HodStaffManagementPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('Renders department staff management header and staff table', () => {
    render(
      <MemoryRouter>
        <HodStaffManagementPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Department Staff Permission Delegation/i)).toBeInTheDocument()
    expect(screen.getByText(/Grant Officer Permission/i)).toBeInTheDocument()
  })

  test('Displays department staff members', () => {
    render(
      <MemoryRouter>
        <HodStaffManagementPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/Academic Coordinator/i)).toBeInTheDocument()
  })

  test('Opens grant permission modal on button click', () => {
    render(
      <MemoryRouter>
        <HodStaffManagementPage />
      </MemoryRouter>
    )

    const grantBtn = screen.getByRole('button', { name: /Grant Officer Permission/i })
    fireEvent.click(grantBtn)

    expect(screen.getByText(/Grant Delegated Officer Permission/i)).toBeInTheDocument()
    expect(screen.getAllByText(/AI Officer/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Permission Level/i)).toBeInTheDocument()
  })

  test('Shows pending approvals section with Approve and Reject actions', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        approvals: [
          {
            id: 1,
            first_name: 'Priya',
            last_name: 'Sharma',
            officer_key: 'timetable',
            prompt_text: 'Generate BTech 3rd Sem Timetable',
          },
        ],
      }),
    })

    render(
      <MemoryRouter>
        <HodStaffManagementPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Pending Staff Action Approvals/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument()
  })
})

