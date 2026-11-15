import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import BulkDataImportPage from '../pages/admin/BulkDataImportPage'
import CertificatePage from '../pages/student/CertificatePage'

describe('Phase 5 Web UX Tests: BulkDataImportPage & CertificatePage', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/v1/certificates/generate')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              certificate: {
                certId: 'BONA-2026-TEST99',
                studentName: 'Ananya Sharma',
                rollNumber: 'SS26-CSE-042',
                courseName: 'B.Tech CSE',
                academicYear: '2025-2026',
                issuePurpose: 'Visa Application',
                cgpa: 9.24,
                institutionName: 'Sri Siddhartha Institute of Technology',
                status: 'VALID',
                issuedAt: '2026-11-15T00:00:00.000Z',
                qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Operation succeeded'
          })
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('BulkDataImportPage (Feature 64)', () => {
    test('renders tabs, sample button, and imports faculty successfully', async () => {
      render(<BulkDataImportPage />)

      expect(screen.getByText(/Bulk Data Import Gateway/i)).toBeInTheDocument()
      expect(screen.getByText(/Faculty Import/i)).toBeInTheDocument()
      expect(screen.getByText(/Course Catalog Import/i)).toBeInTheDocument()

      const loadSampleBtn = screen.getByText(/Load Demo Sample/i)
      fireEvent.click(loadSampleBtn)

      // Verify table rendered with overflow container
      expect(screen.getByText(/Preview Validated Rows/i)).toBeInTheDocument()
      const matches = screen.getAllByText(/Dr. Priya Sundaram/i)
      expect(matches.length).toBeGreaterThanOrEqual(1)

      const importBtn = screen.getByText(/Import 3 Faculty/i)
      await act(async () => {
        fireEvent.click(importBtn)
      })

      await waitFor(() => {
        expect(screen.getByText(/Operation succeeded/i)).toBeInTheDocument()
      })
    })

    test('switches tab to Course Catalog and renders course columns', () => {
      render(<BulkDataImportPage />)

      const courseTab = screen.getByText(/Course Catalog Import/i)
      fireEvent.click(courseTab)

      const loadSampleBtn = screen.getByText(/Load Demo Sample/i)
      fireEvent.click(loadSampleBtn)

      const codeMatches = screen.getAllByText(/CS301/i)
      expect(codeMatches.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('CertificatePage (Feature 45)', () => {
    test('renders certificate request form and submits to generate certificate', async () => {
      render(<CertificatePage />)

      expect(screen.getByText(/Digital Bonafide Certificate Portal/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue(/Ananya Sharma/i)).toBeInTheDocument()

      const generateBtn = screen.getByText(/Generate Official Certificate/i)
      await act(async () => {
        fireEvent.click(generateBtn)
      })

      await waitFor(() => {
        expect(screen.getByText('BONAFIDE CERTIFICATE')).toBeInTheDocument()
      })

      expect(screen.getByText('BONA-2026-TEST99')).toBeInTheDocument()
      expect(screen.getByText(/Print \/ Download PDF/i)).toBeInTheDocument()
    })
  })
})
