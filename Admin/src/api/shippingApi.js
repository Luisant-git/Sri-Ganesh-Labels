const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4062'

export const getShippingRules = async () => {
  const response = await fetch(`${API_BASE_URL}/shipping`)
  if (!response.ok) throw new Error('Failed to fetch shipping rules')
  return response.json()
}

export const createShippingRule = async (data) => {
  const response = await fetch(`${API_BASE_URL}/shipping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create shipping rule')
  return response.json()
}

export const updateShippingRule = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/shipping/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to update shipping rule')
  return response.json()
}

export const deleteShippingRule = async (id) => {
  const response = await fetch(`${API_BASE_URL}/shipping/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete shipping rule')
  return response.json()
}