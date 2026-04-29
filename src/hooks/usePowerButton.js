import { useEffect, useRef, useCallback } from 'react';

/**
 * Triple-press SOS trigger.
 *
 * WEB / PWA:
 *   Falls back to triple-press of 'V' key on keyboard.
 *   MediaSession / looping audio removed — it drained CPU/battery continuously.
 *
 * CAPACITOR (Android native build):
 *   Volume keys are intercepted via dispatchKeyEvent override in MainActivity.
 */
export function usePowerButton(onTriplePress) {
  const pressCountRef = useRef(0);
  const timerRef = useRef(null);
  const lastPressRef = useRef(0);
  const callbackRef = useRef(onTriplePress);

  useEffect(() => {
    callbackRef.current = onTriplePress;
  }, [onTriplePress]);

  const handleTriple = useCallback(() => {
    const now = Date.now();
    if (now - lastPressRef.current > 1500) pressCountRef.current = 0;
    lastPressRef.current = now;
    pressCountRef.current += 1;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      pressCountRef.current = 0;
    }, 1500);

    if (pressCountRef.current >= 3) {
      pressCountRef.current = 0;
      clearTimeout(timerRef.current);
      callbackRef.current?.();
    }
  }, []);

  useEffect(() => {
    // ── Capacitor Android native bridge ──
    const onVolDown = () => handleTriple();
    window.addEventListener('volumedown', onVolDown);

    // ── Keyboard fallback (web: triple-press V) ──
    const onKeyDown = (e) => {
      if (
        e.keyCode === 182 ||
        e.keyCode === 25 ||
        e.key === 'AudioVolumeDown' ||
        e.key === 'VolumeDown' ||
        e.key.toLowerCase() === 'v'
      ) {
        if (window.Capacitor) {
          e.preventDefault();
          e.stopPropagation();
        }
        handleTriple();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('volumedown', onVolDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleTriple]);
}
