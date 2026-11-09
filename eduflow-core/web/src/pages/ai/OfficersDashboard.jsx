import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cpu, Bell, Settings, ArrowUp, ArrowDown, Clock, TrendingUp, ShieldAlert,
  CheckCircle2, Brain, ArrowLeft, Trash2, X, ExternalLink
} from 'lucide-react';
import { getFullApiUrl } from '../../config/apiConfig';
import { EXPERT_SYSTEMS, evaluateExpertSystem } from '../../services/expertSystemRules';

function getOfficerLocalHistory(officerId) {
  try {
    if (!officerId) return [];
    const raw = localStorage.getItem(`officer_history_${officerId}`) ||
                localStorage.getItem(`officer_history_${String(officerId).replace(/-/g, '_')}`) ||
                localStorage.getItem(`officer_history_${String(officerId).replace(/_/g, '-')}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const OFFICER_META = {
  'accreditation': { icon: '🏛️', color: '#8B5CF6', name: 'AI Accreditation Officer', desc: 'NAAC, NBA, AICTE & UGC report generation, gap analysis, readiness scoring', statLabel: 'Reports Generated' },
  'timetable': { icon: '📅', color: '#2563EB', name: 'AI Timetable Officer', desc: 'Conflict-free timetable generation considering faculty workload and room availability', statLabel: 'Conflicts Resolved' },
  'admissions': { icon: '🎓', color: '#10B981', name: 'AI Admission Officer', desc: 'End-to-end admissions automation — queries, verification, documents, counselling', statLabel: 'Applications Processed' },
  'finance': { icon: '💰', color: '#F59E0B', name: 'AI Finance Officer', desc: 'Fee reconciliation, UPI matching, bank statement analysis, scholarship tracking', statLabel: 'Amount Reconciled' },
  'student-success': { icon: '📊', color: '#EF4444', name: 'AI Student Success Officer', desc: 'Early Academic Support Alert System, attendance monitoring, placement readiness, intervention plans', statLabel: 'Students Monitored' }
};

const DEFAULT_OFFICERS = Object.keys(OFFICER_META).map((id) => ({
  id,
  endpoint: `/api/v1/officers/${id}/chat`,
  status: 'available',
  lastAction: 'No recent activity',
}));

export default function OfficersDashboard() {
  const navigate = useNavigate();
  const [roi, setRoi] = useState(null);
  const [officers, setOfficers] = useState(DEFAULT_OFFICERS);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [selectedOfficerHistory, setSelectedOfficerHistory] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const safeParse = async (res) => {
      try {
        const text = await res.text();
        return JSON.parse(text);
      } catch {
        return {};
      }
    };

    const fetchData = async () => {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || '';
      
      if (!token) {
        if (isMounted) {
          setSessionExpired(true);
          setLoading(false);
        }
        setTimeout(() => { if (isMounted) navigate('/login'); }, 2000);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        const [officersRes, roiRes, naacRes, activityRes] = await Promise.all([
          fetch(getFullApiUrl('/v1/officers'), { headers }).catch(() => ({ status: 500, ok: false })),
          fetch(getFullApiUrl('/v1/officers/roi/summary'), { headers }).catch(() => ({ status: 500, ok: false })),
          fetch(getFullApiUrl('/v1/naac/dashboard-insights'), { headers }).catch(() => null),
          fetch(getFullApiUrl('/v1/activity'), { headers }).catch(() => null)
        ]);

        if (!isMounted) return;

        if (officersRes.status === 401 || roiRes.status === 401 || naacRes?.status === 401 || activityRes?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('eduflow-ai-auth');
          setSessionExpired(true);
          setTimeout(() => { if (isMounted) navigate('/login'); }, 2000);
          return;
        }

        if (officersRes.ok) {
          const oData = await safeParse(officersRes);
          if (isMounted) {
            if (oData.officers) setOfficers(oData.officers);
            if (oData.recentActivity) setRecentActivity(oData.recentActivity);
          }
        }

        if (roiRes.ok) {
          const rData = await safeParse(roiRes);
          if (isMounted) setRoi(rData);
        }

        if (activityRes && activityRes.ok) {
          const actData = await safeParse(activityRes);
          if (isMounted && actData.activity && actData.activity.length > 0) {
            setRecentActivity(actData.activity);
          }
        }

        if (naacRes && naacRes.ok) {
          const nData = await safeParse(naacRes);
          if (isMounted && nData.summary) {
            setRoi((prev) => ({
              ...prev,
              accreditationScore: nData.summary.readinessScore || prev?.accreditationScore || 88
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        if (isMounted && err.message && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
          setSessionExpired(true);
          setTimeout(() => { if (isMounted) navigate('/login'); }, 2000);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Clear history for an officer
  const handleClearOfficerHistory = (officerId) => {
    try {
      localStorage.removeItem(`officer_history_${officerId}`);
      localStorage.removeItem(`officer_history_${String(officerId).replace(/-/g, '_')}`);
      localStorage.removeItem(`officer_history_${String(officerId).replace(/_/g, '-')}`);
      setHistoryKey((k) => k + 1);
    } catch {}
  };

  // Aggregate local officer prompts across all 5 officers
  const allLocalActivities = useMemo(() => {
    const list = [];
    Object.keys(OFFICER_META).forEach((id) => {
      const hist = getOfficerLocalHistory(id);
      hist.forEach((item, idx) => {
        const promptText = typeof item === 'string' ? item : (item.prompt || item.preview || '');
        const previewText = typeof item === 'string' ? item : (item.preview || item.prompt || '');
        const timeText = typeof item === 'object' && item.timestamp ? item.timestamp : 'Recent';
        list.push({
          id: item.id || `local-${id}-${idx}`,
          officer: id,
          title: previewText,
          prompt: promptText,
          time: timeText,
          rawTime: typeof item.id === 'number' ? item.id : Date.now() - idx * 60000,
          isLocal: true,
        });
      });
    });
    return list.sort((a, b) => b.rawTime - a.rawTime);
  }, [historyKey]);

  // Merge backend activity and local officer history
  const displayedRecentActivity = useMemo(() => {
    const combined = [];
    const seenPrompts = new Set();

    allLocalActivities.forEach((act) => {
      const key = `${act.officer}:${act.prompt.trim()}`;
      if (!seenPrompts.has(key)) {
        seenPrompts.add(key);
        combined.push(act);
      }
    });

    (recentActivity || []).forEach((act) => {
      const p = act.metadata?.prompt || act.action || '';
      const key = `${act.officer}:${p.trim()}`;
      if (!seenPrompts.has(key)) {
        seenPrompts.add(key);
        combined.push({
          id: act.id,
          officer: act.officer,
          title: act.metadata?.prompt || `${act.metadata?.actionType || act.action || 'Request'} processed`,
          prompt: act.metadata?.prompt || '',
          time: act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          isLocal: false,
        });
      }
    });

    return combined.slice(0, 15);
  }, [allLocalActivities, recentActivity]);

  // Overall ROI hours and savings
  const totalLocalPrompts = useMemo(() => {
    return Object.keys(OFFICER_META).reduce((sum, id) => sum + getOfficerLocalHistory(id).length, 0);
  }, [historyKey]);

  const computedTotalHours = Math.round(totalLocalPrompts * 2.5 * 10) / 10;
  const totalHoursSaved = (roi?.totalHoursSaved && roi.totalHoursSaved > 0)
    ? roi.totalHoursSaved
    : (computedTotalHours > 0 ? computedTotalHours : 0);
  const totalMoneySaved = (roi?.totalMoneySaved && roi.totalMoneySaved > 0)
    ? roi.totalMoneySaved
    : Math.round(totalHoursSaved * 600);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0E27',
      color: 'white',
      fontFamily: '"Inter", sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
            100% { transform: translateY(0px); }
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
          }
          .gradient-text {
            background: linear-gradient(135deg, #60a5fa, #06B6D4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .officer-card {
            transition: all 0.2s ease-in-out;
          }
          .officer-card:hover {
            transform: translateY(-4px);
            border-color: var(--hover-color, rgba(255, 255, 255, 0.2));
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          }
        `}
      </style>

      {/* Top Navbar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 14, 39, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/admin-dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#93c5fd',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2563EB';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.2)';
              e.currentTarget.style.color = '#93c5fd';
            }}
          >
            <ArrowLeft size={16} /> ← Back to Admin Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Cpu color="#60a5fa" size={28} />
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }} className="gradient-text">
              EduFlow AI OS
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 500 }}>Springfield Engineering College</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: 'rgba(16, 185, 129, 0.1)', color: '#10B981',
            padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            AI Online
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Bell size={20} style={{ cursor: 'pointer', opacity: 0.7 }} />
          <Settings size={20} style={{ cursor: 'pointer', opacity: 0.7 }} />
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '0.875rem'
          }}>
            SA
          </div>
        </div>
      </div>

      {/* Session Expired Alert Banner */}
      {sessionExpired && (
        <div
          role="alert"
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1.5px solid #ef4444',
            color: '#fca5a5',
            padding: '1rem 1.5rem',
            margin: '1.5rem auto 0',
            maxWidth: '1280px',
            width: 'calc(100% - 4rem)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
          }}
        >
          <ShieldAlert size={20} color="#ef4444" />
          <span>Session expired. Please log in again. Redirecting to login...</span>
        </div>
      )}

      <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        
        {/* Hero ROI Bar */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          {loading ? (
             <div>Loading ROI data...</div>
          ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                <Clock size={16} /> Hours Saved This Month
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalHoursSaved}</span>
                <span style={{ fontSize: '0.875rem', color: '#10B981', display: 'flex', alignItems: 'center' }}><ArrowUp size={14} /> Active</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                <TrendingUp size={16} /> Money Saved
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{totalMoneySaved?.toLocaleString()}</span>
                <span style={{ fontSize: '0.875rem', color: '#10B981', display: 'flex', alignItems: 'center' }}><ArrowUp size={14} /> Active</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} /> Accreditation Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{roi?.accreditationScore || 0}%</span>
                <span style={{ fontSize: '0.875rem', color: '#10B981', display: 'flex', alignItems: 'center' }}><ArrowUp size={14} /> Stable</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                <ShieldAlert size={16} /> Student Risk Alerts
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{roi?.studentRiskAlerts || 0}</span>
                <span style={{ fontSize: '0.875rem', color: '#EF4444', display: 'flex', alignItems: 'center' }}><ArrowDown size={14} /> Pending</span>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Institutional Expert Systems Live Status */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)' }}>
                <Brain size={20} color="#8B5CF6" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Institutional Expert Systems Network</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                  Continuous knowledge-based rule validation across UGC, NAAC, AICTE &amp; NIRF statutory mandates
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.25rem 0.65rem', borderRadius: '999px', fontWeight: 600, border: '1px solid rgba(16,185,129,0.3)' }}>
              ● 5 Active Domain Inference Engines
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            {Object.keys(EXPERT_SYSTEMS).map((sysKey) => {
              const sys = evaluateExpertSystem(sysKey);
              const isOk = sys.overallStatus === 'OPTIMAL';
              return (
                <Link
                  key={sysKey}
                  to={`/officer/${sysKey}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', transition: 'all 0.2s', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{sys.systemName.split(' ')[0]} {sys.systemName.split(' ')[1]}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: isOk ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: isOk ? '#10b981' : '#f59e0b' }}>
                        {sys.compliancePercentage}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.65rem' }}>
                      {sys.authority.split('&')[0]}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>Inspect Rules &amp; Inference →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Your AI Officers */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Your AI Officers</h2>
        
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem'
        }}>
          {loading ? <div>Loading Officers...</div> : officers.map((officer, idx) => {
            const meta = OFFICER_META[officer.id] || { name: officer.id, color: '#2563EB', icon: '🤖', desc: '' };
            const localHistory = getOfficerLocalHistory(officer.id);
            const officerRoi = roi?.byOfficer?.find(o => o.type === officer.id || o.type === officer.id?.replace('-', '_'));

            const localHours = Math.round(localHistory.length * 2.5 * 10) / 10;
            const hoursSaved = (officerRoi?.hoursSaved && officerRoi.hoursSaved > 0)
              ? officerRoi.hoursSaved
              : (localHours > 0 ? localHours : 0);

            let lastActionDisplay = officer.lastAction;
            if ((!lastActionDisplay || lastActionDisplay === 'No recent activity') && localHistory.length > 0) {
              const latest = localHistory[0];
              const pPreview = typeof latest === 'string' ? latest : (latest.preview || latest.prompt || 'Session prompt executed');
              const pTime = typeof latest === 'object' && latest.timestamp ? latest.timestamp : 'Recently';
              lastActionDisplay = `${pTime}: "${pPreview.length > 34 ? pPreview.slice(0, 34) + '…' : pPreview}"`;
            }

            return (
              <div key={officer.id || `officer-${idx}`} className="glass-card officer-card" style={{
                padding: '1.5rem', display: 'flex', flexDirection: 'column', '--hover-color': meta.color
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: `${meta.color}20`, border: `1px solid ${meta.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    background: officer.status === 'available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: officer.status === 'available' ? '#10B981' : '#F59E0B',
                    padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: officer.status === 'available' ? '#10B981' : '#F59E0B',
                      animation: officer.status === 'working' ? 'pulse 2s infinite' : 'none'
                    }} />
                    {officer.status === 'working' ? 'Working...' : 'Available'}
                  </div>
                </div>
                
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{meta.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.5', flexGrow: 1, marginBottom: '1.25rem' }}>
                  {meta.desc}
                </p>
                
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
                      Hours Saved
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: localHistory.length > 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: localHistory.length > 0 ? '#93c5fd' : 'rgba(255, 255, 255, 0.45)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                      border: localHistory.length > 0 ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {`${localHistory.length} ${localHistory.length === 1 ? 'Prompt' : 'Prompts'}`}
                    </span>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#f8fafc' }}>{hoursSaved} hrs</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} style={{ flexShrink: 0, color: '#60a5fa' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastActionDisplay}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/officer/${officer.id}`} style={{
                    flex: 1, background: '#2563EB', color: 'white', textDecoration: 'none',
                    textAlign: 'center', padding: '0.625rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                    transition: 'background 0.2s'
                  }} onMouseOver={e => e.target.style.background = '#1d4ed8'} onMouseOut={e => e.target.style.background = '#2563EB'}>
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedOfficerHistory(officer.id)}
                    style={{
                      flex: 1, background: localHistory.length > 0 ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                      border: localHistory.length > 0 ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(255,255,255,0.2)',
                      color: localHistory.length > 0 ? '#93c5fd' : 'white',
                      textAlign: 'center', padding: '0.625rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)'}
                    onMouseOut={e => e.currentTarget.style.background = localHistory.length > 0 ? 'rgba(59, 130, 246, 0.12)' : 'transparent'}
                  >
                    View History {localHistory.length > 0 ? `(${localHistory.length})` : ''}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Recent AI Activity</h2>
          {displayedRecentActivity.length > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              Showing {displayedRecentActivity.length} recent institutional prompt &amp; generation events
            </span>
          )}
        </div>
        
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayedRecentActivity.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem 1rem' }}>
                <Clock size={28} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
                <div>No recent activity to show.</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Interact with any AI Officer above to see your live audit trail here.</div>
              </div>
            ) : null}
            {displayedRecentActivity.map((activity, idx) => {
              const meta = OFFICER_META[activity.officer?.toLowerCase()] || { name: activity.officer, icon: '🤖', color: '#60a5fa' };
              return (
                <React.Fragment key={activity.id || `activity-${idx}`}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 0' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                      background: `${meta.color || '#fff'}20`, border: `1px solid ${meta.color || '#fff'}35`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
                    }}>
                      {meta.icon || '🤖'}
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: meta.color || '#fff' }}>
                          {meta.name || activity.officer}
                        </span>
                        {activity.isLocal && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.05rem 0.4rem', borderRadius: '999px', fontWeight: 600 }}>
                            Session Prompt
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.92rem', color: '#f8fafc', lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {activity.title}
                      </div>
                      <div style={{ marginTop: '0.35rem' }}>
                        <Link
                          to={`/officer/${activity.officer}?history=open&prompt=${encodeURIComponent(activity.prompt || activity.title)}`}
                          style={{ fontSize: '0.78rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <span>Open in Officer →</span>
                        </Link>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.05)',
                      padding: '0.25rem 0.55rem', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0
                    }}>
                      {activity.time}
                    </div>
                  </div>
                  {idx < displayedRecentActivity.length - 1 && (
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginLeft: '54px' }} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Officer History Modal */}
        {selectedOfficerHistory && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(3, 7, 18, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '1.25rem',
            }}
            onClick={() => setSelectedOfficerHistory(null)}
          >
            <div
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '85vh',
                background: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{OFFICER_META[selectedOfficerHistory]?.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>
                      {OFFICER_META[selectedOfficerHistory]?.name} — Session History
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                      {getOfficerLocalHistory(selectedOfficerHistory).length} Saved Prompts &amp; Generations
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOfficerHistory(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem',
                    lineHeight: 1,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {getOfficerLocalHistory(selectedOfficerHistory).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                    <Clock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No prompts recorded in this session yet.</p>
                    <p style={{ margin: '0.25rem 0 1.25rem', fontSize: '0.8rem' }}>Interact with the officer to build your history.</p>
                    <Link
                      to={`/officer/${selectedOfficerHistory}`}
                      style={{
                        display: 'inline-block',
                        background: '#2563EB',
                        color: 'white',
                        padding: '0.55rem 1.1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      Open Officer Now →
                    </Link>
                  </div>
                ) : (
                  getOfficerLocalHistory(selectedOfficerHistory).map((item, idx) => {
                    const promptText = typeof item === 'string' ? item : (item.prompt || item.preview || '');
                    const previewText = typeof item === 'string' ? item : (item.preview || item.prompt || '');
                    const timeText = typeof item === 'object' && item.timestamp ? item.timestamp : 'Recent';
                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={12} /> {timeText}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                            Prompt #{getOfficerLocalHistory(selectedOfficerHistory).length - idx}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: '#f8fafc', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', maxHeight: '180px', overflowY: 'auto' }}>
                          {promptText}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <Link
                            to={`/officer/${selectedOfficerHistory}?history=open&prompt=${encodeURIComponent(promptText)}`}
                            style={{
                              background: 'rgba(37, 99, 235, 0.2)',
                              border: '1px solid rgba(37, 99, 235, 0.4)',
                              color: '#93c5fd',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <span>Open in Officer</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '0.9rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.25)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Link
                    to="/admin-dashboard/audit-logs?category=Officers"
                    style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'underline' }}
                  >
                    View Institutional Audit Logs →
                  </Link>
                  {getOfficerLocalHistory(selectedOfficerHistory).length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleClearOfficerHistory(selectedOfficerHistory)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: 0,
                      }}
                    >
                      <Trash2 size={12} /> Clear Local
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOfficerHistory(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Nav Links */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '2rem', padding: '2rem 0',
          borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem'
        }}>
          <Link to="/ai-terminal" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>AI Terminal</Link>
          <Link to="/digital-twin" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Digital Twin</Link>
          <Link to="/build-manager" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Build Manager</Link>
          <span style={{ cursor: 'pointer' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Settings</span>
        </div>
        
      </div>
    </div>
  );
}
