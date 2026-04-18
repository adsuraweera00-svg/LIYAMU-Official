import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useTheme } from './ThemeContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem('liyamu-auth') || 'null'));
  const [loading, setLoading] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (auth) {
      localStorage.setItem('liyamu-auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('liyamu-auth');
    }
  }, [auth]);

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', payload);
      setAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      setAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (payload) => {
    const { data } = await api.post('/auth/social-login', payload);
    setAuth(data);
    return data;
  };

  const logout = () => setAuth(null);

  const value = useMemo(() => ({ auth, setAuth, login, register, socialLogin, logout, loading }), [auth, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
