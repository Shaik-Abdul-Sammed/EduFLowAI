import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role]
    if (!allowed.includes(user?.role)) {
      return <Navigate to="/entry" replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute
