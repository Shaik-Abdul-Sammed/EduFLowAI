import { useEffect, useState } from 'react'
import {
  createBackupSnapshot,
  exportBackupSnapshot,
  getBackupSnapshots,
  getBackupStatus,
  restoreBackupSnapshot,
} from '../../services/backupService'

function MetricCard({ label, value }) {
  return (
    <div className="border rounded-4 p-3 bg-body-tertiary h-100">
      <div className="text-uppercase text-body-secondary small">{label}</div>
      <div className="fs-3 fw-bold">{value}</div>
    </div>
  )
}

export default function Page() {
  const [status, setStatus] = useState(null)
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function refresh() {
    const [nextStatus, nextSnapshots] = await Promise.all([
      getBackupStatus(),
      getBackupSnapshots(),
    ])

    setStatus(nextStatus)
    setSnapshots(nextSnapshots)
  }

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        await refresh()
      } catch (err) {
          if (active) setMessage('Backup service is unavailable in this environment.')
          console.error(err)
        } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  async function handleSnapshot() {
    try {
      const snapshot = await createBackupSnapshot('manual backup from admin portal')
      setMessage(`Created snapshot ${snapshot?.id ?? 'unknown'}`)
      await refresh()
    } catch (err) {
      setMessage(`Snapshot failed: ${err.message || 'Unknown error'}`)
    }
  }

  async function handleExport(snapshotId) {
    try {
      const payload = await exportBackupSnapshot(snapshotId)
      setMessage(`Prepared export for ${payload?.snapshot?.id ?? snapshotId}`)
    } catch (err) {
      setMessage(`Export failed: ${err.message || 'Unknown error'}`)
    }
  }

  async function handlePreviewRestore(snapshotId) {
    try {
      const result = await restoreBackupSnapshot(snapshotId, 'preview')
      setMessage(`Preview restore ready for ${result.snapshotId} (${result.restored} records)`)
    } catch (err) {
      setMessage(`Restore preview failed: ${err.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="container py-4 page-shell">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4 p-md-5 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
          <div>
            <p className="text-uppercase small fw-semibold text-primary mb-2">Admin Utilities</p>
            <h1 className="h3 mb-2">Backup Management</h1>
            <p className="text-muted mb-0">Snapshot search metadata, export recovery files, and preview restore points.</p>
          </div>
          <button className="btn btn-dark" type="button" onClick={handleSnapshot}>
            Create Snapshot
          </button>
        </div>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading backup metadata...</div>
      ) : null}

      {message ? <div className="alert alert-secondary">{message}</div> : null}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <MetricCard label="Snapshots" value={status?.snapshotCount ?? 0} />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard label="Source Rows" value={status?.rowCount ?? 0} />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard label="Retention" value={status?.retentionLimit ?? 10} />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard label="Health" value={status?.healthy ? 'OK' : 'Unknown'} />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className="h5 mb-0">Snapshot History</h2>
            <span className="badge text-bg-secondary">{snapshots.length} items</span>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Snapshot</th>
                  <th>Records</th>
                  <th>Checksum</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.length > 0 ? snapshots.map((snapshot) => (
                  <tr key={snapshot.id}>
                    <td>{snapshot.id}</td>
                    <td>{snapshot.recordCount}</td>
                    <td>{snapshot.checksum}</td>
                    <td>{new Date(snapshot.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end flex-wrap">
                        <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => handleExport(snapshot.id)}>
                          Export
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => handlePreviewRestore(snapshot.id)}>
                          Preview Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-muted">No snapshots yet. Create one to capture the current portal state.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}