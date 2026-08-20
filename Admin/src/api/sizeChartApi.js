import API_BASE_URL from './config';

export const getSizeCharts = async () => {
    const response = await fetch(`${API_BASE_URL}/size-chart`);
    if (!response.ok) throw new Error('Failed to fetch size charts');
    return response.json();
};

export const createSizeChart = async (data) => {
    const response = await fetch(`${API_BASE_URL}/size-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create size chart');
    return response.json();
};

export const updateSizeChart = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/size-chart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update size chart');
    return response.json();
};

export const deleteSizeChart = async (id) => {
    const response = await fetch(`${API_BASE_URL}/size-chart/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete size chart');
    return response.json();
};
