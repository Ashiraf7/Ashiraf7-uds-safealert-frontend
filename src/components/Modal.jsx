import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className={styles.close} onClick={onClose}>
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
