import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function cleanProps(props) {
  const copy = { ...props };
  delete copy.node;
  return copy;
}

function renderRechartsBlock(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
      const keys = Object.keys(parsed.data[0]);
      if (keys.length === 0) return null;
      const xKey = keys[0];
      const yKey = keys[1] || keys[0];

      if (parsed.type === 'bar') {
        return (
          <div style={{ width: '100%', minWidth: '280px', height: 260, margin: '1rem 0', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 260 }}>
              <BarChart data={parsed.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
      if (parsed.type === 'line') {
        return (
          <div style={{ width: '100%', minWidth: '280px', height: 260, margin: '1rem 0', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 260 }}>
              <LineChart data={parsed.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey={yKey} stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }
    }
  } catch {
    // not recharts JSON
  }
  return null;
}

/**
 * Reusable Markdown renderer supporting GitHub-flavored Markdown
 * with full table rendering, bold text styling, code blocks, and dark theme support.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`} style={{ lineHeight: '1.65', color: 'inherit' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1.25rem', marginBottom: '0.75rem', color: 'inherit' }} {...cleanProps(props)} />
          ),
          h2: (props) => (
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '1.15rem', marginBottom: '0.65rem', color: 'inherit' }} {...cleanProps(props)} />
          ),
          h3: (props) => (
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: 'inherit' }} {...cleanProps(props)} />
          ),
          h4: (props) => (
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.85rem', marginBottom: '0.5rem', color: 'inherit' }} {...cleanProps(props)} />
          ),
          p: (props) => (
            <p style={{ marginBottom: '0.75rem' }} {...cleanProps(props)} />
          ),
          strong: (props) => (
            <strong style={{ fontWeight: 700, color: 'inherit' }} {...cleanProps(props)} />
          ),
          b: (props) => (
            <b style={{ fontWeight: 700, color: 'inherit' }} {...cleanProps(props)} />
          ),
          ul: (props) => (
            <ul style={{ paddingLeft: '1.4rem', marginBottom: '0.75rem' }} {...cleanProps(props)} />
          ),
          ol: (props) => (
            <ol style={{ paddingLeft: '1.4rem', marginBottom: '0.75rem' }} {...cleanProps(props)} />
          ),
          li: (props) => (
            <li style={{ marginBottom: '0.35rem' }} {...cleanProps(props)} />
          ),
          table: (props) => (
            <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid var(--border-color, rgba(148, 163, 184, 0.25))',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                }}
                {...cleanProps(props)}
              />
            </div>
          ),
          thead: (props) => (
            <thead
              style={{
                background: 'var(--surface-bg, rgba(255, 255, 255, 0.08))',
                borderBottom: '2px solid var(--border-color, rgba(148, 163, 184, 0.3))',
              }}
              {...cleanProps(props)}
            />
          ),
          tbody: (props) => <tbody {...cleanProps(props)} />,
          tr: (props) => (
            <tr
              style={{
                borderBottom: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))',
              }}
              {...cleanProps(props)}
            />
          ),
          th: (props) => (
            <th
              style={{
                padding: '10px 14px',
                fontWeight: 700,
                textAlign: 'left',
                color: 'inherit',
                border: '1px solid var(--border-color, rgba(148, 163, 184, 0.2))',
              }}
              {...cleanProps(props)}
            />
          ),
          td: (props) => (
            <td
              style={{
                padding: '9px 14px',
                textAlign: 'left',
                border: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))',
              }}
              {...cleanProps(props)}
            />
          ),
          blockquote: (props) => (
            <blockquote
              style={{
                borderLeft: '4px solid var(--primary-color, #2563EB)',
                paddingLeft: '1rem',
                margin: '1rem 0',
                color: 'var(--app-text-muted, #94a3b8)',
                fontStyle: 'italic',
              }}
              {...cleanProps(props)}
            />
          ),
          code: (props) => {
            const { inline, children, className: codeClass, ...rest } = cleanProps(props);
            if (inline) {
              return (
                <code
                  style={{
                    background: 'rgba(148, 163, 184, 0.18)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.88em',
                  }}
                  {...rest}
                >
                  {children}
                </code>
              );
            }

            if (typeof children === 'string' || (Array.isArray(children) && typeof children[0] === 'string')) {
              const rawStr = (typeof children === 'string' ? children : children.join('')).trim();
              if (rawStr.startsWith('{') && rawStr.endsWith('}') && (rawStr.includes('"type"') || rawStr.includes("'type'")) && rawStr.includes('"data"')) {
                const chartElement = renderRechartsBlock(rawStr);
                if (chartElement) return chartElement;
              }
            }

            return (
              <pre
                style={{
                  background: 'rgba(10, 15, 25, 0.75)',
                  border: '1px solid var(--border-color, rgba(148, 163, 184, 0.25))',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  overflowX: 'auto',
                  margin: '1rem 0',
                }}
              >
                <code
                  className={codeClass}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                    color: '#e2e8f0',
                  }}
                  {...rest}
                >
                  {children}
                </code>
              </pre>
            );
          },
          hr: (props) => (
            <hr
              style={{
                borderColor: 'var(--border-color, rgba(148, 163, 184, 0.25))',
                margin: '1.25rem 0',
              }}
              {...cleanProps(props)}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
