import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import NavBar from '../NavBar'
import { I18nProvider } from '../../i18n'

const mockLogout = jest.fn()

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { role: 'student', name: 'Ananya' },
    logout: mockLogout,
  }),
}))

jest.mock('../GlobalSearch', () => () => <div data-testid="global-search" />)
jest.mock('../NotificationCenter', () => () => <div data-testid="notification-center" />)

describe('NavBar', () => {
  it('renders active navigation and search controls', () => {
    render(
      <MemoryRouter initialEntries={['/directory']}>
        <I18nProvider>
          <NavBar routes={[{ slug: 'attendance-overview', routePath: '/student-dashboard/attendance-overview' }]} />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getAllByTestId('global-search')[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /logout/i })[0]).toBeInTheDocument()
  })
})
