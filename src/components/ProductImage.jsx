const PALETTES = [
  ['#f6e7c1', '#d4a94f'],
  ['#f3dfe3', '#c98a96'],
  ['#e6eef6', '#8fa9c4'],
  ['#e9f1e6', '#93b48a'],
  ['#f7e3cf', '#d08c4f'],
  ['#ece4f5', '#a28bc4'],
  ['#e1eef2', '#6fa3b5'],
];

// Pick a stable placeholder gradient per product.
const paletteFor = (key = '') => PALETTES[[...key].reduce((h, ch) => h + ch.charCodeAt(0), 0) % PALETTES.length];

export default function ProductImage({ product, size = 'md', index = 0 }) {
  const src = product.images?.[index];
  if (src) return <img className={`product-img product-img-${size}`} src={src} alt={product.name} loading="lazy" />;

  const [from, to] = paletteFor(product.subCategory?.slug || product.slug || product.name);
  const icon = product.icon || product.subCategory?.icon || product.category?.icon || '💎';
  return (
    <div className={`product-img product-img-${size} placeholder`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <span>{icon}</span>
    </div>
  );
}
