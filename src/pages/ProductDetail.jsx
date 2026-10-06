import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { getCategory, getDepartment, getProduct } from '../services/api';
import { formatPrice } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(undefined);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getProduct(id).then(setProduct);
  }, [id]);

  if (product === undefined) return <div className="container"><p className="muted">Loading…</p></div>;
  if (product === null)
    return (
      <div className="container empty">
        <h2>Product not found</h2>
        <Link to="/" className="btn btn-primary">Back to shop</Link>
      </div>
    );

  return (
    <div className="container detail">
      <ProductImage product={product} size="lg" />
      <div className="detail-info">
        <nav className="breadcrumb muted">
          <Link to={`/shop/${product.department}`}>{getDepartment(product.department)?.name}</Link>
          {' / '}
          <Link to={`/shop/${product.department}?type=${product.category}`}>{getCategory(product.category)?.name}</Link>
        </nav>
        <h1>{product.name}</h1>
        <p className="product-material">{product.material} · ★ {product.rating}</p>
        <p className="detail-price">{formatPrice(product.price)}</p>
        <p>{product.description}</p>

        <div className="qty-row">
          <span>Quantity</span>
          <div className="qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
        </div>

        <div className="detail-actions">
          <button className="btn btn-outline" onClick={() => addToCart(product, qty)}>Add to cart</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              addToCart(product, qty);
              navigate('/cart');
            }}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
