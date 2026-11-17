import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BuildManager from '../pages/ai/BuildManager'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('AI Build Manager Page', () => {
  it('renders loading state and loads build history from backup/build API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        snapshots: [
          { id: 'build-099', description: 'Autonomous Flutter Multiplatform Compile', timestamp: '2026-11-17T08:00:00Z' }
        ]
      })
    })

    render(
      <MemoryRouter>
        <BuildManager />
      </MemoryRouter>
    )

    expect(screen.getByTestId('build-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Autonomous Flutter Multiplatform Compile')).toBeInTheDocument()
      expect(screen.getByText('build-099')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <BuildManager />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('build-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('triggers new build hitting backup/snapshot compilation endpoint', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, snapshots: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, snapshotId: 'build-new-1' })
      })

    render(
      <MemoryRouter>
        <BuildManager />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger new build/i })).toBeInTheDocument()
    })

    const triggerBtn = screen.getByRole('button', { name: /trigger new build/i })
    fireEvent.click(triggerBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/backup/snapshot',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })
})
