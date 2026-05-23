import { useState, useEffect, useRef } from 'react';

const STATUSES = ['All', 'Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'];

const FilterBar = ({ onSearch, onStatusFilter, onSync, syncing }) => {
  const [search, setSearch] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const inputStyle = {
  background: 'var(--bg-1)',
  border: '1px solid var(--border-2)',
  color: 'var(--text)',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  fontFamily: 'Inter',
  transition: 'border-color 0.15s',
  borderRadius: 8,
};

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}
          width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search company or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
        />
      </div>

      {/* Status */}
      <select
        onChange={e => onStatusFilter(e.target.value)}
        style={{ ...inputStyle, width: 'auto', cursor: 'pointer', paddingRight: 32 }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
      >
        {STATUSES.map(s => <option key={s} value={s} style={{ background: 'var(--bg-2)' }}>{s}</option>)}
      </select>

      {/* Sync */}
      <button
        onClick={onSync}
        disabled={syncing}
        style={{
          background: syncing ? 'var(--bg-3)' : 'var(--accent)',
          color: syncing ? 'var(--text-3)' : '#0A0D0F',
          border: 'none',
          padding: '10px 24px',
          borderRadius: 8,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
          fontSize: '13px',
          cursor: syncing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'opacity 0.15s, background 0.15s',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!syncing) e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        {syncing ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Syncing...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sync Now
          </>
        )}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </button>
    </div>
  );
};

export default FilterBar;