import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import OfficerLayout from '../../../components/OfficerLayout';

const SUGGESTED_PROMPTS = [
  "Generate NAAC Criteria 3 SSR Analysis for SSIT",
  "Audit Faculty Research Publications and Patents",
  "Identify Documentation Gaps for NBA Accreditation",
];

const CRITERIA_OPTIONS = [
  { label: 'Select NAAC Criterion...', value: '' },
  { label: 'Criterion 1 - Curricular Aspects', value: 'Criterion 1', prompt: 'Generate NAAC SSR Report for Criterion 1 - Curricular Aspects. Include curriculum design, academic flexibility, curriculum enrichment, and feedback system.' },
  { label: 'Criterion 2 - Teaching-Learning and Evaluation', value: 'Criterion 2', prompt: 'Generate NAAC SSR Report for Criterion 2 - Teaching-Learning and Evaluation. Include student enrollment, diversity, teaching-learning process, teacher profile, evaluation, and student performance.' },
  { label: 'Criterion 3 - Research, Innovations and Extension', value: 'Criterion 3', prompt: 'Generate NAAC SSR Report for Criterion 3 - Research, Innovations and Extension. Include resource mobilization, innovation ecosystem, publications, extension activities, and collaboration.' },
  { label: 'Criterion 4 - Infrastructure and Learning Resources', value: 'Criterion 4', prompt: 'Generate NAAC SSR Report for Criterion 4 - Infrastructure and Learning Resources. Include physical facilities, library, IT infrastructure, and campus maintenance.' },
  { label: 'Criterion 5 - Student Support and Progression', value: 'Criterion 5', prompt: 'Generate NAAC SSR Report for Criterion 5 - Student Support and Progression. Include support, progression, activities, and alumni engagement.' },
  { label: 'Criterion 6 - Governance, Leadership and Management', value: 'Criterion 6', prompt: 'Generate NAAC SSR Report for Criterion 6 - Governance, Leadership and Management. Include institutional vision, strategy, faculty empowerment, financial management, and IQAC.' },
  { label: 'Criterion 7 - Institutional Values and Best Practices', value: 'Criterion 7', prompt: 'Generate NAAC SSR Report for Criterion 7 - Institutional Values and Best Practices. Include social responsibilities, best practices, and institutional distinctiveness.' },
  { label: 'All Criteria (Full SSR)', value: 'All Criteria', prompt: 'Generate Full NAAC Self-Study Report (SSR) covering all 7 criteria for Sri Sudha Institute of Technology, with institutional metrics, quantitative tables, and CGPA contribution summary.' },
];

const LEFT_ACTIONS = [
  { label: 'NAAC Self Study Report', icon: <FileText size={16} color="#8B5CF6" /> },
  { label: 'NBA Outcome Based Education Report', icon: <FileText size={16} color="#8B5CF6" /> },
  { label: 'AICTE Compliance Report', icon: <FileText size={16} color="#8B5CF6" /> },
  { label: 'UGC Recognition Report', icon: <FileText size={16} color="#8B5CF6" /> },
];

const LEFT_STATS = (
  <div>
    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 'bold' }}>Accreditation Readiness</p>
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '7px solid #8B5CF6', borderTopColor: 'rgba(255,255,255,0.1)', borderRightColor: 'rgba(255,255,255,0.1)', margin: '0 auto 1.25rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(45deg)' }}>
        <div style={{ transform: 'rotate(-45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>88.4%</span>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)' }}>Readiness</span>
        </div>
      </div>
      {[
        { label: 'Teaching & Learning', pct: '85%', color: '#10B981' },
        { label: 'Research & Innovation', pct: '88%', color: '#2563EB' },
        { label: 'Infrastructure', pct: '81%', color: '#F59E0B' },
        { label: 'Student Support', pct: '74%', color: '#EF4444' },
      ].map(({ label, pct, color }, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ color }}>●</span> {label}</span>
          <span>{pct}</span>
        </div>
      ))}
    </div>
  </div>
);

const OFFICER_CONFIG = {
  type: 'accreditation',
  endpoint: '/v1/officers/accreditation/stream',
  exportEndpoint: '/v1/officers/accreditation/export-pdf',
  icon: '🏛️',
  name: 'Accreditation Officer',
  headerTitle: 'AI Accreditation Officer',
  headerDesc: 'Autonomous NAAC/NBA SSR generation, criteria evaluation, and regulatory compliance analysis.',
  accentColor: '#8B5CF6',
  accentLight: 'rgba(139, 92, 246, 0.1)',
  accentBorder: 'rgba(139, 92, 246, 0.3)',
  connectingText: 'Connecting to institutional digital twin & calculating metrics...',
  whyStats: [
    { value: '16 months', label: 'Average manual NAAC prep time' },
    { value: '₹5–10L', label: 'Consulting fees per accreditation cycle' },
    { value: '90 seconds', label: 'EduFlow AI SSR generation time' },
  ],
  roiText: '₹3,00,000 consulting fees saved',
  roiLabel: 'ROI Tracker',
  suggestedPrompts: SUGGESTED_PROMPTS,
  leftActions: LEFT_ACTIONS,
  leftStats: LEFT_STATS,
  institutionName: 'Sri Siddhartha Institute of Technology',
};

export default function AccreditationOfficer() {
  const [selectedCriterion, setSelectedCriterion] = useState('');

  const handleCriterionChange = (e) => {
    setSelectedCriterion(e.target.value);
  };

  const payloadBuilder = (promptText) => ({
    reportType: promptText,
    action: promptText,
    criterion: selectedCriterion,
  });

  const topBarExtra = (
    <div style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <label htmlFor="naac-criteria-select" style={{ fontSize: '0.78rem', color: '#c4b5fd', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
        <Sparkles size={13} color="#8B5CF6" /> NAAC Criterion:
      </label>
      <select
        id="naac-criteria-select"
        data-testid="naac-criteria-select"
        value={selectedCriterion}
        onChange={handleCriterionChange}
        style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '8px', color: '#f8fafc', padding: '0.4rem 0.7rem', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
      >
        {CRITERIA_OPTIONS.map((opt, idx) => (
          <option key={idx} value={opt.value} style={{ background: '#0f172a', color: '#f8fafc' }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <OfficerLayout
      config={OFFICER_CONFIG}
      payloadBuilder={payloadBuilder}
      topBarExtra={topBarExtra}
    />
  );
}
