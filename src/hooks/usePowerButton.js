import { useEffect, useRef, useCallback } from 'react';

/**
 * Triple-press SOS trigger.
 *
 * WEB / PWA:
 *   Uses MediaSession API to intercept media hardware keys.
 *   The user must interact with the page first (play audio or click).
 *   Falls back to triple-press of 'V' key on keyboard.
 *
 * CAPACITOR (Android native build):
 *   Volume keys are intercepted via dispatchKeyEvent override in MainActivity.
 *   See CAPACITOR_SETUP.md for native code to add.
 *
 * WHY volume keys don't work in browser by default:
 *   Browser security intentionally blocks websites from overriding hardware
 *   volume keys — it would be a huge UX violation if any website could do that.
 *   The MediaSession API is the ONLY sanctioned workaround.
 */
export function usePowerButton(onTriplePress) {
  const pressCountRef = useRef(0);
  const timerRef = useRef(null);
  const lastPressRef = useRef(0);
  const callbackRef = useRef(onTriplePress);
  const audioRef = useRef(null);

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
    // ── Method 1: MediaSession API (works in Chrome/Edge on Android) ──
    // Set up a silent audio element so MediaSession activates
    const setupMediaSession = () => {
      try {
        if (!('mediaSession' in navigator)) return;

        // Create silent audio that loops so MediaSession stays active
        const audio = new Audio();
        audio.src =
          'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        audio.loop = true;
        audio.volume = 0.001; // nearly silent
        audioRef.current = audio;

        // Use 'previoustrack' for volume-down-like action
        // MediaSession maps hardware media keys:
        // previoustrack = volume down (on some Android devices & headphones)
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          handleTriple();
        });

        // Also try seekbackward
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          handleTriple();
        });

        // Play on first user interaction
        const startAudio = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', startAudio);
          document.removeEventListener('touchstart', startAudio);
        };
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('touchstart', startAudio, { once: true });
      } catch (e) {
        console.log('MediaSession not available:', e);
      }
    };

    // ── Method 2: Capacitor Android native bridge ──
    const setupCapacitor = async () => {
      try {
        // Listen for custom event fired from Capacitor native plugin
        // (see CAPACITOR_SETUP.md for MainActivity.java code)
        const onVolDown = () => handleTriple();
        window.addEventListener('volumedown', onVolDown);
        return () => window.removeEventListener('volumedown', onVolDown);
      } catch {
        return null;
      }
    };

    // ── Method 3: Android WebView keydown (works inside Capacitor) ──
    const onKeyDown = (e) => {
      // Android WebView volume down keyCode = 182
      // Some devices use keyCode 25 (KEYCODE_VOLUME_DOWN)
      if (
        e.keyCode === 182 ||
        e.keyCode === 25 ||
        e.key === 'AudioVolumeDown' ||
        e.key === 'VolumeDown' ||
        e.key.toLowerCase() === 'v' // web keyboard fallback
      ) {
        // Only prevent default inside Capacitor (not browser)
        // to avoid breaking actual volume control in browser
        if (window.Capacitor) {
          e.preventDefault();
          e.stopPropagation();
        }
        handleTriple();
      }
    };

    setupMediaSession();
    const capCleanup = setupCapacitor();
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      capCleanup?.then?.((fn) => fn?.());
      if (timerRef.current) clearTimeout(timerRef.current);
      // Clean up MediaSession
      try {
        if (navigator.mediaSession) {
          navigator.mediaSession.setActionHandler('previoustrack', null);
          navigator.mediaSession.setActionHandler('seekbackward', null);
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      } catch {}
    };
  }, [handleTriple]);
}
