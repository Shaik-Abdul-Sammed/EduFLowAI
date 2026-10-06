import { Clock, Users, Calendar } from 'lucide-react';
import OfficerLayout from '../../../components/OfficerLayout';

const SUGGESTED_PROMPTS = [
  "Generate conflict-free timetable for CSE Department",
  "Optimize faculty workload balancing across sections",
  "Resolve computer laboratory allocation conflicts",
];

const LEFT_ACTIONS = [
  { label: 'Generate Semester Timetable', icon: <Calendar size={16} color="#06B6D4" /> },
  { label: 'Detect Room Conflicts', icon: <Clock size={16} color="#06B6D4" /> },
  { label: 'Balance Faculty Workload', icon: <Users size={16} color="#06B6D4" /> },
  { label: 'Export Timetable as PDF', icon: <Calendar size={16} color="#06B6D4" /> },
];

const LEFT_STATS = (
  <div>
    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 'bold' }}>Scheduling Metrics</p>
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
      {[
        { icon: <Clock size={14} color="#06B6D4" />, label: 'Departments', value: '8 Covered' },
        { icon: <Users size={14} color="#f59e0b" />, label: 'Faculty', value: '120+ Mapped' },
        { icon: <Calendar size={14} color="#10B981" />, label: 'Conflicts Resolved', value: '0 Remaining' },
        { icon: <span style={{ color: '#10B981' }}>●</span>, label: 'Rooms Utilized', value: '92%' },
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
  type: 'timetable',
  endpoint: '/v1/officers/timetable/stream',
  exportEndpoint: '/v1/officers/timetable/export-pdf',
  icon: '📅',
  name: 'Timetable Officer',
  headerTitle: 'AI Timetable Officer',
  headerDesc: 'Constraint-based conflict-free scheduling, faculty workload optimization, and room allocation automation.',
  accentColor: '#06B6D4',
  accentLight: 'rgba(6, 182, 212, 0.1)',
  accentBorder: 'rgba(6, 182, 212, 0.3)',
  connectingText: 'Running constraint satisfaction algorithms for conflict-free scheduling...',
  whyStats: [
    { value: '3 weeks', label: 'Manual timetable coordination time per semester' },
    { value: '60 seconds', label: 'EduFlow AI conflict-free schedule generation' },
    { value: '₹18,000', label: 'Admin cost saved per semester' },
  ],
  roiText: '₹36,000 scheduling costs saved/year',
  roiLabel: 'Efficiency Gain',
  suggestedPrompts: SUGGESTED_PROMPTS,
  leftActions: LEFT_ACTIONS,
  leftStats: LEFT_STATS,
  institutionName: 'Sri Siddhartha Institute of Technology',
};

export default function TimetableOfficer() {
  return <OfficerLayout config={OFFICER_CONFIG} />;
}
