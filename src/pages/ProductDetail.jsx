import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../api';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import VideoGallery from '../components/VideoGallery';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(undefined);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setProduct(undefined);
    setQty(1);
    setImageIndex(0);
    api.getProduct(slug).then(setProduct).catch(() => setProduct(null));
  }, [slug]);

  if (product === undefined) return <div className="boot-state"><span className="spinner" /></div>;
  if (product === null)
    return (
      <div className="container empty">
        <h2>Product not found</h2>
        <Link to="/" className="btn btn-primary">Back to shop</Link>
      </div>
    );

  const outOfStock = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="container">
      <div className="detail">
        <div className="gallery">
          <ProductImage product={product} size="lg" index={imageIndex} />
          {product.images.length > 1 && (
            <div className="gallery-thumbs">
              {product.images.map((src, i) => (
                <button key={src + i} className={i === imageIndex ? 'active' : ''} onClick={() => setImageIndex(i)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <nav className="breadcrumb muted">
            <Link to={`/shop/${product.category.slug}`}>{product.category.name}</Link>
            {product.subCategory && (
              <>
                {' / '}
                <Link to={`/shop/${product.category.slug}?type=${product.subCategory.slug}`}>{product.subCategory.name}</Link>
              </>
            )}
          </nav>
          <h1>{product.name}</h1>
          <p className="product-material">
            {product.material}
            {product.rating > 0 && ` · ★ ${product.rating}`}
          </p>
          <p className="detail-price">
            {formatPrice(product.price)}
            {discount > 0 && (
              <>
                <span className="mrp">{formatPrice(product.mrp)}</span>
                <span className="tag tag-sale inline">-{discount}%</span>
              </>
            )}
          </p>
          <p className="stock-line">
            {outOfStock ? <span className="text-danger">Out of stock</span> : product.stock <= 3 ? <span className="text-warning">Only {product.stock} left</span> : <span className="text-success">In stock</span>}
          </p>
          {product.description && <p className="description">{product.description}</p>}

          {!outOfStock && (
            <>
              <div className="qty-row">
                <span>Quantity</span>
                <div className="qty">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(maxQty, qty + 1))}>+</button>
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
            </>
          )}
        </div>
      </div>

      <VideoGallery title="Videos" videos={product.videos} />

      {product.related.length > 0 && (
        <section className="section">
          <h2>You may also like</h2>
          <div className="product-grid">
            {product.related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
