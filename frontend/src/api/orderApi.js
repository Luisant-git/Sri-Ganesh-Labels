import API_BASE_URL from './config';
import { getToken } from './authApi';

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const post = async (url, body) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  return data;
};

export const syncServerCart = async (items) => {
  const token = getToken();
  if (!token || !Array.isArray(items) || items.length === 0) return;
  for (const item of items) {
    await post('/cart/add', {
      id: item.productId,
      name: item.name,
      price: String(item.price),
      imageUrl: item.image || '',
      quantity: item.quantity,
    });
  }
};

export const clearServerCart = async () => {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_BASE_URL}/cart`, { method: 'DELETE', headers: authHeaders() });
};

export const createOrder = async (payload) => {
  const token = getToken();
  if (!token) throw new Error('Please login to place your order');
  return post('/orders', payload);
};

export const getMyOrders = async () => {
  const token = getToken();
  if (!token) throw new Error('Please login to view your orders');
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Could not load orders');
  }
  return Array.isArray(data) ? data : [];
};

export const getPublicOrder = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/orders/public/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error('Order not found');
  }
  return data;
};