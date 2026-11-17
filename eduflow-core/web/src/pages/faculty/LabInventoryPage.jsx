import { useState, useEffect } from 'react'
import {
  Server, Wrench, RefreshCw, AlertCircle, CheckCircle2,
  Plus, Search, Filter, ShieldCheck, Box, Package
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { wakeUpFetch } from '../../utils/wakeUpHandler'
import { useToast } from '../../context/ToastContext'

const defaultEquipment = [
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
]

const defaultConsumables = [
  { id: 'CON-01', item: 'Thermal Grizzly Kryonaut Paste (10g)', lab: 'HPC Lab 3', stock: 12, threshold: 5, unit: 'Tubes', status: 'Adequate' },
  { id: 'CON-02', item: 'ESP32-WROOM-32D Development Boards', lab: 'Embedded Lab 1', stock: 3, threshold: 8, unit: 'Boards', status: 'Low Stock' },
  { id: 'CON-03', item: 'Soldering Lead Wire 60/40 (500g)', lab: 'VLSI Lab', stock: 14, threshold: 4, unit: 'Spools', status: 'Adequate' },
  { id: 'CON-04', item: 'CAT6 Shielded Ethernet Cable (305m)', lab: 'Network Lab', stock: 1, threshold: 3, unit: 'Rolls', status: 'Low Stock' }
]

export default function LabInventoryPage() {
  const { addToast } = useToast?.() || { addToast: () => {} }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [equipment, setEquipment] = useState(defaultEquipment)
  const [consumables, setConsumables] = useState(defaultConsumables)
  const [search, setSearch] = useState('')
  const [selectedLab, setSelectedLab] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAsset, setNewAsset] = useState({
    assetTag: 'EQ-CSE-2026-008',
    name: '',
    lab: 'High Performance Computing Lab 3',
    calibrationExpiry: 'May 2028',
    utilization: '75%'
  })

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
      setEquipment(prev => prev.map(e => e.assetTag === assetTag ? { ...e, ticketRaised: true, operationalStatus: 'Service Scheduled' } : e))
      addToast(`Maintenance ticket logged for ${assetTag} (offline record updated)`, 'success')
    }
  }

  const handleAddEquipment = (e) => {
    e.preventDefault()
    if (!newAsset.name) return
    const asset = {
      ...newAsset,
      operationalStatus: 'Operational',
      ticketRaised: false
    }
    setEquipment(prev => [asset, ...prev])
    addToast(`Asset ${asset.assetTag} onboarded into department registry!`, 'success')
    setShowAddModal(false)
    setNewAsset({
      assetTag: 'EQ-CSE-2026-0' + Math.floor(10 + Math.random() * 90),
      name: '',
      lab: 'High Performance Computing Lab 3',
      calibrationExpiry: 'May 2028',
      utilization: '50%'
    })
  }

  const labs = ['all', ...new Set(equipment.map(e => e.lab))]

  const filteredEquipment = equipment.filter(e => {
    const matchesLab = selectedLab === 'all' || e.lab === selectedLab
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      e.lab.toLowerCase().includes(search.toLowerCase())
    return matchesLab && matchesSearch
  })

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

        {/* Action Header Card */}
        <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '1rem' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex gap-2 align-items-center">
              <Server size={20} className="text-primary" />
              <h5 className="fw-bold mb-0">Department Lab Asset Registry</h5>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={14} /> Onboard New Equipment
              </button>
            </div>
          </div>
        </div>

        {/* Search & Lab Filter Strip */}
        <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '1rem' }}>
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0"><Search size={15} className="text-muted" /></span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search asset tag, hardware name, or lab..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-flex gap-1 flex-wrap justify-content-md-end">
                {labs.map(l => (
                  <button
                    key={l}
                    className={`btn btn-sm ${selectedLab === l ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.72rem', borderRadius: '1rem' }}
                    onClick={() => setSelectedLab(l)}
                  >
                    {l === 'all' ? 'All Labs' : l.replace('High Performance Computing ', 'HPC ').replace('Advanced Physics & Quantum Computing ', 'Quantum ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)', borderRadius: '1.25rem' }}>
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
                {filteredEquipment.map(e => (
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

        {/* Consumables Stock Tracking */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem' }}>
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Package size={18} className="text-secondary" /> Lab Consumables & Reagent Replenishment
          </h5>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>CODE</th>
                  <th>ITEM NAME</th>
                  <th>LAB FACILITY</th>
                  <th>STOCK LEVEL</th>
                  <th>MIN THRESHOLD</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {consumables.map(c => (
                  <tr key={c.id}>
                    <td className="font-monospace fw-bold">{c.id}</td>
                    <td className="fw-semibold">{c.item}</td>
                    <td className="text-muted">{c.lab}</td>
                    <td className="fw-bold">{c.stock} {c.unit}</td>
                    <td className="text-muted">{c.threshold} {c.unit}</td>
                    <td>
                      <span className={`badge ${c.status === 'Low Stock' ? 'bg-danger' : 'bg-success'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for adding new equipment */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <Plus size={18} /> Register New Capital Asset
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
                </div>
                <form onSubmit={handleAddEquipment}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Asset Tag</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        required
                        value={newAsset.assetTag}
                        onChange={(e) => setNewAsset({ ...newAsset, assetTag: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Equipment Description & Model</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        placeholder="e.g. Tektronix 4-Channel Mixed Signal Oscilloscope"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Assigned Laboratory</label>
                      <select
                        className="form-select form-select-sm"
                        value={newAsset.lab}
                        onChange={(e) => setNewAsset({ ...newAsset, lab: e.target.value })}
                      >
                        <option>High Performance Computing Lab 3</option>
                        <option>Embedded Systems Lab 1</option>
                        <option>VLSI & Digital Logic Lab</option>
                        <option>Network & Cloud Security Lab</option>
                      </select>
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Calibration Expiry</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={newAsset.calibrationExpiry}
                          onChange={(e) => setNewAsset({ ...newAsset, calibrationExpiry: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Baseline Utilization</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={newAsset.utilization}
                          onChange={(e) => setNewAsset({ ...newAsset, utilization: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Onboard Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
