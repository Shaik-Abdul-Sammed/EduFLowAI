import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RolePermissionsPage from '../pages/admin/rolePermissions'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Admin Role Permissions Page', () => {
  it('renders loading state and displays authorization matrix', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        role_permissions: [
          { module: 'NAAC Accreditation Reports', admin: { read: true, write: true }, faculty: { read: true, write: false }, parent: { read: false, write: false }, student: { read: false, write: false } }
        ]
      })
    })

    render(
      <MemoryRouter>
        <RolePermissionsPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('permissions-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('NAAC Accreditation Reports')).toBeInTheDocument()
      expect(screen.getByText('System Authorization Matrix')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <RolePermissionsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('permissions-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('saves modified access matrix hitting institution settings API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          role_permissions: [
            { module: 'Library Circulation', admin: { read: true, write: true }, faculty: { read: true, write: false }, parent: { read: false, write: false }, student: { read: true, write: false } }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

    render(
      <MemoryRouter>
        <RolePermissionsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save access matrix/i })).toBeInTheDocument()
    })

    const saveBtn = screen.getByRole('button', { name: /save access matrix/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/institution/settings',
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })
  })
})
