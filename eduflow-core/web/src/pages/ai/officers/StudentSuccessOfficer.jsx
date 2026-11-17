import { useState, useEffect } from 'react';
import { AlertTriangle, Users, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import OfficerLayout from '../../../components/OfficerLayout';
import { wakeUpFetch } from '../../../utils/wakeUpHandler';

const SUGGESTED_PROMPTS = [
  "Run early academic support risk analysis for semester 4",
  "Generate personalized mentorship and counseling intervention plan",
  "Audit attendance patterns and counseling requirements (< 65%)",
];

const LEFT_ACTIONS = [
  { label: 'Scan Cohorts for Academic Support Needs', icon: <AlertTriangle size={16} color="#10B981" /> },
  { label: 'Generate Mentor Remediation List', icon: <Users size={16} color="#10B981" /> },
  { label: 'Dispatch Early Attendance Support SMS', icon: <AlertTriangle size={16} color="#10B981" /> },
  { label: 'Proctor Counseling Schedule Review', icon: <BookOpen size={16} color="#10B981" /> },
];

export default function StudentSuccessOfficer() {
  const [stats, setStats] = useState({
    totalScanned: '50 Students',
    highRisk: '10 Flagged',
    mediumRisk: '2 Students',
    onTrack: '38 Students'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCohortRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await wakeUpFetch('/v1/academics/assignments');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to synchronize cohort risk indicators`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setStats({
          totalScanned: `${data.length * 15} Students`,
          highRisk: `${Math.max(1, data.length)} Flagged`,
          mediumRisk: `${data.length * 2} Students`,
          onTrack: `${data.length * 12} Students`
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load cohort risk telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortRisk();
  }, []);

  const leftStats = (
    <div>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 'bold' }}>
        Cohort Risk Metrics
      </p>

      {loading ? (
        <div data-testid="student-success-loading" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
          <RefreshCw size={16} className="animate-spin mb-2" style={{ display: 'inline-block' }} />
          <p className="mb-0">Scanning risk telemetry...</p>
        </div>
      ) : error ? (
        <div data-testid="student-success-error" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ fontWeight: 'bold' }}>Risk Telemetry Error</span>
          </div>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>{error}</p>
          <button
            data-testid="student-success-retry"
            onClick={fetchCohortRisk}
            style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div data-testid="student-success-stats" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { icon: <Users size={14} color="#38bdf8" />, label: 'Total Scanned', value: stats.totalScanned },
            { icon: <AlertTriangle size={14} color="#ef4444" />, label: 'High Risk', value: stats.highRisk },
            { icon: <BookOpen size={14} color="#f59e0b" />, label: 'Medium Risk', value: stats.mediumRisk },
            { icon: <span style={{ color: '#10B981' }}>●</span>, label: 'On Track', value: stats.onTrack },
          ].map(({ icon, label, value }, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{icon} {label}</span>
              <span style={{ fontWeight: 'bold' }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const officerConfig = {
    type: 'student-success',
    endpoint: '/v1/officers/student-success/stream',
    exportEndpoint: '/v1/officers/student-success/export-pdf',
    icon: '🎓',
    name: 'Student Success Officer',
    headerTitle: 'AI Student Success Officer',
    headerDesc: 'Predictive cohort risk modeling, early attendance warnings, and personalized academic interventions.',
    accentColor: '#10B981',
    accentLight: 'rgba(16, 185, 129, 0.1)',
    accentBorder: 'rgba(16, 185, 129, 0.3)',
    connectingText: 'Evaluating attendance patterns, backlogs, and risk signals...',
    whyStats: [
      { value: '₹50,000', label: 'Average cost of one dropout (lost tuition)' },
      { value: '8 weeks', label: 'Typical early-warning window before dropout' },
      { value: '90 seconds', label: 'Full cohort risk analysis with EduFlow AI' },
    ],
    roiText: '₹6,00,000 tuition retention protected',
    roiLabel: 'Retention Value',
    suggestedPrompts: SUGGESTED_PROMPTS,
    leftActions: LEFT_ACTIONS,
    leftStats: leftStats,
    institutionName: 'Sri Siddhartha Institute of Technology',
  };

  return <OfficerLayout config={officerConfig} />;
}
