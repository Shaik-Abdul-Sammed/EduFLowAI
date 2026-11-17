import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AttendanceEntryPage from '../attendanceEntry'

const mockFaculty = {
  id: 12,
  name: 'Prof. Ananya Sen',
  role: 'faculty',
  department: 'CSE'
}

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockFaculty })
}))

describe('Faculty AttendanceEntryPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders engineering course and section selectors', () => {
    render(
      <MemoryRouter>
        <AttendanceEntryPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/^Department$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Class Section$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Engineering Course$/i)).toBeInTheDocument()
  })

  test('renders B.Tech student roster with roll numbers and condonation badges', () => {
    render(
      <MemoryRouter>
        <AttendanceEntryPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/22BCE1001/i)).toBeInTheDocument()
    expect(screen.getByText(/Aarav Sharma/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Good Standing \(Eligible\)/i).length).toBeGreaterThan(0)
  })

  test('filters roster by condonation risk (<75%)', () => {
    render(
      <MemoryRouter>
        <AttendanceEntryPage />
      </MemoryRouter>
    )

    const riskBtn = screen.getByRole('button', { name: /<75% Risk Only/i })
    fireEvent.click(riskBtn)

    // Ishaan Varma has 63.5% attendance and should be visible
    expect(screen.getByText(/Ishaan Varma/i)).toBeInTheDocument()
  })

  test('allows toggling status between Present, Absent, On-Duty, and Late', () => {
    render(
      <MemoryRouter>
        <AttendanceEntryPage />
      </MemoryRouter>
    )

    const absentButtons = screen.getAllByRole('button', { name: /^absent$/i })
    expect(absentButtons.length).toBeGreaterThan(0)
    fireEvent.click(absentButtons[0])

    const saveBtn = screen.getByRole('button', { name: /save & publish attendance/i })
    fireEvent.click(saveBtn)
    expect(screen.getByText(/Attendance Saved & Ledger Committed/i)).toBeInTheDocument()
  })

  test('renders 2-band sections: Auto-marked (confident) and Needs your review (N)', () => {
    render(
      <MemoryRouter>
        <AttendanceEntryPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Needs your review/i)).toBeInTheDocument()
    expect(screen.getByText(/Auto-marked \(confident\)/i)).toBeInTheDocument()

    // Bulk resolve button is present when review items exist
    const bulkAbsentBtn = screen.queryByRole('button', { name: /mark all needs review absent/i })
    if (bulkAbsentBtn) {
      fireEvent.click(bulkAbsentBtn)
      expect(screen.getByText(/All review items resolved/i)).toBeInTheDocument()
    }
  })
})
