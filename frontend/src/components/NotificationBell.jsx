import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const NOTIFICATION_STATUSES = ['Interview', 'Offer', 'Under Review'];

const timeAgo = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const statusColors = {
  'Interview':    { color: '#9B87D4', bg: 'rgba(155,135,212,0.1)' },
  'Offer':        { color: '#6DBF8F', bg: 'rgba(109,191,143,0.1)' },
  'Under Review': { color: '#E8C547', bg: 'rgba(232,197,71,0.1)'  },
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const STORAGE_KEY = 'jobtrail_read_notifications';

  const getReadIds = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  };

  const markRead = (ids) => {
    const existing = getReadIds();
    const updated = [...new Set([...existing, ...ids])];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await api.get('/applications');
        const all = res.data;

        // Filter applications that are in notable statuses
        const notable = all.filter(app =>
          NOTIFICATION_STATUSES.includes(app.status)
        );

        const readIds = getReadIds();
        const withRead = notable.map(app => ({
          ...app,
          isRead: readIds.includes(app._id)
        }));

        setNotifications(withRead);
        setUnreadCount(withRead.filter(n => !n.isRead).length);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
      markRead(unreadIds);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const getIcon = (status) => {
    if (status === 'Interview') return '🎯';
    if (status === 'Offer') return '🏆';
    if (status === 'Under Review') return '👀';
    return '📋';
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          background: 'none', border: '1px solid var(--border-2)',
          color: 'var(--text-2)', width: 36, height: 36,
          borderRadius: 8, cursor: 'pointer', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-3)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--red)', color: '#fff',
            fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter', border: '2px solid var(--bg)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0, width: 340,
          background: 'var(--bg-1)', border: '1px solid var(--border-2)',
          borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          zIndex: 100, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '14px' }}>
              Notifications
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
              {notifications.length} alert{notifications.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🔔</div>
                <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                  No notable updates yet.<br />Interviews and offers will appear here.
                </p>
              </div>
            ) : (
              notifications.map(n => {
                const sc = statusColors[n.status] || { color: 'var(--text-2)', bg: 'var(--bg-2)' };
                return (
                  <div key={n._id}
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--border)',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      background: n.isRead ? 'transparent' : 'rgba(232,197,71,0.03)',
                      cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onClick={() => window.open(n.gmailLink, '_blank', 'noopener,noreferrer')}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(232,197,71,0.03)'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, background: sc.bg, border: `1px solid ${sc.color}20`
                    }}>
                      {getIcon(n.status)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                          {n.company}
                        </span>
                        {!n.isRead && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.role || 'Role not specified'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: '10px', padding: '2px 7px', borderRadius: 4,
                          background: sc.bg, color: sc.color, fontWeight: 600
                        }}>
                          {n.status}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 16px', borderTop: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <button
                onClick={() => { setOpen(false); window.location.href = '/applications'; }}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent)',
                  fontSize: '12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter'
                }}>
                View all applications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;