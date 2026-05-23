import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const getLastSynced = (lastSyncedAt) => {
  if (!lastSyncedAt) return 'Never synced';
  const diff = Math.floor((new Date() - new Date(lastSyncedAt)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff === 1) return '1 min ago';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)}h ago`;
};

const StatCard = ({ label, value, color, icon, desc, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '24px', cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.15s', flex: 1, minWidth: 140,
    }}
    onMouseEnter={e => {
  if (onClick) {
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,200,150,0.1)';
  }
}}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: '-0.03em', color, lineHeight: 1, marginBottom: 6 }}>
      {value}
    </div>
    {desc && <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 4 }}>{desc}</p>}
  </div>
);

const Dashboard = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [stats, setStats] = useState({ total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, loading, navigate]);

  const fetchData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/applications/stats'),
        api.get('/applications')
      ]);
      setStats(statsRes.data);
      setRecentApps(appsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/applications/sync');
      await fetchData();
      showToast(`↑ ${res.data.synced} new application${res.data.synced !== 1 ? 's' : ''} found`);
    } catch {
      showToast('Sync failed. Try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'var(--accent)', color: '#0A0D0F', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, padding: '6px 12px', fontSize: '14px', borderRadius: 8 }}>JT</div>
          <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Loading...</span>
        </div>
      </div>
    );
  }

  const statItems = [
    { label: 'Total', value: stats.total, color: 'var(--text)', icon: '📋', desc: 'All tracked applications', onClick: () => navigate('/applications') },
    { label: 'Applied', value: stats.applied, color: 'var(--blue)', icon: '🚀', desc: 'Waiting for response', onClick: () => navigate('/applications') },
    { label: 'Interviews', value: stats.interview, color: 'var(--purple)', icon: '🎯', desc: 'You got callbacks!', onClick: () => navigate('/applications') },
    { label: 'Offers', value: stats.offer, color: 'var(--green)', icon: '🏆', desc: 'Congrats!', onClick: () => navigate('/applications') },
    { label: 'Rejected', value: stats.rejected, color: 'var(--red)', icon: '❌', desc: 'Keep going', onClick: () => navigate('/applications') },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }} className="grid-bg">
      <Navbar />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>

        {/* Welcome header */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: 6 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span style={{ color: 'var(--accent)' }}>
              {user?.name?.split(' ')[0] || 'there'}
            </span> 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-3)' }}>
            Last synced: {getLastSynced(user?.lastSyncedAt)} · Auto-syncs every 15 min
          </p>
        </div>

        {/* Stat cards */}
        <div className="fade-up-1" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
          {statItems.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Quick actions */}
        <div className="fade-up-2" style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/applications')}
            style={{
              background: 'var(--bg-1)', border: '1px solid var(--border-2)',
              color: 'var(--text)', padding: '12px 24px', borderRadius: 10,
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Plus Jakarta Sans', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text)'; }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Applications
          </button>

          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              background: syncing ? 'var(--bg-2)' : 'var(--accent)',
              color: syncing ? 'var(--text-3)' : '#0A0D0F',
              border: 'none', padding: '12px 24px', borderRadius: 10,
              fontSize: '14px', fontWeight: 700,
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Plus Jakarta Sans', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!syncing) e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync Now'}
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
          </button>
        </div>

        {/* Recent Applications */}
        <div className="fade-up-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Applications</h2>
            <button
              onClick={() => navigate('/applications')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter' }}>
              View all →
            </button>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-1)' }}>
            {loadingStats ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
                Loading...
              </div>
            ) : recentApps.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                  No applications yet. Click Sync Now to get started.
                </p>
              </div>
            ) : (
              recentApps.map((app, idx) => (
                <div key={app._id}
                  style={{
                    padding: '12px 20px',
                    borderBottom: idx < recentApps.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, transition: 'background 0.1s', cursor: 'pointer',
                  }}
                  onClick={() => navigate('/applications')}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--accent-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
                      fontSize: '11px', color: 'var(--accent)'
                    }}>
                      {app.company?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>
                        {app.company}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.role || 'Role not specified'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: 5, fontWeight: 500,
                      background: app.source === 'sent' ? 'rgba(155,135,212,0.1)' : 'rgba(111,163,212,0.1)',
                      color: app.source === 'sent' ? '#9B87D4' : '#6FA3D4',
                    }}>
                      {app.source === 'sent' ? '↑ Sent' : '↓ Received'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                      {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {toast && (
        <div className="fade-up" style={{
          position: 'fixed', bottom: 24, right: 24,
          background: toast.type === 'error' ? 'var(--red)' : 'var(--accent)',
          color: toast.type === 'error' ? '#fff' : '#0A0D0F',
          padding: '12px 20px', fontSize: '13px', fontWeight: 600,
          borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;