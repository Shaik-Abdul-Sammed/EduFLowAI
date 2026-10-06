import { AlertTriangle, Users, BookOpen } from 'lucide-react';
import OfficerLayout from '../../../components/OfficerLayout';

const SUGGESTED_PROMPTS = [
  "Run institutional dropout risk analysis for semester 4",
  "Generate automated intervention plan for high-risk students",
  "Audit attendance patterns and backlog correlation",
];

const LEFT_ACTIONS = [
  { label: 'Scan All Cohorts for Dropout Risk', icon: <AlertTriangle size={16} color="#10B981" /> },
  { label: 'Generate Mentor Remediation List', icon: <Users size={16} color="#10B981" /> },
  { label: 'Dispatch Attendance Warning SMS', icon: <AlertTriangle size={16} color="#10B981" /> },
  { label: 'Fee Defaulter Retention Review', icon: <BookOpen size={16} color="#10B981" /> },
];

const LEFT_STATS = (
  <div>
    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 'bold' }}>Cohort Risk Metrics</p>
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
      {[
        { icon: <Users size={14} color="#38bdf8" />, label: 'Total Scanned', value: '50 Students' },
        { icon: <AlertTriangle size={14} color="#ef4444" />, label: 'High Risk', value: '10 Flagged' },
        { icon: <BookOpen size={14} color="#f59e0b" />, label: 'Medium Risk', value: '2 Students' },
        { icon: <span style={{ color: '#10B981' }}>●</span>, label: 'On Track', value: '38 Students' },
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
  leftStats: LEFT_STATS,
  institutionName: 'Sri Siddhartha Institute of Technology',
};

export default function StudentSuccessOfficer() {
  return <OfficerLayout config={OFFICER_CONFIG} />;
}
