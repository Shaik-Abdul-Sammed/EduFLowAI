import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PlacementDrivesPage from '../pages/admin/PlacementDrivesPage'

describe('PlacementDrivesPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders active campus placement drives', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            drives: [
              {
                id: 1,
                company_name: 'Microsoft India',
                role_title: 'Software Development Engineer',
                ctc_lpa: 44.5,
                eligibility_cgpa: 8.0,
                eligible_branches: ['CSE', 'ECE'],
                drive_date: '2026-12-10',
                registration_deadline: '2026-12-01',
                job_description: 'Azure Cloud & Distributed Systems engineering.',
                status: 'ACTIVE',
                applicants_count: 38
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <PlacementDrivesPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('placement-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('placement-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Corporate Recruitment & Internship Drives')).toBeInTheDocument()
    expect(screen.getByText('Microsoft India')).toBeInTheDocument()
    expect(screen.getByText('Software Development Engineer')).toBeInTheDocument()
    expect(screen.getByText(/44.5 LPA/)).toBeInTheDocument()
    expect(screen.getByText(/38 Candidates/)).toBeInTheDocument()
    expect(screen.getByText('Announce Campus Recruitment Drive')).toBeInTheDocument()
  })

  test('renders load error state and recovers on retry', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Network timeout' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            drives: []
          })
      })
    })

    render(
      <BrowserRouter>
        <PlacementDrivesPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load placement drives/i).length).toBeGreaterThanOrEqual(1)
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText(/No campus drives scheduled/i)).toBeInTheDocument()
    })
  })

  test('submits new campus recruitment drive successfully', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/placement/drives')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              success: true,
              drive: { id: 2, company_name: 'Google India', role_title: 'Software Engineer', ctc_lpa: 52 }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            drives: []
          })
      })
    })

    render(
      <BrowserRouter>
        <PlacementDrivesPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('placement-loading')).not.toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Recruiting Company \*/i), { target: { value: 'Google India' } })
    fireEvent.change(screen.getByLabelText(/Designation \/ Job Role \*/i), { target: { value: 'Software Engineer' } })
    fireEvent.change(screen.getByLabelText(/CTC \(LPA ₹\) \*/i), { target: { value: '52' } })

    const form = screen.getByLabelText(/Recruiting Company \*/i).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('placement-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Campus drive for Google India posted successfully/i)).toBeInTheDocument()
    })
  })

  test('registers test candidate for placement drive successfully', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/apply')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Application recorded for Microsoft India!'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            drives: [
              {
                id: 1,
                company_name: 'Microsoft India',
                role_title: 'Software Development Engineer',
                ctc_lpa: 44.5,
                eligibility_cgpa: 8.0,
                eligible_branches: ['CSE'],
                drive_date: '2026-12-10',
                applicants_count: 5
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <PlacementDrivesPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('placement-loading')).not.toBeInTheDocument()
    })

    const applyBtn = screen.getByRole('button', { name: /Register Test Candidate/i })
    fireEvent.click(applyBtn)

    await waitFor(() => {
      expect(screen.getByTestId('placement-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Application recorded for Microsoft India/i)).toBeInTheDocument()
    })
  })
})
