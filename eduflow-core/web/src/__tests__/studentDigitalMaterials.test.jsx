import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/student/digitalMaterials'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Student Digital Materials Page', () => {
  it('renders loading state and then digital materials from backend', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        books: [
          { id: 101, title: 'Deep Learning with PyTorch', category: 'Artificial Intelligence', author: 'Dr. Ramesh Kumar', available_copies: 5 },
          { id: 102, title: 'Operating Systems Principles', category: 'Systems', author: 'Prof. Anitha Rao', available_copies: 3 }
        ]
      })
    })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('materials-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Deep Learning with PyTorch')).toBeInTheDocument()
      expect(screen.getByText('Operating Systems Principles')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with fallback and retry', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network disconnected'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('materials-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('triggers digital access / download request hitting library API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          books: [
            { id: 101, title: 'Compiler Design Handbook', category: 'Compilers', author: 'Dr. Satish', available_copies: 2 }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Material issued successfully' })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Compiler Design Handbook')).toBeInTheDocument()
    })

    const downloadBtn = screen.getByRole('button', { name: /access \/ download/i })
    fireEvent.click(downloadBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/library/issue',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('101')
        })
      )
    })
  })
})
