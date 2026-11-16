import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ParentMarksProgressPage from '../pages/parent/marksProgress'

describe('ParentMarksProgressPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders student GPA and subject marks table', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            studentSummary: {
              studentName: 'Aarav Sharma',
              studentRoll: 'SS26CS01',
              branch: 'Computer Science',
              cgpa: 8.85,
              currentSemester: 'Sem 5',
              completedCredits: 112
            },
            subjectMarks: [
              {
                id: 1,
                subjectCode: 'CS501',
                subjectName: 'Design & Analysis of Algorithms',
                internalMarks: 28,
                internalMax: 30,
                midTermMarks: 38,
                midTermMax: 40,
                practicalMarks: 29,
                practicalMax: 30,
                totalMarks: 95,
                grade: 'A+',
                semester: 'Sem 5'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ParentMarksProgressPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('marks-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('marks-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Subject-Wise Grades & Examination Progress')).toBeInTheDocument()
    expect(screen.getByText('8.85 / 10.0')).toBeInTheDocument()
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    expect(screen.getByText('Design & Analysis of Algorithms')).toBeInTheDocument()
    expect(screen.getByText('CS501')).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()
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
            subjectMarks: []
          })
      })
    })

    render(
      <BrowserRouter>
        <ParentMarksProgressPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load academic marks/i).length).toBeGreaterThanOrEqual(1)
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Subject-Wise Grades & Examination Progress')).toBeInTheDocument()
    })
  })

  test('filters subject marks by semester buttons', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            subjectMarks: [
              {
                id: 1,
                subjectCode: 'CS501',
                subjectName: 'Algorithms',
                semester: 'Sem 5',
                totalMarks: 90,
                grade: 'A'
              },
              {
                id: 2,
                subjectCode: 'CS401',
                subjectName: 'OS Architecture',
                semester: 'Sem 4',
                totalMarks: 85,
                grade: 'A'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ParentMarksProgressPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('marks-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Algorithms')).toBeInTheDocument()
    expect(screen.queryByText('OS Architecture')).not.toBeInTheDocument()

    // Switch to Sem 4
    fireEvent.click(screen.getByRole('button', { name: /Sem 4/i }))
    expect(screen.queryByText('Algorithms')).not.toBeInTheDocument()
    expect(screen.getByText('OS Architecture')).toBeInTheDocument()
  })
})
