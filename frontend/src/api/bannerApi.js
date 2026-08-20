import API_BASE_URL from './config';

const get = async (url) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch banners');
  }
  return data;
};

export const getBanners = () => get('/banners');

export const getActiveBanners = () => get('/banners/active');