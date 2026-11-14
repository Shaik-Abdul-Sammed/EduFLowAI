import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SeatingChart from '../components/SeatingChart'
import BulkStudentImportPage from '../pages/admin/BulkStudentImportPage'
import DegreeAuditPage from '../pages/admin/DegreeAuditPage'
import SpeedGraderPage from '../pages/faculty/SpeedGraderPage'

// Mock context used by RolePageTemplate
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() }),
}))
jest.mock('../config/apiConfig', () => ({
  getApiBaseURL: () => 'http://localhost:5001/api',
  getFullApiUrl: (path) => `http://localhost:5001/api${path}`,
}))
jest.mock('../utils/wakeUpHandler', () => ({
  safeJson: async (res) => res.json(),
}))

// ─── SeatingChart Tests ────────────────────────────────────────────────────

describe('SeatingChart Component', () => {
  const mockStudents = [
    { id: 1, name: 'Aarav Sharma', rollNo: '2024-CSE-001', status: 'PRESENT' },
    { id: 2, name: 'Priya Patel', rollNo: '2024-CSE-002', status: 'ABSENT' },
    { id: 3, name: 'Ravi Kumar', rollNo: '2024-CSE-003', status: 'DISPUTED' },
  ]

  test('renders a 48-cell seating grid (6x8)', () => {
    render(<SeatingChart students={mockStudents} />)
    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(48)
  })

  test('shows student first name in their seat cell', () => {
    render(<SeatingChart students={mockStudents} />)
    expect(screen.getByText('Aarav')).toBeInTheDocument()
    expect(screen.getByText('Priya')).toBeInTheDocument()
  })

  test('shows "Empty" label for unoccupied seats', () => {
    render(<SeatingChart students={[]} />)
    // With no students all 48 seats should be empty; check at least 1 "Empty" text exists
    const emptyCells = screen.getAllByText(/empty/i)
    expect(emptyCells.length).toBeGreaterThanOrEqual(1)
  })

  test('clicking an occupied seat opens the modal dialog', () => {
    render(<SeatingChart students={mockStudents} />)
    const firstCell = screen.getAllByRole('gridcell')[0]
    fireEvent.click(firstCell)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveTextContent('Aarav Sharma')
    expect(screen.getByRole('dialog')).toHaveTextContent('2024-CSE-001')
  })

  test('modal shows Mark Present and Mark Absent buttons', () => {
    render(<SeatingChart students={mockStudents} />)
    fireEvent.click(screen.getAllByRole('gridcell')[0])
    expect(screen.getByRole('button', { name: /mark.*present/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark.*absent/i })).toBeInTheDocument()
  })

  test('clicking Mark Present calls onStatusChange with PRESENT', () => {
    const onStatusChange = jest.fn()
    render(<SeatingChart students={mockStudents} onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getAllByRole('gridcell')[0])
    fireEvent.click(screen.getByRole('button', { name: /mark.*present/i }))
    expect(onStatusChange).toHaveBeenCalledWith(1, 'PRESENT')
  })

  test('modal Close button dismisses the dialog', () => {
    render(<SeatingChart students={mockStudents} />)
    fireEvent.click(screen.getAllByRole('gridcell')[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('shows attendance stats bar', () => {
    render(<SeatingChart students={mockStudents} />)
    expect(screen.getByText(/Present: 1/)).toBeInTheDocument()
    expect(screen.getByText(/Absent: 1/)).toBeInTheDocument()
    expect(screen.getByText(/Disputed: 1/)).toBeInTheDocument()
  })
})

// ─── BulkStudentImportPage Tests ───────────────────────────────────────────

describe('BulkStudentImportPage Component', () => {
  test('renders CSV file upload input', () => {
    render(
      <MemoryRouter>
        <BulkStudentImportPage />
      </MemoryRouter>
    )
    const input = document.querySelector('[data-testid="csv-file-input"]')
    expect(input).toBeInTheDocument()
    expect(input.accept).toBe('.csv')
  })

  test('renders Download Template CSV button', () => {
    render(
      <MemoryRouter>
        <BulkStudentImportPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/Download Template CSV/i)).toBeInTheDocument()
  })

  test('upload button is disabled when no file is selected', () => {
    render(
      <MemoryRouter>
        <BulkStudentImportPage />
      </MemoryRouter>
    )
    const btn = screen.getByTestId('upload-btn')
    expect(btn).toBeDisabled()
  })

  test('shows error message when non-CSV file attempted', () => {
    render(
      <MemoryRouter>
        <BulkStudentImportPage />
      </MemoryRouter>
    )
    const input = document.querySelector('[data-testid="csv-file-input"]')
    const badFile = new File(['data'], 'students.xlsx', { type: 'application/vnd.ms-excel' })
    // Simulate file selection with wrong extension
    Object.defineProperty(badFile, 'name', { value: 'students.xlsx' })
    fireEvent.change(input, { target: { files: [badFile] } })
    expect(screen.getByText(/Only .csv files are supported/i)).toBeInTheDocument()
  })
})

// ─── DegreeAuditPage Tests ─────────────────────────────────────────────────

describe('DegreeAuditPage Component', () => {
  test('renders student profile and degree requirements checklist', () => {
    render(
      <MemoryRouter>
        <DegreeAuditPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/Degree Audit & Academic Progress/i)).toBeInTheDocument()
    expect(screen.getByText(/Aditya Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/General Education Core/i)).toBeInTheDocument()
    expect(screen.getByText(/Departmental Major Core/i)).toBeInTheDocument()
  })

  test('runs audit on roll number submit', () => {
    render(
      <MemoryRouter>
        <DegreeAuditPage />
      </MemoryRouter>
    )
    const btn = screen.getByText(/Run Degree Audit/i)
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
  })
})

// ─── SpeedGraderPage Tests ─────────────────────────────────────────────────

describe('SpeedGraderPage Component', () => {
  test('renders split-screen submission and rubric scoring', () => {
    render(
      <MemoryRouter>
        <SpeedGraderPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/SpeedGrader™ Rubric Evaluation/i)).toBeInTheDocument()
    expect(screen.getByText(/Algorithm Correctness & Complexity/i)).toBeInTheDocument()
    expect(screen.getByText(/Finalize & Submit Grade/i)).toBeInTheDocument()
  })

  test('clicking rubric level updates the total score', () => {
    render(
      <MemoryRouter>
        <SpeedGraderPage />
      </MemoryRouter>
    )
    const ptsBtn = screen.getByText(/Developing \(O\(N\) regression\)/i)
    fireEvent.click(ptsBtn)
    expect(screen.getByText(/Saving score|Auto-saved to Gradebook/i)).toBeInTheDocument()
  })
})
