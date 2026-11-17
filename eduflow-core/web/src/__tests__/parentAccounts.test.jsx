import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ParentAccounts from '../pages/admin/parentAccounts'

describe('ParentAccounts Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched parent accounts', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'PAR001',
                name: 'Ramanathan Reddy',
                student: 'Arjun Reddy',
                relation: 'Father',
                email: 'ram@gmail.com',
                phone: '9876500001',
                active: true,
                lastLogin: '2026-06-01 08:30 AM'
              },
              {
                id: 'PAR002',
                name: 'Devendra Singh',
                student: 'Priya Singh',
                relation: 'Father',
                email: 'dev@gmail.com',
                phone: '9876500002',
                active: false,
                lastLogin: '—'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ParentAccounts />
      </BrowserRouter>
    )

    expect(screen.getByTestId('parent-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('parent-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Parent Accounts & Portal Gateway')).toBeInTheDocument()
    expect(screen.getByText('Ramanathan Reddy')).toBeInTheDocument()
    expect(screen.getByText('Devendra Singh')).toBeInTheDocument()
    expect(screen.getByText(/Arjun Reddy/)).toBeInTheDocument()
    expect(screen.getByText('Authorized')).toBeInTheDocument()
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
        <ParentAccounts />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('parent-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Parent Accounts')).toBeInTheDocument()

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
      expect(screen.getByTestId('parent-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No parent accounts found')).toBeInTheDocument()
  })

  test('provisions parent account and dispatches guardian alert', async () => {
    let callCount = 0
    global.fetch = jest.fn((url, options) => {
      callCount++
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              parent: {
                id: 'PAR003',
                name: 'Meenakshi Iyer',
                student: 'Meera Iyer',
                relation: 'Mother',
                phone: '9876500003',
                email: 'meena@gmail.com',
                active: true
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
                    id: 'PAR003',
                    name: 'Meenakshi Iyer',
                    student: 'Meera Iyer',
                    relation: 'Mother',
                    phone: '9876500003',
                    email: 'meena@gmail.com',
                    active: true
                  }
                ]
              : []
          })
      })
    })

    render(
      <BrowserRouter>
        <ParentAccounts />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('parent-loading')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('open-parent-form-btn'))
    expect(screen.getByTestId('add-parent-form')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('e.g. Ramanathan Reddy'), { target: { value: 'Meenakshi Iyer' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Arjun Reddy'), { target: { value: 'Meera Iyer' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. 9876500001'), { target: { value: '9876500003' } })

    fireEvent.click(screen.getByTestId('submit-parent-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('parent-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/provisioned successfully/)).toBeInTheDocument()
  })
})
