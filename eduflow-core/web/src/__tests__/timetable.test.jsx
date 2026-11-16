import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TimetablePage from '../pages/student/timetable'

describe('Student Timetable Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading spinner and renders weekly timetable grid with subjects', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            section: 'MPC-A',
            timetable: {
              section: 'MPC-A',
              periods: ['9:00 - 9:50', '9:50 - 10:40'],
              days: ['Monday', 'Tuesday'],
              subjectColors: {
                Physics: '#2563EB',
                Mathematics: '#F59E0B'
              },
              schedule: [
                ['Physics', 'Mathematics'],
                ['Mathematics', 'Physics']
              ]
            }
          })
      })
    )

    render(
      <BrowserRouter>
        <TimetablePage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('timetable-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('timetable-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Weekly Schedule — MPC-A/i)).toBeInTheDocument()
    expect(screen.getAllByText('Physics').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Mathematics').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Subject Legend')).toBeInTheDocument()
  })

  test('switches section and fetches new timetable', async () => {
    global.fetch = jest.fn((url) => {
      const isB = url.includes('MPC-B')
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            section: isB ? 'MPC-B' : 'MPC-A',
            timetable: {
              section: isB ? 'MPC-B' : 'MPC-A',
              periods: ['9:00 - 9:50'],
              days: ['Monday'],
              subjectColors: { Chemistry: '#10B981' },
              schedule: [['Chemistry']]
            }
          })
      })
    })

    render(
      <BrowserRouter>
        <TimetablePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Weekly Schedule — MPC-A/i)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/SECTION:/i)
    fireEvent.change(select, { target: { value: 'MPC-B' } })

    await waitFor(() => {
      expect(screen.getByText(/Weekly Schedule — MPC-B/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('section=MPC-B'),
      expect.any(Object)
    )
  })

  test('displays error alert on fetch failure and retries successfully', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({ ok: false, status: 500 })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            section: 'MPC-A',
            timetable: {
              section: 'MPC-A',
              periods: ['9:00 - 9:50'],
              days: ['Monday'],
              subjectColors: { Physics: '#2563EB' },
              schedule: [['Physics']]
            }
          })
      })
    })

    render(
      <BrowserRouter>
        <TimetablePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load timetable/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText(/Weekly Schedule — MPC-A/i)).toBeInTheDocument()
    })
  })
})
