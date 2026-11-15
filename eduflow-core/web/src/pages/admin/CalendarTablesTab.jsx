import React, { useState } from "react";
import { Plus, Trash2, CalendarCheck, Clock, ShieldAlert, Sparkles, AlertCircle, Search } from "lucide-react";

export default function CalendarTablesTab({
  activeTab,
  events,
  holidays,
  adjustments,
  customOptionalHolidays,
  setCustomOptionalHolidays,
  addToast,
  setShowAdjustModal,
  setAdjustForm,
  setShowOptionalModal,
  setOptionalForm,
  yStart = 2026,
  selectedState = 'AP',
}) {
  const [holidayFilter, setHolidayFilter] = useState('ALL');
  const [holidaySearchQuery, setHolidaySearchQuery] = useState('');
  return (
    <>
      {activeTab === 'events' && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Milestone Name</th>
                    <th>Type</th>
                    <th>Date Window</th>
                    <th>Mandatory</th>
                    <th>Affected</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {events.map((e) => (
                    <tr key={e.id}>
                      <td className="fw-semibold text-dark">{e.name}</td>
                      <td>
                        <span className={`badge ${e.event_type === 'EXAM' ? 'bg-danger-subtle text-danger' : e.event_type === 'VACATION' ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'}`}>
                          {e.event_type}
                        </span>
                      </td>
                      <td>{e.start_date} {e.end_date ? `to ${e.end_date}` : ''}</td>
                      <td>{e.is_mandatory ? <CheckCircle2 size={16} className="text-success" /> : 'Optional'}</td>
                      <td className="text-muted">All Departments</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'holidays' && (
            <div>
              {/* Toolbar */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-3 border-bottom">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <button
                    type="button"
                    className={`btn btn-sm ${holidayFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setHolidayFilter('ALL')}
                  >
                    All Holidays ({holidays.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${holidayFilter === 'PUBLIC' ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => setHolidayFilter('PUBLIC')}
                  >
                    🏛️ Public &amp; Gazetted ({holidays.filter(h => h.category !== 'OPTIONAL' && h.type !== 'OPTIONAL_RESTRICTED' && h.type !== 'OPTIONAL' && h.type !== 'DECLARED_OPTIONAL').length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${holidayFilter === 'OPTIONAL' ? 'btn-warning' : 'btn-outline-secondary'}`}
                    onClick={() => setHolidayFilter('OPTIONAL')}
                  >
                    ⭐ Optional &amp; Restricted ({holidays.filter(h => h.category === 'OPTIONAL' || h.type === 'OPTIONAL_RESTRICTED' || h.type === 'OPTIONAL' || h.type === 'DECLARED_OPTIONAL').length})
                  </button>
                </div>

                <div className="d-flex gap-2 align-items-center">
                  <div className="position-relative" style={{ minWidth: '220px' }}>
                    <Search size={14} className="position-absolute text-muted" style={{ left: '10px', top: '10px' }} />
                    <input
                      type="text"
                      className="form-control form-control-sm ps-4"
                      placeholder="Search holiday or date..."
                      value={holidaySearchQuery}
                      onChange={(e) => setHolidaySearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 text-nowrap shadow-sm"
                    onClick={() => {
                      setOptionalForm({
                        name: '',
                        date: `${yStart}-08-25`,
                        reason: '',
                        stateCode: selectedState || 'ALL',
                        applicableTo: 'ALL',
                      })
                      setShowOptionalModal(true)
                    }}
                  >
                    <Plus size={14} /> Declare Optional Holiday
                  </button>
                </div>
              </div>

              {/* Holidays Table */}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Holiday / Festival</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Scope / State</th>
                      <th>Compliance Authority</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {holidays
                      .filter((h) => {
                        const isOpt = h.category === 'OPTIONAL' || h.type === 'OPTIONAL_RESTRICTED' || h.type === 'OPTIONAL' || h.type === 'DECLARED_OPTIONAL'
                        if (holidayFilter === 'PUBLIC' && isOpt) return false
                        if (holidayFilter === 'OPTIONAL' && !isOpt) return false
                        if (holidaySearchQuery.trim()) {
                          const q = holidaySearchQuery.toLowerCase()
                          const matchName = String(h.name || '').toLowerCase().includes(q)
                          const matchDate = String(h.date || '').toLowerCase().includes(q)
                          const matchState = String(h.state_code || '').toLowerCase().includes(q)
                          return matchName || matchDate || matchState
                        }
                        return true
                      })
                      .map((h, i) => {
                        const isOpt = h.category === 'OPTIONAL' || h.type === 'OPTIONAL_RESTRICTED' || h.type === 'OPTIONAL' || h.type === 'DECLARED_OPTIONAL'
                        return (
                          <tr key={h.id || `${h.name}-${h.date}-${i}`}>
                            <td>
                              <div className="fw-semibold text-dark d-flex align-items-center gap-2">
                                <span>{isOpt ? '⭐' : '🏛️'}</span>
                                <span>{h.name}</span>
                                {h.isCustom && (
                                  <span className="badge bg-info-subtle text-info border border-info-subtle" style={{ fontSize: '0.65rem' }}>
                                    Custom Declared
                                  </span>
                                )}
                              </div>
                              {h.reason && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{h.reason}</div>}
                            </td>
                            <td>
                              <span className="fw-medium text-dark">{h.date}</span>
                              {h.end_date && <span className="text-muted small"> to {h.end_date}</span>}
                            </td>
                            <td>
                              <span className={`badge ${
                                isOpt
                                  ? 'bg-warning-subtle text-warning border border-warning-subtle'
                                  : h.type === 'NATIONAL_HOLIDAY'
                                  ? 'bg-danger-subtle text-danger border border-danger-subtle'
                                  : h.type === 'CENTRAL_GAZETTED' || h.type === 'GAZETTED'
                                  ? 'bg-primary-subtle text-primary border border-primary-subtle'
                                  : 'bg-success-subtle text-success border border-success-subtle'
                              }`}>
                                {isOpt ? 'OPTIONAL / RESTRICTED' : h.type || 'PUBLIC GAZETTED'}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary">
                                {h.state_code === 'ALL' ? 'All India (Central)' : `State: ${h.state_code}`}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {h.isCustom ? 'Institution Statutory Declaration' : 'Official Government Gazette / Almanac'}
                            </td>
                            <td className="text-end">
                              {h.isCustom && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger p-1"
                                  onClick={() => handleDeleteCustomHoliday(h.id)}
                                  title="Remove declared optional holiday"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'adjustments' && (
            <div>
              {adjustments.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No adjustments made yet. Use &ldquo;Adjust Schedule&rdquo; to postpone exams or modify vacation periods.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-uppercase">
                      <tr>
                        <th>Adjustment Type</th>
                        <th>Reason</th>
                        <th>New Effective Date</th>
                        <th>Recorded At</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {adjustments.map((adj) => (
                        <tr key={adj.id}>
                          <td className="fw-semibold text-primary">{adj.adjustment_type}</td>
                          <td>{adj.reason}</td>
                          <td>{adj.new_start_date || 'N/A'}</td>
                          <td className="text-muted">{adj.adjusted_at ? new Date(adj.adjusted_at).toLocaleDateString() : 'Recent'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
    </>
  );
}
