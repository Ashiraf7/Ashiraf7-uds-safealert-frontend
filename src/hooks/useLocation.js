import { useState, useCallback } from 'react';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Try Capacitor Geolocation first (native — more accurate, works in background)
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      await Geolocation.requestPermissions();
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
      });
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(loc);
      setLoading(false);
      return loc;
    } catch {
      // Capacitor not available or permission denied — fall back to browser API
    }

    // Browser Geolocation fallback
    if (!navigator.geolocation) {
      const fallback = { lat: 9.4055, lng: -0.9706 };
      setLocation(fallback);
      setLoading(false);
      return fallback;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        () => {
          const fallback = { lat: 9.4055, lng: -0.9706 };
          setLocation(fallback);
          setLoading(false);
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }, []);

  return { location, error, loading, getLocation };
}
