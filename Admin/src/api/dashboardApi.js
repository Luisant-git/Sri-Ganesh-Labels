import axiosInstance from './axiosInstance';

export const getDashboardStats = async (year) => {
  const url = year ? `/dashboard/stats?year=${year}` : '/dashboard/stats';
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getSalesAnalytics = async (year) => {
  const url = year ? `/dashboard/sales-analytics?year=${year}` : '/dashboard/sales-analytics';
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getSalesComparison = async (type = 'yearly', year, month) => {
  let url = `/dashboard/sales-comparison?type=${type}`;
  if (year) url += `&year=${year}`;
  if (month !== undefined && month !== null && month !== '') url += `&month=${month}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getTopProducts = async () => {
  const response = await axiosInstance.get('/dashboard/top-products');
  return response.data;
};

export const getCurrentOffers = async () => {
  const response = await axiosInstance.get('/dashboard/offers');
  return response.data;
};

export const getRecentOrders = async () => {
  const response = await axiosInstance.get('/dashboard/recent-orders');
  return response.data;
};
