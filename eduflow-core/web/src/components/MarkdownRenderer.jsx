import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function cleanProps(props) {
  const copy = { ...props };
  delete copy.node;
  return copy;
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
            const { inline, ...rest } = cleanProps(props);
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
                />
              );
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
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                    color: '#e2e8f0',
                  }}
                  {...rest}
                />
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
