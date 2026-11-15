import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OnlineExamPage from '../OnlineExamPage'
import { AuthContext } from '../../../context/AuthContext'

const mockAuthContext = {
  user: { id: 80, role: 'student', name: 'Ananya Sharma' },
  token: 'mock-student-token'
}

const mockActiveExam = {
  id: 1,
  title: 'CS301 - Data Structures & Algorithms Mid-Term',
  course_code: 'CS301',
  duration_mins: 60,
  total_marks: 50,
  questions: [
    {
      id: 101,
      text: 'What is the time complexity of searching in a Balanced Binary Search Tree?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)']
    },
    {
      id: 102,
      text: 'Which data structure follows the LIFO principle?',
      options: ['Queue', 'Stack', 'Tree', 'Graph']
    }
  ]
}

function renderComponent() {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter>
        <OnlineExamPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('OnlineExamPage Dark Mode Regression Guard', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/exams/online')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ exams: [mockActiveExam] })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders active examination with questions and proctoring HUD', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/CS301 - Data Structures & Algorithms Mid-Term/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/What is the time complexity/i)).toBeInTheDocument()
    expect(screen.getByText(/Which data structure follows the LIFO principle/i)).toBeInTheDocument()
    expect(screen.getByText(/Finalize & Submit Exam/i)).toBeInTheDocument()
  })

  it('locks dark mode fix: question-render container contains no hardcoded white background', async () => {
    const { container } = renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/CS301 - Data Structures & Algorithms Mid-Term/i)).toBeInTheDocument()
    })

    // Find the questions and active exam card containers
    const examCard = screen.getByText(/CS301 - Data Structures & Algorithms Mid-Term/i).closest('div[style*="border-radius"]')
    expect(examCard).toBeInTheDocument()

    // Assert that active card uses semantic CSS variable tokens
    const examCardStyle = examCard.getAttribute('style') || ''
    expect(examCardStyle).toContain('var(--card-bg)')
    expect(examCardStyle).toContain('var(--app-text)')

    // Inspect all elements inside the question container
    const allElements = examCard.querySelectorAll('*')
    allElements.forEach((el) => {
      const inlineStyle = el.getAttribute('style') || ''
      // Ensure no hardcoded white backgrounds
      expect(inlineStyle).not.toMatch(/background:\s*(#ffffff|#fff|white|rgb\(255,\s*255,\s*255\))/i)
      expect(inlineStyle).not.toMatch(/background-color:\s*(#ffffff|#fff|white|rgb\(255,\s*255,\s*255\))/i)
    })
  })

  it('ensures question containers use CSS variable tokens or dark-theme surfaces', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/Question 1:/i)).toBeInTheDocument()
    })

    const q1 = screen.getByText(/Question 1:/i).closest('div[style*="padding"]')
    expect(q1).toBeInTheDocument()
    const q1Style = q1.getAttribute('style') || ''
    expect(q1Style).toContain('var(--surface-bg)')
    expect(q1Style).toContain('var(--border-color)')
  })
})
