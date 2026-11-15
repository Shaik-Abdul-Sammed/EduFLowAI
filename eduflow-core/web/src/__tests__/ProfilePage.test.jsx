import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProfilePage from '../pages/common/ProfilePage'
import apiClient from '../services/apiClient'
import * as authHook from '../hooks/useAuth'

jest.mock('../services/apiClient')

const mockUser = {
  id: 'usr-101',
  name: 'Ananya Sharma',
  username: 'ananya.sharma',
  role: 'student',
  email: 'ananya.sharma@eduflow.edu',
  phone: '+91 98765 12345',
  address: 'Room 204, Kaveri Hostel, EduFlow Campus',
  rollNumber: '2024-CSE-088',
  bloodGroup: 'B+',
  department: 'Computer Science & Engineering'
}

describe('ProfilePage Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(authHook, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true
    })
  })

  it('renders unauthenticated state when user is not present', () => {
    jest.spyOn(authHook, 'useAuth').mockReturnValue({ user: null, isAuthenticated: false })
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    )
    expect(screen.getByTestId('unauthenticated-profile')).toBeInTheDocument()
    expect(screen.getByText(/Please log in to view your profile/i)).toBeInTheDocument()
  })

  it('renders loading state and fetches profile data on mount', async () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('profile-loading')).toBeInTheDocument()
  })

  it('renders fetched profile data successfully', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        user: {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@eduflow.edu',
          phone: '+91 91234 56789',
          address: 'Faculty Quarters #12',
          role: 'faculty'
        }
      }
    })

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile-form')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Dr. Rajesh Kumar')).toBeInTheDocument()
    expect(screen.getByDisplayValue('rajesh.kumar@eduflow.edu')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+91 91234 56789')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Faculty Quarters #12')).toBeInTheDocument()
  })

  it('submits updated profile data via PUT API and displays success state', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        user: {
          name: 'Ananya Sharma',
          email: 'ananya.sharma@eduflow.edu',
          phone: '+91 98765 12345',
          address: 'Room 204, Kaveri Hostel',
          role: 'student'
        }
      }
    })

    apiClient.put.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,
        message: 'Profile updated successfully'
      }
    })

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile-form')).toBeInTheDocument()
    })

    const phoneInput = screen.getByLabelText('PHONE NUMBER')
    fireEvent.change(phoneInput, { target: { value: '+91 99999 88888' } })

    const addressInput = screen.getByLabelText('ADDRESS')
    fireEvent.change(addressInput, { target: { value: 'New Hostel Block C' } })

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith('/user/profile', expect.objectContaining({
        phone: '+91 99999 88888',
        address: 'New Hostel Block C'
      }))
    })

    expect(await screen.findByText(/Profile updated successfully/i)).toBeInTheDocument()
  })

  it('renders error banner when profile update fails on 500 error', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        user: {
          name: 'Ananya Sharma',
          email: 'ananya.sharma@eduflow.edu',
          phone: '+91 98765 12345',
          address: 'Room 204, Kaveri Hostel',
          role: 'student'
        }
      }
    })

    const errorObj = new Error('Database transaction error')
    errorObj.response = { status: 500, data: { error: 'Database transaction error' } }
    apiClient.put.mockRejectedValueOnce(errorObj)

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile-form')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    expect(await screen.findByText(/Database transaction error/i)).toBeInTheDocument()
  })
})
