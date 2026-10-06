import { useState, useEffect } from 'react';
import { Share2, Copy, Check, MessageCircle, X } from 'lucide-react';
import { getApiBaseURL } from '../config/apiConfig';

export default function ShareReportModal({
  isOpen,
  onClose,
  reportContent,
  title = 'Institutional Report',
  collegeName = 'Sri Sudha Institute of Technology',
}) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setShareUrl('');
    setCopied(false);
    setError('');
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    const generateShareLink = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const response = await fetch(`${getApiBaseURL()}/v1/reports/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            reportContent: reportContent || 'NAAC Accreditation Executive Report',
            title,
            collegeName,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate secure share link');
        }

        const data = await response.json();
        const url = data.shareUrl || `https://eduflow-web.onrender.com/r/${data.token}`;
        if (!ignore) {
          setShareUrl(url);
        }
      } catch (err) {
        console.error('Error sharing report:', err);
        if (!ignore) {
          setError('Could not generate share link. Please try again.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    generateShareLink();

    return () => {
      ignore = true;
    };
  }, [isOpen, reportContent, title, collegeName]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Review this confidential institutional report from ${collegeName}:\n${shareUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

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
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#F9FAFB',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Share2 size={20} color="#60A5FA" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Share Institutional Report</h3>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: 0 }}>Secure, read-only link for administrators and auditors</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
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

        {loading ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: '#9CA3AF' }}>
            <p style={{ margin: 0 }}>Generating encrypted share link...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#FCA5A5', marginBottom: '1rem' }}>
            {error}
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '0.4rem' }}>
              Public Share URL
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#93C5FD',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: copied ? '#10B981' : '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                }}
              >
                <MessageCircle size={18} />
                <span>Share on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
