import axiosInstance from './axiosInstance';

export const getQuickStats = async () => {
  const response = await axiosInstance.get('/overview/quick-stats');
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await axiosInstance.get('/overview/recent-activity');
  return response.data;
};

export const getTopPerformers = async () => {
  const response = await axiosInstance.get('/overview/top-performers');
  return response.data;
};
