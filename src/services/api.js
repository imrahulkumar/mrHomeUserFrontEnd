/*
 * Mock API backed by localStorage so the app works without a server.
 * Swap these functions for real fetch() calls to your backend when it is ready,
 * keeping the same signatures so the rest of the app does not change.
 */
import { products, departments } from '../data/products';

const USERS_KEY = 'mj_users';
const ORDERS_KEY = 'mj_orders';
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export async function signup({ name, email, password }) {
  await delay();
  const users = read(USERS_KEY);
  if (users.some((u) => u.email === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  // Demo only: a real backend must hash passwords server-side.
  const user = { id: Date.now(), name, email: email.toLowerCase(), password };
  write(USERS_KEY, [...users, user]);
  return { id: user.id, name: user.name, email: user.email };
}

export async function login({ email, password }) {
  await delay();
  const user = read(USERS_KEY).find((u) => u.email === email.toLowerCase() && u.password === password);
  if (!user) throw new Error('Invalid email or password.');
  return { id: user.id, name: user.name, email: user.email };
}

export async function getProducts(department) {
  await delay(150);
  return department ? products.filter((p) => p.department === department) : products;
}

export async function getProduct(id) {
  await delay(150);
  return products.find((p) => p.id === Number(id)) ?? null;
}

export const getDepartments = () => departments;
export const getDepartment = (slug) => departments.find((d) => d.slug === slug);
export const getCategory = (slug) =>
  departments.flatMap((d) => d.categories).find((c) => c.slug === slug);

// Simulates a payment gateway. Replace with Razorpay / Stripe via your backend.
// Test hint: any card number ending in 0000 is declined.
export async function processPayment({ amount, method, details }) {
  await delay(1500);
  if (method === 'card' && details.cardNumber.replace(/\s/g, '').endsWith('0000')) {
    throw new Error('Payment declined by bank. Please try another card.');
  }
  return { transactionId: 'TXN' + Math.random().toString(36).slice(2, 10).toUpperCase(), amount };
}

export async function placeOrder(order) {
  await delay(200);
  const saved = { ...order, id: 'ORD' + Date.now(), createdAt: new Date().toISOString() };
  write(ORDERS_KEY, [...read(ORDERS_KEY), saved]);
  return saved;
}
