import { useState, useRef } from 'react'
import { Upload, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

/**
 * BulkStudentImportPage
 * Admin page to bulk-import students from a CSV file.
 * CSV format: rollNumber,firstName,lastName,email,dob,department,program,semester,batch,institutionId
 */
export default function BulkStudentImportPage() {
  const [file, setFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState([]) // per-batch results
  const [totalInserted, setTotalInserted] = useState(0)
  const [totalFailed, setTotalFailed] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const fileRef = useRef(null)

  const BATCH_SIZE = 500

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    if (!f.name.endsWith('.csv')) {
      setError('Only .csv files are supported.')
      return
    }
    setFile(f)
    setError('')
    setDone(false)
    setResults([])
    setTotalInserted(0)
    setTotalFailed(0)
    setProgress(0)
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'))
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'))
      const obj = {}
      headers.forEach((h, i) => { obj[h] = values[i] || '' })
      return obj
    }).filter(r => r.rollNumber || r.roll_number)
  }

  async function handleUpload() {
    if (!file) { setError('Please select a CSV file first.'); return }
    setUploading(true)
    setParsing(true)
    setError('')
    setResults([])
    setTotalInserted(0)
    setTotalFailed(0)
    setDone(false)

    const text = await file.text()
    const rows = parseCSV(text)
    setParsing(false)

    if (rows.length === 0) {
      setError('No valid student rows found in the CSV. Check the header row.')
      setUploading(false)
      return
    }

    // Chunk into batches of BATCH_SIZE
    const batches = []
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      batches.push(rows.slice(i, i + BATCH_SIZE))
    }

    let inserted = 0
    let failed = 0
    const batchResults = []

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      try {
        const token = localStorage.getItem('token') || ''
        const res = await fetch(`${getApiBaseURL()}/v1/auth/bulk-student-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ students: batch, institutionId: batch[0]?.institutionId || 1 }),
        })
        const data = await safeJson(res)
        const batchInserted = data?.inserted ?? (res.ok ? batch.length : 0)
        const batchFailed = data?.failed ?? (res.ok ? 0 : batch.length)
        inserted += batchInserted
        failed += batchFailed
        batchResults.push({
          batchNum: i + 1,
          count: batch.length,
          inserted: batchInserted,
          failed: batchFailed,
          ok: res.ok,
          message: data?.message || (res.ok ? 'Success' : 'Error'),
        })
      } catch (err) {
        failed += batch.length
        batchResults.push({
          batchNum: i + 1,
          count: batch.length,
          inserted: 0,
          failed: batch.length,
          ok: false,
          message: err.message,
        })
      }
      setProgress(Math.round(((i + 1) / batches.length) * 100))
      setResults([...batchResults])
      setTotalInserted(inserted)
      setTotalFailed(failed)
    }

    setUploading(false)
    setDone(true)
  }

  const csvTemplate = [
    'rollNumber,firstName,lastName,email,dob,department,program,semester,batch,institutionId',
    '2024-CSE-001,Aarav,Sharma,aarav@college.edu,15082004,Computer Science,B.Tech,1,2024,1',
    '2024-ECE-002,Priya,Patel,priya@college.edu,22112004,Electronics,B.Tech,1,2024,1',
  ].join('\n')

  function downloadTemplate() {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <RolePageTemplate role="Admin" title="Bulk Student Import" icon={<Users size={22} />}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 8px' }}>
        {/* Instructions */}
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10,
          padding: '14px 18px', marginBottom: 20
        }}>
          <p style={{ margin: 0, fontSize: 14, color: '#0369a1', fontWeight: 600 }}>
            CSV Format
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#0c4a6e', wordBreak: 'break-word' }}>
            Required columns: <code>rollNumber, firstName, lastName, email, dob (DDMMYYYY), department, program, semester, batch, institutionId</code>
          </p>
          <button
            onClick={downloadTemplate}
            style={{
              marginTop: 10, background: '#0ea5e9', color: '#fff', border: 'none',
              borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
            }}
          >
            Download Template CSV
          </button>
        </div>

        {/* File Upload Area */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #94a3b8', borderRadius: 12, padding: '36px 20px',
            textAlign: 'center', cursor: 'pointer', background: file ? '#f0fdf4' : '#f8fafc',
            marginBottom: 20, transition: 'background 0.2s',
          }}
          role="button"
          tabIndex={0}
          aria-label="Click to select a CSV file"
          onKeyDown={e => e.key === 'Enter' && (file ? handleUpload() : fileRef.current?.click())}
        >
          <Upload size={36} color="#64748b" style={{ marginBottom: 10 }} />
          {file
            ? <p style={{ margin: 0, color: '#16a34a', fontWeight: 600 }}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
            : <p style={{ margin: 0, color: '#64748b' }}>Click to select a <strong>.csv</strong> file (up to 10,000 students)</p>
          }
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            data-testid="csv-file-input"
          />
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
            padding: '10px 14px', marginBottom: 16, color: '#b91c1c', display: 'flex',
            alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <XCircle size={16} /> {error}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            background: uploading ? '#94a3b8' : '#6366f1', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 28px', fontSize: 15, fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer', width: '100%', marginBottom: 20,
          }}
          aria-label="Upload students CSV"
          data-testid="upload-btn"
        >
          {parsing ? 'Parsing CSV...' : uploading ? `Uploading… ${progress}%` : 'Upload & Import Students'}
        </button>

        {/* Progress Bar */}
        {uploading && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ background: '#e2e8f0', borderRadius: 999, height: 10, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progress}%`, height: '100%', background: '#6366f1',
                  transition: 'width 0.3s ease', borderRadius: 999,
                }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
                aria-label={`Upload progress ${progress}%`}
              />
            </div>
            <p style={{ textAlign: 'center', marginTop: 6, color: '#475569', fontSize: 13 }}>
              {progress}% complete
            </p>
          </div>
        )}

        {/* Summary */}
        {done && (
          <div style={{
            background: totalFailed === 0 ? '#f0fdf4' : '#fff7ed',
            border: `1px solid ${totalFailed === 0 ? '#86efac' : '#fed7aa'}`,
            borderRadius: 10, padding: '14px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            {totalFailed === 0
              ? <CheckCircle size={22} color="#16a34a" />
              : <AlertCircle size={22} color="#ea580c" />
            }
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                Import Complete
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569' }}>
                ✅ {totalInserted} students inserted &nbsp;|&nbsp; ❌ {totalFailed} failed
              </p>
            </div>
          </div>
        )}

        {/* Batch Results Table */}
        {results.length > 0 && (
          <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={th}>Batch #</th>
                  <th style={th}>Records</th>
                  <th style={th}>Inserted</th>
                  <th style={th}>Failed</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.batchNum} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={td}>{r.batchNum}</td>
                    <td style={td}>{r.count}</td>
                    <td style={{ ...td, color: '#16a34a', fontWeight: 600 }}>{r.inserted}</td>
                    <td style={{ ...td, color: r.failed > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{r.failed}</td>
                    <td style={td}>
                      {r.ok
                        ? <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={13} /> {r.message}</span>
                        : <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={13} /> {r.message}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}

const th = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#374151',
  borderBottom: '2px solid #e2e8f0',
  whiteSpace: 'nowrap',
}

const td = {
  padding: '9px 12px',
  color: '#1e293b',
  wordBreak: 'break-word',
}
