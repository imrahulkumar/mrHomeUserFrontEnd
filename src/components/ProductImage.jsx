import { getCategory } from '../services/api';

const gradients = {
  rings: 'linear-gradient(135deg, #f6e7c1, #d4a94f)',
  necklaces: 'linear-gradient(135deg, #f3dfe3, #c98a96)',
  earrings: 'linear-gradient(135deg, #e6eef6, #8fa9c4)',
  bracelets: 'linear-gradient(135deg, #e9f1e6, #93b48a)',
  bangles: 'linear-gradient(135deg, #f7e3cf, #d08c4f)',
  pendants: 'linear-gradient(135deg, #ece4f5, #a28bc4)',
  idols: 'linear-gradient(135deg, #fbe9d0, #e0a35a)',
  vases: 'linear-gradient(135deg, #e1eef2, #6fa3b5)',
  'wall-decor': 'linear-gradient(135deg, #f4e2ea, #b9708c)',
  'candle-holders': 'linear-gradient(135deg, #fdf1d6, #e8b84a)',
  showpieces: 'linear-gradient(135deg, #e3efe9, #5e9c86)',
};

export default function ProductImage({ product, size = 'md' }) {
  if (product.image) {
    return <img className={`product-img product-img-${size}`} src={product.image} alt={product.name} />;
  }
  const icon = getCategory(product.category)?.icon ?? '💎';
  return (
    <div className={`product-img product-img-${size} placeholder`} style={{ background: gradients[product.category] }}>
      <span>{icon}</span>
    </div>
  );
}
