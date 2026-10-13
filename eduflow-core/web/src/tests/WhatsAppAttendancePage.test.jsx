import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import WhatsAppAttendancePage from '../pages/admin/WhatsAppAttendancePage'

describe('WhatsAppAttendancePage Component Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/v1/whatsapp/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            configured: false,
            service: 'Console Simulator Mode',
            senderNumber: '+91 99000 11222',
            webhookUrl: 'https://eduflow-backend-jvn8.onrender.com/api/v1/whatsapp/webhook'
          })
        })
      }
      if (url.includes('/api/v1/whatsapp/staged')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            staged: [
              {
                id: 1,
                course_code: 'CSE',
                section: '3A',
                faculty_phone: '+919876543210',
                present_count: 45,
                absent_count: 5,
                status: 'PENDING',
                raw_message: 'CSE 3A present 45 absent 5'
              }
            ]
          })
        })
      }
      if (url.includes('/api/v1/whatsapp/logs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            logs: [
              {
                id: 1,
                direction: 'INBOUND',
                from_number: '+919876543210',
                body: 'CSE 3A present 45 absent 5',
                status: 'DELIVERED'
              }
            ]
          })
        })
      }
      if (url.includes('/api/v1/whatsapp/faculty')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            faculty: [
              { id: 1, name: 'Dr. Ramesh Kumar', department: 'CSE', phone: '+919876543210' }
            ]
          })
        })
      }
      if (url.includes('/api/v1/whatsapp/simulate-message')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            staged: true,
            reply: 'Attendance recorded for CSE 3A: 45 present, 5 absent'
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    })
  })

  test('renders header, gateway status, and simulator form', async () => {
    render(<WhatsAppAttendancePage />)

    expect(screen.getByText(/WhatsApp Faculty Attendance/i)).toBeInTheDocument()
    expect(screen.getByText(/Gateway Status/i)).toBeInTheDocument()
    expect(screen.getByText(/Test Message Simulator/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send Simulated Message/i })).toBeInTheDocument()
  })

  test('renders staged attendance queue and faculty registry', async () => {
    render(<WhatsAppAttendancePage />)

    await waitFor(() => {
      expect(screen.getByText(/Staged Attendance Queue/i)).toBeInTheDocument()
      expect(screen.getByText(/Faculty Phone Registry/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Dr. Ramesh Kumar/i).length).toBeGreaterThan(0)
    })
  })

  test('submitting simulator triggers simulation endpoint', async () => {
    render(<WhatsAppAttendancePage />)

    const sendBtn = screen.getByRole('button', { name: /Send Simulated Message/i })
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/whatsapp/simulate-message',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })
})
