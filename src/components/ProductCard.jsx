import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import ProductImage from './ProductImage';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`}>
        <ProductImage product={product} />
      </Link>
      <div className="product-card-body">
        <p className="product-material">{product.material}</p>
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <div className="product-meta">
          <span className="price">{formatPrice(product.price)}</span>
          <span className="rating">★ {product.rating}</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={handleAdd}>
          {added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
