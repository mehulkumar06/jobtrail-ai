import StatusBadge from './StatusBadge';

const LETTER_COLORS = [
  { color: '#E8C547', bg: 'rgba(232,197,71,0.1)',   border: 'rgba(232,197,71,0.2)'   },
  { color: '#6FA3D4', bg: 'rgba(111,163,212,0.1)',  border: 'rgba(111,163,212,0.2)'  },
  { color: '#9B87D4', bg: 'rgba(155,135,212,0.1)',  border: 'rgba(155,135,212,0.2)'  },
  { color: '#6DBF8F', bg: 'rgba(109,191,143,0.1)',  border: 'rgba(109,191,143,0.2)'  },
  { color: '#E07070', bg: 'rgba(224,112,112,0.1)',  border: 'rgba(224,112,112,0.2)'  },
];

const SkeletonRow = () => (
  <tr style={{ borderBottom: '1px solid var(--border)' }}>
    {[...Array(6)].map((_, i) => (
      <td key={i} style={{ padding: '14px 20px' }}>
        <div style={{
          height: 13, background: 'var(--bg-2)', borderRadius: 4,
          animation: 'skPulse 1.6s ease-in-out infinite',
          width: `${[50, 70, 35, 25, 15, 10][i]}%`
        }} />
      </td>
    ))}
  </tr>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const openEmail = (gmailLink) => {
  window.open(gmailLink, '_blank', 'noopener,noreferrer');
};

const ApplicationTable = ({ applications, loading, onDelete }) => {
  return (
    <div style={{
      border: '1px solid var(--border)',
      background: 'var(--bg-1)',
      overflow: 'hidden',
      borderRadius: 12
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
              {['Company', 'Role', 'Source', 'Date Applied', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 20px', textAlign: 'left',
                  fontSize: '11px', color: 'var(--text-3)',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'Inter'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 36, opacity: 0.4 }}>📭</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                      No applications found — try syncing
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              applications.map((app, idx) => {
                const lc = LETTER_COLORS[idx % LETTER_COLORS.length];
                return (
                  <tr key={app._id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Company */}
                    <td style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, flexShrink: 0, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '12px',
                          background: lc.bg, border: `1px solid ${lc.border}`, color: lc.color,
                        }}>
                          {app.company?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
                          {app.company}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '13px 20px', maxWidth: 220 }}>
                      <span style={{
                        fontSize: '13px', color: 'var(--text-2)',
                        display: 'block', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {app.role || '—'}
                      </span>
                    </td>

                    {/* Source */}
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{
                        fontSize: '11px', padding: '3px 8px', borderRadius: 5, fontWeight: 500,
                        background: app.source === 'sent' ? 'rgba(155,135,212,0.1)' : 'rgba(111,163,212,0.1)',
                        color: app.source === 'sent' ? '#9B87D4' : '#6FA3D4',
                        border: app.source === 'sent' ? '1px solid rgba(155,135,212,0.2)' : '1px solid rgba(111,163,212,0.2)',
                      }}>
                        {app.source === 'sent' ? '↑ Sent' : '↓ Received'}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatDate(app.dateApplied)}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '13px 20px' }}>
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Open email */}
                        <button
                          onClick={() => openEmail(app.gmailLink)}
                          title="Open in Gmail"
                          style={{
                            background: 'none', border: '1px solid var(--border-2)',
                            color: 'var(--text-2)', padding: '5px 12px',
                            fontSize: '12px', cursor: 'pointer', borderRadius: 7,
                            display: 'flex', alignItems: 'center', gap: 5,
                            transition: 'all 0.15s', fontFamily: 'Inter',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = 'var(--accent)';
                            e.currentTarget.style.background = 'var(--accent-dim)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border-2)';
                            e.currentTarget.style.color = 'var(--text-2)';
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d={"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"} />
                          </svg>
                          Open
                        </button>

                        {/* Delete */}
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove "${app.company}" from your tracker?`)) {
                                onDelete(app._id);
                              }
                            }}
                            title="Remove application"
                            style={{
                              background: 'none', border: '1px solid var(--border-2)',
                              color: 'var(--text-3)', padding: '5px 8px',
                              fontSize: '12px', cursor: 'pointer', borderRadius: 7,
                              display: 'flex', alignItems: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--red)';
                              e.currentTarget.style.color = 'var(--red)';
                              e.currentTarget.style.background = 'rgba(224,112,112,0.08)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--border-2)';
                              e.currentTarget.style.color = 'var(--text-3)';
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationTable;