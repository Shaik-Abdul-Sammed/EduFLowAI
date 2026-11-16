import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import InstitutionSettingsPage from '../pages/admin/InstitutionSettingsPage'

describe('InstitutionSettingsPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading spinner and then renders populated institution settings', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            settings: {
              branding: {
                name: 'Sri Siddhartha Institute of Technology',
                primaryColor: '#2563EB',
                secondaryColor: '#1E40AF'
              },
              contact: {
                address: 'Maralur, Tumakuru, Karnataka',
                phone: '+91 816 220 1073',
                email: 'info@ssit.edu.in',
                website: 'https://ssit.edu.in'
              },
              academic: {
                academicYear: '2026-2027',
                semesterType: 'ODD',
                workingDaysPerWeek: 6,
                holidaysState: 'KA'
              },
              security: { sessionTimeoutMinutes: 30, ipWhitelist: ['192.168.1.1'] },
              billing: { upiId: 'ssit@icici', gstNumber: '29AAAAA0000A1Z5', deanWaiverThreshold: 100000 }
            }
          })
      })
    )

    render(
      <BrowserRouter>
        <InstitutionSettingsPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('settings-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('settings-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Institution Configuration & Settings/i)).toBeInTheDocument()
    expect(screen.getByText(/1. Branding & Identity/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Sri Siddhartha Institute of Technology')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ssit@icici')).toBeInTheDocument()
    expect(screen.getByText(/Download My Data \(ZIP\)/i)).toBeInTheDocument()
  })

  test('saves updated settings and displays success message', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'Settings updated' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            settings: {
              branding: { name: 'SSIT Central Campus' },
              contact: { address: 'Tumakuru' },
              academic: { academicYear: '2026-2027' },
              security: { sessionTimeoutMinutes: 30, ipWhitelist: [] },
              billing: { upiId: 'ssit@icici', gstNumber: '29AAAAA0000A1Z5' }
            }
          })
      })
    })

    render(
      <BrowserRouter>
        <InstitutionSettingsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('SSIT Central Campus')).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue('SSIT Central Campus')
    fireEvent.change(nameInput, { target: { value: 'SSIT Deemed University' } })

    const saveBtn = screen.getByRole('button', { name: /Save All Settings/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText(/Institution settings saved successfully!/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/institution/settings'),
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('SSIT Deemed University')
      })
    )
  })

  test('displays error alert when initial fetch fails and retry reloads', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            settings: {
              branding: { name: 'Retried SSIT' }
            }
          })
      })
    })

    render(
      <BrowserRouter>
        <InstitutionSettingsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load institution settings/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Retried SSIT')).toBeInTheDocument()
    })
  })

  test('displays error alert when save request fails', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'PATCH') {
        return Promise.resolve({
          ok: false,
          status: 400
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            settings: {
              branding: { name: 'SSIT Campus' }
            }
          })
      })
    })

    render(
      <BrowserRouter>
        <InstitutionSettingsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('SSIT Campus')).toBeInTheDocument()
    })

    const saveBtn = screen.getByRole('button', { name: /Save All Settings/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText(/Failed to update settings/i)).toBeInTheDocument()
    })
  })
})
