import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { io } from 'socket.io-client'

export default function ChildTracking() {
  const [childData, setChildData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // In a real app, use the actual backend URL
    const socket = io('http://localhost:4000')

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('user_location_update', (data) => {
      // In a real app, verify this is the parent's child
      if (data.userId === 'U1001') {
        setChildData(data)
      }
    })

    return () => socket.disconnect()
  }, [])

  return (
    <RolePageTemplate role="Parent" title="Child Tracking" description="Monitor your child's real-time location and campus presence.">
      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4 text-center py-5">
              <div className="mb-4">
                <span style={{ fontSize: '4rem' }}>📍</span>
              </div>
              <h4 className="fw-bold mb-3">Live Map View</h4>
              {isConnected ? (
                childData ? (
                  <div>
                    <p className="text-success mb-2 fw-semibold">Receiving live updates for {childData.name}</p>
                    <p className="text-muted small font-monospace mb-0">
                      Lat: {childData.lat.toFixed(5)} | Lng: {childData.lng.toFixed(5)}
                    </p>
                    <p className="text-muted small mt-2">
                      Last Updated: {new Date(childData.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted">Waiting for location signal from child's device...</p>
                )
              ) : (
                <p className="text-danger">Disconnected from tracking server. Retrying...</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Child Details</h5>
              
              <div className="mb-3">
                <label className="d-block text-muted small fw-bold mb-1">NAME</label>
                <div>{childData ? childData.name : 'Shaik Abdul Sammed'}</div>
              </div>
              
              <div className="mb-3">
                <label className="d-block text-muted small fw-bold mb-1">ROLE</label>
                <div>Student</div>
              </div>

              <div className="mb-3">
                <label className="d-block text-muted small fw-bold mb-1">STATUS</label>
                <div>
                  <span className={`badge ${isConnected && childData ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {isConnected && childData ? 'Active on Campus' : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
