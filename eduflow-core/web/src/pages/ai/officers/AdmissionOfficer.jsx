import { TrendingUp, Users, Target, UserCheck } from 'lucide-react';
import OfficerLayout from '../../../components/OfficerLayout';

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

const LEFT_STATS = (
  <div>
    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 'bold' }}>Admissions Funnel</p>
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
      {[
        { icon: <Users size={14} color="#38bdf8" />, label: 'Applications', value: '1,420' },
        { icon: <UserCheck size={14} color="#f59e0b" />, label: 'Shortlisted', value: '860' },
        { icon: <Target size={14} color="#10B981" />, label: 'Predicted Yield', value: '74.2%' },
        { icon: <TrendingUp size={14} color="#a855f7" />, label: 'Seats Filled', value: '480 / 500' },
      ].map(({ icon, label, value }, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{icon} {label}</span>
          <span style={{ fontWeight: 'bold' }}>{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const OFFICER_CONFIG = {
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
  leftStats: LEFT_STATS,
  institutionName: 'Sri Siddhartha Institute of Technology',
};

export default function AdmissionOfficer() {
  return <OfficerLayout config={OFFICER_CONFIG} />;
}
