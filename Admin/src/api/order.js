import API_BASE_URL from "./config";

export const removeOrderItem = async (orderId, itemId) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/remove-item`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  });
  if (!response.ok) throw new Error('Failed to remove item');
  return await response.json();
};

export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/admin/all`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};


// Get order statistics for dashboard cards
export const getOrderStats = async (startDate = '', endDate = '') => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `${API_BASE_URL}/orders/admin/stats${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order statistics');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status, invoiceUrl, packageSlipUrl, courierName, trackingId, trackingLink, cancelRemarks, codReturnRemarks, chargedWeight, courierCharge, codCharge) => {
  try {
    const body = { status };
    if (invoiceUrl) body.invoiceUrl = invoiceUrl;
    if (packageSlipUrl) body.packageSlipUrl = packageSlipUrl;
    if (courierName) body.courierName = courierName;
    if (trackingId) body.trackingId = trackingId;
    if (trackingLink) body.trackingLink = trackingLink;
    if (cancelRemarks !== undefined) body.cancelRemarks = cancelRemarks;
    if (codReturnRemarks !== undefined) body.codReturnRemarks = codReturnRemarks;
    if (chargedWeight) body.chargedWeight = parseFloat(chargedWeight);
    if (courierCharge) body.courierCharge = parseFloat(courierCharge);
    if (codCharge) body.codCharge = parseFloat(codCharge);

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (url) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/file`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteOrderFiles = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/order-files`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete order files');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Add these functions to your existing order.js file

// Get Sales Report
export const getSalesReport = async (startDate, endDate) => {
  try {
    let url = `${API_BASE_URL}/orders/reports/sales`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales report');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get Sales Report Summary
export const getSalesReportSummary = async (startDate, endDate) => {
  try {
    let url = `${API_BASE_URL}/orders/reports/sales/summary`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales report summary');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};


// Get Shipping Report
export const getShippingReport = async (startDate, endDate) => {
  try {
    let url = `${API_BASE_URL}/orders/reports/shipping`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error fetching shipping report:', error);
    throw error;
  }
};

// Get Shipping Report Summary
export const getShippingReportSummary = async (startDate, endDate) => {
  try {
    let url = `${API_BASE_URL}/orders/reports/shipping/summary`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error fetching shipping report summary:', error);
    throw error;
  }
};

export const pushToShiprocket = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/webhook/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to push to Shiprocket');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get Product Report
export const getProductReport = async (startDate, endDate) => {
  try {
    let url = `${API_BASE_URL}/orders/reports/products`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error fetching product report:', error);
    throw error;
  }
};
