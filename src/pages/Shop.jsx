import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import * as api from '../api';
import FilterSidebar, { PRICE_RANGES } from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import VideoGallery from '../components/VideoGallery';

const PAGE_SIZE = 24;
const splitParam = (value) => (value ? value.split(',') : []);

export default function Shop() {
  const { category: slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [categoryError, setCategoryError] = useState('');
  const [result, setResult] = useState({ items: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');

  // Filters live in the URL so a filtered view can be bookmarked or shared.
  const filters = {
    types: splitParam(searchParams.get('type')),
    materials: splitParam(searchParams.get('material')),
    price: searchParams.get('price') ?? '',
    rating: searchParams.get('rating') ?? '',
  };
  const sort = searchParams.get('sort') ?? 'featured';
  const page = Number(searchParams.get('page')) || 1;

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    const keyMap = { types: 'type', materials: 'material' };
    Object.entries(changes).forEach(([key, value]) => {
      const param = keyMap[key] ?? key;
      const str = Array.isArray(value) ? value.join(',') : value;
      if (str) next.set(param, str);
      else next.delete(param);
    });
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next, { replace: true });
  };
  const clearFilters = () => updateParams({ types: [], materials: [], price: '', rating: '' });

  // Category info, sub-categories and filter facets.
  useEffect(() => {
    setCategory(null);
    setCategoryError('');
    setFiltersOpen(false);
    setSearch(new URLSearchParams(window.location.search).get('q') ?? '');
    api.getCategory(slug).then(setCategory).catch((err) => setCategoryError(err.message));
  }, [slug]);

  // Products, re-fetched whenever the URL filters change.
  useEffect(() => {
    let active = true;
    const range = PRICE_RANGES.find((r) => r.key === searchParams.get('price'));
    setLoading(true);
    api
      .getProducts({
        category: slug,
        sub: searchParams.get('type'),
        material: searchParams.get('material'),
        minPrice: range?.min,
        maxPrice: range?.max,
        minRating: searchParams.get('rating'),
        q: searchParams.get('q'),
        sort: searchParams.get('sort'),
        page: searchParams.get('page'),
        limit: PAGE_SIZE,
      })
      .then((data) => active && setResult(data))
      .catch(() => active && setResult({ items: [], total: 0, pages: 0 }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, searchParams]);

  // Debounce the search box into the URL.
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (searchParams.get('q') ?? '')) updateParams({ q: search });
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  if (categoryError) {
    return (
      <div className="container empty">
        <h2>Category not found</h2>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    );
  }
  if (!category) return <div className="boot-state"><span className="spinner" /></div>;

  const activeChips = [
    ...filters.types.map((t) => ({
      key: `t-${t}`,
      label: category.subCategories.find((s) => s.slug === t)?.name ?? t,
      remove: () => updateParams({ types: filters.types.filter((v) => v !== t) }),
    })),
    ...filters.materials.map((m) => ({
      key: `m-${m}`,
      label: m,
      remove: () => updateParams({ materials: filters.materials.filter((v) => v !== m) }),
    })),
    ...(filters.price
      ? [{ key: 'price', label: PRICE_RANGES.find((r) => r.key === filters.price)?.label, remove: () => updateParams({ price: '' }) }]
      : []),
    ...(filters.rating ? [{ key: 'rating', label: `★ ${filters.rating}+`, remove: () => updateParams({ rating: '' }) }] : []),
  ];

  return (
    <div className="container">
      <section
        className={`dept-banner ${category.image ? 'dept-banner-image' : ''}`}
        style={category.image ? { backgroundImage: `linear-gradient(90deg, rgba(255,253,249,.95), rgba(255,253,249,.6)), url(${category.image})` } : undefined}
      >
        <h1>{category.icon} {category.name}</h1>
        {category.tagline && <p>{category.tagline}</p>}
      </section>

      <div className="shop-layout">
        <FilterSidebar
          category={category}
          filters={filters}
          onChange={updateParams}
          onClear={clearFilters}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
        {filtersOpen && <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />}

        <div className="shop-results">
          <div className="toolbar">
            <p className="muted result-count">{loading ? 'Loading…' : `${result.total} item${result.total === 1 ? '' : 's'}`}</p>
            <div className="toolbar-controls">
              <button className="btn btn-outline filters-toggle" onClick={() => setFiltersOpen(true)}>
                ⚙ Filters{activeChips.length > 0 && ` (${activeChips.length})`}
              </button>
              <input type="search" placeholder={`Search ${category.name.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
              <select value={sort} onChange={(e) => updateParams({ sort: e.target.value === 'featured' ? '' : e.target.value })}>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="chips">
              {activeChips.map((chip) => (
                <button key={chip.key} className="chip" onClick={chip.remove}>
                  {chip.label} <span aria-hidden>✕</span>
                </button>
              ))}
              <button className="link-btn" onClick={clearFilters}>Clear all</button>
            </div>
          )}

          {!loading && result.items.length === 0 ? (
            <div className="empty">
              <p className="muted">No items match these filters.</p>
              {activeChips.length > 0 && <button className="btn btn-outline" onClick={clearFilters}>Clear filters</button>}
            </div>
          ) : (
            <div className={`product-grid ${loading ? 'is-loading' : ''}`}>
              {result.items.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {result.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>← Previous</button>
              <span className="muted">Page {page} of {result.pages}</span>
              <button className="btn btn-outline" disabled={page >= result.pages} onClick={() => updateParams({ page: String(page + 1) })}>Next →</button>
            </div>
          )}
        </div>
      </div>

      <VideoGallery title={`${category.name} videos`} videos={category.videos} />
    </div>
  );
}
