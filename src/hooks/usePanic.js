import { useState, useRef, useCallback } from 'react';

export function usePanic(onTrigger) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const intervalRef = useRef(null);
  const activeRef = useRef(false);

  // Triple power-button press detection
  const pressCountRef = useRef(0);
  const pressTimerRef = useRef(null);

  const startHold = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsHolding(true);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 3.33;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(intervalRef.current);
        activeRef.current = false;
        setIsHolding(false);
        setProgress(0);
        onTrigger();
      }
    }, 100);
  }, [onTrigger]);

  const cancelHold = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
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
