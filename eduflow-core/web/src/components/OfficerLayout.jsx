import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Download, Copy, Check, Share2, Mail,
  Paperclip, X, ChevronDown, ChevronUp, Clock, FileJson,
  Sparkles, Printer, Eye, Edit, Brain, ShieldCheck, CheckCircle, AlertTriangle,
  PanelLeftClose, PanelLeftOpen, PanelLeft, Image as ImageIcon, ZoomIn, ZoomOut,
  RotateCw, Table as TableIcon, Code, FileText, Trash2,
} from 'lucide-react';
import { getApiBaseURL } from '../config/apiConfig';
import { safeJson } from '../utils/wakeUpHandler';
import { useStreamingOfficer } from '../hooks/useStreamingOfficer';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { evaluateExpertSystem } from '../services/expertSystemRules';
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
const OFFICER_SUGGESTED_NEXT_PROMPTS = {
  accreditation: ['Generate Criteria 3', 'Show DVV gaps', 'Download PDF report'],
  'student-success': ['Show top 10 at-risk', 'Generate mentor plan', 'Compare departments'],
  timetable: ['Check room clashes', 'Generate faculty load chart', 'Resolve lab conflicts'],
  admissions: ['Predict branch-wise yield', 'Show conversion drop-offs', 'Generate follow-up queue'],
  finance: ['List top 10 defaulters', 'Show 60-day fee aging', 'Reconcile bank deposits'],
};

export default function OfficerLayout({ config, topBarExtra = null, payloadBuilder = null, onInputChange = null }) {
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

  const officerSuggestions = config?.suggestedNextPrompts || OFFICER_SUGGESTED_NEXT_PROMPTS[type] || [
    'Explain key metrics',
    'Generate detailed breakdown table',
    'Download PDF report',
  ];

  // ── Context & Custom Hooks (moved to top to prevent TDZ ReferenceError) ───
  const { addToast } = useToast();
  const { user } = useAuth();
  const { tokens, status, error, start, stop } = useStreamingOfficer();

  const handleSuggestedNextPrompt = (promptText) => {
    setInputValue(promptText);
    if (typeof onInputChange === 'function') {
      onInputChange(promptText);
    }
    handleSend(promptText);
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('officer_sidebar_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('officer_sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

  // ── Temporary Chat State ───────────────────────────────────────────────────
  const [isTemporaryChat, setIsTemporaryChat] = useState(() => {
    try {
      return sessionStorage.getItem(`officer_temp_chat_${type || 'default'}`) === 'true';
    } catch {
      return false;
    }
  });

  const toggleTemporaryChat = () => {
    setIsTemporaryChat((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(`officer_temp_chat_${type || 'default'}`, String(next));
      } catch {}
      if (next) {
        addToast('⚡ Temporary Chat activated. Messages will not be saved to history.', 'info');
      } else {
        addToast('Temporary Chat disabled. Normal history tracking resumed.', 'info');
      }
      return next;
    });
  };

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(null); // null | 'clipboard' | 'copy-btn'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [previewPicModal, setPreviewPicModal] = useState(null); // { url, name, size }
  const [picZoom, setPicZoom] = useState(1);
  const [picRotation, setPicRotation] = useState(0);

  useEffect(() => {
    if (uploadedFile && uploadedFile.type && uploadedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(uploadedFile);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [uploadedFile]);

  const handlePicPreview = (picData) => {
    setPicZoom(1);
    setPicRotation(0);
    setPreviewPicModal(picData);
  };

  const [showWhyThis, setShowWhyThis] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`officer_history_${type || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [connectionTimedOut, setConnectionTimedOut] = useState(false);

  useEffect(() => {
    let timer;
    if (status === 'connecting') {
      timer = setTimeout(() => {
        setConnectionTimedOut(true);
      }, 12000);
    } else {
      setConnectionTimedOut(false);
    }
    return () => clearTimeout(timer);
  }, [status]);
  const [shareOpen, setShareOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [docZoom, setDocZoom] = useState(1);
  const [previewTab, setPreviewTab] = useState('a4'); // 'a4' | 'table' | 'raw'
  const [shareContent, setShareContent] = useState('');
  const [expertSystemOpen, setExpertSystemOpen] = useState(false);
  const expertDomain = evaluateExpertSystem(type);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 52), 160);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [inputValue]);

  const [staffPermission, setStaffPermission] = useState(null);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);

  const deptName = user?.department || 'Computer Science & Engineering';
  const isDeptScoped = ['hod', 'faculty', 'staff'].includes(user?.role);

  useEffect(() => {
    let isMounted = true;
    if (user?.role === 'staff') {
      const fetchPerms = async () => {
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
          const res = await fetch(`${getApiBaseURL()}/v1/staff/my-permissions`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!isMounted) return;
          if (res.ok) {
            const data = await safeJson(res);
            const perm = (data.permissions || []).find((p) => p.officer_key === type);
            if (isMounted) setStaffPermission(perm || null);
          } else {
            if (type === 'timetable' && isMounted) {
              setStaffPermission({ permission_level: 'DRAFT', is_active: true });
            }
          }
        } catch {
          if (type === 'timetable' && isMounted) {
            setStaffPermission({ permission_level: 'DRAFT', is_active: true });
          }
        } finally {
          if (isMounted) setHasCheckedPermission(true);
        }
      };
      fetchPerms();
    } else {
      setHasCheckedPermission(true);
    }
    return () => {
      isMounted = false;
    };
  }, [user, type]);

  // Latest assistant message for share/email/export
  const latestAssistantContent = messages.filter((m) => m.role === 'assistant').pop()?.content || tokens || '';

  // ── Scroll ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tokens]);

  // ── Error handling ──────────────────────────────────────────────────────────
  const errorToastShownRef = useRef(false);

  useEffect(() => {
    if (error) {
      if (!errorToastShownRef.current) {
        errorToastShownRef.current = true;
        addToast('The officer is temporarily unavailable. Please try again.', 'danger');
      }
    } else {
      errorToastShownRef.current = false;
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
          // Save to session history (only if NOT in temporary chat mode)
          if (!isTemporaryChat) {
            setSessionHistory((h) => [{ id: Date.now(), preview: tokens.slice(0, 60) + '...', content: tokens, timestamp: new Date().toLocaleTimeString() }, ...h.slice(0, 19)]);
          }
          return [...prev, newMsg];
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, tokens, isTemporaryChat]);

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = (text) => {
    errorToastShownRef.current = false;
    let promptText = (text || inputValue).trim();

    if (!promptText && typeof payloadBuilder === 'function') {
      const p = payloadBuilder('', uploadedFile);
      if (p?.criterion) {
        promptText = `Generate NAAC SSR Report for ${p.criterion}`;
      }
    }

    // Phase 7: empty prompt guard
    if (!promptText) {
      addToast('Please enter a prompt or select a criterion first.', 'warning');
      textareaRef.current?.focus();
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: promptText, timestamp: Date.now() }]);
    setInputValue('');
    setUploadedFile(null);

    // Save prompt to session history & localStorage (only if NOT in temporary chat mode)
    if (!isTemporaryChat) {
      setSessionHistory((prev) => {
        const existing = prev.filter((item) => (typeof item === 'string' ? item : item.prompt) !== promptText);
        const newEntry = {
          id: Date.now(),
          prompt: promptText,
          preview: promptText.length > 60 ? promptText.slice(0, 60) + '…' : promptText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const updated = [newEntry, ...existing].slice(0, 15);
        try {
          localStorage.setItem(`officer_history_${type || 'default'}`, JSON.stringify(updated));
        } catch {
          // ignore storage errors
        }
        return updated;
      });
    }

    const fullEndpoint = `${getApiBaseURL()}${endpoint}`;
    const payload = payloadBuilder
      ? payloadBuilder(promptText, uploadedFile)
      : { reportType: promptText, action: promptText };

    start(fullEndpoint, payload);
  };

  const handleSelectPastPrompt = (pastPrompt) => {
    setInputValue(pastPrompt);
    handleSend(pastPrompt);
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
    const allowed = ['.pdf', '.xlsx', '.xls', '.csv', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      addToast('Unsupported file type. Please upload PDF, Excel, CSV, DOCX, TXT, or Image (PNG/JPG/WEBP).', 'warning');
      return;
    }
    setUploadedFile(file);
    addToast(`File attached: ${file.name}`, 'success');
  };

  // ── Share / Email / Preview helpers ──────────────────────────────────────────
  const openShare = (content) => {
    setShareContent(content || latestAssistantContent);
    setShareOpen(true);
  };
  const openEmail = (content) => {
    setShareContent(content || latestAssistantContent);
    setEmailOpen(true);
  };
  const openPreview = (content, defaultTab = 'a4') => {
    setPreviewContent(content || latestAssistantContent || '');
    setPreviewTab(defaultTab);
    setDocZoom(1);
    setPreviewOpen(true);
  };

  // ── Markdown Table Extractor ───────────────────────────────────────────────
  const extractTablesFromMarkdown = (md) => {
    if (!md) return [];
    const lines = md.split('\n');
    const tables = [];
    let currentTable = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').slice(1, -1).map((c) => c.trim());
        const isSeparator = cells.every((c) => /^:?-+:?$/.test(c));
        if (isSeparator) {
          if (currentTable) {
            currentTable.separatorFound = true;
          }
        } else if (!currentTable) {
          currentTable = { headers: cells, rows: [], separatorFound: false };
        } else if (!currentTable.separatorFound) {
          currentTable.headers = cells;
        } else {
          currentTable.rows.push(cells);
        }
      } else {
        if (currentTable && currentTable.rows.length > 0) {
          tables.push(currentTable);
        }
        currentTable = null;
      }
    }
    if (currentTable && currentTable.rows.length > 0) {
      tables.push(currentTable);
    }
    return tables;
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
      <button type="button" onClick={() => openPreview(content, 'a4')}
        title="Preview document formatted as A4, data tables, or JSON before downloading"
        style={{ ...btnStyle, background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.38)', color: '#a5b4fc' }}>
        <Eye size={13} /> Preview & Download
      </button>
      <button type="button" onClick={() => handleDownloadPdf(content)}
        title="Download PDF report"
        style={{ ...btnStyle, background: accentLight, border: `1px solid ${accentBorder}`, color: accentColor }}>
        <Download size={13} /> PDF
      </button>
      <button type="button" onClick={() => handleDownloadCsv(content)}
        title="Download CSV spreadsheet"
        style={{ ...btnStyle, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
        <TableIcon size={13} /> CSV
      </button>
      <button type="button" onClick={() => handleDownloadJson(content)}
        title="Download JSON structure"
        style={{ ...btnStyle, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
        <Code size={13} /> JSON
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
    <div style={{ height: '100vh', maxHeight: '100vh', background: '#0A0E27', color: 'white', fontFamily: '"Inter", sans-serif', display: 'flex', overflow: 'hidden' }}>

      {/* ── Left panel ── */}
      <div
        style={{
          width: sidebarOpen ? '320px' : '0px',
          minWidth: sidebarOpen ? '320px' : '0px',
          maxWidth: sidebarOpen ? '320px' : '0px',
          opacity: sidebarOpen ? 1 : 0,
          borderRight: sidebarOpen ? '1px solid rgba(255,255,255,0.1)' : 'none',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          maxHeight: '100vh',
          overflowY: sidebarOpen ? 'auto' : 'hidden',
          overflowX: 'hidden',
          flexShrink: 0,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
          visibility: sidebarOpen ? 'visible' : 'hidden',
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <Link to="/officers-dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>
              <ArrowLeft size={15} /> Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              data-testid="officer-sidebar-close"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.75)',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <PanelLeftClose size={15} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0 }}>
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
              <button key={action.id || action.label || `act-${idx}`} onClick={() => handleSend(action.label)}
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
            {isTemporaryChat && (
              <div style={{ marginTop: '0.45rem', padding: '0.45rem 0.65rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', fontSize: '0.72rem', color: '#fbbf24' }}>
                ⚡ Temp Chat ON: History disabled
              </div>
            )}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', minWidth: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '0.9rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,14,39,0.85)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={toggleSidebar}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                data-testid="officer-sidebar-toggle"
                style={{
                  background: sidebarOpen ? 'rgba(255,255,255,0.06)' : accentLight,
                  border: `1px solid ${sidebarOpen ? 'rgba(255,255,255,0.15)' : accentBorder}`,
                  color: sidebarOpen ? 'rgba(255,255,255,0.85)' : accentColor,
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
                <span>{sidebarOpen ? 'Hide' : 'Sidebar'}</span>
              </button>
              <span style={{ fontSize: '1.3rem' }}>{icon}</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0 }}>{headerTitle}</h2>
              {(() => {
                const isOffline = status === 'connecting' && connectionTimedOut;
                return (
                  <span
                    style={{
                      background: isOffline
                        ? 'rgba(156,163,175,0.15)'
                        : status === 'streaming'
                        ? 'rgba(16,185,129,0.15)'
                        : status === 'error'
                        ? 'rgba(239,68,68,0.15)'
                        : accentLight,
                      color: isOffline
                        ? '#9CA3AF'
                        : status === 'streaming'
                        ? '#10B981'
                        : status === 'error'
                        ? '#EF4444'
                        : accentColor,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {isOffline
                      ? 'Offline'
                      : status === 'idle'
                      ? 'Ready'
                      : status === 'connecting'
                      ? 'Connecting…'
                      : status === 'streaming'
                      ? '● Streaming'
                      : status === 'done'
                      ? 'Done'
                      : 'Error'}
                  </span>
                );
              })()}
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
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {/* Temporary Chat Toggle */}
              <button
                type="button"
                onClick={toggleTemporaryChat}
                title={isTemporaryChat ? 'Temporary Chat is ON (Incognito). Prompts and responses will not be saved.' : 'Switch to Temporary Chat (Incognito mode without history)'}
                aria-label="Toggle temporary chat"
                data-testid="officer-temp-chat-toggle"
                style={{
                  background: isTemporaryChat ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${isTemporaryChat ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)'}`,
                  color: isTemporaryChat ? '#fbbf24' : 'rgba(255, 255, 255, 0.8)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Clock size={13} color={isTemporaryChat ? '#f59e0b' : 'currentColor'} />
                <span>{isTemporaryChat ? '⚡ Temp Chat ON' : 'Temp Chat'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExpertSystemOpen((v) => !v)}
                title="Toggle Expert System Rules & Diagnostic Engine"
                aria-label="Toggle Expert System Rules & Diagnostic Engine"
                style={{
                  background: expertSystemOpen ? 'rgba(139,92,246,0.3)' : accentLight,
                  border: `1px solid ${accentBorder}`,
                  color: accentColor,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <Brain size={14} /> Expert System ({expertDomain.compliancePercentage}%)
              </button>
              {latestAssistantContent && (
                <>
                  <button type="button" onClick={() => openPreview(latestAssistantContent)} title="Preview report document" aria-label="Preview report document" style={iconBtnStyle}><Eye size={15} /></button>
                  <button type="button" onClick={() => openShare()} title="Share report" aria-label="Share report" style={iconBtnStyle}><Share2 size={15} /></button>
                  <button type="button" onClick={() => openEmail()} title="Email report" aria-label="Email report" style={iconBtnStyle}><Mail size={15} /></button>
                  <button type="button" onClick={handlePrint} title="Print report" aria-label="Print report" style={iconBtnStyle}><Printer size={15} /></button>
                </>
              )}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{headerDesc}</p>

          {/* Expert System Rules Panel */}
          {expertSystemOpen && (
            <div style={{ marginTop: '0.85rem', padding: '1rem', background: 'rgba(17, 24, 39, 0.95)', border: `1px solid ${accentBorder}`, borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color={accentColor} />
                  <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{expertDomain.systemName}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>({expertDomain.authority})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Score: {expertDomain.summaryScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const auditPrompt = `Run a comprehensive Expert System audit on ${name} metrics. Evaluate against statutory thresholds (${expertDomain.frameworkVersion}), cite all relevant regulatory clauses, identify quantitative gaps, and generate full Markdown data tables with prescriptive remediations.`;
                      handleSend(auditPrompt);
                      setExpertSystemOpen(false);
                    }}
                    style={{ background: accentColor, color: '#fff', border: 'none', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ⚡ Run Full Diagnostic Audit
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                {expertDomain.rules.map((rule) => {
                  const isOk = rule.status === 'COMPLIANT';
                  return (
                    <div key={rule.id} style={{ padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{rule.name}</span>
                        <span style={{ color: isOk ? '#10b981' : '#f59e0b', fontSize: '0.68rem', fontWeight: 'bold' }}>
                          {isOk ? '● COMPLIANT' : '▲ ATTENTION'}
                        </span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem' }}>{rule.statutoryClause}</div>
                      <div style={{ marginTop: '0.25rem', color: accentColor, fontSize: '0.7rem' }}>
                        Threshold: {rule.statutoryThreshold}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested prompts */}
          <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.7rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', alignSelf: 'center' }}>Try:</span>
            {suggestedPrompts.map((prompt, idx) => (
              <button key={prompt.id || prompt || `prompt-${idx}`} type="button" onClick={() => handleSend(prompt)}
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
                    <div key={s.id || s.label || `stat-${i}`} style={{ minWidth: '120px' }}>
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
          <div style={{ flex: '1 1 0%', minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', overflowY: 'auto' }}>
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
          <div style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.85rem', marginBottom: '0.75rem', border: `1px solid ${accentBorder}`, boxShadow: `0 0 24px ${accentLight}` }}>
              {icon}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>{name} Workspace</h2>
            {isTemporaryChat && (
              <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', marginBottom: '0.65rem' }}>
                ⚡ Temporary Chat Active (Incognito)
              </span>
            )}
            <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '440px', textAlign: 'center', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              Type a prompt or select a suggested query above to get started. Use <kbd style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '3px', padding: '1px 4px', fontSize: '0.75rem' }}>Ctrl+Enter</kbd> to send, <kbd style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '3px', padding: '1px 4px', fontSize: '0.75rem' }}>Esc</kbd> to stop streaming.
            </p>
          </div>
        ) : (
          <div style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', padding: '1.25rem 1.75rem' }}>
            {isTemporaryChat && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 1rem',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  color: '#fbbf24',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>⚡</span>
                  <span><strong>Temporary Chat Active:</strong> Messages and reports in this session are not saved to your history.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    addToast('Temporary chat cleared.', 'info');
                  }}
                  title="Clear temporary messages"
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fef3c7',
                    borderRadius: '6px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Trash2 size={12} /> Clear Chat
                </button>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={msg.id || msg.timestamp || `msg-${i}`} style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.4rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: msg.role === 'user' ? '#2563EB' : accentLight, border: msg.role === 'user' ? 'none' : `1px solid ${accentBorder}` }}>
                  {msg.role === 'user' ? 'U' : icon}
                </div>
                <div style={{ background: msg.role === 'user' ? '#2563EB' : 'rgba(255,255,255,0.05)', padding: '1rem 1.15rem', borderRadius: '12px', maxWidth: '82%', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)', lineHeight: '1.6', position: 'relative' }}>
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} onImageClick={handlePicPreview} />
                  ) : (
                    <div>
                      <div>{msg.content}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem', marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            addToast('Prompt copied to clipboard.', 'success');
                          }}
                          title="Copy prompt"
                          aria-label="Copy prompt"
                          style={{
                            background: 'rgba(255,255,255,0.18)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 500,
                          }}
                        >
                          <Copy size={12} /> Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputValue(msg.content);
                            if (typeof onInputChange === 'function') {
                              onInputChange(msg.content);
                            }
                            textareaRef.current?.focus();
                            addToast('Prompt loaded into editor.', 'info');
                          }}
                          title="Edit and re-run prompt"
                          aria-label="Edit prompt"
                          style={{
                            background: 'rgba(255,255,255,0.18)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 500,
                          }}
                        >
                          <Edit size={12} /> Edit
                        </button>
                      </div>
                    </div>
                  )}
                  {msg.role === 'assistant' && (
                    <>
                      <ActionRow content={msg.content} msgId={i} />
                      {i === messages.length - 1 && (status === 'done' || status === 'idle') && (
                        <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                            <Sparkles size={13} color={accentColor} /> Suggested Next Prompts:
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {officerSuggestions.slice(0, 3).map((promptSuggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSuggestedNextPrompt(promptSuggestion)}
                                style={{
                                  background: accentLight,
                                  border: `1px solid ${accentBorder}`,
                                  color: '#ffffff',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = accentColor;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = accentLight;
                                }}
                              >
                                <span>✨</span> {promptSuggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
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
                  <MarkdownRenderer content={tokens || ''} onImageClick={handlePicPreview} />
                  <span style={{ display: 'inline-block', width: '7px', height: '14px', background: accentColor, marginLeft: '3px', verticalAlign: 'text-bottom', animation: 'obs-blink 1s infinite' }} />
                </div>
              </div>
            )}

            {status === 'connecting' && !tokens && (
              <div style={{ color: accentColor, fontSize: '0.82rem', fontStyle: 'italic', margin: '0.5rem 0' }}>
                [{name}]: {connectingText}
              </div>
            )}

            {(status === 'error' || error) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.15rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                margin: '0.75rem 0',
                maxWidth: '82%',
              }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <span>The AI Officer is currently offline. Please try again.</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── Input bar ── */}
        <div style={{ padding: '0.75rem 1.75rem 0.85rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#0A0E27', flexShrink: 0, position: 'relative', zIndex: 10 }}>
          {/* File attachment preview */}
          {uploadedFile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.06)', border: `1px solid ${accentBorder}`, borderRadius: '8px', marginBottom: '0.45rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                {filePreviewUrl ? (
                  <button
                    type="button"
                    onClick={() => handlePicPreview({ url: filePreviewUrl, name: uploadedFile.name, size: `${(uploadedFile.size / 1024).toFixed(1)} KB` })}
                    title="Click to preview pic in full screen"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <img
                      src={filePreviewUrl}
                      alt="Attachment Thumbnail"
                      style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </button>
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, flexShrink: 0 }}>
                    <FileText size={16} />
                  </div>
                )}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {uploadedFile.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                    {(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.type || 'Document'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                {filePreviewUrl ? (
                  <button
                    type="button"
                    onClick={() => handlePicPreview({ url: filePreviewUrl, name: uploadedFile.name, size: `${(uploadedFile.size / 1024).toFixed(1)} KB` })}
                    style={{ background: accentLight, border: `1px solid ${accentBorder}`, color: accentColor, borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Eye size={12} /> Preview Pic
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const reader = new FileReader();
                      reader.onload = (re) => {
                        openPreview(re.target.result);
                      };
                      reader.readAsText(uploadedFile);
                    }}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Eye size={12} /> Preview Doc
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  title="Remove file"
                  aria-label="Remove attachment"
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Controls row: topBarExtra + compact Session History button */}
          {(topBarExtra || sessionHistory.length > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: topBarExtra ? '220px' : 'auto' }}>
                {typeof topBarExtra === 'function' ? topBarExtra({ setInputValue, handleSend }) : topBarExtra}
              </div>

              {/* Session History dropdown trigger */}
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                title="Toggle session prompt history"
                aria-label="Toggle session prompt history"
                style={{
                  background: showHistory ? accentLight : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${showHistory ? accentBorder : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '6px',
                  color: showHistory ? accentColor : 'rgba(255,255,255,0.7)',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  flexShrink: 0,
                  alignSelf: 'center',
                }}
              >
                <Clock size={12} />
                <span>History ({sessionHistory.length})</span>
                {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
          )}

          {/* Collapsible Session History preview list */}
          {showHistory && (
            <div
              style={{
                background: 'rgba(15,23,42,0.92)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '0.45rem 0.6rem',
                maxHeight: '110px',
                overflowY: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.35rem',
                marginBottom: '0.5rem',
              }}
            >
              {sessionHistory.length === 0 ? (
                <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>No previous prompts in this session.</span>
              ) : (
                sessionHistory.map((item) => {
                  const pText = typeof item === 'string' ? item : item.prompt || item.preview;
                  return (
                    <button
                      key={item.id || pText}
                      type="button"
                      onClick={() => handleSelectPastPrompt(pText)}
                      title={pText}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e2e8f0',
                        borderRadius: '6px',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🕒 {item.preview || pText}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {user?.role === 'staff' && staffPermission?.permission_level === 'VIEW_ONLY' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#9ca3af', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span>👁️ VIEW_ONLY Permission: You can view reports, but generating new prompts is disabled for your staff account.</span>
            </div>
          ) : user?.role === 'staff' && hasCheckedPermission && !staffPermission ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.82rem', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span>🔒 Officer access restricted. Please click &quot;Request Access&quot; above to request delegation from your HOD.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.3rem 0.45rem 0.3rem 0.65rem', gap: '0.4rem' }}>
              {/* File upload button */}
              <button
                type="button"
                title="Attach file (PDF, Excel, CSV, TXT)"
                aria-label="Attach file (PDF, Excel, CSV, TXT)"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px', flexShrink: 0, alignSelf: 'flex-end' }}
              >
                <Paperclip size={16} />
              </button>
              <input ref={fileInputRef} type="file" aria-label="Attach file" accept=".pdf,.xlsx,.xls,.csv,.docx,.txt,.png,.jpg,.jpeg,.webp,.svg,image/*" style={{ display: 'none' }} onChange={handleFileChange} />

              <textarea
                ref={textareaRef}
                value={inputValue}
                data-testid="officer-prompt-input"
                aria-label="Officer prompt input"
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (typeof onInputChange === 'function') {
                    onInputChange(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your prompt… (Ctrl+Enter to send)"
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '0.45rem 0', fontSize: '0.9rem', resize: 'none', outline: 'none', minHeight: '52px', maxHeight: '160px', overflowY: 'auto' }}
                rows={2}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, alignSelf: 'flex-end' }}>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)' }}>{inputValue.length}/2000</span>
                {user?.role === 'staff' && staffPermission?.permission_level === 'DRAFT' && (
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    Requires Approval
                  </span>
                )}
                {(status === 'streaming' || status === 'connecting') && (
                  <button
                    type="button"
                    onClick={stop}
                    title="Stop streaming (Esc)"
                    aria-label="Stop streaming"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  aria-label="Send prompt"
                  data-testid="officer-send-button"
                  disabled={status === 'streaming' || status === 'connecting'}
                  style={{ background: status === 'streaming' || status === 'connecting' ? 'rgba(255,255,255,0.08)' : accentColor, color: status === 'streaming' || status === 'connecting' ? 'rgba(255,255,255,0.3)' : 'white', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: status === 'streaming' || status === 'connecting' ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                >
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

      {/* ── Document Preview Modal (A4, Tables Grid, & JSON View) ── */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Document Preview"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewOpen(false);
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '980px',
              height: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#1E293B',
                flexWrap: 'wrap',
                gap: '0.6rem',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
                  Document Preview — {headerTitle}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94A3B8' }}>
                  {institutionName || 'Institutional Report'} · {previewContent.length} chars · {previewContent.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              {/* View Tabs */}
              <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.75)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  onClick={() => setPreviewTab('a4')}
                  style={{
                    background: previewTab === 'a4' ? accentColor : 'transparent',
                    color: previewTab === 'a4' ? '#fff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FileText size={13} /> A4 Document
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('table')}
                  style={{
                    background: previewTab === 'table' ? accentColor : 'transparent',
                    color: previewTab === 'table' ? '#fff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <TableIcon size={13} /> Tables Grid
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('raw')}
                  style={{
                    background: previewTab === 'raw' ? accentColor : 'transparent',
                    color: previewTab === 'raw' ? '#fff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Code size={13} /> JSON / Raw
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewContent)}
                  style={{
                    background: accentColor || '#8B5CF6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={13} /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCsv(previewContent)}
                  style={{
                    background: 'rgba(16,185,129,0.18)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    color: '#6ee7b7',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <TableIcon size={13} /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadJson(previewContent)}
                  style={{
                    background: 'rgba(251,191,36,0.15)',
                    border: '1px solid rgba(251,191,36,0.35)',
                    color: '#fbbf24',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <Code size={13} /> JSON
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#e2e8f0',
                    borderRadius: '6px',
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  aria-label="Close preview"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    borderRadius: '6px',
                    padding: '0.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sub-toolbar for zoom controls in A4 view */}
            {previewTab === 'a4' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.35rem', background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <button type="button" onClick={() => setDocZoom((z) => Math.max(z - 0.15, 0.6))} style={zoomBtnStyle}>
                  <ZoomOut size={13} />
                </button>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: '40px', textAlign: 'center' }}>{Math.round(docZoom * 100)}%</span>
                <button type="button" onClick={() => setDocZoom((z) => Math.min(z + 0.15, 1.6))} style={zoomBtnStyle}>
                  <ZoomIn size={13} />
                </button>
                <button type="button" onClick={() => setDocZoom(1)} style={zoomBtnStyle}>100%</button>
              </div>
            )}

            {/* Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: previewTab === 'a4' ? '2rem 1.5rem' : '1.5rem',
                background: previewTab === 'a4' ? '#334155' : '#0B1120',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {previewTab === 'a4' && (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '820px',
                    minHeight: '1050px',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    padding: '3rem 2.75rem',
                    borderRadius: '4px',
                    boxShadow: '0 10px 35px rgba(0, 0, 0, 0.45)',
                    border: '1px solid #CBD5E1',
                    boxSizing: 'border-box',
                    transform: `scale(${docZoom})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {/* Institutional Header Banner */}
                  <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        {institutionName}
                      </h2>
                      <p style={{ margin: '3px 0 0', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                        Autonomous AI Officer Evaluation · {headerTitle}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                        Document Reference: EDF-{type.toUpperCase()}-{Date.now().toString().slice(-6)} · Statutory Benchmark Met
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-block', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#0F172A' }}>
                        OFFICIAL COPY
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                        {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <MarkdownRenderer content={previewContent} onImageClick={handlePicPreview} />

                  {/* Institutional Footer */}
                  <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
                    <span>EduFlow AI Governance Framework · Confidential & Statutory</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              )}

              {previewTab === 'table' && (
                <div style={{ width: '100%', maxWidth: '920px' }}>
                  {(() => {
                    const extracted = extractTablesFromMarkdown(previewContent);
                    if (extracted.length === 0) {
                      return (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                          <TableIcon size={36} color="#64748b" style={{ marginBottom: '1rem' }} />
                          <h4>No Markdown Tables Detected</h4>
                          <p style={{ fontSize: '0.85rem' }}>This document response is primarily textual narrative. You can view the full formatted document in the A4 tab.</p>
                        </div>
                      );
                    }
                    return extracted.map((tbl, tIdx) => (
                      <div key={tIdx} style={{ marginBottom: '2rem', background: '#1E293B', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem 1rem', background: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>Table {tIdx + 1} ({tbl.rows.length} rows)</strong>
                          <button
                            type="button"
                            onClick={() => {
                              const headerRow = tbl.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
                              const bodyRows = tbl.rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','));
                              const csvContent = [headerRow, ...bodyRows].join('\n');
                              const blob = new Blob([csvContent], { type: 'text/csv' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `table-${tIdx + 1}-${Date.now()}.csv`;
                              a.click();
                              URL.revokeObjectURL(url);
                              addToast(`Table ${tIdx + 1} exported to CSV.`, 'success');
                            }}
                            style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Download size={12} /> Export Table CSV
                          </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#e2e8f0' }}>
                            <thead>
                              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '8px 12px', textAlign: 'center', color: '#94a3b8', width: '40px' }}>#</th>
                                {tbl.headers.map((h, hIdx) => (
                                  <th key={hIdx} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tbl.rows.map((row, rIdx) => (
                                <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>{rIdx + 1}</td>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} style={{ padding: '8px 12px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}

              {previewTab === 'raw' && (
                <div style={{ width: '100%', maxWidth: '920px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(previewContent);
                        addToast('Raw content copied to clipboard.', 'success');
                      }}
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Copy size={13} /> Copy Content
                    </button>
                  </div>
                  <pre
                    style={{
                      background: '#020617',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      color: '#e2e8f0',
                      fontSize: '0.82rem',
                      lineHeight: '1.6',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {previewContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Picture / Image Preview Lightbox Modal ── */}
      {previewPicModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Picture Preview"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setPreviewPicModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
              overflow: 'hidden',
            }}
          >
            {/* Lightbox Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: '#1E293B', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                <ImageIcon size={18} color="#8B5CF6" />
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {previewPicModal.name || 'Picture Preview'}
                </span>
                {previewPicModal.size && (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({previewPicModal.size})</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <a
                  href={previewPicModal.url}
                  download={previewPicModal.name || 'picture-download.png'}
                  style={{
                    background: '#8B5CF6',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Download size={13} /> Download Pic
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPicModal(null)}
                  aria-label="Close picture preview"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#94a3b8',
                    borderRadius: '6px',
                    padding: '0.35rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Lightbox Image View */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#020617' }}>
              <img
                src={previewPicModal.url}
                alt={previewPicModal.name || 'Preview'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '68vh',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  transform: `scale(${picZoom}) rotate(${picRotation}deg)`,
                  transition: 'transform 0.2s ease',
                }}
              />
            </div>

            {/* Zoom / Rotate controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', padding: '0.5rem', background: '#1E293B', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button type="button" onClick={() => setPicZoom((z) => Math.max(z - 0.25, 0.5))} style={zoomBtnStyle}>
                <ZoomOut size={13} /> Zoom Out
              </button>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '40px', textAlign: 'center' }}>{Math.round(picZoom * 100)}%</span>
              <button type="button" onClick={() => setPicZoom((z) => Math.min(z + 0.25, 3))} style={zoomBtnStyle}>
                <ZoomIn size={13} /> Zoom In
              </button>
              <button type="button" onClick={() => setPicRotation((r) => (r + 90) % 360)} style={zoomBtnStyle}>
                <RotateCw size={13} /> Rotate
              </button>
              <button type="button" onClick={() => { setPicZoom(1); setPicRotation(0); }} style={zoomBtnStyle}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared inline button styles ──────────────────────────────────────────────
const zoomBtnStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#e2e8f0',
  borderRadius: '4px',
  padding: '0.25rem 0.55rem',
  fontSize: '0.72rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
};

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
