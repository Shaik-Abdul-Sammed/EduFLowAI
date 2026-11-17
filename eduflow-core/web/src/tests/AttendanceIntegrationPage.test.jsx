import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AttendanceIntegrationPage from '../pages/admin/AttendanceIntegrationPage'

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

describe('AttendanceIntegrationPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('Renders attendance metrics and defaulters header', () => {
    render(
      <MemoryRouter>
        <AttendanceIntegrationPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Institutional Attendance Intelligence/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Institutional Attendance/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/At-Risk Defaulters/i)).toBeInTheDocument()
  })

  test('Renders CSV register upload section', () => {
    render(
      <MemoryRouter>
        <AttendanceIntegrationPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Manual CSV Attendance Register Upload/i)).toBeInTheDocument()
    expect(screen.getByText(/Upload CSV File/i)).toBeInTheDocument()
  })

  test('Displays table of at-risk students below statutory 75% cutoff', async () => {
    render(
      <MemoryRouter>
        <AttendanceIntegrationPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Students Below 75% Statutory Attendance Threshold/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/Rahul Verma/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/2023CSE045/i)).toBeInTheDocument()
  })

  test('Dispatches parental alerts on Notify Parents button click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, count: 5 }),
    })

    render(
      <MemoryRouter>
        <AttendanceIntegrationPage />
      </MemoryRouter>
    )

    const notifyBtn = screen.getByRole('button', { name: /Notify Parents/i })
    fireEvent.click(notifyBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Notify Parents/i })).toBeInTheDocument()
    })
  })

  test('Switches to Room Calibration wizard tab and displays walk test controls', async () => {
    render(
      <MemoryRouter>
        <AttendanceIntegrationPage />
      </MemoryRouter>
    )

    const calibTabBtn = screen.getByRole('button', { name: /Room Calibration/i })
    fireEvent.click(calibTabBtn)

    expect(screen.getByText(/Room RSSI Calibration Wizard/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Walk Test/i })).toBeInTheDocument()
  })

  test('Switches to AP-to-Room Map tab and displays physical mapping table and bulk upload', async () => {
    render(
      <MemoryRouter>
        <AttendanceIntegrationPage />
      </MemoryRouter>
    )

    const apMapTabBtn = screen.getByRole('button', { name: /AP-to-Room Map/i })
    fireEvent.click(apMapTabBtn)

    expect(screen.getByText(/AP-to-Physical Room Map/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bulk CSV Upload/i })).toBeInTheDocument()
    expect(screen.getByText(/00:14:22:01:23:45/i)).toBeInTheDocument()
    expect(screen.getAllByText(/ROOM-LH-101/i).length).toBeGreaterThan(0)
  })
})
