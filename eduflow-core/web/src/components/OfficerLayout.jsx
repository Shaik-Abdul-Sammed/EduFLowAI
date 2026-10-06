import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Download, Copy, Check, Share2, Mail,
  Paperclip, X, ChevronDown, ChevronUp, Clock, FileJson,
  Sparkles, Printer,
} from 'lucide-react';
import { getApiBaseURL } from '../config/apiConfig';
import { useStreamingOfficer } from '../hooks/useStreamingOfficer';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import MarkdownRenderer from './MarkdownRenderer';
import ShareReportModal from './ShareReportModal';
import EmailReportModal from './EmailReportModal';

/**
 * OfficerLayout — shared layout for all 5 AI Officers.
 *
 * Props:
 *  config: {
 *    type,           // 'accreditation' | 'student-success' | 'timetable' | 'admissions' | 'finance'
 *    endpoint,       // relative path e.g. '/v1/officers/accreditation/stream'
 *    exportEndpoint, // relative path e.g. '/v1/officers/accreditation/export-pdf'
 *    icon,           // emoji
 *    name,           // 'Accreditation Officer'
 *    headerTitle,    // 'AI Accreditation Officer'
 *    headerDesc,     // subtitle text
 *    accentColor,    // '#8B5CF6'
 *    accentLight,    // 'rgba(139,92,246,0.1)'
 *    accentBorder,   // 'rgba(139,92,246,0.3)'
 *    connectingText, // "Connecting to..."
 *    whyStats,       // [{ value, label }]
 *    roiText,        // '₹3,00,000 consulting fees saved'
 *    roiLabel,       // 'ROI Tracker'
 *    suggestedPrompts, // [string]
 *    leftActions,    // [{ label, icon: JSX }]
 *    leftStats,      // JSX or null
 *    institutionName, // for PDF export
 *  }
 *  topBarExtra:      // optional JSX rendered above input bar (e.g. criterion selector)
 *  payloadBuilder:   // optional fn(promptText, uploadedFile) => payload object
 */
export default function OfficerLayout({ config, topBarExtra = null, payloadBuilder = null }) {
  const {
    type, endpoint, exportEndpoint,
    icon, name, headerTitle, headerDesc,
    accentColor, accentLight, accentBorder,
    connectingText,
    whyStats = [],
    roiText, roiLabel,
    suggestedPrompts = [],
    leftActions = [],
    leftStats = null,
    institutionName = 'Sri Siddhartha Institute of Technology',
  } = config;

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(null); // null | 'clipboard' | 'copy-btn'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showWhyThis, setShowWhyThis] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [shareContent, setShareContent] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { addToast } = useToast();
  const { user } = useAuth();
  const { tokens, status, error, start, stop } = useStreamingOfficer();

  const [staffPermission, setStaffPermission] = useState(null);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);

  const deptName = user?.department || 'Computer Science & Engineering';
  const isDeptScoped = ['hod', 'faculty', 'staff'].includes(user?.role);

  useEffect(() => {
    if (user?.role === 'staff') {
      const fetchPerms = async () => {
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
          const res = await fetch(`${getApiBaseURL()}/v1/staff/my-permissions`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            const perm = (data.permissions || []).find((p) => p.officer_key === type);
            setStaffPermission(perm || null);
          } else {
            if (type === 'timetable') {
              setStaffPermission({ permission_level: 'DRAFT', is_active: true });
            }
          }
        } catch {
          if (type === 'timetable') {
            setStaffPermission({ permission_level: 'DRAFT', is_active: true });
          }
        } finally {
          setHasCheckedPermission(true);
        }
      };
      fetchPerms();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasCheckedPermission(true);
    }
  }, [user, type]);

  // Latest assistant message for share/email/export
  const latestAssistantContent = messages.filter((m) => m.role === 'assistant').pop()?.content || tokens || '';

  // ── Scroll ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tokens]);

  // ── Error toast ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      addToast('The officer is temporarily unavailable. Please try again.', 'danger');
    }
  }, [error, addToast]);

  // ── Persist streamed response into messages when done ──────────────────────
  useEffect(() => {
    if (status === 'done' && tokens) {
      const timer = setTimeout(() => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.content === tokens) return prev;
          const newMsg = { role: 'assistant', content: tokens, timestamp: Date.now() };
          // Save to session history
          setSessionHistory((h) => [{ id: Date.now(), preview: tokens.slice(0, 60) + '...', content: tokens, timestamp: new Date().toLocaleTimeString() }, ...h.slice(0, 19)]);
          return [...prev, newMsg];
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, tokens]);

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = (text) => {
    const promptText = (text || inputValue).trim();

    // Phase 7: empty prompt guard
    if (!promptText) {
      addToast('Please enter a prompt or click a suggested prompt first.', 'warning');
      textareaRef.current?.focus();
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: promptText, timestamp: Date.now() }]);
    setInputValue('');
    setUploadedFile(null);

    const fullEndpoint = `${getApiBaseURL()}${endpoint}`;
    const payload = payloadBuilder
      ? payloadBuilder(promptText, uploadedFile)
      : { reportType: promptText, action: promptText };

    start(fullEndpoint, payload);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Copy ───────────────────────────────────────────────────────────────────
  const handleCopy = async (content, btnId) => {
    const text = content || latestAssistantContent;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(btnId);
      addToast('Report copied to clipboard', 'success');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      addToast('Could not copy to clipboard. Please select text manually.', 'warning');
    }
  };

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleDownloadPdf = async (content) => {
    const text = content || latestAssistantContent;
    if (!text) {
      addToast('No report content available to download.', 'warning');
      return;
    }
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`${getApiBaseURL()}${exportEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, institutionName }),
      });
      if (!response.ok) throw new Error('PDF export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduflow-${type}-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('PDF report downloaded successfully.', 'success');
    } catch {
      addToast('PDF export failed. Please try again.', 'danger');
    }
  };

  // ── Print view ─────────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!latestAssistantContent) {
      addToast('No report to print.', 'warning');
      return;
    }
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>${headerTitle} Report</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 2rem; color: #111; }
        h1 { font-size: 1.5rem; } table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>${headerTitle} — ${institutionName}</h1>
      <hr/>
      <pre style="white-space:pre-wrap;font-family:inherit">${latestAssistantContent.replace(/</g, '&lt;')}</pre>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      // Ctrl+Enter → Send
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
      // Esc → Stop streaming
      if (e.key === 'Escape' && (status === 'streaming' || status === 'connecting')) {
        stop();
        addToast('Stream stopped.', 'info');
      }
      // Ctrl+S → Export PDF
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (latestAssistantContent) handleDownloadPdf(latestAssistantContent);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, inputValue, latestAssistantContent]);

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleDownloadCsv = (content) => {
    const text = content || latestAssistantContent;
    if (!text) { addToast('No report to export as CSV.', 'warning'); return; }
    const rows = text.split('\n').map((line) => [`"${line.replace(/"/g, '""')}"`]);
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduflow-${type}-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported.', 'success');
  };

  // ── Export JSON ────────────────────────────────────────────────────────────
  const handleDownloadJson = (content) => {
    const text = content || latestAssistantContent;
    if (!text) { addToast('No report to export as JSON.', 'warning'); return; }
    const payload = { officer: type, institutionName, generatedAt: new Date().toISOString(), report: text };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduflow-${type}-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('JSON exported.', 'success');
  };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['.pdf', '.xlsx', '.xls', '.csv', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      addToast('Unsupported file type. Please upload PDF, Excel, CSV, DOCX, or TXT.', 'warning');
      return;
    }
    setUploadedFile(file);
    addToast(`File attached: ${file.name}`, 'success');
  };

  // ── Share / Email helpers ──────────────────────────────────────────────────
  const openShare = (content) => {
    setShareContent(content || latestAssistantContent);
    setShareOpen(true);
  };
  const openEmail = (content) => {
    setShareContent(content || latestAssistantContent);
    setEmailOpen(true);
  };

  // ── History load ───────────────────────────────────────────────────────────
  const loadFromHistory = (item) => {
    setMessages([{ role: 'assistant', content: item.content, timestamp: item.id }]);
    setShowHistory(false);
    addToast('Session loaded from history.', 'info');
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const ActionRow = ({ content, msgId }) => (
    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => handleCopy(content, `copy-${msgId}`)}
        style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0' }}>
        {copied === `copy-${msgId}` ? <Check size={13} color="#10B981" /> : <Copy size={13} />} Copy
      </button>
      <button type="button" onClick={() => handleDownloadPdf(content)}
        style={{ ...btnStyle, background: accentLight, border: `1px solid ${accentBorder}`, color: accentColor }}>
        <Download size={13} /> PDF
      </button>
      <button type="button" onClick={() => handleDownloadCsv(content)}
        style={{ ...btnStyle, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
        <FileJson size={13} /> CSV
      </button>
      <button type="button" onClick={() => handleDownloadJson(content)}
        style={{ ...btnStyle, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
        <FileJson size={13} /> JSON
      </button>
      <button type="button" onClick={() => openShare(content)}
        style={{ ...btnStyle, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
        <Share2 size={13} /> Share
      </button>
      <button type="button" onClick={() => openEmail(content)}
        style={{ ...btnStyle, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
        <Mail size={13} /> Email
      </button>
      <button type="button" onClick={handlePrint}
        style={{ ...btnStyle, background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.4)', color: '#9ca3af' }}>
        <Printer size={13} /> Print
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E27', color: 'white', fontFamily: '"Inter", sans-serif', display: 'flex', overflow: 'hidden' }}>

      {/* ── Left panel ── */}
      <div style={{ width: '340px', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/officers-dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0 }}>
              <span>{icon}</span> {name}
            </h1>
            <span style={{ background: accentLight, color: accentColor, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold' }}>AI Active</span>
          </div>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {/* Quick actions */}
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 'bold' }}>Quick Actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {leftActions.map((action, idx) => (
              <button key={idx} onClick={() => handleSend(action.label)}
                style={{ background: accentLight, border: `1px solid ${accentBorder}`, color: 'white', padding: '0.65rem 0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', transition: 'opacity 0.2s' }}>
                {action.icon} {action.label}
              </button>
            ))}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '1.5rem 0' }} />

          {/* Left stats */}
          {leftStats}

          {/* ROI card */}
          <div style={{ marginTop: '1.5rem', background: `linear-gradient(135deg, ${accentLight}, rgba(6,182,212,0.15))`, padding: '1rem', borderRadius: '12px', border: `1px solid ${accentBorder}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Sparkles color={accentColor} size={22} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{roiLabel}</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{roiText}</div>
            </div>
          </div>

          {/* Session history */}
          <div style={{ marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowHistory((v) => !v)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '0.6rem 0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14} /> Session History ({sessionHistory.length})</span>
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showHistory && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '200px', overflowY: 'auto' }}>
                {sessionHistory.length === 0
                  ? <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', padding: '0.5rem 0' }}>No history yet.</p>
                  : sessionHistory.map((item) => (
                    <button key={item.id} type="button" onClick={() => loadFromHistory(item)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.76rem' }}>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{item.timestamp}</div>
                      {item.preview}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0 }}>

        {/* Header */}
        <div style={{ padding: '1.15rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,14,39,0.85)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.3rem' }}>{icon}</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0 }}>{headerTitle}</h2>
              <span style={{ background: status === 'streaming' ? 'rgba(16,185,129,0.15)' : accentLight, color: status === 'streaming' ? '#10B981' : accentColor, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {status === 'idle' ? 'Ready' : status === 'connecting' ? 'Connecting…' : status === 'streaming' ? '● Streaming' : status === 'done' ? 'Done' : 'Error'}
              </span>
              {isDeptScoped && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, border: '1px solid rgba(59,130,246,0.3)' }}>
                  Showing data for {deptName}
                </span>
              )}
              {user?.role === 'staff' && staffPermission && (
                <span style={{ fontSize: '0.72rem', background: staffPermission.permission_level === 'DRAFT' ? 'rgba(245,158,11,0.15)' : staffPermission.permission_level === 'VIEW_ONLY' ? 'rgba(107,114,128,0.2)' : 'rgba(16,185,129,0.15)', color: staffPermission.permission_level === 'DRAFT' ? '#f59e0b' : staffPermission.permission_level === 'VIEW_ONLY' ? '#9ca3af' : '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  {staffPermission.permission_level}
                </span>
              )}
            </div>
            {/* Top-right actions */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {latestAssistantContent && (
                <>
                  <button type="button" onClick={() => openShare()} title="Share report" style={iconBtnStyle}><Share2 size={15} /></button>
                  <button type="button" onClick={() => openEmail()} title="Email report" style={iconBtnStyle}><Mail size={15} /></button>
                  <button type="button" onClick={handlePrint} title="Print report" style={iconBtnStyle}><Printer size={15} /></button>
                </>
              )}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{headerDesc}</p>

          {/* Suggested prompts */}
          <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.7rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', alignSelf: 'center' }}>Try:</span>
            {suggestedPrompts.map((prompt, idx) => (
              <button key={idx} type="button" onClick={() => handleSend(prompt)}
                style={{ background: accentLight, border: `1px solid ${accentBorder}`, color: accentColor, padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', cursor: 'pointer', transition: 'opacity 0.2s' }}>
                {prompt}
              </button>
            ))}
          </div>

          {/* Phase 8: Why This Matters */}
          {whyStats.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <button type="button" onClick={() => setShowWhyThis((v) => !v)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0 }}>
                <Sparkles size={12} color={accentColor} /> Why This Matters {showWhyThis ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showWhyThis && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', padding: '0.85rem 1rem', background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: '10px', flexWrap: 'wrap' }}>
                  {whyStats.map((s, i) => (
                    <div key={i} style={{ minWidth: '120px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem', color: accentColor }}>{s.value}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.2rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Conversation body ── */}
        {user?.role === 'staff' && hasCheckedPermission && !staffPermission ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>
              🔒
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Access Restricted</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '440px', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              You do not have permission to access the {name}. Non-teaching staff access requires permission delegated by your HOD or Dean.
            </p>
            {accessRequested ? (
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                ✓ Access Request Sent to HOD
              </span>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
                    await fetch(`${getApiBaseURL()}/v1/staff/request-access`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({ officerKey: type, reason: `Staff requested access to ${name}` }),
                    });
                    setAccessRequested(true);
                    addToast(`Access request for ${name} submitted to HOD!`, 'success');
                  } catch {
                    setAccessRequested(true);
                    addToast(`Access request for ${name} submitted to HOD!`, 'success');
                  }
                }}
                style={{ background: '#2563EB', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Request Access
              </button>
            )}
          </div>
        ) : messages.length === 0 && status === 'idle' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', marginBottom: '1.25rem', border: `1px solid ${accentBorder}`, boxShadow: `0 0 30px ${accentLight}` }}>
              {icon}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>{name} Workspace</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '440px', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Type a prompt or select a suggested query above to get started. Use <kbd style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '3px', padding: '1px 4px', fontSize: '0.75rem' }}>Ctrl+Enter</kbd> to send, <kbd style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '3px', padding: '1px 4px', fontSize: '0.75rem' }}>Esc</kbd> to stop streaming.
            </p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.4rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: msg.role === 'user' ? '#2563EB' : accentLight, border: msg.role === 'user' ? 'none' : `1px solid ${accentBorder}` }}>
                  {msg.role === 'user' ? 'U' : icon}
                </div>
                <div style={{ background: msg.role === 'user' ? '#2563EB' : 'rgba(255,255,255,0.05)', padding: '1rem 1.15rem', borderRadius: '12px', maxWidth: '82%', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)', lineHeight: '1.6', position: 'relative' }}>
                  {msg.role === 'assistant'
                    ? <MarkdownRenderer content={msg.content} />
                    : msg.content
                  }
                  {msg.role === 'assistant' && (
                    <ActionRow content={msg.content} msgId={i} />
                  )}
                </div>
              </div>
            ))}

            {/* Live streaming card */}
            {(status === 'streaming' || (status === 'connecting' && tokens)) && (
              <div style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.4rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: accentLight, border: `1px solid ${accentBorder}` }}>
                  {icon}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.15rem', borderRadius: '12px', maxWidth: '82%', border: `1px solid ${accentBorder}`, lineHeight: '1.6' }}>
                  <MarkdownRenderer content={tokens || ''} />
                  <span style={{ display: 'inline-block', width: '7px', height: '14px', background: accentColor, marginLeft: '3px', verticalAlign: 'text-bottom', animation: 'obs-blink 1s infinite' }} />
                </div>
              </div>
            )}

            {status === 'connecting' && !tokens && (
              <div style={{ color: accentColor, fontSize: '0.82rem', fontStyle: 'italic', margin: '0.5rem 0' }}>
                [{name}]: {connectingText}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── Input bar ── */}
        <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#0A0E27', flexShrink: 0 }}>
          {/* Phase 10: file attachment preview */}
          {uploadedFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.75rem', background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: '8px', marginBottom: '0.6rem', fontSize: '0.82rem', color: accentColor }}>
              <Paperclip size={14} />
              <span style={{ flex: 1 }}>{uploadedFile.name}</span>
              <button type="button" onClick={() => setUploadedFile(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
            </div>
          )}

          {/* topBarExtra (e.g. criterion selector) */}
          {topBarExtra}

          {user?.role === 'staff' && staffPermission?.permission_level === 'VIEW_ONLY' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#9ca3af', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span>👁️ VIEW_ONLY Permission: You can view reports, but generating new prompts is disabled for your staff account.</span>
            </div>
          ) : user?.role === 'staff' && hasCheckedPermission && !staffPermission ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.82rem', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span>🔒 Officer access restricted. Please click &quot;Request Access&quot; above to request delegation from your HOD.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.4rem 0.5rem 0.4rem 0.75rem', gap: '0.4rem' }}>
              {/* File upload button */}
              <button type="button" title="Attach file (PDF, Excel, CSV, TXT)" onClick={() => fileInputRef.current?.click()}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', flexShrink: 0, alignSelf: 'flex-end' }}>
                <Paperclip size={17} />
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls,.csv,.docx,.txt" style={{ display: 'none' }} onChange={handleFileChange} />

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your prompt… (Ctrl+Enter to send)"
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '0.6rem 0', fontSize: '0.92rem', resize: 'none', outline: 'none', minHeight: '40px', maxHeight: '110px' }}
                rows={1}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, alignSelf: 'flex-end' }}>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)' }}>{inputValue.length}/2000</span>
                {user?.role === 'staff' && staffPermission?.permission_level === 'DRAFT' && (
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    Requires Approval
                  </span>
                )}
                {(status === 'streaming' || status === 'connecting') && (
                  <button type="button" onClick={stop} title="Stop streaming (Esc)"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                )}
                <button type="button" onClick={() => handleSend()}
                  disabled={status === 'streaming' || status === 'connecting'}
                  style={{ background: status === 'streaming' || status === 'connecting' ? 'rgba(255,255,255,0.08)' : accentColor, color: status === 'streaming' || status === 'connecting' ? 'rgba(255,255,255,0.3)' : 'white', border: 'none', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: status === 'streaming' || status === 'connecting' ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.22)', margin: '0.4rem 0 0 0.25rem' }}>
            Ctrl+Enter to send · Esc to stop · Ctrl+S to export PDF
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      <ShareReportModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        reportContent={shareContent}
        title={`${headerTitle} Report`}
        collegeName={institutionName}
      />
      <EmailReportModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        reportContent={shareContent}
        title={`${headerTitle} Report`}
      />
    </div>
  );
}

// ── Shared inline button styles ──────────────────────────────────────────────
const btnStyle = {
  padding: '0.3rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.73rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'opacity 0.2s',
};

const iconBtnStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.65)',
  borderRadius: '7px',
  padding: '0.35rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
