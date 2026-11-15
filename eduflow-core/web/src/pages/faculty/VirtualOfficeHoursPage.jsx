import { useState } from 'react'
import { Calendar, Clock, Video, UserCheck, Plus } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function VirtualOfficeHoursPage() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      student: 'Aditi Deshmukh (CS22B1008)',
      topic: 'Guidance on M.S. Research Statement & Recommendation Letter',
      timeSlot: 'Today, 4:00 PM - 4:20 PM',
      mode: 'In-Office (Room 304, CS Dept)',
      confirmed: true
    },
    {
      id: 2,
      student: 'Rahul Nair (CS22B1029)',
      topic: 'Query on Lab 3 Memory Map Segmentation Faults',
      timeSlot: 'Tomorrow, 3:30 PM - 3:50 PM',
      mode: 'Google Meet (Virtual)',
      confirmed: false
    }
  ])

  const confirmAppt = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, confirmed: true } : a))
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Virtual Office Hours & 1-on-1 Student Appointments"
      description="Publish consultation slots, accept student research inquiries, and manage in-person or video conference sessions."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Calendar size={18} className="text-primary" /> Upcoming Consultation Slots
          </h3>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>Discussion Agenda</th>
                  <th>Time Slot</th>
                  <th>Consultation Mode</th>
                  <th className="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td className="fw-semibold">{a.student}</td>
                    <td className="small">{a.topic}</td>
                    <td><Clock size={14} className="text-muted inline me-1" />{a.timeSlot}</td>
                    <td><span className="badge bg-secondary bg-opacity-10 text-secondary">{a.mode}</span></td>
                    <td className="text-end">
                      {a.confirmed ? (
                        <span className="badge bg-success bg-opacity-10 text-success">Confirmed</span>
                      ) : (
                        <button
                          onClick={() => confirmAppt(a.id)}
                          className="btn btn-sm btn-primary"
                        >
                          Approve Slot
                        </button>
                      )}
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
