import { useState } from 'react'
import { Server } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function LabInventoryPage() {
  const [equipment] = useState([
    {
      assetTag: 'EQ-CSE-2024-012',
      name: 'NVIDIA RTX A6000 AI Workstation (48GB VRAM)',
      lab: 'High Performance Computing Lab 3',
      calibrationExpiry: 'Nov 2027',
      operationalStatus: 'Operational',
      utilization: '92%'
    },
    {
      assetTag: 'EQ-CSE-2023-045',
      name: 'Rigol 100MHz 4-Channel Digital Storage Oscilloscope',
      lab: 'Embedded Systems Lab 1',
      calibrationExpiry: 'Dec 2026',
      operationalStatus: 'Operational',
      utilization: '64%'
    },
    {
      assetTag: 'EQ-CSE-2022-099',
      name: 'Xilinx Artix-7 FPGA Development Boards (Batch of 20)',
      lab: 'VLSI & Digital Logic Lab',
      calibrationExpiry: 'Aug 2026 (Expired)',
      operationalStatus: 'Maintenance Required',
      utilization: '40%'
    }
  ])

  return (
    <RolePageTemplate
      role="Faculty"
      title="Department Laboratory Equipment & Asset Tracker"
      description="Monitor research testbed availability, track calibration compliance, and report hardware repairs."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Server size={18} className="text-primary" /> Major Departmental Capital Assets
          </h3>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Asset Tag</th>
                  <th>Equipment Description</th>
                  <th>Assigned Lab</th>
                  <th>Calibration Expiry</th>
                  <th>Operational Status</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map(e => (
                  <tr key={e.assetTag}>
                    <td className="fw-bold font-monospace">{e.assetTag}</td>
                    <td className="fw-semibold">{e.name}</td>
                    <td>{e.lab}</td>
                    <td>{e.calibrationExpiry}</td>
                    <td>
                      <span className={`badge ${e.operationalStatus === 'Operational' ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${e.operationalStatus === 'Operational' ? 'success' : 'danger'}`}>
                        {e.operationalStatus}
                      </span>
                    </td>
                    <td>{e.utilization}</td>
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
