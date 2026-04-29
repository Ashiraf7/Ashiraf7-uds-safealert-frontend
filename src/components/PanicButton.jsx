import { useState, useEffect, useRef } from 'react';
import { usePanic } from '../hooks/usePanic';
import styles from './PanicButton.module.css';

export default function PanicButton({ onTrigger }) {
  const { progress, isHolding, startHold, cancelHold, handleKeyPress } =
    usePanic(onTrigger);
  const secsLeft = Math.ceil((100 - progress) / 33.3);
  const ringsRef = useRef(null);

  // FIX: pause ring animations when tab is hidden — saves significant CPU
  useEffect(() => {
    const handleVisibility = () => {
      if (!ringsRef.current) return;
      const rings = ringsRef.current.querySelectorAll(`.${styles.ring}`);
      rings.forEach((r) => {
        r.style.animationPlayState = document.hidden ? 'paused' : 'running';
      });
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

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
      <div className={styles.btnWrap} ref={ringsRef}>
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
