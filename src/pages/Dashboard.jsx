import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getDepartments, getProducts } from '../services/api';

export default function Dashboard() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getProducts().then((data) => setFeatured([...data].sort((a, b) => b.rating - a.rating).slice(0, 8)));
  }, []);

  return (
    <div className="container">
      <section className="hero">
        <h1>Timeless jewellery & handcrafted décor</h1>
        <p>Certified gold, diamonds and artisan home pieces. Free shipping on orders above ₹10,000.</p>
      </section>

      <h2>Shop by department</h2>
      <div className="dept-grid">
        {getDepartments().map((d) => (
          <div key={d.slug} className="dept-card card">
            <Link to={`/shop/${d.slug}`} className="dept-card-title">
              <span className="dept-icon">{d.icon}</span>
              <div>
                <h3>{d.name}</h3>
                <p className="muted">{d.tagline}</p>
              </div>
            </Link>
            <div className="dept-subs">
              {d.categories.map((c) => (
                <Link key={c.slug} to={`/shop/${d.slug}?type=${c.slug}`} className="chip">
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2>Top rated</h2>
      <div className="product-grid">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
