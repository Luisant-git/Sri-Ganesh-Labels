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
  (state || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .replace(/_AND_/g, '_')
    .replace(/^AND_/, '')
    .replace(/_AND$/, '');

export const calculateShipping = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/shipping/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error('Failed to calculate shipping');
  }
  return data;
};