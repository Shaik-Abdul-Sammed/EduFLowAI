import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClassDiscussionBoardPage from '../pages/faculty/ClassDiscussionBoardPage'

const mockAddToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Faculty Class Discussion Board Page', () => {
  it('renders loading state initially and hydrates discussion threads', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'TH-1', title: 'Virtual Memory Q&A' }
      ]
    })

    render(
      <MemoryRouter>
        <ClassDiscussionBoardPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('discussion-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Virtual Memory Page Replacement/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Lab 4 Setup/i)).toBeInTheDocument()
    expect(screen.getByText('Operating Systems (CS301)')).toBeInTheDocument()
  })

  it('handles sync error and allows retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <ClassDiscussionBoardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('discussion-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('discussion-retry'))

    await waitFor(() => {
      expect(screen.queryByTestId('discussion-error')).not.toBeInTheDocument()
    })
  })

  it('submits a new course announcement thread and updates discussion list', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'TH-NEW', status: 'posted' })
      })

    render(
      <MemoryRouter>
        <ClassDiscussionBoardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('discussion-input')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('discussion-input'), {
      target: { value: 'Reminder: Bring Laptops with Docker installed for Lab 5' }
    })

    fireEvent.click(screen.getByTestId('post-thread-btn'))

    await waitFor(() => {
      expect(screen.getByText('Reminder: Bring Laptops with Docker installed for Lab 5')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/support/tickets'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
})
