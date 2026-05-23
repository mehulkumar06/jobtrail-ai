import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/logout`;
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Applications', path: '/applications' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(10,13,15,0.92)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 50
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56
      }}>
        {/* Logo + links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
              🗺️
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '14px', letterSpacing: '-0.02em' }}>
              JobTrail<span style={{ color: 'var(--accent)' }}>.AI</span>
            </span>
          </div>

          {user && (
            <div style={{ display: 'flex', gap: 2 }}>
              {navLinks.map(link => (
                <button key={link.path} onClick={() => navigate(link.path)}
                  style={{
                    background: isActive(link.path) ? 'var(--bg-2)' : 'none',
                    border: 'none', padding: '6px 12px', fontSize: '13px',
                    cursor: 'pointer', borderRadius: 7, fontFamily: 'Inter',
                    fontWeight: isActive(link.path) ? 600 : 400,
                    color: isActive(link.path) ? 'var(--text)' : 'var(--text-3)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive(link.path)) { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--bg-2)'; }}}
                  onMouseLeave={e => { if (!isActive(link.path)) { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{user.email}</span>
            <NotificationBell />
            <div style={{ width: 28, height: 28, background: 'var(--accent)', color: '#0A0D0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '12px', borderRadius: 8 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout}
              style={{ background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-2)', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', borderRadius: 8, fontFamily: 'Inter', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-3)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;