import axiosInstance from './axiosInstance';

// Get all customers with pagination, search, and filters
export const getAllCustomers = async (page = 1, limit = 10, search = '', statusFilter = 'all', startDate = '', endDate = '') => {
  const params = { 
    page, 
    limit, 
    ...(search && { search }),
    ...(statusFilter !== 'all' && { statusFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  };
  const response = await axiosInstance.get('/customer', { params });
  return response.data;
};


export const getAllCustomersForExport = async () => {
  const params = { 
    page: 1, 
    limit: 10000 // Large limit to get all customers
  };
  const response = await axiosInstance.get('/customer', { params });
  return response.data;
};

// Get customer stats for dashboard cards with date filter
export const getCustomerStats = async (startDate = '', endDate = '') => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await axiosInstance.get('/customer/stats', { params });
  return response.data;
};


