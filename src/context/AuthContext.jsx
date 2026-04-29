// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI, usersAPI, DEMO_MODE } from '../services/api';

const AuthContext = createContext(null);

// ── Demo users (used when no backend is configured) ──────────────────────────
const DEMO_USERS = {
  'student@gmail.com': {
    password: 'student123',
    user: {
      id: 'demo-student-1',
      name: 'Ama Asante',
      email: 'student@gmail.com',
      role: 'student',
      studentId: 'CSC/0012/25',
      department: 'Computer Science',
      hostel: 'Hostel C (Female)',
      phone: '+233 24 567 8901',
      bloodType: 'O+',
    },
    token: 'demo-student-token',
  },
  'admin@gmail.com': {
    password: 'admin123',
    user: {
      id: 'demo-admin-1',
      name: 'Campus Admin',
      email: 'admin@gmail.com',
      role: 'admin',
      studentId: 'ADMIN/001',
      department: 'Administration',
      hostel: 'Off-campus',
      phone: '+233 30 000 0001',
      bloodType: 'A+',
    },
    token: 'demo-admin-token',
  },
};

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

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      // Demo mode — authenticate locally, no network call
      if (DEMO_MODE) {
        await new Promise(r => setTimeout(r, 600)); // simulate latency
        const entry = DEMO_USERS[email.toLowerCase()];
        if (!entry || entry.password !== password) {
          const msg = 'Invalid email or password';
          setError(msg);
          return { success: false, error: msg };
        }
        persist(entry.user, entry.token);
        return { success: true };
      }

      // Real backend
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

  // ── signup ─────────────────────────────────────────────────────────────────
  const signup = useCallback(async (formData) => {
    setError(null);
    setLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise(r => setTimeout(r, 800));
        // In demo mode, create a local user from the signup form
        const newUser = {
          id: `demo-${Date.now()}`,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: 'student',
          studentId: formData.studentId || '',
          department: formData.department || '',
          hostel: formData.hostel || '',
          phone: formData.phone || '',
          bloodType: formData.bloodType || '',
        };
        persist(newUser, `demo-token-${Date.now()}`);
        return { success: true };
      }

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

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('safealert_user');
    localStorage.removeItem('safealert_token');
  }, []);

  // ── updateProfile ──────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    try {
      if (!DEMO_MODE) await usersAPI.updateProfile(updates);
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
      demoMode: DEMO_MODE,
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
