import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import ConfirmationModal from '../../components/ConfirmationModal'
import SkeletonLoader from '../../components/SkeletonLoader'
import { exportToCSV } from '../../utils/exportToCSV'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import apiClient from '../../services/apiClient'

const PURPLE = '#7C3AED'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const BLUE = '#2563EB'

export default function Page() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [search, setSearch] = useState('')
  const [streamFilter, setStreamFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', roll: '', section: 'MPC-A', stream: 'MPC', year: 1, contact: '' })

  const { clearDraft } = useAutoSave('admin_student_form', form, setForm)

  const fetchStudents = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const res = await apiClient.get('/admin/students')
      const data = res.data?.data || res.data?.students || (Array.isArray(res.data) ? res.data : [])
      setStudents(data.map(s => ({
        id: s.id || `S00${Math.random()}`,
        name: s.name || s.full_name || 'Student',
        roll: s.roll || s.roll_number || 'ROLL001',
        section: s.section || 'SEC-A',
        stream: s.stream || s.department_code || 'MPC',
        year: s.year || 1,
        contact: s.contact || s.phone || '9876543210'
      })))
    } catch (err) {
      console.error('[StudentManagement] Fetch error:', err)
      setApiError(err.response?.data?.error || err.message || 'Failed to load students directory from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  async function handleCreate(e) {
    if (e?.preventDefault) e.preventDefault()
    setFormError('')

    const cleanPhone = String(form.contact).replace(/\D/g, '')
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian parent contact number starting with 6, 7, 8, or 9.')
      return
    }

    if (students.some(s => s.roll?.trim().toUpperCase() === form.roll?.trim().toUpperCase())) {
      setFormError(`Roll number ${form.roll.toUpperCase()} is already assigned to an enrolled student.`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await apiClient.post('/admin/students', {
        name: form.name.trim(),
        roll: form.roll.trim(),
        stream: form.stream,
        year: form.year,
        phone: cleanPhone
      })

      const newStudent = res.data?.student || {
        ...form,
        contact: cleanPhone,
        id: `S00${students.length + 1}`
      }

      setStudents(prev => [...prev, {
        id: newStudent.id,
        name: newStudent.name,
        roll: newStudent.roll,
        section: form.section,
        stream: newStudent.stream || form.stream,
        year: newStudent.year || form.year,
        contact: cleanPhone
      }])

      setShowForm(false)
      setForm({ name: '', roll: '', section: 'MPC-A', stream: 'MPC', year: 1, contact: '' })
      clearDraft()
    } catch (err) {
      console.error('[StudentManagement] Create error:', err)
      setFormError(err.response?.data?.error || err.message || 'Failed to create student on server')
    } finally {
      setIsSubmitting(false)
    }
  }

  useKeyboardShortcuts({
    onNew: () => setShowForm(true),
    onSubmit: handleCreate,
    onEscape: () => {
      setShowForm(false)
      setDeleteModalOpen(false)
    }
  })

  async function handleDelete(id) {
    try {
      await apiClient.delete(`/admin/students/${id}`)
    } catch (err) {
      console.warn('[StudentManagement] Delete API warning:', err.message)
    }
    setStudents(prev => prev.filter(s => s.id !== id))
    setSelectedIds(prev => prev.filter(item => item !== id))
    setDeleteModalOpen(false)
    setDeleteTarget(null)
  }

  async function handleBulkDelete() {
    for (const id of selectedIds) {
      try {
        await apiClient.delete(`/admin/students/${id}`)
      } catch (err) {
        console.warn(`[StudentManagement] Bulk delete student ${id}:`, err.message)
      }
    }
    setStudents(prev => prev.filter(s => !selectedIds.includes(s.id)))
    setSelectedIds([])
    setDeleteModalOpen(false)
    setDeleteTarget(null)
  }

  function handleExportCsv() {
    const exportData = filtered.map(s => ({
      'Student ID': s.id,
      'Full Name': s.name,
      'Roll Number': s.roll,
      'Section': s.section,
      'Stream': s.stream,
      'Year': `Year ${s.year}`,
      'Parent Contact': s.contact
    }))
    exportToCSV(exportData, `Students_Directory_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const filtered = students.filter(s => {
    const sName = s.name || ''
    const sRoll = s.roll || ''
    const sContact = s.contact || ''
    const matchesSearch = sName.toLowerCase().includes(search.toLowerCase()) || 
                          sRoll.toLowerCase().includes(search.toLowerCase()) ||
                          sContact.includes(search)
    const matchesStream = streamFilter === 'ALL' || s.stream === streamFilter
    return matchesSearch && matchesStream
  })

  return (
    <RolePageTemplate role="Admin" title="Student Management" description="Register new students, assign streams, group classrooms, and maintain directories.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {apiError && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3" role="alert" data-testid="student-api-error">
            <div>⚠️ {apiError}</div>
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchStudents}>Retry</button>
          </div>
        )}

        {/* Dynamic counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Total Enrollment', value: students.length, color: PURPLE, icon: '👨‍🎓' },
            { label: 'MPC Stream', value: students.filter(s => s.stream === 'MPC').length, color: BLUE, icon: '📐' },
            { label: 'BIPC Stream', value: students.filter(s => s.stream === 'BIPC').length, color: GREEN, icon: '🧬' },
            { label: 'MBIPC Stream', value: students.filter(s => s.stream === 'MBIPC').length, color: AMBER, icon: '🔬' },
          ].map(c => (
            <div key={c.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', borderLeft: `4px solid ${c.color}` }}>
              <div className="card-body p-3">
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{c.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions bar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 260 }}>
            <input
              type="text"
              aria-label="Search students"
              className="form-control"
              placeholder="Search by name, roll number, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: '0.75rem' }}
            />
            <select
              aria-label="Filter by stream"
              className="form-select"
              value={streamFilter}
              onChange={e => setStreamFilter(e.target.value)}
              style={{ maxWidth: 140, borderRadius: '0.75rem' }}
            >
              <option value="ALL">All Streams</option>
              <option value="MPC">MPC</option>
              <option value="BIPC">BIPC</option>
              <option value="MBIPC">MBIPC</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => {
                  setDeleteTarget({ isBulk: true, count: selectedIds.length })
                  setDeleteModalOpen(true)
                }}
                style={{ fontWeight: 700, borderRadius: '0.75rem' }}
              >
                🗑️ Dismiss Selected ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleExportCsv}
              style={{ fontWeight: 600, borderRadius: '0.75rem' }}
            >
              📥 Export CSV
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              style={{ fontWeight: 700, borderRadius: '0.75rem' }}
              data-testid="enroll-student-btn"
            >
              + Enroll Student
            </button>
          </div>
        </div>

        {/* Inline enrollment modal */}
        {showForm && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', border: `2px dashed ${PURPLE}50` }} data-testid="student-form-card">
            <div className="card-body p-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Enroll New Student Profile</h2>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
              </div>

              {formError && (
                <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '0.82rem', borderRadius: '0.5rem' }} data-testid="student-form-error">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem' }} data-testid="create-student-form">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label htmlFor="student-full-name" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>STUDENT FULL NAME *</label>
                    <input
                      id="student-full-name"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Aditi Sharma"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="student-roll-number" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>ROLL NUMBER *</label>
                    <input
                      id="student-roll-number"
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2024MPC042"
                      required
                      value={form.roll}
                      onChange={e => setForm(p => ({ ...p, roll: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="student-stream" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>STREAM *</label>
                    <select
                      id="student-stream"
                      className="form-select"
                      value={form.stream}
                      onChange={e => setForm(p => ({ ...p, stream: e.target.value, section: `${e.target.value}-A` }))}
                    >
                      <option value="MPC">MPC (Maths, Physics, Chem)</option>
                      <option value="BIPC">BIPC (Biology, Physics, Chem)</option>
                      <option value="MBIPC">MBIPC (Maths + Bio integrated)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="student-section" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>ASSIGNED SECTION</label>
                    <input
                      id="student-section"
                      type="text"
                      className="form-control"
                      value={form.section}
                      onChange={e => setForm(p => ({ ...p, section: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="student-year" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>ACADEMIC YEAR</label>
                    <select
                      id="student-year"
                      className="form-select"
                      value={form.year}
                      onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))}
                    >
                      <option value={1}>1st Year (Junior Intermediate)</option>
                      <option value={2}>2nd Year (Senior Intermediate)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="student-parent-contact" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>PARENT WHATSAPP / MOBILE *</label>
                    <input
                      id="student-parent-contact"
                      type="tel"
                      className="form-control"
                      placeholder="10-digit mobile (e.g. 9876543210)"
                      required
                      value={form.contact}
                      onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : '💾 Register & Enroll Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Directory table */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div className="table-responsive">
            {loading ? (
              <div className="p-4" data-testid="students-loading">
                <SkeletonLoader variant="table" rows={5} />
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0" data-testid="students-table">
                <thead style={{ background: 'var(--surface-bg, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        aria-label="Select all students"
                        className="form-check-input"
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filtered.map(s => s.id))
                          } else {
                            setSelectedIds([])
                          }
                        }}
                      />
                    </th>
                    {['Student ID', 'Full Name', 'Roll Number', 'Section', 'Stream', 'Year', 'Parent Contact', 'Action'].map(h => (
                      <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-5 text-muted" data-testid="empty-students">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                        <div className="fw-semibold">No students found</div>
                        <div className="small">Try adjusting your search query or stream filter.</div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => {
                      const isSelected = selectedIds.includes(s.id)
                      return (
                        <tr key={s.id} className={isSelected ? 'table-active' : ''} data-testid={`student-row-${s.id}`}>
                          <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                            <input
                              type="checkbox"
                              aria-label={`Select ${s.name}`}
                              className="form-check-input"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(prev => [...prev, s.id])
                                } else {
                                  setSelectedIds(prev => prev.filter(id => id !== s.id))
                                }
                              }}
                            />
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>{s.id}</td>
                          <td style={{ fontSize: '0.875rem', fontWeight: 700 }}>{s.name}</td>
                          <td style={{ fontSize: '0.875rem', fontWeight: 600, color: BLUE }}>{s.roll}</td>
                          <td><span className="badge text-bg-light" style={{ border: '1px solid var(--border-color)' }}>{s.section}</span></td>
                          <td><span className="badge text-bg-secondary">{s.stream}</span></td>
                          <td style={{ fontWeight: 700 }}>Year {s.year}</td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>📞 {s.contact}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setDeleteTarget({ isBulk: false, id: s.id, name: s.name })
                                setDeleteModalOpen(true)
                              }}
                              style={{ fontSize: '0.72rem' }}
                              title="Dismiss student profile"
                            >
                              Dismiss 🗑️
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title={deleteTarget?.isBulk ? 'Confirm Bulk Dismissal' : 'Dismiss Student'}
          message={
            deleteTarget?.isBulk
              ? `Are you sure you want to dismiss ${deleteTarget.count} selected students? This action will remove them from the active semester roster.`
              : `Are you sure you want to dismiss student "${deleteTarget?.name}"?`
          }
          confirmText="Yes, Dismiss"
          cancelText="Cancel"
          onConfirm={() => {
            if (deleteTarget?.isBulk) {
              handleBulkDelete()
            } else if (deleteTarget?.id) {
              handleDelete(deleteTarget.id)
            }
          }}
          onCancel={() => {
            setDeleteModalOpen(false)
            setDeleteTarget(null)
          }}
        />

      </div>
    </RolePageTemplate>
  )
}
