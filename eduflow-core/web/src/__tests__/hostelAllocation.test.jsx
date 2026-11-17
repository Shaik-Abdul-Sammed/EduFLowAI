import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HostelAllocation from '../pages/admin/hostelAllocation'

describe('HostelAllocation Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched hostel room allocations', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'H01',
                roomNo: '101',
                block: 'Block A',
                capacity: 4,
                occupants: ['Kiran Kumar', 'Vikas Reddy']
              },
              {
                id: 'H02',
                roomNo: '102',
                block: 'Block B',
                capacity: 3,
                occupants: ['Priya Singh', 'Sneha Patel']
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <HostelAllocation />
      </BrowserRouter>
    )

    expect(screen.getByTestId('hostel-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('hostel-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Hostel Allocation & Residency')).toBeInTheDocument()
    expect(screen.getByText('Room 101')).toBeInTheDocument()
    expect(screen.getByText('Room 102')).toBeInTheDocument()
    expect(screen.getByText(/Kiran Kumar/)).toBeInTheDocument()
    expect(screen.getByText(/Priya Singh/)).toBeInTheDocument()
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
        <HostelAllocation />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('hostel-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Hostel Allocations')).toBeInTheDocument()

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
      expect(screen.getByTestId('hostel-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No hostel rooms found')).toBeInTheDocument()
  })

  test('submits dorm allocation form and updates residency list', async () => {
    let callCount = 0
    global.fetch = jest.fn((url, options) => {
      callCount++
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              room: {
                id: 'H01',
                roomNo: '101',
                block: 'Block A',
                capacity: 4,
                occupants: ['Kiran Kumar', 'Vikas Reddy', 'Ramesh V.']
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
                id: 'H01',
                roomNo: '101',
                block: 'Block A',
                capacity: 4,
                occupants: callCount > 1 ? ['Kiran Kumar', 'Vikas Reddy', 'Ramesh V.'] : ['Kiran Kumar', 'Vikas Reddy']
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <HostelAllocation />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('hostel-loading')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('open-allocate-btn'))
    expect(screen.getByTestId('allocate-hostel-form')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('e.g. Kiran Kumar'), { target: { value: 'Ramesh V.' } })
    fireEvent.click(screen.getByTestId('submit-allocate-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('hostel-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/successfully allocated/)).toBeInTheDocument()
  })
})
