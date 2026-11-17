import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyManagement from '../pages/admin/facultyManagement'

describe('FacultyManagement Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched faculty records', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'FAC01',
                name: 'Dr. K. Srinivas',
                department: 'Mathematics',
                designation: 'Professor',
                email: 'srinivas@eduflow.ac.in',
                phone: '9876543221',
                active: true,
                workloadHours: 18,
                stream: 'MPC'
              },
              {
                id: 'FAC02',
                name: 'Prof. Ananya Roy',
                department: 'Physics',
                designation: 'Assistant Professor',
                email: 'ananya@eduflow.ac.in',
                phone: '9876543222',
                active: false,
                workloadHours: 0,
                stream: 'MPC/BIPC'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyManagement />
      </BrowserRouter>
    )

    expect(screen.getByTestId('faculty-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('faculty-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Faculty Management')).toBeInTheDocument()
    expect(screen.getByText('Dr. K. Srinivas')).toBeInTheDocument()
    expect(screen.getByText('Prof. Ananya Roy')).toBeInTheDocument()
    expect(screen.getByText('srinivas@eduflow.ac.in', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Suspended')).toBeInTheDocument()
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
        <FacultyManagement />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('faculty-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Faculty Directory')).toBeInTheDocument()

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
      expect(screen.getByTestId('faculty-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No faculty members found')).toBeInTheDocument()
  })

  test('submits recruit faculty form and refreshes list on success', async () => {
    let callCount = 0
    global.fetch = jest.fn((url, options) => {
      callCount++
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              faculty: {
                id: 'FAC03',
                name: 'Dr. Harish Kumar',
                department: 'Chemistry',
                email: 'harish@eduflow.ac.in',
                phone: '9876543220',
                active: true,
                workloadHours: 16
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
                    id: 'FAC03',
                    name: 'Dr. Harish Kumar',
                    department: 'Chemistry',
                    email: 'harish@eduflow.ac.in',
                    phone: '9876543220',
                    active: true,
                    workloadHours: 16
                  }
                ]
              : []
          })
      })
    })

    render(
      <BrowserRouter>
        <FacultyManagement />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('faculty-loading')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('open-recruit-btn'))
    expect(screen.getByTestId('recruit-faculty-form')).toBeInTheDocument()

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('e.g. Dr. Harish Kumar'), { target: { value: 'Dr. Harish Kumar' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. harish@eduflow.ac.in'), { target: { value: 'harish@eduflow.ac.in' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. 9876543220'), { target: { value: '9876543220' } })

    fireEvent.click(screen.getByTestId('submit-recruit-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('faculty-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/appointed successfully/)).toBeInTheDocument()
  })
})
