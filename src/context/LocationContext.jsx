// src/context/LocationContext.jsx
// Global persistent location tracker — starts once on login, never resets on page change.
// MapView reads from this instead of running its own watchPosition.
// Home/SOS reads from this so location is always ready instantly.

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const LocationContext = createContext(null);

const CAMPUS_FALLBACK = { lat: 9.4055, lng: -0.9706 };

export function LocationProvider({ children }) {
  const [location, setLocation]   = useState(null);   // { lat, lng } — current best position
  const [accuracy, setAccuracy]   = useState(null);   // metres
  const [tracking, setTracking]   = useState(false);  // true once GPS has a fix
  const [error, setError]         = useState(null);

  const watchIdRef    = useRef(null);  // browser watchPosition ID
  const capWatchRef   = useRef(null);  // Capacitor watch ID
  const startedRef    = useRef(false); // guard so we only start once

  const startTracking = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Try Capacitor first (native Android/iOS — most accurate)
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      await Geolocation.requestPermissions();
      const id = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (pos, err) => {
          if (err || !pos) return;
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAccuracy(pos.coords.accuracy);
          setTracking(true);
          setError(null);
        }
      );
      capWatchRef.current = id;
      return; // Capacitor succeeded — don't start browser watch
    } catch {
      // Not in Capacitor — fall through to browser API
    }

    // Browser geolocation watchPosition
    if (!navigator.geolocation) {
      setLocation(CAMPUS_FALLBACK);
      setError('GPS not available — using campus centre');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(pos.coords.accuracy);
        setTracking(true);
        setError(null);
      },
      (err) => {
        // On error, keep last known location — don't wipe it
        setError('Location permission denied — allow it for accurate SOS');
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
    watchIdRef.current = id;
  }, []);

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (capWatchRef.current !== null) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        await Geolocation.clearWatch({ id: capWatchRef.current });
      } catch {}
      capWatchRef.current = null;
    }
    startedRef.current = false;
    setTracking(false);
  }, []);

  // getLocation — returns current position immediately if we have one,
  // otherwise waits for first fix (used by SOS)
  const getLocation = useCallback(() => {
    if (location) return Promise.resolve(location);
    // No fix yet — do a one-shot getCurrentPosition as fallback
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(CAMPUS_FALLBACK);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(location || CAMPUS_FALLBACK),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    });
  }, [location]);

  // Start tracking immediately when provider mounts (user is logged in)
  useEffect(() => {
    startTracking();
    return () => { stopTracking(); };
  }, [startTracking, stopTracking]);

  return (
    <LocationContext.Provider value={{
      location,       // { lat, lng } | null
      accuracy,       // metres | null
      tracking,       // boolean — true = has GPS fix
      error,          // string | null
      getLocation,    // () => Promise<{ lat, lng }> — always resolves
      startTracking,
      stopTracking,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocationContext = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
};
