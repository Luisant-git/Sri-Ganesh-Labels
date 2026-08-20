import API_BASE_URL from './config';

export const getStorefrontProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products/storefront`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch products');
  }
  return Array.isArray(data) ? data : [];
};

export const getStorefrontProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/products/storefront/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch product');
  }
  return data;
};

export const searchStorefrontProducts = async (query) => {
  const response = await fetch(
    `${API_BASE_URL}/products/search/query?q=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to search products');
  }
  return Array.isArray(data) ? data : [];
};