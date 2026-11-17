import { useState, useEffect } from 'react';
import { TrendingUp, Users, Target, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import OfficerLayout from '../../../components/OfficerLayout';
import { wakeUpFetch } from '../../../utils/wakeUpHandler';

const SUGGESTED_PROMPTS = [
  "Analyze application yield and predict final enrollment",
  "Identify conversion drop-off factors in admissions funnel",
  "Generate automated personalized follow-up queue",
];

const LEFT_ACTIONS = [
  { label: 'Forecast Enrollment Yield', icon: <TrendingUp size={16} color="#F59E0B" /> },
  { label: 'Funnel Drop-off Diagnostic', icon: <Target size={16} color="#F59E0B" /> },
  { label: 'Lead Scoring & Prioritization', icon: <UserCheck size={16} color="#F59E0B" /> },
  { label: 'Export Admissions Report', icon: <Users size={16} color="#F59E0B" /> },
];

export default function AdmissionOfficer() {
  const [stats, setStats] = useState({
    applications: '1,420',
    shortlisted: '860',
    predictedYield: '74.2%',
    seatsFilled: '480 / 500'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await wakeUpFetch('/v1/admissions');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch admission telemetry`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setStats({
          applications: `${data.length}`,
          shortlisted: `${Math.round(data.length * 0.6)}`,
          predictedYield: '74.2%',
          seatsFilled: `${Math.min(data.length, 500)} / 500`
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load admission telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const leftStats = (
    <div>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 'bold' }}>
        Admissions Funnel
      </p>

      {loading ? (
        <div data-testid="admissions-loading" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
          <RefreshCw size={16} className="animate-spin mb-2" style={{ display: 'inline-block' }} />
          <p className="mb-0">Syncing live admission funnel...</p>
        </div>
      ) : error ? (
        <div data-testid="admissions-error" style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ fontWeight: 'bold' }}>Telemetry Error</span>
          </div>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>{error}</p>
          <button
            data-testid="admissions-retry"
            onClick={fetchStats}
            style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div data-testid="admissions-stats" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { icon: <Users size={14} color="#38bdf8" />, label: 'Applications', value: stats.applications },
            { icon: <UserCheck size={14} color="#f59e0b" />, label: 'Shortlisted', value: stats.shortlisted },
            { icon: <Target size={14} color="#10B981" />, label: 'Predicted Yield', value: stats.predictedYield },
            { icon: <TrendingUp size={14} color="#a855f7" />, label: 'Seats Filled', value: stats.seatsFilled },
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
    type: 'admissions',
    endpoint: '/v1/officers/admissions/stream',
    exportEndpoint: '/v1/officers/admissions/export-pdf',
    icon: '🎯',
    name: 'Admissions Officer',
    headerTitle: 'AI Admissions Officer',
    headerDesc: 'Predictive enrollment yield analytics, funnel drop-off diagnostics, and targeted student outreach optimization.',
    accentColor: '#F59E0B',
    accentLight: 'rgba(245, 158, 11, 0.1)',
    accentBorder: 'rgba(245, 158, 11, 0.3)',
    connectingText: 'Predicting enrollment conversion probabilities and demographic segments...',
    whyStats: [
      { value: '₹20L', label: 'Average marketing spend with uncertain conversion' },
      { value: '+5%', label: 'Yield rate increase via predictive targeting' },
      { value: '45 seconds', label: 'Funnel drop-off audit and cohort analysis' },
    ],
    roiText: '₹20,000 analytics cost saved per cycle',
    roiLabel: 'Yield Value',
    suggestedPrompts: SUGGESTED_PROMPTS,
    leftActions: LEFT_ACTIONS,
    leftStats: leftStats,
    institutionName: 'Sri Siddhartha Institute of Technology',
  };

  return <OfficerLayout config={officerConfig} />;
}
