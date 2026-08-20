import API_BASE_URL from "./config";

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getBrands = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch brands");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getBrand = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch brand");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createBrand = async (brandData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(brandData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create brand");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateBrand = async (id, brandData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(brandData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update brand");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteBrand = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete brand");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
