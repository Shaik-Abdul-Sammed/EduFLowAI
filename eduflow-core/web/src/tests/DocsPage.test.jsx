import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import DocsPage from '../pages/public/DocsPage'

describe('DocsPage Component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  test('Renders modern developer doc layout with header, search, and sections', () => {
    render(
      <MemoryRouter>
        <DocsPage />
      </MemoryRouter>
    )

    // Check header and branding
    expect(screen.getAllByText(/EduFlow/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/Docs/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/v2.4.0 — Production/i)).toBeInTheDocument()

    // Check search placeholder
    const searchInput = screen.getByPlaceholderText(/Search docs.../i)
    expect(searchInput).toBeInTheDocument()

    // Check that FAQ is NOT present
    expect(screen.queryByText(/Frequently Asked Questions/i)).not.toBeInTheDocument()

    // Check sidebar categories
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('AI Officers')).toBeInTheDocument()
    expect(screen.getByText('Data Integration')).toBeInTheDocument()
    expect(screen.getByText('Admin Guide')).toBeInTheDocument()
    expect(screen.getByText('Security & Compliance')).toBeInTheDocument()
    expect(screen.getAllByText('API Reference')[0]).toBeInTheDocument()
  })

  test('Navigates between sections on sidebar click', () => {
    render(
      <MemoryRouter>
        <DocsPage />
      </MemoryRouter>
    )

    // Initially Quickstart is active
    expect(screen.getByRole('heading', { level: 1, name: /Quickstart Guide/i })).toBeInTheDocument()

    // Click Accreditation Officer in sidebar
    const accreditationBtn = screen.getByRole('button', { name: /Accreditation Officer/i })
    fireEvent.click(accreditationBtn)

    expect(screen.getByRole('heading', { level: 1, name: /Accreditation Officer/i })).toBeInTheDocument()
    expect(screen.getByText(/Autonomous generation of 7-Criteria NAAC SSR/i)).toBeInTheDocument()
  })

  test('Copy button works on code blocks', async () => {
    render(
      <MemoryRouter>
        <DocsPage />
      </MemoryRouter>
    )

    const copyButtons = screen.getAllByRole('button', { name: /Copy code/i })
    expect(copyButtons.length).toBeGreaterThan(0)

    fireEvent.click(copyButtons[0])
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(screen.getAllByText('Copied!')[0]).toBeInTheDocument()
  })

  test('Pressing / focuses the search input', () => {
    render(
      <MemoryRouter>
        <DocsPage />
      </MemoryRouter>
    )

    const searchInput = screen.getByPlaceholderText(/Search docs.../i)
    expect(document.activeElement).not.toBe(searchInput)

    fireEvent.keyDown(window, { key: '/' })
    expect(document.activeElement).toBe(searchInput)
  })
})
