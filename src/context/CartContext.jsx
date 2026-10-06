import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useStore } from './StoreContext';

const CartContext = createContext(null);
const CART_KEY = 'store_cart';

// Only the fields the cart needs; the server re-prices everything at checkout.
const toCartItem = (p) => ({
  _id: p._id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  material: p.material,
  images: p.images?.slice(0, 1) ?? [],
  icon: p.subCategory?.icon || p.category?.icon || '',
  stock: p.stock,
});

export function CartProvider({ children }) {
  const { settings } = useStore();
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) return prev.map((i) => (i._id === product._id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...toCartItem(product), qty }];
    });

  const updateQty = (id, qty) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i._id !== id) : prev.map((i) => (i._id === id ? { ...i, qty } : i))));

  const removeFromCart = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const gst = Math.round((subtotal * settings.gstRate) / 100);
    const shipping = subtotal === 0 || subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    return { subtotal, gst, shipping, total: subtotal + gst + shipping, count: items.reduce((n, i) => n + i.qty, 0) };
  }, [items, settings]);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, ...totals }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
