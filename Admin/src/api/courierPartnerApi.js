import API_BASE_URL from './config';

export const getCourierPartners = async () => {
  const res = await fetch(`${API_BASE_URL}/courier-partners`);
  if (!res.ok) throw new Error('Failed to fetch courier partners');
  return res.json();
};

export const createCourierPartner = async (data) => {
  const res = await fetch(`${API_BASE_URL}/courier-partners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create courier partner');
  return res.json();
};

export const updateCourierPartner = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/courier-partners/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update courier partner');
  return res.json();
};

export const deleteCourierPartner = async (id) => {
  const res = await fetch(`${API_BASE_URL}/courier-partners/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete courier partner');
  return res.json();
};
