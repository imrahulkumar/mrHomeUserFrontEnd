import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

const POLL_MS = 60_000;

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
  const [selected, setSelected] = useState(null); // notification opened from the list
  const wrapRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setFeed(await api.getNotifications());
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
    if (!open && !selected) return undefined;
    const onDown = (e) => open && !wrapRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (selected) setSelected(null);
      else setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, selected]);

  // Clicking a notification opens it in full and marks just that one read.
  const openNotification = (n) => {
    setOpen(false);
    setSelected(n);
    if (n.read) return;
    api.markNotificationsRead([n._id]).catch(() => {});
    setFeed((f) => ({
      items: f.items.map((x) => (x._id === n._id ? { ...x, read: true } : x)),
      unread: Math.max(0, f.unread - 1),
    }));
  };

  const markAllRead = () => {
    api.markNotificationsRead().catch(() => {});
    setFeed((f) => ({ items: f.items.map((x) => ({ ...x, read: true })), unread: 0 }));
  };

  return (
    <>
      <div className="notif" ref={wrapRef}>
        <button className="cart-link notif-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications" aria-expanded={open}>
          🔔
          {feed.unread > 0 && <span className="cart-badge">{feed.unread > 9 ? '9+' : feed.unread}</span>}
        </button>

        {open && (
          <div className="notif-panel card" role="dialog" aria-label="Notifications">
            <header className="notif-head">
              Notifications
              {feed.unread > 0 && <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>}
            </header>
            {feed.items.length === 0 ? (
              <p className="muted notif-empty">You're all caught up.</p>
            ) : (
              <ul className="notif-list">
                {feed.items.map((n) => (
                  <li key={n._id}>
                    <button type="button" className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => openNotification(n)}>
                      {n.image && <img src={n.image} alt="" />}
                      <div>
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <span className="muted small">{formatDate(n.createdAt)}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="notif-popup-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="notif-popup card" role="dialog" aria-modal="true" aria-label={selected.title}>
            <button className="notif-popup-close" onClick={() => setSelected(null)} aria-label="Close">✕</button>
            {selected.image && <img src={selected.image} alt="" />}
            <div className="notif-popup-body">
              <h3>{selected.title}</h3>
              <p>{selected.message}</p>
              <div className="row-center">
                <ActionLink n={selected} className="btn btn-primary" onClick={() => setSelected(null)} />
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
