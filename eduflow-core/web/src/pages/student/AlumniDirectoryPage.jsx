import { useState } from 'react'
import { Users, Briefcase, MapPin, Search, Calendar, MessageSquare } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function AlumniDirectoryPage() {
  const [search, setSearch] = useState('')
  const [alumni] = useState([
    {
      id: 1,
      name: 'Aditya Kashyap',
      batch: 'Class of 2022',
      role: 'Senior SDE at Google Cloud',
      location: 'Bengaluru, India',
      domain: 'Cloud Infrastructure & Go',
      availableSlots: 2
    },
    {
      id: 2,
      name: 'Sneha Nambiar',
      batch: 'Class of 2021',
      role: 'Staff ML Engineer at DeepMind',
      location: 'London, UK',
      domain: 'Reinforcement Learning & JAX',
      availableSlots: 1
    },
    {
      id: 3,
      name: 'Karthik Rao',
      batch: 'Class of 2023',
      role: 'Product Specialist at Razorpay',
      location: 'Mumbai, India',
      domain: 'FinTech & Payment Rails',
      availableSlots: 3
    }
  ])

  const [requestedId, setRequestedId] = useState(null)

  const filtered = alumni.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase()) ||
    a.domain.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <RolePageTemplate
      role="Student"
      title="Alumni Mentorship Network"
      description="Connect with alumni working at top global tech and research organizations for mock interviews and career advice."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <Search size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search alumni by name, company, or domain..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 text-md-end text-muted small">
              Showing {filtered.length} active mentors open for booking
            </div>
          </div>
        </div>

        <div className="row g-3">
          {filtered.map(a => (
            <div key={a.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-between" style={{ background: 'var(--card-bg, #ffffff)' }}>
                <div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 44, height: 44 }}>
                      {a.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="h6 fw-bold mb-0">{a.name}</h4>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary">{a.batch}</span>
                    </div>
                  </div>
                  <div className="text-dark fw-semibold small d-flex align-items-center gap-1.5 mb-1">
                    <Briefcase size={14} className="text-primary" /> {a.role}
                  </div>
                  <div className="text-muted small d-flex align-items-center gap-1.5 mb-2">
                    <MapPin size={14} /> {a.location}
                  </div>
                  <div className="p-2 rounded bg-light small mb-3">
                    <strong>Focus:</strong> {a.domain}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRequestedId(a.id)}
                  disabled={requestedId === a.id}
                  className="btn btn-outline-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <Calendar size={16} /> {requestedId === a.id ? 'Slot Requested ✓' : `Book Mentorship (${a.availableSlots} slots)`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RolePageTemplate>
  )
}
