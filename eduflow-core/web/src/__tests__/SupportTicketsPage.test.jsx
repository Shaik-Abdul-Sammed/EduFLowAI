import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SupportTicketsPage from '../pages/admin/SupportTicketsPage'

describe('SupportTicketsPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders support ticket ledger', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            tickets: [
              {
                id: 101,
                subject: 'Campus WiFi Dead Zone in Library Block',
                description: 'Signal drops consistently on 2nd floor.',
                category: 'technical',
                priority: 'high',
                status: 'open',
                response: null,
                created_at: '2026-11-15T10:00:00Z'
              },
              {
                id: 102,
                subject: 'Projector HDMI port replacement',
                description: 'Lecture Hall 4 projector flickers.',
                category: 'facilities',
                priority: 'medium',
                status: 'resolved',
                response: 'HDMI cable and connector replaced.',
                created_at: '2026-11-14T09:00:00Z'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <SupportTicketsPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('support-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('support-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Support Tickets & Issue Resolution')).toBeInTheDocument()
    expect(screen.getByText('Campus WiFi Dead Zone in Library Block')).toBeInTheDocument()
    expect(screen.getByText('Projector HDMI port replacement')).toBeInTheDocument()
    expect(screen.getByText('#101')).toBeInTheDocument()
    expect(screen.getByText('#102')).toBeInTheDocument()
  })

  test('renders load error alert and recovers on retry', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Database service unavailable' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            tickets: []
          })
      })
    })

    render(
      <BrowserRouter>
        <SupportTicketsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load support tickets/i).length).toBeGreaterThanOrEqual(1)
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText(/No Support Tickets Found/i)).toBeInTheDocument()
    })
  })

  test('submits new support ticket successfully', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/support/tickets')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              success: true,
              ticket: {
                id: 105,
                subject: 'ERP Marks Entry Server Slowdown',
                category: 'technical',
                priority: 'high',
                status: 'open'
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            tickets: []
          })
      })
    })

    render(
      <BrowserRouter>
        <SupportTicketsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('support-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByRole('button', { name: /New Ticket/i })
    fireEvent.click(openBtn)

    fireEvent.change(screen.getByLabelText(/Subject \*/i), { target: { value: 'ERP Marks Entry Server Slowdown' } })
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: 'Faculty dashboard times out when uploading marks' } })

    const form = screen.getByLabelText(/Subject \*/i).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('support-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/created successfully/i)).toBeInTheDocument()
    })
  })

  test('updates and resolves support ticket via modal', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'PATCH' && url.includes('/v1/support/tickets/101')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              ticket: { id: 101, status: 'resolved', response: 'Router rebooted' }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            tickets: [
              {
                id: 101,
                subject: 'WiFi issue',
                description: 'Dropped connection',
                category: 'technical',
                priority: 'high',
                status: 'open'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <SupportTicketsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('support-loading')).not.toBeInTheDocument()
    })

    const respondBtn = screen.getByRole('button', { name: /Respond/i })
    fireEvent.click(respondBtn)

    expect(screen.getByText(/Ticket #101: WiFi issue/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Resolution Response/i), { target: { value: 'Router rebooted & firmware upgraded' } })

    const form = screen.getByLabelText(/Resolution Response/i).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('support-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Ticket #101 updated successfully/i)).toBeInTheDocument()
    })
  })

  test('filters ticket ledger between All, Open, and Resolved', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            tickets: [
              {
                id: 1,
                subject: 'Open Ticket Alpha',
                category: 'general',
                priority: 'low',
                status: 'open'
              },
              {
                id: 2,
                subject: 'Resolved Ticket Beta',
                category: 'technical',
                priority: 'medium',
                status: 'resolved'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <SupportTicketsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('support-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Open Ticket Alpha')).toBeInTheDocument()
    expect(screen.getByText('Resolved Ticket Beta')).toBeInTheDocument()

    // Filter Open
    fireEvent.click(screen.getByRole('button', { name: /Open \(1\)/i }))
    expect(screen.getByText('Open Ticket Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Resolved Ticket Beta')).not.toBeInTheDocument()

    // Filter Resolved
    fireEvent.click(screen.getByRole('button', { name: /Resolved \(1\)/i }))
    expect(screen.queryByText('Open Ticket Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Resolved Ticket Beta')).toBeInTheDocument()
  })
})
