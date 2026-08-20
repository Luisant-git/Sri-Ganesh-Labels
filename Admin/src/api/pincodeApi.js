import API_BASE_URL from "./config";

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getPincodes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pincodes");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createPincode = async (pincodeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(pincodeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create pincode");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getPincode = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pincode");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updatePincode = async (id, pincodeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(pincodeData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to update pincode' }));
      throw new Error(error.message || "Failed to update pincode");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deletePincode = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pincodes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete pincode");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};