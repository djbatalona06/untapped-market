import { useStore, unreadCount } from '../store/useStore';
import type { Route } from '../types';

const TOP_LINKS: Array<{ label: string; route: Route }> = [
  { label: 'Explore', route: { page: 'explore' } },
  { label: 'Strains', route: { page: 'catalog' } },
  { label: 'Finder', route: { page: 'finder' } },
  { label: 'AI Match', route: { page: 'quiz' } },
  { label: 'Library', route: { page: 'library' } },
];

const BOTTOM_TABS: Array<{ label: string; icon: string; route: Route }> = [
  { label: 'Explore', icon: '🌲', route: { page: 'explore' } },
  { label: 'Strains', icon: '🌿', route: { page: 'catalog' } },
  { label: 'Finder', icon: '📍', route: { page: 'finder' } },
  { label: 'Match', icon: '✨', route: { page: 'quiz' } },
  { label: 'You', icon: '👤', route: { page: 'account' } },
];

function isActive(current: Route, target: Route): boolean {
  return current.page === target.page;
}

export function Nav() {
  const route = useStore((s) => s.route);
  const navigate = useStore((s) => s.navigate);
  const notifications = useStore((s) => s.notifications);
  const user = useStore((s) => s.user);
  const setNotificationCenterOpen = useStore((s) => s.setNotificationCenterOpen);
  const notificationCenterOpen = useStore((s) => s.notificationCenterOpen);

  const unread = unreadCount(notifications);
  const avatarInitial = (user.signedIn ? user.username : 'g')[0].toUpperCase();

  return (
    <>
      <nav className="nav">
        <button className="nav-logo" onClick={() => navigate({ page: 'home' })}>
          <span className="nav-logo-mark">🌲</span>
          <span>Untapped Market</span>
        </button>
        <div className="nav-links">
          {TOP_LINKS.map((l) => (
            <button
              key={l.label}
              className={`nav-link${isActive(route, l.route) ? ' active' : ''}`}
              onClick={() => navigate(l.route)}
            >
              {l.label}
            </button>
          ))}
          <button
            className={`nav-link premium${route.page === 'premium' ? ' active' : ''}`}
            onClick={() => navigate({ page: 'premium' })}
          >
            Upgrade
          </button>
        </div>
        <button
          className="nav-bell"
          onClick={() => setNotificationCenterOpen(!notificationCenterOpen)}
          aria-label="Notifications"
        >
          🔔
          {unread > 0 && <span className="nav-bell-badge">{unread}</span>}
        </button>
        <button className="nav-avatar" onClick={() => navigate({ page: 'account' })}>
          {avatarInitial}
        </button>
      </nav>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {BOTTOM_TABS.map((t) => (
            <button
              key={t.label}
              className={`bottom-tab${isActive(route, t.route) ? ' active' : ''}`}
              onClick={() => navigate(t.route)}
            >
              <span className="bottom-tab-icon">{t.icon}</span>
              <span>{t.label}</span>
              {t.label === 'You' && unread > 0 && (
                <span className="bottom-tab-badge">{unread}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
