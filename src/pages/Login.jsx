import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    const res = await login(form.email, form.password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <div className={styles.page}>
      {/* Left — branding */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.brandLogo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div>
              <div className={styles.brandName}>UDS SafeAlert</div>
              <div className={styles.brandTagline}>Nyankpala Campus</div>
            </div>
          </div>
          <h1 className={styles.brandHeadline}>
            Your safety,
            <br />
            <span>our priority.</span>
          </h1>
          <p className={styles.brandSub}>
            Join 1,247 students and staff already protected by the campus-wide emergency
            alert network. One press. Instant help.
          </p>
          <div className={styles.brandStats}>
            {[
              { val: '3km', label: 'Alert radius' },
              { val: '<30s', label: 'Response time' },
              { val: '24/7', label: 'Always on' },
            ].map((s) => (
              <div key={s.label} className={styles.brandStat}>
                <div className={styles.brandStatVal}>{s.val}</div>
                <div className={styles.brandStatLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className={styles.formSide}>
        <div className={styles.formBox}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSub}>Sign in to your SafeAlert account</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <button type="button" className={styles.forgotLink}>
                  Forgot password?
                </button>
              </div>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  className={styles.input}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          {/* Demo quick-login */}
          <div className={styles.demoRow}>
            <button
              className={styles.demoBtn}
              onClick={() => {
                update('email', 'student@gmail.com');
                update('password', 'student123');
              }}
            >
              👤 Use Student Demo
            </button>
            <button
              className={styles.demoBtn}
              onClick={() => {
                update('email', 'admin@gmail.com');
                update('password', 'admin123');
              }}
            >
              ⚙️ Use Admin Demo
            </button>
          </div>

          <p className={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.switchLink}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
