import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ParentNoticesPage from '../pages/parent/parentNotices'

describe('ParentNoticesPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders official notices', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            notices: [
              {
                id: 1,
                title: 'Mid-Term Examination Schedule Announced',
                date: '2026-11-20',
                category: 'Academic',
                importance: 'High',
                description: 'Mid-term assessments for all B.Tech branches will commence from 24th November.'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ParentNoticesPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('notices-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('notices-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Institutional Circulars & Multilingual Broadcasts')).toBeInTheDocument()
    expect(screen.getByText('Mid-Term Examination Schedule Announced')).toBeInTheDocument()
    expect(screen.getByText(/Statutory Multilingual SMS & WhatsApp Broadcast Engine/i)).toBeInTheDocument()
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
            notices: []
          })
      })
    })

    render(
      <BrowserRouter>
        <ParentNoticesPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load notices/i).length).toBeGreaterThanOrEqual(1)
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Institutional Circulars & Multilingual Broadcasts')).toBeInTheDocument()
    })
  })

  test('generates and displays multilingual localized notice in Telugu', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/parents/multilingual-notice')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              dispatchId: 'DISP_1029',
              languageSelected: 'te',
              messageText: 'గౌరవనీయ తల్లిదండ్రులకు, మీ విద్యార్థి హాజరు శాతం 71.5% గా నమోదైంది.',
              channel: 'WhatsApp & SMS',
              statutoryCompliance: 'UGC Guardian Notification Mandate 2026'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            notices: []
          })
      })
    })

    render(
      <BrowserRouter>
        <ParentNoticesPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('notices-loading')).not.toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Select Preferred Language/i), { target: { value: 'te' } })

    const sendBtn = screen.getByRole('button', { name: /Dispatch Sample Localized Notice/i })
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(screen.getByTestId('notices-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/గౌరవనీయ తల్లిదండ్రులకు/)).toBeInTheDocument()
    })
  })
})
