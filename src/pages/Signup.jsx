import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, HOSTELS, BLOOD_TYPES } from '../utils/constants';
import styles from './Auth.module.css';

const STEPS = ['Account', 'Personal', 'Medical', 'Safety'];

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phone: '',
    department: '',
    hostel: '',
    bloodType: '',
    allergies: '',
    medicalNotes: '',
    emergencyName: '',
    emergencyPhone: '',
    alertRadius: '3km (recommended)',
    notifications: 'Push + SMS + Sound',
    agreedToTerms: false,
  });

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!form.name || !form.email || !form.password) return 'Fill in all fields';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return 'Enter a valid email address';
    }
    if (step === 1) {
      if (!form.studentId || !form.phone) return 'Student ID and phone are required';
    }
    if (step === 3) {
      if (!form.agreedToTerms) return 'You must agree to the terms to continue';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    const res = await signup(form);
    if (res.success) navigate('/');
    else setError(res.error || 'Signup failed');
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#FF4444', '#FF8C00', '#FFD700', '#00C853', '#00C853'][
    strength
  ];

  return (
    <div className={styles.page}>
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
            Join the
            <br />
            <span>safety network.</span>
          </h1>
          <p className={styles.brandSub}>
            Register in under 2 minutes. Your profile helps first responders reach you
            faster.
          </p>
          <div className={styles.featureList}>
            {[
              '🚨 One-touch SOS panic alert',
              '📍 GPS location sharing in emergencies',
              '📱 Triple Volume Down activation',
              '👥 Instant 3km community alerts',
              '🏥 Medical info for first responders',
            ].map((f) => (
              <div key={f} className={styles.featureItem}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formBox}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create your account</h2>
            <p className={styles.formSub}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>

          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s} className={styles.stepItem}>
                <div
                  className={`${styles.stepDot} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <div
                  className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}
                >
                  {s}
                </div>
              </div>
            ))}
            <div className={styles.stepLine}>
              <div
                className={styles.stepLineFill}
                style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form
            onSubmit={
              step < STEPS.length - 1
                ? (e) => {
                    e.preventDefault();
                    next();
                  }
                : handleSubmit
            }
            className={styles.form}
          >
            {/* STEP 0: Account */}
            {step === 0 && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>👤</span>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Kofi Mensah"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                    />
                  </div>
                </div>
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
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      className={styles.input}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPass((p) => !p)}
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {form.password && (
                    <div className={styles.strengthRow}>
                      <div className={styles.strengthBar}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={styles.strengthSegment}
                            style={{
                              background:
                                i <= strength ? strengthColor : 'var(--surface3)',
                            }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          color: strengthColor,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Confirm Password</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                    />
                    {form.confirmPassword && (
                      <span className={styles.matchIcon}>
                        {form.password === form.confirmPassword ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* STEP 1: Personal */}
            {step === 1 && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Student ID</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🎓</span>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="CSC/0005/24"
                      value={form.studentId}
                      onChange={(e) => update('studentId', e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone Number</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>📱</span>
                    <input
                      className={styles.input}
                      type="tel"
                      placeholder="+233 24 000 0000"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Department</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🏛️</span>
                    <select
                      className={styles.input}
                      value={form.department}
                      onChange={(e) => update('department', e.target.value)}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Hostel / Residence</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🏠</span>
                    <select
                      className={styles.input}
                      value={form.hostel}
                      onChange={(e) => update('hostel', e.target.value)}
                    >
                      <option value="">Select hostel</option>
                      {HOSTELS.map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Medical */}
            {step === 2 && (
              <>
                <div className={styles.safetyNote}>
                  <div className={styles.safetyNoteIcon}>🏥</div>
                  <div>
                    <strong>Medical Information</strong>
                    <p>
                      Helps first responders give you the right care immediately. All
                      fields are optional.
                    </p>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Blood Type</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🩸</span>
                    <select
                      className={styles.input}
                      value={form.bloodType}
                      onChange={(e) => update('bloodType', e.target.value)}
                    >
                      <option value="">Unknown / Prefer not to say</option>
                      {BLOOD_TYPES.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Known Allergies</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>⚠️</span>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="e.g. Penicillin, Peanuts, None"
                      value={form.allergies}
                      onChange={(e) => update('allergies', e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Medical Conditions / Notes</label>
                  <textarea
                    className={styles.input}
                    rows={3}
                    placeholder="Any conditions first responders should know e.g. Asthma, Diabetes..."
                    value={form.medicalNotes}
                    onChange={(e) => update('medicalNotes', e.target.value)}
                    style={{ resize: 'vertical', padding: '0.75rem' }}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Alert Notification Method</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🔔</span>
                    <select
                      className={styles.input}
                      value={form.notifications}
                      onChange={(e) => update('notifications', e.target.value)}
                    >
                      <option>Push + SMS + Sound</option>
                      <option>Push notification only</option>
                      <option>SMS only</option>
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Alert Radius</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>📍</span>
                    <select
                      className={styles.input}
                      value={form.alertRadius}
                      onChange={(e) => update('alertRadius', e.target.value)}
                    >
                      <option>200m (recommended)</option>
                      <option>500m</option>
                      <option>1km (entire area)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Safety */}
            {step === 3 && (
              <>
                <div className={styles.safetyNote}>
                  <div className={styles.safetyNoteIcon}>🛡️</div>
                  <div>
                    <strong>Emergency Contact</strong>
                    <p>
                      This person will be notified immediately when you trigger a panic
                      alert.
                    </p>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Contact Name</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>👥</span>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="e.g. Mum, Dad, Friend"
                      value={form.emergencyName}
                      onChange={(e) => update('emergencyName', e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Contact Phone</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>📞</span>
                    <input
                      className={styles.input}
                      type="tel"
                      placeholder="+233 20 000 0000"
                      value={form.emergencyPhone}
                      onChange={(e) => update('emergencyPhone', e.target.value)}
                    />
                  </div>
                </div>
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={form.agreedToTerms}
                    onChange={(e) => update('agreedToTerms', e.target.checked)}
                  />
                  <span className={styles.checkLabel}>
                    I agree to the{' '}
                    <span className={styles.switchLink}>Terms of Service</span> and allow
                    UDS SafeAlert to access my location during emergencies.
                  </span>
                </label>
              </>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.spinner} />
              ) : step < STEPS.length - 1 ? (
                'Continue →'
              ) : (
                'Create Account'
              )}
            </button>
            {step > 0 && (
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => {
                  setError('');
                  setStep((s) => s - 1);
                }}
              >
                ← Back
              </button>
            )}
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
