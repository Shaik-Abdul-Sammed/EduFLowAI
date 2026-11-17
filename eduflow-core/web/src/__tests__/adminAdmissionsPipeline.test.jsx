import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/admin/admissionsPipeline'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Admin Admissions Pipeline Page', () => {
  it('renders loading state and loads candidate list from admissions API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        admissions: [
          { id: 1, application_number: 'EDU-ADM-2026-1001', full_name: 'Vivek Vardhan Reddy', desired_program: 'B.Tech CSE', percentage_or_cgpa: 96.4, status: 'PROVISIONALLY_ADMITTED' }
        ]
      })
    })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('admissions-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Vivek Vardhan Reddy')).toBeInTheDocument()
      expect(screen.getByText('EDU-ADM-2026-1001')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Admissions database offline'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('admissions-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('registers new candidate hitting the admissions apply API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          admissions: []
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          application: {
            application_number: 'EDU-ADM-2026-5541',
            full_name: 'Sravani Priya',
            percentage_or_cgpa: 94.5
          }
        })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('admissions-loading')).not.toBeInTheDocument()
    })

    // Open add form
    const enrolBtn = screen.getByRole('button', { name: /\+ enrol candidate/i })
    fireEvent.click(enrolBtn)

    expect(screen.getByTestId('enrol-form')).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText('Candidate Name')
    const emailInput = screen.getByPlaceholderText('candidate@example.com')
    fireEvent.change(nameInput, { target: { value: 'Sravani Priya' } })
    fireEvent.change(emailInput, { target: { value: 'sravani@example.com' } })

    const submitBtn = screen.getByRole('button', { name: /submit & register/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/admissions/apply',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Sravani Priya')
        })
      )
      expect(screen.getByText('Sravani Priya')).toBeInTheDocument()
    })
  })
})
