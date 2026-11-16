import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ParentProfileSettings from '../pages/parent/profileSettings'

describe('ParentProfileSettings Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders fetched guardian profile and ward info', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/user/profile')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              user: {
                first_name: 'Suresh',
                last_name: 'Sharma',
                email: 'suresh.sharma@parent.edu',
                phone: '+91 98765 43210',
                address: 'Plot 42, Jubilee Hills Road, Hyderabad',
                preferences: {
                  preferredLanguage: 'te',
                  emailNotifications: true,
                  smsAlerts: true,
                  whatsappAlerts: true,
                  emergencyDispatch: true,
                  emergencyPhone: '+91 94401 23456'
                }
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            child: {
              name: 'Ananya Sharma',
              roll: 'SS26',
              branch: 'Computer Science (B.Tech)',
              semester: 'Semester 5'
            },
            mentor: {
              name: 'Dr. Ramesh Kumar',
              phone: '+91 90101 50809'
            }
          })
      })
    })

    render(
      <BrowserRouter>
        <ParentProfileSettings />
      </BrowserRouter>
    )

    expect(screen.getByTestId('profile-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('profile-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Guardian Profile & Notification Settings')).toBeInTheDocument()
    expect(screen.getByText('Ananya Sharma (SS26)')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Suresh')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Sharma')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+91 98765 43210')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Plot 42, Jubilee Hills Road, Hyderabad')).toBeInTheDocument()
    expect(screen.getByDisplayValue('తెలుగు (Telugu)')).toBeInTheDocument()
  })

  test('renders error state with retry button when initial profile fetch throws', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network connectivity failure'))
    )

    render(
      <BrowserRouter>
        <ParentProfileSettings />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Guardian Profile')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            user: {
              first_name: 'Suresh',
              last_name: 'Sharma'
            }
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('profile-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('Suresh')).toBeInTheDocument()
  })

  test('submits updated guardian profile details and renders success alert', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Profile updated successfully',
              user: {
                first_name: 'Suresh',
                last_name: 'Sharma',
                phone: '+91 98765 99999',
                address: 'Updated Address Hyderabad'
              }
            })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            user: {
              first_name: 'Suresh',
              last_name: 'Sharma',
              phone: '+91 98765 43210',
              address: 'Old Address',
              preferences: {
                preferredLanguage: 'en',
                whatsappAlerts: true
              }
            }
          })
      })
    })

    render(
      <BrowserRouter>
        <ParentProfileSettings />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('profile-loading')).not.toBeInTheDocument()
    })

    // Modify phone number
    const phoneInput = screen.getByDisplayValue('+91 98765 43210')
    fireEvent.change(phoneInput, { target: { value: '+91 98765 99999' } })

    // Save profile
    const saveBtn = screen.getByTestId('save-profile-btn')
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByTestId('profile-success-alert')).toBeInTheDocument()
    })

    expect(screen.getByText(/Guardian contact details & notification preferences updated successfully/)).toBeInTheDocument()
  })
})
