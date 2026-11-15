import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GrievancePage from '../GrievancePage'

const mockStudent = {
  id: 80,
  name: 'Ananya Sharma',
  role: 'student',
  rollNumber: '22BCE1044'
}

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockStudent })
}))

describe('Student GrievancePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, grievance: { id: 99, subject: 'Lab Projector Fault', status: 'SUBMITTED' } })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          grievances: [
            {
              id: 1,
              category: 'Infrastructure',
              subject: 'Computer Lab 3 Projector Flickering',
              description: 'Projector loses signal intermittently during lecture.',
              priority: 'HIGH',
              status: 'SUBMITTED',
              created_at: new Date().toISOString()
            }
          ]
        })
      })
    })
  })

  test('renders grievance submission form and active grievances list', async () => {
    render(
      <MemoryRouter>
        <GrievancePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Submit a Grievance/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Projector failure in Lab 3/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Please describe the incident/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lodge Formal Grievance/i })).toBeInTheDocument()
  })

  test('submits a new grievance and clears form', async () => {
    render(
      <MemoryRouter>
        <GrievancePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Projector failure in Lab 3/i), {
      target: { value: 'Broken chair in Hall 202' }
    })
    fireEvent.change(screen.getByPlaceholderText(/Please describe the incident/i), {
      target: { value: 'Backrest has snapped and poses safety risk.' }
    })

    const submitBtn = screen.getByRole('button', { name: /Lodge Formal Grievance/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Grievance logged successfully/i)).toBeInTheDocument()
    })
  })
})
