import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('simaset_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('simaset_token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (nim, password) => {
    setIsLoading(true);
    try {
      const res = await client.post('/auth/login', { nim, password });
      // Backend returns: { status: 'success', message: 'Login berhasil', data: { token: '...', user: { id, nim, namaLengkap, role } } }
      const resData = res.data || res;
      const newToken = resData.token;
      const newUser = resData.user;

      localStorage.setItem('simaset_token', newToken);
      localStorage.setItem('simaset_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      return { success: false, error: err.message || 'Gagal login. Periksa NIM dan sandi Anda.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('simaset_token');
    localStorage.removeItem('simaset_user');
    setToken(null);
    setUser(null);
  }, []);

  // Listen to unauthorized events triggered by API client interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
