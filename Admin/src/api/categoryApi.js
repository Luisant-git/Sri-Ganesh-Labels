import API_BASE_URL from "./config";

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  console.log('Auth token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.warn('No admin token found in localStorage');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create category");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch category");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const headers = getAuthHeaders();
    console.log('Update headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to update category' }));
      throw new Error(error.message || "Failed to update category");
    }

    return await response.json();
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete category");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
