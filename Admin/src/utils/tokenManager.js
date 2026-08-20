export const checkTokenExpiry = () => {
  const token = localStorage.getItem('adminToken');
  const loginTime = localStorage.getItem('loginTime');
  
  if (!token || !loginTime) {
    return false;
  }
  
  const currentTime = Date.now();
  const elapsed = currentTime - parseInt(loginTime);
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  return elapsed < twentyFourHours;
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('loginTime');
  window.location.href = '/login';
};
