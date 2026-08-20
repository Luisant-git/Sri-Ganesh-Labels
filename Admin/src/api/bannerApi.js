import API_BASE_URL from "./config";

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const createBanner = async (bannerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bannerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create banner");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getBanners = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch banners");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getActiveBanners = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/active`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch active banners");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getBannerById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch banner");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateBanner = async (id, bannerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(bannerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update banner");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteBanner = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete banner");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
