import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentHostelInfo from '../pages/student/hostelInfo'

describe('StudentHostelInfo Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays student room details', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            allocations: [
              {
                student_name: 'Ananya Sharma',
                student_roll: 'SS26',
                block: 'Block B (Kaveri Girls Hostel)',
                room_no: '204',
                roommates: ['Sneha Patel', 'Anusha V.'],
                warden_name: 'Dr. Meena Swaminathan',
                warden_phone: '+91 94401 88992'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <StudentHostelInfo />
      </BrowserRouter>
    )

    expect(screen.getByTestId('hostel-info-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('hostel-info-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Hostel Information & Residency')).toBeInTheDocument()
    expect(screen.getByText('Block B (Kaveri Girls Hostel)')).toBeInTheDocument()
    expect(screen.getByText('Room 204')).toBeInTheDocument()
    expect(screen.getByText(/Sneha Patel, Anusha V./)).toBeInTheDocument()
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
        <StudentHostelInfo />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('hostel-info-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Hostel Residency')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            allocations: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('hostel-info-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText(/My Room Details/)).toBeInTheDocument()
  })

  test('submits maintenance ticket and requests digital outing gate-pass', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        if (url.includes('/gate-pass')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, message: 'Pass issued' })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, ticket: { id: 'TKT-101' } })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            allocations: [
              {
                student_name: 'Ananya Sharma',
                student_roll: 'SS26',
                block: 'Block B',
                room_no: '204',
                roommates: ['Sneha Patel']
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentHostelInfo />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('hostel-info-loading')).not.toBeInTheDocument()
    })

    // Submit maintenance ticket
    fireEvent.change(screen.getByPlaceholderText('Describe the issue...'), { target: { value: 'Water heater leaking' } })
    fireEvent.click(screen.getByTestId('submit-maint-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('maint-success-alert')).toBeInTheDocument()
    })

    // Request Gate-Pass
    fireEvent.click(screen.getByTestId('submit-gatepass-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('gatepass-success-alert')).toBeInTheDocument()
    })
    expect(screen.getByText(/Digital Outing Gate-Pass issued successfully/)).toBeInTheDocument()
  })
})
