export const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
  
    try {
      const response = await fetch('http://localhost:5001/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };