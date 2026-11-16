import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MarksEntryPage from '../pages/faculty/marksEntry'
import apiClient from '../services/apiClient'

jest.mock('../services/apiClient')

const mockMarksPayload = {
  success: true,
  subject: { code: 'PHY101', name: 'Physics', maxInternal: 30, maxExternal: 70 },
  subjects: [
    { code: 'PHY101', name: 'Physics', maxInternal: 30, maxExternal: 70 },
    { code: 'MAT101', name: 'Mathematics', maxInternal: 30, maxExternal: 70 }
  ],
  students: [
    { id: 'STU001', name: 'Aarav Sharma', section: 'MPC-A', roll: '2024MPC001' },
    { id: 'STU002', name: 'Priya Singh', section: 'BIPC-A', roll: '2024BIPC012' }
  ],
  marks: {
    STU001: { internal: 25, external: 60 }
  },
  published: false
}

describe('MarksEntry Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state on initial mount', () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <MarksEntryPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('marks-loading')).toBeInTheDocument()
  })

  it('fetches and renders subject marks roster', async () => {
    apiClient.get.mockResolvedValueOnce({ data: mockMarksPayload })

    render(
      <BrowserRouter>
        <MarksEntryPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('marks-table')).toBeInTheDocument()
    })

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    expect(screen.getByText('Priya Singh')).toBeInTheDocument()
    expect(screen.getByDisplayValue('25')).toBeInTheDocument()
    expect(screen.getByDisplayValue('60')).toBeInTheDocument()
  })

  it('saves marks draft via POST API', async () => {
    apiClient.get.mockResolvedValueOnce({ data: mockMarksPayload })
    apiClient.post.mockResolvedValueOnce({
      status: 200,
      data: { success: true, message: 'Marks draft saved successfully' }
    })

    render(
      <BrowserRouter>
        <MarksEntryPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('marks-table')).toBeInTheDocument()
    })

    // Edit marks for Priya Singh
    const internInput = screen.getByLabelText('Internal marks for Priya Singh')
    fireEvent.change(internInput, { target: { value: '28' } })

    const saveDraftBtn = screen.getByTestId('save-draft-btn')
    fireEvent.click(saveDraftBtn)

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/academics/marks', expect.objectContaining({
        subjectCode: 'PHY101',
        published: false
      }))
    })

    expect(await screen.findByTestId('marks-feedback')).toHaveTextContent(/Marks saved as draft/i)
  })

  it('publishes marks via POST API and displays published badge', async () => {
    apiClient.get.mockResolvedValueOnce({ data: mockMarksPayload })
    apiClient.post.mockResolvedValueOnce({
      status: 200,
      data: { success: true, message: 'Marks published successfully' }
    })

    render(
      <BrowserRouter>
        <MarksEntryPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('marks-table')).toBeInTheDocument()
    })

    const publishBtn = screen.getByTestId('publish-marks-btn')
    fireEvent.click(publishBtn)

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/academics/marks/publish', expect.objectContaining({
        subjectCode: 'PHY101'
      }))
    })

    expect(await screen.findByTestId('published-badge')).toBeInTheDocument()
    expect(await screen.findByTestId('marks-feedback')).toHaveTextContent(/Marks successfully published/i)
  })

  it('renders error banner when server returns 500 error', async () => {
    const errorObj = new Error('Database connection failed')
    errorObj.response = { status: 500, data: { error: 'Database connection failed' } }
    apiClient.get.mockRejectedValueOnce(errorObj)

    render(
      <BrowserRouter>
        <MarksEntryPage />
      </BrowserRouter>
    )

    expect(await screen.findByTestId('marks-api-error')).toBeInTheDocument()
    expect(screen.getByText(/Database connection failed/i)).toBeInTheDocument()
  })
})
