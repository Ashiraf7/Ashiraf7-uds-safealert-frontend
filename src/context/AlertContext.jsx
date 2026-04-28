// src/context/AlertContext.jsx  — real backend + Socket.io version
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { io as socketIO } from 'socket.io-client';
import { alertsAPI } from '../services/api';

const AlertContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export function AlertProvider({ children }) {
  const [alerts, setAlerts]       = useState([]);
  const [toasts, setToasts]       = useState([]);
  const [systemOnline, setOnline] = useState(false);
  const socketRef = useRef(null);

  // ── Connect socket on mount (after token is available) ─────────────────
  useEffect(() => {
    const token = localStorage.getItem('safealert_token');
    if (!token) return;

    const socket = socketIO(BASE_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => setOnline(true));
    socket.on('disconnect', () => setOnline(false));

    // A new alert was created by anyone on campus
    socket.on('alert:new', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      showToast(`🚨 New alert: ${alert.title}`, 'error');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    });

    // An alert was resolved
    socket.on('alert:resolved', (updated) => {
      setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
    });

    // Responder count ticked up
    socket.on('alert:respond', ({ alertId, responderCount }) => {
      setAlerts(prev =>
        prev.map(a => a.id === alertId ? { ...a, responders: responderCount } : a)
      );
    });

    // Admin broadcast
    socket.on('broadcast', ({ title, body }) => {
      showToast(`📢 ${title}: ${body}`, 'info');
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Send location every 2 minutes ──────────────────────────────────────
  useEffect(() => {
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

  // ── Fetch initial alert list ────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('safealert_token');
    if (!token) return;
    alertsAPI.getAll({ status: 'active' })
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Toasts ──────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Send alert (calls API, socket event will come back) ─────────────────
  const sendAlert = useCallback(async (alertData) => {
    try {
      await alertsAPI.create(alertData);
      // The server will emit 'alert:new' back via socket
      showToast('Alert broadcast to nearby users!', 'error');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    } catch (err) {
      showToast(err?.error || 'Failed to send alert', 'error');
    }
  }, [showToast]);

  // ── Resolve alert ───────────────────────────────────────────────────────
  const resolveAlert = useCallback(async (id) => {
    try {
      await alertsAPI.resolve(id);
      showToast('Alert marked as resolved', 'success');
    } catch {
      showToast('Failed to resolve alert', 'error');
    }
  }, [showToast]);

  // ── Respond to alert ────────────────────────────────────────────────────
  const respondToAlert = useCallback(async (id) => {
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
