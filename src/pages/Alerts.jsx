import { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import AlertCard from '../components/AlertCard';
import styles from './Alerts.module.css';

const FILTERS = ['all', 'critical', 'warning', 'info', 'resolved'];

export default function Alerts() {
  const { alerts } = useAlerts();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.type === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Active Alerts</h1>
        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.chip} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No {filter} alerts at this time.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
