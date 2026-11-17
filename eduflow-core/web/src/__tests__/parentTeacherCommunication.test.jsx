import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TeacherCommunication from '../pages/parent/teacherCommunication'

describe('TeacherCommunication Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays message history', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: [
              {
                id: 1,
                sender: 'mentor',
                text: 'Ananya has shown great progress in Advanced Algorithms.',
                timestamp: '2026-11-15T10:00:00Z'
              },
              {
                id: 2,
                sender: 'parent',
                text: 'Thank you Professor Ramesh. Is her attendance on track?',
                timestamp: '2026-11-15T10:15:00Z'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <TeacherCommunication />
      </BrowserRouter>
    )

    expect(screen.getByTestId('chat-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('chat-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Teacher Communication')).toBeInTheDocument()
    expect(screen.getByText(/Ananya has shown great progress in Advanced Algorithms/)).toBeInTheDocument()
    expect(screen.getByText(/Thank you Professor Ramesh. Is her attendance on track/)).toBeInTheDocument()
  })

  test('displays error state with retry on failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <TeacherCommunication />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('chat-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Messages')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('chat-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('No messages yet.')).toBeInTheDocument()
  })

  test('sends a new parent message and appends it to conversation', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: {
                id: 4,
                sender: 'parent',
                text: 'Will there be a parent-teacher meeting next Friday?',
                timestamp: '2026-11-16T12:00:00Z'
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: [
              {
                id: 1,
                sender: 'mentor',
                text: 'Welcome to the mentor channel.',
                timestamp: '2026-11-15T09:00:00Z'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <TeacherCommunication />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('chat-loading')).not.toBeInTheDocument()
    })

    const input = screen.getByTestId('chat-input')
    fireEvent.change(input, { target: { value: 'Will there be a parent-teacher meeting next Friday?' } })

    const sendBtn = screen.getByTestId('chat-send-btn')
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(screen.getByText('Will there be a parent-teacher meeting next Friday?')).toBeInTheDocument()
    })
  })
})
