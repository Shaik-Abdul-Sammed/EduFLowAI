import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function CalendarVacationBlocks({
  vacations,
  compensatoryClasses,
  handleModifyVacation,
}) {
  return (
    <>
      {/* Vacation Blocks & Dynamic Recalculation Engine */}
              <div className="col-12 mt-4">
                <div className="card border shadow-sm p-3" style={{ background: 'var(--surface-bg, #ffffff)' }}>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                    <div>
                      <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Sparkles size={18} className="text-primary" />
                        Statutory Vacation Windows &amp; Dynamic Exam Recalculation
                      </h5>
                      <p className="text-muted small mb-0">
                        Extend or shorten gazetted vacation windows. Extending automatically shifts examination milestones to preserve UGC mandatory 90 teaching days; shortening schedules compensatory Saturday classes.
                      </p>
                    </div>
                  </div>

                  {compensatoryClasses.length > 0 && (
                    <div className="alert alert-success border-success-subtle p-3 mb-3">
                      <div className="fw-semibold text-success d-flex align-items-center gap-1 mb-1">
                        <CheckCircle2 size={16} /> Compensatory Academic Days Scheduled
                      </div>
                      <div className="small text-dark">
                        {compensatoryClasses.map((c) => (
                          <div key={c.vacationId}>
                            <strong>{c.vacName}:</strong> Shortened by {c.recoveredDays} days &rarr; Compensatory full-day classes scheduled on <span className="badge bg-success text-white">{c.dates.join(', ')}</span>.
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="row g-3">
                    {vacations.map((v) => {
                      const totalDays = v.baseDays + v.deltaDays
                      return (
                        <div key={v.id} className="col-12 col-md-6 col-lg-4">
                          <div className={`p-3 rounded border h-100 ${v.deltaDays > 0 ? 'border-warning bg-warning-subtle' : v.deltaDays < 0 ? 'border-info bg-info-subtle' : 'bg-light'}`}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <span className="fw-bold text-dark d-block">{v.name}</span>
                                <span className="small text-muted">{v.startDate} to {v.endDate}</span>
                              </div>
                              <span className={`badge ${v.deltaDays > 0 ? 'bg-warning text-dark' : v.deltaDays < 0 ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                {totalDays} Days {v.deltaDays !== 0 && `(${v.deltaDays > 0 ? `+${v.deltaDays}` : v.deltaDays}d)`}
                              </span>
                            </div>

                            <div className="d-flex flex-wrap gap-1 mt-2">
                              <span className="small text-muted w-100 mb-1 fw-semibold">Extend (+1 to +5 days):</span>
                              {[1, 2, 3, 5].map((d) => (
                                <button
                                  key={`ext-${d}`}
                                  type="button"
                                  className={`btn btn-xs py-0 px-2 btn-outline-warning small ${v.deltaDays === d ? 'active fw-bold' : ''}`}
                                  onClick={() => handleModifyVacation(v.id, d)}
                                >
                                  +{d}d
                                </button>
                              ))}
                            </div>

                            <div className="d-flex flex-wrap gap-1 mt-2">
                              <span className="small text-muted w-100 mb-1 fw-semibold">Shorten (-1 to -5 days):</span>
                              {[-1, -2, -3].map((d) => (
                                <button
                                  key={`sh-${d}`}
                                  type="button"
                                  className={`btn btn-xs py-0 px-2 btn-outline-info small ${v.deltaDays === d ? 'active fw-bold' : ''}`}
                                  onClick={() => handleModifyVacation(v.id, d)}
                                >
                                  {d}d
                                </button>
                              ))}
                              {v.deltaDays !== 0 && (
                                <button
                                  type="button"
                                  className="btn btn-xs py-0 px-2 btn-outline-secondary small ms-auto"
                                  onClick={() => handleModifyVacation(v.id, 0)}
                                >
                                  Reset
                                </button>
                              )}
                            </div>

                            {v.deltaDays > 0 && (
                              <div className="small text-danger mt-2 pt-2 border-top">
                                ⚠ Downstream exams postponed by +{v.deltaDays} days to guarantee 90 teaching days.
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
    </>
  );
}
