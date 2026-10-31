import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Bell, Settings, ArrowUp, ArrowDown, Clock, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getFullApiUrl } from '../../config/apiConfig';

const OFFICER_META = {
  'accreditation': { icon: '🏛️', color: '#8B5CF6', name: 'AI Accreditation Officer', desc: 'NAAC, NBA, AICTE & UGC report generation, gap analysis, readiness scoring', statLabel: 'Reports Generated' },
  'timetable': { icon: '📅', color: '#2563EB', name: 'AI Timetable Officer', desc: 'Conflict-free timetable generation considering faculty workload and room availability', statLabel: 'Conflicts Resolved' },
  'admissions': { icon: '🎓', color: '#10B981', name: 'AI Admission Officer', desc: 'End-to-end admissions automation — queries, verification, documents, counselling', statLabel: 'Applications Processed' },
  'finance': { icon: '💰', color: '#F59E0B', name: 'AI Finance Officer', desc: 'Fee reconciliation, UPI matching, bank statement analysis, scholarship tracking', statLabel: 'Amount Reconciled' },
  'student-success': { icon: '📊', color: '#EF4444', name: 'AI Student Success Officer', desc: 'Dropout prediction, attendance monitoring, placement readiness, intervention plans', statLabel: 'Students Monitored' }
};

export default function OfficersDashboard() {
  const navigate = useNavigate();
  const [roi, setRoi] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Cpu color="#60a5fa" size={28} />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }} className="gradient-text">
            EduFlow AI OS
          </span>
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
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{roi?.totalHoursSaved || 0}</span>
                <span style={{ fontSize: '0.875rem', color: '#10B981', display: 'flex', alignItems: 'center' }}><ArrowUp size={14} /> Active</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                <TrendingUp size={16} /> Money Saved
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{roi?.totalMoneySaved?.toLocaleString() || 0}</span>
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

        {/* Your AI Officers */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Your AI Officers</h2>
        
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem'
        }}>
          {loading ? <div>Loading Officers...</div> : officers.map((officer, idx) => {
            const meta = OFFICER_META[officer.id];
            const officerRoi = roi?.byOfficer?.find(o => o.type === officer.id);
            return (
              <div key={officer.id || idx} className="glass-card officer-card" style={{
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
                
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>
                    Hours Saved
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{officerRoi?.hoursSaved || 0} hrs</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '-1px' }}/>
                    {officer.lastAction}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/officer/${officer.id}`} style={{
                    flex: 1, background: '#2563EB', color: 'white', textDecoration: 'none',
                    textAlign: 'center', padding: '0.625rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
                    transition: 'background 0.2s'
                  }} onMouseOver={e => e.target.style.background = '#1d4ed8'} onMouseOut={e => e.target.style.background = '#2563EB'}>
                    Open
                  </Link>
                  <Link to="/admin/audit-logs?category=Officers" style={{
                    flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                    textAlign: 'center', padding: '0.625rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
                    cursor: 'pointer', transition: 'background 0.2s', textDecoration: 'none'
                  }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background = 'transparent'}>
                    View History
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Recent AI Activity</h2>
        
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentActivity.length === 0 ? <div style={{ color: 'rgba(255,255,255,0.5)' }}>No recent activity to show.</div> : null}
            {recentActivity.map((activity, idx) => {
              const meta = OFFICER_META[activity.officer.toLowerCase()] || {};
              return (
                <React.Fragment key={activity.id || idx}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 0' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: `${meta.color || '#fff'}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
                    }}>
                      {meta.icon || '🤖'}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: meta.color || '#fff', marginBottom: '0.25rem' }}>
                        {meta.name || activity.officer}
                      </div>
                      <div style={{ fontSize: '0.95rem' }}>
                        {activity.metadata?.actionType || 'General Request'} processed
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)',
                      padding: '0.25rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap'
                    }}>
                      {new Date(activity.time).toLocaleString()}
                    </div>
                  </div>
                  {idx < recentActivity.length - 1 && (
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginLeft: '56px' }} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

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
