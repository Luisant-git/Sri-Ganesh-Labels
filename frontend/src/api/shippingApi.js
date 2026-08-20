import API_BASE_URL from './config';

export const getShippingRules = async () => {
  const response = await fetch(`${API_BASE_URL}/shipping`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ([]));
  if (!response.ok) {
    throw new Error('Failed to fetch shipping rules');
  }
  return Array.isArray(data) ? data : [];
};

export const normalizeState = (state) =>
  (state || '').trim().toUpperCase().replace(/\s+/g, '_');