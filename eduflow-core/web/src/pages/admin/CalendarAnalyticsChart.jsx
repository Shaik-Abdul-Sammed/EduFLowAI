import React from 'react';
import { Calendar, BarChart3, TrendingUp, CheckCircle, Shield } from 'lucide-react';

export default function CalendarAnalyticsChart({ 
  oddDays = 90, 
  evenDays = 90, 
  totalHolidays = 24, 
  stateName = 'Andhra Pradesh' 
}) {
  const oddCompliance = oddDays >= 90;
  const evenCompliance = evenDays >= 90;

  return (
    <div className="card border-0 shadow-sm p-4 mb-4" style={{ background: 'var(--card-bg, #ffffff)', color: 'var(--app-text, #1e293b)', borderRadius: '1rem', border: '1px solid var(--border-color, #e2e8f0)' }}>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <div className="d-flex align-items-center gap-2">
          <BarChart3 className="text-primary" size={20} />
          <h5 className="fw-bold mb-0" style={{ color: 'var(--app-heading, #1e293b)' }}>Academic Term Analytics & Statutory Workload</h5>
        </div>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1">
          UGC 90-Day Mandate Audit
        </span>
      </div>

      <div className="row g-3 text-center mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-3" style={{ background: 'var(--surface-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <div className="small text-secondary fw-semibold mb-1">Odd Sem Teaching Days</div>
            <div className="h4 fw-bold mb-0 text-primary">{oddDays}</div>
            <div className="small text-muted">{oddCompliance ? '✓ UGC Compliant' : '⚠ Deficit'}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-3" style={{ background: 'var(--surface-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <div className="small text-secondary fw-semibold mb-1">Even Sem Teaching Days</div>
            <div className="h4 fw-bold mb-0 text-success">{evenDays}</div>
            <div className="small text-muted">{evenCompliance ? '✓ UGC Compliant' : '⚠ Deficit'}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-3" style={{ background: 'var(--surface-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <div className="small text-secondary fw-semibold mb-1">Gazetted Holidays</div>
            <div className="h4 fw-bold mb-0 text-info">{totalHolidays}</div>
            <div className="small text-muted">{stateName} Gazette</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 rounded-3" style={{ background: 'var(--surface-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <div className="small text-secondary fw-semibold mb-1">Statutory Compliance</div>
            <div className="h4 fw-bold mb-0 text-primary">100%</div>
            <div className="small text-muted">AICTE APH 2026</div>
          </div>
        </div>
      </div>

      {/* Visual Workload Bar */}
      <div className="mb-2">
        <div className="d-flex justify-content-between small text-secondary mb-1">
          <span>Instructional Days Breakdown</span>
          <span>Target: 180 Days Total (90 + 90)</span>
        </div>
        <div className="progress" style={{ height: '18px', borderRadius: '9px', background: 'var(--surface-bg, #e2e8f0)' }}>
          <div 
            className="progress-bar bg-primary" 
            role="progressbar" 
            style={{ width: `${Math.min((oddDays / 180) * 100, 50)}%` }}
            title={`Odd Semester: ${oddDays} days`}
          >
            Odd ({oddDays}d)
          </div>
          <div 
            className="progress-bar bg-success" 
            role="progressbar" 
            style={{ width: `${Math.min((evenDays / 180) * 100, 50)}%` }}
            title={`Even Semester: ${evenDays} days`}
          >
            Even ({evenDays}d)
          </div>
        </div>
      </div>
    </div>
  );
}
