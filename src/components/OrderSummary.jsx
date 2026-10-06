import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function OrderSummary({ children }) {
  const { subtotal, gst, shipping, total, count } = useCart();
  return (
    <aside className="summary card">
      <h3>Order summary</h3>
      <div className="summary-row"><span>Items ({count})</span><span>{formatPrice(subtotal)}</span></div>
      <div className="summary-row"><span>GST (3%)</span><span>{formatPrice(gst)}</span></div>
      <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
      <div className="summary-row summary-total"><span>Total</span><span>{formatPrice(total)}</span></div>
      {children}
    </aside>
  );
}
