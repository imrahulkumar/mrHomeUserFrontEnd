import { Link, Navigate, useLocation } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export default function OrderSuccess() {
  const order = useLocation().state?.order;
  if (!order) return <Navigate to="/" replace />;

  return (
    <div className="container empty">
      <div className="success-icon">✓</div>
      <h2>Thank you! Your order is confirmed.</h2>
      <div className="card success-card">
        <div className="summary-row"><span>Order ID</span><strong>{order.id}</strong></div>
        {order.transactionId && <div className="summary-row"><span>Transaction ID</span><span>{order.transactionId}</span></div>}
        <div className="summary-row"><span>Payment</span><span>{order.paymentMethod.toUpperCase()}</span></div>
        <div className="summary-row"><span>Amount</span><strong>{formatPrice(order.total)}</strong></div>
        <div className="summary-row"><span>Deliver to</span><span>{order.address.fullName}, {order.address.city} - {order.address.pincode}</span></div>
      </div>
      <Link to="/" className="btn btn-primary">Continue shopping</Link>
    </div>
  );
}
