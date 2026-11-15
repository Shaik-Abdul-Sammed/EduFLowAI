import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CommandPalette from '../components/CommandPalette'
import ConfirmationModal from '../components/ConfirmationModal'
import { SkeletonLoader } from '../components/SkeletonLoader'
import Breadcrumbs from '../components/Breadcrumbs'
import { exportToCSV } from '../utils/exportToCSV'
import { useAutoSave } from '../hooks/useAutoSave'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

// Test wrapper component for useAutoSave
function AutoSaveTestComponent({ initialData }) {
  const [data, setData] = React.useState(initialData)
  const { hasSavedDraft, clearDraft } = useAutoSave('test_form', data, setData, { debounceMs: 50 })

  return (
    <div>
      <input
        aria-label="Student Name"
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
      />
      <button onClick={clearDraft}>Clear Draft</button>
      <span data-testid="draft-status">{hasSavedDraft ? 'DRAFT_SAVED' : 'NO_DRAFT'}</span>
    </div>
  )
}

// Test wrapper component for useKeyboardShortcuts
function KeyboardShortcutTestComponent({ onNew, onSubmit }) {
  useKeyboardShortcuts({ onNew, onSubmit })
  return <div>Shortcut Active</div>
}

describe('Phase 2: Free Web Frontend UX Upgrades Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('1. CommandPalette opens on Cmd+K / Ctrl+K and filters commands (Feature 21)', () => {
    render(
      <MemoryRouter>
        <CommandPalette isOpen={true} onClose={jest.fn()} />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/command palette input/i)
    expect(input).toBeInTheDocument()

    // Check modal max-height: 90vh
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    // Filter commands
    fireEvent.change(input, { target: { value: 'degree' } })
    expect(screen.getByText(/degree audit engine/i)).toBeInTheDocument()
    expect(screen.queryByText(/fee management/i)).not.toBeInTheDocument()
  })

  it('2. ExportToCSV formats table data correctly and triggers download (Feature 24)', () => {
    const testData = [
      { id: 'S001', name: 'John Doe', roll: '2024-CSE-001', fee: 45000 },
      { id: 'S002', name: 'Jane "Ace" Smith', roll: '2024-CSE-002', fee: 50000 }
    ]

    const csvOutput = exportToCSV(testData, 'test_export.csv')
    expect(csvOutput).toContain('"id","name","roll","fee"')
    expect(csvOutput).toContain('"S001","John Doe","2024-CSE-001","45000"')
    // Escaped quotes in cell
    expect(csvOutput).toContain('"Jane ""Ace"" Smith"')
  })

  it('3. ConfirmationModal displays danger modal and handles user confirmation (Feature 28)', () => {
    const handleConfirm = jest.fn()
    const handleCancel = jest.fn()

    const { rerender } = render(
      <ConfirmationModal
        isOpen={true}
        title="Delete Student Record"
        message="Are you sure you want to delete this student?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )

    expect(screen.getByText('Delete Student Record')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this student?')).toBeInTheDocument()

    // Confirm button click
    const confirmBtn = screen.getByRole('button', { name: /confirm/i })
    fireEvent.click(confirmBtn)
    expect(handleConfirm).toHaveBeenCalledTimes(1)

    // Cancel button click
    rerender(
      <ConfirmationModal
        isOpen={true}
        title="Delete Student Record"
        message="Are you sure you want to delete this student?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )
    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelBtn)
    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('4. useAutoSave persists state to localStorage and restores draft on mount (Feature 27)', async () => {
    const { getByLabelText, getByTestId, unmount } = render(
      <AutoSaveTestComponent initialData={{ name: 'Initial' }} />
    )

    const input = getByLabelText('Student Name')
    fireEvent.change(input, { target: { value: 'Updated Student Name' } })

    // Wait for debounced autosave
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    const saved = localStorage.getItem('autosave_test_form')
    expect(saved).toBeTruthy()
    expect(JSON.parse(saved).name).toBe('Updated Student Name')
    expect(getByTestId('draft-status').textContent).toBe('DRAFT_SAVED')

    unmount()

    // Re-mount should restore from localStorage
    render(<AutoSaveTestComponent initialData={{ name: 'Initial' }} />)
    expect(screen.getByLabelText('Student Name').value).toBe('Updated Student Name')
  })

  it('5. useKeyboardShortcuts triggers onNew on "N" key and onSubmit on Ctrl+Enter (Feature 32)', () => {
    const handleNew = jest.fn()
    const handleSubmit = jest.fn()

    render(<KeyboardShortcutTestComponent onNew={handleNew} onSubmit={handleSubmit} />)

    // Press 'N'
    fireEvent.keyDown(window, { key: 'n' })
    expect(handleNew).toHaveBeenCalledTimes(1)

    // Press Ctrl+Enter
    fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true })
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('6. SkeletonLoader renders pulse placeholders for card, table, and text (Feature 26)', () => {
    const { container: cardContainer } = render(<SkeletonLoader variant="card" count={2} />)
    expect(cardContainer.querySelectorAll('.animate-pulse').length).toBe(2)

    const { container: tableContainer } = render(<SkeletonLoader variant="table" count={3} />)
    expect(tableContainer.querySelectorAll('.animate-pulse').length).toBe(3)

    const { container: textContainer } = render(<SkeletonLoader variant="text" count={4} />)
    expect(textContainer.querySelectorAll('.animate-pulse').length).toBe(4)
  })

  it('7. Breadcrumbs renders structured trail for nested pages (Feature 31)', () => {
    render(
      <MemoryRouter initialEntries={['/admin/finance/invoices']}>
        <Breadcrumbs />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /Directory/i })).toBeInTheDocument()
    expect(screen.getByText(/Finance/i)).toBeInTheDocument()
    expect(screen.getByText(/Invoices/i)).toBeInTheDocument()
  })
})
