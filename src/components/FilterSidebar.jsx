export const PRICE_RANGES = [
  { key: 'u5k', label: 'Under ₹5,000', min: 0, max: 5000 },
  { key: '5k-25k', label: '₹5,000 – ₹25,000', min: 5000, max: 25000 },
  { key: '25k-1l', label: '₹25,000 – ₹1,00,000', min: 25000, max: 100000 },
  { key: 'o1l', label: 'Above ₹1,00,000', min: 100000, max: Infinity },
];

export const RATINGS = [4.5, 4, 3];

function CheckboxGroup({ title, options, selected, onToggle }) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      {options.map((o) => (
        <label key={o.value} className="filter-option">
          <input type="checkbox" checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} />
          <span>{o.label}</span>
          {o.count !== undefined && <span className="filter-count">{o.count}</span>}
        </label>
      ))}
    </fieldset>
  );
}

function RadioGroup({ title, name, options, selected, onSelect }) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      {options.map((o) => (
        <label key={o.value} className="filter-option">
          <input type="radio" name={name} checked={selected === o.value} onChange={() => onSelect(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

/**
 * Controlled filter panel. `filters` = { types: [], materials: [], price: '', rating: '' }.
 */
export default function FilterSidebar({ department, products, filters, onChange, onClear, open, onClose }) {
  const toggle = (key, value) => {
    const list = filters[key];
    onChange({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const typeOptions = department.categories.map((c) => ({
    value: c.slug,
    label: `${c.icon} ${c.name}`,
    count: products.filter((p) => p.category === c.slug).length,
  }));

  const materialOptions = [...new Set(products.map((p) => p.material))].sort().map((m) => ({
    value: m,
    label: m,
    count: products.filter((p) => p.material === m).length,
  }));

  const activeCount = filters.types.length + filters.materials.length + (filters.price ? 1 : 0) + (filters.rating ? 1 : 0);

  return (
    <aside className={`filters card ${open ? 'open' : ''}`}>
      <div className="filters-header">
        <h3>Filters</h3>
        {activeCount > 0 && <button className="link-btn" onClick={onClear}>Clear all ({activeCount})</button>}
        <button className="filters-close" onClick={onClose} aria-label="Close filters">✕</button>
      </div>

      <CheckboxGroup title="Type" options={typeOptions} selected={filters.types} onToggle={(v) => toggle('types', v)} />
      <CheckboxGroup title="Material" options={materialOptions} selected={filters.materials} onToggle={(v) => toggle('materials', v)} />
      <RadioGroup
        title="Price"
        name="price"
        options={[{ value: '', label: 'Any price' }, ...PRICE_RANGES.map((r) => ({ value: r.key, label: r.label }))]}
        selected={filters.price}
        onSelect={(v) => onChange({ price: v })}
      />
      <RadioGroup
        title="Customer rating"
        name="rating"
        options={[{ value: '', label: 'Any rating' }, ...RATINGS.map((r) => ({ value: String(r), label: `★ ${r} & above` }))]}
        selected={filters.rating}
        onSelect={(v) => onChange({ rating: v })}
      />

      <button className="btn btn-primary btn-block filters-apply" onClick={onClose}>Show results</button>
    </aside>
  );
}
