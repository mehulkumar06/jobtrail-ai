import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ApplicationsPage from './pages/ApplicationsPage';
import AIChatbot from './components/AIChatbot';
import useAuth from './context/useAuth';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'var(--accent)', color: '#111008', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, padding: '6px 12px', fontSize: '14px', borderRadius: 8 }}>JT</div>
          <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<ApplicationsPage />} />
      </Routes>
      {isAuthenticated && <AIChatbot />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;