import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyDepartmentNotices from '../pages/faculty/departmentNotices'

describe('FacultyDepartmentNotices Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays department announcements', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            announcements: [
              {
                id: 1,
                title: 'Mid-Term Exam Schedule Released',
                body: 'Mid-term examinations will begin from 12 Sept 2026.',
                author: 'HOD Physics'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyDepartmentNotices />
      </BrowserRouter>
    )

    expect(screen.getByTestId('department-notices-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('department-notices-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Department Notices')).toBeInTheDocument()
    expect(screen.getByText('Mid-Term Exam Schedule Released')).toBeInTheDocument()
    expect(screen.getByText(/Mid-term examinations will begin/)).toBeInTheDocument()
  })

  test('handles network load failure and retry recovery', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <FacultyDepartmentNotices />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('department-notices-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Department Notices')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            announcements: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('department-notices-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('📢 Post Notice')).toBeInTheDocument()
  })

  test('composes and posts a new notice with toast notification', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Notice dispatched'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            announcements: []
          })
      })
    })

    render(
      <BrowserRouter>
        <FacultyDepartmentNotices />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('department-notices-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('open-compose-notice-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('compose-notice-form')).toBeInTheDocument()

    const submitBtn = screen.getByTestId('submit-notice-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('notice-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/published successfully!/)).toBeInTheDocument()
  })
})
