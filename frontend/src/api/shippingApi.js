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

export const normalizeState = (state) => {
  const raw = (state || '').trim();
  if (!raw) return '';

  const compact = raw
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const aliases = {
    'ANDAMAN AND NICOBAR ISLANDS': 'ANDAMAN_NICOBAR',
    'DADRA AND NAGAR HAVELI AND DAMAN AND DIU': 'DADRA_NAGAR_HAVELI',
  };

  if (aliases[compact]) return aliases[compact];

  return compact
    .replace(/\s+AND\s+/gi, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_ISLANDS$/g, '')
    .replace(/_CITY$/g, '');
};

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