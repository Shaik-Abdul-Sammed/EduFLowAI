import React, { useMemo } from 'react';
import {
  X,
  Eye,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { generateAcademicCalendarClientPdfBlob } from '../../services/calendar/AcademicCalendarClientPdfBuilder';
import {
  getOddSemesterGrid,
  getEvenSemesterGrid,
  getOddHolidaysList,
  getEvenHolidaysList,
  STATE_NAMES
} from '../../utils/calendarMatrixGenerator';

export default function CalendarPreviewExportModals({
  showPreviewCalendarModal,
  setShowPreviewCalendarModal,
  showExportModal,
  setShowExportModal,
  previewModalTab,
  setPreviewModalTab,
  selectedYear,
  selectedState,
  currentStateName,
  dynamicSummary,
  exportState,
  setExportState,
  exportYear,
  setExportYear,
  exportProgram,
  setExportProgram,
  exportFormat,
  setExportFormat,
  isExporting,
  handleExportPdf
}) {
  const oddSemesterGrid = useMemo(() => getOddSemesterGrid(selectedYear), [selectedYear]);
  const evenSemesterGrid = useMemo(() => getEvenSemesterGrid(selectedYear), [selectedYear]);
  const oddHolidaysList = useMemo(() => getOddHolidaysList(selectedYear, selectedState), [selectedYear, selectedState]);
  const evenHolidaysList = useMemo(() => getEvenHolidaysList(selectedYear, selectedState), [selectedYear, selectedState]);

  const previewPdfUrl = useMemo(() => {
    try {
      const blob = generateAcademicCalendarClientPdfBlob({
        academicYear: selectedYear,
        stateCode: selectedState,
        program: 'B.Tech (E1 to E4)',
        format: exportFormat,
      });
      return window.URL.createObjectURL(blob);
    } catch {
      return '/Academic_Calendar_2026_27_E1_to_E4.pdf';
    }
  }, [selectedYear, selectedState, exportFormat]);

  return (
    <>
      {/* Preview Calendar Modal */}
      {showPreviewCalendarModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(5px)',
            padding: '1rem',
          }}
        >
          <div
            className="card border-0 shadow-lg"
            style={{
              width: '100%',
              maxWidth: '960px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '1.25rem',
              background: 'var(--card-bg, #0f172a)',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
              color: 'var(--app-text, #f8fafc)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Eye size={20} className="text-primary" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    Academic Calendar of A.Y:{selectedYear} from E1 to E4
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                    RGUKT Institutional Matrix Format • {currentStateName} • UGC &amp; AICTE Statutory Regulatory Standards
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleExportPdf()}
                  className="btn btn-sm btn-success d-inline-flex align-items-center gap-1 shadow-sm"
                  style={{ fontWeight: 600, fontSize: '0.8rem' }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewCalendarModal(false)}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0 }}
                  aria-label="Close Preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sub-Header Tabs */}
            <div
              style={{
                padding: '0.6rem 1.5rem',
                background: 'rgba(0, 0, 0, 0.15)',
                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewModalTab('summary')}
                className={`btn btn-sm ${previewModalTab === 'summary' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                Executive Gazette Summary
              </button>
              <button
                type="button"
                onClick={() => setPreviewModalTab('odd')}
                className={`btn btn-sm ${previewModalTab === 'odd' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                Odd Semester Grid
              </button>
              <button
                type="button"
                onClick={() => setPreviewModalTab('even')}
                className={`btn btn-sm ${previewModalTab === 'even' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                Even Semester Grid
              </button>
              <button
                type="button"
                onClick={() => setPreviewModalTab('pdf')}
                className={`btn btn-sm ${previewModalTab === 'pdf' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                PDF View
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {previewModalTab === 'summary' && (
                <div>
                  <div className="table-responsive">
                    <table className="table table-bordered text-center align-middle" style={{ borderColor: '#334155', color: '#f8fafc' }}>
                      <thead style={{ background: '#1e293b' }}>
                        <tr>
                          <th style={{ width: '28%' }}>Odd Semester</th>
                          <th style={{ width: '44%' }}>Activities</th>
                          <th style={{ width: '28%' }}>Even Semester</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dynamicSummary.map((row, idx) => (
                          <tr key={idx} style={{ fontWeight: row.isBold ? 700 : 400 }}>
                            <td>{row.odd}</td>
                            <td>{row.activity}</td>
                            <td>{row.even}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {previewModalTab === 'odd' && (
                <div className="table-responsive">
                  <table className="table table-bordered table-sm text-center" style={{ borderColor: '#334155', color: '#f8fafc' }}>
                    <thead style={{ background: '#1e293b' }}>
                      <tr>
                        <th>Week</th>
                        <th>Dates</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {oddSemesterGrid.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.week}</td>
                          <td>{row.dates}</td>
                          <td>{row.mon}</td>
                          <td>{row.tue}</td>
                          <td>{row.wed}</td>
                          <td>{row.thu}</td>
                          <td>{row.fri}</td>
                          <td>{row.sat}</td>
                          <td>{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {previewModalTab === 'even' && (
                <div className="table-responsive">
                  <table className="table table-bordered table-sm text-center" style={{ borderColor: '#334155', color: '#f8fafc' }}>
                    <thead style={{ background: '#1e293b' }}>
                      <tr>
                        <th>Week</th>
                        <th>Dates</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evenSemesterGrid.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.week}</td>
                          <td>{row.dates}</td>
                          <td>{row.mon}</td>
                          <td>{row.tue}</td>
                          <td>{row.wed}</td>
                          <td>{row.thu}</td>
                          <td>{row.fri}</td>
                          <td>{row.sat}</td>
                          <td>{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {previewModalTab === 'pdf' && (
                <div style={{ height: '500px' }}>
                  <iframe 
                    src={previewPdfUrl} 
                    title="Calendar PDF Preview" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none', borderRadius: '0.5rem' }} 
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setShowPreviewCalendarModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-calendar-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #1e293b)',
              color: 'var(--app-text, #f8fafc)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(37, 99, 235, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                  }}
                >
                  <Download size={20} />
                </div>
                <div>
                  <h3 id="export-calendar-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                    Export Official Academic Calendar PDF
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    Generate authentic vector PDF dossiers compliant with AICTE &amp; State Higher Education Councils
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0 }}
                onClick={() => setShowExportModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Target State / Gazette Rules</label>
                  <select
                    className="form-select form-select-sm"
                    value={exportState}
                    onChange={(e) => setExportState(e.target.value)}
                  >
                    {Object.entries(STATE_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>{name} ({code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Academic Year</label>
                  <select
                    className="form-select form-select-sm"
                    value={exportYear}
                    onChange={(e) => setExportYear(e.target.value)}
                  >
                    <option value="2026-2027">A.Y: 2026-2027 (Active Term)</option>
                    <option value="2025-2026">A.Y: 2025-2026 (Archive)</option>
                    <option value="2027-2028">A.Y: 2027-2028 (Projected)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Export Format Specification</label>
                <div className="d-flex gap-3">
                  <div
                    className={`p-3 rounded-3 flex-fill cursor-pointer border ${exportFormat === 'grid' ? 'border-primary bg-primary-subtle text-primary' : 'border-secondary'}`}
                    onClick={() => setExportFormat('grid')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="fw-bold mb-1">Institutional Weekly Grid Matrix</div>
                    <div className="small text-muted">Page-by-page weekly calendar grid with daily instructional slots.</div>
                  </div>
                  <div
                    className={`p-3 rounded-3 flex-fill cursor-pointer border ${exportFormat === 'gazette' ? 'border-success bg-success-subtle text-success' : 'border-secondary'}`}
                    onClick={() => setExportFormat('gazette')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="fw-bold mb-1">Official Administrative Gazette Dossier</div>
                    <div className="small text-muted">Statutory executive summary table followed by Odd/Even holiday annexures.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5"
                disabled={isExporting}
                onClick={() => handleExportPdf()}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="spinner-border spinner-border-sm" size={14} />
                    <span>Generating {exportState} PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Download {exportFormat === 'grid' ? 'Weekly Grid' : 'Gazette Dossier'} PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
