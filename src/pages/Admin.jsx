import { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { MOCK_INCIDENTS, MOCK_USERS } from '../utils/constants';
import styles from './Admin.module.css';

export default function Admin() {
  const { showToast, resolveAlert } = useAlerts();
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);

  const resolveIncident = (id) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'active' } : i))
    );
    showToast('Incident marked as resolved', 'success');
  };

  const STATS = [
    { val: '1,247', label: 'Total Registered', change: '+23 this week', color: '' },
    { val: '2', label: 'Active Alerts', change: '1 unresolved', color: styles.red },
    {
      val: '14',
      label: 'Total This Month',
      change: '-3 from last month',
      color: styles.amber,
    },
    {
      val: '4.2m',
      label: 'Avg Response Time',
      change: 'Improved by 0.8m',
      color: styles.green,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={styles.btnSecondary}
            onClick={() => showToast('Broadcast panel coming soon!', 'warning')}
          >
            📢 Broadcast Alert
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => showToast('Report exported!', 'success')}
          >
            Export Report
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={`${styles.statVal} ${s.color}`}>{s.val}</div>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statChange}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableHead}>
          <div className={styles.tableTitle}>Recent Incidents</div>
          <button className={styles.btnSecondary}>View All</button>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Reporter</th>
                <th>Location</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>
                    {i.id}
                  </td>
                  <td>{i.type}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{i.reporter}</td>
                  <td style={{ color: 'var(--text3)' }}>{i.loc}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>
                    {i.time}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[i.status]}`}>
                      {i.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.resolveBtn}
                      onClick={() => resolveIncident(i.id)}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableHead}>
          <div className={styles.tableTitle}>Registered Users</div>
          <input className={styles.search} type="text" placeholder="Search users..." />
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Department</th>
                <th>Hostel</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>
                    {u.id}
                  </td>
                  <td>{u.dept}</td>
                  <td>{u.hostel}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>
                    {u.phone}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
