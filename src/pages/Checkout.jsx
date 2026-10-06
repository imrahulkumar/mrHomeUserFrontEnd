import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OrderSummary from '../components/OrderSummary';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { placeOrder, processPayment } from '../services/api';
import { formatPrice } from '../utils/format';

const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function validatePayment(method, p) {
  if (method === 'card') {
    if (p.cardNumber.replace(/\s/g, '').length !== 16) return 'Enter a valid 16-digit card number.';
    if (!p.cardName.trim()) return 'Enter the name on the card.';
    const [mm, yy] = p.expiry.split('/').map(Number);
    if (!mm || mm > 12 || !yy) return 'Enter a valid expiry (MM/YY).';
    const now = new Date();
    const expired = 2000 + yy < now.getFullYear() || (2000 + yy === now.getFullYear() && mm < now.getMonth() + 1);
    if (expired) return 'This card has expired.';
    if (!/^\d{3,4}$/.test(p.cvv)) return 'Enter a valid CVV.';
  }
  if (method === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(p.upiId)) return 'Enter a valid UPI ID (e.g. name@okbank).';
  return '';
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const orderPlaced = useRef(false);

  const [address, setAddress] = useState({ fullName: user.name, phone: '', line1: '', city: '', state: '', pincode: '' });
  const [method, setMethod] = useState('card');
  const [payment, setPayment] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '', upiId: '' });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  if (items.length === 0 && !orderPlaced.current) return <Navigate to="/cart" replace />;

  const onAddress = (e) => setAddress({ ...address, [e.target.name]: e.target.value });
  const onPayment = (e) => {
    const { name, value } = e.target;
    const formatted =
      name === 'cardNumber' ? formatCardNumber(value)
      : name === 'expiry' ? formatExpiry(value)
      : name === 'cvv' ? value.replace(/\D/g, '').slice(0, 4)
      : value;
    setPayment({ ...payment, [name]: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(address.phone)) return setError('Enter a valid 10-digit phone number.');
    if (!/^\d{6}$/.test(address.pincode)) return setError('Enter a valid 6-digit pincode.');
    const paymentError = validatePayment(method, payment);
    if (paymentError) return setError(paymentError);

    setProcessing(true);
    try {
      const txn = method === 'cod' ? { transactionId: null } : await processPayment({ amount: total, method, details: payment });
      const order = await placeOrder({
        userId: user.id,
        items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
        total,
        address,
        paymentMethod: method,
        transactionId: txn.transactionId,
      });
      orderPlaced.current = true;
      clearCart();
      navigate('/order-success', { replace: true, state: { order } });
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="container">
      <h2>Checkout</h2>
      <form className="cart-layout" onSubmit={handleSubmit}>
        <div className="checkout-forms">
          <section className="card form-section">
            <h3>1. Shipping address</h3>
            <div className="form-grid">
              <label>Full name<input name="fullName" value={address.fullName} onChange={onAddress} required /></label>
              <label>Phone<input name="phone" value={address.phone} onChange={onAddress} inputMode="numeric" maxLength={10} required /></label>
              <label className="span-2">Address<input name="line1" value={address.line1} onChange={onAddress} required /></label>
              <label>City<input name="city" value={address.city} onChange={onAddress} required /></label>
              <label>State<input name="state" value={address.state} onChange={onAddress} required /></label>
              <label>Pincode<input name="pincode" value={address.pincode} onChange={onAddress} inputMode="numeric" maxLength={6} required /></label>
            </div>
          </section>

          <section className="card form-section">
            <h3>2. Payment method</h3>
            <div className="pay-methods">
              {[
                ['card', '💳 Credit / Debit card'],
                ['upi', '📱 UPI'],
                ['cod', '💵 Cash on delivery'],
              ].map(([value, label]) => (
                <label key={value} className={`pay-option ${method === value ? 'active' : ''}`}>
                  <input type="radio" name="method" value={value} checked={method === value} onChange={() => setMethod(value)} />
                  {label}
                </label>
              ))}
            </div>

            {method === 'card' && (
              <div className="form-grid">
                <label className="span-2">Card number<input name="cardNumber" value={payment.cardNumber} onChange={onPayment} placeholder="1234 5678 9012 3456" inputMode="numeric" /></label>
                <label className="span-2">Name on card<input name="cardName" value={payment.cardName} onChange={onPayment} /></label>
                <label>Expiry<input name="expiry" value={payment.expiry} onChange={onPayment} placeholder="MM/YY" inputMode="numeric" /></label>
                <label>CVV<input name="cvv" type="password" value={payment.cvv} onChange={onPayment} inputMode="numeric" /></label>
              </div>
            )}
            {method === 'upi' && (
              <div className="form-grid">
                <label className="span-2">UPI ID<input name="upiId" value={payment.upiId} onChange={onPayment} placeholder="yourname@okbank" /></label>
              </div>
            )}
            {method === 'cod' && <p className="muted">Pay in cash when your order is delivered.</p>}
            <p className="muted small">🔒 Demo payment — no real money is charged.</p>
          </section>
        </div>

        <OrderSummary>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={processing}>
            {processing ? 'Processing payment…' : method === 'cod' ? 'Place order' : `Pay ${formatPrice(total)}`}
          </button>
        </OrderSummary>
      </form>
    </div>
  );
}
