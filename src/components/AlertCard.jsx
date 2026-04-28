import { useAlerts } from '../context/AlertContext';
import styles from './AlertCard.module.css';

export default function AlertCard({ alert }) {
  const { respondToAlert } = useAlerts();

  return (
    <div className={`${styles.card} ${styles[alert.type]}`}>
      <div className={styles.top}>
        <span className={`${styles.badge} ${styles[alert.type]}`}>
          {alert.type.toUpperCase()}
        </span>
        <span className={styles.time}>{alert.time}</span>
      </div>
      <div className={styles.title}>
        {alert.icon} {alert.title}
      </div>
      <div className={styles.desc}>{alert.desc}</div>
      <div className={styles.footer}>
        <span className={styles.loc}>📍 {alert.loc}</span>
        <span className={styles.responders}>👥 {alert.responders} responders</span>
        {alert.status !== 'resolved' && (
          <button className={styles.respondBtn} onClick={() => respondToAlert(alert.id)}>
            Respond
          </button>
        )}
      </div>
    </div>
  );
}
