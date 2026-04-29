import { useEffect, useRef, useState } from 'react';
import Modal from '../components/Modal';
import styles from './MapView.module.css';

const ALERT_PINS = [
  {
    id: 'fire',
    lat: 9.4075,
    lng: -0.9686,
    color: '#FF4444',
    bg: 'rgba(255,68,68,0.15)',
    border: 'rgba(255,68,68,0.4)',
    emoji: '🔥',
    label: 'FIRE',
    type: 'critical',
    detail: {
      title: 'Fire Alert — Main Hall',
      body: 'Type: Fire / Smoke | Location: Main Hall, Block C | Reported: 2 min ago | Responders: 5 on scene | Status: ACTIVE',
    },
  },
  {
    id: 'sec',
    lat: 9.4035,
    lng: -0.9726,
    color: '#FF8C00',
    bg: 'rgba(255,140,0,0.15)',
    border: 'rgba(255,140,0,0.4)',
    emoji: '⚠️',
    label: 'SECURITY',
    type: 'warning',
    detail: {
      title: 'Security Alert — Hostel A Gate',
      body: 'Type: Security Threat | Location: Hostel A, Main Gate | Reported: 18 min ago | Responders: 3 dispatched | Status: MONITORING',
    },
  },
];

const CAMPUS = { lat: 9.4055, lng: -0.9706 };

export default function MapView() {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const userMarker = useRef(null);
  const circleRef = useRef(null); // keep ref at component scope
  const watchIdRef = useRef(null);

  const [pinDetail, setPinDetail] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [locError, setLocError] = useState(null);
  const [tracking, setTracking] = useState(false);

  const setPinDetailRef = useRef(setPinDetail);
  useEffect(() => {
    setPinDetailRef.current = setPinDetail;
  }, []);

  // This function is defined at component scope so it can
  // reliably access circleRef, userMarker, leafletRef
  const updatePos = useRef(null);

  useEffect(() => {
    // Define updatePos inside effect but store in ref so tracking callbacks can call it
    updatePos.current = (latlng, L, map) => {
      setUserPos({ lat: latlng[0].toFixed(5), lng: latlng[1].toFixed(5) });

      // Always move the 3km circle to be centered on user
      if (circleRef.current) {
        circleRef.current.setLatLng(latlng);
      }

      // Move or create user dot
      if (userMarker.current) {
        userMarker.current.setLatLng(latlng);
      } else {
        const icon = L.divIcon({
          html: `<div style="
            width:18px;height:18px;
            background:#7C4DFF;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 0 0 6px rgba(124,77,255,0.25),0 3px 10px rgba(0,0,0,0.4);
          "></div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        userMarker.current = L.marker(latlng, { icon, zIndexOffset: 200 })
          .addTo(map)
          .bindPopup('<b>📍 Your location</b><br><small>Live GPS</small>');
        // Pan map to user on first fix
        map.setView(latlng, 16);
      }
    };
  });

  useEffect(() => {
    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      initMap();
    };

    const initMap = () => {
      if (leafletRef.current || !mapRef.current) return;
      const L = window.L;

      const map = L.map(mapRef.current, {
        center: [CAMPUS.lat, CAMPUS.lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: 'center',
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = map;

      // Alert pins — pulsing dots
      ALERT_PINS.forEach((pin) => {
        const iconHtml = `
          <div style="
            position:relative;
            width:36px;
            height:36px;
            cursor:pointer;
          ">
            <div style="
              position:absolute;
              inset:-10px;
              border-radius:50%;
              background:${pin.color};
              opacity:0.18;
              animation:safePulse 2s ease-out infinite;
            "></div>
            <div style="
              position:absolute;
              inset:-5px;
              border-radius:50%;
              background:${pin.color};
              opacity:0.28;
              animation:safePulse 2s ease-out infinite;
              animation-delay:0.4s;
            "></div>
            <div style="
              position:absolute;
              inset:8px;
              border-radius:50%;
              background:${pin.color};
              box-shadow:0 0 0 3px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.4);
            "></div>
          </div>
          <style>
            @keyframes safePulse {
              0%   { transform: scale(0.6); opacity: 0.4; }
              70%  { transform: scale(1.6); opacity: 0; }
              100% { transform: scale(1.6); opacity: 0; }
            }
          </style>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconAnchor: [18, 18],
        });
        L.marker([pin.lat, pin.lng], { icon, zIndexOffset: 100 })
          .addTo(map)
          .on('click', () => setPinDetailRef.current(pin));
      });

      // Create 3km circle at campus initially — it will move to user as soon as GPS fires
      circleRef.current = L.circle([CAMPUS.lat, CAMPUS.lng], {
        radius: 200,
        color: '#7C4DFF',
        fillColor: '#7C4DFF',
        fillOpacity: 0.05,
        weight: 2,
        dashArray: '8,6',
      }).addTo(map);

      // Start GPS tracking
      startTracking(map, L);
    };

    const startTracking = (map, L) => {
      const tryBrowser = () => {
        if (!navigator.geolocation) {
          setLocError('Location unavailable on this device');
          return;
        }

        // Use watchPosition so it updates continuously as you move
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const latlng = [pos.coords.latitude, pos.coords.longitude];
            updatePos.current?.(latlng, L, map);
            setLocError(null);
            setTracking(true);
          },
          (err) => {
            setLocError('Allow location permission for live tracking');
            // Do NOT fall back to campus — leave circle where it is
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0, // always get fresh position, never cached
          }
        );
        watchIdRef.current = { type: 'browser', id };
      };

      const tryCapacitor = async () => {
        try {
          const { Geolocation } = await import('@capacitor/geolocation');
          await Geolocation.requestPermissions();
          const id = await Geolocation.watchPosition(
            { enableHighAccuracy: true },
            (pos, err) => {
              if (err || !pos) return;
              const latlng = [pos.coords.latitude, pos.coords.longitude];
              updatePos.current?.(latlng, L, map);
              setTracking(true);
            }
          );
          watchIdRef.current = { type: 'capacitor', id };
          setTracking(true);
        } catch {
          tryBrowser();
        }
      };

      tryCapacitor();
    };

    loadLeaflet();

    return () => {
      if (watchIdRef.current?.type === 'browser') {
        navigator.geolocation.clearWatch(watchIdRef.current.id);
      }
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
        userMarker.current = null;
        circleRef.current = null;
      }
    };
  }, []);

  const centerOnMe = () => {
    if (userMarker.current && leafletRef.current)
      leafletRef.current.setView(userMarker.current.getLatLng(), 17);
  };

  const centerOnCampus = () => {
    if (leafletRef.current) leafletRef.current.setView([CAMPUS.lat, CAMPUS.lng], 16);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Campus Alert Map</h1>
          <p className={styles.sub}>
            {tracking
              ? `📍 Live · ${userPos ? `${userPos.lat}°N ${userPos.lng}°W` : 'locating...'}`
              : locError
                ? `⚠️ ${locError}`
                : '⏳ Getting your location...'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={styles.mapBtn} onClick={centerOnMe}>
            📍 My Location
          </button>
          <button className={styles.mapBtn} onClick={centerOnCampus}>
            🏫 Campus
          </button>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <div ref={mapRef} className={styles.mapCanvas} />
        <div className={styles.liveIndicator}>
          <div className={`${styles.liveDot} ${tracking ? styles.liveDotActive : ''}`} />
          {tracking ? 'LIVE' : 'SEARCHING'}
        </div>
      </div>

      <div className={styles.mapStats}>
        {[
          { val: '2', label: 'Active Alerts', color: 'var(--red)' },
          { val: '1,247', label: 'Online', color: 'var(--text)' },
          { val: '200m', label: 'Your Radius', color: 'var(--purple)' },
          {
            val: tracking ? 'ON' : 'OFF',
            label: 'GPS',
            color: tracking ? 'var(--green)' : 'var(--text3)',
          },
        ].map((s) => (
          <div key={s.label} className={styles.mapStat}>
            <div className={styles.mapStatVal} style={{ color: s.color }}>
              {s.val}
            </div>
            <div className={styles.mapStatLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!pinDetail} onClose={() => setPinDetail(null)}>
        {pinDetail && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
              {pinDetail.emoji}
            </div>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                marginBottom: '1rem',
                color: pinDetail.color,
              }}
            >
              {pinDetail.detail.title}
            </h2>
            <div
              style={{
                background: 'var(--surface2)',
                border: `1px solid ${pinDetail.border}`,
                borderRadius: 12,
                padding: '1.1rem',
                textAlign: 'left',
                fontSize: '0.85rem',
                color: 'var(--text2)',
                lineHeight: 2,
              }}
            >
              {pinDetail.detail.body.split(' | ').map((line, i) => {
                const colonIdx = line.indexOf(': ');
                const key = line.slice(0, colonIdx);
                const val = line.slice(colonIdx + 2);
                return (
                  <div key={i}>
                    <strong style={{ color: 'var(--text)' }}>{key}:</strong> {val}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setPinDetail(null)}
              style={{
                marginTop: '1.25rem',
                width: '100%',
                padding: '0.85rem',
                background: 'var(--surface2)',
                border: '1px solid var(--border2)',
                borderRadius: 10,
                color: 'var(--text)',
                fontFamily: 'var(--font)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
