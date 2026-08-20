import API_BASE_URL from './config';

const TOKEN_KEY = 'sgl_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return {};
  }
};

const post = async (url, body) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  return data;
};

export const userRegister = async (mobile, password, name) =>
  post('/auth/user/register', { mobile, password, name });

export const userLogin = async (mobile, password) =>
  post('/auth/user/login', { mobile, password });

export const userCheck = async (mobile) =>
  post('/auth/user/check', { mobile });