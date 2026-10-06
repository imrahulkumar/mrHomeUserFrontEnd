import { http } from './client';

// Auth
export const register = (data) => http.post('/auth/register', data);
export const login = (data) => http.post('/auth/login', data);
export const getMe = () => http.get('/auth/me');

// Store content
export const getSettings = () => http.get('/settings');
export const getCategories = () => http.get('/categories');
export const getCategory = (slug) => http.get(`/categories/${slug}`);
export const getProducts = (params) => http.get('/products', params);
export const getProduct = (slug) => http.get(`/products/${slug}`);
export const getVideos = (params) => http.get('/videos', params);

// Orders
export const createOrder = (data) => http.post('/orders', data);
export const getMyOrders = () => http.get('/orders/mine');
