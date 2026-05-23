const cfg = {
  'Applied':      { color: '#4F8EF7', bg: 'rgba(79,142,247,0.08)',  border: 'rgba(79,142,247,0.18)'  },
  'Under Review': { color: '#E8A94A', bg: 'rgba(232,169,74,0.08)',  border: 'rgba(232,169,74,0.18)'  },
  'Interview':    { color: '#8B7FD4', bg: 'rgba(139,127,212,0.08)', border: 'rgba(139,127,212,0.18)' },
  'Offer':        { color: '#00C896', bg: 'rgba(0,200,150,0.08)',   border: 'rgba(0,200,150,0.18)'   },
  'Rejected':     { color: '#E05C5C', bg: 'rgba(224,92,92,0.08)',   border: 'rgba(224,92,92,0.18)'   },
  'Unknown':      { color: '#3D4E5A', bg: 'rgba(61,78,90,0.08)',    border: 'rgba(61,78,90,0.18)'    },
};

const StatusBadge = ({ status }) => {
  const c = cfg[status] || cfg['Unknown'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', fontSize: '11px', fontWeight: 500,
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 20, letterSpacing: '0.02em', fontFamily: 'Inter',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      {status}
    </span>
  );
};

export default StatusBadge;