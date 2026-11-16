import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ParentHealthRecordsPage from '../pages/parent/healthRecords'

describe('ParentHealthRecordsPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders emergency health passport and clinic records', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            healthProfile: {
              bloodGroup: 'B+ Positive',
              allergies: 'Peanuts & Penicillin antibiotics',
              chronicConditions: 'None reported',
              insurancePolicy: 'National Academic Health Cover #EDU-HLTH-2026-90',
              emergencyContact: 'Mr. Suresh Sharma - +91 98765 43210'
            },
            clinicVisits: [
              {
                id: 1,
                date: '2026-10-14',
                reason: 'Seasonal viral fever',
                treatment: 'Paracetamol 650mg & saline gargle',
                attendingDoctor: 'Dr. Anita Joshi',
                status: 'RESOLVED'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ParentHealthRecordsPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('health-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('health-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Health Profile & Campus Medical Center')).toBeInTheDocument()
    expect(screen.getByText('Emergency Medical Passport')).toBeInTheDocument()
    expect(screen.getByText('B+ Positive')).toBeInTheDocument()
    expect(screen.getByText(/Peanuts & Penicillin antibiotics/)).toBeInTheDocument()
    expect(screen.getByText('Seasonal viral fever')).toBeInTheDocument()
    expect(screen.getByText('CLINIC #1')).toBeInTheDocument()
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
            clinicVisits: []
          })
      })
    })

    render(
      <BrowserRouter>
        <ParentHealthRecordsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load medical records/i).length).toBeGreaterThanOrEqual(1)
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Health Profile & Campus Medical Center')).toBeInTheDocument()
    })
  })

  test('submits medical concern notice to clinic and warden', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/parents/dispatch-alert')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Statutory health notice dispatched via SMS & WhatsApp gateway'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            clinicVisits: []
          })
      })
    })

    render(
      <BrowserRouter>
        <ParentHealthRecordsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('health-loading')).not.toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Medical Advisory Details \*/i), {
      target: { value: 'Student requires gluten-free food in hostel mess due to allergy.' }
    })

    const submitBtn = screen.getByRole('button', { name: /Transmit Health Advisory to Infirmary/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('health-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Health concern and dietary restriction transmitted/i)).toBeInTheDocument()
    })
  })
})
