import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function NotificationCenter() {
  const open = useStore((s) => s.notificationCenterOpen);
  const setOpen = useStore((s) => s.setNotificationCenterOpen);
  const notifications = useStore((s) => s.notifications);
  const markAllRead = useStore((s) => s.markAllRead);
  const markRead = useStore((s) => s.markNotificationRead);
  const navigate = useStore((s) => s.navigate);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    setTimeout(() => document.addEventListener('click', onClick), 0);
    return () => document.removeEventListener('click', onClick);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="notif-panel" ref={panelRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong style={{ fontFamily: 'DM Serif Display, serif' }}>Notifications</strong>
        <button
          className="nav-link"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
          onClick={markAllRead}
        >
          Mark all read
        </button>
      </div>
      {notifications.length === 0 && (
        <p className="muted" style={{ fontSize: '0.9rem' }}>You're all caught up.</p>
      )}
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notif-item${n.read ? '' : ' unread'}`}
          onClick={() => {
            markRead(n.id);
            if (n.strainId) {
              navigate({ page: 'strain', id: n.strainId });
              setOpen(false);
            }
          }}
          style={{ cursor: n.strainId ? 'pointer' : 'default' }}
        >
          <div className="notif-title">{n.title}</div>
          <div className="notif-body">{n.body}</div>
          <div className="notif-date">{n.createdAt}</div>
        </div>
      ))}
    </div>
  );
}
