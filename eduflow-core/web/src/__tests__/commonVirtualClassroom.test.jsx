import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VirtualClassroomPage from '../pages/common/VirtualClassroomPage'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
  // Mock canvas HTML5 getContext
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    fillText: jest.fn(),
    beginPath: jest.fn(),
    roundRect: jest.fn(),
    fill: jest.fn()
  })
})

describe('Virtual Classroom Page', () => {
  it('renders loading state initially and hydrates live participant count', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'ASG-101', title: 'Raft Lab' }
      ]
    })

    render(
      <MemoryRouter>
        <VirtualClassroomPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('virtual-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('virtual-active-participants')).toHaveTextContent('6 Active')
    })

    expect(screen.getByText(/Lecture Hall 301/i)).toBeInTheDocument()
    expect(screen.getByText(/Live Lecture Poll/i)).toBeInTheDocument()
  })

  it('handles peer coordination sync failure and allows retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <VirtualClassroomPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('virtual-error')).toBeInTheDocument()
    })

    // Retry
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('virtual-retry'))

    await waitFor(() => {
      expect(screen.queryByTestId('virtual-error')).not.toBeInTheDocument()
    })
  })

  it('allows voting in live lecture poll and submits telemetry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(
      <MemoryRouter>
        <VirtualClassroomPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Live Lecture Poll/i)).toBeInTheDocument()
    })

    // Vote on first option
    const firstOption = screen.getByText(/A new term begins/i)
    fireEvent.click(firstOption)

    // Option should now be highlighted / marked as voted
    expect(screen.getByText('22 Votes')).toBeInTheDocument()
  })
})
