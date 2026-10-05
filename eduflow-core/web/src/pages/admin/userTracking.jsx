import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { io } from 'socket.io-client'
import { getApiBaseURL } from '../../config/apiConfig'

export default function UserTracking() {
  const [users, setUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketUrl = getApiBaseURL().replace(/\/api\/?$/, '')
    const socket = io(socketUrl)

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('user_location_update', (data) => {
      setUsers(prev => {
        const existing = prev.find(u => u.userId === data.userId)
        if (existing) {
          return prev.map(u => u.userId === data.userId ? data : u)
        }
        return [...prev, data]
      })
    })

    return () => socket.disconnect()
  }, [])

  return (
    <RolePageTemplate role="Admin" title="User Tracking" description="Monitor real-time locations of students, faculty, and staff on campus.">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1 fw-bold">Live Tracking Status</h5>
            <p className="text-muted small mb-0">WebSocket connection to tracking server.</p>
          </div>
          <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>User Name</th>
                  <th className="px-4 py-3 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Role</th>
                  <th className="px-4 py-3 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Latitude</th>
                  <th className="px-4 py-3 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Longitude</th>
                  <th className="px-4 py-3 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No active users being tracked at this moment.
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.userId}>
                      <td className="px-4 py-3 fw-bold">{u.name}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary">{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-muted" style={{ fontFamily: 'monospace' }}>{u.lat.toFixed(5)}</td>
                      <td className="px-4 py-3 text-muted" style={{ fontFamily: 'monospace' }}>{u.lng.toFixed(5)}</td>
                      <td className="px-4 py-3 text-muted small">{new Date(u.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
