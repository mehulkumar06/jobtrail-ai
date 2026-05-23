import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Full Stack Developer',
  'Backend Engineer',
  'Product Designer',
  'Data Scientist',
];

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Gmail Integration',
    desc: 'Read-only access to your Gmail. We scan confirmation emails from LinkedIn, Indeed, Naukri, Greenhouse and more.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI Extraction',
    desc: 'Llama 3.3 70B reads each email and extracts company, role, date, and application status with 95%+ accuracy.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Auto Sync',
    desc: 'Background job runs every 15 minutes. Your tracker stays up to date without you lifting a finger.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Zero Duplicates',
    desc: 'Every Gmail message has a unique ID. We track it so you never see the same application twice.',
  },
];

const STATS = [
  { value: '95%', label: 'AI accuracy' },
  { value: '15m', label: 'Auto-sync interval' },
  { value: '0', label: 'Emails modified' },
  { value: '∞', label: 'Applications tracked' },
];

const SOURCES = ['LinkedIn', 'Indeed', 'Naukri', 'Unstop', 'Wellfound', 'Greenhouse', 'Lever', 'Workday', 'Cisco', 'Google', 'Amazon'];

const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const t = setInterval(() => setRoleIdx(i => (i + 1) % ROLES.length), 2200);
    return () => clearInterval(t);
  }, []);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', overflowX: 'hidden' }} className="grid-bg">

      {/* Ambient glow top */}
      <div style={{
        position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 400, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse, rgba(0,200,150,0.06) 0%, transparent 70%)',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,13,15,0.85)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              🗺️
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em' }}>
              JobTrail<span style={{ color: 'var(--accent)' }}>.AI</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: 20, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
              Free to use
            </span>
            <button onClick={handleLogin}
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)', padding: '8px 18px', borderRadius: 8, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-3)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
              Sign in →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 700 }}>

          {/* Badge */}
          <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>AI-Powered Job Application Tracker</span>
          </div>

          {/* Heading */}
          <h1 className="fade-up-1" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>
            Track every<br />
            <span style={{ color: 'var(--accent)' }}>job application</span><br />
            automatically.
          </h1>

          {/* Rotating role */}
          <div className="fade-up-1" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span style={{ fontSize: '14px', color: 'var(--text-3)' }}>Currently tracking:</span>
            <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600, minWidth: 200 }}>
              {ROLES[roleIdx]}
              <span style={{ animation: 'blink 1s step-end infinite', color: 'var(--accent)' }}>|</span>
            </span>
          </div>

          {/* Sub */}
          <p className="fade-up-2" style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 40, maxWidth: 520 }}>
            Connects to your Gmail. Reads confirmation emails from every job platform.
            Extracts company, role, and status using AI — completely automatically.
          </p>

          {/* CTA */}
          <div className="fade-up-3" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button onClick={handleLogin}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 28px', borderRadius: 10, border: 'none',
                background: 'var(--accent)', color: '#0A0D0F',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans',
                boxShadow: '0 0 0 0 rgba(0,200,150,0)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,200,150,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#0A0D0F" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#0A0D0F" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#0A0D0F" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#0A0D0F" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Get started for free
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6 }}>
              Read-only Gmail · No credit card · Free forever
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="fade-up-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginTop: 80, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--border)' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-1)', padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Scrolling ticker */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 48, width: 'max-content', animation: 'marquee 20s linear infinite' }}>
          {[...SOURCES, ...SOURCES].map((s, i) => (
            <span key={i} style={{ fontSize: '12px', color: 'var(--text-3)', whiteSpace: 'nowrap', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 24, height: 1, background: 'var(--accent)' }} />
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Features</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', maxWidth: 480 }}>
            Everything you need.<br />
            <span style={{ color: 'var(--accent)' }}>Nothing you don't.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--border)' }}>
          {FEATURES.map((f, i) => (
            <div key={i}
              style={{ background: 'var(--bg-1)', padding: '32px 28px', transition: 'background 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-1)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 20 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 96px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 24, height: 1, background: 'var(--accent)' }} />
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>How it works</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
            Set up in <span style={{ color: 'var(--accent)' }}>60 seconds.</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--border)' }}>
          {[
            { n: '01', title: 'Sign in with Google', desc: 'We request read-only Gmail access. We can never modify, send, or delete your emails.' },
            { n: '02', title: 'We scan your inbox', desc: 'JobTrail searches for job application confirmation emails from every major job platform automatically.' },
            { n: '03', title: 'AI extracts the data', desc: 'Llama 3.3 70B reads each email and pulls out company, role, date applied, and current status.' },
            { n: '04', title: 'Your dashboard updates', desc: 'Every application appears in your tracker. Search, filter, and open any email in one click.' },
          ].map((step, i) => (
            <div key={i}
              style={{ background: 'var(--bg-1)', padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: 24, transition: 'background 0.15s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-1)'}
            >
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter', minWidth: 28, paddingTop: 2, letterSpacing: '0.06em' }}>{step.n}</span>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 96px', position: 'relative', zIndex: 1 }}>
        <div style={{
          padding: '64px 48px', borderRadius: 16,
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 32, position: 'relative', overflow: 'hidden'
        }}>
          {/* Glow */}
          <div style={{ position: 'absolute', right: -100, top: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,150,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: 10 }}>
              Ready to take control<br />of your job search?
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>
              Free forever. Read-only Gmail access. Zero manual entry.
            </p>
          </div>

          <button onClick={handleLogin}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '13px 28px', borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: '#0A0D0F',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans', transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,200,150,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            Get started for free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
        <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '14px' }}>
          JobTrail<span style={{ color: 'var(--accent)' }}>.AI</span>
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
          Read-only Gmail · Your data stays yours
        </span>
      </footer>

    </div>
  );
};

export default LandingPage;