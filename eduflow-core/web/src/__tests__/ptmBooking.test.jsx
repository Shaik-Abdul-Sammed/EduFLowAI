import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PtmBookingPage from '../pages/parent/ptmBooking'

describe('PtmBookingPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders confirmed PTM appointments', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            ptmAppointments: [
              {
                appointmentId: 'PTM-84910',
                facultyName: 'Dr. Ramesh Kumar (HOD, CSE)',
                slotTime: '2026-11-25 11:00 AM',
                venue: 'Department HOD Office & Google Meet',
                agenda: 'Mid-term performance review and attendance consultation',
                status: 'CONFIRMED'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <PtmBookingPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('ptm-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('ptm-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Faculty & Mentor Consultation Booking')).toBeInTheDocument()
    expect(screen.getByText('Dr. Ramesh Kumar (HOD, CSE)')).toBeInTheDocument()
    expect(screen.getByText('PTM-84910')).toBeInTheDocument()
    expect(screen.getByText('Book 1-on-1 Faculty Appointment')).toBeInTheDocument()
  })

  test('renders load error state and recovers on retry', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'DB connection failure' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            ptmAppointments: []
          })
      })
    })

    render(
      <BrowserRouter>
        <PtmBookingPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load PTM bookings/i).length).toBeGreaterThanOrEqual(1)
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Faculty & Mentor Consultation Booking')).toBeInTheDocument()
    })
  })

  test('schedules new PTM appointment slot successfully', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/parents/ptm-slot')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              appointmentId: 'PTM-99120',
              parentName: 'Suresh Sharma',
              studentRoll: 'SS26CS01',
              facultyName: 'Dr. Ramesh Kumar (HOD, CSE)',
              slotTime: '2026-11-28 10:30 AM',
              venue: 'Department HOD Office / Video Consultation',
              agenda: 'Discussion on Academic CGPA and Attendance Shortage',
              status: 'CONFIRMED'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            ptmAppointments: []
          })
      })
    })

    render(
      <BrowserRouter>
        <PtmBookingPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('ptm-loading')).not.toBeInTheDocument()
    })

    const submitBtn = screen.getByRole('button', { name: /Confirm Appointment Slot/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('ptm-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/PTM Appointment PTM-99120 successfully scheduled/i)).toBeInTheDocument()
      expect(screen.getByText('PTM-99120')).toBeInTheDocument()
    })
  })
})
