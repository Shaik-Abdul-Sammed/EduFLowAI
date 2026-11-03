import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, ShieldCheck, AlertTriangle, CheckCircle, ExternalLink,
  X, Sparkles, BookOpen, Clock, Users, Award, DollarSign
} from 'lucide-react';
import { EXPERT_SYSTEMS, evaluateExpertSystem } from '../services/expertSystemRules';

const OFFICER_ROUTES = {
  accreditation: '/officer/accreditation',
  'student-success': '/officer/student-success',
  timetable: '/officer/timetable',
  admissions: '/officer/admissions',
  finance: '/officer/finance'
};

const SYSTEM_ICONS = {
  accreditation: <Award size={18} className="text-primary" />,
  'student-success': <Users size={18} className="text-warning" />,
  timetable: <Clock size={18} className="text-info" />,
  admissions: <ExternalLink size={18} className="text-success" />,
  finance: <DollarSign size={18} className="text-danger" />
};

export default function ExpertSystemsModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accreditation');

  if (!isOpen) return null;

  const evaluatedSystems = Object.keys(EXPERT_SYSTEMS).map(key => ({
    key,
    ...evaluateExpertSystem(key)
  }));

  const currentSystem = evaluateExpertSystem(activeTab);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--app-card-bg, #111827)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: 'var(--app-text, #f3f4f6)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Brain size={20} color="#fff" />
            </div>
            <div>
              <h5 className="mb-0 fw-bold" style={{ fontSize: '1.15rem' }}>
                Institutional Expert Systems Knowledge &amp; Inference Hub
              </h5>
              <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                Codified Higher Ed Regulatory Rules (UGC, NAAC, AICTE, NIRF) &amp; Autonomous Audits
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="Close"
            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* System Tabs */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '0.5rem 1.25rem 0'
          }}
        >
          {evaluatedSystems.map((sys) => {
            const isActive = activeTab === sys.key;
            return (
              <button
                key={sys.key}
                type="button"
                onClick={() => setActiveTab(sys.key)}
                style={{
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #3B82F6' : '2px solid transparent',
                  color: isActive ? '#60A5FA' : 'rgba(255,255,255,0.7)',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  borderRadius: '6px 6px 0 0'
                }}
              >
                {SYSTEM_ICONS[sys.key]}
                <span>{sys.systemName.split(' ')[0]} {sys.systemName.split(' ')[1]}</span>
                <span
                  className={`badge ${
                    sys.overallStatus === 'OPTIMAL' ? 'bg-success' : 'bg-warning text-dark'
                  }`}
                  style={{ fontSize: '0.65rem' }}
                >
                  {sys.summaryScore}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(85vh - 145px)', padding: '1.25rem 1.5rem' }}>
          {/* Framework Banner */}
          <div
            className="p-3 rounded mb-4"
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div style={{ flex: '1 1 340px', minWidth: 0 }}>
                <h6 className="fw-bold mb-1 text-primary d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="flex-shrink-0" /> {currentSystem.systemName}
                </h6>
                <div className="small text-muted mb-2">
                  <strong>Statutory Authority:</strong> {currentSystem.authority} • <strong>Framework:</strong> {currentSystem.frameworkVersion}
                </div>
                <div className="small" style={{ lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {currentSystem.description}
                </div>
              </div>
              <div className="text-sm-end text-start flex-shrink-0 pt-1">
                <div className="fs-4 fw-bold text-success">{currentSystem.compliancePercentage}%</div>
                <span className="badge bg-success-subtle text-success border border-success d-inline-block text-wrap" style={{ maxWidth: '180px' }}>
                  {currentSystem.readinessGrade || 'Statutory Benchmark Met'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Codified Rules */}
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <BookOpen size={16} className="text-info" /> Codified Inference Rules &amp; Benchmark Checks
          </h6>

          <div className="d-flex flex-column gap-3 mb-4">
            {currentSystem.rules.map((rule) => {
              const isCompliant = rule.status === 'COMPLIANT';
              return (
                <div
                  key={rule.id}
                  className="p-3 rounded border"
                  style={{
                    background: isCompliant ? 'rgba(16, 185, 129, 0.04)' : 'rgba(245, 158, 11, 0.05)',
                    borderColor: isCompliant ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2 flex-wrap">
                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{rule.id}</span>
                        <strong style={{ fontSize: '0.95rem' }}>{rule.name}</strong>
                      </div>
                      <div className="small text-muted mt-1">
                        <strong>Clause:</strong> {rule.statutoryClause}
                      </div>
                    </div>
                    <span
                      className={`badge ${isCompliant ? 'bg-success' : 'bg-warning text-dark'} d-inline-flex align-items-center flex-shrink-0`}
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                    >
                      {isCompliant ? <><CheckCircle size={12} className="me-1" /> COMPLIANT</> : <><AlertTriangle size={12} className="me-1" /> WARNING</>}
                    </span>
                  </div>

                  <div className="row g-2 small my-2 p-2 rounded bg-dark-subtle align-items-center">
                    <div className="col-12 col-md-6 d-flex align-items-center justify-content-between justify-content-md-start gap-2">
                      <span className="text-muted">Statutory Threshold:</span>{' '}
                      <span className="fw-semibold text-info">{rule.statutoryThreshold}</span>
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-center justify-content-between justify-content-md-start gap-2">
                      <span className="text-muted">Measured Value:</span>{' '}
                      <span className="fw-semibold text-warning">{rule.currentValue}</span>
                    </div>
                  </div>

                  <div className="small mb-1 text-light-subtle">
                    <strong>Expert Diagnostic:</strong> {rule.explanation}
                  </div>
                  <div className="small text-primary-emphasis">
                    <strong>Recommended Directive:</strong> {rule.recommendation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div className="small text-muted">
            Continuous background telemetry synchronized with institutional database.
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary d-flex align-items-center gap-1"
              onClick={() => {
                onClose();
                const route = OFFICER_ROUTES[activeTab] || '/officers-dashboard';
                navigate(route);
              }}
            >
              <Sparkles size={14} /> Open {currentSystem.systemName.split(' ')[0]} AI Officer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
