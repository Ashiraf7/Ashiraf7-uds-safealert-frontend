// src/context/AlertContext.jsx
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { io as socketIO } from 'socket.io-client';
import { alertsAPI, DEMO_MODE } from '../services/api';
import { MOCK_ALERTS } from '../utils/constants';

const AlertContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export function AlertProvider({ children }) {
  const [alerts, setAlerts]       = useState([]);
  const [toasts, setToasts]       = useState([]);
  const [systemOnline, setOnline] = useState(false);
  const socketRef = useRef(null);

  // ── Connect socket (real mode only) ───────────────────────────────────────
  useEffect(() => {
    if (DEMO_MODE || !SOCKET_URL) return;

    const token = localStorage.getItem('safealert_token');
    if (!token) return;

    const socket = socketIO(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => setOnline(true));
    socket.on('disconnect', () => setOnline(false));

    socket.on('alert:new', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      showToast(`🚨 New alert: ${alert.title}`, 'error');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    });

    socket.on('alert:resolved', (updated) => {
      setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
    });

    socket.on('alert:respond', ({ alertId, responderCount }) => {
      setAlerts(prev =>
        prev.map(a => a.id === alertId ? { ...a, responders: responderCount } : a)
      );
    });

    socket.on('broadcast', ({ title, body }) => {
      showToast(`📢 ${title}: ${body}`, 'info');
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Location ping (real mode only) ────────────────────────────────────────
  useEffect(() => {
    if (DEMO_MODE) return;
    const tick = () => {
      if (!socketRef.current?.connected) return;
      navigator.geolocation?.getCurrentPosition(pos =>
        socketRef.current.emit('location:update', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      );
    };
    const id = setInterval(tick, 120_000);
    tick();
    return () => clearInterval(id);
  }, []);

  // ── Fetch / seed initial alerts ───────────────────────────────────────────
  useEffect(() => {
    if (DEMO_MODE) {
      // Use mock data; simulate system being online
      setAlerts(MOCK_ALERTS);
      setOnline(true);
      return;
    }
    const token = localStorage.getItem('safealert_token');
    if (!token) return;
    alertsAPI.getAll({ status: 'active' })
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Toasts ────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Send alert ────────────────────────────────────────────────────────────
  const sendAlert = useCallback(async (alertData) => {
    if (DEMO_MODE) {
      const newAlert = {
        id: `ALT${Date.now()}`,
        ...alertData,
        time: 'Just now',
        responders: 0,
        reporter: 'You',
        status: 'active',
      };
      setAlerts(prev => [newAlert, ...prev]);
      showToast('Alert broadcast to nearby users!', 'error');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      return;
    }
    try {
      await alertsAPI.create(alertData);
      showToast('Alert broadcast to nearby users!', 'error');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    } catch (err) {
      showToast(err?.error || 'Failed to send alert', 'error');
    }
  }, [showToast]);

  // ── Resolve alert ─────────────────────────────────────────────────────────
  const resolveAlert = useCallback(async (id) => {
    if (DEMO_MODE) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
      showToast('Alert marked as resolved', 'success');
      return;
    }
    try {
      await alertsAPI.resolve(id);
      showToast('Alert marked as resolved', 'success');
    } catch {
      showToast('Failed to resolve alert', 'error');
    }
  }, [showToast]);

  // ── Respond to alert ──────────────────────────────────────────────────────
  const respondToAlert = useCallback(async (id) => {
    if (DEMO_MODE) {
      setAlerts(prev =>
        prev.map(a => a.id === id ? { ...a, responders: (a.responders || 0) + 1 } : a)
      );
      showToast('You are now marked as a responder', 'success');
      return;
    }
    try {
      await alertsAPI.respond(id);
      showToast('You are now marked as a responder', 'success');
    } catch {
      showToast('Failed to register response', 'error');
    }
  }, [showToast]);

  return (
    <AlertContext.Provider value={{
      alerts, toasts, systemOnline,
      showToast, sendAlert, resolveAlert, respondToAlert,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
};
