import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Clock, Users, Calendar, Download, Copy, Check } from 'lucide-react';
import { getApiBaseURL } from '../../../config/apiConfig';
import { useStreamingOfficer } from '../../../hooks/useStreamingOfficer';
import { useToast } from '../../../context/ToastContext';

const SUGGESTED_PROMPTS = [
  "Generate conflict-free timetable for CSE Department",
  "Optimize faculty workload balancing across sections",
  "Resolve computer laboratory allocation conflicts",
];

export default function TimetableOfficer() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  const { addToast } = useToast();
  const { tokens, status, error, start } = useStreamingOfficer();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, tokens]);

  useEffect(() => {
    if (error) {
      console.error('Timetable stream error:', error);
      addToast('The officer is temporarily unavailable. Please try again.', 'danger');
    }
  }, [error, addToast]);

  useEffect(() => {
    if (status === 'done' && tokens) {
      const timer = setTimeout(() => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.content === tokens) return prev;
          return [...prev, { role: 'assistant', content: tokens }];
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, tokens]);

  const handleSend = useCallback(
    (text) => {
      const promptText = (text || inputValue).trim();
      if (!promptText) return;

      setMessages((prev) => [...prev, { role: 'user', content: promptText }]);
      setInputValue('');

      const endpoint = `${getApiBaseURL()}/v1/officers/timetable/stream`;
      start(endpoint, { action: promptText });
    },
    [inputValue, start]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content) => {
    const textToCopy = content || tokens || (messages.filter((m) => m.role === 'assistant').pop()?.content) || '';
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      addToast('Timetable copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      addToast('Could not copy to clipboard. Please select text manually.', 'warning');
    }
  };

  const handleDownloadPdf = async (content) => {
    const textToExport = content || tokens || (messages.filter((m) => m.role === 'assistant').pop()?.content) || '';
    if (!textToExport) {
      addToast('No timetable content available to download.', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`${getApiBaseURL()}/v1/officers/timetable/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: textToExport,
          institutionName: 'Sri Siddhartha Institute of Technology',
        }),
      });

      if (!response.ok) throw new Error('PDF export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduflow-timetable-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addToast('Timetable PDF downloaded successfully.', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      addToast('The officer is temporarily unavailable. Please try again.', 'danger');
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split('**').map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}
        <br />
      </span>
    ));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0E27',
      color: 'white',
      fontFamily: '"Inter", sans-serif',
      display: 'flex',
      overflow: 'hidden',
    }}>
      {/* Left Panel */}
      <div style={{
        width: '380px',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/officers-dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem',
          }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
              <span style={{ fontSize: '1.5rem' }}>🗓️</span> Timetable Officer
            </h1>
            <span style={{
              background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa',
              padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
            }}>Optimizing</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', fontWeight: 'bold' }}>
            Automated Generation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              "Generate Conflict-Free Semester Schedule",
              "Balance Faculty Workload (Max 18 hrs)",
              "Optimize Lab Studio Bookings",
              "Draft Examination Block Slots",
            ].map((action, idx) => (
              <button key={idx} onClick={() => handleSend(action)} style={{
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                color: 'white', padding: '0.75rem 1rem', borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontSize: '0.9rem',
              }}>
                <Calendar size={18} color="#a78bfa" /> {action}
              </button>
            ))}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />

          <h3 style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', fontWeight: 'bold' }}>
            Optimization Constraints
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="#38bdf8" /> Faculty Hours</span>
                <span className="font-bold text-emerald-400">15.4 hrs/wk avg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} color="#a78bfa" /> Lab Allocations</span>
                <span className="font-bold">3 Parallel Studios</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#10B981' }}>●</span> Room Conflicts</span>
                <span className="font-bold text-emerald-400">0 Conflicts</span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '2rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
            padding: '1rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <Sparkles color="#a78bfa" size={24} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hours Saved</div>
              <div style={{ fontWeight: 'bold' }}>40 hours administrative work</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
        <div style={{
          padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10, 14, 39, 0.8)', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🗓️</span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>AI Timetable Officer</h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            Constraint satisfaction engine balancing faculty workload, lab requirements, and room capacities.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', alignSelf: 'center', marginRight: '0.25rem' }}>
              Suggested prompts:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#c4b5fd',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {messages.length === 0 && status === 'idle' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '1.5rem',
              border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)',
            }}>
              🗓️
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Timetable Optimization Workspace</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '480px', textAlign: 'center', marginBottom: '2rem' }}>
              Ask the officer anything about conflict-free scheduling, room allocations, or faculty workload.
            </p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1rem', marginBottom: '1.5rem',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  background: msg.role === 'user' ? '#2563EB' : 'rgba(139, 92, 246, 0.2)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(139, 92, 246, 0.5)',
                }}>
                  {msg.role === 'user' ? 'SA' : '🗓️'}
                </div>
                <div style={{
                  background: msg.role === 'user' ? '#2563EB' : 'rgba(255,255,255,0.05)',
                  padding: '1.2rem', borderRadius: '12px', maxWidth: '82%',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  lineHeight: '1.6', position: 'relative',
                }}>
                  {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}

                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content)}
                        style={{
                          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                          color: '#e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '6px',
                          fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer',
                        }}
                      >
                        {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />} Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(msg.content)}
                        style={{
                          background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)',
                          color: '#c4b5fd', padding: '0.35rem 0.75rem', borderRadius: '6px',
                          fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer',
                        }}
                      >
                        <Download size={13} /> Download PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {status === 'streaming' && (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexDirection: 'row' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.5)',
                }}>
                  🗓️
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', maxWidth: '82%',
                  border: '1px solid rgba(139, 92, 246, 0.3)', lineHeight: '1.6',
                }}>
                  {formatMessage(tokens)}
                  <span style={{
                    display: 'inline-block', width: '8px', height: '16px', background: '#a78bfa',
                    marginLeft: '4px', verticalAlign: 'text-bottom', animation: 'obs-blink 1s infinite',
                  }} />
                </div>
              </div>
            )}

            {status === 'connecting' && (
              <div style={{ color: '#a78bfa', fontSize: '0.85rem', fontStyle: 'italic', margin: '0.5rem 0' }}>
                [Timetable Officer]: Evaluating constraint satisfaction engine and room grids...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#0A0E27' }}>
          <div style={{
            display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '0.5rem',
          }}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to generate timetables, resolve slot conflicts, optimize faculty hours..."
              style={{
                flex: 1, background: 'transparent', border: 'none', color: 'white',
                padding: '0.75rem', fontSize: '0.95rem', resize: 'none', outline: 'none', minHeight: '44px', maxHeight: '120px',
              }}
              rows={1}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || status === 'streaming'}
              style={{
                background: inputValue.trim() && status !== 'streaming' ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                color: inputValue.trim() && status !== 'streaming' ? 'white' : 'rgba(255,255,255,0.3)',
                border: 'none', width: '44px', height: '44px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: inputValue.trim() && status !== 'streaming' ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
