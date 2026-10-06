import { DollarSign, PieChart, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import OfficerLayout from '../../../components/OfficerLayout';

const SUGGESTED_PROMPTS = [
  "Reconcile fee collection against bank deposits for March 2026",
  "Flag unmatched UPI/NEFT transactions with bank statement",
  "Audit fee defaulters and schedule automated payment reminders",
];

const LEFT_ACTIONS = [
  { label: 'Reconcile Bank Transactions', icon: <DollarSign size={16} color="#3B82F6" /> },
  { label: 'Unmatched Payment Audit', icon: <ShieldCheck size={16} color="#3B82F6" /> },
  { label: 'Defaulter Follow-up Queue', icon: <PieChart size={16} color="#3B82F6" /> },
  { label: 'Fee Collection Summary', icon: <FileSpreadsheet size={16} color="#3B82F6" /> },
];

const LEFT_STATS = (
  <div>
    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 'bold' }}>Collection Metrics</p>
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
      {[
        { icon: <DollarSign size={14} color="#10B981" />, label: 'Total Collected', value: '₹4.2 Cr' },
        { icon: <ShieldCheck size={14} color="#38bdf8" />, label: 'Reconciled', value: '98.4%' },
        { icon: <PieChart size={14} color="#ef4444" />, label: 'Pending Dues', value: '₹14.8 L' },
        { icon: <span style={{ color: '#f59e0b' }}>●</span>, label: 'Unmatched Txns', value: '3' },
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
  type: 'finance',
  endpoint: '/v1/officers/finance/stream',
  exportEndpoint: '/v1/officers/finance/export-pdf',
  icon: '💰',
  name: 'Finance Officer',
  headerTitle: 'AI Finance Officer',
  headerDesc: 'Autonomous fee reconciliation, payment gateway discrepancy auditing, and defaulter cashflow intelligence.',
  accentColor: '#3B82F6',
  accentLight: 'rgba(59, 130, 246, 0.1)',
  accentBorder: 'rgba(59, 130, 246, 0.3)',
  connectingText: 'Reconciling ledger accounts and scanning for ledger discrepancies...',
  whyStats: [
    { value: '2 accountants', label: 'Manual staff 4 hours daily reconciling fees' },
    { value: '90%', label: 'Automatic reconciliation rate in under 60 seconds' },
    { value: '₹22,000', label: 'Saved per month on accounting overhead' },
  ],
  roiText: '₹2,64,000 annual accounting overhead saved',
  roiLabel: 'Reconciliation ROI',
  suggestedPrompts: SUGGESTED_PROMPTS,
  leftActions: LEFT_ACTIONS,
  leftStats: LEFT_STATS,
  institutionName: 'Sri Siddhartha Institute of Technology',
};

export default function FinanceOfficer() {
  return <OfficerLayout config={OFFICER_CONFIG} />;
}
