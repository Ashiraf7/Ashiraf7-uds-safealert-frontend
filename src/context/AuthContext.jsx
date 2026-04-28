// src/context/AuthContext.jsx  — real backend version
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI, usersAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('safealert_user');
    const token  = localStorage.getItem('safealert_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const persist = (userData, token) => {
    localStorage.setItem('safealert_token', token);
    localStorage.setItem('safealert_user', JSON.stringify(userData));
    setUser(userData);
  };

  // ── login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { token, user: userData } = await authAPI.login({ email, password });
      persist(userData, token);
      return { success: true };
    } catch (err) {
      const msg = err?.error || err?.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── signup ─────────────────────────────────────────────────────────────
  const signup = useCallback(async (formData) => {
    setError(null);
    setLoading(true);
    try {
      const { token, user: userData } = await authAPI.register(formData);
      persist(userData, token);
      return { success: true };
    } catch (err) {
      const msg = err?.error || err?.message || 'Signup failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('safealert_user');
    localStorage.removeItem('safealert_token');
  }, []);

  // ── updateProfile ──────────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    try {
      await usersAPI.updateProfile(updates);
      setUser(prev => {
        const updated = { ...prev, ...updates };
        localStorage.setItem('safealert_user', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.error || 'Update failed' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      isLoggedIn: !!user,
      isAdmin: user?.role === 'admin',
      login, signup, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
