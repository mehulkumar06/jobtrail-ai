
import { createContext, useEffect, useState, useRef } from 'react';
import api from '../api/axios';
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    // Safety timeout — never stay stuck forever
    const timeout = setTimeout(() => {
      console.warn('Auth check timed out');
      setLoading(false);
    }, 5000);

    api.get('/auth/me')
      .then(res => {
        console.log('Auth me response:', res.data);
        clearTimeout(timeout);
        setUser(res.data);
        setIsAuthenticated(true);
        setLoading(false);
      })
      .catch(err => {
        console.log('Auth me error:', err.response?.status, err.message);
        clearTimeout(timeout);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};