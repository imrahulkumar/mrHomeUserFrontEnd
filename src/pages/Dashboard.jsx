import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import ProductCard from '../components/ProductCard';
import VideoGallery from '../components/VideoGallery';
import { useStore } from '../context/StoreContext';

export default function Dashboard() {
  const { settings, categories } = useStore();
  const [featured, setFeatured] = useState([]);
  const [videos, setVideos] = useState([]);
  const { hero } = settings;

  useEffect(() => {
    // Featured products, falling back to top-rated when none are marked featured.
    api
      .getProducts({ featured: true, limit: 8 })
      .then(({ items }) => (items.length ? items : api.getProducts({ sort: 'rating', limit: 8 }).then((r) => r.items)))
      .then(setFeatured)
      .catch(() => setFeatured([]));
    api.getVideos({ home: true }).then(setVideos).catch(() => setVideos([]));
  }, []);

  return (
    <div className="container">
      <section
        className={`hero ${hero.image ? 'hero-image' : ''}`}
        style={hero.image ? { backgroundImage: `linear-gradient(90deg, rgba(20,15,10,.75), rgba(20,15,10,.2)), url(${hero.image})` } : undefined}
      >
        <h1>{hero.title}</h1>
        {hero.subtitle && <p>{hero.subtitle}</p>}
        {hero.ctaText && (
          <Link to={hero.ctaLink || (categories[0] ? `/shop/${categories[0].slug}` : '/')} className="btn btn-primary hero-cta">
            {hero.ctaText}
          </Link>
        )}
      </section>

      {categories.length > 0 && (
        <section className="section">
          <h2>Shop by category</h2>
          <div className="dept-grid">
            {categories.map((c) => (
              <div key={c._id} className="dept-card card">
                <Link to={`/shop/${c.slug}`} className="dept-card-title">
                  {c.image ? <img src={c.image} alt="" className="dept-icon" /> : <span className="dept-icon">{c.icon}</span>}
                  <div>
                    <h3>{c.name}</h3>
                    {c.tagline && <p className="muted">{c.tagline}</p>}
                  </div>
                </Link>
                {c.subCategories.length > 0 && (
                  <div className="dept-subs">
                    {c.subCategories.map((s) => (
                      <Link key={s._id} to={`/shop/${c.slug}?type=${s.slug}`} className="chip">
                        {s.icon} {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="section">
          <h2>Featured</h2>
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <VideoGallery title="Watch our collection" videos={videos} />
    </div>
  );
}
