import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

const POLL_MS = 60_000;
const POPPED_KEY = 'notifications_popped';

// Popups already shown this session, so a failed "mark read" doesn't make one reappear on every page.
const popped = {
  get: () => {
    try { return JSON.parse(sessionStorage.getItem(POPPED_KEY)) ?? []; } catch { return []; }
  },
  add: (id) => {
    try { sessionStorage.setItem(POPPED_KEY, JSON.stringify([...popped.get(), id])); } catch { /* storage blocked */ }
  },
};

/** "View" target: the linked product, else the admin's link (store path or external URL). */
function ActionLink({ n, onClick, className }) {
  if (n.product?.slug) return <Link to={`/product/${n.product.slug}`} className={className} onClick={onClick}>View</Link>;
  if (n.link?.startsWith('/')) return <Link to={n.link} className={className} onClick={onClick}>View</Link>;
  if (/^https?:\/\//.test(n.link ?? '')) return <a href={n.link} target="_blank" rel="noreferrer" className={className} onClick={onClick}>View</a>;
  return null;
}

export default function NotificationBell() {
  const { user, checking } = useAuth();
  const [feed, setFeed] = useState({ items: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState(null);
  const wrapRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setFeed(data);
      const shown = popped.get();
      setPopup((current) => current ?? data.items.find((n) => n.showAsPopup && !n.read && !shown.includes(n._id)) ?? null);
    } catch {
      // notifications are optional: keep whatever we had
    }
  }, []);

  // Reload when the visitor logs in/out, every minute, and when the tab regains focus.
  useEffect(() => {
    if (checking) return undefined;
    load();
    const timer = setInterval(load, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [checking, user?._id, load]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Opening the bell marks everything read; items keep their "new" dot until the next reload.
  const toggle = () => {
    setOpen((o) => !o);
    if (!open && feed.unread > 0) {
      setFeed((f) => ({ ...f, unread: 0 }));
      api.markNotificationsRead().catch(() => {});
    }
  };

  const closePopup = () => {
    popped.add(popup._id);
    api.markNotificationsRead([popup._id]).catch(() => {});
    setFeed((f) => ({
      items: f.items.map((n) => (n._id === popup._id ? { ...n, read: true } : n)),
      unread: Math.max(0, f.unread - (popup.read ? 0 : 1)),
    }));
    setPopup(null);
  };

  return (
    <>
      <div className="notif" ref={wrapRef}>
        <button className="cart-link notif-btn" onClick={toggle} aria-label="Notifications" aria-expanded={open}>
          🔔
          {feed.unread > 0 && <span className="cart-badge">{feed.unread > 9 ? '9+' : feed.unread}</span>}
        </button>

        {open && (
          <div className="notif-panel card" role="dialog" aria-label="Notifications">
            <header className="notif-head">Notifications</header>
            {feed.items.length === 0 ? (
              <p className="muted notif-empty">You're all caught up.</p>
            ) : (
              <ul className="notif-list">
                {feed.items.map((n) => (
                  <li key={n._id} className={n.read ? '' : 'unread'}>
                    {n.image && <img src={n.image} alt="" />}
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <div className="notif-meta">
                        <span className="muted small">{formatDate(n.createdAt)}</span>
                        <ActionLink n={n} className="notif-view" onClick={() => setOpen(false)} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {popup && (
        <div className="notif-popup-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closePopup()}>
          <div className="notif-popup card" role="dialog" aria-modal="true" aria-label={popup.title}>
            <button className="notif-popup-close" onClick={closePopup} aria-label="Close">✕</button>
            {popup.image && <img src={popup.image} alt="" />}
            <div className="notif-popup-body">
              <h3>{popup.title}</h3>
              <p>{popup.message}</p>
              <div className="row-center">
                <ActionLink n={popup} className="btn btn-primary" onClick={closePopup} />
                <button className="btn btn-ghost" onClick={closePopup}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
