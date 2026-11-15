import React from "react";
import { AlertCircle } from "lucide-react";

export default function CalendarActionModals({
  showAdjustModal,
  setShowAdjustModal,
  adjustForm,
  setAdjustForm,
  handleAdjustSubmit,
  isAdjusting,
  showOptionalModal,
  setShowOptionalModal,
  optionalForm,
  setOptionalForm,
  handleDeclareOptionalHoliday,
}) {
  return (
    <>
      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Adjust Academic Schedule</h5>
                <button type="button" className="btn-close" onClick={() => setShowAdjustModal(false)}></button>
              </div>
              <form onSubmit={handleAdjustSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Adjustment Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={adjustForm.adjustmentType}
                      onChange={(e) => setAdjustForm({ ...adjustForm, adjustmentType: e.target.value })}
                    >
                      <option value="POSTPONE_EXAM">Postpone Examination Window</option>
                      <option value="EXTEND_VACATION">Extend Vacation / Unscheduled Closure</option>
                      <option value="REDUCE_VACATION">Add Remedial Teaching Days</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">New Proposed Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={adjustForm.newStartDate}
                      onChange={(e) => setAdjustForm({ ...adjustForm, newStartDate: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Official Justification</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="e.g. State government declaration of local festival / severe weather alert"
                      required
                      value={adjustForm.reason}
                      onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    />
                  </div>
                  <div className="alert alert-info py-2 small mb-0">
                    <AlertCircle size={14} className="me-1" /> Downstream exam milestones and teaching day minimums will auto-recalculate.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Apply Adjustment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Declare Optional Holiday Modal */}
      {showOptionalModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0" style={{ background: 'var(--app-card-bg, #ffffff)', color: 'var(--app-text, #1e293b)' }}>
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Declare Optional / Restricted Holiday</h5>
                  <div className="small text-muted">Declare state-specific or institutional cultural observances (RH).</div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowOptionalModal(false)}></button>
              </div>
              <form onSubmit={handleDeclareOptionalHoliday}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Holiday Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Varalakshmi Vratam, Local Temple Jathra, Founder Day"
                      value={optionalForm.name}
                      onChange={(e) => setOptionalForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Date *</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={optionalForm.date}
                        onChange={(e) => setOptionalForm((p) => ({ ...p, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Applicable State / Scope</label>
                      <select
                        className="form-select form-select-sm"
                        value={optionalForm.stateCode}
                        onChange={(e) => setOptionalForm((p) => ({ ...p, stateCode: e.target.value }))}
                      >
                        <option value="ALL">All Campuses</option>
                        <option value="KA">Karnataka (Bengaluru/Mysuru)</option>
                        <option value="TS">Telangana (Hyderabad)</option>
                        <option value="AP">Andhra Pradesh</option>
                        <option value="MH">Maharashtra</option>
                        <option value="TN">Tamil Nadu</option>
                        <option value="DL">Delhi NCR</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Applicability</label>
                    <select
                      className="form-select form-select-sm"
                      value={optionalForm.applicableTo}
                      onChange={(e) => setOptionalForm((p) => ({ ...p, applicableTo: e.target.value }))}
                    >
                      <option value="ALL">All Staff &amp; Students</option>
                      <option value="FACULTY">Faculty &amp; Non-Teaching Staff Only</option>
                      <option value="STUDENTS">Students Only (Classes Suspended)</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-bold">Reason / Official Reference</label>
                    <textarea
                      rows={2}
                      className="form-control form-control-sm"
                      placeholder="e.g. State Government N.I. Act Optional Holiday Gazette Notification"
                      value={optionalForm.reason}
                      onChange={(e) => setOptionalForm((p) => ({ ...p, reason: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowOptionalModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary px-3">
                    Declare Holiday
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
