import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { formatDate, formatPrice } from '../utils/format';

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMyOrders().then(setOrders).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="container empty"><p className="alert alert-error">{error}</p></div>;
  if (!orders) return <div className="boot-state"><span className="spinner" /></div>;
  if (orders.length === 0) {
    return (
      <div className="container empty">
        <h2>No orders yet</h2>
        <Link to="/" className="btn btn-primary">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>My orders</h2>
      <div className="orders">
        {orders.map((o) => (
          <article key={o._id} className="card order-card">
            <header className="order-card-header">
              <div>
                <strong>{o.orderNumber}</strong>
                <p className="muted small">{formatDate(o.createdAt)}</p>
              </div>
              <span className={`status status-${o.status}`}>{o.status}</span>
            </header>
            <ul className="order-items">
              {o.items.map((i) => (
                <li key={i.product}>
                  <span>{i.name} × {i.qty}</span>
                  <span>{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <footer className="order-card-footer">
              <span className="muted small">{o.payment.method.toUpperCase()} · {o.payment.status}</span>
              <strong>{formatPrice(o.total)}</strong>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
