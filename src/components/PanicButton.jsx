import { useState, useEffect, useRef } from 'react';
import { usePanic } from '../hooks/usePanic';
import styles from './PanicButton.module.css';

export default function PanicButton({ onTrigger }) {
  const { progress, isHolding, startHold, cancelHold, handleKeyPress } =
    usePanic(onTrigger);
  const secsLeft = Math.ceil((100 - progress) / 33.3);

  useEffect(() => {
    const handler = (e) => handleKeyPress(e.key);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyPress]);

  return (
    <div className={styles.zone}>
      <p className={styles.instruction}>
        Hold 3 secs to send a panic alert to nearby responders and campus security.
      </p>
      <div className={styles.btnWrap}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <button
          className={`${styles.btn} ${isHolding ? styles.charging : ''}`}
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={(e) => {
            e.preventDefault();
            startHold();
          }}
          onTouchEnd={cancelHold}
        >
          <span className={styles.btnIcon}>🚨</span>
          SOS
          <small className={styles.btnSub}>PANIC ALERT</small>
        </button>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.counter}>
        {isHolding
          ? `Hold... ${Math.max(1, secsLeft)}s remaining`
          : 'Hold to activate · Or triple-press the P key on your keyboard'}
      </p>
    </div>
  );
}
