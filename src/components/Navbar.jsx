import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/alerts', label: 'Alerts', icon: '🚨' },
  { path: '/map', label: 'Map', icon: '🗺️' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { alerts } = useAlerts();
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'active').length;
  const closeMenu = () => setMenuOpen(false);

  const allItems = isAdmin
    ? [...NAV_ITEMS, { path: '/admin', label: 'Admin', icon: '⚙️' }]
    : NAV_ITEMS;

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <div className={styles.logoDot}>
            <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <span className={styles.logoText}>UDS SafeAlert</span>
          {activeAlerts > 0 && <span className={styles.alertBadge}>{activeAlerts}</span>}
        </Link>

        <div className={styles.desktopLinks}>
          {allItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navBtn} ${pathname === item.path ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <div className={styles.userChip}>
              <span className={styles.userAvatar}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </span>
              <span className={styles.userName}>{user.name?.split(' ')[0]}</span>
              <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
                ⏏
              </button>
            </div>
          )}
        </div>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {menuOpen && (
        <div className={styles.overlay} onClick={closeMenu}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerLogo}>
                <div className={styles.logoDot}>
                  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                UDS SafeAlert
              </div>
              <button className={styles.closeBtn} onClick={closeMenu}>
                ✕
              </button>
            </div>

            {user && (
              <div className={styles.drawerUser}>
                <div className={styles.drawerAvatar}>
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className={styles.drawerUserName}>{user.name}</div>
                  <div className={styles.drawerUserRole}>
                    {isAdmin ? '⚙️ Admin' : '🎓 Student'}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.drawerLinks}>
              {allItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.drawerLink} ${pathname === item.path ? styles.drawerActive : ''}`}
                  onClick={closeMenu}
                >
                  <span className={styles.drawerIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.path === '/alerts' && activeAlerts > 0 && (
                    <span className={styles.drawerBadge}>{activeAlerts} active</span>
                  )}
                </Link>
              ))}
            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.drawerLogout} onClick={handleLogout}>
                ⏏ Sign Out
              </button>
              <div className={styles.onlineStatus}>
                <div className={styles.statusDot} />
                System Online · Nyankpala Campus
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.bottomBar}>
        {allItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.tabItem} ${pathname === item.path ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon}>{item.icon}</span>
            <span className={styles.tabLabel}>{item.label}</span>
            {item.path === '/alerts' && activeAlerts > 0 && (
              <span className={styles.tabBadge}>{activeAlerts}</span>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
