import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, HOSTELS, BLOOD_TYPES } from '../utils/constants';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [contacts, setContacts] = useState(
    user?.emergencyContacts?.length ? user.emergencyContacts : [{ name: '', phone: '' }]
  );

  const [form, setForm] = useState({
    name: user?.name || '',
    studentId: user?.studentId || '',
    phone: user?.phone || '',
    email: user?.email || '',
    department: user?.department || '',
    hostel: user?.hostel || '',
    bloodType: user?.bloodType || '',
    allergies: user?.allergies || '',
    medicalNotes: user?.medicalNotes || '',
    alertRadius: user?.alertRadius || '3km (recommended)',
    notifications: user?.notifications || 'Push + SMS + Sound',
  });

  const [saved, setSaved] = useState(false);

  const update = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));
  const addContact = () => setContacts((prev) => [...prev, { name: '', phone: '' }]);
  const removeContact = (i) => setContacts((prev) => prev.filter((_, idx) => idx !== i));
  const updateContact = (i, field, val) =>
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));

  const save = () => {
    updateProfile({ ...form, emergencyContacts: contacts });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Field = ({ label, icon, children }) => (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        {children}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Header with avatar */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase() || '?'}</div>
        <div>
          <h1 className={styles.profileName}>{user?.name || 'Your Profile'}</h1>
          <p className={styles.profileRole}>
            {user?.role === 'admin' ? '⚙️ Admin' : '🎓 Student'} · {user?.email}
          </p>
          {user?.studentId && <p className={styles.profileId}>ID: {user.studentId}</p>}
        </div>
        {saved && <div className={styles.savedBadge}>✅ Saved!</div>}
      </div>

      {/* Personal Info */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <span>👤</span> Personal Information
        </div>
        <div className={styles.grid}>
          <Field label="Full Name" icon="👤">
            <input
              className={styles.input}
              type="text"
              placeholder="Kofi Mensah"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </Field>
          <Field label="Student ID" icon="🎓">
            <input
              className={styles.input}
              type="text"
              placeholder="CSC/0011/23"
              value={form.studentId}
              onChange={(e) => update('studentId', e.target.value)}
            />
          </Field>
          <Field label="Phone Number" icon="📱">
            <input
              className={styles.input}
              type="tel"
              placeholder="+233 24 000 0000"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </Field>
          <Field label="Email Address" icon="✉️">
            <input
              className={styles.input}
              type="email"
              placeholder="you@gmail.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </Field>
          <Field label="Department" icon="🏛️">
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
          </Field>
          <Field label="Hostel / Residence" icon="🏠">
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
          </Field>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <span>📞</span> Emergency Contacts
        </div>
        {contacts.map((c, i) => (
          <div key={i} className={styles.contactRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="Contact name"
              value={c.name}
              onChange={(e) => updateContact(i, 'name', e.target.value)}
            />
            <input
              className={styles.input}
              type="tel"
              placeholder="Phone number"
              value={c.phone}
              onChange={(e) => updateContact(i, 'phone', e.target.value)}
            />
            <button className={styles.removeBtn} onClick={() => removeContact(i)}>
              ✕
            </button>
          </div>
        ))}
        <button className={styles.addBtn} onClick={addContact}>
          + Add emergency contact
        </button>
      </div>

      {/* Medical Info */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <span>🏥</span> Medical Information
        </div>
        <div className={styles.grid}>
          <Field label="Blood Type" icon="🩸">
            <select
              className={styles.input}
              value={form.bloodType}
              onChange={(e) => update('bloodType', e.target.value)}
            >
              <option value="">Unknown</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Known Allergies" icon="⚠️">
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. Penicillin, Peanuts"
              value={form.allergies}
              onChange={(e) => update('allergies', e.target.value)}
            />
          </Field>
          <div className={`${styles.formGroup} ${styles.full}`}>
            <label className={styles.label}>Medical Conditions / Notes</label>
            <textarea
              className={styles.input}
              rows={2}
              placeholder="Any conditions first responders should know about..."
              value={form.medicalNotes}
              onChange={(e) => update('medicalNotes', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Alert Preferences */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <span>🔔</span> Alert Preferences
        </div>
        <div className={styles.grid}>
          <Field label="Notification Method" icon="🔔">
            <select
              className={styles.input}
              value={form.notifications}
              onChange={(e) => update('notifications', e.target.value)}
            >
              <option>Push + SMS + Sound</option>
              <option>Push notification only</option>
              <option>SMS only</option>
            </select>
          </Field>
          <Field label="Alert Radius" icon="📍">
            <select
              className={styles.input}
              value={form.alertRadius}
              onChange={(e) => update('alertRadius', e.target.value)}
            >
              <option>200m (recommended)</option>
              <option>500m</option>
              <option>1km (entire area)</option>
            </select>
          </Field>
        </div>
      </div>

      <button className={styles.saveBtn} onClick={save}>
        Save Changes
      </button>
    </div>
  );
}
