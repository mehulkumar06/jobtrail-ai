import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ApplicationTable from '../components/ApplicationTable';
import FilterBar from '../components/FilterBar';

const getLastSynced = (lastSyncedAt) => {
  if (!lastSyncedAt) return 'Never';
  const diff = Math.floor((new Date() - new Date(lastSyncedAt)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff === 1) return '1 min ago';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)}h ago`;
};

const ApplicationsPage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, loading, navigate]);

  const fetchApplications = useCallback(async (searchVal, statusVal, sourceVal) => {
    setLoadingApps(true);
    try {
      const params = {};
      if (searchVal) params.search = searchVal;
      if (statusVal && statusVal !== 'All') params.status = statusVal;
      if (sourceVal && sourceVal !== 'All') params.source = sourceVal;
      const res = await api.get('/applications', { params });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      fetchApplications('', 'All', 'All');
    }
  }, [isAuthenticated, fetchApplications]);

  useEffect(() => {
    if (hasFetched.current) {
      fetchApplications(search, statusFilter, sourceFilter);
    }
  }, [search, statusFilter, sourceFilter, fetchApplications]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/applications/sync');
      await fetchApplications(search, statusFilter, sourceFilter);
      showToast(`↑ ${res.data.synced} new application${res.data.synced !== 1 ? 's' : ''} found (${res.data.inbox} inbox · ${res.data.sent} sent)`);
    } catch {
      showToast('Sync failed. Try again.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/applications/${id}`);
      setApplications(prev => prev.filter(a => a._id !== id));
      showToast('Application removed');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSourceFilter(tab === 'All' ? 'All' : tab === 'Received' ? 'inbox' : 'sent');
  };

  const tabs = ['All', 'Received', 'Sent'];

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>
                Applications
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                Last synced: {getLastSynced(user?.lastSyncedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Source tabs */}
        <div className="fade-up-1" style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(tab => (
            <button key={tab}
              onClick={() => handleTabChange(tab)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-3)',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.15s', fontFamily: 'Inter'
              }}
              onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-2)'; }}
              onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-3)'; }}
            >
              {tab}
              <span style={{
                marginLeft: 6, fontSize: '11px', padding: '1px 6px', borderRadius: 10,
                background: activeTab === tab ? 'var(--accent-dim)' : 'var(--bg-2)',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-3)'
              }}>
                {tab === 'All' ? applications.length :
                 tab === 'Received' ? applications.filter(a => a.source === 'inbox').length :
                 applications.filter(a => a.source === 'sent').length}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="fade-up-2" style={{ marginBottom: 16 }}>
          <FilterBar
            onSearch={setSearch}
            onStatusFilter={setStatusFilter}
            onSync={handleSync}
            syncing={syncing}
          />
        </div>

        {/* Table */}
        <div className="fade-up-3">
          <ApplicationTable
            applications={applications}
            loading={loadingApps}
            onDelete={handleDelete}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '12px', color: 'var(--text-3)' }}>
          {applications.length} application{applications.length !== 1 ? 's' : ''} · Read-only Gmail access
        </div>
      </main>

      {toast && (
        <div className="fade-up" style={{
          position: 'fixed', bottom: 24, right: 24,
          background: toast.type === 'error' ? 'var(--red)' : 'var(--accent)',
          color: toast.type === 'error' ? '#fff' : '#111008',
          padding: '12px 20px', fontSize: '13px', fontWeight: 600,
          borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;