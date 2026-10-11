import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import VideoGallery from '../components/VideoGallery';
import { useStore } from '../context/StoreContext';

// Used when settings were saved before the admin could reorder the home page.
const DEFAULT_SECTIONS = [
  { id: 'hero', enabled: true },
  { id: 'categories', enabled: true, title: 'Shop by category' },
  { id: 'featured', enabled: true, title: 'Featured' },
  { id: 'videos', enabled: true, title: 'Watch our collection' },
];

export default function Dashboard() {
  const { settings, categories } = useStore();
  const [featured, setFeatured] = useState([]);
  const [videos, setVideos] = useState([]);
  const { hero } = settings;
  const sections = (settings.homeSections?.length ? settings.homeSections : DEFAULT_SECTIONS).filter((s) => s.enabled);
  const shows = (id) => sections.some((s) => s.id === id);

  useEffect(() => {
    // Featured products, falling back to top-rated when none are marked featured.
    if (shows('featured')) {
      api
        .getProducts({ featured: true, limit: 8 })
        .then(({ items }) => (items.length ? items : api.getProducts({ sort: 'rating', limit: 8 }).then((r) => r.items)))
        .then(setFeatured)
        .catch(() => setFeatured([]));
    }
    if (shows('videos')) api.getVideos({ home: true }).then(setVideos).catch(() => setVideos([]));
  }, []);

  const render = {
    hero: () => (
      <section
        className={`hero hero-${hero.align ?? 'left'} hero-${hero.height ?? 'medium'} ${hero.image ? 'hero-image' : ''}`}
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
    ),
    categories: (title) =>
      categories.length > 0 && (
        <section className="section">
          {title && <h2>{title}</h2>}
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
      ),
    featured: (title) =>
      featured.length > 0 && (
        <section className="section">
          {title && <h2>{title}</h2>}
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      ),
    videos: (title) => <VideoGallery title={title} videos={videos} />,
  };

  return (
    <div className="container">
      {sections.map((s) => {
        const content = render[s.id]?.(s.title);
        return content ? <Reveal key={s.id}>{content}</Reveal> : null;
      })}
    </div>
  );
}
