import { useState } from 'react';
import { Mail, Send, X, Check } from 'lucide-react';
import { getApiBaseURL } from '../config/apiConfig';

export default function EmailReportModal({
  isOpen,
  onClose,
  reportContent,
  title = 'Institutional Report',
  collegeName = 'Sri Sudha Institute of Technology',
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`${getApiBaseURL()}/v1/reports/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          to: email.trim(),
          title,
          collegeName,
          reportContent: reportContent || 'NAAC Accreditation Executive Report',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to dispatch report email');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Email report error:', err);
      setError('Failed to dispatch report. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#F9FAFB',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={20} color="#A78BFA" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Email Institutional Report</h3>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: 0 }}>Send formal PDF analysis to stakeholders</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#10B981' }}>
            <Check size={36} style={{ margin: '0 auto 0.5rem auto' }} />
            <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>Report successfully dispatched!</p>
          </div>
        ) : (
          <form onSubmit={handleSendEmail}>
            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#FCA5A5', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '0.4rem' }}>
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                placeholder="principal@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#D1D5DB',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={16} />
                <span>{loading ? 'Sending...' : 'Send Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
