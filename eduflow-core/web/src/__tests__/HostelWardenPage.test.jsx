import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HostelWardenPage from '../pages/admin/HostelWardenPage'

describe('HostelWardenPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders active resident allocations and turnstile gate logs', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/v1/hostel/allocations')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              allocations: [
                {
                  id: 1,
                  hostel_name: 'Aryabhata Boys Hostel',
                  room_number: 'B-204',
                  bed_number: 'Bed-1',
                  student_roll: 'SS24CS01',
                  student_name: 'Rahul Varma',
                  allocation_date: '2026-08-01',
                  status: 'OCCUPIED'
                }
              ]
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            logs: [
              {
                id: 101,
                student_roll: 'SS24CS01',
                student_name: 'Rahul Varma',
                direction: 'OUT',
                reason: 'Medical checkup',
                timestamp: '2026-11-16T10:30:00Z'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <HostelWardenPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('hostel-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('hostel-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Room Allotment Desk')).toBeInTheDocument()
    expect(screen.getByText(/Warden Gate Log/i)).toBeInTheDocument()
    expect(screen.getByText('Active Resident Allocations')).toBeInTheDocument()
    expect(screen.getAllByText('Rahul Varma').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('B-204 (Bed-1)')).toBeInTheDocument()
    expect(screen.getByText(/Medical checkup/)).toBeInTheDocument()
  })

  test('renders error state when API fails and handles retry click', async () => {
    let callCount = 0
    global.fetch = jest.fn((url) => {
      callCount++
      if (callCount <= 2) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Database query failed' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            allocations: [],
            logs: []
          })
      })
    })

    render(
      <BrowserRouter>
        <HostelWardenPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load hostel data/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Room Allotment Desk')).toBeInTheDocument()
    })
  })

  test('submits hostel room allocation successfully', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/hostel/allocate')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Room allocated successfully'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            allocations: [],
            logs: []
          })
      })
    })

    render(
      <BrowserRouter>
        <HostelWardenPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('hostel-loading')).not.toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Room Number/i), { target: { value: 'A-101' } })
    fireEvent.change(screen.getByLabelText(/Student Roll Number/i), { target: { value: 'SS25CS42' } })
    fireEvent.change(screen.getByLabelText(/Student Name/i), { target: { value: 'Priya Sharma' } })

    const form = screen.getByLabelText(/Room Number/i).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('hostel-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Room A-101 allotted to SS25CS42 successfully/i)).toBeInTheDocument()
    })
  })

  test('logs student gate pass movement successfully', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/hostel/gate-pass')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Gate pass logged'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            allocations: [],
            logs: []
          })
      })
    })

    render(
      <BrowserRouter>
        <HostelWardenPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('hostel-loading')).not.toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Roll No \*/i), { target: { value: 'SS25CS42' } })
    fireEvent.change(screen.getByLabelText(/Reason \/ Destination/i), { target: { value: 'Town Market' } })

    const gateForm = screen.getByLabelText(/Roll No \*/i).closest('form')
    fireEvent.submit(gateForm)

    await waitFor(() => {
      expect(screen.getByTestId('hostel-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Gate movement logged: SS25CS42/i)).toBeInTheDocument()
    })
  })
})
