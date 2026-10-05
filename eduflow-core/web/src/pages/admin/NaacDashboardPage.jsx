import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Database,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { getApiBaseURL } from '../../config/apiConfig';

const GRADE_SCALE = [
  { grade: 'D', min: 0.0, max: 1.5 },
  { grade: 'C', min: 1.51, max: 2.0 },
  { grade: 'B', min: 2.01, max: 2.5 },
  { grade: 'B+', min: 2.51, max: 2.75 },
  { grade: 'B++', min: 2.76, max: 3.0 },
  { grade: 'A', min: 3.01, max: 3.25 },
  { grade: 'A+', min: 3.26, max: 3.5 },
  { grade: 'A++', min: 3.51, max: 4.0 },
];

const DEFAULT_CRITERIA = [
  { criterion: 1, name: 'Curricular Aspects', maxScore: 100, rawScore: 85, score: 3.4, percentage: 85.0 },
  { criterion: 2, name: 'Teaching-Learning and Evaluation', maxScore: 350, rawScore: 298, score: 3.41, percentage: 85.1 },
  { criterion: 3, name: 'Research, Innovations and Extension', maxScore: 110, rawScore: 82, score: 2.98, percentage: 74.5 },
  { criterion: 4, name: 'Infrastructure and Learning Resources', maxScore: 100, rawScore: 88, score: 3.52, percentage: 88.0 },
  { criterion: 5, name: 'Student Support and Progression', maxScore: 130, rawScore: 102, score: 3.14, percentage: 78.5 },
  { criterion: 6, name: 'Governance, Leadership and Management', maxScore: 100, rawScore: 84, score: 3.36, percentage: 84.0 },
  { criterion: 7, name: 'Institutional Values and Best Practices', maxScore: 100, rawScore: 86, score: 3.44, percentage: 86.0 },
];

const PROVIDED_METRICS = [
  'Student Sanctioned Intake & Headcount Enrollment (1,250 Active Records)',
  'Core Teaching Faculty & Doctoral Credentials (85 Faculty, 40 Ph.D.)',
  'Student-to-Faculty Ratio [14.7 : 1 Compliant with AICTE Benchmarks]',
  'Outcome-Based Curricular Framework & Electives (45 Accredited Programs)',
  'Campus Physical Learning Infrastructure (120 Classrooms, 45 Laboratories)',
  'Central Digital Library Resource Allocation (12,000 sq.ft Hub)',
  'Student Residential Facilities & Hostels (800 Living Capacity)',
  'Campus Placement Records & Package Analytics (62% Placed, 5.5 LPA Median)',
  'Faculty Scholarly Research Track Record (450 Publications Tracked)',
  'Scopus & Web of Science Journal Indexed Papers (270 Indexed Papers)',
  'Student Academic Semester Attendance Records (82% Semester Mean)',
  'Student Academic Performance & CGPA Metrics (7.8 Cumulative Average)',
];

const MISSING_METRICS = [
  'Corporate Testing & Consultancy Revenue Generation Audit',
];

const RECENT_REPORTS_DEFAULT = [
  { id: 1, date: '2026-03-28', criterion: 'Criterion 2 - Teaching-Learning', status: 'Completed', downloadUrl: '#' },
  { id: 2, date: '2026-03-25', criterion: 'Criterion 3 - Research & Innovation', status: 'Completed', downloadUrl: '#' },
  { id: 3, date: '2026-03-20', criterion: 'Criterion 4 - Infrastructure', status: 'Completed', downloadUrl: '#' },
  { id: 4, date: '2026-03-15', criterion: 'Full SSR Comprehensive Draft', status: 'Completed', downloadUrl: '#' },
  { id: 5, date: '2026-03-10', criterion: 'Criterion 1 - Curricular Aspects', status: 'Completed', downloadUrl: '#' },
];

export default function NaacDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [prediction, setPrediction] = useState({
    grade: 'A+',
    cgpa: 3.42,
    confidence: 0.85,
    criteriaScores: DEFAULT_CRITERIA,
    strengths: [
      'Teaching-Learning & Evaluation (Student-Faculty ratio 14.7:1 with 47% PhD faculty)',
      'Infrastructure & Learning Resources (120 smart classrooms, 45 labs, and 12,000 sqft library)',
      'Institutional Values & Best Practices (Exemplary eco-campus and community outreach initiatives)',
    ],
    weaknesses: [
      'Research Publications (Scopus indexed papers per faculty currently at 3.1, benchmark target >4.5)',
      'Student Placements (Current placement rate at 62%, recommended target is >80%)',
      'Doctoral Faculty Cadre (Current PhD ratio is 47%, target is minimum 60% for highest grade tier)',
    ],
    recommendations: [
      'Provide seed grants for faculty journal publications and patent filings.',
      'Establish corporate partnership tie-ups for higher dream placement conversions.',
      'Facilitate PhD completion sabbaticals for teaching faculty.',
    ],
  });

  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`${getApiBaseURL()}/v1/demo/naac-prediction`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.grade) {
          setPrediction(data);
        }
      }
    } catch (err) {
      console.warn('Could not fetch live prediction, using cached state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const response = await fetch(`${getApiBaseURL()}/v1/demo/naac-prediction`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (response.ok && isMounted) {
          const data = await response.json();
          if (data && data.grade) {
            setPrediction(data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch live prediction:', err);
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(getFullApiUrl('/v1/officers/accreditation/export-pdf'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          institutionName: 'Sri Sudha Institute of Technology',
          text: `NAAC Self Study Report & Grade Prediction\nInstitution: Sri Sudha Institute of Technology\nPredicted Grade: ${prediction.grade} (CGPA: ${prediction.cgpa})\nReadiness Score: ${prediction.readinessScore}%\n\nStrengths:\n${(prediction.strengths || []).join('\n')}\n\nRecommendations:\n${(prediction.recommendations || []).join('\n')}`,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NAAC-Grade-Report-SSIT-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Network error downloading PDF report.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Criterion', 'Name', 'Max Score', 'Raw Score', 'Achieved Score (4.0)', 'Percentage (%)'],
      ...prediction.criteriaScores.map((c) => [
        `Criterion ${c.criterion}`,
        `"${c.name}"`,
        c.maxScore,
        c.rawScore,
        c.score,
        `${c.percentage}%`,
      ]),
      [],
      ['Predicted Grade', prediction.grade],
      ['Cumulative CGPA', prediction.cgpa],
      ['Confidence', `${Math.round(prediction.confidence * 100)}%`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NAAC_SSR_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getScoreColor = (pct) => {
    if (pct >= 80) return '#10B981'; // green
    if (pct >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const completenessPct = Math.round(
    (PROVIDED_METRICS.length / (PROVIDED_METRICS.length + MISSING_METRICS.length)) * 100
  );

  return (
    <div
      data-testid="naac-dashboard-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#F9FAFB',
        padding: '2rem 3rem',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Page Title & Breadcrumbs */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8B5CF6', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Award size={18} />
            <span>INSTITUTIONAL ACCREDITATION INTELLIGENCE</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>
            NAAC Grade Prediction & SSR Readiness Dashboard
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Real-time assessment for <strong style={{ color: '#E0E7FF' }}>Sri Sudha Institute of Technology</strong> based on NAAC Revised Accreditation Framework (RAF).
          </p>
        </div>
      </div>

      {/* SECTION 1: Grade Prediction Card */}
      <div
        data-testid="grade-prediction-card"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 27, 75, 0.6) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* Grade Display Badge */}
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
                border: '2px solid rgba(167, 139, 250, 0.5)',
              }}
            >
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#DDD6FE', fontWeight: 600 }}>Grade</span>
              <span data-testid="predicted-grade" style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: '#FFFFFF' }}>
                {prediction.grade}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span data-testid="predicted-cgpa" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {prediction.cgpa}
                </span>
                <span style={{ color: '#9CA3AF', fontSize: '1.1rem', fontWeight: 500 }}>/ 4.00 CGPA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  <TrendingUp size={16} /> Projected NAAC Accreditation
                </span>
                <span style={{ color: '#6B7280' }}>•</span>
                <span data-testid="prediction-confidence" style={{ color: '#A78BFA', fontSize: '0.875rem', fontWeight: 600 }}>
                  Confidence: {Math.round(prediction.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="refresh-prediction-button"
            onClick={fetchPrediction}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#C4B5FD',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Recalculating...' : 'Refresh Prediction'}</span>
          </button>
        </div>

        {/* Grade Scale Bar */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#9CA3AF' }}>
            <span>NAAC Accreditation Scale (0.00 - 4.00 CGPA)</span>
            <span style={{ color: '#C4B5FD', fontWeight: 600 }}>Current Standing: Grade {prediction.grade}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '4px',
              height: '32px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px',
            }}
          >
            {GRADE_SCALE.map((item) => {
              const isCurrent = item.grade === prediction.grade;
              return (
                <div
                  key={item.grade}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                    background: isCurrent
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isCurrent ? '#FFFFFF' : '#6B7280',
                    border: isCurrent ? '2px solid #C4B5FD' : 'none',
                    boxShadow: isCurrent ? '0 0 15px rgba(139, 92, 246, 0.6)' : 'none',
                    position: 'relative',
                  }}
                >
                  {item.grade}
                  {isCurrent && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#C4B5FD',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: '#6B7280' }}>
            <span>1.50 (D)</span>
            <span>2.00 (C)</span>
            <span>2.50 (B)</span>
            <span>2.75 (B+)</span>
            <span>3.00 (B++)</span>
            <span>3.25 (A)</span>
            <span>3.50 (A+)</span>
            <span>4.00 (A++)</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Criteria Scores Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} color="#8B5CF6" />
          <span>Criteria-wise Performance (7 NAAC Criteria)</span>
        </h2>

        <div
          data-testid="criteria-scores-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {prediction.criteriaScores.map((c) => {
            const scoreColor = getScoreColor(c.percentage);
            return (
              <div
                key={c.criterion}
                data-testid={`criterion-card-${c.criterion}`}
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#A78BFA', textTransform: 'uppercase' }}>
                      Criterion {c.criterion}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: `${scoreColor}20`,
                        color: scoreColor,
                        border: `1px solid ${scoreColor}40`,
                      }}
                    >
                      {c.percentage}%
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F3F4F6', marginBottom: '0.75rem', minHeight: '2.5rem' }}>
                    {c.name}
                  </h3>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {c.rawScore} <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 400 }}>/ {c.maxScore}</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                      CGPA: <strong style={{ color: '#F3F4F6' }}>{c.score || (c.percentage * 0.04).toFixed(2)}</strong>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, c.percentage)}%`,
                        height: '100%',
                        backgroundColor: scoreColor,
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Strengths and Weaknesses */}
      <div
        data-testid="strengths-weaknesses-section"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Top 3 Strengths */}
        <div
          data-testid="strengths-column"
          style={{
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="#10B981" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10B981', margin: 0 }}>
              Top 3 Institutional Strengths
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prediction.strengths.slice(0, 3).map((st, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>0{idx + 1}.</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#E5E7EB', lineHeight: 1.5 }}>
                  {st}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Weaknesses */}
        <div
          data-testid="weaknesses-column"
          style={{
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EF4444', margin: 0 }}>
              Top 3 Weaknesses & Recommendations
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prediction.weaknesses.slice(0, 3).map((wk, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.9rem' }}>0{idx + 1}.</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#E5E7EB', lineHeight: 1.5, fontWeight: 500 }}>
                    {wk}
                  </p>
                  {prediction.recommendations[idx] && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#9CA3AF' }}>
                      <strong style={{ color: '#FCD34D' }}>Action:</strong> {prediction.recommendations[idx]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Data Completeness Check */}
      <div
        data-testid="data-completeness-section"
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={20} color="#8B5CF6" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#F3F4F6' }}>
              Data Completeness Check
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Operational Audit Readiness:</span>
            <span
              data-testid="completeness-percentage"
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#10B981',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {completenessPct}% Complete
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {/* Provided Metrics */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10B981', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
              Verified Data Available ({PROVIDED_METRICS.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {PROVIDED_METRICS.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#D1D5DB' }}>
                  <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Metrics */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
              Missing or Pending Metrics ({MISSING_METRICS.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {MISSING_METRICS.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#9CA3AF' }}>
                  <XCircle size={14} color="#F59E0B" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Recent Reports */}
      <div
        data-testid="recent-reports-section"
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <FileText size={20} color="#8B5CF6" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#F3F4F6' }}>
            Recent Generated NAAC Reports (Last 5)
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: '#9CA3AF' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Criterion / Report Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_REPORTS_DEFAULT.map((rep) => (
                <tr key={rep.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#E5E7EB' }}>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{rep.date}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{rep.criterion}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      {rep.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#A78BFA',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Download size={14} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: Quick Actions */}
      <div
        data-testid="quick-actions-section"
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: '#F3F4F6' }}>
          Quick Actions
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            type="button"
            data-testid="generate-full-ssr-button"
            onClick={() => navigate('/officer/accreditation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            }}
          >
            <ShieldCheck size={18} />
            <span>Generate Full SSR</span>
          </button>

          <button
            type="button"
            data-testid="generate-single-criterion-button"
            onClick={() => navigate('/officer/accreditation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#E5E7EB',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <FileText size={18} />
            <span>Generate Single Criterion</span>
          </button>

          <button
            type="button"
            data-testid="download-grade-report-button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#6EE7B7',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: downloadingPdf ? 'not-allowed' : 'pointer',
            }}
          >
            <Download size={18} />
            <span>{downloadingPdf ? 'Exporting PDF...' : 'Download Grade Report PDF'}</span>
          </button>

          <button
            type="button"
            data-testid="export-csv-button"
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#E5E7EB',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <FileSpreadsheet size={18} />
            <span>Export Data as CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
