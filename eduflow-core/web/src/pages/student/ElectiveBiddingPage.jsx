import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function ElectiveBiddingPage() {
  const [electives] = useState([
    { code: 'OE401', name: 'Quantum Information & Quantum Computing', seats: 60, filled: 48, credits: 3, preference: 1 },
    { code: 'OE405', name: 'Applied Blockchain & Smart Contract Audit', seats: 50, filled: 49, credits: 3, preference: 2 },
    { code: 'OE412', name: 'Bio-Robotics & Bionic Prosthetics', seats: 45, filled: 22, credits: 3, preference: 3 }
  ])

  const [bidded, setBidded] = useState(false)

  return (
    <RolePageTemplate
      role="Student"
      title="CBCS Open Elective Bidding System"
      description="Choice Based Credit System (CBCS) course allocation, real-time seat availability, and preference ranker."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="h6 fw-bold mb-1">Semester 6 Open Electives</h3>
              <p className="text-muted small mb-0">Drag and reorder your preferred courses before the bidding window closes.</p>
            </div>
            <button
              onClick={() => setBidded(true)}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              <CheckCircle size={16} /> {bidded ? 'Preferences Saved ✓' : 'Lock Preferences'}
            </button>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Rank</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Seat Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {electives.map(e => (
                  <tr key={e.code}>
                    <td><span className="badge bg-primary">#{e.preference}</span></td>
                    <td className="fw-bold">{e.code}</td>
                    <td>{e.name}</td>
                    <td>{e.credits} Credits</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                          <div
                            className="progress-bar bg-info"
                            style={{ width: `${(e.filled / e.seats) * 100}%` }}
                          />
                        </div>
                        <span className="small text-muted">{e.filled} / {e.seats}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
