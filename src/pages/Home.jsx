import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PanicButton from '../components/PanicButton';
import Modal from '../components/Modal';
import { useAlerts } from '../context/AlertContext';
import { usePowerButton } from '../hooks/usePowerButton';
import { useHaptics } from '../hooks/useHaptics';
import { useLocation } from '../hooks/useLocation';
import { ALERT_TYPES } from '../utils/constants';
import styles from './Home.module.css';

const QUICK_ACTIONS = [
  { type: 'fire', icon: '🔥', label: 'Fire Alert', sub: 'Report fire or smoke' },
  { type: 'medical', icon: '🏥', label: 'Medical Help', sub: 'Need first aid' },
  { type: 'security', icon: '🚔', label: 'Security Threat', sub: 'Suspicious activity' },
  { type: 'accident', icon: '⚠️', label: 'Accident', sub: 'Road or campus incident' },
];

export default function Home() {
  const navigate = useNavigate();
  const { sendAlert, alerts } = useAlerts();
  const { getLocation } = useLocation();
  const { sos: sosHaptics } = useHaptics();

  const [panicModal, setPanicModal] = useState(false);
  const [quickModal, setQuickModal] = useState(null);
  const [sentModal, setSentModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [quickDesc, setQuickDesc] = useState('');
  const [sentInfo, setSentInfo] = useState(null);

  // FIX: store countdown timer in a ref so we can cancel it reliably
  const countdownRef = useRef(null);
  const cancelledRef = useRef(false);
  const locationRef = useRef(null);

  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  const fireSOS = useCallback(
    (loc) => {
      // FIX: check if user cancelled before firing
      if (cancelledRef.current) return;
      const info = {
        location: loc
          ? `${loc.lat.toFixed(4)}N, ${Math.abs(loc.lng).toFixed(4)}W`
          : 'Nyankpala UDS Campus',
        notified: 347,
        time: new Date().toLocaleTimeString(),
      };
      sosHaptics();
      setSentInfo(info);
      setSentModal(true);
      setPanicModal(false);
      sendAlert({
        type: 'critical',
        alertType: 'sos',
        icon: '🚨',
        title: 'SOS Panic Alert — Campus',
        desc: 'Student triggered SOS panic button. Immediate assistance required.',
        loc: 'Nyankpala UDS Campus',
        reporter: 'You',
        status: 'active',
      });
    },
    [sendAlert, sosHaptics]
  );

  const handlePanicTrigger = useCallback(async () => {
    // Reset cancel flag every time panic is triggered
    cancelledRef.current = false;
    setPanicModal(true);
    // Get location in background
    getLocation().then((loc) => {
      locationRef.current = loc;
    });
    // Start countdown
    let c = 5;
    setCountdown(c);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        fireSOS(locationRef.current);
      }
    }, 1000);
  }, [getLocation, fireSOS]);

  // FIX: cancel properly clears timer AND sets cancelled flag
  const handleCancel = useCallback(() => {
    cancelledRef.current = true;
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setPanicModal(false);
    setCountdown(5);
  }, []);

  // Triple volume-down press — defined AFTER handlePanicTrigger
  usePowerButton(handlePanicTrigger);

  const handleQuickSend = () => {
    const meta = ALERT_TYPES[quickModal];
    sendAlert({
      type: meta.severity === 'critical' ? 'critical' : 'warning',
      alertType: quickModal,
      icon: meta.icon,
      title: `${meta.label} — Campus`,
      desc: quickDesc || `${meta.label} reported on campus.`,
      loc: 'Nyankpala UDS Campus',
      reporter: 'You',
      status: 'active',
    });
    setQuickModal(null);
    setQuickDesc('');
  };

  return (
    <div className={styles.page}>
      {/* Left Panel */}
      <div className={styles.left}>
        <div className={styles.statusBar}>
          <div className={styles.statusDot} />
          <span>SYSTEM ONLINE</span>
          <span className={styles.statusRight}>Nyankpala Campus · 200m</span>
        </div>

        <div className={styles.heroText}>
          <div className={styles.heroLabel}>UDS Nyankpala Emergency Network</div>
          <h1 className={styles.h1}>
            Stay Safe.
            <br />
            <span>Alert Fast.</span>
            <br />
            Get Help.
          </h1>
          <p className={styles.sub}>
            Campus-wide emergency alerts for UDS Nyankpala students and staff. Hold the
            panic button to alert everyone within 200m.
          </p>
          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => navigate('/profile')}
            >
              My Profile
            </button>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => navigate('/alerts')}
            >
              View Alerts
            </button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.green}`}>1,247</div>
            <div className={styles.statLabel}>Registered</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.red}`}>{activeAlerts}</div>
            <div className={styles.statLabel}>Active</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.amber}`}>98%</div>
            <div className={styles.statLabel}>Response</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.right}>
        <PanicButton onTrigger={handlePanicTrigger} />
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map((qa) => (
            <div
              key={qa.type}
              className={styles.quickCard}
              onClick={() => setQuickModal(qa.type)}
            >
              <div className={styles.qaIcon}>{qa.icon}</div>
              <div className={styles.qaLabel}>{qa.label}</div>
              <div className={styles.qaSub}>{qa.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panic Countdown Modal */}
      <Modal isOpen={panicModal} onClose={handleCancel}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Send SOS Alert?
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Your location is being retrieved. Alert will fire in:
          </p>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid var(--red)',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: 800,
              fontFamily: 'var(--mono)',
              color: 'var(--red)',
              boxShadow: '0 0 30px rgba(255,68,68,0.3)',
            }}
          >
            {countdown}
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button
              onClick={() => fireSOS(locationRef.current)}
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg,var(--red),#FF6B35)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontFamily: 'var(--font)',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 4px 16px rgba(255,68,68,0.4)',
              }}
            >
              🚨 Send SOS Now
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '0.9rem',
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border2)',
                borderRadius: 10,
                fontFamily: 'var(--font)',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              ✕ Cancel — False Alarm
            </button>
          </div>
        </div>
      </Modal>

      {/* SOS Sent Modal */}
      <Modal isOpen={sentModal} onClose={() => setSentModal(false)}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            SOS Alert Sent!
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>
            Help is on the way. Stay calm and safe.
          </p>
          {sentInfo && (
            <div
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '1rem',
                textAlign: 'left',
                fontSize: '0.82rem',
                color: 'var(--text2)',
                lineHeight: 1.8,
                marginBottom: '1.5rem',
              }}
            >
              <strong style={{ color: 'var(--text)' }}>📍 Location:</strong>{' '}
              {sentInfo.location}
              <br />
              <strong style={{ color: 'var(--text)' }}>👥 Notified:</strong>{' '}
              {sentInfo.notified} users within 200m
              <br />
              <strong style={{ color: 'var(--text)' }}>🕐 Time:</strong> {sentInfo.time}
            </div>
          )}
          <button
            onClick={() => setSentModal(false)}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border2)',
              borderRadius: 10,
              fontFamily: 'var(--font)',
              fontWeight: 600,
            }}
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Quick Alert Modal */}
      <Modal isOpen={!!quickModal} onClose={() => setQuickModal(null)}>
        {quickModal && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {ALERT_TYPES[quickModal]?.icon}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {ALERT_TYPES[quickModal]?.label}
            </h2>
            <p
              style={{ color: 'var(--text2)', marginBottom: '1rem', fontSize: '0.88rem' }}
            >
              Describe the situation. Your location will be attached automatically.
            </p>
            <textarea
              value={quickDesc}
              onChange={(e) => setQuickDesc(e.target.value)}
              placeholder="e.g. Smoke from Main Hall kitchen, second floor..."
              rows={3}
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '0.75rem',
                color: 'var(--text)',
                fontFamily: 'var(--font)',
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none',
                marginBottom: '1rem',
              }}
            />
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button
                onClick={handleQuickSend}
                style={{
                  padding: '0.9rem',
                  background: 'linear-gradient(135deg,var(--red),#FF6B35)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontFamily: 'var(--font)',
                  fontWeight: 700,
                }}
              >
                Send Alert to All Nearby Users
              </button>
              <button
                onClick={() => setQuickModal(null)}
                style={{
                  padding: '0.8rem',
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  border: '1px solid var(--border2)',
                  borderRadius: 10,
                  fontFamily: 'var(--font)',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
