import API_BASE_URL from './config';

export const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch categories');
  }
  return data;
};