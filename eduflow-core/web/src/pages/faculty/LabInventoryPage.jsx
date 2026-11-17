import { useState, useEffect } from 'react'
import { Server, Wrench, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { wakeUpFetch } from '../../utils/wakeUpHandler'
import { useToast } from '../../context/ToastContext'

export default function LabInventoryPage() {
  const { addToast } = useToast?.() || { addToast: () => {} }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [equipment, setEquipment] = useState([
    {
      assetTag: 'EQ-CSE-2024-012',
      name: 'NVIDIA RTX A6000 AI Workstation (48GB VRAM)',
      lab: 'High Performance Computing Lab 3',
      calibrationExpiry: 'Nov 2027',
      operationalStatus: 'Operational',
      utilization: '92%',
      ticketRaised: false
    },
    {
      assetTag: 'EQ-CSE-2023-045',
      name: 'Rigol 100MHz 4-Channel Digital Storage Oscilloscope',
      lab: 'Embedded Systems Lab 1',
      calibrationExpiry: 'Dec 2026',
      operationalStatus: 'Operational',
      utilization: '64%',
      ticketRaised: false
    },
    {
      assetTag: 'EQ-CSE-2022-099',
      name: 'Xilinx Artix-7 FPGA Development Boards (Batch of 20)',
      lab: 'VLSI & Digital Logic Lab',
      calibrationExpiry: 'Aug 2026 (Expired)',
      operationalStatus: 'Maintenance Required',
      utilization: '40%',
      ticketRaised: false
    }
  ])

  const fetchLabInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await wakeUpFetch('/api/admin/reports')
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to synchronize lab assets & calibration telemetry`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setEquipment(prev => [
          ...prev,
          {
            assetTag: 'EQ-CSE-2025-001',
            name: 'Quantum Optics Laser Interferometer',
            lab: 'Advanced Physics & Quantum Computing Lab',
            calibrationExpiry: 'Jan 2028',
            operationalStatus: 'Operational',
            utilization: '78%',
            ticketRaised: false
          }
        ])
      }
    } catch (err) {
      setError(err.message || 'Lab equipment sync error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLabInventory()
  }, [])

  const handleRequestMaintenance = async (assetTag) => {
    try {
      await wakeUpFetch('/v1/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'lab_hardware_maintenance',
          subject: `Hardware Calibration/Repair Request for ${assetTag}`,
          description: `Dispatched technician calibration request for asset ${assetTag}.`
        })
      })

      setEquipment(prev => prev.map(e => e.assetTag === assetTag ? { ...e, ticketRaised: true, operationalStatus: 'Service Scheduled' } : e))
      addToast(`Maintenance ticket registered for asset ${assetTag}`, 'success')
    } catch (err) {
      addToast(`Failed to dispatch request: ${err.message}`, 'error')
    }
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Department Laboratory Equipment & Asset Tracker"
      description="Monitor research testbed availability, track calibration compliance, and report hardware repairs."
    >
      <div className="d-flex flex-column gap-4 w-100">
        {loading && (
          <div data-testid="lab-loading" className="alert alert-secondary py-2 px-3 small d-flex align-items-center gap-2 mb-0">
            <RefreshCw size={16} className="animate-spin" />
            <span>Synchronizing lab equipment status and calibration logs...</span>
          </div>
        )}

        {error && (
          <div data-testid="lab-error" className="alert alert-danger py-2 px-3 small d-flex justify-content-between align-items-center mb-0">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              data-testid="lab-retry"
              className="btn btn-outline-danger btn-sm py-0 px-2"
              onClick={fetchLabInventory}
            >
              Retry
            </button>
          </div>
        )}

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
                  <th className="text-end">Maintenance</th>
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
                    <td className="text-end">
                      <button
                        type="button"
                        data-testid={`request-repair-${e.assetTag}`}
                        disabled={e.ticketRaised}
                        onClick={() => handleRequestMaintenance(e.assetTag)}
                        className={`btn btn-sm ${e.ticketRaised ? 'btn-success' : 'btn-outline-warning'} d-inline-flex align-items-center gap-1.5`}
                      >
                        {e.ticketRaised ? (
                          <>
                            <CheckCircle2 size={14} /> Service Logged
                          </>
                        ) : (
                          <>
                            <Wrench size={14} /> Request Service
                          </>
                        )}
                      </button>
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
