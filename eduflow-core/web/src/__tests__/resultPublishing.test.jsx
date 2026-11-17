import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ResultPublishing from '../pages/admin/resultPublishing'

describe('ResultPublishing Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched examination results', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'R1',
                exam: 'Continuous Assessment 1 (E1 Sem 1)',
                date: '2026-08-20',
                compiled: true,
                published: true,
                classAvg: '78.4%',
                totalAppeared: 184,
                passed: 172
              },
              {
                id: 'R2',
                exam: 'Midterm Examination I (E2 Sem 1)',
                date: '2026-09-22',
                compiled: true,
                published: false,
                classAvg: '72.1%',
                totalAppeared: 190,
                passed: 168
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ResultPublishing />
      </BrowserRouter>
    )

    expect(screen.getByTestId('result-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('result-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Result Publishing & Marksheets')).toBeInTheDocument()
    expect(screen.getByText('Continuous Assessment 1 (E1 Sem 1)')).toBeInTheDocument()
    expect(screen.getByText('Midterm Examination I (E2 Sem 1)')).toBeInTheDocument()
    expect(screen.getAllByText('Live on Portal').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Internal Review').length).toBeGreaterThanOrEqual(1)
  })

  test('displays error state with retry on fetch failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <ResultPublishing />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('result-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Academic Results')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.getByTestId('result-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No examination results found')).toBeInTheDocument()
  })

  test('publishes all results to student portal and shows success toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'All results published to student portal'
            })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'R2',
                exam: 'Midterm Examination I (E2 Sem 1)',
                date: '2026-09-22',
                compiled: true,
                published: false,
                classAvg: '72.1%',
                totalAppeared: 190,
                passed: 168
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <ResultPublishing />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('result-loading')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('publish-all-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('result-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/All validated marksheets published to student portals/)).toBeInTheDocument()
  })
})
