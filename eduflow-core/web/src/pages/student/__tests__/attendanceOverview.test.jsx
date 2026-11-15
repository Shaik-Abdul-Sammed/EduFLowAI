import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AttendanceOverviewPage from '../attendanceOverview'

const mockStudent = {
  id: 80,
  name: 'Ananya Sharma',
  role: 'student',
  rollNumber: '22BCE1044'
}

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockStudent })
}))

describe('Student AttendanceOverviewPage Component', () => {
  test('renders overall attendance percentage and present donut metrics', () => {
    render(
      <MemoryRouter>
        <AttendanceOverviewPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Overall Attendance/i)).toBeInTheDocument()
    expect(screen.getByText(/Classes Attended/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Classes/i)).toBeInTheDocument()
    expect(screen.getByText(/Subjects Tracked/i)).toBeInTheDocument()
  })

  test('renders subject attendance breakdown and weekly calendar matrix', () => {
    render(
      <MemoryRouter>
        <AttendanceOverviewPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Subject-wise Attendance/i)).toBeInTheDocument()
    expect(screen.getByText(/Monthly Attendance Heatmap/i)).toBeInTheDocument()
  })
})
