import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TimetableGeneration from '../pages/admin/timetableGeneration'

describe('TimetableGeneration Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched timetable slots', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 1,
                section: 'MPC-A',
                day: 'Monday',
                time: '09:00 - 10:00',
                course: 'Mathematics I',
                faculty: 'Dr. K. Srinivas',
                room: 'Hall 101'
              },
              {
                id: 2,
                section: 'MPC-B',
                day: 'Tuesday',
                time: '10:00 - 11:00',
                course: 'Physics I',
                faculty: 'Prof. Ananya Roy',
                room: 'Hall 102'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <TimetableGeneration />
      </BrowserRouter>
    )

    expect(screen.getByTestId('timetable-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('timetable-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Timetable Generation & Scheduling')).toBeInTheDocument()
    expect(screen.getByText('Mathematics I')).toBeInTheDocument()
    expect(screen.getByText('Physics I')).toBeInTheDocument()
    expect(screen.getByText('Weekly Period Slots')).toBeInTheDocument()
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
        <TimetableGeneration />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('timetable-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Timetable Schedule')).toBeInTheDocument()

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
      expect(screen.getByTestId('timetable-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No timetable slots found')).toBeInTheDocument()
  })

  test('schedules new timetable slot and runs heuristic optimizer', async () => {
    let callCount = 0
    global.fetch = jest.fn((url, options) => {
      callCount++
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              slot: {
                id: 3,
                day: 'Wednesday',
                time: '11:00 - 12:00',
                room: 'Hall 103',
                course: 'Chemistry Lab',
                faculty: 'Dr. M. Venkat',
                section: 'MPC-A'
              }
            })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: callCount > 1
              ? [
                  {
                    id: 3,
                    day: 'Wednesday',
                    time: '11:00 - 12:00',
                    room: 'Hall 103',
                    course: 'Chemistry Lab',
                    faculty: 'Dr. M. Venkat',
                    section: 'MPC-A'
                  }
                ]
              : []
          })
      })
    })

    render(
      <BrowserRouter>
        <TimetableGeneration />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('timetable-loading')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('open-add-slot-btn'))
    expect(screen.getByTestId('add-slot-form')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('submit-slot-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('timetable-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/scheduled successfully/)).toBeInTheDocument()

    // Test optimizer
    fireEvent.click(screen.getByTestId('run-optimizer-btn'))

    await waitFor(() => {
      expect(screen.getByText(/Heuristic Optimizer completed/)).toBeInTheDocument()
    })
  })
})
