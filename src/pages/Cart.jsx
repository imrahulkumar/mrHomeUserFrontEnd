import { Link, useNavigate } from 'react-router-dom';
import OrderSummary from '../components/OrderSummary';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { items, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container empty">
        <h2>Your cart is empty</h2>
        <p className="muted">Discover something beautiful.</p>
        <Link to="/" className="btn btn-primary">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Shopping cart</h2>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item card">
              <ProductImage product={item} size="sm" />
              <div className="cart-item-info">
                <Link to={`/product/${item.id}`} className="product-name">{item.name}</Link>
                <p className="product-material">{item.material}</p>
                <p className="price">{formatPrice(item.price)}</p>
              </div>
              <div className="qty">
                <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div className="cart-item-total">
                <strong>{formatPrice(item.price * item.qty)}</strong>
                <button className="link-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <OrderSummary>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}
