import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OnlineExamPage from '../pages/student/OnlineExamPage'

describe('OnlineExamPage Proctoring & Telemetry Tests', () => {
  const originalMediaDevices = navigator.mediaDevices
  const originalFetch = global.fetch

  const mockExamData = {
    exams: [
      {
        id: 1,
        title: 'Distributed Systems & Cloud Computing Final Exam',
        course_code: 'CS401',
        total_marks: 30,
        duration_mins: 60,
        questions: [
          {
            id: 'q1',
            text: 'Which consensus algorithm is leader-based?',
            options: ['Raft', 'Gossip', 'Byzantine Generals', 'Epidemic'],
            correct: 0
          }
        ]
      }
    ]
  }

  beforeEach(() => {
    window.__mockFaceDetected = true
    global.fetch = jest.fn((url) => {
      if (url.includes('/exams/online') && !url.includes('/violation') && !url.includes('/submit')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockExamData
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true })
      })
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: originalMediaDevices
    })
    global.fetch = originalFetch
    delete window.__mockFaceDetected
  })

  test('renders camera error alert when webcam permissions are rejected', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied by student'))
      }
    })

    render(
      <MemoryRouter>
        <OnlineExamPage />
      </MemoryRouter>
    )

    // Wait for exam to load
    expect(await screen.findByText(/Distributed Systems & Cloud Computing/i)).toBeInTheDocument()

    // Assert camera error badge appears
    const errorAlert = await screen.findByTestId('camera-error')
    expect(errorAlert).toBeInTheDocument()
    expect(errorAlert).toHaveTextContent(/Camera access denied or unavailable/i)
  })

  test('detects tab switch event and logs violation with warning modal', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop: jest.fn() }]
        })
      }
    })

    render(
      <MemoryRouter>
        <OnlineExamPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Distributed Systems & Cloud Computing/i)).toBeInTheDocument()

    // Trigger tab-switch (document.hidden = true)
    Object.defineProperty(document, 'hidden', { value: true, writable: true })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Assert proctoring warning modal appears
    await waitFor(() => {
      expect(screen.getByText(/Proctoring Violation Flagged!/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Tab switching or leaving the active exam window/i)).toBeInTheDocument()

    // Acknowledge warning
    fireEvent.click(screen.getByRole('button', { name: /I Understand & Acknowledge/i }))
    expect(screen.queryByText(/Proctoring Violation Flagged!/i)).not.toBeInTheDocument()
  })

  test('accumulating 3 violations locks the examination UI', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop: jest.fn() }]
        })
      }
    })

    render(
      <MemoryRouter>
        <OnlineExamPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Distributed Systems & Cloud Computing/i)).toBeInTheDocument()

    // Violation 1
    act(() => {
      window.dispatchEvent(new Event('blur'))
    })
    // Violation 2
    act(() => {
      window.dispatchEvent(new Event('blur'))
    })
    // Violation 3
    act(() => {
      window.dispatchEvent(new Event('blur'))
    })

    await waitFor(() => {
      expect(screen.getByText(/CRITICAL PROCTORING VIOLATION/i)).toBeInTheDocument()
    })
    expect(screen.getAllByText(/Exam locked/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /Exam Locked/i })).toBeDisabled()
  })
})
