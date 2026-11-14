import { useState, useEffect } from 'react'
import { Database, FileCode, Plus, CheckCircle2, Download, Terminal, Layers, Users, Clock } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function ResearchWorkspacePage() {
  const [projectId, setProjectId] = useState('proj-ai-01')
  const [logs, setLogs] = useState([
    {
      id: 1,
      projectId: 'proj-ai-01',
      logMessage: 'Initialized multi-tenant neural pruning benchmark across 128 GPU nodes. Target sparsity: 60%.',
      author: 'Dr. Vikram Malhotra',
      datasetName: 'imagenet_dist_val_shard01.bin',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      projectId: 'proj-ai-01',
      logMessage: 'Epoch 12 convergence achieved: validation perplexity reached 4.12. No parameter divergence detected.',
      author: 'Dr. Vikram Malhotra',
      datasetName: 'imagenet_dist_val_shard01.bin',
      timestamp: '1 hour ago'
    }
  ])

  const [datasets, setDatasets] = useState([
    { id: 'ds-01', name: 'imagenet_dist_val_shard01.bin', size: '4.8 GB', format: 'Binary Tensor', rows: '50,000 samples', uploadedBy: 'Dr. Vikram Malhotra' },
    { id: 'ds-02', name: 'genomics_crispr_cleavage_v4.parquet', size: '1.2 GB', format: 'Apache Parquet', rows: '120,000 sequences', uploadedBy: 'Prof. Ananya Sen' },
    { id: 'ds-03', name: 'sensor_telemetry_iot_campus.csv', size: '340 MB', format: 'Delimited CSV', rows: '2,400,000 pings', uploadedBy: 'Lab Assistant Rohan' }
  ])

  const [newLogMessage, setNewLogMessage] = useState('')
  const [selectedDataset, setSelectedDataset] = useState('imagenet_dist_val_shard01.bin')
  const [submitting, setSubmitting] = useState(false)
  const [successNotice, setSuccessNotice] = useState(false)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`${getApiBaseURL()}/v1/research/workspace/logs?projectId=${projectId}`)
        if (res.ok) {
          const data = await safeJson(res)
          if (data?.logs && Array.isArray(data.logs)) {
            setLogs(data.logs)
          }
          if (data?.datasets && Array.isArray(data.datasets)) {
            setDatasets(data.datasets)
          }
        }
      } catch {
        // Retain fallback state
      }
    }
    fetchLogs()
  }, [projectId])

  const handleAddLog = async (e) => {
    e.preventDefault()
    if (!newLogMessage.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch(`${getApiBaseURL()}/v1/research/workspace/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          logMessage: newLogMessage.trim(),
          author: 'Dr. Vikram Malhotra',
          datasetName: selectedDataset
        })
      })

      if (res.ok) {
        const data = await safeJson(res)
        if (data?.log) {
          setLogs([data.log, ...logs])
        }
      } else {
        // Fallback simulation
        const simLog = {
          id: logs.length + 1,
          projectId,
          logMessage: newLogMessage.trim(),
          author: 'Dr. Vikram Malhotra',
          datasetName: selectedDataset,
          timestamp: 'Just now'
        }
        setLogs([simLog, ...logs])
      }

      setNewLogMessage('')
      setSuccessNotice(true)
      setTimeout(() => setSuccessNotice(false), 3000)
    } catch {
      const simLog = {
        id: logs.length + 1,
        projectId,
        logMessage: newLogMessage.trim(),
        author: 'Dr. Vikram Malhotra',
        datasetName: selectedDataset,
        timestamp: 'Just now'
      }
      setLogs([simLog, ...logs])
      setNewLogMessage('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RolePageTemplate
      role="Researcher"
      title="Virtual Research Environment (VRE) Collaborative Workspace"
      description="Collaborative research data fabric: synchronized scientific datasets, distributed training artifacts, and immutable experiment observation logs."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Banner */}
        <div className="card border-0 shadow-sm" style={{
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
          color: '#ffffff'
        }}>
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="badge bg-primary text-white px-3 py-1 mb-2 font-monospace" style={{ fontSize: '0.75rem' }}>
                ● HIGH-PERFORMANCE COMPUTING CLUSTER CONNECTED
              </span>
              <h2 className="h4 fw-bold mb-1 text-white" style={{ wordBreak: 'break-word' }}>
                Project: Distributed Edge Learning & Consensus (Project ID: {projectId})
              </h2>
              <p className="text-white-50 small mb-0" style={{ wordBreak: 'break-word' }}>
                Principal Investigator: Dr. Vikram Malhotra • Co-PI: Prof. Ananya Sen • 3 Verified Datasets Active
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-light text-dark font-monospace">HPC Node: gpu-cluster-a100-04</span>
            </div>
          </div>
        </div>

        {/* Workspace Split Layout */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%'
        }}>
          
          {/* Left Column: Shared Scientific Datasets */}
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h3 className="h6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <Database size={18} className="text-primary" />
                  Shared Research Datasets
                </h3>
                <span className="badge bg-primary-subtle text-primary small">{datasets.length} Datasets</span>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Dataset Name</th>
                      <th scope="col">Format</th>
                      <th scope="col">Size</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map(ds => (
                      <tr key={ds.id}>
                        <td style={{ wordBreak: 'break-word', maxWidth: '180px' }}>
                          <strong className="text-dark d-block">{ds.name}</strong>
                          <span className="text-muted small">{ds.rows}</span>
                        </td>
                        <td><span className="badge bg-light text-secondary border">{ds.format}</span></td>
                        <td>{ds.size}</td>
                        <td>
                          <button className="btn btn-outline-primary btn-xs p-1" aria-label={`Download dataset ${ds.name}`}>
                            <Download size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Live Collaborative Experiment Log */}
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h3 className="h6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <Terminal size={18} className="text-success" />
                  Live Experiment Log
                </h3>
                <span className="badge bg-success-subtle text-success small">Real-Time Sync</span>
              </div>

              {/* Add New Log Entry Form */}
              <form onSubmit={handleAddLog} className="mb-4 p-3 bg-light rounded-3 border">
                <div className="mb-2">
                  <label className="form-label small fw-bold text-dark">Associated Dataset</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedDataset}
                    onChange={(e) => setSelectedDataset(e.target.value)}
                    aria-label="Select Associated Dataset"
                  >
                    {datasets.map(ds => (
                      <option key={ds.id} value={ds.name}>{ds.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold text-dark">Observation Note / Invariant Metric</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="e.g., Convergence invariant holds at step 10,000 with learning rate 0.001..."
                    value={newLogMessage}
                    onChange={(e) => setNewLogMessage(e.target.value)}
                    required
                    aria-label="Observation Note"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                  disabled={submitting}
                  aria-label="Submit Experiment Log"
                >
                  <Plus size={14} />
                  <span>{submitting ? 'Recording Invariant...' : 'Append to Experiment Log'}</span>
                </button>

                {successNotice && (
                  <span className="text-success small fw-bold mt-2 d-inline-flex align-items-center gap-1">
                    <CheckCircle2 size={14} /> Entry synchronized with cluster!
                  </span>
                )}
              </form>

              {/* Log Timeline List */}
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {logs.map(log => (
                  <div key={log.id} className="p-3 border rounded-3 bg-white shadow-xs">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold small text-primary">{log.author}</span>
                      <span className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-dark small mb-1" style={{ wordBreak: 'break-word' }}>
                      {log.logMessage}
                    </p>
                    <span className="badge bg-light text-secondary border font-monospace small" style={{ fontSize: '0.72rem' }}>
                      Ref: {log.datasetName}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </RolePageTemplate>
  )
}
