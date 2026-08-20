import API_BASE_URL from "./config";

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getSubCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subcategories");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createSubCategory = async (subcategoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(subcategoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create subcategory");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getSubCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subcategory");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateSubCategory = async (id, subcategoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(subcategoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update subcategory");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteSubCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete subcategory");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
