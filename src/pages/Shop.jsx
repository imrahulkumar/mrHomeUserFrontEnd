import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import FilterSidebar, { PRICE_RANGES } from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { getDepartment, getProducts } from '../services/api';

const splitParam = (value) => (value ? value.split(',') : []);

export default function Shop() {
  const { department: slug } = useParams();
  const department = getDepartment(slug);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters live in the URL so a filtered view can be bookmarked or shared.
  const filters = {
    types: splitParam(searchParams.get('type')),
    materials: splitParam(searchParams.get('material')),
    price: searchParams.get('price') ?? '',
    rating: searchParams.get('rating') ?? '',
  };
  const search = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    const keyMap = { types: 'type', materials: 'material' };
    Object.entries(changes).forEach(([key, value]) => {
      const param = keyMap[key] ?? key;
      const str = Array.isArray(value) ? value.join(',') : value;
      if (str) next.set(param, str);
      else next.delete(param);
    });
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => updateParams({ types: [], materials: [], price: '', rating: '' });

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProducts(slug).then((data) => {
      if (active) {
        setProducts(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.key === filters.price);
    const minRating = Number(filters.rating) || 0;

    const list = products.filter(
      (p) =>
        (filters.types.length === 0 || filters.types.includes(p.category)) &&
        (filters.materials.length === 0 || filters.materials.includes(p.material)) &&
        (!range || (p.price >= range.min && p.price < range.max)) &&
        p.rating >= minRating &&
        (!q || p.name.toLowerCase().includes(q) || p.material.toLowerCase().includes(q)),
    );
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, searchParams]); // filters, search and sort are all derived from searchParams

  if (!department) return <Navigate to="/" replace />;

  const activeChips = [
    ...filters.types.map((t) => ({
      label: department.categories.find((c) => c.slug === t)?.name ?? t,
      remove: () => updateParams({ types: filters.types.filter((v) => v !== t) }),
    })),
    ...filters.materials.map((m) => ({
      label: m,
      remove: () => updateParams({ materials: filters.materials.filter((v) => v !== m) }),
    })),
    ...(filters.price
      ? [{ label: PRICE_RANGES.find((r) => r.key === filters.price)?.label, remove: () => updateParams({ price: '' }) }]
      : []),
    ...(filters.rating ? [{ label: `★ ${filters.rating}+`, remove: () => updateParams({ rating: '' }) }] : []),
  ];

  return (
    <div className="container">
      <section className="dept-banner">
        <h1>{department.icon} {department.name}</h1>
        <p>{department.tagline}</p>
      </section>

      <div className="shop-layout">
        <FilterSidebar
          department={department}
          products={products}
          filters={filters}
          onChange={updateParams}
          onClear={clearFilters}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
        {filtersOpen && <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />}

        <div className="shop-results">
          <div className="toolbar">
            <p className="muted result-count">{loading ? 'Loading…' : `${visible.length} item${visible.length === 1 ? '' : 's'}`}</p>
            <div className="toolbar-controls">
              <button className="btn btn-outline filters-toggle" onClick={() => setFiltersOpen(true)}>
                ⚙ Filters{activeChips.length > 0 && ` (${activeChips.length})`}
              </button>
              <input
                type="search"
                placeholder={`Search ${department.name.toLowerCase()}…`}
                value={search}
                onChange={(e) => updateParams({ q: e.target.value })}
              />
              <select value={sort} onChange={(e) => updateParams({ sort: e.target.value === 'featured' ? '' : e.target.value })}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="chips">
              {activeChips.map((chip) => (
                <button key={chip.label} className="chip" onClick={chip.remove}>
                  {chip.label} <span aria-hidden>✕</span>
                </button>
              ))}
              <button className="link-btn" onClick={clearFilters}>Clear all</button>
            </div>
          )}

          {!loading && visible.length === 0 ? (
            <div className="empty">
              <p className="muted">No items match these filters.</p>
              <button className="btn btn-outline" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="product-grid">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
