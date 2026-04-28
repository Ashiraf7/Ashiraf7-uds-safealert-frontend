import { useCallback } from 'react';

export function useHaptics() {
  const impact = useCallback(async (style = 'Medium') => {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle[style] });
    } catch {
      // Fallback to browser vibration
      if (navigator.vibrate) {
        const patterns = {
          Light: [50],
          Medium: [100],
          Heavy: [200, 50, 200],
        };
        navigator.vibrate(patterns[style] || [100]);
      }
    }
  }, []);

  const notification = useCallback(async (type = 'Success') => {
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType[type] });
    } catch {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const sos = useCallback(async () => {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      for (let i = 0; i < 3; i++) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, []);

  return { impact, notification, sos };
}
