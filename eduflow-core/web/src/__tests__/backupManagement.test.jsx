import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import BackupManagement from '../pages/admin/backupManagement'

describe('BackupManagement Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched backup snapshots and health metrics', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            snapshotCount: 2,
            rowCount: 42800,
            retentionLimit: 30,
            healthy: true,
            snapshots: [
              {
                id: 'SNAP-20261115-01',
                recordCount: 42800,
                checksum: 'sha256-a1b2c3d4e5',
                createdAt: '2026-11-15T04:00:00Z'
              },
              {
                id: 'SNAP-20261116-01',
                recordCount: 43100,
                checksum: 'sha256-f6g7h8i9j0',
                createdAt: '2026-11-16T04:00:00Z'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <BackupManagement />
      </BrowserRouter>
    )

    expect(screen.getByTestId('backup-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('backup-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Database Backup & DRaaS Operations')).toBeInTheDocument()
    expect(screen.getByText('SNAP-20261115-01')).toBeInTheDocument()
    expect(screen.getByText('SNAP-20261116-01')).toBeInTheDocument()
    expect(screen.getByText('Active Snapshots')).toBeInTheDocument()
  })

  test('displays error state with retry on fetch failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <BackupManagement />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('backup-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Connect to Backup Vault')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            snapshotCount: 0,
            snapshots: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.getByTestId('backup-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No backup snapshots found')).toBeInTheDocument()
  })

  test('triggers snapshot creation and displays success toast', async () => {
    let callCount = 0
    global.fetch = jest.fn((url, options) => {
      callCount++
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              snapshot: {
                id: 'SNAP-INSTANT-001',
                recordCount: 44000,
                checksum: 'sha256-new'
              }
            })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            snapshotCount: callCount > 1 ? 1 : 0,
            snapshots: callCount > 1
              ? [
                  {
                    id: 'SNAP-INSTANT-001',
                    recordCount: 44000,
                    checksum: 'sha256-new'
                  }
                ]
              : []
          })
      })
    })

    render(
      <BrowserRouter>
        <BackupManagement />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('backup-loading')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('create-snapshot-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('backup-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/created successfully/)).toBeInTheDocument()
  })
})
