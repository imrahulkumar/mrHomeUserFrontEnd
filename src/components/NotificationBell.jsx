import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

// How often an open store tab checks for new notifications (VITE_NOTIFICATION_POLL_SECONDS, default 15).
const POLL_MS = (Number(import.meta.env.VITE_NOTIFICATION_POLL_SECONDS) || 15) * 1000;

// Notifications the visitor swiped away; kept in this browser so they stay hidden after reloads.
const DISMISSED_KEY = 'dismissed_notifications';
const DISMISSED_MAX = 200;

function loadDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY)) ?? []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids].slice(-DISMISSED_MAX)));
  } catch {
    // storage unavailable: the dismissal just won't survive a reload
  }
}

/** The feed without dismissed notifications, with the unread count to match. */
function withoutDismissed(feed, dismissed) {
  const items = feed.items.filter((n) => !dismissed.has(n._id));
  return { items, unread: items.filter((n) => !n.read).length };
}

// A row is deleted once dragged sideways past this share of its width.
const SWIPE_DELETE_RATIO = 0.35;
const SWIPE_START_PX = 8;

/** List row that can be dragged left or right (touch or mouse) to delete it. */
function SwipeToDelete({ onDelete, children }) {
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(0); // -1 / 1 while sliding out
  const drag = useRef(null);
  const swallowClick = useRef(false);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    swallowClick.current = false;
    drag.current = { x: e.clientX, y: e.clientY, dx: 0, active: false, width: e.currentTarget.offsetWidth };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (!d.active) {
      if (Math.abs(mx) < SWIPE_START_PX && Math.abs(my) < SWIPE_START_PX) return;
      // Mostly vertical: let the list scroll instead.
      if (Math.abs(my) >= Math.abs(mx)) {
        drag.current = null;
        return;
      }
      d.active = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    d.dx = mx;
    setDx(mx);
  };

  const onPointerEnd = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    swallowClick.current = true; // a drag is not a click on the notification
    if (Math.abs(d.dx) > d.width * SWIPE_DELETE_RATIO) {
      setLeaving(Math.sign(d.dx));
      setTimeout(onDelete, 200);
    } else {
      setDx(0);
    }
  };

  const onClickCapture = (e) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const dragging = dx !== 0 && !leaving && drag.current?.active;
  const side = (leaving || dx) > 0 ? 'left' : 'right';

  return (
    <li className="notif-swipe">
      <div className={`notif-swipe-bg ${side}`} aria-hidden="true">🗑 Delete</div>
      <div
        className="notif-swipe-fg"
        style={{
          transform: leaving ? `translateX(${leaving * 100}%)` : `translateX(${dx}px)`,
          transition: dragging ? 'none' : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </li>
  );
}

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
  const dismissedRef = useRef(null);
  dismissedRef.current ??= loadDismissed();

  const load = useCallback(async () => {
    try {
      setFeed(withoutDismissed(await api.getNotifications(), dismissedRef.current));
    } catch {
      // notifications are optional: keep whatever we had
    }
  }, []);

  // Reload when the visitor logs in/out, every POLL_MS while the tab is visible, and when it regains focus.
  useEffect(() => {
    if (checking) return undefined;
    load();
    const timer = setInterval(() => document.visibilityState === 'visible' && load(), POLL_MS);
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

  // Swiping a notification away hides it for this visitor (it isn't deleted for anyone else).
  const deleteNotification = (n) => {
    dismissedRef.current.add(n._id);
    saveDismissed(dismissedRef.current);
    setFeed((f) => withoutDismissed(f, dismissedRef.current));
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
              <>
                <p className="muted small notif-hint">Swipe left or right to delete</p>
                <ul className="notif-list">
                  {feed.items.map((n) => (
                    <SwipeToDelete key={n._id} onDelete={() => deleteNotification(n)}>
                      <button type="button" className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => openNotification(n)}>
                        {n.image && <img src={n.image} alt="" draggable={false} />}
                        <div>
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <span className="muted small">{formatDate(n.createdAt)}</span>
                        </div>
                      </button>
                    </SwipeToDelete>
                  ))}
                </ul>
              </>
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
