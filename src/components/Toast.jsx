import { useAlerts } from '../context/AlertContext';
import styles from './Toast.module.css';

export default function Toast() {
  const { toasts } = useAlerts();
  const icons = { success: '✓', error: '!', warning: '⚠' };

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>{icons[t.type] || 'i'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
