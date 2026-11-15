import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GrievanceManagementPage from '../GrievanceManagementPage'

const mockAdmin = {
  id: 1,
  name: 'Dean Academics',
  role: 'admin'
}

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockAdmin })
}))

describe('Admin GrievanceManagementPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, grievance: { id: 1, status: 'RESOLVED', resolution_notes: 'Repaired' } })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          grievances: [
            {
              id: 1,
              category: 'Infrastructure',
              subject: 'Robotics Lab 3 Workbench Oscilloscope Fault',
              description: 'Digital oscilloscope loses trace.',
              priority: 'HIGH',
              status: 'SUBMITTED',
              student_name: 'Ananya Sharma',
              student_roll: '22BCE1044',
              created_at: new Date().toISOString()
            }
          ]
        })
      })
    })
  })

  test('renders institutional grievance queue with statistics and filters', async () => {
    render(
      <MemoryRouter>
        <GrievanceManagementPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Active Student Grievances/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^ALL$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^SUBMITTED$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^RESOLVED$/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Robotics Lab 3 Workbench Oscilloscope Fault/i)).toBeInTheDocument()
    })
  })

  test('opens resolution dialog and resolves grievance', async () => {
    render(
      <MemoryRouter>
        <GrievanceManagementPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Resolve Grievance/i)).toBeInTheDocument()
    })

    const resolveBtn = screen.getByRole('button', { name: /Resolve Grievance/i })
    fireEvent.click(resolveBtn)

    const textarea = screen.getByPlaceholderText(/Detail action taken/i)
    fireEvent.change(textarea, { target: { value: 'Replaced power cord and calibrated trace.' } })

    const confirmBtn = screen.getByRole('button', { name: /Mark Resolved/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByText(/marked as RESOLVED/i)).toBeInTheDocument()
    })
  })
})
