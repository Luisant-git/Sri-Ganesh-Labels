import API_BASE_URL from './config';

const getToken = () => localStorage.getItem('adminToken');

export const createCoupon = async (couponData) => {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(couponData),
  });
  if (!response.ok) throw new Error('Failed to create coupon');
  return response.json();
};

export const getCoupons = async () => {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch coupons');
  return response.json();
};

export const getCoupon = async (id) => {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch coupon');
  return response.json();
};

export const updateCoupon = async (id, couponData) => {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(couponData),
  });
  if (!response.ok) throw new Error('Failed to update coupon');
  return response.json();
};

export const deleteCoupon = async (id) => {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete coupon');
  return response.json();
};

export const searchCustomersByPhone = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/customer/search/phone?phone=${phone}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) throw new Error('Failed to search customers');
  return response.json();
};
