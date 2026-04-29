import { useState, useRef, useCallback } from 'react';

export function usePanic(onTrigger) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const rafRef = useRef(null); // requestAnimationFrame — no wasted ticks when tab is hidden
  const startTimeRef = useRef(null);
  const activeRef = useRef(false);

  // Triple power-button press detection
  const pressCountRef = useRef(0);
  const pressTimerRef = useRef(null);

  const HOLD_DURATION = 3000; // ms to hold for SOS

  const startHold = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const tick = (now) => {
      if (!activeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const p = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        activeRef.current = false;
        setIsHolding(false);
        setProgress(0);
        onTrigger();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [onTrigger]);

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    activeRef.current = false;
    setIsHolding(false);
    setProgress(0);
  }, []);

  const handleKeyPress = useCallback(
    (key) => {
      if (key.toLowerCase() !== 'p') return;
      pressCountRef.current += 1;
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      pressTimerRef.current = setTimeout(() => {
        pressCountRef.current = 0;
      }, 800);
      if (pressCountRef.current >= 3) {
        pressCountRef.current = 0;
        clearTimeout(pressTimerRef.current);
        onTrigger();
      }
    },
    [onTrigger]
  );

  return { progress, isHolding, startHold, cancelHold, handleKeyPress };
}
