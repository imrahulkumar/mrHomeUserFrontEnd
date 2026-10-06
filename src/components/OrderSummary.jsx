import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/format';

export default function OrderSummary({ children }) {
  const { subtotal, gst, shipping, total, count } = useCart();
  const { settings } = useStore();
  const remaining = settings.freeShippingThreshold - subtotal;

  return (
    <aside className="summary card">
      <h3>Order summary</h3>
      <div className="summary-row"><span>Items ({count})</span><span>{formatPrice(subtotal)}</span></div>
      <div className="summary-row"><span>GST ({settings.gstRate}%)</span><span>{formatPrice(gst)}</span></div>
      <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
      {shipping > 0 && remaining > 0 && (
        <p className="muted small">Add {formatPrice(remaining)} more for free shipping.</p>
      )}
      <div className="summary-row summary-total"><span>Total</span><span>{formatPrice(total)}</span></div>
      {children}
    </aside>
  );
}
