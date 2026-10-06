import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import ProductImage from './ProductImage';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-media">
        <ProductImage product={product} />
        {discount > 0 && <span className="tag tag-sale">-{discount}%</span>}
        {outOfStock && <span className="tag tag-muted">Sold out</span>}
      </Link>
      <div className="product-card-body">
        <p className="product-material">{product.material}</p>
        <Link to={`/product/${product.slug}`} className="product-name">{product.name}</Link>
        <div className="product-meta">
          <span>
            <span className="price">{formatPrice(product.price)}</span>
            {discount > 0 && <span className="mrp">{formatPrice(product.mrp)}</span>}
          </span>
          {product.rating > 0 && <span className="rating">★ {product.rating}</span>}
        </div>
        <button className="btn btn-primary btn-block" onClick={handleAdd} disabled={outOfStock}>
          {outOfStock ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
