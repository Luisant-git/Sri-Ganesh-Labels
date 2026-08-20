import API_BASE_URL from './config';

export const sendLowStockAlert = async (phoneNumber, productDetails) => {
  const response = await fetch(`${API_BASE_URL}/whatsapp/low-stock-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, productDetails }),
  });
  if (!response.ok) throw new Error('Failed to send low stock alert');
  return response.json();
};
