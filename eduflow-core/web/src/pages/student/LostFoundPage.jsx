import { useState } from 'react'
import { MapPin, Plus } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function LostFoundPage() {
  const [items, setItems] = useState([
    { id: 1, item: 'TI-Nspire CX Graphing Calculator', location: 'ECE Seminar Hall B', date: 'Yesterday, 4:30 PM', status: 'Found & at Security Desk', contact: 'Campus Security Gate 2' },
    { id: 2, item: 'Blue Parker Fountain Pen Set', location: 'Central Library 2nd Floor', date: 'Nov 12, 2026', status: 'Claimed', contact: 'Student Helpdesk' },
    { id: 3, item: 'Black Dell 65W USB-C Charger', location: 'Computer Lab 402', date: 'Today, 11:15 AM', status: 'Unclaimed', contact: 'Lab Assistant Mr. Kumar' }
  ])

  const [newItem, setNewItem] = useState('')
  const [newLocation, setNewLocation] = useState('')

  const handleReport = (e) => {
    e.preventDefault()
    if (!newItem.trim() || !newLocation.trim()) return
    const report = {
      id: Date.now(),
      item: newItem.trim(),
      location: newLocation.trim(),
      date: 'Just now',
      status: 'Reported Unclaimed',
      contact: 'Security Post'
    }
    setItems(prev => [report, ...prev])
    setNewItem('')
    setNewLocation('')
  }

  return (
    <RolePageTemplate
      role="Student"
      title="Smart Campus Lost & Found Registry"
      description="Report missing personal belongings or log items discovered inside campus lecture halls, hostels, and sports complexes."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Plus size={18} className="text-primary" /> Report an Item
          </h3>
          <form onSubmit={handleReport} className="row g-3">
            <div className="col-12 col-md-5">
              <label className="form-label small fw-semibold">Item Name & Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Red Water Bottle / Scientific Calculator"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-5">
              <label className="form-label small fw-semibold">Location Found or Lost</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mechanical Workshop or Main Library"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">Post Report</button>
            </div>
          </form>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3">Recently Logged Items</h3>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Location</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Retrieval Point</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td className="fw-semibold">{it.item}</td>
                    <td><MapPin size={14} className="text-muted inline me-1" />{it.location}</td>
                    <td>{it.date}</td>
                    <td>
                      <span className={`badge ${it.status === 'Claimed' ? 'bg-secondary' : 'bg-success'} bg-opacity-10 text-${it.status === 'Claimed' ? 'secondary' : 'success'}`}>
                        {it.status}
                      </span>
                    </td>
                    <td className="small text-muted">{it.contact}</td>
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
