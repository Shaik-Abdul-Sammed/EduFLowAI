import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyClassTimetable from '../pages/faculty/classTimetable'

describe('FacultyClassTimetable Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays class timetable slots and stats', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'TS01',
                day: 'Monday',
                time: '09:00 - 10:00',
                course: 'Mathematics',
                room: 'LA 101',
                faculty: 'Dr. Suresh Kumar',
                section: 'MPC-A'
              },
              {
                id: 'TS02',
                day: 'Tuesday',
                time: '10:00 - 11:00',
                course: 'Physics',
                room: 'LA 201',
                faculty: 'Dr. Suresh Kumar',
                section: 'MPC-B'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyClassTimetable />
      </BrowserRouter>
    )

    expect(screen.getByTestId('class-tt-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('class-tt-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Class Timetable')).toBeInTheDocument()
    expect(screen.getByText('Weekly Classes')).toBeInTheDocument()
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText(/LA 101/)).toBeInTheDocument()
    expect(screen.getByText(/09:00 - 10:00/)).toBeInTheDocument()
  })

  test('displays error state with retry on network failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <FacultyClassTimetable />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('class-tt-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Class Timetable')).toBeInTheDocument()

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
      expect(screen.queryByTestId('class-tt-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText(/Weekly Classes/)).toBeInTheDocument()
  })

  test('schedules an extra class slot and verifies toast alert', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              slot: {
                id: 'TS09',
                day: 'Monday',
                time: '11:30 AM',
                course: 'Mathematics',
                room: 'Hall 302',
                faculty: 'Dr. Suresh Kumar',
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
            data: [
              {
                id: 'TS01',
                day: 'Monday',
                time: '09:00 - 10:00',
                course: 'Mathematics',
                room: 'LA 101',
                faculty: 'Dr. Suresh Kumar',
                section: 'MPC-A'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <FacultyClassTimetable />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('class-tt-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('open-add-slot-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('schedule-slot-form')).toBeInTheDocument()
    expect(screen.getByText('Schedule Extra Class / Slot')).toBeInTheDocument()

    const submitBtn = screen.getByTestId('submit-slot-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('class-tt-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/booked successfully on Monday!/)).toBeInTheDocument()
  })
})
