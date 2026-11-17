// OfficerPlaceholder: Early access waitlist and phase-2 reservation gateway for upcoming AI officers.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Bell, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { wakeUpFetch } from '../../../utils/wakeUpHandler';
import { useToast } from '../../../context/ToastContext';

export default function OfficerPlaceholder({ officerName = 'Specialized AI Officer', icon = '🤖', color = '#6366F1', desc = 'Specialized autonomous copilot for institutional operations.', features = [] }) {
  const { addToast } = useToast?.() || { addToast: () => {} };
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(null);

  const handleNotifyMe = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await wakeUpFetch('/v1/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ai_officer_waitlist',
          priority: 'medium',
          subject: `Early Access Waitlist: ${officerName}`,
          description: `User requested phase-2 automated notification and beta deployment for ${officerName}.`
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to register waitlist interest`);
      }

      setSubscribed(true);
      addToast(`You are registered on the ${officerName} priority access list!`, 'success');
    } catch (err) {
      setError(err.message || 'Unable to register interest. Please try again.');
      addToast(err.message || 'Waitlist registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0E27',
      color: 'white',
      fontFamily: '"Inter", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px',
        background: `radial-gradient(circle, ${color}20 0%, rgba(10,14,39,0) 70%)`,
        zIndex: 0, pointerEvents: 'none'
      }} />

      <Link to="/officers-dashboard" style={{
        position: 'absolute', top: '2rem', left: '2rem',
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem',
        zIndex: 10
      }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', padding: '3rem', maxWidth: '600px', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 1, backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        
        <div style={{
          width: '96px', height: '96px', borderRadius: '50%',
          background: `${color}15`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
          marginBottom: '1.5rem', boxShadow: `0 0 30px ${color}20`
        }}>
          {icon}
        </div>

        <span style={{
          background: 'rgba(255,255,255,0.1)', color: 'white',
          padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold',
          letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.5rem'
        }}>
          Coming in Phase 2
        </span>

        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
          {officerName}
        </h1>
        
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.125rem', lineHeight: '1.6' }}>
          {desc}
        </p>

        {features.length > 0 && (
          <div style={{ width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
              Planned Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ color, marginTop: '0.125rem' }}>
                    <Check size={16} />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div data-testid="placeholder-error" style={{ width: '100%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', fontSize: '0.875rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              data-testid="placeholder-retry"
              onClick={handleNotifyMe}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        )}

        {subscribed ? (
          <div data-testid="placeholder-success" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 600 }}>
            <CheckCircle2 size={20} />
            <span>You are on the priority beta waitlist!</span>
          </div>
        ) : (
          <button
            data-testid="placeholder-notify-btn"
            disabled={submitting}
            onClick={handleNotifyMe}
            style={{
              background: color, color: 'white', border: 'none',
              padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'transform 0.2s, filter 0.2s'
            }}
            onMouseOver={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; } }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            {submitting ? (
              <>
                <RefreshCw size={20} className="animate-spin" data-testid="placeholder-loading" />
                Registering for Early Access...
              </>
            ) : (
              <>
                <Bell size={20} />
                Notify me when available
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
